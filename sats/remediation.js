import {practiceForSkill,mark} from './engine.js';

const LESSONS = {
 'four operations':['Column calculations','Line up digits by place value. Work from right to left and regroup when needed.','For 1,368 + 457, add the ones, then tens, hundreds and thousands. The answer is 1,825.','Estimate first, then check your written calculation.','Line up the digits in columns, with ones beneath ones.'],
 'multiplication':['Multiply in parts','Break a bigger number into tens and ones before multiplying.','For 36 × 14, calculate 36 × 10 = 360 and 36 × 4 = 144. Add them to get 504.','Use a grid or a compact written multiplication method.','Split one factor into tens and ones.'],
 'division':['Division and checking','Divide in stages, keeping track of remainders. Check using multiplication.','For 156 ÷ 6, 6 × 20 = 120 and 6 × 6 = 36, so 156 ÷ 6 = 26.','Look for multiples of the divisor.','Ask which multiplication fact gets close to the number.'],
 'decimals':['Line up decimal places','Keep tenths, hundredths and whole numbers in their correct columns.','3.45 + 0.8 = 3.45 + 0.80 = 4.25.','Add zeros when they help you line up place values.','Write both numbers with the same number of decimal places.'],
 'fractions':['Equal-sized fraction pieces','Find a common denominator before adding. To find a fraction of a number, divide by the bottom number and multiply by the top.','1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2. Also, 3/4 of 20 = 20 ÷ 4 × 3 = 15.','Use a strip drawing to see the equal-sized pieces.','Change fractions to equivalent ones with matching denominators.'],
 'percentages':['Percent means out of 100','Break a percentage into easy parts such as 10%, 25% and 50%. For a discount, subtract the amount saved.','25% of 80 is one quarter of 80, which is 20. If £80 is discounted by 25%, the new price is £60.','Draw a bar split into four equal parts for 25%.','Find 10% or 25% first, then build the amount you need.'],
 'order of operations':['The order matters','Brackets come first. Then multiply and divide before adding and subtracting.','(7 + 5) × 3 = 12 × 3 = 36, not 7 + 15.','Circle any brackets before calculating.','Calculate inside brackets before doing anything outside.'],
 'place value':['Know the value of each digit','To round, check the digit immediately to the right of the place you are rounding to.','Round 6,482 to the nearest hundred: the tens digit is 8, so the answer is 6,500.','Mark the place you are rounding to.','Look one digit to the right: 5 or above means round up.'],
 'multi-step problems':['Work one step at a time','Underline what you need to find, list the operations and calculate in order.','If 8 packs hold 12 pencils each and 15 are given away, start with 8 × 12 = 96, then do 96 − 15 = 81.','Write a number sentence for each step.','Ask: what needs to be calculated first?'],
 'ratio':['Ratio as equal parts','Add the ratio parts, find the size of one part, then find the requested share.','Red:blue = 3:2 with 25 counters. There are 5 parts, each worth 5. Blue = 2 × 5 = 10.','Draw equal boxes for the ratio parts.','Add the ratio numbers to find how many equal parts there are.'],
 'measurement':['Check the units','Read what unit the answer needs. Convert before adding or comparing lengths, mass or capacity.','3 m 40 cm is 340 cm because each metre contains 100 cm.','Write units next to each step so you do not mix them up.','Are both amounts in the same units?'],
 'statistics':['Read the data carefully','For a mean, divide the total by the number of values. For a range, subtract lowest from highest.','Scores 4, 8 and 12 have a mean of (4+8+12)÷3 = 8 and a range of 12−4 = 8.','Choose mean, total or range according to the question.','For range: biggest minus smallest. For mean: total divided by count.'],
 'time':['Work in minutes','Convert hours to minutes when adding time intervals. Remember there are 60 minutes in an hour.','14:20 is 14×60+20 = 860 minutes after midnight. Add 45 minutes to get 905.','Draw a timeline and jump in sensible chunks.','Multiply hours by 60 before adding minutes.'],
 'geometry':['Shape facts and formulae','A triangle has angles totalling 180°; a quadrilateral has 360°. Area of a triangle is base × perpendicular height ÷ 2.','A triangle with base 8 cm and height 5 cm has area 8×5÷2 = 20 cm².','Sketch the shape and label what is known.','Use the total angle rule or area formula that matches the shape.'],
 'volume':['Count cubic units','Cuboid volume is length × width × height. The unit is cubic, not square.','A box 5 cm by 4 cm by 3 cm holds 5×4×3 = 60 cm³.','Imagine layers of cubes stacked up.','Multiply all three dimensions.'],
 'scaling':['Use the scale consistently','If every map centimetre represents several kilometres, multiply the map distance by that number.','With 1 cm = 6 km, a 4 cm line represents 24 km.','Write the relationship 1 cm → ? km first.','How many real-world units does each map unit represent?'],
 'coordinates':['First x, then y','Coordinates are written (x, y). Moving right increases x; moving down decreases y.','From (3, 5), move 4 right to (7, 5). Move 2 down to (7, 3).','Track the direction before calculating.','Right and left affect x; up and down affect y.'],
 'money':['Work out cost, then change','Multiply each ticket or item price by the number bought. Add totals, then subtract from the money paid.','Three £6 tickets and two £4 tickets cost £26. Change from £30 is £4.','Make a small table of quantity, price and total.','Calculate the total spent before subtracting.'],
 'word classes':['What job does the word do?','Nouns name things, verbs show actions or states, adjectives describe nouns and adverbs often describe how.','In “The quick fox ran swiftly”, quick is an adjective and swiftly is an adverb.','Read the whole sentence before deciding.','Ask what the word is describing or doing.'],
 'clauses':['Main and subordinate clauses','A main clause can stand alone. A subordinate clause adds information but depends on the main one.','In “Although it rained, we played”, “we played” is the main clause.','Find the part that makes sense as a complete sentence.','Could this group of words be a sentence on its own?'],
 'punctuation':['Punctuation adds meaning','Commas separate clauses or introductory phrases. Colons introduce explanations or lists, and apostrophes can show possession.','After lunch, we played. The teacher’s book was on the desk.','Read the sentence aloud to hear its structure.','Ask whether you need a pause, a quotation or possession.'],
 'verb tense':['Know when an action happens','Past progressive uses was or were + -ing. Present perfect uses have or has + a past participle.','“She was running” is past progressive. “She has run” is present perfect.','Look for the helping verbs first.','Find words like was, were, have or has.'],
 'conjunctions':['Connect ideas','Coordinating conjunctions join equal ideas: and, but, or. Subordinating conjunctions introduce a dependent clause: because, although, when.','“I walked because the bus was late” uses because to show a reason.','Look at the relationship between the ideas.','Does the word join two equal ideas or add a reason or time?'],
 'active and passive':['Who does the action?','In an active sentence, the subject performs the action. In a passive sentence, the subject receives it.','Active: “Sam opened the door.” Passive: “The door was opened by Sam.”','Find the action and ask who receives it.','Look for was/were followed by a past participle.'],
 'pronouns':['Replace a noun clearly','Pronouns stand in for nouns. Subject pronouns include I, we and they; object pronouns include me, us and them.','“Leah and I ran” becomes “We ran.” “The prize was for Leah and me” uses me.','Try replacing the names with just the pronoun.','Ask whether it is doing the action or receiving it.'],
 'synonyms':['Find a similar meaning','A synonym has a similar meaning, although it may have a slightly different shade of meaning.','“Reluctant” is close to “unwilling”, not “eager”.','Put each possible word into the original sentence.','Which option keeps the sentence meaning closest?'],
 'antonyms':['Find the opposite','An antonym has the opposite or a contrasting meaning.','“Scarce” means limited, so its antonym is “plentiful”.','Check each choice against the original meaning.','Imagine a situation with the opposite quality.'],
 'word families':['Look for the word root','Prefixes go at the front; suffixes go at the end. Both can change a word’s meaning or job.','“Teach” + “-er” makes “teacher”; “re-” + “write” means write again.','Underline the root before examining the extra letters.','What does the prefix or suffix contribute?'],
 'agreement':['Match subject and verb','Singular subjects normally need singular verbs; plural subjects normally take plural verbs.','“The basket of apples is heavy” because basket is the subject.','Ignore extra phrases between subject and verb.','Which noun actually controls the verb?'],
 'vocabulary':['Use clues from context','Read the surrounding sentence. Consider which meaning makes sense there.','“The route was hazardous, so the walkers moved carefully” suggests hazardous means dangerous.','Check if the sentence still makes sense with your chosen word.','Look for clues in nearby words.'],
 'retrieval':['Find it in the text','Retrieval questions ask for information directly stated in the passage. Scan for a key word, then read the sentence around it.','If a text says “The train left at dawn”, the answer to “When did it leave?” is “at dawn”.','Point to the exact words that prove your answer.','Find a phrase from the question in the passage.'],
 'inference':['Be a reading detective','An inference uses clues in the text plus careful reasoning. Pick an answer you can support with evidence.','If a character grips a letter tightly and hesitates to open it, they may be nervous. The actions are clues.','Ask: what does the character do and what might that mean?','Use a specific action or phrase to support the idea.'],
 'theme':['Find the bigger message','The theme is the idea running through the whole story, not just one event.','A character keeps trying after mistakes. The theme might be perseverance.','Think about how the character changes by the end.','What lesson or big idea connects the beginning and ending?'],
 'purpose':['Why did the writer include it?','An author might explain, persuade, entertain or emphasise a point. Ask what a detail adds to the reader’s understanding.','A scientist’s final quotation can sum up the message of an article.','Look at the paragraph before and after the detail.','What would readers miss if the detail were removed?'],
 'spelling':['Look, cover, write, check','Listen to the sounds, notice tricky letter patterns and write the word from memory. Then compare it carefully.','For “necessary”, remember one c and two s letters.','Say the word in syllables, then check one tricky part at a time.','Listen to the word and sentence again before spelling.']
};
export const lessonKey=(section,skill)=>`${section}::${skill}`;
export function parseLessonKey(key){const i=String(key).indexOf('::');if(i<0)return null;return {section:key.slice(0,i),skill:key.slice(i+2)};}
export function lessonFor(section,skill){
 const detail=LESSONS[skill]||LESSONS.vocabulary;
 return {section,skill,title:detail[0],explanation:detail[1],example:detail[2],strategy:detail[3],hint:detail[4]};
}
export function missedSkills(record){
 const groups=new Map();
 record.test.questions.forEach((item,i)=>{
   const id=lessonKey(item.section,item.skill);
   if(!groups.has(id))groups.set(id,{id,section:item.section,skill:item.skill,wrong:0,total:0});
   const bucket=groups.get(id);bucket.total++;
   const awarded=record.marksByQuestion?record.marksByQuestion[i]:(mark(item,record.answers[i])?1:0);
   if(awarded<(item.marks||1))bucket.wrong++;
 });
 return [...groups.values()].filter(x=>x.wrong>0).sort((a,b)=>b.wrong-a.wrong||a.total-b.total||a.id.localeCompare(b.id));
}
export function createRemediation(section,skill,seed,excludedIds=[],at=new Date().toISOString()){
 const questions=practiceForSkill(skill,seed,excludedIds,3,section);
 if(questions.length!==3 || new Set(questions.map(x=>x.id)).size!==3)throw Error('Not enough distinct questions for '+lessonKey(section,skill));
 return {section,skill,stage:'teach',questions,cursor:0,tries:0,hint:false,done:false,answer:'',feedback:'',outcomes:[],startedAt:at};
}
export function beginRemediation(s){
 if(s.stage!=='teach')return false;
 s.stage='guided';s.cursor=0;s.tries=0;s.hint=false;s.done=false;s.answer='';s.feedback='';return true;
}
export function useHint(s){
 if(s.stage!=='guided'||s.done)return false;
 s.hint=true;s.feedback=lessonFor(s.section,s.skill).hint;return true;
}
export function submitRemediation(s,response){
 if(!['guided','check'].includes(s.stage)||s.done)return {accepted:false};
 if(String(response??'').trim()==='')return {accepted:false};
 const question=s.questions[s.cursor],correct=mark(question,response);
 s.answer=String(response);s.tries++;
 if(s.stage==='guided'&&!correct&&s.tries===1){
   s.feedback='Try once more. '+lessonFor(s.section,s.skill).hint;
   return {accepted:true,done:false,correct:false};
 }
 s.done=true;
 const independent=s.stage==='check'&&correct;
 s.outcomes.push({id:question.id,skill:s.skill,section:s.section,stage:s.stage,correct,independent,hint:s.hint,attempts:s.tries});
 s.feedback=(correct?'That works! ':'We can learn from this. ')+question.explanation;
 return {accepted:true,done:true,correct,independent};
}
export function nextRemediation(s){
 if(!s.done)return false;
 if(s.stage==='guided'){s.stage='check';s.cursor=1;}
 else if(s.stage==='check'&&s.cursor===1)s.cursor=2;
 else if(s.stage==='check'&&s.cursor===2){s.stage='summary';return true;}
 else return false;
 s.tries=0;s.hint=false;s.done=false;s.answer='';s.feedback='';return true;
}
export function remediationSummary(s,at=new Date().toISOString()){
 if(s.stage!=='summary')return null;
 const checks=s.outcomes.filter(x=>x.stage==='check');
 const passed=checks.length===2&&checks.every(x=>x.correct&&x.independent);
 return {key:lessonKey(s.section,s.skill),skill:s.skill,section:s.section,passed,checksCorrect:checks.filter(x=>x.correct).length,checksTotal:checks.length,reviewAt:passed?new Date(Date.parse(at)+3*86400000).toISOString():null,endedAt:at};
}
