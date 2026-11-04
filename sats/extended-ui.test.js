import test from 'node:test';
import assert from 'node:assert/strict';

test('long reading and multi-mark reasoning survive test → guided marking → saved result',async()=>{
 const listeners={},root={innerHTML:'',addEventListener(kind,handler){listeners[kind]=handler;}};
 globalThis.document={querySelector:id=>id==='#app'?root:null};
 const db=new Map();
 globalThis.localStorage={getItem:key=>db.get(key)||null,setItem:(key,v)=>db.set(key,v)};
 globalThis.window={};
 globalThis.alert=message=>{throw Error('Unexpected alert: '+message)};
 globalThis.confirm=()=>true;
 const initial={version:2,activeLearnerId:'kodjo',
 profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'},{id:'nico',name:'Nico',year:'Year 9'}],
 progress:{'kodjo::maths.fractions.add-unlike':{mastery:62}},sessions:[],
 rewards:{nico:{xp:55,credited:{},badges:[],activeDays:[],independentAnswers:0,supportedAnswers:0,completedLessons:0}}};
 db.set('family-learning-lab:v1',JSON.stringify(initial));
 await import('./app.js?extended-e2e=1');
 const data=()=>JSON.parse(db.get('family-learning-lab:v1'));
 const click=(id,value='')=>{
  const name='data-'+id,came=id.replace(/-([a-z])/g,(_,x)=>x.toUpperCase());
  const btn={hasAttribute:attribute=>attribute===name,dataset:{[came]:String(value)}};
  listeners.click({target:{closest:()=>btn}});
 };
 const input=(id,value)=>listeners.input({target:{id,value:String(value)}});
 function doPaper(mode,oneWrong=false){
  click('start',mode);
  const questions=data().sats.active.kodjo.test.questions;
  for(let i=0;i<questions.length;i++){
   const q=questions[i];
   if(q.type==='choice'){click('choice',q.choices.indexOf(q.answer));}
   else if(q.type==='written')input('answer',q.example);
   else{
    input('answer',oneWrong&&i===0?'0':q.answer);
    input('working',q.workingExample);
   }
   if(i===questions.length-1)click('finish');else click('next');
  }
  assert.ok(data().sats.pendingReviews.kodjo);
  assert.match(root.innerHTML,/GUIDED MARKING/);
  const pending=data().sats.pendingReviews.kodjo;
  const reviewables=pending.test.questions.map((q,i)=>q.criteria?i:-1).filter(i=>i>=0);
  for(let k=0;k<reviewables.length;k++){
    const i=reviewables[k],q=pending.test.questions[i];
    for(let j=0;j<q.criteria.length;j++)click('mark-criterion',i+':'+j);
    click('mark-confirm',i);
    if(k<reviewables.length-1)click('mark-next');
    else click('mark-finish');
  }
  const record=data().sats.history.kodjo[0];
  assert.equal(record.mode,mode);
  assert.ok(record.marksByQuestion);
  assert.equal(record.marksByQuestion.length,questions.length);
  assert.match(root.innerHTML,/guided self-review|Guided self-review/i);
  assert.equal(data().rewards.nico.xp,55);
  assert.equal(data().progress['kodjo::maths.fractions.add-unlike'].mastery,62);
  click('home');
  return record;
 }
 const first=doPaper('reading-extended');
 assert.equal(first.score,first.total);
 assert.equal(first.total,24); // Each passage: 1+1+2+2+3+3 = 12 marks.
 const second=doPaper('reasoning-extended',true);
 assert.equal(second.score,second.total-1);
 assert.equal(data().sats.history.kodjo.length,2);
 assert.equal(data().sats.pendingReviews.kodjo,undefined);
 assert.match(root.innerHTML,/Extended Reading Paper/);
 assert.match(root.innerHTML,/Extended Maths Reasoning/);
 listeners.change({target:{id:'who',value:'nico'}});
 assert.equal(data().sats.history.nico,undefined);
 click('start','reading-extended');
 assert.equal(data().sats.active.nico.test.questions.length,12);
 delete globalThis.document;delete globalThis.localStorage;delete globalThis.window;delete globalThis.alert;delete globalThis.confirm;
});
