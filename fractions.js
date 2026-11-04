/** Reliable, deterministic fraction maths. Correctness is never decided by a language model. */
export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
export function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
export function simplify({ n, d }) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0) throw new Error('Invalid fraction');
  if (d < 0) { n = -n; d = -d; }
  const factor = gcd(n, d);
  return { n: n / factor, d: d / factor };
}
export function addFractions(a, b) { return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d }); }
export function equalFractions(a, b) {
  if (![a.n,a.d,b.n,b.d].every(Number.isSafeInteger) || a.d === 0 || b.d === 0) return false;
  return a.n * b.d === b.n * a.d;
}
export const fmt = f => `${f.n}/${f.d}`;
export function workedSolution(q) {
  const d = lcm(q.a.d, q.b.d);
  const an = q.a.n * (d / q.a.d);
  const bn = q.b.n * (d / q.b.d);
  const total = an + bn;
  const reduced = simplify({ n: total, d });
  const end = (total !== reduced.n || d !== reduced.d) ? ` Simplify ${total}/${d} to ${fmt(reduced)}.` : '';
  return `Use ${d} as the common denominator. ${fmt(q.a)} = ${an}/${d} and ${fmt(q.b)} = ${bn}/${d}. Add the top numbers: ${an}/${d} + ${bn}/${d} = ${total}/${d}.${end}`;
}
export function hintFor(q, level=1) {
  const d = lcm(q.a.d, q.b.d);
  if(level===1) return `Look for a number that both ${q.a.d} and ${q.b.d} divide into. Then rewrite both fractions with that number at the bottom.`;
  return `Try ${d} as a common denominator. How many ${d}ths are in ${fmt(q.a)} and ${fmt(q.b)}?`;
}

export const bank = [
  {id:'f01',difficulty:1,a:{n:1,d:2},b:{n:1,d:4}},
  {id:'f02',difficulty:1,a:{n:1,d:3},b:{n:1,d:6}},
  {id:'f03',difficulty:1,a:{n:1,d:4},b:{n:1,d:8}},
  {id:'f04',difficulty:1,a:{n:1,d:2},b:{n:1,d:6}},
  {id:'f05',difficulty:1,a:{n:2,d:5},b:{n:1,d:10}},
  {id:'f06',difficulty:1,a:{n:1,d:3},b:{n:2,d:9}},
  {id:'f07',difficulty:2,a:{n:1,d:3},b:{n:1,d:4}},
  {id:'f08',difficulty:2,a:{n:1,d:2},b:{n:1,d:5}},
  {id:'f09',difficulty:2,a:{n:1,d:4},b:{n:1,d:6}},
  {id:'f10',difficulty:2,a:{n:2,d:3},b:{n:1,d:6}},
  {id:'f11',difficulty:2,a:{n:2,d:5},b:{n:1,d:3}},
  {id:'f12',difficulty:3,a:{n:2,d:3},b:{n:3,d:4}},
  {id:'f13',difficulty:3,a:{n:3,d:5},b:{n:1,d:6}},
  {id:'f14',difficulty:3,a:{n:1,d:4},b:{n:2,d:5}},
  {id:'f15',difficulty:3,a:{n:2,d:3},b:{n:2,d:5}},
  {id:'f16',difficulty:4,a:{n:5,d:6},b:{n:3,d:8}},
  {id:'f17',difficulty:4,a:{n:4,d:5},b:{n:5,d:12}},
  {id:'f18',difficulty:4,a:{n:7,d:8},b:{n:2,d:3}}
];

export function chooseQuestion(seenIds, desiredDifficulty, random=Math.random) {
  const unseen = bank.filter(q => !seenIds.includes(q.id));
  if(!unseen.length) return null;
  const distance = Math.min(...unseen.map(q=>Math.abs(q.difficulty-desiredDifficulty)));
  const eligible = unseen.filter(q=>Math.abs(q.difficulty-desiredDifficulty)===distance);
  return eligible[Math.floor(random() * eligible.length)];
}
