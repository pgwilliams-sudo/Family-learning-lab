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
