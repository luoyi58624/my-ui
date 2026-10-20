import assert from 'node:assert/strict'
import test from 'node:test'
import { createApp, nextTick } from 'vue'
import { createPinia, disposePinia, type Pinia } from 'pinia'
import { createSharedStatePlugin, sharedStateKey, type SharedStateStorage } from '../packages/vue/state'
import { installThemeState, useThemeStore } from '../example/src/stores/theme'
import { readThemeSnapshot, themeStateKey } from '../example/src/theme/preferences'
import { installNativeAppearance } from '../example/src/native-appearance'

const settle = async () => { for(let i=0;i<25;i++){ await Promise.resolve(); await nextTick() } }
function cache() {
  const data=new Map<string,string>(),listeners=new Set<(key:string|null)=>void>()
  const storage:SharedStateStorage={ getItem:key=>data.get(key)??null,setItem(key,value){data.set(key,value);listeners.forEach(fn=>fn(key))},removeItem(key){data.delete(key);listeners.forEach(fn=>fn(key))},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)} }
  return {storage,data}
}
function createThemePage(storage:SharedStateStorage){
  const pinia=createPinia().use(createSharedStatePlugin({storage}));createApp({render:()=>null}).use(pinia)
  return {pinia,store:useThemeStore(pinia)}
}
async function withEnvironment(run:(api:any)=>Promise<void>){
  const previous=new Map(['window','document','localStorage','MutationObserver'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]))
  const saved=new Map<string,string>(),values=new Map<string,string>(),calls:any[]=[],observers=new Set<()=>void>()
  const root={dataset:{theme:'light'},style:{setProperty:(key:string,value:string)=>values.set(key,value)}}
  const doc=Object.assign(new EventTarget(),{documentElement:root,visibilityState:'visible'})
  let respond=(_:boolean):Promise<void>=>Promise.resolve()
  const media={matches:false,addEventListener(){},removeEventListener(){}}
  const runtime=Object.assign(new EventTarget(),{matchMedia:()=>media,__TAURI__:{core:{invoke:(command:string,args:any)=>{calls.push({command,...args});return respond(args.dark)}}}})
  class Observer{constructor(private callback:()=>void){}observe(){observers.add(this.callback)}disconnect(){observers.delete(this.callback)}}
  const storage={getItem:(key:string)=>saved.get(key)??null,setItem:(key:string,value:string)=>saved.set(key,value)}
  for(const [key,value]of Object.entries({window:runtime,document:doc,localStorage:storage,MutationObserver:Observer}))Object.defineProperty(globalThis,key,{configurable:true,value})
  try{await run({saved,root,values,calls,runtime,media,respond:(next:typeof respond)=>{respond=next},mutate:(mode:string)=>{root.dataset.theme=mode;observers.forEach(fn=>fn())}})}
  finally{for(const[key,value]of previous){if(value)Object.defineProperty(globalThis,key,value);else Reflect.deleteProperty(globalThis,key)}}
}

test('两个窗口双向同步明暗偏好，新窗口恢复已经保存的模式',()=>withEnvironment(async()=>{
  const shared=cache(),pages=[createThemePage(shared.storage),createThemePage(shared.storage)]
  try{
    await Promise.all(pages.map(page=>page.store.$shared!.ready))
    pages[0]!.store.mode='dark';await pages[0]!.store.$shared!.flush();await settle()
    assert.equal(pages[1]!.store.mode,'dark')
    const other=createThemePage(shared.storage);pages.push(other);await other.store.$shared!.ready;assert.equal(other.store.mode,'dark')
    other.store.mode='light';await other.store.$shared!.flush();await settle()
    assert.equal(pages[0]!.store.mode,'light');assert.equal(pages[1]!.store.mode,'light')
  }finally{pages.forEach(page=>disposePinia(page.pinia))}
}))

test('系统外观偏好与配色、字重分字段同步，不会互相覆盖',()=>withEnvironment(async()=>{
  const shared=cache(),a=createThemePage(shared.storage),b=createThemePage(shared.storage)
  try{
    await Promise.all([a.store.$shared!.ready,b.store.$shared!.ready])
    a.store.mode='system';b.store.fontWeight=600;b.store.dark.primary='#ffccaa'
    await Promise.all([a.store.$shared!.flush(),b.store.$shared!.flush()]);await settle()
    for(const {store}of[a,b]){assert.equal(store.mode,'system');assert.equal(store.fontWeight,600);assert.equal(store.dark.primary,'#ffccaa')}
  }finally{disposePinia(a.pinia);disposePinia(b.pinia)}
}))

