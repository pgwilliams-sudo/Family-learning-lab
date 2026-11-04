// Keep the v1 key to preserve existing family progress; migrate records in place.
const KEY = 'family-learning-lab:v1';
const defaults = () => ({version:2, activeLearnerId:'kodjo', profiles:[
  {id:'kodjo',name:'Kodjo',year:'Year 6'},
  {id:'nico',name:'Nico',year:'Year 9'}
],progress:{},sessions:[],rewards:{}});
export function load() {
  try {
    const saved=JSON.parse(localStorage.getItem(KEY));
    if((saved?.version===1 || saved?.version===2) && Array.isArray(saved.profiles) && saved.progress && Array.isArray(saved.sessions)) return {...saved,version:2,rewards:saved.rewards&&typeof saved.rewards==='object'?saved.rewards:{}};
  } catch { /* reset malformed local data */ }
  return defaults();
}
export function save(data) { localStorage.setItem(KEY,JSON.stringify(data)); }
export function progressKey(profileId,skillId) {return `${profileId}::${skillId}`;}
export function exportData(data) {
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='family-learning-lab-backup.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
}
