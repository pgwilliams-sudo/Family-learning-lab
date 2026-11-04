import test from 'node:test';
import assert from 'node:assert/strict';

test('SATs mistakes lead to a guided lesson, independent checks and isolated saved progress', async()=>{
 const listeners={};
 const root={innerHTML:'',addEventListener(name,handler){listeners[name]=handler;}};
 globalThis.document={querySelector(selector){return selector==='#app'?root:null;}};
 const storage=new Map();
 globalThis.localStorage={
  getItem(key){return storage.get(key)??null;},
  setItem(key,value){storage.set(key,value);}
 };
 globalThis.window={};
 globalThis.alert=()=>{throw Error('Unexpected alert');};
 globalThis.confirm=()=>true;

 const initial={
  version:2,activeLearnerId:'kodjo',
  profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'},{id:'nico',name:'Nico',year:'Year 9'}],
  progress:{'kodjo::maths.fractions.add-unlike':{mastery:47}},
  sessions:[{profileId:'nico',skillId:'existing',outcomes:[]}],
  rewards:{kodjo:{xp:8,credited:{},activeDays:[],badges:[],independentAnswers:0,supportedAnswers:0,completedLessons:0},nico:{xp:21,credited:{},activeDays:[],badges:[],independentAnswers:0,supportedAnswers:0,completedLessons:0}}
 };
 storage.set('family-learning-lab:v1',JSON.stringify(initial));
 await import('./app.js?ui-smoke=1');

 const data=()=>JSON.parse(storage.get('family-learning-lab:v1'));
 const button=(name,value)=>{
  const attribute='data-'+name;
  const property=name.replace(/-([a-z])/g,(_,x)=>x.toUpperCase());
  const element={dataset:{[property]:value},hasAttribute(key){return key===attribute;}};
  listeners.click({target:{closest(){return element;}}});
 };
 const input=(id,value)=>listeners.input({target:{id,value:String(value)}});
 const answer=(item,value)=>{
  if(item.type==='choice'){
   const idx=item.choices.indexOf(String(value));
   assert.ok(idx>=0,'Choice must exist');
   button('choice',String(idx));
  }else input('answer',value);
 };

 assert.match(root.innerHTML,/Daily SATs Challenge/);
 button('start','daily');
 const testState=data().sats.active.kodjo.test;
 assert.equal(testState.questions.length,12);
 const first=testState.questions[0];
 testState.questions.forEach((q,i)=>{
  const value=i===0?'99999999':q.answer;
  if(i===0&&q.type==='choice'){
   const incorrect=q.choices.find(choice=>choice!==q.answer);
   answer(q,incorrect);
  }else answer(q,value);
  if(i<11)button('next');else button('finish');
 });
 let saved=data();
 assert.equal(saved.sats.history.kodjo[0].score,11);
 assert.match(root.innerHTML,/Fix this skill/);
 assert.equal(saved.progress['kodjo::maths.fractions.add-unlike'].mastery,47);
 assert.equal(saved.rewards.nico.xp,21);

 button('fix',first.section+'::'+first.skill);
 assert.match(root.innerHTML,/STEP 1 OF 3/);
 assert.equal(data().sats.activeLessons.kodjo.stage,'teach');
 button('lesson-begin');
 assert.match(root.innerHTML,/STEP 2 OF 3/);
 for(let i=0;i<3;i++){
  const lesson=data().sats.activeLessons.kodjo;
  const item=lesson.questions[i];
  if(item.type==='choice'){
   const idx=item.choices.indexOf(item.answer);
   button('lesson-choice',String(idx));
  }else input('lesson-answer',item.answer);
  button('lesson-submit');
  assert.match(root.innerHTML,/Correct answer:/);
  button('lesson-next');
 }
 saved=data();
 assert.equal(saved.sats.activeLessons.kodjo.stage,'summary');
 const result=saved.sats.skillProgress.kodjo[first.section+'::'+first.skill];
 assert.equal(result.passed,true);
 assert.equal(result.checksCorrect,2);
 assert.ok(result.reviewAt);
 assert.equal(saved.sats.lessonHistory.kodjo.length,1);
 assert.equal(saved.rewards.nico.xp,21);
 assert.deepEqual(saved.sessions,initial.sessions);
 assert.equal(saved.progress['kodjo::maths.fractions.add-unlike'].mastery,47);
 assert.match(root.innerHTML,/Two independent checks correct/);
 button('lesson-home');
 assert.match(root.innerHTML,/Choose a practice module/);

 listeners.change({target:{id:'who',value:'nico'}});
 assert.match(root.innerHTML,/Nico/);
 assert.equal(data().sats.skillProgress.nico,undefined);
 button('start','daily');
 assert.equal(data().sats.active.nico.test.questions.length,12);
 assert.equal(data().sats.skillProgress.kodjo[first.section+'::'+first.skill].passed,true);

 delete globalThis.document;
 delete globalThis.localStorage;
 delete globalThis.window;
 delete globalThis.alert;
 delete globalThis.confirm;
});
