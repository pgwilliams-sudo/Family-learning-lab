import test from 'node:test';
import assert from 'node:assert/strict';
import {questionPool, questionFor, selectQuestion, difficultyFor, RECENT_QUESTION_LIMIT} from '../src/engine/questions.js';
import {skillGraph, assess, createSession, nextQuestion, submitAnswer} from '../src/engine/diagnostic.js';
const id=skillGraph[0].id;
const options={random:()=>0,year:'Year 6'};
test('difficulty uses component mastery, never attempts, XP, level or age alone',()=>{
 for(const year of ['Year 6','Year 9']) {
   assert.equal(difficultyFor({mastery:25,attempts:999999,xp:999999},year),1);
   assert.equal(difficultyFor({mastery:40},year),2);
   assert.equal(difficultyFor({mastery:60},year),3);
 }
 assert.equal(difficultyFor({mastery:90},'Year 6'),3);
 assert.equal(difficultyFor({mastery:90},'Year 9'),4);
 const a=createSession({[id]:{mastery:25,attempts:0}},undefined,options);
 const b=createSession({[id]:{mastery:25,attempts:100000}},undefined,options);
 nextQuestion(a);nextQuestion(b);assert.deepEqual(a.question,b.question);
});
test('all year and mastery pools are varied, unique, exact and bounded by input limits',()=>{
 for(const skill of skillGraph)for(let level=1;level<=4;level++) {
   const pool=questionPool(skill.id,level);
   assert.ok(pool.length>24,`${skill.id} level ${level} needs repeat-safe variety`);
   assert.equal(new Set(pool.map(q=>q.id)).size,pool.length);
   for(const q of pool){
     assert.equal(assess(q,q.answer).correct,true,q.id);
     const values=[q.a.n,q.a.d,...(q.b?[q.b.n,q.b.d]:[q.target]),...(typeof q.answer==='number'?[q.answer]:[q.answer.n,q.answer.d])];
     assert.ok(values.every(v=>Number.isSafeInteger(v)&&v>0&&v<=999),q.id);
     assert.ok(q.a.d<=24&&(!q.b||q.b.d<=24));
     if(typeof q.answer==='number')assert.ok(q.answer<=144);
     assert.equal(q.difficulty,level);
   }
 }
 assert.equal(questionFor(id,100000).difficulty,1);
});
test('questions never repeat in a session or within the twelve-question per-skill window',()=>{
 let progress={mastery:25,recentQuestionIds:[]};const seen=[];
 for(let i=0;i<35;i++){
   const q=selectQuestion(id,{...options,progress});
   assert.ok(q);assert.ok(!progress.recentQuestionIds.includes(q.id));
   seen.push(q.id);progress.recentQuestionIds=[...progress.recentQuestionIds,q.id].slice(-RECENT_QUESTION_LIMIT);
 }
 const pool=questionPool(id,1);
 assert.equal(selectQuestion(id,{...options,progress,seen:pool.map(q=>q.id)}),null);
 const s=createSession({},undefined,options);nextQuestion(s);
 const first=s.question.id;submitAnswer(s,{n:99,d:97});submitAnswer(s,{n:99,d:97});nextQuestion(s);
 assert.notEqual(s.question.id,first);
});
test('independent success raises mastery challenge, hints cannot escalate it, errors reduce it',()=>{
 const s=createSession({},undefined,options);nextQuestion(s);
 submitAnswer(s,s.question.answer);assert.equal(difficultyFor(s.progress[id]),2);
 const supported=createSession({[id]:{mastery:34}},undefined,options);nextQuestion(supported);supported.hint=true;
 submitAnswer(supported,supported.question.answer);assert.equal(supported.progress[id].mastery,34);assert.equal(difficultyFor(supported.progress[id]),1);
 const struggling=createSession({[id]:{mastery:35}},undefined,options);nextQuestion(struggling);
 submitAnswer(struggling,{n:99,d:97});submitAnswer(struggling,{n:99,d:97});assert.equal(difficultyFor(struggling.progress[id]),1);
});
