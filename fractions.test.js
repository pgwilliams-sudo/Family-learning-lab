import test from 'node:test';
import assert from 'node:assert/strict';
import {gcd,lcm,simplify,addFractions,equalFractions,chooseQuestion,bank,workedSolution} from '../src/engine/fractions.js';
import {defaultSkillProgress,initialDifficulty,evaluateAttempt,nextDifficulty} from '../src/engine/adaptive.js';

test('gcd and lcm',()=>{assert.equal(gcd(12,18),6);assert.equal(lcm(3,4),12);assert.equal(lcm(4,8),8)});
test('simplify',()=>{assert.deepEqual(simplify({n:4,d:6}),{n:2,d:3});assert.deepEqual(simplify({n:0,d:7}),{n:0,d:1});assert.throws(()=>simplify({n:2,d:0}))});
test('unlike fractions, including sums greater than 1',()=>{
 assert.deepEqual(addFractions({n:1,d:3},{n:1,d:6}),{n:1,d:2});
 assert.deepEqual(addFractions({n:2,d:3},{n:3,d:4}),{n:17,d:12});
 assert.deepEqual(addFractions({n:1,d:4},{n:1,d:8}),{n:3,d:8});
});
test('equivalent answers are accepted, invalid denominators rejected',()=>{
 assert.ok(equalFractions({n:2,d:4},{n:1,d:2}));
 assert.ok(!equalFractions({n:2,d:6},{n:1,d:2}));
 assert.ok(!equalFractions({n:1,d:0},{n:1,d:2}));
});
test('question selection excludes seen questions and prefers requested difficulty',()=>{
 const allButOne=bank.filter(q=>q.id!=='f16').map(q=>q.id);
 assert.equal(chooseQuestion(allButOne,4,()=>0).id,'f16');
 assert.equal(chooseQuestion(bank.map(q=>q.id),2),null);
});
test('every bank question uses unlike denominators and has a valid worked solution',()=>{
 const ids=new Set();for(const q of bank){assert.notEqual(q.a.d,q.b.d);assert.ok(q.a.d>0&&q.b.d>0);assert.ok(!ids.has(q.id));ids.add(q.id);assert.match(workedSolution(q),/common denominator/);}
});
test('mastery rewards independent success, recognises hints and reduces on struggle',()=>{
 const start=defaultSkillProgress();
 const good=evaluateAttempt(start,{correct:true,attempts:1,hint:false},'2026-11-03');
 assert.equal(good.mastery,40);assert.equal(good.independent,1);
 const hinted=evaluateAttempt(good,{correct:true,attempts:1,hint:true},'2026-11-04');
 assert.equal(hinted.mastery,46);assert.equal(hinted.hints,1);
 const hard=evaluateAttempt(hinted,{correct:false,attempts:2,hint:true},'2026-11-05');
 assert.equal(hard.mastery,38);assert.equal(hard.correct,2);
 assert.equal(hard.recent.length,3);
});
test('adaptive policy changes level without exceeding bounds',()=>{
 assert.equal(initialDifficulty(25),1);assert.equal(initialDifficulty(55),3);
 assert.equal(nextDifficulty(2,2,{correct:true,attempts:1,hint:false}),3);
 assert.equal(nextDifficulty(1,0,{correct:false,attempts:2,hint:true}),1);
 assert.equal(nextDifficulty(3,2,{correct:true,attempts:1,hint:true}),3);
 assert.equal(nextDifficulty(4,3,{correct:true,attempts:1,hint:false}),4);
});
