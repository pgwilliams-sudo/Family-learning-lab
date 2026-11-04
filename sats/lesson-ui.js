import {lessonFor,remediationSummary} from './remediation.js';

const optionMarkup=(q,s,esc)=>(q.choices||[]).map((choice,i)=>'<button type="button" data-lesson-choice="'+i+'" class="'+(s.answer===choice?'selected':'')+'"><b>'+('ABCD'[i])+'</b> '+esc(choice)+'</button>').join('');

export function renderRemediation(s,esc){
 const spec=lessonFor(s.section,s.skill);
 let html='<div class="eyebrow">TARGETED SKILL PRACTICE · '+esc(s.section.toUpperCase())+'</div><h1>'+esc(spec.title)+'</h1>';
 if(s.stage==='teach'){
   html+='<div class="lesson-stage">STEP 1 OF 3 · LEARN</div>';
   html+='<section class="panel lesson-panel"><h2>Let’s work out the idea</h2><p>'+esc(spec.explanation)+'</p>';
   html+='<div class="worked-example"><strong>Worked example</strong><p>'+esc(spec.example)+'</p></div>';
   html+='<p><strong>A useful strategy:</strong> '+esc(spec.strategy)+'</p></section>';
   html+='<div class="controls"><button class="secondary" data-lesson-home>Back to SATs Centre</button><button class="primary" data-lesson-begin>Try a guided question →</button></div>';
   return html;
 }
 if(s.stage==='summary'){
   const result=remediationSummary(s);
   html+='<div class="lesson-stage">SKILL CHECK COMPLETE</div><section class="result-hero">';
   html+='<h2>'+(result.passed?'Two independent checks correct!':'Keep building this skill')+'</h2>';
   html+='<p>'+result.checksCorrect+' out of '+result.checksTotal+' independent checks correct · +'+(s.xpEarned||0)+' XP</p>';
   html+='<p>'+(result.passed?'We’ll revisit this skill in three days to see what has stuck.':'You have practised a useful skill. We’ll keep it on your revision list and revisit it with more support.')+'</p></section>';
   html+='<section class="panel"><h2>Remember this</h2><p>'+esc(spec.example)+'</p></section>';
   html+='<div class="controls"><button class="secondary" data-lesson-home>Back to SATs Centre</button><button class="primary" data-lesson-again>Practise another set →</button></div>';
   return html;
 }
 const guided=s.stage==='guided',q=s.questions[s.cursor];
 html+='<div class="lesson-stage">'+(guided?'STEP 2 OF 3 · PRACTISE WITH HELP':'STEP 3 OF 3 · INDEPENDENT CHECK '+s.cursor+'/2')+'</div>';
 html+='<section class="question lesson-question">';
 if(q.section==='reading')html+='<div class="passage"><span class="eyebrow">READ THE PASSAGE</span><h2>'+esc(q.passageTitle)+'</h2><p>'+esc(q.passage)+'</p></div>';
 html+='<div class="eyebrow">'+esc(q.section.toUpperCase())+' · '+esc(q.skill)+'</div>';
 html+='<h2>'+esc(q.prompt)+'</h2>';
 if(q.type==='choice')html+='<div class="choices">'+optionMarkup(q,s,esc)+'</div>';
 else if(q.type==='spelling')html+='<div class="spell"><button class="secondary" data-lesson-speak>🔊 Hear the word and sentence</button><p>'+esc(q.sentence)+'</p><small>Listen carefully, then type the missing word.</small><label class="answer-label" for="lesson-answer">Your spelling</label><input id="lesson-answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(s.answer)+'" '+(s.done?'disabled':'')+' /></div>';
 else html+='<label class="answer-label" for="lesson-answer">Your answer'+(q.type==='fraction'?' (e.g. 3/4 or 1 1/2)':'')+'</label><input id="lesson-answer" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="'+esc(s.answer)+'" '+(s.done?'disabled':'')+' />';
 if(s.feedback)html+='<div class="lesson-feedback" role="status">'+esc(s.feedback)+'</div>';
 if(s.done)html+='<div class="worked-example"><strong>Correct answer: '+esc(q.answer)+'</strong><p>'+esc(q.explanation)+'</p></div>';
 else if(guided)html+='<p class="hintless">This is practice. You can ask for a hint and try again.</p>';
 else html+='<p class="hintless">Two independent checks. Take your time; no hints in this part.</p>';
 html+='</section>';
 html+='<div class="controls"><button class="secondary" data-lesson-home>Back to SATs Centre</button><div class="lesson-actions">';
 if(!s.done){if(guided)html+='<button class="secondary" data-lesson-hint>Give me a hint</button>';html+='<button class="primary" data-lesson-submit>Check answer →</button>';}
 else html+='<button class="primary" data-lesson-next>'+(guided?'Try it independently →':s.cursor===1?'Next independent check →':'See your progress →')+'</button>';
 html+='</div></div>';
 return html;
}
