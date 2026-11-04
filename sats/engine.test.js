import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTest,mark,breakdown} from './engine.js';
import {MODULES,grammar,spellings,passages} from './content.js';

test('every SATs module creates unique, correctly marked questions',()=>{
 const lengths={daily:12,arithmetic:12,reasoning:10,fractions:10,gps:12,reading:8,spelling:10,'reading-extended':12,'reasoning-extended':9};
 for(const mode of MODULES.map(x=>x.id)){
   const testPaper=buildTest(mode,'year6-test-seed');
   assert.equal(testPaper.questions.length,lengths[mode],mode);
   assert.equal(new Set(testPaper.questions.map(q=>q.id)).size,testPaper.questions.length);
   for(const q of testPaper.questions){
     assert.ok(q.id&&q.skill&&q.section&&q.prompt&&q.explanation);
     if(q.type==='written'){
       assert.ok(q.criteria?.length===q.marks,q.id);
       assert.ok(q.example,q.id);
       assert.equal(mark(q,''),false);
     }else{
       assert.ok(mark(q,q.answer),q.id);
       assert.equal(mark(q,''),false);
     }
   }
 }
});
test('daily SATs papers change on every new seed and have balanced subjects',()=>{
 const a=buildTest('daily','kodjo-2026-11-04-1'),b=buildTest('daily','kodjo-2026-11-04-2');
 assert.notDeepEqual(a.questions.map(q=>q.id),b.questions.map(q=>q.id));
 assert.deepEqual(a.questions.reduce((s,q)=>(s[q.section]=(s[q.section]||0)+1,s),{}),{arithmetic:4,reasoning:3,gps:2,reading:2,spelling:1});
});
test('recent questions are avoided when adequate unused items remain',()=>{
 const first=buildTest('daily','day-one');
 const ids=first.questions.map(q=>q.id);
 const next=buildTest('daily','day-two',ids);
 assert.equal(next.questions.some(q=>ids.includes(q.id)),false);
});
test('marking accepts equivalent fractions and mixed numbers but rejects invalid inputs',()=>{
 const a={type:'fraction',answer:'3/2'};
 assert.equal(mark(a,'6/4'),true);assert.equal(mark(a,'1 1/2'),true);
 assert.equal(mark(a,'1/0'),false);assert.equal(mark(a,'1/2'),false);
 assert.equal(mark({type:'number',answer:1.25},'1.25'),true);
 assert.equal(mark({type:'number',answer:12},'12abc'),false);
 assert.equal(mark({type:'spelling',answer:'necessary'},' Necessary '),true);
 assert.equal(mark({type:'choice',answer:'correct'},'incorrect'),false);
});
test('maths questions remain sensible across many generated sessions',()=>{
 for(let i=0;i<100;i++){
   for(const mode of ['arithmetic','reasoning','fractions']){
     const testPaper=buildTest(mode,'math-validity-'+i);
     for(const q of testPaper.questions) {
       assert.ok(mark(q,q.answer),q.id);
       if(q.type==='number')assert.ok(Number.isFinite(q.answer),q.id);
       if(q.section==='reasoning')assert.ok(Number(q.answer)>=0,q.id);
     }
   }
 }
});
test('parent breakdown keeps individual skills separate',()=>{
 const t=buildTest('daily','summary');
 const ans=t.questions.map(q=>q.answer);
 const b=breakdown(t,ans);
 assert.ok(Object.values(b).every(x=>x.correct===x.total));
 ans[0]='not a valid answer';
 const wrong=breakdown(t,ans);
 assert.equal(Object.values(wrong).reduce((n,s)=>n+s.correct,0),t.questions.length-1);
});
test('English banks have diverse authored content',()=>{
 assert.ok(grammar.length>=25);
 assert.ok(spellings.length>=60);
 assert.ok(passages.length>=6);
 assert.ok(passages.every(p=>p.text.length>=700&&p.questions.length>=4));
});
