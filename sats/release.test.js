import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const file=path=>readFileSync(resolve(root,path),'utf8');
test('both home pages use GitHub Pages-safe relative assets',()=>{
 for(const page of ['index.html','sats/index.html']){
   const html=file(page);
   for(const [,asset] of html.matchAll(/(?:src|href)=["'](\.[^"'#?]+)["']/g)){
     const resolved=resolve(root,dirname(page),asset);
     assert.ok(resolved.startsWith(root+'/'),asset);
     assert.ok(existsSync(resolved),page+': missing '+asset);
   }
 }
 assert.match(file('app.js'),/href="\.\/sats\/"/);
 assert.match(file('sats/index.html'),/src="\.\/app\.js"/);
});
test('all production JavaScript imports resolve without a bundler',()=>{
 const paths=['app.js','storage.js','rewards.js','catalog.js','fractions.js','adaptive.js','feedback.js',
   'sats/app.js','sats/content.js','sats/engine.js','sats/remediation.js','sats/lesson-ui.js',
   'sats/english-extra.js','sats/reading-extra.js','sats/reasoning-extra.js','sats/extended-reading.js',
   'sats/extended-maths.js','sats/extended-marking.js','sats/extended-review-ui.js'];
 for(const path of paths){
   const content=file(path);
   for(const [,spec] of content.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)){
     const resolved=resolve(root,dirname(path),spec);
     assert.ok(resolved.startsWith(root+'/'),path+' out-of-root import '+spec);
     assert.ok(existsSync(resolved),path+' missing '+spec);
   }
 }
});
test('SATs development does not hard-code a live API key or external service',()=>{
 const paths=['sats/app.js','sats/engine.js','sats/extended-marking.js','sats/remediation.js'];
 for(const path of paths){
  const source=file(path);
  assert.doesNotMatch(source,/\b(fetch\s*\(|XMLHttpRequest|https:\/\/api\.|OPENAI_API_KEY)\b/,path);
 }
});
