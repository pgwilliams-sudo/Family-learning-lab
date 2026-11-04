import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultRewards,awardQuestion,awardLessonComplete,levelForXP,xpIntoLevel,localDay,DAILY_XP_CAP} from './rewards.js';
const date = new Date(2026,10,4,12,0);
const Q=(questionId,other={})=>({skillId:'maths.fractions.add-unlike',questionId,correct:true,independent:true,difficulty:1,date,...other});
test('awards verified independent answer once per question per day',()=>{
 const first=awardQuestion(defaultRewards(),Q('f01'));
 assert.equal(first.earned,12);assert.equal(first.state.xp,12);assert.deepEqual(first.unlocked,['first-step']);
 const repeat=awardQuestion(first.state,Q('f01'));assert.equal(repeat.earned,0);assert.equal(repeat.state.xp,12);
 const another=awardQuestion(repeat.state,Q('f02',{independent:false}));assert.equal(another.earned,6);
 const wrong=awardQuestion(another.state,Q('f03',{correct:false,independent:false}));assert.equal(wrong.earned,2);
});
test('repeat on another day earns points for retrieval practice',()=>{
 const first=awardQuestion(defaultRewards(),Q('f01'));
 const second=awardQuestion(first.state,Q('f01',{date:new Date(2026,10,5,12)}));
 assert.equal(second.earned,12);assert.equal(second.state.activeDays.length,2);
});
test('stretch bonus and daily cap cannot be circumvented',()=>{
 let s=defaultRewards();let total=0;
 for(let i=0;i<100;i++){const result=awardQuestion(s,Q(`q${i}`,{difficulty:4}));s=result.state;total+=result.earned;}
 assert.equal(total,DAILY_XP_CAP);assert.equal(s.xp,DAILY_XP_CAP);
 const repeated=awardQuestion(s,Q('q0',{date:new Date(2026,10,4,20)}));assert.equal(repeated.earned,0);
});
test('points and badges track each learner separately when callers use separate state',()=>{
 const a=awardQuestion(defaultRewards(),Q('f01'));
 const b=defaultRewards();assert.equal(a.state.xp,12);assert.equal(b.xp,0);
});
test('achievement thresholds unlock only once and cannot double count completed lesson badge',()=>{
 let s=defaultRewards();for(let i=0;i<5;i++)s=awardQuestion(s,Q(`a${i}`)).state;
 assert.ok(s.badges.includes('independent-thinker'));
 const first=awardLessonComplete(s,{mastery:80});assert.ok(first.unlocked.includes('first-lesson'));assert.ok(first.unlocked.includes('skill-builder'));
 const second=awardLessonComplete(first.state,{mastery:80});assert.deepEqual(second.unlocked,[]);
});
test('local day and level progress',()=>{
 assert.equal(localDay(new Date(2026,10,4,23,59)),'2026-11-04');assert.equal(levelForXP(99),1);assert.equal(levelForXP(100),2);assert.equal(xpIntoLevel(225),25);
});
