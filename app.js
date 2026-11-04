import {subjects, getSkill, getSkills, getSubject} from './catalog.js';
import {bank,fmt,addFractions,chooseQuestion,equalFractions,workedSolution} from './fractions.js';
import {SESSION_QUESTIONS,defaultSkillProgress,initialDifficulty,evaluateAttempt,nextDifficulty,advice} from './adaptive.js';
import {tutorReply} from './feedback.js';
import {load,save,progressKey,exportData} from './storage.js';
import {defaultRewards,awardQuestion,awardLessonComplete,badgeDetails,levelForXP,xpIntoLevel,XP_PER_LEVEL} from './rewards.js';

const root=document.getElementById('app');
let data=load();
let view='home';
let subjectId='maths';
let session=null;
let tutorMessage='';
let alertMessage='';

const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const learner=()=>data.profiles.find(p=>p.id===data.activeLearnerId)||data.profiles[0];
const rewardsFor=(profileId=data.activeLearnerId)=>data.rewards?.[profileId]||defaultRewards();
const earnedBadges=(profileId=data.activeLearnerId)=>rewardsFor(profileId).badges.map(badgeDetails).filter(Boolean);
const badgeMarkup=(profileId=data.activeLearnerId)=>earnedBadges(profileId).length?earnedBadges(profileId).map(b=>`<span class="reward-badge" title="${escapeHTML(b.description)}"><span aria-hidden="true">${b.icon}</span> ${escapeHTML(b.title)}</span>`).join(''):'<p class="small-muted">Badges will appear here as you learn.</p>';
const xpProgress=(profileId=data.activeLearnerId)=>{const r=rewardsFor(profileId);return `<div class="xp-progress"><div class="xp-progress-label"><strong>Level ${levelForXP(r.xp)}</strong><span>${Math.floor(r.xp)} XP · ${XP_PER_LEVEL-xpIntoLevel(r.xp)} to next level</span></div><div class="bar"><div class="bar-fill xp-fill" style="width:${xpIntoLevel(r.xp)}%"></div></div></div>`;};
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
    <div class="top-actions"><a class="nav-button" href="./sats/">🎯 SATs Centre</a><span class="xp-chip" aria-label="Your experience points">✦ ${Math.floor(rewardsFor().xp)} XP</span><button class="nav-button ${view==='parent'?'active':''}" data-action="parent">Parent view</button>
    <label class="profile-label" for="profile-select">Learner</label><select id="profile-select" aria-label="Current learner">${data.profiles.map(x=>`<option value="${escapeHTML(x.id)}" ${x.id===p.id?'selected':''}>${escapeHTML(x.name)}</option>`).join('')}</select></div></header>`;
}
function footer(){return `<footer class="footer"><span>Made for curious minds. No ads, no leaderboards.</span><span>Version 0.2 · Family-only prototype</span></footer>`;}
function shell(body){root.innerHTML=`<div class="shell">${header()}<main class="main" id="main">${alertMessage?`<div class="notice" role="status">${escapeHTML(alertMessage)}</div>`:''}${body}</main>${footer()}</div>`;}

function home(){
  const p=learner();
  const fractionProgress=skillProgress('maths.fractions.add-unlike');
  const current=subjects.filter(s=>s.active);
  const rest=subjects.filter(s=>!s.active);
  shell(`<section class="hero"><div><span class="eyebrow">YOUR PERSONAL LEARNING SPACE</span><h1>Ready for a little <em>brain training</em>, ${escapeHTML(p.name)}?</h1><p class="hero-text">Your tutor will find what you know, help with what you don't, and keep lessons at just the right level.</p>${actionButton('start-fractions',`Start a 15-minute maths lesson <span aria-hidden="true">→</span>`)}${p.id==='kodjo'?` <a class="btn btn-secondary" href="./sats/">Daily SATs Challenge →</a>`:''}</div>
  <div class="hero-art" aria-hidden="true"><div class="art-circle"><span>⅓</span><b>+</b><span>⅙</span></div><div class="art-star">✳</div><div class="art-note">Big ideas.<br>Small steps.</div></div></section>
  <section class="xp-panel"><div><span class="eyebrow">YOUR LEARNING ADVENTURE</span><h2>Earn XP by learning</h2><p class="muted small">Tackle challenges, ask for hints, and collect badges. Learning matters more than speed.</p>${xpProgress()}</div><div class="badge-collection"><b>Your badges</b><div class="badge-list">${badgeMarkup()}</div></div></section>
  <section class="section"><div class="section-head"><div><span class="eyebrow">YOUR LEARNING</span><h2>Choose a subject</h2></div><span class="muted small">New subjects will appear here</span></div><div class="subject-grid">${[...current,...rest].map(s=>`<button type="button" class="subject-card ${s.theme} ${!s.active?'inactive':''}" ${s.active?`data-action="open-subject" data-id="${s.id}"`:'disabled'}><span class="subject-symbol">${s.symbol}</span><span class="subject-name">${s.label}</span><span class="subject-desc">${s.description}</span><span class="subject-foot">${s.active?`Explore lessons <span>→</span>`:'Coming next'}</span></button>`).join('')}</div></section>
  <section class="section summary-section"><div class="summary-card"><div><span class="eyebrow">PROGRESS SPOTLIGHT</span><h3>Adding fractions</h3><p>${escapeHTML(advice(fractionProgress))}</p></div><div class="progress-blob"><strong>${percent(fractionProgress.mastery)}</strong><span>Estimated mastery</span></div></div></section>`);
}
function subject(){
  const s=getSubject(subjectId);
  const entries=getSkills(subjectId);
  shell(`<div class="crumb"><button data-action="home">Home</button><span>›</span>${escapeHTML(s.label)}</div><div class="page-heading"><span class="eyebrow">${escapeHTML(s.label.toUpperCase())} · ${escapeHTML(learner().year)}</span><h1>Find your next breakthrough.</h1><p>Pick a skill. We'll adjust the level as you practise, so there's no need to guess where to start.</p></div>
  <div class="skill-list">${entries.map(sk=>{const prog=skillProgress(sk.id);return `<div class="skill-card ${sk.available?'':'disabled-skill'}"><div class="skill-icon">${sk.available?'✦':'○'}</div><div class="skill-copy"><span class="eyebrow">${escapeHTML(sk.topic)}</span><h3>${escapeHTML(sk.title)}</h3><p>${escapeHTML(sk.description)}</p>${sk.available?`<div class="mastery-row">${bar(prog.mastery)}<span>${percent(prog.mastery)} mastery</span></div>`:''}</div><div>${sk.available?actionButton('start-skill','Practise →','btn-secondary',`data-id="${sk.id}"`):pill('Coming soon')}</div></div>`}).join('')}</div>`);
}
function startSession(skillId){
  const skill=getSkill(skillId);
  if(!skill?.available) return;
  const progress=skillProgress(skillId);
  session={skillId,phase:'intro',startedAt:new Date().toISOString(),difficulty:initialDifficulty(progress.mastery),streak:0,seen:[],history:[],question:null,tries:0,hintLevel:0,answer:null,done:false,xpEarned:0,badgesEarned:[],latestAward:null};
  tutorMessage=''; alertMessage=''; view='lesson'; render();
}
function selectNextQuestion(){
  session.question=chooseQuestion(session.seen,session.difficulty);
  if(!session.question){session.phase='summary';finishSession();return;}
  session.seen.push(session.question.id);
  session.tries=0;session.hintLevel=0;session.done=false;session.answer=null;session.draft={n:'',d:''};
  session.phase='question'; tutorMessage='';session.latestAward=null;
}
function finishSession(){
  if(!session || session.archived)return;
  const summary={profileId:data.activeLearnerId,skillId:session.skillId,startedAt:session.startedAt,endedAt:new Date().toISOString(),outcomes:session.history.map(h=>({questionId:h.questionId,correct:h.correct,independent:h.independent,hint:h.hint,difficulty:h.difficulty}))};
  data.sessions=[summary,...data.sessions].slice(0,80);
  const result=awardLessonComplete(rewardsFor(),{mastery:skillProgress(session.skillId).mastery});
  data.rewards[data.activeLearnerId]=result.state;session.badgesEarned.push(...result.unlocked);
  session.archived=true; save(data);
}
function lesson(){
  const sk=getSkill(session.skillId);
  const p=learner();
  const right=`<div class="lesson-context"><span class="eyebrow">YOUR SESSION</span><h3>${escapeHTML(sk.shortTitle)}</h3><p>We'll work through a few questions together. Use a hint whenever you need one.</p><div class="context-stat"><b>${session.history.length} / ${SESSION_QUESTIONS}</b><span>Questions completed</span></div><div class="context-stat"><b>${session.history.filter(h=>h.independent).length}</b><span>Solved independently</span></div><div class="context-divider"></div><span class="eyebrow">YOUR REWARDS</span><div class="context-stat"><b>✦ ${Math.floor(rewardsFor().xp)} XP</b><span>Level ${levelForXP(rewardsFor().xp)}</span></div><div class="context-stat"><b>+${session.xpEarned} XP</b><span>Earned this lesson</span></div><div class="context-divider"></div><span class="eyebrow">TODAY'S GOALS</span><ul>${sk.objectives.map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ul></div>`;
  let inner='';
  if(session.phase==='intro'){
    inner=`<span class="eyebrow">MEET YOUR TUTOR</span><h1>Let's crack fractions together, ${escapeHTML(p.name)}.</h1><p>${escapeHTML(sk.intro)}</p>
    <div class="worked-card"><span class="small-label">QUICK EXAMPLE</span><div class="example-problem">${fraction({n:1,d:3})} <span>+</span> ${fraction({n:1,d:6})} <span>= ?</span></div><div class="fraction-bars"><div><label>One third</label>${fractionStrip({n:1,d:3})}</div><div><label>One sixth</label>${fractionStrip({n:1,d:6})}</div></div><p>One third is the same as <b>two sixths</b>. Now the pieces match, so 2/6 + 1/6 = 3/6 = <b>1/2</b>.</p><div class="fraction-bars"><div><label>Three sixths = one half</label>${fractionStrip({n:3,d:6})}</div></div></div>
    <div class="tip"><span aria-hidden="true">💡</span><p><b>Remember:</b> don't add the bottom numbers. First make the pieces the same size, then add the top numbers.</p></div>${actionButton('begin-questions','Let me try some questions →')}`;
  } else if(session.phase==='question'){
    const q=session.question;
    const answer=addFractions(q.a,q.b);
    const status=session.history.length+1;
    inner=`<span class="eyebrow">QUESTION ${status} OF ${SESSION_QUESTIONS} · ${session.difficulty<=1?'GETTING STARTED':session.difficulty===2?'BUILDING CONFIDENCE':session.difficulty===3?'CHALLENGE':'STRETCH'}</span>
    <h1>What's the sum?</h1><p>Write your answer as a fraction. You can simplify it if you can.</p>
    <div class="question-line" role="math" aria-label="${fmt(q.a)} plus ${fmt(q.b)}">${fraction(q.a)} <span>+</span> ${fraction(q.b)} <span>=</span> <span class="question-mark">?</span></div>
    <div class="fraction-bars"><div><label>First fraction</label>${fractionStrip(q.a)}</div><div><label>Second fraction</label>${fractionStrip(q.b)}</div></div>
    <div class="answer-panel"><label class="small-label" for="numerator">YOUR ANSWER</label><div class="answer-fields"><div class="answer-fraction"><input type="number" id="numerator" inputmode="numeric" min="0" max="999" aria-label="Numerator" placeholder="top" value="${escapeHTML(session.draft?.n||'')}" ${session.done?'disabled':''}/><span class="fraction-rule"></span><input type="number" id="denominator" inputmode="numeric" min="1" max="999" aria-label="Denominator" placeholder="bottom" value="${escapeHTML(session.draft?.d||'')}" ${session.done?'disabled':''}/></div><span class="answer-guidance">Top: how many pieces?<br>Bottom: what size pieces?</span></div></div>
    ${tutorMessage?`<div class="tutor-message ${session.done?'complete':''}" role="status"><span class="tutor-avatar" aria-hidden="true">✳</span><div><b>Your tutor says</b><p>${escapeHTML(tutorMessage)}</p></div></div>`:''}
    <div class="question-actions">${session.done?actionButton('next-question',session.history.length>=SESSION_QUESTIONS?'See my progress →':'Next question →'):`${actionButton('hint','Give me a hint','btn-outline')}${actionButton('check-answer','Check my answer →')}`}</div>
    ${session.done&&session.latestAward?`<div class="earned-note" role="status">✦ +${session.latestAward.earned} XP${session.latestAward.earned===0?' · Already practised today, or daily limit reached':''}${session.latestAward.unlocked.length?` · New badge: ${session.latestAward.unlocked.map(id=>escapeHTML(badgeDetails(id)?.title||id)).join(', ')}`:''}</div>`:''}
    ${session.done?`<div class="solution-mini"><b>Verified answer:</b> ${fraction(answer)}</div>`:''}`;
  } else {
    const h=session.history;const independent=h.filter(x=>x.independent).length;
    const helped=h.filter(x=>x.hint||!x.correct||x.tries>1).length;
    const prog=skillProgress(sk.id);
    inner=`<div class="celebrate">✳</div><span class="eyebrow">SESSION COMPLETE</span><h1>Well done, ${escapeHTML(p.name)}!</h1><p>Learning isn't about getting every question right first time. It's about understanding a little more each time you practise.</p>
    <div class="lesson-reward"><b>✦ +${session.xpEarned} XP earned this lesson</b>${xpProgress()}${session.badgesEarned.length?`<p>New badges: ${session.badgesEarned.map(id=>escapeHTML(badgeDetails(id)?.title||id)).join(', ')}</p>`:''}</div>
    <div class="results-grid"><div class="result"><strong>${independent}/${h.length}</strong><span>Independent answers</span></div><div class="result"><strong>${helped}</strong><span>Needed a little help</span></div><div class="result"><strong>${percent(prog.mastery)}</strong><span>Estimated mastery</span></div></div><div class="recommendation"><span class="eyebrow">YOUR NEXT STEP</span><h3>Here's what we'll work on next</h3><p>${escapeHTML(advice(prog))}</p></div><p class="reflection">One last thought: <b>Why do we find a common denominator before adding fractions?</b> Try explaining it aloud to someone at home.</p>
    <div class="question-actions">${actionButton('start-again','Practise again','btn-secondary')}${actionButton('home','Back to subjects →')}</div>`;
  }
  shell(`<div class="crumb"><button data-action="home">Home</button><span>›</span><button data-action="open-subject" data-id="maths">Maths</button><span>›</span>Fractions</div><div class="lesson-grid"><section class="lesson-body">${inner}</section><aside>${right}</aside></div>`);
}
function recordOutcome(correct){
  const q=session.question;
  const outcome={correct,attempts:session.tries,hint:session.hintLevel>0};
  const independent=correct && session.tries===1 && !outcome.hint;
  const key=progressKey(data.activeLearnerId,session.skillId);
  data.progress[key]=evaluateAttempt(data.progress[key],outcome);
  const reward=awardQuestion(rewardsFor(),{skillId:session.skillId,questionId:q.id,correct,independent,difficulty:q.difficulty});
  data.rewards[data.activeLearnerId]=reward.state;session.xpEarned+=reward.earned;session.badgesEarned.push(...reward.unlocked);session.latestAward=reward;
  session.history.push({questionId:q.id,difficulty:q.difficulty,...outcome,independent,tries:session.tries,xp:reward.earned});
  session.streak=independent?session.streak+1:0;
  session.difficulty=nextDifficulty(session.difficulty,session.streak,outcome);
  session.done=true;
  save(data);
}
function checkAnswer(){
  if(!session || session.done)return;
  const nString=document.querySelector('#numerator')?.value?.trim();
  const dString=document.querySelector('#denominator')?.value?.trim();
  if(!/^\d+$/.test(nString||'') || !/^\d+$/.test(dString||'')){tutorMessage='Please put a whole number in the top box and a positive whole number in the bottom box.';render();return;}
  const n=Number(nString),d=Number(dString);
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d<=0||n>999||d>999){tutorMessage='Use whole numbers between 0 and 999. The bottom number must be greater than zero.';render();return;}
  session.draft={n:nString,d:dString};
  session.tries++;
  const q=session.question;
  const correct=equalFractions({n,d},addFractions(q.a,q.b));
  if(correct){recordOutcome(true);tutorMessage=tutorReply(q,{kind:'solved'});const standard=addFractions(q.a,q.b);if(n!==standard.n||d!==standard.d)tutorMessage+=` Your answer ${n}/${d} is equivalent. The simplest form is ${fmt(standard)}.`;}
  else if(session.tries>=2){recordOutcome(false);tutorMessage=tutorReply(q,{kind:'supported'});}
  else{tutorMessage=tutorReply(q,{kind:'try-again',attempt:Math.min(session.hintLevel+1,2)});}
  render();
}
function parent(){
  const recent=data.sessions.slice(0,8);
  shell(`<div class="page-heading"><span class="eyebrow">FAMILY OVERVIEW</span><h1>Every small step counts.</h1><p>These are local learning records from this browser. Scores are estimates, not a judgement of ability.</p></div>
    <div class="parent-grid">${data.profiles.map(p=>{const pr=skillProgress('maths.fractions.add-unlike',p.id);return `<article class="parent-card"><div class="parent-card-head"><div class="avatar">${escapeHTML(p.name.slice(0,1).toUpperCase())}</div><div><h3>${escapeHTML(p.name)}</h3><span>${escapeHTML(p.year)}</span></div></div><div class="mastery-parent"><strong>${percent(pr.mastery)}</strong><span>Adding unlike fractions</span></div>${bar(pr.mastery)}<div class="parent-xp">✦ ${Math.floor(rewardsFor(p.id).xp)} XP · Level ${levelForXP(rewardsFor(p.id).xp)} · ${rewardsFor(p.id).badges.length} badges</div><div class="small-stats"><span>${pr.attempts} attempts</span><span>${pr.independent} independent</span><span>${pr.hints} hints used</span></div><p class="small-muted">${escapeHTML(advice(pr))}</p><div class="badge-list">${badgeMarkup(p.id)}</div></article>`}).join('')}</div>
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
  else if(action==='begin-questions'){selectNextQuestion();}
  else if(action==='hint'){if(session&&!session.done){session.hintLevel=Math.min(2,session.hintLevel+1);tutorMessage=tutorReply(session.question,{kind:'hint',attempt:session.hintLevel});}}
  else if(action==='check-answer'){checkAnswer();return;}
  else if(action==='next-question'){if(session.history.length>=SESSION_QUESTIONS){session.phase='summary';finishSession();}else selectNextQuestion();}
  else if(action==='start-again'){startSession(session.skillId);return;}
  else if(action==='export'){exportData(data);alertMessage='Progress backup exported. Keep it somewhere safe.';}
  render();
});
root.addEventListener('input',e=>{
  if(!session || session.phase!=='question' || session.done)return;
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
