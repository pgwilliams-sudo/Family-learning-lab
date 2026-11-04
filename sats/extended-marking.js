import {mark} from './engine.js';

// Each independent rubric criterion represents one potential mark.
// This deliberately asks a person to judge meaning and mathematical method,
// rather than mistaking keyword matches for an examiner's assessment.
export const isReviewable=q=>q.type==='written'||q.type==='multi-number';
export const reviewableIndexes=test=>test.questions.map((q,i)=>isReviewable(q)?i:-1).filter(i=>i>=0);
const validChecklist=(list,q)=>Array.isArray(list)&&list.length===q.criteria.length&&list.every(x=>typeof x==='boolean');
export function gradeExtended(test,answers,workings=[],manual={},reviewed={}){
 if(!test?.questions||!Array.isArray(answers))throw Error('A test and answers are required');
 const list=reviewableIndexes(test);
 const missing=list.filter(i=>!reviewed[i]||!validChecklist(manual[i],test.questions[i]));
 if(missing.length)return {ready:false,missing};
 let score=0,total=0,marksByQuestion=[],stats={};
 test.questions.forEach((q,i)=>{
   const max=q.marks||1;
   let marks=0;
   if(q.type==='written'){
     // No marks for a blank answer even if someone accidentally ticks a criterion.
     marks=String(answers[i]??'').trim()?manual[i].filter(Boolean).length:0;
   }else if(q.type==='multi-number'){
     const numeric=mark(q,answers[i])?1:0;
     const method=String(workings[i]??'').trim()?manual[i].filter(Boolean).length:0;
     marks=numeric+method;
   }else marks=mark(q,answers[i])?1:0;
   if(marks>max||marks<0)throw Error('Invalid marks for '+q.id);
   score+=marks;total+=max;marksByQuestion.push(marks);
   const key=q.section+'::'+q.skill;
   if(!stats[key])stats[key]={section:q.section,skill:q.skill,correct:0,total:0};
   stats[key].correct+=marks;stats[key].total+=max;
 });
 return {ready:true,missing:[],score,total,marksByQuestion,stats};
}
export function needsHumanReview(test){return reviewableIndexes(test).length>0;}
