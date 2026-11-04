import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSnapshotEntries} from '../snapshot-config.js';

test('snapshot order follows JSON text rather than numeric object enumeration',()=>{
  const source='{"00":{"duration":3},"03":{"duration":2},"12":{"duration":4},"2":{"duration":1}}';
  const entries=parseSnapshotEntries(source);
  assert.deepEqual(entries.map(([id])=>id),['00','03','12','2']);
  assert.deepEqual(entries.map(([,entry])=>entry.duration),[3,2,4,1]);
});
test('nested keys and escaped text do not become snapshot IDs',()=>{
  const source=JSON.stringify({"00":{nested:{"9":1},joints:['text with "quotes", braces {} and :']}});
  assert.deepEqual(parseSnapshotEntries(source).map(([id])=>id),['00']);
});
test('duplicate IDs and invalid config shapes fail clearly',()=>{
  assert.throws(()=>parseSnapshotEntries('{"00":{},"00":{}}'),/Duplicate snapshot/);
  for(const source of ['null','[]','1'])assert.throws(()=>parseSnapshotEntries(source),/must be an object/);
});
