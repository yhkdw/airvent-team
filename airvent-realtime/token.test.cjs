'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {issue,verify}=require('./token.cjs');
const key='0123456789abcdef'.repeat(4);
test('token valid for allowlisted device',()=>{
 const t=issue({key,deviceId:'5EBHA10001'});
 assert.equal(verify({key,deviceId:'5EBHA10001',token:t.token}),true);
 assert.equal(verify({key,deviceId:'0000000000',token:t.token}),false);
});
test('changed signature and invalid secret fail',()=>{
 const t=issue({key,deviceId:'5EBHA10001'});
 assert.equal(verify({key,deviceId:'5EBHA10001',token:t.token+'x'}),false);
 assert.throws(()=>issue({key:'weak',deviceId:'5EBHA10001'}));
});
