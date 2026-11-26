/* history.js - all past answers, sorted by class and subject, with small pictures of the files that were scanned.
   Saved on this phone only (IndexedDB). Nothing is sent anywhere. */
(function(){
const DB='qa_hist',ST='recs',KEEP_THUMBS=60;
let dbp=null;const RECENT=[];
const db=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{r.result.createObjectStore(ST,{keyPath:'id'})};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
const tx=async(mode,f)=>{const d=await db();return new Promise((res,rej)=>{const t=d.transaction(ST,mode),s=t.objectStore(ST),r=f(s);t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})};
const all=()=>tx('readonly',s=>s.getAll());
const put=r=>tx('readwrite',s=>s.put(r));
const getL=k=>{try{return load(k)||''}catch(e){return ''}};
const setL=(k,v)=>{try{save(k,v)}catch(e){}};

/* ---------- class and subject ---------- */
const SUBS=[['Mathematics',/^(math|maths|mathematics|applied math)/i],['Physics',/^phys/i],['Chemistry',/^chem/i],['Biology',/^(bio|zoology|botany)/i],
  ['Accountancy',/^(account|acc\b)/i],['Business Studies',/^(business|bst)/i],['Economics',/^econ/i],['Computer Science',/^(computer|cs\b|comp)/i],
  ['Informatics Practices',/^(informatics|ip\b)/i],['English',/^eng/i],['Hindi',/^hind/i],['History',/^hist/i],['Geography',/^geo/i],['Political Science',/^(pol|civics)/i],['Physical Education',/^(phy.*ed|pe\b)/i]];
const KW={Chemistry:/\b(mol|molar|ion|bond|reaction|acid|base|oxidation|electron|orbital|alkane|alkene|enthalpy|equilibrium|isomer|valence|ph\b)\b/gi,
  Physics:/\b(velocity|force|energy|current|voltage|resistance|wavelength|momentum|acceleration|lens|magnetic|charge|gravitation|photon)\b/gi,
  Mathematics:/\b(derivative|integral|matrix|determinant|probability|sin|cos|tan|limit|equation|sequence|vector|function)\b/gi,
  Biology:/\b(cell|enzyme|dna|rna|chromosome|photosynthesis|heart|blood|species|tissue|hormone|gene)\b/gi,
  Accountancy:/\b(journal|ledger|debit|credit|partnership|goodwill|balance sheet|depreciation|capital)\b/gi,
  Economics:/\b(demand|supply|utility|elasticity|gdp|inflation|monopoly|cost)\b/gi,
  'Business Studies':/\b(management|planning|organising|marketing|staffing|directing|controlling)\b/gi,
  'Computer Science':/\b(python|sql|algorithm|array|loop|function|class|stack|queue|network)\b/gi};
function normSub(s){s=String(s||'').trim();if(!s)return'';for(const[n,re]of SUBS)if(re.test(s))return n;return s.replace(/\b\w/g,c=>c.toUpperCase()).slice(0,30)}
function normCls(c){const m=/\b(1[0-2]|[6-9]|XII|XI|X)\b/i.exec(String(c||''));if(!m)return'';const r={xii:'12',xi:'11',x:'10'}[m[1].toLowerCase()];return r||m[1]}
function guessSub(items){const t=JSON.stringify(items||[]).slice(0,6000);let best='',bn=2;for(const k in KW){const n=(t.match(KW[k])||[]).length;if(n>bn){bn=n;best=k}}return best}

/* ---------- pictures of the scanned files ----------
   Kept big enough (long side up to 640px) to be read when opened full-size on another
   phone, not just as a small list thumbnail. This makes each saved answer a bit bigger
   to store, which is the trade-off for being able to view the photo clearly. */
async function thumb(f){try{const b=await createImageBitmap(f),k=Math.min(1,640/Math.max(b.width,b.height)),c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(b.width*k));c.height=Math.max(1,Math.round(b.height*k));c.getContext('2d').drawImage(b,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.6)}catch(e){return''}}
let idSeq=0;
const dev=()=>{let d=getL('qah_dev');if(!d){d='Phone-'+Math.random().toString(36).slice(2,5).toUpperCase();setL('qah_dev',d)}return d};

/* ---------- save ---------- */
async function saveRec(o){
  try{
    const files=[];
    for(const x of(o.files||[])){
      if(x.kind==='img'&&x.f)files.push({name:x.name||'Photo '+(files.length+1),kind:'img',thumb:await thumb(x.f)});
      else files.push({name:x.name||'File',kind:x.kind||'file',thumb:''})}
    const rec={id:Date.now().toString(36)+Math.random().toString(36).slice(2,10)+(++idSeq).toString(36),ts:Date.now(),mode:o.mode,
      cls:normCls(o.cls)||'Other',sub:normSub(o.sub)||guessSub(o.items)||'Unsorted',items:o.items||[],via:o.via||'',note:o.note||'',files,dev:dev()};
    await put(rec);RECENT.push(rec);if(RECENT.length>20)RECENT.shift();return rec}
  catch(e){return null}}

// a diagram picture or figure that finishes after the answer was saved is added to the saved copy
let tt={};async function touch(x){const r=RECENT.find(z=>(z.items||[]).includes(x));if(!r)return;clearTimeout(tt[r.id]);
  tt[r.id]=setTimeout(async()=>{try{await put(r)}catch(e){}},800)}

/* ---------- screen ---------- */
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e};
const css=document.createElement('style');
css.textContent='.hm{width:38px;height:38px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font-size:22px;line-height:1;padding:0;margin-right:10px;vertical-align:middle}'
+'#hd,#hv{position:fixed;inset:0;z-index:60;display:none}#hd.on,#hv.on{display:block}'
+'#hd .bg,#hv .bg{position:absolute;inset:0;background:rgba(0,0,0,.6)}'
+'#hd .pn{position:absolute;top:0;bottom:0;left:0;width:min(90vw,400px);background:var(--bg);border-right:1px solid var(--line);overflow:auto;padding:14px;box-sizing:border-box}'
+'#hv .pn{position:absolute;inset:0;background:var(--bg);overflow:auto;padding:14px;box-sizing:border-box}'
+'.hr{display:flex;align-items:center;gap:8px;margin-bottom:10px}.hr h2{flex:1;margin:0;font-size:18px}'
+'.he{padding:10px;border:1px solid var(--line);border-radius:8px;margin:6px 0;cursor:pointer}.he small{color:var(--mut)}.he .ts{display:flex;gap:4px;margin-top:6px;overflow:hidden}.he .ts img{width:34px;height:34px;object-fit:cover;border-radius:4px;border:1px solid var(--line)}'
+'.hg>summary{font-weight:700;padding:8px 0}.hs>summary{padding:6px 0 6px 10px;font-weight:600;color:var(--mut)}'
+'.hf{display:flex;gap:6px;overflow:auto;margin:8px 0}.hf img{height:90px;border-radius:6px;border:1px solid var(--line)}'
+'.ts img,.hf img{cursor:pointer}'
+'h1{display:flex;align-items:center}'
+'#lb{position:fixed;inset:0;z-index:70;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.92)}#lb.on{display:flex}'
+'#lb img{max-width:95vw;max-height:84vh;border-radius:6px;border:1px solid var(--line)}'
+'#lb .lbc{position:absolute;top:14px;right:18px;font-size:26px;color:#fff;cursor:pointer;line-height:1}'
+'#lb .lbcap{position:absolute;bottom:18px;left:0;right:0;text-align:center;color:var(--mut);font:13px system-ui,sans-serif}';
document.head.append(css);
const drawer=h('div');drawer.id='hd';const viewer=h('div');viewer.id='hv';document.body.append(drawer,viewer);

