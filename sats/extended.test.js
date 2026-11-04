import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTest,mark} from './engine.js';
import {LONG_PASSAGES} from './extended-reading.js';
import {gradeExtended,reviewableIndexes,needsHumanReview} from './extended-marking.js';
import {missedSkills} from './remediation.js';

test('extended reading contains genuinely longer original passages and increasing demand',()=>{
 assert.equal(LONG_PASSAGES.length,6);
 for(const p of LONG_PASSAGES){
  assert.ok(p.text.trim().split(/\s+/).length>=275,p.id);
  assert.equal(p.questions.length,6);
  assert.deepEqual(p.questions.map(q=>q.marks),[1,1,2,2,3,3]);
  assert.ok(p.questions.filter(q=>q.type==='written').length===4,p.id);
  for(const q of p.questions.filter(q=>q.type==='written')){
   assert.equal(q.criteria.length,q.marks);
   assert.ok(q.example.length>50,q.prompt);
  }
 }
 const one=buildTest('reading-extended','reading-a');
 const two=buildTest('reading-extended','reading-b',one.questions.map(q=>q.id));
 assert.equal(one.questions.length,12);
 assert.equal(new Set(one.questions.map(q=>q.passageTitle)).size,2);
 assert.equal(two.questions.filter(q=>one.questions.some(x=>x.id===q.id)).length,0);
 assert.ok(needsHumanReview(one));
});

test('extended reasoning has nine distinct mathematically correct 2-3 mark questions',()=>{
 for(let i=0;i<90;i++){
  const paper=buildTest('reasoning-extended','reasoning-'+i);
  assert.equal(paper.questions.length,9);
  assert.equal(new Set(paper.questions.map(q=>q.id)).size,9);
  assert.ok(new Set(paper.questions.map(q=>q.skill)).size>=7);
  paper.questions.forEach(q=>{
   assert.equal(q.type,'multi-number');
   assert.ok([2,3].includes(q.marks),q.id);
   assert.equal(q.criteria.length,q.marks-1,q.id);
   assert.ok(Number.isFinite(Number(q.answer)),q.id);
   assert.ok(Number(q.answer)>=0,q.id);
   assert.ok(mark(q,q.answer),q.id);
  });
 }
});

test('rubric marking requires every response reviewed and gives partial credit fairly',()=>{
 const reading=buildTest('reading-extended','marks-r');
 const answers=reading.questions.map(q=>q.type==='choice'?q.answer:q.example);
 const ids=reviewableIndexes(reading);
 assert.equal(ids.length,8);
 assert.deepEqual(gradeExtended(reading,answers).missing,ids);
 const manual={},reviewed={};
 for(const i of ids){const q=reading.questions[i];manual[i]=q.criteria.map(()=>false);reviewed[i]=true;}
 const zero=gradeExtended(reading,answers,[],manual,reviewed);
 assert.ok(zero.ready);
 assert.equal(zero.score,4);
 const first=ids[0];manual[first][0]=true;
 const partial=gradeExtended(reading,answers,[],manual,reviewed);
 assert.equal(partial.score,5);
 answers[first]='';
 assert.equal(gradeExtended(reading,answers,[],manual,reviewed).score,4);
});

test('a numerically incorrect answer can still receive method marks if working is shown',()=>{
 const paper=buildTest('reasoning-extended','math-method');
 const answers=paper.questions.map(q=>String(q.answer));
 const work=paper.questions.map(q=>q.workingExample);
 const manual={},reviewed={};
 for(let i=0;i<paper.questions.length;i++){const q=paper.questions[i];manual[i]=q.criteria.map(()=>true);reviewed[i]=true;}
 const full=gradeExtended(paper,answers,work,manual,reviewed);
 assert.equal(full.score,full.total);
 answers[0]='not a number';
 const partial=gradeExtended(paper,answers,work,manual,reviewed);
 assert.equal(partial.score,partial.total-1);
 work[0]='';
 const withoutMethod=gradeExtended(paper,answers,work,manual,reviewed);
 assert.equal(withoutMethod.score,partial.score-paper.questions[0].criteria.length);
 const missed=missedSkills({test:paper,answers,marksByQuestion:withoutMethod.marksByQuestion});
 assert.ok(missed.some(s=>s.skill===paper.questions[0].skill&&s.wrong>0));
});

test('invalid checklists, unconfirmed marking and full-score inflation are rejected',()=>{
 const paper=buildTest('reading-extended','reject');
 const answers=paper.questions.map(q=>q.answer||q.example);
 const ids=reviewableIndexes(paper),manual={},reviewed={};
 for(const i of ids){manual[i]=paper.questions[i].criteria.map(()=>true);reviewed[i]=true;}
 assert.equal(gradeExtended(paper,answers,[],manual,reviewed).ready,true);
 reviewed[ids[0]]=false;
 assert.equal(gradeExtended(paper,answers,[],manual,reviewed).ready,false);
 reviewed[ids[0]]=true;manual[ids[0]]=[true,'yes'];
 assert.equal(gradeExtended(paper,answers,[],manual,reviewed).ready,false);
});
