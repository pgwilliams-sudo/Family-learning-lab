import {hintFor,workedSolution,fmt,addFractions} from '../engine/fractions.js';
/**
 * Content tutor for V1. The next phase can implement an LLM adapter returning this
 * same shape, but scoring and mastery remain deterministic. NEVER put API keys here.
 */
export function tutorReply(q,{kind,attempt=1}={}) {
  if(kind==='hint') return hintFor(q,attempt);
  if(kind==='try-again') return `Not quite. You're practising something tricky, and that's how it sticks. ${hintFor(q,attempt)}`;
  if(kind==='solved') return `You got it! ${workedSolution(q)}`;
  if(kind==='supported') return `Let's work through it together. ${workedSolution(q)} The answer is ${fmt(addFractions(q.a,q.b))}.`;
  return 'Try to make the pieces the same size before you add them.';
}