/* ---------- full-size photo viewer (works the same for a photo saved on any of your phones) ---------- */
const lb=h('div');lb.id='lb';
const lbImg=document.createElement('img'),lbCap=h('div','lbcap'),lbClose=h('div','lbc','✕');
lbClose.onclick=()=>lb.classList.remove('on');lb.onclick=e=>{if(e.target===lb)lb.classList.remove('on')};
lb.append(lbImg,lbCap,lbClose);document.body.append(lb);
function openImg(src,cap){if(!src)return;lbImg.src=src;lbCap.textContent=cap||'';lb.classList.add('on')}

const fmt=ts=>{const d=new Date(ts);return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})+' '+d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})};
const clsOrder=c=>c==='12'?0:c==='11'?1:c==='Other'?9:2;

async function openDrawer(q){
  drawer.innerHTML='';drawer.classList.add('on');
  const bg=h('div','bg');bg.onclick=()=>drawer.classList.remove('on');
  const pn=h('div','pn'),top=h('div','hr'),cl=h('button',0,'✕');cl.onclick=()=>drawer.classList.remove('on');top.append(h('h2',0,'History'),cl);
  const se=h('input');se.placeholder='Search subject, class or date';se.value=q||'';se.style.cssText='width:100%;margin:0 0 8px';
  const list=h('div');pn.append(top,se,list);drawer.append(bg,pn);
  let recs=[];try{recs=(await all()).sort((a,b)=>b.ts-a.ts)}catch(e){list.append(h('div','warn','This phone would not keep history saved (storage unavailable).'));return}
  const draw=()=>{list.innerHTML='';const f=se.value.trim().toLowerCase();
    const vis=recs.filter(r=>!f||(r.cls+' '+r.sub+' '+fmt(r.ts)+' '+r.mode+' '+r.dev).toLowerCase().includes(f));
    if(!vis.length){list.append(h('div','mut',recs.length?'Nothing matches.':'Nothing saved yet. Your answers will appear here after you get them.'));return}
    const by={};vis.forEach(r=>{((by[r.cls]=by[r.cls]||{})[r.sub]=by[r.cls][r.sub]||[]).push(r)});
    Object.keys(by).sort((a,b)=>clsOrder(a)-clsOrder(b)||a.localeCompare(b)).forEach(c=>{
      const n=Object.values(by[c]).reduce((a,x)=>a+x.length,0),d=h('details','hg');d.open=!!f||Object.keys(by).length<3;
      d.append(h('summary',0,(c==='Other'?'Other / unknown class':'Class '+c)+'  ('+n+')'));
      Object.keys(by[c]).sort().forEach(s=>{const sd=h('details','hs');sd.open=!!f;sd.append(h('summary',0,s+'  ('+by[c][s].length+')'));
        by[c][s].forEach(r=>{const e=h('div','he'),nq=(r.items||[]).length;
          e.append(h('div',0,fmt(r.ts)),h('small',0,(r.mode==='online'?'Online':'Offline')+' · '+nq+' answer'+(nq===1?'':'s')+' · '+r.files.length+' file'+(r.files.length===1?'':'s')+' · '+(r.dev||'')));
          const ts=h('div','ts');r.files.filter(x=>x.thumb).slice(0,6).forEach(x=>{const im=h('img');im.src=x.thumb;
            im.onclick=ev=>{ev.stopPropagation();openImg(x.thumb,x.name+' · '+fmt(r.ts)+' · '+(r.dev||''))};ts.append(im)});if(ts.children.length)e.append(ts);
          e.onclick=()=>openRec(r.id);sd.append(e)});
        d.append(sd)});
      list.append(d)})};
  se.oninput=draw;draw()}

