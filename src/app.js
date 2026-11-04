import {createSession, nextQuestion, beginPractice, submitAnswer, recommendation, skillGraph, skillById, answerText} from './engine/diagnostic.js';
import {subjects, getSkill, getSkills, getSubject} from './data/catalog.js';
import {defaultSkillProgress,advice} from './engine/adaptive.js';
import {load,save,progressKey,exportData} from './storage.js';

const root=document.getElementById('app');
let data=load();
let view='home';
let subjectId='maths';
let session=null;
let tutorMessage='';
let alertMessage='';

const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const learner=()=>data.profiles.find(p=>p.id===data.activeLearnerId)||data.profiles[0];
const skillProgress=(id,profileId=data.activeLearnerId)=>data.progress[progressKey(profileId,id)]||defaultSkillProgress();
const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
const percent=n=>`${Math.min(100,Math.max(0,Math.round(n)))}%`;
const actionButton=(action,label,klass='btn-primary',more='')=>`<button type="button" class="btn ${klass}" data-action="${action}" ${more}>${label}</button>`;
const pill=(s)=>`<span class="pill">${s}</span>`;
const fraction=(f)=>`<span class="fraction" aria-label="${f.n} over ${f.d}"><span>${f.n}</span><span>${f.d}</span></span>`;
const fractionStrip=(f)=>`<div class="strip" aria-label="${f.n} out of ${f.d} equal parts">${Array.from({length:f.d},(_,i)=>`<span class="slice ${i<f.n?'filled':''}"></span>`).join('')}</div>`;
const bar=(n)=>`<div class="bar"><div class="bar-fill" style="width:${percent(n)}"></div></div>`;

function header(){
  const p=learner();
  return `<header class="topbar"><a class="brand" href="#" data-action="home" aria-label="Learning Lab home"><span class="brand-mark">✳</span><span>learning<span class="brand-light">lab</span></span></a>
    <div class="top-actions"><button class="nav-button ${view==='parent'?'active':''}" data-action="parent">Parent view</button>
    <label class="profile-label" for="profile-select">Learner</label><select id="profile-select" aria-label="Current learner">${data.profiles.map(x=>`<option value="${escapeHTML(x.id)}" ${x.id===p.id?'selected':''}>${escapeHTML(x.name)}</option>`).join('')}</select></div></header>`;
}
function footer(){return `<footer class="footer"><span>Made for curious minds. No ads, no leaderboards.</span><span>Version 0.1 · Family-only prototype</span></footer>`;}
function shell(body){root.innerHTML=`<div class="shell">${header()}<main class="main" id="main">${alertMessage?`<div class="notice" role="status">${escapeHTML(alertMessage)}</div>`:''}${body}</main>${footer()}</div>`;}

