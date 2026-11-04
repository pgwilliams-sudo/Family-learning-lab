import {grammar,spellings,passages,MODULES} from './content.js';
import {createExtraReasoning} from './reasoning-extra.js';
import {LONG_PASSAGES} from './extended-reading.js';
import {createExtendedReasoning} from './extended-maths.js';
const randInt=(rng,min,max)=>min+Math.floor(rng()*(max-min+1));
const gcd=(a,b)=>b?gcd(b,a%b):a;
const fraction=(n,d)=>{const k=gcd(n,d);return `${n/k}/${d/k}`;};
function hashed(text){let x=2166136261;for(const c of String(text)){x^=c.charCodeAt(0);x=Math.imul(x,16777619);}return x>>>0;}
export function seeded(seed){let x=hashed(seed)||1;return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const q=(id,section,skill,prompt,answer,explanation,type='number')=>({id,section,skill,prompt,answer,explanation,type,marks:1});
const arith=[
 r=>{const a=randInt(r,1250,8999),b=randInt(r,150,2999);return q(`add-${a}-${b}`,'arithmetic','four operations',`Calculate ${a} + ${b}.`,a+b,`Add the columns carefully: ${a} + ${b} = ${a+b}.`);},
 r=>{const a=randInt(r,4000,12000),b=randInt(r,200,Math.min(a-1,3700));return q(`subtract-${a}-${b}`,'arithmetic','four operations',`Calculate ${a} − ${b}.`,a-b,`Subtract carefully, regrouping where needed: ${a-b}.`);},
 r=>{const a=randInt(r,24,398),b=randInt(r,12,49);return q(`multiply-${a}-${b}`,'arithmetic','multiplication',`Calculate ${a} × ${b}.`,a*b,`Use a written multiplication method: ${a} × ${b} = ${a*b}.`);},
 r=>{const divisor=randInt(r,3,14),quotient=randInt(r,26,169);return q(`divide-${divisor}-${quotient}`,'arithmetic','division',`Calculate ${divisor*quotient} ÷ ${divisor}.`,quotient,`Multiplication checks the result: ${quotient} × ${divisor} = ${divisor*quotient}.`);},
 r=>{const a=randInt(r,80,850),b=randInt(r,15,190),op=r()>.5?'+':'−';const total=op==='+'?a+b:a-b;return q(`decimal-${a}-${b}-${op}`,'arithmetic','decimals',`Calculate ${(a/100).toFixed(2)} ${op} ${(b/100).toFixed(2)}.`,total/100,`Align the decimal points: the answer is ${(total/100).toFixed(2)}.`);},
 r=>{const bases=[2,3,4,5,6,8,10,12];let d1=bases[randInt(r,0,5)],d2=bases[randInt(r,1,7)];if(d1===d2)d2=12;const n1=randInt(r,1,d1-1),n2=randInt(r,1,d2-1);const ans=fraction(n1*d2+n2*d1,d1*d2);return q(`fraction-${n1}-${d1}-${n2}-${d2}`,'arithmetic','fractions',`Calculate ${n1}/${d1} + ${n2}/${d2}. Give a fraction or mixed number.`,ans,`Use a common denominator: ${n1*d2}/${d1*d2} + ${n2*d1}/${d1*d2} = ${ans}.`,'fraction');},
 r=>{const percent=[10,20,25,50,75][randInt(r,0,4)];const base=randInt(r,4,40)*20;const ans=base*percent/100;return q(`percent-${percent}-${base}`,'arithmetic','percentages',`Find ${percent}% of ${base}.`,ans,`Divide by 100, then multiply by ${percent}: ${ans}.`);},
 r=>{const a=randInt(r,5,45),b=randInt(r,4,30),c=randInt(r,2,9);return q(`order-${a}-${b}-${c}`,'arithmetic','order of operations',`Calculate (${a} + ${b}) × ${c}.`,(a+b)*c,`Do the brackets first: ${a+b} × ${c} = ${(a+b)*c}.`);},
 r=>{const a=randInt(r,201,9899),place=r()>.5?100:1000;return q(`round-${a}-${place}`,'arithmetic','place value',`Round ${a} to the nearest ${place}.`,Math.round(a/place)*place,`Check the next place value to round to ${Math.round(a/place)*place}.`);},
 r=>{const a=randInt(r,12,597),factor=r()>.5?10:100;return q(`scale-${a}-${factor}`,'arithmetic','decimals',`Calculate ${(a/10).toFixed(1)} × ${factor}.`,a*factor/10,`Multiplying by ${factor} moves digits ${factor===10?1:2} place(s) to the left in a place-value chart.`);}
];
const reasoning=[
 r=>{const unit=randInt(r,4,16),count=randInt(r,3,9),cost=randInt(r,5,12)*5;return q(`cost-${unit}-${count}-${cost}`,'reasoning','multi-step problems',`A notebook costs £${(unit/2).toFixed(2)}. A shop sells ${count} notebooks. How much do they cost in total? Give the amount in pence.`,unit*50*count,`Convert £${(unit/2).toFixed(2)} to ${unit*50}p and multiply by ${count}. The answer is ${unit*50*count}p.`);},
 r=>{const a=randInt(r,3,8),b=randInt(r,2,7),k=randInt(r,4,14);return q(`ratio-${a}-${b}-${k}`,'reasoning','ratio',`Red and blue counters are in the ratio ${a}:${b}. There are ${(a+b)*k} counters altogether. How many are blue?`,b*k,`There are ${a+b} parts, so each part is ${k}. Blue has ${b} parts: ${b*k}.`);},
 r=>{const length=randInt(r,5,24),width=randInt(r,3,17);return q(`perimeter-${length}-${width}`,'reasoning','measurement',`A rectangle measures ${length} cm by ${width} cm. What is its perimeter in centimetres?`,2*(length+width),`Add all four sides: 2 × (${length} + ${width}) = ${2*(length+width)} cm.`);},
 r=>{const length=randInt(r,6,25),width=randInt(r,4,15);return q(`area-${length}-${width}`,'reasoning','measurement',`A rectangle is ${length} m long and ${width} m wide. Find its area in square metres.`,length*width,`Area = length × width = ${length*width} m².`);},
 r=>{const a=randInt(r,3,14),b=randInt(r,3,14),c=randInt(r,3,14);return q(`mean-${a}-${b}-${c}`,'reasoning','statistics',`Three teams score ${a*3}, ${b*3} and ${c*3} points. Find their mean score.`,a+b+c,`Add ${(a+b+c)*3} and divide by 3 to get ${a+b+c}.`);},
 r=>{const start=randInt(r,8,15)*60+randInt(r,0,3)*15,duration=randInt(r,3,13)*10;const h=Math.floor(start/60),m=start%60;return q(`time-${start}-${duration}`,'reasoning','time',`A journey begins at ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} and lasts ${duration} minutes. How many minutes after midnight does it finish?`,start+duration,`Convert the starting time to ${start} minutes after midnight, then add ${duration}.`);},
 r=>{const denominator=[4,5,8,10][randInt(r,0,3)],part=randInt(r,1,denominator-1),amount=denominator*randInt(r,8,32);return q(`of-${part}-${denominator}-${amount}`,'reasoning','fractions',`A class collects ${amount} bottle tops. ${part}/${denominator} are blue. How many are blue?`,amount/denominator*part,`Divide ${amount} by ${denominator} and multiply by ${part}.`);},
 r=>{const metres=randInt(r,2,18),cm=randInt(r,1,9)*10;return q(`convert-${metres}-${cm}`,'reasoning','measurement',`A rope is ${metres} m ${cm} cm long. What is its length in centimetres?`,metres*100+cm,`There are 100 cm in a metre: ${metres*100} + ${cm} = ${metres*100+cm} cm.`);},
 r=>{const x=randInt(r,2,14),y=randInt(r,2,14),z=randInt(r,2,14);return q(`data-${x}-${y}-${z}`,'reasoning','statistics',`A class survey records football: ${x+10}, basketball: ${y+10}, swimming: ${z+10}. How many more pupils chose football and basketball together than swimming?`,x+y-z+10,`Add ${x+10} + ${y+10}, then subtract ${z+10}. Result: ${x+y-z+10}.`);},
 r=>{const a=randInt(r,8,25),b=randInt(r,5,18),c=randInt(r,2,Math.min(7,Math.floor(a*b/10)));return q(`change-${a}-${b}-${c}`,'reasoning','multi-step problems',`A school has ${a} packs containing ${b} pencils each. It gives away ${c*10} pencils. How many remain?`,a*b-c*10,`Multiply first (${a} × ${b} = ${a*b}), then subtract ${c*10}.`);}
];
reasoning.push(...createExtraReasoning(randInt,q));
function shuffle(items,rng){const a=[...items];for(let i=a.length-1;i>0;i--){const j=randInt(rng,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
function bankPick(items,count,seen,rng,used){const unique=shuffle(items.filter(x=>!used.has(x.id)),rng);const fresh=unique.filter(x=>!seen.has(x.id));const old=unique.filter(x=>seen.has(x.id));const chosen=[...fresh,...old].slice(0,count);chosen.forEach(x=>used.add(x.id));return chosen;}
function maths(gen,count,seen,rng,used){
 const list=[];
 for(let pass=0;pass<3&&list.length<count;pass++){
   for(let tries=0;tries<1500&&list.length<count;tries++){
     const result=gen[randInt(rng,0,gen.length-1)](rng);
     if(used.has(result.id)||(pass===0&&seen.has(result.id)))continue;
     used.add(result.id);list.push(result);
   }
 }
 if(list.length!==count)throw Error('Unable to create enough unique maths questions');
 return list;
}
function reading(count,seen,rng,used){
 const ordered=shuffle(passages,rng).sort((a,b)=>{
   const ac=a.questions.filter((x,i)=>!seen.has(`read-${a.id}-${i}`)).length;
   const bc=b.questions.filter((x,i)=>!seen.has(`read-${b.id}-${i}`)).length;
   return bc-ac;
 });
 const chosen=[];
 for(const p of ordered){
   if(chosen.length>=count)break;
   const pool=p.questions.map(([skill,prompt,choices,answer,explanation],i)=>({
    id:`read-${p.id}-${i}`,section:'reading',skill,passageTitle:p.title,passage:p.text,
    prompt,choices,answer,explanation,type:'choice',marks:1
   }));
   const take=Math.min(4,count-chosen.length);
   chosen.push(...bankPick(pool,take,seen,rng,used));
 }
 if(chosen.length!==count)throw Error('Insufficient reading questions');
 return chosen;
}
// Produce three genuinely skill-specific follow-up items for a missed component.
// Each result uses the same deterministic marking as the original test.
export function practiceForSkill(skill,seed,recentIds=[],count=3,section=null){
 const rng=seeded(seed),seen=new Set(recentIds),used=new Set();
 const mathsTemplates=[...arith,...reasoning].filter(make=>{const item=make(seeded('detect-skill'));return item.skill===skill&&(!section||item.section===section);});
 if(mathsTemplates.length)return maths(mathsTemplates,count,seen,rng,used);
 const english=grammar.filter(item=>item.skill===skill);
 if(english.length&&(!section||section==='gps'))return bankPick(english,count,seen,rng,used);
 if(skill==='spelling'&&(!section||section==='spelling')){
   const words=spellings.map((item,i)=>({id:`spell-${i}`,section:'spelling',skill:'spelling',prompt:'Listen to the word and spell it.',type:'spelling',answer:item.word,sentence:item.sentence,explanation:`Correct spelling: ${item.word}.`,marks:1}));
   return bankPick(words,count,seen,rng,used);
 }
 const readSkills=new Set(['retrieval','inference','vocabulary','theme','purpose']);
 if(readSkills.has(skill)&&(!section||section==='reading')){
   const bank=passages.flatMap(p=>p.questions.map(([s,prompt,choices,answer,explanation],i)=>({
     id:`read-${p.id}-${i}`,section:'reading',skill:s,passageTitle:p.title,passage:p.text,prompt,choices,answer,explanation,type:'choice',marks:1
   }))).filter(item=>item.skill===skill);
   return bankPick(bank,count,seen,rng,used);
 }
 return [];
}

function extendedReading(seen,rng){
 const ranked=shuffle(LONG_PASSAGES,rng).sort((a,b)=>{
  const ac=a.questions.reduce((n,_,i)=>n+(seen.has(`ext-read-${a.id}-${i}`)?0:1),0);
  const bc=b.questions.reduce((n,_,i)=>n+(seen.has(`ext-read-${b.id}-${i}`)?0:1),0);
  return bc-ac;
 });
 return ranked.slice(0,2).flatMap(p=>p.questions.map((item,i)=>({
  ...item,id:`ext-read-${p.id}-${i}`,section:'reading',
  passageTitle:p.title,passage:p.text,genre:p.genre,level:p.level,
  explanation:item.explanation||item.example,
  marks:item.marks||1
 })));
}
function extendedReasoning(rng,seen){
 const generators=shuffle(createExtendedReasoning(randInt),rng).slice(0,9);
 return generators.map(make=>{
  let q=make(rng);
  for(let attempt=0;attempt<30&&seen.has(q.id);attempt++)q=make(rng);
  return q;
 });
}

export function buildTest(mode,seed,recentIds=[]){
 if(!MODULES.some(m=>m.id===mode))throw Error('Unknown SATs module');
 const rng=seeded(seed),seen=new Set(recentIds),used=new Set(),questions=[];
 const add=(qs)=>questions.push(...qs);
 if(mode==='daily'){
   add(maths(arith,4,seen,rng,used));
   add(maths(reasoning,3,seen,rng,used));
   add(bankPick(grammar,2,seen,rng,used));
   add(reading(2,seen,rng,used));
   add(bankPick(spellings.map((s,i)=>({id:`spell-${i}`,section:'spelling',skill:'spelling',prompt:'Listen to the word and spell it.',type:'spelling',answer:s.word,sentence:s.sentence,explanation:`Correct spelling: ${s.word}.`,marks:1})),1,seen,rng,used));
 } else if(mode==='reading-extended')add(extendedReading(seen,rng));
 else if(mode==='reasoning-extended')add(extendedReasoning(rng,seen));
 else if(mode==='arithmetic')add(maths(arith,12,seen,rng,used));
 else if(mode==='reasoning')add(maths(reasoning,10,seen,rng,used));
 else if(mode==='fractions'){add(maths([arith[5],arith[6]],6,seen,rng,used));add(maths([reasoning[6]],4,seen,rng,used));}
 else if(mode==='gps')add(bankPick(grammar,12,seen,rng,used));
 else if(mode==='reading')add(reading(8,seen,rng,used));
 else if(mode==='spelling')add(bankPick(spellings.map((s,i)=>({id:`spell-${i}`,section:'spelling',skill:'spelling',prompt:'Listen to the word and spell it.',type:'spelling',answer:s.word,sentence:s.sentence,explanation:`Correct spelling: ${s.word}.`,marks:1})),10,seen,rng,used));
 return {mode,seed,questions,createdAt:new Date().toISOString()};
}
function fracNumber(value){
 const s=String(value??'').trim().replace(/,/g,'');
 const match=s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
 if(match){const whole=Number(match[1]),top=Number(match[2]),bottom=Number(match[3]);return bottom?whole+Math.sign(whole||1)*top/bottom:NaN;}
 const simple=s.match(/^(-?\d+)\s*\/\s*(-?\d+)$/);if(simple){const d=Number(simple[2]);return d?Number(simple[1])/d:NaN;}
 if(!/^[-+]?\d+(?:\.\d+)?$/.test(s))return NaN;
 return Number(s);
}
export function mark(q,response){
 if(response===undefined||String(response).trim()==='')return false;
 if(q.type==='choice')return String(response)===String(q.answer);
 if(q.type==='spelling')return String(response).trim().toLowerCase()===q.answer.toLowerCase();
 if(q.type==='multi-number'){
   const unit=String(q.unit||'');
   let value=String(response).trim();
   if(unit==='£')value=value.replace(/^£\s*/,'').replace(/\s*£$/,'');
   else if(unit&&value.toLowerCase().endsWith(unit.toLowerCase()))value=value.slice(0,-unit.length).trim();
   response=value;
 }
 const a=fracNumber(response),b=fracNumber(q.answer);
 return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-8;
}
export function breakdown(test,answers){
 return test.questions.reduce((stats,q,i)=>{const key=q.skill;stats[key]??={correct:0,total:0,section:q.section};stats[key].total++;if(mark(q,answers[i]))stats[key].correct++;return stats;},{});
}
