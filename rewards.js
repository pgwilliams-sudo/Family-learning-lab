/** Child-friendly, deterministic rewards. Never award points for merely opening a page.
 * Awards are keyed by learner (by storage caller), skill, question and local calendar day.
 * This is a motivation system, deliberately not an academic proficiency score.
 */
export const DAILY_XP_CAP = 100;
export const XP_PER_LEVEL = 100;
export const BADGES = Object.freeze([
  {id:'first-step', icon:'🌱', title:'First step', description:'Completed your first question'},
  {id:'independent-thinker', icon:'🧠', title:'Independent thinker', description:'Solved five questions without hints'},
  {id:'keep-going', icon:'💪', title:'Keep going', description:'Kept practising through five challenging questions'},
  {id:'three-days', icon:'🌟', title:'Curious explorer', description:'Practised on three different days'},
  {id:'first-lesson', icon:'🏅', title:'Lesson finisher', description:'Finished your first lesson'},
  {id:'skill-builder', icon:'🏆', title:'Skill builder', description:'Reached 75% estimated mastery in a skill'}
]);
export const defaultRewards = () => ({xp:0, credited:{}, activeDays:[], badges:[], independentAnswers:0, supportedAnswers:0, completedLessons:0});
export const levelForXP = xp => Math.floor(Math.max(0,xp)/XP_PER_LEVEL)+1;
export const xpIntoLevel = xp => Math.max(0,xp)%XP_PER_LEVEL;
export function localDay(date=new Date()) {
  if(!(date instanceof Date) || Number.isNaN(date.getTime())) throw new Error('Invalid date');
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
const safeState = original => {
  const d=defaultRewards();
  if(!original || typeof original!=='object') return d;
  return {...d,...original,
    xp:Number.isFinite(original.xp)?Math.max(0,original.xp):0,
    credited:{...(original.credited||{})},
    badges:Array.isArray(original.badges)?[...original.badges]:[],
    activeDays:Array.isArray(original.activeDays)?[...original.activeDays]:[]};
};
function unlock(s,id){if(!s.badges.includes(id)){s.badges.push(id);return id;}return null;}
/** A question earns points once per local day, including when repeated in another lesson.
 * Returning on another day is worthwhile retrieval practice; daily earnings are capped.
 */
export function awardQuestion(original,{skillId,questionId,correct,independent,difficulty=1,date=new Date()}) {
  if(!skillId || !questionId) throw new Error('Question needs skill and ID');
  const state=safeState(original),day=localDay(date),key=`${day}:${skillId}:${questionId}`;
  if(Object.hasOwn(state.credited,key)) return {state,earned:0,unlocked:[],reason:'Already rewarded for this question today'};
  const dayEarned=Object.entries(state.credited).filter(([key])=>key.startsWith(`${day}:`)).reduce((sum,[,v])=>sum+v,0);
  const base=correct?(independent?12:6):2;
  const stretch=correct&&independent&&difficulty>=3?4:0;
  const earned=Math.max(0,Math.min(DAILY_XP_CAP-dayEarned,base+stretch));
  // Record the encounter even once the cap is reached, so refreshes cannot reset it.
  state.credited[key]=earned;
  state.xp+=earned;
  if(!state.activeDays.includes(day))state.activeDays.push(day);
  if(independent&&correct)state.independentAnswers++;
  else state.supportedAnswers++;
  const unlocked=[];
  for(const id of [
    'first-step',
    ...(state.independentAnswers>=5?['independent-thinker']:[]),
    ...(state.supportedAnswers>=5?['keep-going']:[]),
    ...(state.activeDays.length>=3?['three-days']:[])
  ]) {const added=unlock(state,id);if(added)unlocked.push(added);}
  return {state,earned,unlocked,reason:earned?'Points earned':'Daily points limit reached'};
}
export function awardLessonComplete(original,{mastery=0}={}){
  const state=safeState(original);state.completedLessons++;
  const unlocked=[];
  for(const id of ['first-lesson',...(mastery>=75?['skill-builder']:[])]){const added=unlock(state,id);if(added)unlocked.push(added);}
  return {state,unlocked};
}
export function badgeDetails(id){return BADGES.find(b=>b.id===id);}