function home(){
  const p=learner();
  const fractionProgress=skillProgress('maths.fractions.add-unlike');
  const current=subjects.filter(s=>s.active);
  const rest=subjects.filter(s=>!s.active);
  shell(`<section class="hero"><div><span class="eyebrow">YOUR PERSONAL LEARNING SPACE</span><h1>Ready for a little <em>brain training</em>, ${escapeHTML(p.name)}?</h1><p class="hero-text">Your tutor will find what you know, help with what you don't, and keep lessons at just the right level.</p>${actionButton('start-fractions',`Start a short maths diagnostic <span aria-hidden="true">→</span>`)}</div>
  <div class="hero-art" aria-hidden="true"><div class="art-circle"><span>⅓</span><b>+</b><span>⅙</span></div><div class="art-star">✳</div><div class="art-note">Big ideas.<br>Small steps.</div></div></section>
  <section class="section"><div class="section-head"><div><span class="eyebrow">YOUR LEARNING</span><h2>Choose a subject</h2></div><span class="muted small">New subjects will appear here</span></div><div class="subject-grid">${[...current,...rest].map(s=>`<button type="button" class="subject-card ${s.theme} ${!s.active?'inactive':''}" ${s.active?`data-action="open-subject" data-id="${s.id}"`:'disabled'}><span class="subject-symbol">${s.symbol}</span><span class="subject-name">${s.label}</span><span class="subject-desc">${s.description}</span><span class="subject-foot">${s.active?`Explore lessons <span>→</span>`:'Coming next'}</span></button>`).join('')}</div></section>
  <section class="section summary-section"><div class="summary-card"><div><span class="eyebrow">PROGRESS SPOTLIGHT</span><h3>Adding fractions</h3><p>${escapeHTML(recommendation(componentProgress()).title)}: ${escapeHTML(recommendation(componentProgress()).reason)}</p></div><div class="progress-blob"><strong>${percent(fractionProgress.mastery)}</strong><span>Estimated mastery</span></div></div></section>`);
}
function subject(){
  const s=getSubject(subjectId);
  const entries=getSkills(subjectId);
  shell(`<div class="crumb"><button data-action="home">Home</button><span>›</span>${escapeHTML(s.label)}</div><div class="page-heading"><span class="eyebrow">${escapeHTML(s.label.toUpperCase())} · ${escapeHTML(learner().year)}</span><h1>Find your next breakthrough.</h1><p>Pick a skill. We'll adjust the level as you practise, so there's no need to guess where to start.</p></div>
  <div class="skill-list">${entries.map(sk=>{const prog=skillProgress(sk.id);return `<div class="skill-card ${sk.available?'':'disabled-skill'}"><div class="skill-icon">${sk.available?'✦':'○'}</div><div class="skill-copy"><span class="eyebrow">${escapeHTML(sk.topic)}</span><h3>${escapeHTML(sk.title)}</h3><p>${escapeHTML(sk.description)}</p>${sk.available?`<div class="mastery-row">${bar(prog.mastery)}<span>${percent(prog.mastery)} mastery</span></div>`:''}</div><div>${sk.available?actionButton('start-skill','Practise →','btn-secondary',`data-id="${sk.id}"`):pill('Coming soon')}</div></div>`}).join('')}</div>`);
}
function componentProgress(profileId=data.activeLearnerId){
  return Object.fromEntries(skillGraph.map(s=>[s.id,data.progress[progressKey(profileId,s.id)]]));
}
function startSession(skillId){
  if(!getSkill(skillId)?.available)return;
  session=createSession(componentProgress(),new Date().toISOString(),{year:learner().year});session.skillId=skillId;session.profileId=data.activeLearnerId;
  nextQuestion(session);view='lesson';alertMessage='';render();
}
function persistSession(){
  for(const [id,progress] of Object.entries(session.progress)) if(progress) data.progress[progressKey(session.profileId,id)]=progress;
  if(session.phase==='summary'&&!session.archived){
    data.sessions=[{profileId:session.profileId,skillId:session.skillId,startedAt:session.startedAt,endedAt:new Date().toISOString(),outcomes:session.history},...data.sessions].slice(0,80);
    session.archived=true;
  }
  save(data);
}
function lesson(){
  const phase=session.phase;
  let body='';
  if(phase==='teach'){
    const sk=skillById(session.target);
    body=`<span class="eyebrow">TARGETED MINI-LESSON</span><h1>${escapeHTML(sk.title)}</h1><p>${escapeHTML(sk.lesson)}</p><div class="fraction-bars"><div><label>One half</label>${fractionStrip({n:1,d:2})}</div><div><label>Two quarters: the same amount</label>${fractionStrip({n:2,d:4})}</div></div><p>Explain the idea aloud, then try two guided questions and two independent checks.</p>${actionButton('begin-practice','Practise this skill →')}`;
  }else if(phase==='summary'){
    const next=recommendation(session.progress);
    body=`<span class="eyebrow">SESSION COMPLETE</span><h1>A useful next step</h1>${session.exhausted?'<p>We have used the available new examples for this level. Take a break before reviewing.</p>':''}<p>${escapeHTML(next.title)}: ${escapeHTML(next.reason)}</p>${componentSummary(session.profileId)}<p>Independent success is checked again after three days. Return here for a retention check when it is due.</p>${actionButton('start-again','Start another session','btn-secondary')}${actionButton('home','Back home')}`;
  }else{
    const q=session.question;
    body=`<span class="eyebrow">${escapeHTML(phase==='revisit'?'RETENTION CHECK':phase.toUpperCase())} · ${escapeHTML(skillById(q.skillId).title)} · LEVEL ${q.difficulty}</span><h1>${escapeHTML(q.prompt)}</h1><p>${phase==='diagnostic'?'A short check of each component skill. Different follow-up questions help us avoid guessing the cause of a mistake.':phase==='test'?'Try this without help. A hint is always available, but supported answers stay separate.':'Take your time and explain your method aloud.'}</p>
    <div class="answer-panel"><label for="numerator">${q.kind==='denominator'?'Common denominator':'Numerator'}</label><input type="number" id="numerator" min="0" max="999" inputmode="numeric" value="${escapeHTML(session.draft.n)}" ${session.done?'disabled':''}/>${q.kind!=='denominator'?`<label for="denominator">Denominator</label><input type="number" id="denominator" min="1" max="999" inputmode="numeric" value="${escapeHTML(session.draft.d)}" ${session.done?'disabled':''}/>`:''}</div>
    <div class="tutor-message" role="status" aria-live="polite">${escapeHTML(session.feedback||'Write your answer, then check it. A second try is available.')}</div>
    ${session.done?`<p>Verified answer: ${escapeHTML(answerText(q))}</p>${actionButton('next-question','Continue →')}`:`<div class="question-actions">${actionButton('hint','Give me a hint','btn-outline')}${actionButton('check-answer','Check my answer →')}</div>`}`;
  }
  shell(`<div class="crumb"><button data-action="home">Home</button><span>›</span>Fractions</div><section class="lesson-body">${body}</section>`);
}
function componentSummary(profileId){
  const progress=componentProgress(profileId);const next=recommendation(progress);
  return `<ul>${skillGraph.map(sk=>{const p=progress[sk.id];return `<li><b>${escapeHTML(sk.title)}</b>: ${!p?'Not checked yet':p.secure?'Independent checks passed':'More practice needed'}${p?` · ${p.independent} independent of ${p.attempts} questions · ${p.hints} hints`:''}${p?.diagnosis?` · ${escapeHTML({'denominator-only':'Changed only the bottom number','add-denominators':'Added bottom numbers','one-denominator':'Used a denominator that does not fit both fractions'}[p.diagnosis.code]||p.diagnosis.code)} (${p.diagnosis.status==='likely'?'likely pattern on different questions':'needs another check; not a diagnosis'})`:''}${p?.reviewAt?` · Revisit ${new Date(p.reviewAt).toLocaleDateString('en-GB')}`:''}</li>`}).join('')}</ul><p><b>Recommended next exercise:</b> ${escapeHTML(next.title)}. ${escapeHTML(next.reason)}</p>`;
}
function checkAnswer(){
  if(!session||session.done)return;
  const n=document.querySelector('#numerator').value.trim();
  const d=session.question.kind==='denominator'?'1':document.querySelector('#denominator').value.trim();
  session.draft={n,d};
  if(!/^\d+$/.test(n)||!/^\d+$/.test(d)||Number(n)>999||Number(d)>999||Number(d)<1){session.feedback='Use whole numbers from 0 to 999 and a denominator greater than zero.';render();return;}
  submitAnswer(session,session.question.kind==='denominator'?Number(n):{n:Number(n),d:Number(d)});
  persistSession();render();
}
function parent(){
  const recent=data.sessions.slice(0,8);
  shell(`<div class="page-heading"><span class="eyebrow">FAMILY OVERVIEW</span><h1>Every small step counts.</h1><p>These are local learning records from this browser. Scores are estimates, not a judgement of ability.</p></div>
    <div class="parent-grid">${data.profiles.map(p=>{const pr=skillProgress('maths.fractions.add-unlike',p.id);return `<article class="parent-card"><div class="parent-card-head"><div class="avatar">${escapeHTML(p.name.slice(0,1).toUpperCase())}</div><div><h3>${escapeHTML(p.name)}</h3><span>${escapeHTML(p.year)}</span></div></div><div class="mastery-parent"><strong>${percent(pr.mastery)}</strong><span>Adding unlike fractions</span></div>${bar(pr.mastery)}<div class="small-stats"><span>${pr.attempts} attempts</span><span>${pr.independent} independent</span><span>${pr.hints} hints used</span></div><p class="small-muted">${escapeHTML(advice(pr))}</p>${componentSummary(p.id)}</article>`}).join('')}</div>
    <section class="section"><span class="eyebrow">RECENT ACTIVITY</span><h2>Practice history</h2>${recent.length?`<div class="history-list">${recent.map(s=>{const p=data.profiles.find(x=>x.id===s.profileId);return `<div class="history-row"><b>${escapeHTML(p?.name||'Learner')}</b><span>${escapeHTML(getSkill(s.skillId)?.shortTitle||'Practice')}</span><span>${s.outcomes.filter(x=>x.independent).length}/${s.outcomes.length} independent</span><small>${new Date(s.endedAt).toLocaleDateString('en-GB')}</small></div>`}).join('')}</div>`:`<p class="muted">No completed sessions yet. When either child finishes a lesson, their results will appear here.</p>`}</section>
    <section class="section"><div class="parent-tools"><div><span class="eyebrow">FAMILY SETUP</span><h2>Add a learner</h2><p class="muted">Add a friend or family member on this device. Each person has their own local progress.</p><form id="add-learner-form" class="add-form"><label><span>Name</span><input name="name" maxlength="30" required placeholder="First name only" /></label><label><span>Year group</span><select name="year"><option>Year 4</option><option>Year 5</option><option selected>Year 6</option><option>Year 7</option><option>Year 8</option><option>Year 9</option><option>Year 10</option><option>Year 11</option></select></label><button type="submit" class="btn btn-secondary">Add learner</button></form></div><div><span class="eyebrow">DATA</span><h2>Keep a backup</h2><p class="muted">For this first version, progress is saved only in this browser. Export a backup before clearing browser data or switching devices.</p>${actionButton('export','Export progress (.json)','btn-outline')}</div></div></section>
    <div class="privacy-note"><b>Private family prototype:</b> no sign-in, server storage or public profiles. Please do not publish it for children to use publicly until basic access controls and data safeguards have been added.</div>`);
}
function render(){
  if(view==='home')home();else if(view==='subject')subject();else if(view==='lesson'&&session)lesson();else if(view==='parent')parent();else home();
}
root.addEventListener('click',e=>{
  const t=e.target.closest('[data-action]');if(!t)return;
  if(t.tagName==='A')e.preventDefault();
  const action=t.dataset.action;alertMessage='';
  if(action==='home'){view='home';session=null;}
  else if(action==='parent'){view='parent';session=null;}
  else if(action==='open-subject'){subjectId=t.dataset.id||'maths';view='subject';session=null;}
  else if(action==='start-fractions'){startSession('maths.fractions.add-unlike');return;}
  else if(action==='start-skill'){startSession(t.dataset.id);return;}
  else if(action==='begin-practice'){beginPractice(session);}
  else if(action==='hint'){if(session&&!session.done){session.hint=true;session.feedback=skillById(session.question.skillId).hint;}}
  else if(action==='check-answer'){checkAnswer();return;}
  else if(action==='next-question'){if(session?.done){nextQuestion(session);persistSession();}}
  else if(action==='start-again'){startSession(session.skillId);return;}
  else if(action==='export'){exportData(data);alertMessage='Progress backup exported. Keep it somewhere safe.';}
  render();
});
root.addEventListener('input',e=>{
  if(!session || !['diagnostic','practise','test','revisit'].includes(session.phase) || session.done)return;
  if(e.target?.id==='numerator')session.draft.n=e.target.value;
  if(e.target?.id==='denominator')session.draft.d=e.target.value;
});
root.addEventListener('change',e=>{
  if(e.target?.id==='profile-select'){
    if(data.profiles.some(p=>p.id===e.target.value)){
      data.activeLearnerId=e.target.value;save(data);session=null;view='home';alertMessage='Switched learner. Progress stays separate.';render();
    }
  }
});
root.addEventListener('submit',e=>{
  if(e.target?.id!=='add-learner-form')return;
  e.preventDefault();
  const form=new FormData(e.target);
  const name=String(form.get('name')||'').trim().slice(0,30);
  const year=String(form.get('year')||'Year 6');
  if(!name){alertMessage='Enter a first name.';render();return;}
  if(data.profiles.length>=10){alertMessage='This family version supports up to 10 local learner profiles.';render();return;}
  const id=`learner-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  data.profiles.push({id,name,year});data.activeLearnerId=id;save(data);view='home';alertMessage=`${name}'s profile is ready to use.`;render();
});
render();