async function openRec(id){
  const recs=await all(),r=recs.find(x=>x.id===id);if(!r)return;
  viewer.innerHTML='';viewer.classList.add('on');
  const bg=h('div','bg'),pn=h('div','pn');viewer.append(bg,pn);
  const top=h('div','hr'),back=h('button',0,'← Back');back.onclick=()=>{viewer.classList.remove('on')};
  const title=h('h2',0,(r.cls==='Other'?'':'Class '+r.cls+' · ')+r.sub);top.append(back,title);pn.append(top,h('div','mut',fmt(r.ts)+' · '+(r.mode==='online'?'Online':'Offline')+' · '+(r.dev||'')+(r.via?' · '+r.via:'')));
  const bar=h('div','row'),cp=h('button',0,'Copy'),ed=h('button',0,'Change class / subject');
  cp.onclick=()=>{try{copyTxt(cp,plain(order(r.items)))}catch(e){}};
  ed.onclick=async()=>{const c=prompt('Class (11, 12 or leave empty):',r.cls==='Other'?'':r.cls);if(c===null)return;const s=prompt('Subject:',r.sub);if(s===null)return;
    r.cls=normCls(c)||'Other';r.sub=normSub(s)||'Unsorted';await put(r);openRec(id)};
  bar.append(cp,ed);pn.append(bar);
  if(r.files.length){const fs=h('div','hf');r.files.forEach(x=>{if(x.thumb){const im=h('img');im.src=x.thumb;im.alt=x.name;
      im.onclick=()=>openImg(x.thumb,x.name+' · '+fmt(r.ts)+' · '+(r.dev||''));fs.append(im)}else fs.append(h('div','chip',x.name))});
    pn.append(h('div','mut','Files you scanned - tap a photo to view it full-size'),fs)}
  const out=h('div');out.id='hout';out.style.cssText='font-family:var(--af);font-size:var(--as);line-height:1.6;color:var(--ac);white-space:pre-wrap';pn.append(out);
  try{const its=order(r.items.map(x=>Object.assign({},x,{noGen:true})));its.forEach(x=>out.append(itemEl(x,null,r.mode==='online')));
    const g=gaps(its),w=[r.note,g.length?'No answer found for question'+(g.length>1?'s ':' ')+g.join(', ')+'. Check those photos or add them again.':''].filter(Boolean).join('\n');
    if(w)out.append(h('div','warn',w))}catch(e){out.textContent=plain(r.items)}}

/* ---------- menu button ---------- */
const hb=h('button','hm','☰');hb.id='hmenu';hb.setAttribute('aria-label','History');hb.onclick=()=>openDrawer();
const h1=document.querySelector('h1');if(h1)h1.prepend(hb);

window.QAH={save:saveRec,touch,open:openDrawer,_all:all,_normSub:normSub,_normCls:normCls,_guess:guessSub};
})();
