import {reviewableIndexes,gradeExtended} from './extended-marking.js';
import {mark} from './engine.js';

export function extendedReviewMarkup(state,esc){
 const all=reviewableIndexes(state.test);
 if(!all.length)return '<p>No written answers need reviewing.</p>';
 const index=all.includes(state.current)?state.current:all[0];
 const pos=all.indexOf(index),q=state.test.questions[index],marks=state.manual[index]||[];
 const complete=all.filter(i=>state.reviewed[i]).length;
 const final=q.type==='multi-number'?(mark(q,state.answers[index])?'1 automatic answer mark':'0 automatic answer marks'):'Written answer: all marks use the checklist';
 const example=q.type==='multi-number'?q.workingExample:q.example;
 return `<section class="exam-head"><div><span class="eyebrow">GUIDED MARKING · NOT OFFICIAL SATs MARKING</span><h1>Review answer ${pos+1} of ${all.length}</h1></div><span class="counter">${complete}/${all.length} reviewed</span></section>
 <div class="progress"><span style="width:${complete/all.length*100}%"></span></div>
 <section class="panel marking-intro"><p>Read Kodjo’s answer alongside the example and choose each mark point that is genuinely supported. Equivalent wording and valid alternative methods count. A parent should help with borderline answers.</p><p><strong>Automatic text marking is not used.</strong> These are guided practice marks, not official SATs scores.</p></section>
 <section class="question review-question"><div class="eyebrow">${esc(q.section)} · ${esc(q.skill)} · ${q.marks} marks available</div><h2>${esc(q.prompt)}</h2>
 ${q.passage?`<details class="review-passage"><summary>Read the passage again: ${esc(q.passageTitle)}</summary><p>${esc(q.passage)}</p></details>`:''}
 <div class="submitted-answer"><strong>Answer submitted</strong><p>${esc(state.answers[index]||'(no answer submitted)')}</p></div>
 ${q.type==='multi-number'?`<div class="submitted-answer"><strong>Working shown</strong><p>${esc(state.workings[index]||'(no working recorded)')}</p></div>`:''}
 <div class="worked-example"><strong>${q.type==='multi-number'?'Suggested working and correct answer':'Example of an acceptable response'}</strong><p>${esc(example||'')}</p>${q.type==='multi-number'?`<p><strong>Final answer: ${esc(q.answer)} ${esc(q.unit||'')}</strong></p>`:''}</div>
 <p class="note">${esc(final)}. Each checked point below is worth one additional mark. ${q.type==='written'?'A blank answer earns zero regardless of selections.':'Method marks require actual written working.'}</p>
 <div class="mark-criteria">${q.criteria.map((criterion,i)=>`<button type="button" data-mark-criterion="${index}:${i}" class="${marks[i]?'chosen':''}" aria-pressed="${marks[i]?'true':'false'}"><span aria-hidden="true">${marks[i]?'☑':'☐'}</span> <span>${esc(criterion)}</span></button>`).join('')}</div>
 <button class="${state.reviewed[index]?'secondary':'primary'} mark-confirm" data-mark-confirm="${index}">${state.reviewed[index]?'✓ Reviewed (tap to edit)':'Confirm review of this answer'}</button></section>
 <div class="controls"><button class="secondary" data-mark-prev ${pos===0?'disabled':''}>← Previous</button>${pos===all.length-1?`<button class="primary" data-mark-finish ${complete!==all.length?'disabled':''}>Save practice marks →</button>`:`<button class="primary" data-mark-next>Next answer →</button>`}</div>`;
}
export function extendedResultIntro(record,esc){
 return `<p><strong>Marking:</strong> ${esc(record.markingMethod||'Guided adult / self-review')} using evidence and method checklists.</p><p class="note">These practice marks have not been checked by a professional SATs marker. A valid alternative explanation or working method may also earn credit.</p>`;
}