test('窗口级渲染监听应用共享设置，停止后不再改动页面',()=>withEnvironment(async api=>{
  const page=createThemePage(cache().storage)
  try{
    const stop=installThemeState(page.pinia)
    assert.equal(api.root.dataset.theme,'light')
    page.store.mode='dark';await nextTick();assert.equal(api.root.dataset.theme,'dark')
    assert.equal(JSON.parse(api.saved.get('my-ui:theme')).mode,'dark')
    stop();page.store.mode='light';await nextTick();assert.equal(api.root.dataset.theme,'dark')
  }finally{disposePinia(page.pinia)}
}))

test('兼容旧设置且纯 HTML 字段键与 Pinia 共享协议一致',()=>withEnvironment(async api=>{
  api.saved.set('chenglan:theme',JSON.stringify({mode:'dark',fontWeight:600}))
  assert.equal(readThemeSnapshot().mode,'dark');assert.equal(readThemeSnapshot().fontWeight,600)
  for(const field of['mode','backdropBlur','fontWeight','light','dark']as const)assert.equal(themeStateKey(field),sharedStateKey('theme',field))
  api.saved.set('my-ui:theme','broken');assert.equal(readThemeSnapshot().mode,'light')
}))

test('原生系统外观跟随实际明暗主题，重复配置不会反复调用桥接',()=>withEnvironment(async api=>{
  const stop=installNativeAppearance();await settle();api.mutate('dark');await settle();api.mutate('dark');await settle();api.mutate('light');await settle()
  assert.deepEqual(api.calls,[false,true,false].map(dark=>({command:'set_app_theme',dark})))
  stop();api.mutate('dark');await settle();assert.equal(api.calls.length,3)
}))

test('快速切换时串行提交最新外观，旧请求完成后不会覆盖最终模式',()=>withEnvironment(async api=>{
  let finish!:()=>void;api.respond(()=>new Promise<void>(resolve=>{finish=resolve}))
  const stop=installNativeAppearance();api.mutate('dark');api.mutate('light');api.mutate('dark')
  assert.deepEqual(api.calls.map((call:any)=>call.dark),[false])
  api.respond(()=>Promise.resolve());finish();await settle();assert.deepEqual(api.calls.map((call:any)=>call.dark),[false,true]);stop()
}))

test('原生加载背景使用当前配色，同为暗色但背景改变时也会同步',()=>withEnvironment(async api=>{
  api.root.style.getPropertyValue=(key:string)=>api.values.get(key)??''
  api.root.dataset.theme='dark';api.values.set('--background','#121419')
  const stop=installNativeAppearance();await settle()
  api.values.set('--background','#0d1015');api.mutate('dark');await settle()
  assert.deepEqual(api.calls.map((call:any)=>call.background),['#121419','#0d1015']);stop()
}))

test('跟随系统与手动主题分开传给原生，模式相同但偏好改变也要更新',()=>withEnvironment(async api=>{
  api.root.dataset.theme='dark';api.root.dataset.themePreference='dark'
  const stop=installNativeAppearance();await settle()
  api.root.dataset.themePreference='system';api.mutate('dark');await settle()
  api.root.dataset.themePreference='dark';api.mutate('dark');await settle()
  assert.deepEqual(api.calls.map((call:any)=>call.followSystem??false),[false,true,false]);stop()
}))

test('桥接失败可在重新聚焦时重试，普通浏览器不调用原生外观',()=>withEnvironment(async api=>{
  const original=console.error;console.error=()=>{}
  try{
    api.respond(()=>Promise.reject(new Error('unavailable')));const stop=installNativeAppearance();await settle()
    api.respond(()=>Promise.resolve());api.runtime.dispatchEvent(new Event('focus'));await settle();assert.equal(api.calls.length,2);stop()
    api.runtime.__TAURI__=undefined;installNativeAppearance()();await settle();assert.equal(api.calls.length,2)
  }finally{console.error=original}
}))
