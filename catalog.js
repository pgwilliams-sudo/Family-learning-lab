/**
 * Add a subject here, then register its skills and question provider.
 * Subjects are metadata: the adaptive engine never needs subject-specific UI code.
 */
export const subjects = [
  { id: 'maths', label: 'Maths', symbol: '∑', description: 'Number, shape, algebra and reasoning', active: true, theme: 'green' },
  { id: 'english', label: 'English', symbol: 'Aa', description: 'Reading, writing and grammar', active: false, theme: 'peach' },
  { id: 'science', label: 'Science', symbol: '⚗', description: 'Biology, chemistry and physics', active: false, theme: 'blue' },
  { id: 'history', label: 'History', symbol: '⌛', description: 'People, events and evidence', active: false, theme: 'blue' },
  { id: 'geography', label: 'Geography', symbol: '◉', description: 'Places, environments and maps', active: false, theme: 'peach' },
  { id: 'languages', label: 'Languages', symbol: '文', description: 'Vocabulary and communication', active: false, theme: 'green' }
];

export const skills = [
  {
    id: 'maths.fractions.add-unlike', subjectId: 'maths', topic: 'Fractions',
    title: 'Adding fractions with different denominators',
    shortTitle: 'Adding unlike fractions',
    description: 'Make equal-sized pieces, add the numerators, then simplify.',
    years: ['Year 6', 'Year 9'], available: true,
    objectives: ['Find a common denominator', 'Convert equivalent fractions', 'Add and simplify'],
    intro: 'Imagine two chocolate bars cut into different-sized pieces. Before we add them, we need to make all the pieces the same size.'
  },
  { id: 'maths.fractions.equivalent', subjectId: 'maths', topic: 'Fractions', title: 'Equivalent fractions', shortTitle: 'Equivalent fractions', description: 'The same amount written in different ways.', years: ['Year 6', 'Year 9'], available: false },
  { id: 'maths.fractions.simplify', subjectId: 'maths', topic: 'Fractions', title: 'Simplifying fractions', shortTitle: 'Simplifying fractions', description: 'Express a fraction using the smallest whole numbers.', years: ['Year 6', 'Year 9'], available: false },
  { id: 'maths.ratio', subjectId: 'maths', topic: 'Ratio', title: 'Understanding ratio', shortTitle: 'Ratio', description: 'Compare quantities and solve problems.', years: ['Year 6', 'Year 9'], available: false },
  { id: 'maths.algebra', subjectId: 'maths', topic: 'Algebra', title: 'Solving equations', shortTitle: 'Equations', description: 'Use symbols and solve for unknown values.', years: ['Year 9'], available: false }
];

export const getSubject = id => subjects.find(s => s.id === id);
export const getSkill = id => skills.find(s => s.id === id);
export const getSkills = subjectId => skills.filter(s => s.subjectId === subjectId);
