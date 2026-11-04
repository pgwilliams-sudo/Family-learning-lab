import {addFractions, lcm, fmt, bank} from './fractions.js';
import {initialDifficulty} from './adaptive.js';

export const RECENT_QUESTION_LIMIT = 12;
const prefix = 'maths.fractions.';
const seedPairs = [[2,4],[3,6],[4,8],[5,10],[3,9],[4,12],[5,15],[6,12]];
// Age sets the ceiling, never the starting level. Both learners can revisit basics.
export function difficultyFor(progress, year='Year 6') {
  return Math.min(year==='Year 9'?4:3, initialDifficulty(progress?.mastery ?? 25));
}
const bounds = {
  1:{denominator:12, common:30, factor:3},
  2:{denominator:16, common:60, factor:4},
  3:{denominator:20, common:120, factor:5},
  4:{denominator:24, common:144, factor:6}
};
const cache = new Map();
const legacyAdditionIds=new Map(bank.map(q=>[`addition:${q.a.n}:${q.a.d}:${q.b.n}:${q.b.d}`,q.id]));
export function questionPool(skillId, difficulty=1) {
  if(!['equivalent','common-denominator','add-unlike'].some(s=>skillId===prefix+s)) throw new Error('Unknown fraction skill');
  if(!bounds[difficulty]) throw new Error('Invalid question difficulty');
  const key=`${skillId}:${difficulty}`;
  if(cache.has(key)) return cache.get(key);
  const limit=bounds[difficulty];
  const questions=new Map();
  function add(a,b,n=1,m=1) {
    if(difficulty>1) {
      const minimum=[0,0,3,5,8][difficulty];
      if(a<minimum || (skillId!==prefix+'common-denominator' && n<difficulty-1))return;
      if(skillId===prefix+'equivalent' && b/a<Math.max(2,difficulty))return;
    }
    let q;
    if(skillId===prefix+'equivalent') {
      if(b%a || b/a>limit.factor || b>limit.common)return;
      q={id:`equivalent:${n}:${a}:${b}`,skillId,kind:'equivalent',a:{n,d:a},target:b,prompt:`Write ${n}/${a} with denominator ${b}.`,answer:{n:n*(b/a),d:b}};
    } else if(skillId===prefix+'common-denominator') {
      q={id:`denominator:${a}:${b}`,skillId,kind:'denominator',a:{n:1,d:a},b:{n:1,d:b},prompt:`Give a common denominator for 1/${a} and 1/${b}. Enter a whole number.`,answer:lcm(a,b)};
    } else {
      const first={n,d:a},second={n:m,d:b};
      q={id:`addition:${n}:${a}:${m}:${b}`,skillId,kind:'addition',a:first,b:second,prompt:`What is ${fmt(first)} + ${fmt(second)}?`,answer:addFractions(first,second)};
    }
    for(const value of [q.a,q.b,q.answer])if(value&&typeof value==='object')Object.freeze(value);
    questions.set(q.id,Object.freeze({...q,difficulty,rewardId:legacyAdditionIds.get(q.id)||q.id}));
  }
  if(difficulty===1)for(const [a,b] of seedPairs) add(a,b);
  for(let a=2;a<=limit.denominator;a++) for(let b=a+1;b<=(skillId===prefix+'equivalent'?limit.common:limit.denominator);b++) {
    if(lcm(a,b)>limit.common)continue;
    const maxN=skillId===prefix+'common-denominator'?1:Math.min(difficulty===4?a+2:a-1,difficulty===4?8:difficulty+1);
    for(let n=1;n<=maxN;n++) for(let m=1;m<=Math.min(b-1,difficulty+1);m++) add(a,b,n,m);
  }
  const pool=Object.freeze([...questions.values()]);cache.set(key,pool);return pool;
}
export function questionFor(skillId, index=0, difficulty=1) {
  const pool=questionPool(skillId,difficulty);
  return pool[((index%pool.length)+pool.length)%pool.length];
}
export function selectQuestion(skillId, {progress, year, seen=[], random=Math.random}={}) {
  const difficulty=difficultyFor(progress,year);
  const excluded=new Set([...seen,...(progress?.recentQuestionIds||[]).slice(-RECENT_QUESTION_LIMIT)]);
  const available=questionPool(skillId,difficulty).filter(q=>!excluded.has(q.id));
  if(!available.length)return null;
  return available[Math.min(available.length-1,Math.max(0,Math.floor(random()*available.length)))];
}
