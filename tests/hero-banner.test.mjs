import test from 'node:test';
import assert from 'node:assert/strict';
import {mappedFrame} from '../hero-banner.js';
test('banner matches raw decoded frames to saved sync steps',()=>{
  assert.equal(mappedFrame([10,12,14,16],9),0);
  assert.equal(mappedFrame([10,12,14,16],14),2);
  assert.equal(mappedFrame([10,12,14,16],99),3);
  assert.equal(mappedFrame([10,10,11,12],10),0);
  assert.equal(mappedFrame([10,14,18],13),1);
});
