import test from 'node:test';
import assert from 'node:assert/strict';
import {skillGraph,questionFor,assess,recommendation,createSession,nextQuestion,beginPractice,submitAnswer} from '../src/engine/diagnostic.js';
const [equivalent,denominator,addition]=skillGraph.map(s=>s.id);
const at='2026-11-04T12:00:00.000Z';
function answer(s,correct=true){const a=correct?s.question.answer:s.question.kind==='denominator'?1:{n:99,d:97};submitAnswer(s,a,at);if(!s.done)submitAnswer(s,a,at);nextQuestion(s);}
test('graph is ordered, acyclic, and routes to the earliest missing prerequisite',()=>{
 const seen=new Set();for(const s of skillGraph){for(const p of s.prerequisites)assert.ok(seen.has(p));seen.add(s.id);}
 assert.equal(recommendation({}).skillId,equivalent);
 assert.equal(recommendation({[equivalent]:{secure:true}}).skillId,denominator);
});
test('each question has a valid exact answer; equivalent sums and common multiples accepted',()=>{
 for(const s of skillGraph)for(let i=0;i<8;i++){const q=questionFor(s.id,i);assert.equal(assess(q,q.answer).correct,true);}
 const q=questionFor(addition);assert.ok(assess(q,{n:q.answer.n*2,d:q.answer.d*2}).correct);
 assert.ok(assess(questionFor(denominator),12).correct);
 assert.equal(assess(questionFor(denominator),0).correct,false);
 assert.equal(assess(questionFor(equivalent),{n:1,d:2}).correct,false);
 assert.equal(assess(q,{n:1,d:0}).correct,false);
});
test('recognises denominator misconceptions without labelling unknown arithmetic errors',()=>{
 assert.equal(assess(questionFor(equivalent),{n:1,d:4}).misconception,'denominator-only');
 assert.equal(assess(questionFor(addition),{n:2,d:6}).misconception,'add-denominators');
 assert.equal(assess(questionFor(denominator),5).misconception,null);
 assert.equal(assess(questionFor(denominator),2).misconception,'one-denominator');
 const slip=assess(questionFor(addition),{n:5,d:4});assert.equal(slip.misconception,null);assert.match(slip.feedback,/may be an arithmetic slip/);
});
test('one wrong question is tentative; confirmation requires a different question',()=>{
 const s=createSession({},at);nextQuestion(s);
 submitAnswer(s,{n:1,d:4},at);assert.equal(s.done,false);submitAnswer(s,{n:1,d:4},at);
 assert.equal(s.progress[equivalent].diagnosis.status,'needs-confirmation');
 const first=s.question.id;nextQuestion(s);assert.notEqual(s.question.id,first);
 submitAnswer(s,{n:1,d:s.question.target},at);submitAnswer(s,{n:1,d:s.question.target},at);
 assert.equal(s.progress[equivalent].diagnosis.status,'likely');
});
test('a corrected second try is supported and a successful follow-up does not confirm a misconception',()=>{
 const s=createSession({},at);nextQuestion(s);submitAnswer(s,{n:1,d:4},at);submitAnswer(s,s.question.answer,at);
 assert.equal(s.history[0].independent,false);nextQuestion(s);answer(s);
 assert.equal(s.progress[equivalent].diagnosis.status,'needs-confirmation');
});
test('diagnose → teach → practise → test → summary; only independent checks establish security',()=>{
 const s=createSession({},at);nextQuestion(s);while(s.phase==='diagnostic')answer(s);
 assert.equal(s.phase,'teach');assert.equal(s.target,equivalent);assert.equal(s.progress[equivalent].secure,false);
 beginPractice(s);while(s.phase==='practise')answer(s);assert.equal(s.phase,'test');
 assert.equal(s.progress[equivalent].secure,false);answer(s);assert.equal(s.progress[equivalent].secure,false);answer(s);
 assert.equal(s.phase,'summary');assert.equal(s.progress[equivalent].secure,true);
 assert.equal(s.progress[equivalent].reviewAt,'2026-11-07T12:00:00.000Z');
 assert.equal(recommendation(s.progress,at).skillId,denominator);
});
test('hints and failed checks prevent independent security and retain remediation target',()=>{
 const s=createSession({},at);s.target=equivalent;beginPractice(s);while(s.phase==='practise')answer(s);
 s.hint=true;answer(s);answer(s);assert.equal(s.progress[equivalent].secure,false);
 assert.equal(s.history.filter(h=>h.phase==='test')[0].independent,false);
 assert.equal(recommendation(s.progress).skillId,equivalent);
});
test('due retention checks use new examples and regression reopens prerequisites',()=>{
 const p=Object.fromEntries(skillGraph.map(s=>[s.id,{secure:true,checkStreak:2,reviewAt:'2026-11-07T12:00:00.000Z'}]));
 assert.equal(createSession(p,at).phase,'diagnostic');
 p[equivalent].attempts=7;
 const s=createSession(p,'2026-11-08T12:00:00Z');assert.equal(s.phase,'revisit');nextQuestion(s);assert.notEqual(s.question.id,questionFor(equivalent).id);assert.notDeepEqual(s.question.answer,questionFor(equivalent).answer);answer(s,false);
 assert.equal(s.progress[equivalent].secure,false);assert.equal(p[equivalent].secure,true);
 assert.equal(recommendation(s.progress).skillId,equivalent);
});
test('duplicate submits cannot inflate progress and sessions do not mutate another learner',()=>{
 const p={};const a=createSession(p,at),b=createSession(p,at);nextQuestion(a);submitAnswer(a,a.question.answer,at);submitAnswer(a,a.question.answer,at);
 assert.equal(a.progress[equivalent].attempts,1);assert.deepEqual(b.progress,{});assert.deepEqual(p,{});
});
