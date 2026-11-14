import { getDeviceId, json, withPartnerAuth } from '../../lib/airvent-partner.js';
import tokenAuth from '../../airvent-realtime/token.cjs';

export default async function handler(req,res){
 return withPartnerAuth(req,res,async()=>{
  const deviceId=getDeviceId(req,res);
  if(!deviceId)return;
  try{
   const issued=tokenAuth.issue({key:process.env.AIRVENT_STREAM_SIGNING_KEY,deviceId,ttl:60});
   const url=new URL('https://mqtt.airvent.ai/v1/air-quality/stream');
   url.searchParams.set('device_id',deviceId);
   url.searchParams.set('token',issued.token);
   return json(res,200,{success:true,device_id:deviceId,expires_at:new Date(issued.expiresAt*1000).toISOString(),url:url.toString(),reconnect_after_seconds:600});
  }catch(error){
   console.error('[AIRVENT] Stream signing key missing or invalid');
   return json(res,503,{success:false,error:'stream_not_configured'});
  }
 });
}
