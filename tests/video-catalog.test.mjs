import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {discoverVideoCatalog,validateSync} from '../scripts/video-catalog.mjs';
test('source deletions remove entries even if generated previews and stale manifests remain',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'golf-catalog-'));
  try{
    for(const folder of ['videos/01','2d_detections/01','3d_results/after','previews/01'])fs.mkdirSync(path.join(root,'materials/data',folder),{recursive:true});
    for(const view of ['face-on','down-the-line']){
      fs.writeFileSync(path.join(root,`materials/data/videos/01/${view}.MP4`),'source');
      fs.writeFileSync(path.join(root,`materials/data/2d_detections/01/${view}.json`),JSON.stringify({pred:[[],[],[]]}));
      fs.writeFileSync(path.join(root,`materials/data/previews/01/${view}.mp4`),'cached');
    }
    fs.writeFileSync(path.join(root,'materials/data/3d_results/after/01.json'),JSON.stringify({reconstruction:[[],[],[]]}));
    fs.writeFileSync(path.join(root,'materials/data/videos.json'),JSON.stringify([{id:'deleted'}]));
    fs.writeFileSync(path.join(root,'materials/data/videos/01/sync.json'),JSON.stringify({meta:Object.fromEntries(['face-on','down-the-line'].map(v=>[v,{E1:0,E2:2}])),mapping:Object.fromEntries(['face-on','down-the-line'].map(v=>[v,[0,1,2]]))}));
    const options={probe:()=>({fps:30,frames:3})};
    assert.deepEqual(discoverVideoCatalog(root,options).map(c=>c.id),['01']);
    fs.unlinkSync(path.join(root,'materials/data/videos/01/down-the-line.MP4'));
    assert.deepEqual(discoverVideoCatalog(root,options),[]);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('sync validation preserves repeats and skips and rejects invalid mappings',()=>{
  const views=[{name:'a',frames:5},{name:'b',frames:8}];
  const sync={meta:{a:{E1:1,E2:3},b:{E1:2,E2:6}},mapping:{a:[0,1,1,2,3],b:[0,2,3,4,6]}};
  assert.equal(validateSync(sync,views),5);
  const invalid=structuredClone(sync);invalid.mapping.b[4]=8;
  assert.throws(()=>validateSync(invalid,views),/Invalid sync frame/);
  invalid.mapping.b=[0,2];assert.throws(()=>validateSync(invalid,views),/equal length/);
  invalid.mapping.b=[0,1,3,4,6];assert.throws(()=>validateSync(invalid,views),/not aligned/);
});
test('a repeated event frame uses the index shared by all views',()=>{
  const sync={meta:{a:{E1:1,E2:3},b:{E1:2,E2:4}},mapping:{a:[1,1,2,3],b:[1,2,3,4]}};
  assert.equal(validateSync(sync,[{name:'a',frames:4},{name:'b',frames:5}]),4);
});
