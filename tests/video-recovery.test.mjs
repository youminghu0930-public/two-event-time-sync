import test from 'node:test';
import assert from 'node:assert/strict';
import {unlockVideo,waitForDecoders} from '../video-recovery.js';
test('Play reloads a failed source and unlocks playback directly in the gesture',async()=>{
  const calls=[];
  const video={error:{},load(){calls.push('load');},play(){calls.push('play');return Promise.resolve();},pause(){calls.push('pause');}};
  const promise=unlockVideo(video,{isCurrent:()=>true,onReady:()=>calls.push('ready'),onFailure:()=>assert.fail()});
  assert.deepEqual(calls,['load','play']);
  await promise;assert.deepEqual(calls,['load','play','pause','ready']);
});
test('autoplay rejection and synchronous failure request the existing Play retry',async()=>{
  for(const play of [()=>Promise.reject(new Error('blocked')),()=>{throw new Error('blocked');}]){
    let failed=0;await unlockVideo({play},{isCurrent:()=>true,onFailure:()=>failed++});assert.equal(failed,1);
  }
});
test('stale play completion cannot update a replacement swing',async()=>{
  await unlockVideo({play:()=>Promise.resolve(),pause(){}},{isCurrent:()=>false,onReady:()=>assert.fail(),onFailure:()=>assert.fail()});
});
test('decoder wait completes, times out, or cancels without blocking 3D',async()=>{
  assert.equal(await waitForDecoders([{whenIdle:()=>Promise.resolve()}]),true);
  assert.equal(await waitForDecoders([{whenIdle:()=>new Promise(()=>{})}],{timeout:10}),false);
  const controller=new AbortController();
  const pending=waitForDecoders([{whenIdle:()=>new Promise(()=>{})}],{signal:controller.signal});controller.abort();
  assert.equal(await pending,false);
});

test('retry reloads a metadata-only stalled source even without a media error',async()=>{
  let reloads=0;
  await unlockVideo({readyState:1,load(){reloads++;},play:()=>Promise.resolve(),pause(){}},{isCurrent:()=>true,onReady(){},onFailure:()=>assert.fail()});
  assert.equal(reloads,1);
});
