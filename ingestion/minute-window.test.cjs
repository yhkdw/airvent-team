'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {MinuteAggregator}=require('./minute-window.cjs');
const BASE=Date.parse('2026-11-14T04:42:00.000Z');
function reading(pm, id='5EBHA10001') {
 return {device_id:id,pm1_0:pm,pm2_5:pm,pm10:pm,co2:500,temperature:25,humidity:42,voc:1};
}
test('12 five-second MQTT packets produce exactly one minute average row',()=>{
 const agg=new MinuteAggregator();
 for(let i=0;i<12;i++)assert.equal(agg.add(reading(10+i),BASE+i*5000),true);
 assert.deepEqual(agg.ready(BASE+59000),[]);
 const rows=agg.ready(BASE+60000);
 assert.equal(rows.length,1);
 assert.equal(rows[0].sample_count,12);
 assert.equal(rows[0].row.pm2_5,15.5);
 assert.equal(rows[0].row.co2,500);
 assert.equal(agg.ready(BASE+60000).length,1,'pending until DB confirms success');
 assert.equal(agg.confirm(rows[0].device_id,rows[0].minute_start),true);
 assert.deepEqual(agg.ready(BASE+120000),[]);
 assert.equal(agg.add(reading(99),BASE+5000),false,'do not re-add confirmed minute');
});
test('device windows remain independent and invalid samples cannot add zeros',()=>{
 const agg=new MinuteAggregator();
 assert.equal(agg.add(reading(1),BASE),true);
 assert.equal(agg.add({...reading(0),pm2_5:null},BASE+5000),false);
 assert.equal(agg.add(reading(4,'OTHER_0001'),BASE+5000),true);
 const rows=agg.ready(BASE+60000);
 assert.equal(rows.length,2);
 assert.equal(rows.find(x=>x.device_id==='5EBHA10001').row.pm2_5,1);
});
test('no storage until a full minute boundary',()=>{
 const agg=new MinuteAggregator();
 agg.add(reading(10),BASE+59000);
 assert.equal(agg.ready(BASE+59999).length,0);
 assert.equal(agg.ready(BASE+60000).length,1);
});
