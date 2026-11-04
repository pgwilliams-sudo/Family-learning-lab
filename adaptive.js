/** Small interpretable adaptive policy. Replace independently of the UI as the app grows. */
export const SESSION_QUESTIONS = 6;
export const defaultSkillProgress = () => ({mastery:25, attempts:0, correct:0, independent:0, hints:0, recent:[], lastPractised:null});
export function initialDifficulty(mastery=25) {
  return mastery >= 80 ? 4 : mastery >= 55 ? 3 : mastery >= 35 ? 2 : 1;
}
export function evaluateAttempt(progress, outcome, at=new Date().toISOString()) {
  const p = { ...defaultSkillProgress(), ...progress };
  const { correct, attempts, hint } = outcome;
  const independent = correct && attempts === 1 && !hint;
  const change = independent ? 15 : correct ? 6 : -8;
  return {
    ...p,
    mastery: Math.min(100,Math.max(0,p.mastery+change)),
    attempts:p.attempts+1,
    correct:p.correct+(correct?1:0),
    independent:p.independent+(independent?1:0),
    hints:p.hints+(hint?1:0),
    recent:[...p.recent,{correct,independent,hint,date:at}].slice(-20),
    lastPractised:at
  };
}
export function nextDifficulty(current, streak, outcome) {
  if(!outcome.correct) return Math.max(1,current-1);
  if(outcome.hint || outcome.attempts>1) return current;
  return streak>=2 ? Math.min(4,current+1) : current;
}
export function advice(progress) {
  if(!progress || progress.attempts===0) return 'Start with a short diagnostic to find a useful starting point.';
  if(progress.mastery<45) return 'Work on changing fractions into equal-sized pieces, with more guided examples.';
  if(progress.mastery<75) return 'Keep practising common denominators, then try sums with two-digit denominators.';
  return 'Try multi-step fraction problems and revisit this skill later to check retention.';
}
