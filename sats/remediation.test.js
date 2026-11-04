import test from 'node:test';
import assert from 'node:assert/strict';
import {grammar,passages} from './content.js';
import {buildTest,mark,practiceForSkill} from './engine.js';
import {lessonKey,parseLessonKey,lessonFor,missedSkills,createRemediation,beginRemediation,useHint,submitRemediation,nextRemediation,remediationSummary} from './remediation.js';

const at='2026-11-04T12:00:00.000Z';

test('expanded content includes broad original reading, English and reasoning coverage',()=>{
 assert.ok(passages.length>=12);
 assert.ok(grammar.length>=54);
 assert.ok(passages.every(p=>p.text.length>=700&&p.questions.length>=4));
 const skills=new Set();
 for(let i=0;i<100;i++)for(const q of buildTest('reasoning','coverage-'+i).questions)skills.add(q.skill);
 for(const key of ['geometry','volume','scaling','coordinates','percentages','money','statistics','ratio','multi-step problems'])assert.ok(skills.has(key),key);
});

test('every assessed component has three distinct and accurately marked remediation items',()=>{
 const fields=new Map();
 for(const section of ['arithmetic','reasoning'])for(let i=0;i<100;i++)for(const q of buildTest(section,'source-'+i).questions)fields.set(lessonKey(q.section,q.skill),{section:q.section,skill:q.skill});
 for(const q of grammar)fields.set(lessonKey(q.section,q.skill),{section:q.section,skill:q.skill});
 for(const p of passages)for(const [skill] of p.questions)fields.set(lessonKey('reading',skill),{section:'reading',skill});
 fields.set(lessonKey('spelling','spelling'),{section:'spelling',skill:'spelling'});
 assert.ok(fields.size>=30);
 for(const {section,skill} of fields.values()){
   const qs=practiceForSkill(skill,'target-'+section+skill,[],3,section);
   assert.equal(qs.length,3,section+'::'+skill);
   assert.equal(new Set(qs.map(q=>q.id)).size,3,section+'::'+skill);
   assert.ok(qs.every(q=>q.skill===skill&&q.section===section&&mark(q,q.answer)),section+'::'+skill);
   assert.ok(lessonFor(section,skill).example,section+'::'+skill);
 }
});

test('reading vocabulary remediation uses reading passages rather than grammar items',()=>{
 const qs=practiceForSkill('vocabulary','vocab-reading',[],3,'reading');
 assert.ok(qs.every(q=>q.section==='reading'&&q.passage));
 const english=practiceForSkill('vocabulary','vocab-gps',[],3,'gps');
 assert.ok(english.every(q=>q.section==='gps'&&!q.passage));
 assert.deepEqual(parseLessonKey(lessonKey('reading','vocabulary')),{section:'reading',skill:'vocabulary'});
});

test('targeted content avoids just-tested questions where possible',()=>{
 const t=buildTest('daily','today');
 for(const q of t.questions){
  const candidates=practiceForSkill(q.skill,'repair-'+q.id,t.questions.map(x=>x.id),3,q.section);
  assert.equal(candidates.length,3);
  assert.ok(candidates.every(x=>x.id!==q.id),q.id);
 }
});

test('misconceptions get a guided attempt, then two independent checks and delayed review',()=>{
 const s=createRemediation('reasoning','ratio','ratio-repair',[],at);
 assert.equal(s.stage,'teach');
 assert.equal(beginRemediation(s),true);
 assert.equal(useHint(s),true);
 assert.equal(submitRemediation(s,'').accepted,false);
 const first=submitRemediation(s,'not correct');
 assert.equal(first.done,false);
 assert.equal(s.tries,1);
 const second=submitRemediation(s,s.questions[0].answer);
 assert.equal(second.done,true);
 assert.equal(s.outcomes[0].independent,false);
 assert.equal(nextRemediation(s),true);
 assert.equal(s.stage,'check');
 assert.equal(s.cursor,1);
 for(let i=1;i<=2;i++){
   const result=submitRemediation(s,s.questions[i].answer);
   assert.equal(result.independent,true);
   assert.equal(nextRemediation(s),true);
 }
 const summary=remediationSummary(s,at);
 assert.equal(summary.passed,true);
 assert.equal(summary.reviewAt,'2026-11-07T12:00:00.000Z');
 assert.equal(summary.checksCorrect,2);
 assert.equal(s.outcomes.length,3);
 assert.equal(submitRemediation(s,s.questions[2].answer).accepted,false);
});

test('mistakes during independent checks keep the skill in the practice queue',()=>{
 const s=createRemediation('reading','inference','infer-repair',[],at);
 beginRemediation(s);
 submitRemediation(s,s.questions[0].answer);nextRemediation(s);
 submitRemediation(s,'a wrong option');nextRemediation(s);
 submitRemediation(s,s.questions[2].answer);nextRemediation(s);
 const result=remediationSummary(s,at);
 assert.equal(result.checksCorrect,1);
 assert.equal(result.passed,false);
 assert.equal(result.reviewAt,null);
});

test('weakness selection preserves the actual subject when two subjects share vocabulary',()=>{
 const a=practiceForSkill('vocabulary','story',[],1,'reading')[0];
 const b=practiceForSkill('vocabulary','grammar',[],1,'gps')[0];
 const record={test:{questions:[a,b]},answers:['incorrect',b.answer]};
 const weak=missedSkills(record);
 assert.equal(weak.length,1);
 assert.equal(weak[0].id,'reading::vocabulary');
 assert.equal(weak[0].wrong,1);
});
