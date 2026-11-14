'use strict';
// Independent MQTT -> SSE relay, runs only on Oracle; do not change the existing ingest bridge.
const http=require('node:http');
const mqtt=require('mqtt');
const {verify,checkKey}=require('./token.cjs');
const key=process.env.AIRVENT_STREAM_SIGNING_KEY;
checkKey(key);
// CORS allowlist is not authentication: every client still needs a signed token.
// Keep the existing partner origin; add first-party dashboard origins.
const origins=(process.env.AIRVENT_CORS_ORIGINS || [
 process.env.AIRVENT_CORS_ORIGIN || 'https://aero-fire.vercel.app',
 'https://airvent.ai','https://www.airvent.ai','https://airvent-team.vercel.app'
].join(',')).split(',').map(v=>v.trim()).filter(Boolean);
const allowedOrigins=new Set(origins);
const port=Number(process.env.AIRVENT_REALTIME_PORT||3108);
const ids=(process.env.AIRVENT_ALLOWED_DEVICE_IDS||'5EBHA10001').split(',').map(x=>x.trim()).filter(Boolean);
const allow=new Set(ids), clients=new Map(), last=new Map();
if(!ids.length||ids.some(x=>!/^[A-Za-z0-9_-]{1,64}$/.test(x))||!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid configuration');
if(!origins.length||origins.some(v=>!/^https:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(v)))throw Error('Invalid origins');
if(!process.env.MQTT_USERNAME||!process.env.MQTT_PASSWORD)throw Error('MQTT credentials missing');
const conn=mqtt.connect(process.env.MQTT_HOST||'mqtt://127.0.0.1:1883',{
 username:process.env.MQTT_USERNAME,password:process.env.MQTT_PASSWORD,
 clientId:'airvent-live-'+process.pid,reconnectPeriod:3000,connectTimeout:10000,clean:true,protocolVersion:4
});
let connected=false;
const val=x=>x==null||x===''?null:Number.isFinite(Number(x))?Number(x):null;
function send(res,type,body){
 if(res.destroyed||res.writableEnded)return;
 if(res.writableLength>65536){res.end();return;}
 res.write('event: '+type+'\ndata: '+JSON.stringify(body)+'\n\n');
}
conn.on('connect',()=>{
 connected=true;
 for(const id of allow)conn.subscribe('env/SML001/'+id+'/data',{qos:0},err=>{if(err)console.error('subscribe failed',id,err.message);else console.log('subscribed',id);});
 console.log('MQTT connected');
});
conn.on('reconnect',()=>{connected=false;});
conn.on('close',()=>{connected=false;});
conn.on('error',e=>console.error('MQTT error:',e.message));
conn.on('message',(topic,buffer)=>{
 const m=/^env\/SML001\/([A-Za-z0-9_-]{1,64})\/data$/.exec(topic);
 if(!m||!allow.has(m[1])||buffer.length>16384)return;
 let p;try{p=JSON.parse(buffer.toString('utf8'));}catch{return;}
 if(!p||typeof p!=='object'||Array.isArray(p)||(p.device_id!=null&&p.device_id!==m[1]))return;
 const received=new Date().toISOString();
 const data={device_id:m[1],vendor_id:'SML001',timestamp:received,received_at:received,timestamp_source:'relay_received_at',device_timestamp:p.timestamp??null,stale:false,
 pm1_0:val(p.pm1_0),pm2_5:val(p.pm2_5),pm10:val(p.pm10),co2:val(p.co2),temperature:val(p.temperature),humidity:val(p.humidity),voc:val(p.voc)};
 last.set(m[1],data);
 for(const client of clients.get(m[1])||[])send(client,'reading',data);
});
function reply(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));}
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://127.0.0.1');}catch{return reply(res,400,{error:'bad_url'});}
 if(req.method==='GET'&&url.pathname==='/healthz')return reply(res,200,{ok:true,mqtt_connected:connected,devices:ids.length});
 if(req.method!=='GET'||url.pathname!=='/v1/air-quality/stream')return reply(res,404,{error:'not_found'});
 const id=url.searchParams.get('device_id'), token=url.searchParams.get('token');
 if(!allow.has(id))return reply(res,404,{error:'device_not_available'});
 if(!token||!verify({key,deviceId:id,token}))return reply(res,401,{error:'invalid_token'});
 if(req.headers.origin&&!allowedOrigins.has(req.headers.origin))return reply(res,403,{error:'origin_not_allowed'});
 let count=0;for(const set of clients.values())count+=set.size;
 if(count>=50)return reply(res,503,{error:'capacity_reached'});
 res.writeHead(200,{
  'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-store, no-transform',
  'Connection':'keep-alive','X-Accel-Buffering':'no','X-Content-Type-Options':'nosniff','Vary':'Origin',
  ...(allowedOrigins.has(req.headers.origin)?{'Access-Control-Allow-Origin':req.headers.origin}:{})
 });
 res.write('retry: 3000\n\n');
 if(!clients.has(id))clients.set(id,new Set());
 const set=clients.get(id);set.add(res);
 send(res,'status',{mqtt_connected:connected,device_id:id});
 const newest=last.get(id);if(newest)send(res,'reading',{...newest,stale:Date.now()-Date.parse(newest.received_at)>300000});
 const pulse=setInterval(()=>{if(!res.writableEnded)res.write(': heartbeat\n\n');},15000);
 const limit=setTimeout(()=>res.end(),600000);
 let done=false;
 const cleanup=()=>{if(done)return;done=true;clearInterval(pulse);clearTimeout(limit);set.delete(res);if(!set.size)clients.delete(id);};
 // HTTP GET IncomingMessage can close as soon as headers are fully read;
 // keep the SSE client alive until its ServerResponse closes.
 res.on('close',cleanup);
});
server.listen(port,'127.0.0.1',()=>console.log('SSE relay listening on 127.0.0.1:'+port));
function shutdown(){server.close();conn.end(true);setTimeout(()=>process.exit(0),1000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
