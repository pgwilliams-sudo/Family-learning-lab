export const skillGraph = [
  {id:'maths.fractions.equivalent', title:'Equivalent fractions', prerequisites:[], lesson:'Multiply or divide the top and bottom by the same number: 1/2 = 2/4. The amount stays the same.', hint:'Use the same multiplier on the top and bottom.'},
  {id:'maths.fractions.common-denominator', title:'Common denominators', prerequisites:['maths.fractions.equivalent'], lesson:'A common denominator is a multiple of both bottom numbers. For thirds and quarters, use twelfths: 1/3 = 4/12 and 1/4 = 3/12.', hint:'Find a number that both bottom numbers divide into.'},
  {id:'maths.fractions.add-unlike', title:'Adding unlike fractions', prerequisites:['maths.fractions.common-denominator'], lesson:'Make equal-sized pieces first. Then add the top numbers and keep the bottom number: 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2.', hint:'Rewrite with a common denominator, then add only the top numbers.'}
];
export const skillById = id => skillGraph.find(s=>s.id===id);
