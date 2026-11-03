import {useState,useRef,useEffect,useMemo} from 'preact/hooks';
import {U,fetchAll,unfollow,sleep,hasSession,ApiErr} from './api';
import {load,save,wipe} from './store';
import {tr,Lang,nf,df} from './i18n';
type Snap={t:number;fo:number;fg:number;nf:number};
const PER=50,rnd=(a:number,b:number)=>a+Math.random()*(b-a);
const dl=(n:string,type:string,d:string)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([d],{type}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5e3)};
const cell=(v:unknown)=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'};
const Logo=()=><svg width="38" height="38" viewBox="0 0 40 40"><rect width="40" height="40" rx="11" fill="#121819"/><circle cx="20" cy="20" r="9" fill="none" stroke="#2dd4c4" stroke-width="4"/><rect x="26" y="26" width="9" height="4" rx="2" transform="rotate(45 30 28)" fill="#2dd4c4"/></svg>;
const Spark=({d}:{d:number[]})=>{if(d.length<2)return null;const mx=Math.max(...d),mn=Math.min(...d),r=mx-mn||1;
  return<svg viewBox="0 0 300 80" class="spark" preserveAspectRatio="none"><polyline fill="none" stroke="#2dd4c4" stroke-width="2.5" points={d.map((v,i)=>`${i/(d.length-1)*300},${72-(v-mn)/r*62}`).join(' ')}/></svg>};
