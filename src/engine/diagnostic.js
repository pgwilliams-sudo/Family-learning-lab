import {equalFractions, fmt} from './fractions.js';
import {skillGraph, skillById} from '../data/fraction-skills.js';
import {defaultSkillProgress, evaluateAttempt} from './adaptive.js';
import {selectQuestion, RECENT_QUESTION_LIMIT} from './questions.js';
export {questionFor} from './questions.js';
export const REVIEW_DAYS = 3;
const day = 86400000;
export function assess(q, answer) {
  answer ??= {n:NaN,d:NaN};
  if(q.kind==='denominator') {
    const correct=Number.isSafeInteger(answer)&&answer>0&&answer%q.a.d===0&&answer%q.b.d===0;
    return {correct,misconception:correct?null:answer===q.a.d||answer===q.b.d?'one-denominator':answer===q.a.d+q.b.d?'add-denominators':null,feedback:correct?'That number makes equal-sized pieces possible.':'Check that both bottom numbers divide exactly into your number.'};
  }
  const correct=answer?.d>0&&equalFractions(answer,q.answer)&&(q.kind!=='equivalent'||answer.d===q.target);
  if(correct) return {correct,misconception:null,feedback:'Yes — that fraction represents the right amount.'};
  let misconception=null;
  if(q.kind==='equivalent'&&answer.n===q.a.n&&answer.d===q.target) misconception='denominator-only';
  if(q.kind==='addition'&&equalFractions(answer,{n:q.a.n+q.b.n,d:q.a.d+q.b.d})) misconception='add-denominators';
  const messages={'denominator-only':'The top and bottom must change by the same factor.', 'add-denominators':'Adding bottom numbers changes the size of the pieces. Make equal-sized pieces first.'};
  return {correct:false,misconception,feedback:messages[misconception]||'This may be an arithmetic slip. Check the calculation; one answer cannot tell us why it happened.'};
}
export function recommendation(progress, now=new Date().toISOString()) {
  const needs=skillGraph.find(s=>!progress[s.id]?.secure);
  if(needs) return {skillId:needs.id,reason:'Build this prerequisite before moving on.',title:needs.title};
  const due=skillGraph.find(s=>progress[s.id]?.reviewAt && Date.parse(progress[s.id].reviewAt)<=Date.parse(now));
  const s=due||skillGraph[2];
  return {skillId:s.id,title:s.title,reason:due?'A delayed retention check is due.':'Practise independently, then revisit after three days.'};
}
export function createSession(progress={}, now=new Date().toISOString(), options={}) {
  const due=skillGraph.filter(s=>progress[s.id]?.secure && Date.parse(progress[s.id].reviewAt)<=Date.parse(now));
  return {phase:due.length?'revisit':'diagnostic',queue:(due.length?due:skillGraph).map(s=>({skillId:s.id})),history:[],seen:[],question:null,tries:0,hint:false,done:false,progress:structuredClone(progress),startedAt:now,year:options.year||'Year 6',random:options.random||Math.random};
}
export function nextQuestion(s) {
  if(!s.queue.length) {
    if(s.phase==='diagnostic'||s.phase==='revisit') {s.target=recommendation(s.progress).skillId;s.phase='teach';return;}
    if(s.phase==='practise') {s.phase='test';s.queue=[{skillId:s.target},{skillId:s.target}];}
    else {s.phase='summary';return;}
  }
  const request=s.queue.shift();
  const question=selectQuestion(request.skillId,{progress:s.progress[request.skillId],year:s.year,seen:s.seen,random:s.random});
  if(!question){s.phase='summary';s.exhausted=true;return;}
  s.question={...question,confirmation:request.confirmation||false};s.seen.push(question.id);
  s.tries=0;s.hint=false;s.done=false;s.draft={n:'',d:''};s.feedback='';
}
export function beginPractice(s) {s.phase='practise';s.queue=[{skillId:s.target},{skillId:s.target}];nextQuestion(s);}
export function submitAnswer(s, answer, now=new Date().toISOString()) {
  if(s.done||!s.question||['teach','summary'].includes(s.phase))return;
  s.tries++;
  const result=assess(s.question,answer);
  s.feedback=result.feedback;
  s.evidence ||= [];
  s.evidence.push({...result,answer,attempt:s.tries});
  if(!result.correct&&s.tries<2)return result;
  const id=s.question.skillId;
  const independent=result.correct&&s.tries===1&&!s.hint;
  const prior=s.progress[id]||defaultSkillProgress();
  const streak=independent?(prior.independentStreak||0)+1:0;
  // Screening identifies needs; only two independent, unseen test answers establish security.
  const check=s.phase==='test'||s.phase==='revisit';
  const checkStreak=check&&independent?(prior.checkStreak||0)+1:0;
  const secure=check ? checkStreak>=2 : (prior.secure||false)&&independent;
  const signals=s.evidence.filter(e=>e.misconception).map(e=>e.misconception);
  const previousSignals=prior.signals||[];
  const signalsAll=[...previousSignals,...signals].slice(-12);
  const suspected=signals.at(-1)||null;
  // Confirmation requires evidence from a different question, not a second try.
  const confirmed=suspected&&previousSignals.includes(suspected);
  const assessed=evaluateAttempt(prior,{correct:result.correct,attempts:s.tries,hint:s.hint},now);
  // Support is useful practice, but cannot raise challenge without independent evidence.
  if(result.correct&&!independent) assessed.mastery=prior.mastery;
  s.progress[id]={...assessed,recentQuestionIds:[...(prior.recentQuestionIds||[]),s.question.id].slice(-RECENT_QUESTION_LIMIT),independentStreak:streak,checkStreak,secure,signals:signalsAll,diagnosis:suspected?{code:suspected,status:confirmed?'likely':'needs-confirmation'}:prior.diagnosis,reviewAt:secure?new Date(Date.parse(now)+REVIEW_DAYS*day).toISOString():null};
  s.history.push({skillId:id,questionId:s.question.id,difficulty:s.question.difficulty,phase:s.phase,correct:result.correct,independent,hint:s.hint,attempts:s.tries,evidence:s.evidence});
  s.evidence=[];s.done=true;
  if((s.phase==='diagnostic'||s.phase==='revisit')&&!independent&&!s.question.confirmation) {
    s.queue.unshift({skillId:id,confirmation:true});
    s.feedback+=' We will use a different question to check before drawing a conclusion.';
  }
  if(s.phase==='test'&&!independent) s.feedback+=' We will keep this skill as a practice target; supported answers do not establish independent mastery.';
  return result;
}
export const answerText = q => q.kind==='denominator'?String(q.answer):fmt(q.answer);
export {skillGraph,skillById};
