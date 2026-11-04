import {MODULES} from './content.js';
import {buildTest,mark,breakdown} from './engine.js';
import {defaultRewards,awardQuestion,awardLessonComplete} from '../rewards.js';

const KEY='family-learning-lab:v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.querySelector('#app');
function readData(){
 let d;
 try{d=JSON.parse(localStorage.getItem(KEY));}catch{}
 if(!d||!Array.isArray(d.profiles)||!d.progress){d={version:2,activeLearnerId:'kodjo',profiles:[{id:'kodjo',name:'Kodjo',year:'Year 6'}],progress:{},sessions:[],rewards:{}};}
 d.sats??={};
 d.sats.active??={};d.sats.history??={};d.sats.recent??={};d.sats.runCounts??={};d.rewards??={};
 return d;
}
let data=readData();
let learnerId=data.profiles.some(x=>x.id==='kodjo')?'kodjo':data.activeLearnerId||data.profiles[0].id;
let view='home',reviewRecord=null;
const learner=()=>data.profiles.find(p=>p.id===learnerId)||data.profiles[0];
const active=()=>data.sats.active[learnerId];
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
 const recent=history().slice(0,12),stats={};
 for(const h of recent)for(const [name,v] of Object.entries(h.stats)){const s=stats[name]??={correct:0,total:0};s.correct+=v.correct;s.total+=v.total;}
 return Object.entries(stats).filter(([,s])=>s.total>=2).sort((a,b)=>a[1].correct/a[1].total-b[1].correct/b[1].total).slice(0,3);
}
function home(){
 const records=history(),today=records.filter(x=>x.endedAt.startsWith(day())),weak=weakness(),pending=active();
 shell(`<section class="hero"><div><div class="eyebrow">KODJO'S SATs PREPARATION · MAY 2027</div><h1>Ready to build your confidence, ${esc(learner().name)}?</h1><p>Short practice, real progress. No pressure to be perfect. Every mistake tells us what to practise next.</p><div class="hero-actions"><button class="primary" data-start="daily">Start today's SATs challenge →</button>${pending?'<button class="secondary" data-resume>Resume unfinished test</button>':''}</div><small>You can do the Daily Challenge as often as you like, including more than once a day.</small></div><div class="countdown"><b>${countdown()}</b><span>days until SATs begin<br>10 May 2027</span></div></section>
 <div class="overview"><div><strong>${records.length}</strong><span>Tests completed</span></div><div><strong>${today.length}</strong><span>Tests today</span></div><div><strong>${percent(records.slice(0,10).reduce((s,r)=>s+r.score,0),records.slice(0,10).reduce((s,r)=>s+r.total,0))}%</strong><span>Recent practice accuracy</span></div></div>
 <h2>Choose a practice module</h2><div class="grid">${MODULES.map(m=>`<article class="module ${m.featured?'featured':''}"><div class="icon">${m.icon}</div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><div class="module-foot"><span>${esc(m.time)}</span><button data-start="${esc(m.id)}">Practise →</button></div></article>`).join('')}</div>
 <section class="panel"><h2>Your next learning targets</h2>${weak.length?`<p>Based on your recent tests, these would be good topics to practise next:</p><div class="targets">${weak.map(([name,s])=>`<span>${esc(name)} · ${s.correct}/${s.total}</span>`).join('')}</div>`:'<p>Complete your first practice test to discover which skills need more attention.</p>'}<p class="note">For full official-style paper practice, use the previous years’ published papers with an adult. This daily challenge is a shorter revision test.</p></section>
 ${records.length?`<section class="panel"><h2>Recent results</h2><div class="history">${records.slice(0,8).map((rec,i)=>`<button data-review="${i}"><span>${esc(MODULES.find(x=>x.id===rec.mode)?.title||rec.mode)}</span><strong>${rec.score}/${rec.total}</strong><small>${new Date(rec.endedAt).toLocaleDateString('en-GB')}</small></button>`).join('')}</div></section>`:''}`);
}
function start(mode){
 if(active()&&!confirm('Start a new test? The unfinished one will be replaced.'))return;
 const run=(data.sats.runCounts[learnerId]||0)+1;data.sats.runCounts[learnerId]=run;
 const seed=`${learnerId}:${day()}:${run}:${Date.now()}`;
 const test=buildTest(mode,seed,data.sats.recent[learnerId]||[]);
 data.sats.active[learnerId]={test,answers:Array(test.questions.length).fill(''),current:0,startedAt:new Date().toISOString()};
 save();view='test';render();
}
function testScreen(){
 const state=active();if(!state){view='home';home();return;}
 const {test,answers,current}=state,q=test.questions[current];
 const title=MODULES.find(x=>x.id===test.mode)?.title||'Practice';
 const selected=answers[current];
 shell(`<div class="exam-head"><div><span class="eyebrow">${esc(title)}</span><h1>Question ${current+1} of ${test.questions.length}</h1></div><span class="counter">${answers.filter(a=>String(a).trim()).length} answered</span></div><div class="progress"><span style="width:${(current+1)/test.questions.length*100}%"></span></div>
 <section class="question">${q.section==='reading'?`<div class="passage"><span class="eyebrow">READ THE PASSAGE</span><h2>${esc(q.passageTitle)}</h2><p>${esc(q.passage).replace(/\n/g,'<br>')}</p></div>`:''}
 <div class="eyebrow">${esc(q.section.toUpperCase())} · ${esc(q.skill)}</div><h2>${esc(q.prompt)}</h2>
 ${q.type==='choice'?`<div class="choices">${q.choices.map((choice,i)=>`<button class="${selected===choice?'selected':''}" data-choice="${i}"><b>${'ABCD'[i]}</b> ${esc(choice)}</button>`).join('')}</div>`:''}
 ${q.type==='number'||q.type==='fraction'?`<label class="answer-label" for="answer">Your answer ${q.type==='fraction'?'(e.g. 3/4 or 1 1/2)':''}</label><input id="answer" type="text" inputmode="decimal" spellcheck="false" autocomplete="off" value="${esc(selected)}" placeholder="Type your answer" />`:''}
 ${q.type==='spelling'?`<div class="spell"><button class="secondary" data-speak>🔊 Hear the word and sentence</button><p>${esc(q.sentence)}</p><small>Use the audio button, or ask an adult to read the word aloud without showing it.</small><label class="answer-label" for="answer">Spell the missing word</label><input id="answer" type="text" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(selected)}" placeholder="Type the spelling" /></div>`:''}
 <p class="hintless">This is test practice: no hints until you finish. You can go back to check your answers.</p></section>
 <div class="controls"><button class="secondary" data-prev ${current===0?'disabled':''}>← Previous</button><span>Answers saved as you go</span>${current===test.questions.length-1?'<button class="primary" data-finish>Finish & see results</button>':'<button class="primary" data-next>Next question →</button>'}</div>`);
}
function storeResponse(value){const s=active();if(!s)return;s.answers[s.current]=value;save();}
function speak(){
 const s=active();if(!s)return;const q=s.test.questions[s.current];if(q.type!=='spelling')return;
 if(!('speechSynthesis' in window)){alert('Audio is unavailable in this browser. Ask an adult to read the word.');return;}
 window.speechSynthesis.cancel();
 const utter=new SpeechSynthesisUtterance(`${q.answer}. ${q.sentence.replace('___',q.answer)}. ${q.answer}.`);
 utter.lang='en-GB';utter.rate=.83;window.speechSynthesis.speak(utter);
}
function finish(){
 const state=active();if(!state)return;
 const unanswered=state.answers.filter(x=>String(x).trim()==='').length;
 if(unanswered&&!confirm(`${unanswered} question(s) unanswered. Finish and mark them as incorrect?`))return;
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
function result(){
 const rec=reviewRecord;if(!rec){view='home';home();return;}
 const wrong=Object.entries(rec.stats).filter(([,s])=>s.correct<s.total).sort((a,b)=>a[1].correct/a[1].total-b[1].correct/b[1].total);
 shell(`<section class="result-hero"><div class="eyebrow">TEST COMPLETE</div><h1>${rec.score} out of ${rec.total}</h1><p>${percent(rec.score,rec.total)}% correct · +${rec.xp} XP · ${Math.round(rec.durationSeconds/60)} minutes</p><p>${rec.score===rec.total?'Outstanding accuracy! Ready for another challenge?':'Good work completing the test. The interesting part is learning from what you missed.'}</p><div class="hero-actions"><button class="primary" data-start="daily">Try another Daily Challenge</button><button class="secondary" data-home>Back to SATs centre</button></div></section>
 <section class="panel"><h2>What to practise next</h2>${wrong.length?`<div class="targets">${wrong.slice(0,5).map(([s,v])=>`<span>${esc(s)} · ${v.correct}/${v.total}</span>`).join('')}</div><p>Pick a related module above to practise these skills again.</p>`:'<p>No errors this time. Keep reviewing regularly and try different modules.</p>'}<p class="note">These are practice accuracy scores, not official SATs scaled scores or predictions.</p></section>
 <section class="panel"><h2>Review every answer</h2><div class="reviews">${rec.test.questions.map((q,i)=>`<details><summary><b class="${mark(q,rec.answers[i])?'right':'wrong'}">${mark(q,rec.answers[i])?'✓':'✕'}</b> ${i+1}. ${esc(q.prompt)}</summary><div><p><strong>Your answer:</strong> ${esc(rec.answers[i]||'(not answered)')}</p><p><strong>Correct answer:</strong> ${esc(q.answer)}</p><p>${esc(q.explanation)}</p></div></details>`).join('')}</div></section>`);
}
function render(){if(view==='test')testScreen();else if(view==='review')result();else home();}
root.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
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
root.addEventListener('input',e=>{if(e.target.id==='answer')storeResponse(e.target.value);});
root.addEventListener('change',e=>{
 if(e.target.id==='who'){learnerId=e.target.value;reviewRecord=null;view='home';render();}
});
render();
