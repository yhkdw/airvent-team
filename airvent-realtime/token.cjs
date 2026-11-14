'use strict';
const {createHmac,timingSafeEqual}=require('node:crypto');
const ID=/^[A-Za-z0-9_-]{1,64}$/, KEY=/^[0-9a-fA-F]{64}$/;
function checkKey(key){if(typeof key!=='string'||!KEY.test(key))throw Error('AIRVENT_STREAM_SIGNING_KEY must be 64 hex chars');}
function signature(payload,key){return createHmac('sha256',Buffer.from(key,'hex')).update(payload).digest('base64url');}
function issue({key,deviceId,ttl=60}){
 checkKey(key);if(!ID.test(deviceId)||!Number.isInteger(ttl)||ttl<1||ttl>120)throw Error('Invalid stream request');
 const exp=Math.floor(Date.now()/1000)+ttl;
 const body=Buffer.from(JSON.stringify({v:1,aud:'airvent-sse',device_id:deviceId,exp})).toString('base64url');
 return {token:body+'.'+signature(body,key),expiresAt:exp};
}
function verify({key,deviceId,token}){
 checkKey(key);
 if(!ID.test(deviceId)||typeof token!=='string'||token.length>1024)return false;
 const parts=token.split('.');
 if(parts.length!==2||!/^[\w-]+$/.test(parts[0])||!/^[\w-]+$/.test(parts[1]))return false;
 const expected=Buffer.from(signature(parts[0],key));const actual=Buffer.from(parts[1]);
 if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return false;
 try{const p=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));const now=Math.floor(Date.now()/1000);
 return p.v===1&&p.aud==='airvent-sse'&&p.device_id===deviceId&&Number.isSafeInteger(p.exp)&&p.exp>=now&&p.exp<=now+120;
 }catch{return false;}
}
module.exports={issue,verify,checkKey};
