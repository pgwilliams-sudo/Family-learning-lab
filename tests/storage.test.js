import test from 'node:test';
import assert from 'node:assert/strict';
import {load,save} from '../src/storage.js';

test('v0.1 saved progress migrates without losing either learner',()=>{
 const store=new Map();
 globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 store.set('family-learning-lab:v1',JSON.stringify({version:1,activeLearnerId:'nico',profiles:[{id:'kodjo',name:'Kodjo'},{id:'nico',name:'Nico'}],progress:{'nico::maths.fractions.add-unlike':{mastery:65}},sessions:[{profileId:'nico'}]}));
 const upgraded=load();
 assert.equal(upgraded.version,2);assert.equal(upgraded.activeLearnerId,'nico');
 assert.equal(upgraded.progress['nico::maths.fractions.add-unlike'].mastery,65);
 assert.equal(upgraded.sessions.length,1);assert.deepEqual(upgraded.rewards,{});
 upgraded.rewards.nico={xp:42};save(upgraded);assert.equal(load().rewards.nico.xp,42);
 delete globalThis.localStorage;
});

test('migration preserves diagnostic evidence, history, extra fields and v0.2 reward ledgers',()=>{
 const evidence={mastery:65,secure:true,checkStreak:2,signals:['denominator-only'],diagnosis:{code:'denominator-only',status:'likely'},reviewAt:'2026-11-07T12:00:00Z',recentQuestionIds:['equivalent:1:2:4']};
 for(const version of [1,2]) {
   const original={version,activeLearnerId:'nico',profiles:[{id:'nico',name:'Nico',year:'Year 9'},{id:'kodjo',name:'Kodjo',year:'Year 6'}],progress:{'nico::maths.fractions.equivalent':evidence},sessions:[{profileId:'nico',outcomes:[{questionId:'old-q',independent:true}],xp:12}],rewards:{nico:{xp:112,badges:['first-step'],credited:{'2026-11-04:maths.fractions.add-unlike:f01':12}}},familyPreference:'preserved'};
   let value=JSON.stringify(original);globalThis.localStorage={getItem:()=>value,setItem:(_,v)=>{value=v;}};
   const data=load();assert.deepEqual(data,{...original,version:2});save(data);assert.deepEqual(load(),data);
 }
 delete globalThis.localStorage;
});
