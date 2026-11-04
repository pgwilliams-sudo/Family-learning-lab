// Additional original, independently marked English questions.
// Several categories are deliberately expanded to support three-question remediation.
const Q=(id,skill,prompt,choices,answer,explanation)=>({id,skill,prompt,choices,answer,explanation,section:'gps',type:'choice',marks:1});
export const extraGrammar=[
Q('gps31','conjunctions','Which word is a coordinating conjunction?',['although','because','but','while'],'but','But joins two ideas of equal importance.'),
Q('gps32','conjunctions','Complete the sentence: “We stayed indoors ___ the storm passed.”',['until','and','or','nor'],'until','Until introduces a subordinate time clause.'),
Q('gps33','conjunctions','Which sentence uses a subordinating conjunction?',['The shop was busy and noisy.','I stayed because it was raining.','Tina ran but fell.','He brought apples and pears.'],'I stayed because it was raining.','Because begins a clause explaining a reason.'),
Q('gps34','active and passive','Which sentence is in the active voice?',['The window was opened by Sam.','The poem was written yesterday.','Sam opened the window.','The prize was collected.'],'Sam opened the window.','The subject Sam performs the action in an active sentence.'),
Q('gps35','active and passive','Which sentence changes “The fox chased the rabbit” into the passive voice?',['The rabbit chased the fox.','The rabbit was chased by the fox.','The fox was chased by the rabbit.','The rabbit is chasing the fox.'],'The rabbit was chased by the fox.','The rabbit receives the action, so it becomes the subject.'),
Q('gps36','active and passive','Which sentence has a passive verb?',['The coach praised the team.','The cake was baked by Auntie.','Auntie baked the cake.','Everyone ate the cake.'],'The cake was baked by Auntie.','Was baked is a passive verb construction.'),
Q('gps37','pronouns','Which word can replace “Jamal and I” as the subject of a sentence?',['us','we','them','our'],'we','We is a subject pronoun used for the speaker and someone else.'),
Q('gps38','pronouns','Choose the correct word: “The teacher gave the certificates to Ava and ___.”',['I','me','mine','my'],'me','After the preposition to, use the object pronoun me.'),
Q('gps39','pronouns','Choose the correct possessive pronoun: “This water bottle is ___.”',['her','she','hers','herself'],'hers','Hers can stand alone in place of a possessive noun phrase.'),
Q('gps40','synonyms','Which word is closest in meaning to “brief”?',['lengthy','short','heavy','unusual'],'short','Brief means lasting for or using a short time or length.'),
Q('gps41','synonyms','Which word is closest in meaning to “observe”?',['notice','ignore','escape','pretend'],'notice','To observe is to watch or notice carefully.'),
Q('gps42','synonyms','Which word is closest to “generous”?',['unkind','giving','shy','nervous'],'giving','A generous person is willing to give or share.'),
Q('gps43','antonyms','Which word is opposite in meaning to “fragile”?',['delicate','breakable','sturdy','thin'],'sturdy','Sturdy describes something strong rather than easily broken.'),
Q('gps44','antonyms','Which word is opposite in meaning to “ancient”?',['modern','historic','crumbling','old'],'modern','Modern means belonging to recent or present times.'),
Q('gps45','antonyms','Which word is opposite in meaning to “expand”?',['grow','stretch','increase','shrink'],'shrink','To shrink is to become smaller, the opposite of expand.'),
Q('gps46','word families','Which word belongs to the same word family as “act”?',['actor','able','arrival','answer'],'actor','Actor is formed from the root act.'),
Q('gps47','word families','Which word contains a suffix meaning “a person who does something”?',['teacher','teaching','teachable','taught'],'teacher','The suffix -er can mean a person who does a job or activity.'),
Q('gps48','word families','Which word is made using the prefix “un-”?',['undo','under','unit','until'],'undo','Undo adds the prefix un- meaning reverse the action.'),
Q('gps49','agreement','Choose the correct verb: “The basket of apples ___ heavy.”',['are','were','is','have'],'is','The subject basket is singular.'),
Q('gps50','agreement','Complete the sentence: “Neither of the answers ___ correct.”',['are','is','were','be'],'is','In this sentence neither is singular, so use is.'),
Q('gps51','agreement','Which sentence uses standard subject-verb agreement?',['The children plays outside.','The children play outside.','The children playing outside.','The children is playing outside.'],'The children play outside.','The plural subject children takes the plural verb play.'),
Q('gps52','vocabulary','What does “impartial” mean?',['Choosing a favourite','Fair and not taking sides','Very tired','Easy to persuade'],'Fair and not taking sides','Impartial means fair and unbiased.'),
Q('gps53','vocabulary','Which word means “to make something clearer”?',['clarify','conceal','confuse','delay'],'clarify','To clarify means to explain or make something easier to understand.'),
Q('gps54','vocabulary','Which word best completes “The evidence was ___, so the scientist checked again”?',['conclusive','uncertain','obvious','reliable'],'uncertain','Uncertain evidence is not yet clear enough to rely on.')
];