export function App(){
  const [lang,setLang]=useState<Lang>(load('lang','fa'));
  const [tab,setTab]=useState('dash');
  const [fo,setFo]=useState<U[]>([]);const [fg,setFg]=useState<U[]>([]);
  const [st,setSt]=useState<'idle'|'scan'|'unf'>('idle');
  const [msg,setMsg]=useState('');const [partial,setPartial]=useState(false);const [paused,setPaused]=useState(false);
  const [hist,setHist]=useState<Snap[]>(load('hist',[]));const [wl,setWl]=useState<U[]>(load('wl',[]));
  const [lost,setLost]=useState<number|null>(null);
  const [sel,setSel]=useState<Set<string>>(new Set());
  const [view,setView]=useState<'non'|'fg'|'fo'>('non');const [wt,setWt]=useState(false);
  const [q,setQ]=useState('');const [flt,setFlt]=useState('all');const [srt,setSrt]=useState('az');const [pg,setPg]=useState(1);
  const [log,setLog]=useState<{u:string;ok:boolean}[]>([]);
  const [cfg,setCfg]=useState(load('cfg',{scanMs:1000,unfMs:4000}));
  const ctl=useRef({stop:false,pause:false});
  const T=(k:string,...a:any[])=>tr(lang,k,...a),N=(n:number)=>nf(lang,n);
  useEffect(()=>{const r=document.getElementById('okila')!;r.dir=lang==='fa'?'rtl':'ltr';r.lang=lang;save('lang',lang)},[lang]);
  const foIds=useMemo(()=>new Set(fo.map(u=>u.id)),[fo]);
  const wlIds=useMemo(()=>new Set(wl.map(u=>u.id)),[wl]);
  const non=useMemo(()=>fg.filter(u=>!foIds.has(u.id)),[fg,foIds]);
  const rows=useMemo(()=>{
    const s=q.toLowerCase();let r=(view==='non'?non:view==='fg'?fg:fo).filter(u=>view!=='non'||(wt?wlIds.has(u.id):!wlIds.has(u.id)));
    r=r.filter(u=>(flt==='all'||(flt==='priv'&&u.priv)||(flt==='pub'&&!u.priv)||(flt==='ver'&&u.ver))&&(!s||u.username.toLowerCase().includes(s)||u.full_name.toLowerCase().includes(s)));
    return[...r].sort((a,b)=>(srt==='az'?1:-1)*a.username.localeCompare(b.username))},[view,non,fg,fo,wt,wlIds,q,flt,srt]);
  const maxP=Math.max(1,Math.ceil(rows.length/PER)),cur=rows.slice((pg-1)*PER,pg*PER);
  useEffect(()=>setPg(1),[view,wt,q,flt,srt]);
  const busy=st!=='idle';
  async function scan(){
    if(!hasSession())return setMsg(T('noSession'));
    const c=ctl.current;c.stop=false;c.pause=false;setPaused(false);setSt('scan');setPartial(false);setSel(new Set());
    const sm=cfg.scanMs;
    const wait=async()=>{while(c.pause&&!c.stop)await sleep(500);await sleep(rnd(sm,sm*1.7))};
    try{
      const a=await fetchAll('followers',n=>setMsg(T('fetchFo',N(n))),wait,c);setFo(a.users);
      const b=a.complete?await fetchAll('following',n=>setMsg(T('fetchFg',N(n))),wait,c):{users:[],complete:false};setFg(b.users);
      const ok=a.complete&&b.complete;setPartial(!ok);
      if(ok){
        const ids=new Set(a.users.map(u=>u.id)),p=load<string[]|null>('prevFo',null);
        setLost(p?p.filter(i=>!ids.has(i)).length:null);save('prevFo',[...ids]);
        const nn=b.users.filter(u=>!ids.has(u.id)).length,h=[...hist,{t:Date.now(),fo:a.users.length,fg:b.users.length,nf:nn}].slice(-60);
        setHist(h);save('hist',h);setMsg(T('done'));
      }else setMsg(T('part'));
    }catch(e:any){setPartial(true);setMsg(e instanceof ApiErr&&e.status===429?T('rate'):T('err',e?.message??''))}
    setSt('idle');
  }
  async function run(){
    const items=non.filter(u=>sel.has(u.id)&&!wlIds.has(u.id));
    if(partial||!items.length||!confirm(T('confirmUnf',N(items.length))))return;
    const c=ctl.current;c.stop=false;c.pause=false;setPaused(false);setSt('unf');setLog([]);setTab('log');
    let i=0;
    for(const u of items){
      if(c.stop)break;while(c.pause&&!c.stop)await sleep(500);
      let r:'ok'|'fail'|'blocked';try{r=await unfollow(u)}catch{r='fail'}
      setLog(l=>[...l,{u:u.username,ok:r==='ok'}]);
      if(r==='ok')setFg(f=>f.filter(x=>x.id!==u.id));
      if(r==='blocked'){setMsg(T('blocked'));break}
      i++;if(u===items[items.length-1])break;
      await sleep(rnd(cfg.unfMs,cfg.unfMs*1.5));
      if(i%5===0)for(let s=300;s>0&&!c.stop;s--){setMsg(T('cool',N(s)));await sleep(1000)}
    }
    setSel(new Set());setSt('idle');setMsg('');
  }
  const toggle=(u:U,on:boolean)=>setSel(s=>{const n=new Set(s);on?n.add(u.id):n.delete(u.id);return n});
  const setWlSave=(w:U[])=>{setWl(w);save('wl',w)};
  const wlToggle=(u:U)=>setWlSave(wlIds.has(u.id)?wl.filter(x=>x.id!==u.id):[...wl,u]);
  const exp=(k:'csv'|'json')=>k==='json'?dl('okila-list.json','application/json',JSON.stringify(rows,null,2)):
    dl('okila-list.csv','text/csv;charset=utf-8','\ufeffid,username,full_name,verified,private\r\n'+rows.map(u=>[u.id,u.username,u.full_name,u.ver,u.priv].map(cell).join(',')).join('\r\n'));
  const impWl=(f?:File)=>{if(!f)return;const r=new FileReader();r.onload=()=>{try{const a=JSON.parse(String(r.result));if(Array.isArray(a)&&a.every((x:any)=>x&&typeof x.id==='string'&&typeof x.username==='string')){const m=new Map(wl.map(u=>[u.id,u]));a.forEach((x:U)=>m.set(x.id,x));setWlSave([...m.values()]);setMsg(T('saved'))}}catch{}};r.readAsText(f)};
  const last=hist[hist.length-1],prev=hist[hist.length-2];
  const dlt=(a:number,b?:number)=>b===undefined?'':(a-b>0?'+':'')+N(a-b);
  return<div>
    <header class="top"><div class="brand"><Logo/><div>{T('app')}<small>OKILA | {lang==='fa'?'آموزش مهارت‌های کاربردی IT':'Practical IT skills'}</small></div></div>
      <nav>{['dash','list','set',...(log.length?['log']:[])].map(k=><button class={'b '+(tab===k?'on':'')} onClick={()=>setTab(k)}>{T(k)}</button>)}</nav>
      <button class="b" onClick={()=>setLang(lang==='fa'?'en':'fa')}>{lang==='fa'?'EN':'فا'}</button>
      <button class="b" onClick={()=>confirm(lang==='fa'?'بستن OKILA؟':'Close OKILA?')&&(busy?(ctl.current.stop=true,0):0,document.getElementById('okila')!.remove())}>✕</button></header>
    <main>
      <div class="msg warn">{T('warn')}</div>
      <div class="bar"><span><i class={'dot '+(hasSession()?'ok':'')}/>{hasSession()?T('connected'):T('disc')}</span>
        <button class="b pri" disabled={busy} onClick={scan}>{T('scan')}</button>
        {busy&&<><button class="b" onClick={()=>{ctl.current.pause=!paused;setPaused(!paused)}}>{paused?T('resume'):T('pause')}</button><button class="b dng" onClick={()=>ctl.current.stop=true}>{T('stop')}</button></>}</div>
      {msg&&<div class="msg">{msg}</div>}
      {tab==='dash'&&<>
        <div class="grid">{[['fo',fo.length],['fg',fg.length],['non',non.length],['mutual',fg.length-non.length],['wl',wl.length]].map(([k,v])=><div class="card"><span class="muted">{T(k as string)}</span><b>{N(v as number)}</b></div>)}
          <div class="card"><span class="muted">{T('lost')}</span><b>{lost===null?'—':N(lost)}</b>{lost===null&&<span class="muted">{T('lostNote')}</span>}</div></div>
        <div class="card"><span class="muted">{T('trend')}</span><Spark d={hist.map(h=>h.fo)}/><div class="muted">{T('lastSync')}: {last?df(lang,last.t):T('never')}</div></div>
        {hist.length>0&&<div class="card" style="margin-top:.8rem;overflow:auto"><span class="muted">{T('hist')} · {T('since')}</span><table><tbody>{[...hist].reverse().slice(0,8).map((h,i,a)=><tr><td>{df(lang,h.t)}</td><td>{T('fo')}: {N(h.fo)} <span class="muted">{dlt(h.fo,a[i+1]?.fo)}</span></td><td>{T('fg')}: {N(h.fg)}</td><td>{T('non')}: {N(h.nf)}</td></tr>)}</tbody></table></div>}</>}
      {tab==='list'&&<>
        <div class="bar">
          <select value={view} onChange={e=>setView(e.currentTarget.value as any)} aria-label={T('view')}><option value="non">{T('non')}</option><option value="fg">{T('fg')}</option><option value="fo">{T('fo')}</option></select>
          {view==='non'&&<><button class={'b '+(!wt?'on':'')} onClick={()=>setWt(false)}>{T('all')}</button><button class={'b '+(wt?'on':'')} onClick={()=>setWt(true)}>★ {T('protected')}</button></>}
          <input type="text" placeholder={T('search')} value={q} onInput={e=>setQ(e.currentTarget.value)}/>
          <select value={flt} onChange={e=>setFlt(e.currentTarget.value)}>{['all','pub','priv','ver'].map(k=><option value={k}>{T(k)}</option>)}</select>
          <select value={srt} onChange={e=>setSrt(e.currentTarget.value)}><option value="az">{T('az')}</option><option value="za">{T('za')}</option></select>
          <button class="b" onClick={()=>exp('csv')} disabled={!rows.length}>{T('exCsv')}</button><button class="b" onClick={()=>exp('json')} disabled={!rows.length}>{T('exJson')}</button></div>
        {view==='non'&&!wt&&<div class="bar">
          <button class="b" disabled={busy} onClick={()=>setSel(s=>new Set([...s,...cur.map(u=>u.id)]))}>{T('selPage')}</button>
          <button class="b" disabled={busy||!sel.size} onClick={()=>setSel(new Set())}>{T('clear')}</button>
          <button class="b dng" disabled={busy||partial||!sel.size} onClick={run}>{T('unf',N(sel.size))}</button></div>}
        {!cur.length&&<div class="msg">{T('empty')}</div>}
        {cur.map(u=><div class="row"><img src={u.pic} alt="" loading="lazy" referrerPolicy="no-referrer"/>
          <div class="n"><a href={'/'+u.username} target="_blank" rel="noreferrer">{u.username}</a>{u.ver&&<span class="tag">✔</span>}{u.priv&&<span class="tag">{T('priv')}</span>}<div class="muted">{u.full_name}</div></div>
          <button class="b" onClick={()=>wlToggle(u)}>{wlIds.has(u.id)?T('rmWl'):T('addWl')}</button>
          {view==='non'&&!wlIds.has(u.id)&&<input type="checkbox" disabled={busy} checked={sel.has(u.id)} onChange={e=>toggle(u,e.currentTarget.checked)}/>}</div>)}
        <div class="bar"><button class="b" disabled={pg<=1} onClick={()=>setPg(pg-1)}>{lang==='fa'?'‹':'‹'}</button><span>{T('pageOf',N(pg),N(maxP))}</span><button class="b" disabled={pg>=maxP} onClick={()=>setPg(pg+1)}>›</button></div></>}
      {tab==='log'&&<div>{log.map(l=><div class="row" style={l.ok?'':'border-color:#e5534b'}><a href={'/'+l.u} target="_blank" rel="noreferrer">{l.u}</a><span class="muted">{l.ok?T('okMsg'):T('failMsg')}</span></div>)}</div>}
      {tab==='set'&&<>
        <div class="card"><div class="bar"><label>{T('lang')}</label><select value={lang} onChange={e=>setLang(e.currentTarget.value as Lang)}><option value="fa">فارسی</option><option value="en">English</option></select></div>
          <div class="bar"><label>{T('scanMs')}</label><input type="number" min={1000} value={cfg.scanMs} onChange={e=>setCfg({...cfg,scanMs:Math.max(1000,+e.currentTarget.value||1000)})}/></div>
          <div class="bar"><label>{T('unfMs')}</label><input type="number" min={4000} value={cfg.unfMs} onChange={e=>setCfg({...cfg,unfMs:Math.max(4000,+e.currentTarget.value||4000)})}/></div>
          <button class="b pri" onClick={()=>{save('cfg',cfg);setMsg(T('saved'))}}>{T('save')}</button></div>
        <div class="card" style="margin-top:.8rem"><b style="font-size:1.1rem">{T('wlTitle')} ({N(wl.length)})</b>
          <div class="bar"><button class="b" disabled={!wl.length} onClick={()=>dl('okila-whitelist.json','application/json',JSON.stringify(wl,null,2))}>{T('wlEx')}</button>
            <label class="b">{T('wlIm')}<input type="file" accept=".json" hidden onChange={e=>{impWl(e.currentTarget.files?.[0]);e.currentTarget.value=''}}/></label></div>
          {wl.map(u=><div class="row"><span class="n">{u.username}</span><button class="b" onClick={()=>wlToggle(u)}>{T('rmWl')}</button></div>)}</div>
        <p><button class="b dng" onClick={()=>{if(confirm(T('wipeQ'))){wipe();setWl([]);setHist([]);setLost(null);setMsg(T('saved'))}}}>{T('wipe')}</button></p></>}
    </main>
    <footer><a href="https://okila.ir" target="_blank" rel="noreferrer">okila.ir</a> · <a href="https://t.me/Okila_Academy" target="_blank" rel="noreferrer">Telegram</a> · <a href="https://instagram.com/o_k_i_l_a" target="_blank" rel="noreferrer">@o_k_i_l_a</a></footer>
  </div>}
