import {MODULES} from './content.js';
import {buildTest,mark,breakdown} from './engine.js';
import {defaultRewards,awardQuestion,awardLessonComplete} from '../rewards.js';
import {missedSkills,lessonKey,parseLessonKey,createRemediation,beginRemediation,useHint,submitRemediation,nextRemediation,remediationSummary} from './remediation.js';
import {renderRemediation} from './lesson-ui.js';
import {needsHumanReview,reviewableIndexes,gradeExtended} from './extended-marking.js';
import {extendedReviewMarkup,extendedResultIntro} from './extended-review-ui.js';

const KEY='family-learning-lab:v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.querySelector('#app');
function readData(){
 let d;
 try{d=JSON.parse(localStorage.getItem(KEY));}catch{}
 if(!d||!Array.isArray(d.profiles)||!d.progress){d={version:2,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'}],progress:{},sessions:[],rewards:{}};}
 d.sats??={};
 d.sats.active??={};d.sats.history??={};d.sats.recent??={};d.sats.runCounts??={};d.sats.activeLessons??={};d.sats.lessonHistory??={};d.sats.skillProgress??={};d.sats.pendingReviews??={};d.rewards??={};
 return d;
}
let data=readData();
let learnerId=data.profiles.some(x=>x.id==='kodjo')?'kodjo':data.activeLearnerId||data.profiles[0].id;
let view='home',reviewRecord=null;
const learner=()=>data.profiles.find(p=>p.id===learnerId)||data.profiles[0];
const active=()=>data.sats.active[learnerId];
const activeLesson=()=>data.sats.activeLessons[learnerId];
const pendingMark=()=>data.sats.pendingReviews[learnerId];
const history=()=>data.sats.history[learnerId]||[];
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){alert('Could not save progress. Please export a backup from Learning Lab or free browser storage.');}};
const day=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const countdown=()=>Math.max(0,Math.ceil((new Date('2027-05-10T00:00:00').getTime()-new Date().getTime())/86400000));
const percent=(a,b)=>b?Math.round(100*a/b):0;
function nav(){
 return `<header class="nav"><a class="brand" href="../">✳ learning<span>lab</span></a><div class="nav-right"><a href="../">← Main app</a><label for="who">Learner</label><select id="who">${data.profiles.map(p=>`<option value="${esc(p.id)}" ${p.id===learnerId?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div></header>`;
}
function shell(inner){root.innerHTML=`${nav()}<main class="wrap">${inner}</main><footer>Year 6 SATs-style practice · Original questions · No adverts · Scores are not official SATs grades</footer>`;}
function weakness(){
 const stats={};
 for(const record of history().slice(0,12)){
  record.test?.questions?.forEach((q,i)=>{
   const key=lessonKey(q.section,q.skill);
   stats[key]??={correct:0,total:0,section:q.section,skill:q.skill};
   stats[key].total++;
   stats[key].total+=(q.marks||1)-1;
   if(record.marksByQuestion)stats[key].correct+=record.marksByQuestion[i]||0;
   else if(mark(q,record.answers[i]))stats[key].correct++;
  });
 }
 return Object.entries(stats).filter(([,x])=>x.total>=2&&x.correct<x.total)
   .sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total))
   .slice(0,3);
}
function home(){
 const records=history(),today=records.filter(x=>x.endedAt.startsWith(day())),weak=weakness(),pending=active(),pendingLesson=activeLesson(),pendingMarking=pendingMark();
 const due=Object.entries(data.sats.skillProgress[learnerId]||{}).filter(([,p])=>p.reviewAt&&Date.parse(p.reviewAt)<=Date.now());
 shell(`<section class="hero"><div><div class="eyebrow">KODJO'S SATs PREPARATION · MAY 2027</div><h1>Ready to build your confidence, ${esc(learner().name)}?</h1><p>Short practice, real progress. No pressure to be perfect. Every mistake tells us what to practise next.</p><div class="hero-actions"><button class="primary" data-start="daily">Start today's SATs challenge →</button>${pending?'<button class="secondary" data-resume>Resume unfinished test</button>':''}</div><small>You can do the Daily Challenge as often as you like, including more than once a day.</small></div><div class="countdown"><b>${countdown()}</b><span>days until SATs begin<br>10 May 2027</span></div></section>
 <div class="overview"><div><strong>${records.length}</strong><span>Tests completed</span></div><div><strong>${today.length}</strong><span>Tests today</span></div><div><strong>${percent(records.slice(0,10).reduce((s,r)=>s+r.score,0),records.slice(0,10).reduce((s,r)=>s+r.total,0))}%</strong><span>Recent practice accuracy</span></div></div>
 <h2>Choose a practice module</h2><div class="grid">${MODULES.map(m=>`<article class="module ${m.featured?'featured':''}"><div class="icon">${m.icon}</div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><div class="module-foot"><span>${esc(m.time)}</span><button data-start="${esc(m.id)}">Practise →</button></div></article>`).join('')}</div>
 <section class="panel"><h2>Your next learning targets</h2>${weak.length?`<p>Based on your recent tests, these would be good topics to practise next:</p><div class="targets">${weak.map(([name,s])=>`<button type="button" class="target-link" data-fix="${esc(name)}">${esc(s.skill)} · ${s.correct}/${s.total} correct · Fix skill →</button>`).join('')}</div>`:'<p>Complete your first practice test to discover which skills need more attention.</p>'}<p class="note">For full official-style paper practice, use the previous years’ published papers with an adult. This daily challenge is a shorter revision test.</p></section>
 ${pendingMarking?`<section class="panel"><h2>Written answers waiting for review</h2><p>Read the mark schemes with an adult, then save the practice marks.</p><button class="primary" data-resume-mark>Review answers →</button></section>`:''}
 ${pendingLesson&&pendingLesson.stage!=='summary'?`<section class="panel"><h2>Continue a lesson</h2><p>You have an unfinished lesson on ${esc(pendingLesson.skill)}.</p><button class="primary" data-lesson-resume>Resume lesson →</button></section>`:''}
 ${due.length?`<section class="panel"><h2>Ready for a three-day review?</h2><div class="targets">${due.map(([key])=>`<button class="target-link" data-fix="${esc(key)}">Review ${esc(key.split('::')[1])} →</button>`).join('')}</div></section>`:''}
 ${records.length?`<section class="panel"><h2>Recent results</h2><div class="history">${records.slice(0,8).map((rec,i)=>`<button data-review="${i}"><span>${esc(MODULES.find(x=>x.id===rec.mode)?.title||rec.mode)}</span><strong>${rec.score}/${rec.total}</strong><small>${new Date(rec.endedAt).toLocaleDateString('en-GB')}</small></button>`).join('')}</div></section>`:''}`);
}
function start(mode){
 if(active()&&!confirm('Start a new test? The unfinished one will be replaced.'))return;
 const run=(data.sats.runCounts[learnerId]||0)+1;data.sats.runCounts[learnerId]=run;
 const seed=`${learnerId}:${day()}:${run}:${Date.now()}`;
 const test=buildTest(mode,seed,data.sats.recent[learnerId]||[]);
 data.sats.active[learnerId]={test,answers:Array(test.questions.length).fill(''),workings:Array(test.questions.length).fill(''),current:0,startedAt:new Date().toISOString()};
 save();view='test';render();
}
function extendedInput(q,selected,working){
 if(q.type==='written')return '<label class="answer-label" for="answer">Write your answer. Use evidence from the passage.</label><textarea id="answer" rows="7" placeholder="Write an explanation in your own words.">'+esc(selected)+'</textarea>';
 if(q.type==='multi-number')return '<label class="answer-label" for="working">Show your working (method marks)</label><textarea id="working" rows="5" placeholder="Explain your steps.">'+esc(working)+'</textarea>';
 return '';
}

function testScreen(){
 const state=active();if(!state){view='home';home();return;}
 const {test,answers,current}=state,q=test.questions[current];const working=state.workings?.[current]||'';
 const title=MODULES.find(x=>x.id===test.mode)?.title||'Practice';
 const selected=answers[current];
 shell(`<div class="exam-head"><div><span class="eyebrow">${esc(title)}</span><h1>Question ${current+1} of ${test.questions.length}</h1></div><span class="counter">${answers.filter(a=>String(a).trim()).length} answered</span></div><div class="progress"><span style="width:${(current+1)/test.questions.length*100}%"></span></div>
 <section class="question">${q.section==='reading'?`<div class="passage"><span class="eyebrow">READ THE PASSAGE</span><h2>${esc(q.passageTitle)}</h2><p>${esc(q.passage).replace(/\n/g,'<br>')}</p></div>`:''}
 <div class="eyebrow">${esc(q.section.toUpperCase())} · ${esc(q.skill)}</div><h2>${esc(q.prompt)}</h2>
 ${q.type==='choice'?`<div class="choices">${q.choices.map((choice,i)=>`<button class="${selected===choice?'selected':''}" data-choice="${i}"><b>${'ABCD'[i]}</b> ${esc(choice)}</button>`).join('')}</div>`:''}
 ${q.type==='number'||q.type==='fraction'||q.type==='multi-number'?`<label class="answer-label" for="answer">Your answer ${q.type==='fraction'?'(e.g. 3/4 or 1 1/2)':''}</label><input id="answer" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" value="${esc(selected)}" placeholder="Type your answer" />`:''}
 ${extendedInput(q,selected,working)}
 ${q.type==='spelling'?`<div class="spell"><button class="secondary" data-speak>🔊 Hear the word and sentence</button><p>${esc(q.sentence)}</p><small>Use the audio button, or ask an adult to read the word aloud without showing it.</small><label class="answer-label" for="answer">Spell the missing word</label><input id="answer" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(selected)}" placeholder="Type the spelling" /></div>`:''}
 <p class="hintless">This is test practice: no hints until you finish. You can go back to check your answers.</p></section>
 <div class="controls"><button class="secondary" data-prev ${current===0?'disabled':''}>← Previous</button><span>Answers saved as you go</span>${current===test.questions.length-1?'<button class="primary" data-finish>Finish & see results</button>':'<button class="primary" data-next>Next question →</button>'}</div>`);
}
function storeResponse(value){const s=active();if(!s)return;s.answers[s.current]=value;save();}
function speak(){
 const s=view==='lesson'?activeLesson():active();if(!s)return;const q=view==='lesson'?s.questions[s.cursor]:s.test.questions[s.current];if(q.type!=='spelling')return;
 if(!('speechSynthesis' in window)){alert('Audio is unavailable in this browser. Ask an adult to read the word.');return;}
 window.speechSynthesis.cancel();
 const utter=new SpeechSynthesisUtterance(`${q.answer}. ${q.sentence.replace('___',q.answer)}. ${q.answer}.`);
 utter.lang='en-GB';utter.rate=.83;window.speechSynthesis.speak(utter);
}
function finish(){
 const state=active();if(!state)return;
 const unanswered=state.answers.filter(x=>String(x).trim()==='').length;
 if(unanswered&&!confirm(`${unanswered} question(s) unanswered. Finish and mark them as incorrect?`))return;
 if(needsHumanReview(state.test)){
   const first=reviewableIndexes(state.test)[0];
   data.sats.pendingReviews[learnerId]={...state,submittedAt:new Date().toISOString(),current:first,manual:{},reviewed:{}};
   delete data.sats.active[learnerId];
   save();view='marking';render();return;
 }
 let score=0,xp=0;const stats=breakdown(state.test,state.answers);
 const rewards=data.rewards[learnerId]||defaultRewards();
 let rewardState=rewards;
 for(let i=0;i<state.test.questions.length;i++){
   const item=state.test.questions[i],correct=mark(item,state.answers[i]);if(correct)score++;
   const award=awardQuestion(rewardState,{skillId:`sats.${item.skill}`,questionId:item.id,correct,independent:correct,difficulty:1});
   rewardState=award.state;xp+=award.earned;
 }
 rewardState=awardLessonComplete(rewardState,{mastery:0}).state;
 data.rewards[learnerId]=rewardState;
 const rec={mode:state.test.mode,test:state.test,answers:[...state.answers],score,total:state.test.questions.length,stats,xp,endedAt:new Date().toISOString(),durationSeconds:Math.round((Date.now()-Date.parse(state.startedAt))/1000)};
 data.sats.history[learnerId]=[rec,...history()].slice(0,45);
 data.sats.recent[learnerId]=[...(data.sats.recent[learnerId]||[]),...state.test.questions.map(q=>q.id)].slice(-160);
 delete data.sats.active[learnerId];
 reviewRecord=rec;view='review';save();render();
}
function reviewRows(rec){
 return rec.test.questions.map((q,i)=>{
   const max=q.marks||1;
   const earned=rec.marksByQuestion?rec.marksByQuestion[i]:(mark(q,rec.answers[i])?1:0);
   const correct=earned===max;
   const answer=q.type==='written'?(q.example||'Answer assessed using the evidence checklist.'):q.answer;
   const explanation=q.type==='multi-number'?(q.workingExample||q.explanation):q.explanation;
   return '<details><summary><b class="'+(correct?'right':'wrong')+'">'+earned+'/'+max+'</b> '+(i+1)+'. '+esc(q.prompt)+'</summary><div>'
    +'<p><strong>Your answer:</strong> '+esc(rec.answers[i]||'(not answered)')+'</p>'
    +(q.type==='multi-number'?'<p><strong>Your working:</strong> '+esc(rec.workings?.[i]||'(none shown)')+'</p>':'')
    +'<p><strong>Example / correct answer:</strong> '+esc(answer)+'</p>'
    +(explanation?'<p>'+esc(explanation)+'</p>':'')
    +(q.criteria?'<p><strong>Mark points:</strong></p><ul>'+q.criteria.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul>':'')
    +'</div></details>';
 }).join('');
}

function result(){
 const rec=reviewRecord;if(!rec){view='home';home();return;}
 const wrong=missedSkills(rec).map(x=>[x.id,{correct:x.total-x.wrong,total:x.total,skill:x.skill,section:x.section}]);
 shell(`<section class="result-hero"><div class="eyebrow">TEST COMPLETE</div><h1>${rec.score} out of ${rec.total}</h1><p>${percent(rec.score,rec.total)}% correct · +${rec.xp} XP · ${Math.round(rec.durationSeconds/60)} minutes</p><p>${rec.score===rec.total?'Outstanding accuracy! Ready for another challenge?':'Good work completing the test. The interesting part is learning from what you missed.'}</p>${rec.marksByQuestion?extendedResultIntro(rec,esc):''}<div class="hero-actions"><button class="primary" data-start="daily">Try another Daily Challenge</button><button class="secondary" data-home>Back to SATs centre</button></div></section>
 <section class="panel"><h2>What to practise next</h2>${wrong.length?`<div class="targets">${wrong.slice(0,5).map(([s,v])=>`<button type="button" class="target-link" data-fix="${esc(s)}">${esc(v.skill)} · ${v.correct}/${v.total} · Fix this skill →</button>`).join('')}</div><p>Choose a skill to get a short explanation, guided practice and two independent checks.</p>`:'<p>No errors this time. Keep reviewing regularly and try different modules.</p>'}<p class="note">These are practice accuracy scores, not official SATs scaled scores or predictions.</p></section>
 <section class="panel"><h2>Review every answer</h2><div class="reviews">${reviewRows(rec)}
}

function startLesson(key){
 const target=parseLessonKey(key);
 if(!target)return;
 const existing=activeLesson();
 if(existing&&existing.stage!=='summary'&&!confirm('Replace your unfinished skill lesson with this one?'))return;
 const excluded=[...(data.sats.recent[learnerId]||[])];
 if(reviewRecord?.test?.questions)excluded.push(...reviewRecord.test.questions.map(q=>q.id));
 const seed=learnerId+':'+day()+':remediation:'+key+':'+Date.now()+':'+Math.random();
 try{
  const lesson=createRemediation(target.section,target.skill,seed,excluded);
  lesson.xpEarned=0;
  data.sats.activeLessons[learnerId]=lesson;
  save();view='lesson';render();
 }catch(err){
  alert('There are no new practice examples for this skill yet. Please try a related module. '+err.message);
 }
}
function lessonScreen(){
 const lesson=activeLesson();
 if(!lesson){view='home';home();return;}
 shell(renderRemediation(lesson,esc));
}
function awardLessonQuestion(lesson){
 const outcome=lesson.outcomes.at(-1);
 if(!outcome)return;
 const current=data.rewards[learnerId]||defaultRewards();
 const award=awardQuestion(current,{
  skillId:'sats.remediation.'+outcome.section+'.'+outcome.skill,
  questionId:outcome.id,correct:outcome.correct,independent:outcome.independent,difficulty:1
 });
 data.rewards[learnerId]=award.state;
 lesson.xpEarned=(lesson.xpEarned||0)+award.earned;
}
function recordLesson(lesson){
 if(lesson.stage!=='summary'||lesson.recorded)return;
 const summary=remediationSummary(lesson);
 if(!summary)return;
 const previous=(data.sats.skillProgress[learnerId]||{})[summary.key]||{};
 data.sats.skillProgress[learnerId]??={};
 data.sats.skillProgress[learnerId][summary.key]={...previous,...summary,attempts:(previous.attempts||0)+1};
 data.sats.lessonHistory[learnerId]??=[];
 data.sats.lessonHistory[learnerId].unshift({...summary,xp:lesson.xpEarned||0,questionIds:lesson.questions.map(q=>q.id)});
 data.sats.lessonHistory[learnerId]=data.sats.lessonHistory[learnerId].slice(0,45);
 data.sats.recent[learnerId]=[...(data.sats.recent[learnerId]||[]),...lesson.questions.map(q=>q.id)].slice(-160);
 data.rewards[learnerId]=awardLessonComplete(data.rewards[learnerId]||defaultRewards(),{mastery:0}).state;
 lesson.recorded=true;
 save();
}

function markingScreen(){
 const st=pendingMark();
 if(!st){view='home';home();return;}
 shell(extendedReviewMarkup(st,esc));
}
function updateMarkCriterion(raw){
 const st=pendingMark();if(!st)return;
 const [i,j]=String(raw).split(':').map(Number),q=st.test.questions[i];
 if(!q||!q.criteria||!Number.isInteger(j)||j<0||j>=q.criteria.length)return;
 const values=st.manual[i]||Array(q.criteria.length).fill(false);
 values[j]=!values[j];
 st.manual[i]=values;
 st.reviewed[i]=false;
 save();render();
}
function confirmMarkReview(index){
 const st=pendingMark();if(!st)return;
 const i=Number(index),q=st.test.questions[i];
 if(!q||!q.criteria)return;
 st.manual[i]??=Array(q.criteria.length).fill(false);
 st.reviewed[i]=!st.reviewed[i];
 save();render();
}
function stepMarkReview(delta){
 const st=pendingMark();if(!st)return;
 const list=reviewableIndexes(st.test);
 const current=list.indexOf(st.current);
 st.current=list[Math.max(0,Math.min(list.length-1,current+delta))];
 save();render();
}
function finishMarking(){
 const st=pendingMark();if(!st)return;
 const grade=gradeExtended(st.test,st.answers,st.workings||[],st.manual,st.reviewed);
 if(!grade.ready){alert('Review every written or method-mark question before saving the practice marks.');return;}
 let rewards=data.rewards[learnerId]||defaultRewards(),xp=0;
 for(let i=0;i<st.test.questions.length;i++){
  const item=st.test.questions[i];
  // No XP for self-awarded written/method marks. Only verifiable answers earn XP.
  if(item.type==='written')continue;
  const checked=mark(item,st.answers[i]);
  const award=awardQuestion(rewards,{
    skillId:'sats.'+item.section+'.'+item.skill,
    questionId:item.id,correct:checked,independent:checked,difficulty:1
  });
  xp+=award.earned;rewards=award.state;
 }
 data.rewards[learnerId]=awardLessonComplete(rewards,{mastery:0}).state;
 const rec={
  mode:st.test.mode,test:st.test,answers:[...st.answers],
  workings:[...(st.workings||[])],score:grade.score,total:grade.total,
  marksByQuestion:grade.marksByQuestion,stats:grade.stats,
  markingMethod:'Guided self-review or adult mark scheme',xp,
  endedAt:st.submittedAt||new Date().toISOString(),
  durationSeconds:Math.max(0,Math.round((Date.parse(st.submittedAt||new Date().toISOString())-Date.parse(st.startedAt))/1000))
 };
 data.sats.history[learnerId]=[rec,...history()].slice(0,45);
 data.sats.recent[learnerId]=[...(data.sats.recent[learnerId]||[]),...st.test.questions.map(q=>q.id)].slice(-160);
 delete data.sats.pendingReviews[learnerId];
 reviewRecord=rec;view='review';save();render();
}

function render(){if(view==='marking')markingScreen();else if(view==='test')testScreen();else if(view==='review')result();else if(view==='lesson')lessonScreen();else home();}
root.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;

 if(button.hasAttribute('data-resume-mark')){view='marking';render();return;}
 if(button.hasAttribute('data-mark-criterion')){updateMarkCriterion(button.dataset.markCriterion);return;}
 if(button.hasAttribute('data-mark-confirm')){confirmMarkReview(button.dataset.markConfirm);return;}
 if(button.hasAttribute('data-mark-prev')){stepMarkReview(-1);return;}
 if(button.hasAttribute('data-mark-next')){stepMarkReview(1);return;}
 if(button.hasAttribute('data-mark-finish')){finishMarking();return;}
 if(button.hasAttribute('data-fix')){startLesson(button.dataset.fix);return;}
 if(button.hasAttribute('data-lesson-resume')){view='lesson';render();return;}
 if(button.hasAttribute('data-lesson-home')){
  if(activeLesson()?.stage==='summary')delete data.sats.activeLessons[learnerId];
  save();view='home';render();return;
 }
 if(button.hasAttribute('data-lesson-again')){
  const old=activeLesson();if(!old)return;delete data.sats.activeLessons[learnerId];
  startLesson(lessonKey(old.section,old.skill));return;
 }
 if(button.hasAttribute('data-lesson-begin')){const s=activeLesson();if(s){beginRemediation(s);save();render();}return;}
 if(button.hasAttribute('data-lesson-choice')){
  const s=activeLesson();if(!s||s.done)return;
  const q=s.questions[s.cursor];s.answer=q.choices[Number(button.dataset.lessonChoice)];save();render();return;
 }
 if(button.hasAttribute('data-lesson-hint')){const s=activeLesson();if(s){useHint(s);save();render();}return;}
 if(button.hasAttribute('data-lesson-submit')){
  const s=activeLesson();if(!s)return;
  const result=submitRemediation(s,s.answer);
  if(!result.accepted){alert('Choose or enter an answer before checking.');return;}
  if(result.done)awardLessonQuestion(s);
  save();render();return;
 }
 if(button.hasAttribute('data-lesson-next')){
  const s=activeLesson();if(!s)return;
  if(nextRemediation(s)&&s.stage==='summary')recordLesson(s);
  save();render();return;
 }
 if(button.hasAttribute('data-lesson-speak')){speak();return;}
 if(button.hasAttribute('data-start')){start(button.dataset.start);return;}
 if(button.hasAttribute('data-resume')){view='test';render();return;}
 if(button.hasAttribute('data-home')){view='home';render();return;}
 if(button.hasAttribute('data-speak')){speak();return;}
 if(button.hasAttribute('data-choice')){const q=active()?.test.questions[active().current];if(q){storeResponse(q.choices[Number(button.dataset.choice)]);render();}return;}
 if(button.hasAttribute('data-prev')){const s=active();s.current=Math.max(0,s.current-1);save();render();return;}
 if(button.hasAttribute('data-next')){const s=active();s.current=Math.min(s.test.questions.length-1,s.current+1);save();render();return;}
 if(button.hasAttribute('data-finish')){finish();return;}
 if(button.hasAttribute('data-review')){reviewRecord=history()[Number(button.dataset.review)];view='review';render();}
});
root.addEventListener('input',e=>{
 if(e.target.id==='answer'){storeResponse(e.target.value);return;}
 if(e.target.id==='working'){const st=active();if(st){st.workings??=Array(st.test.questions.length).fill('');st.workings[st.current]=e.target.value;save();}return;}
 if(e.target.id==='lesson-answer'){const s=activeLesson();if(s&&!s.done){s.answer=e.target.value;save();}}
});
root.addEventListener('change',e=>{
 if(e.target.id==='who'){learnerId=e.target.value;reviewRecord=null;view='home';render();}
});
render();
