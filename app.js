'use strict';
const today = '2026-11-25';
const storeKey = 'diwan-executive-v1';
let S = (() => { try { const saved=JSON.parse(localStorage.getItem(storeKey)); if (saved && ['meetings','directives','councils'].every(k=>Array.isArray(saved[k]))) return upgradeDemoContent(saved); } catch {} return seedState(); })();
function upgradeDemoContent(state){
 const seed=seedState(), originalTitle='معالي الوزير';
 for(const meeting of state.meetings){
   const original=seed.meetings.find(m=>m.id===meeting.id);
   if(!original)continue;
   if(original.transcript && meeting.transcript==null)meeting.transcript=original.transcript;
   if(original.comparisonSources && !meeting.comparisonSources)meeting.comparisonSources=original.comparisonSources;
   if(original.people.includes('وزير البلديات والإسكان') && Array.isArray(meeting.people))meeting.people=meeting.people.map(p=>p===originalTitle?'وزير البلديات والإسكان':p);
   if(meeting.id==='m-infrastructure'&&meeting.summary===original.summary.replace('تحدد اللجنة ترتيب مراحل التنفيذ.','يُعرض على معاليه ترتيب مراحل التنفيذ.'))meeting.summary=original.summary;
 }
 for(const council of state.councils){
   if(council.chair===originalTitle&&seed.councils.some(c=>c.id===council.id&&c.chair==='وزير البلديات والإسكان'))council.chair='وزير البلديات والإسكان';
 }
 return state;
}
const routes = {home:'نظرة عامة',schedule:'الجدولة الذكية',content:'المحتوى التنفيذي',directives:'متابعة التوجيهات',councils:'المجالس واللجان',minister:'موجز القيادة',ai:'الذكاء الاصطناعي'};
const routeIcon = {home:'layout',schedule:'calendar',content:'files',directives:'checklist',councils:'building',minister:'phone',ai:'sparkles'};
let view = routes[location.hash.slice(1)] ? location.hash.slice(1) : 'home';
const esc = (str='') => String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){try {localStorage.setItem(storeKey,JSON.stringify(S));} catch {toast('تعذّر حفظ التغيير في هذا المتصفح.');}}
function n(v){ return new Intl.NumberFormat('en-US').format(v); }
function prettyDate(iso){if(!iso) return 'غير محدد';return new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z'));}
const art={
layout:'<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M7.5 3v4m9-4v4M3 10h18m-13 4h2m4 0h2m-8 3h2"/>',
files:'<path d="M7 3h7l5 5v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 12h7m-7 3h5"/><path d="M3 8v12a2 2 0 0 0 2 2h9"/>',
checklist:'<rect x="5" y="4" width="15" height="17" rx="2"/><rect x="9" y="2.5" width="7" height="3.5" rx="1" fill="var(--iconfill,none)"/><path d="m8.2 12 2 2 4-4m-6 7h8"/>',
building:'<path d="m3 8 9-5 9 5H3zm2 10V11m5 7v-7m4 7v-7m5 7v-7M3 21h18M4 18h16"/>',
phone:'<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10 5h4m-3 13h2"/>',
sparkles:'<path d="m12 3 1.6 5.1L18 10l-4.4 1.9L12 17l-1.6-5.1L6 10l4.4-1.9zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM19 2l.8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8z"/>',
search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 4.5 4.5"/>',
bell:'<path d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7.5-2.5 9h17C20.5 16.5 18 16 18 9ZM10 21h4"/>',
menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
brief:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M3 11c5 4 13 4 18 0m-9 0v3"/>',
pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2.5"/>',
users:'<circle cx="9" cy="8" r="3.3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M16 5a3.3 3.3 0 0 1 0 6m2 3a4 4 0 0 1 3 4v2"/>',
alert:'<path d="m10.3 4.3-8 13.9a1.7 1.7 0 0 0 1.5 2.5h16.4a1.7 1.7 0 0 0 1.5-2.5l-8-13.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 3v.2"/>',
check:'<path d="m4 12 5 5L20 6"/>',plus:'<path d="M12 4v16M4 12h16"/>',
'chevron-left':'<path d="m14 6-6 6 6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',
chart:'<path d="M4 3v18h17M8 16v-4m5 4V7m5 9v-6"/>',list:'<path d="M9 6h12M9 12h12M9 18h12m-18-12h1m-1 6h1m-1 6h1"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2m0-16-2 2M6 18l-2 2"/>',
flag:'<path d="M5 21V4c4-5 9 4 15 0v10c-6 4-11-5-15 0"/>',
dot:'<circle cx="12" cy="12" r="3"/>',layers:'<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5m-18 4 9 5 9-5"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
notes:'<path d="M4 4h16v13l-4 4H4zM16 21v-4h4M8 8h8m-8 4h8"/>',
conflict:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18m-9 3v3m0 2v.2"/>',
trend:'<path d="m3 17 6-6 4 3 8-9m0 6V5h-6"/>',shield:'<path d="m12 2 8 4v5c0 4-3 8-8 11-5-3-8-7-8-11V6z"/><path d="m8 11 3 3 5-6"/>',
filter:'<path d="M3 6h18M6 12h12M9 18h6"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
book:'<path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2Z"/>'
};
art.file=art.document=art.files;art.location=art.pin;art.team=art.users;art.time=art.clock;art.x=art.close;art['chevron-down']=art.down;
function icon(key,size=20){return '<svg class="ico" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(art[key]||art.layers)+'</svg>';}
function go(next){ if(!routes[next])return; closeModal();toggleNav(false);if(view!==next){location.hash=next;}else{render();window.scrollTo({top:0});} }
window.addEventListener('hashchange',()=>{view=routes[location.hash.slice(1)]?location.hash.slice(1):'home';closeModal();render();window.scrollTo({top:0});});
function toggleNav(force){const open=force??!document.body.classList.contains('nav-open');document.body.classList.toggle('nav-open',open);document.querySelector('#scrim').hidden=!open;document.getElementById('mobileNavBtn')?.setAttribute('aria-expanded',open);}
let dialogReturn=null;
function modal(title,bodyHTML){const d=document.querySelector('#dialog');if(!d.open)dialogReturn=document.activeElement;document.querySelector('#dialogTitle').textContent=title;document.querySelector('#dialogBody').innerHTML=bodyHTML;document.querySelector('#dialogClose').innerHTML=icon('close',19);if(!d.open)d.showModal();d.scrollTop=0;document.querySelector('#dialogBody').scrollTop=0;}
function closeModal(){const d=document.querySelector('#dialog');if(d?.open)d.close();}
document.querySelector('#dialog').addEventListener('close',()=>{if(dialogReturn?.isConnected)dialogReturn.focus({preventScroll:true});dialogReturn=null;});
document.querySelector('#dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientY<r.top||e.clientX>r.right||e.clientY>r.bottom)closeModal();}});
let toastTime;
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTime);toastTime=setTimeout(()=>el.classList.remove('show'),3400);}
const meetingsToday=()=>S.meetings.filter(m=>m.date===today && !['pending','declined'].includes(m.invite)).sort((a,b)=>a.time.localeCompare(b.time));
const activeDirectives=()=>S.directives.filter(d=>d.status!=='مكتمل');
const overdue=()=>activeDirectives().filter(d=>d.deadline&&d.deadline<today).sort((a,b)=>a.deadline.localeCompare(b.deadline));
const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
function overlapping(m){const a=minutes(m.time);return S.meetings.find(v=>v.id!==m.id&&v.date===m.date&&!['pending','declined'].includes(v.invite)&&a<minutes(v.time)+Number(v.duration)&&minutes(v.time)<a+Number(m.duration));}
function attention(){const list=[];const conflicts=S.meetings.filter(m=>m.invite==='pending'&&overlapping(m));if(conflicts.length)list.push({key:'cl-'+conflicts[0].id,title:'تعارض في جدول المواعيد',sub:conflicts[0].title,tone:'amber',icon:'conflict',meta:'جدولة',act:()=>openMeeting(conflicts[0].id,'invite')});const finding=meetingsToday().find(m=>m.finding)||S.meetings.find(m=>m.finding&&m.date>=today&&m.invite!=='declined');if(finding)list.push({key:'fi-'+finding.id,title:'تباين في بيانات العرض',sub:finding.title,tone:'violet',icon:'sparkles',meta:'تحليل المحتوى',act:()=>openMeeting(finding.id,'analysis')});const late=overdue();if(late.length)list.push({key:'du-'+late[0].id,title:'توجيه تجاوز موعد التنفيذ',sub:late[0].title,tone:'rose',icon:'flag',meta:'متابعة',act:()=>openDirective(late[0].id)});return list;}
function attendClick(i){attention()[i]?.act();}
function navBtn(key){return '<button class="nav-item '+(view===key?'active':'')+'" '+(view===key?'aria-current="page" ':'')+'onclick="go(\''+key+'\')">'+icon(routeIcon[key],21)+'<span>'+routes[key]+'</span></button>';}
function renderShell(){document.getElementById('rail').innerHTML='<div class="rail-inner"><a class="brand" href="#home" onclick="toggleNav(false)"><img src="mark.svg" width="44" height="48" alt=""><div><b>ديوان</b><small>المكتب التنفيذي</small></div></a><div class="nav-sect">مساحة العمل</div><nav>'+['home','ai','schedule','content','directives','councils'].map(navBtn).join('')+'</nav><div class="nav-line"></div><div class="nav-sect">الوصول السريع</div><nav>'+navBtn('minister')+'</nav><div class="rail-bottom"><div class="profile"><span class="avatar">'+icon('user',21)+'</span><div><strong>مدير المكتب</strong><small>وزارة البلديات والإسكان</small></div></div></div></div>';
const act=attention();const unread=act.some(a=>!(S.readAlerts||[]).includes(a.key));document.getElementById('topbar').innerHTML='<div class="crumb"><button id="mobileNavBtn" onclick="toggleNav()" class="iconbtn menu-toggle" aria-label="فتح القائمة" aria-controls="rail" aria-expanded="false">'+icon('menu')+'</button><span class="crumb-home">مساحة العمل</span><i class="crumb-divider">/</i><strong>'+routes[view]+'</strong></div><div class="tools"><span class="header-date">'+icon('calendar',16)+'الأربعاء، 25 نوفمبر 2026</span><span class="tool-divider"></span><button class="iconbtn" title="بحث" aria-label="بحث في ديوان" onclick="openSearch()">'+icon('search')+'</button><button class="iconbtn notif" title="الإشعارات" aria-label="الإشعارات" onclick="showAlerts()">'+icon('bell')+(unread?'<i></i>':'')+'</button></div>';}
function render(){renderShell();const pages={home:homePage,schedule:schedulePage,content:contentPage,directives:directivesPage,councils:councilsPage,minister:ministerPage,ai:aiPage};document.getElementById('main').innerHTML=pages[view]();document.title=routes[view]+' | ديوان';}
function showAlerts(){const items=attention();S.readAlerts=[...new Set([...(S.readAlerts||[]),...items.map(a=>a.key)])];persist();renderShell();modal('إشعارات المكتب',items.length?'<div class="alertlist">'+items.map(actionRow).join('')+'</div>':'<div class="empty">لا توجد إشعارات تستدعي المتابعة.</div>');}
function actionRow(a,i){return '<button class="actionrow" onclick="attendClick('+i+')"><span class="actionicon '+a.tone+'">'+icon(a.icon,19)+'</span><span class="actiontext"><b>'+esc(a.title)+'</b><small>'+esc(a.sub)+'</small></span><span class="endmark">'+icon('chevron-left',15)+'</span></button>';}
function searchItems(){return [...S.meetings.filter(m=>m.invite!=='declined').map(a=>({label:a.title,info:a.sector+' · '+prettyDate(a.date),group:'اجتماع',kind:'meeting',id:a.id})),...S.directives.map(a=>({label:a.title,info:a.owner+' · '+a.status,group:'توجيه',kind:'directive',id:a.id})),...S.councils.map(a=>({label:a.name,info:a.chair,group:'مجلس أو لجنة',kind:'council',id:a.id}))];}
const normalizeAr=v=>String(v||'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\u064B-\u065F]/g,'').toLowerCase().trim();
let searchHits=[];
function updateSearch(q){const k=normalizeAr(q); searchHits=searchItems().filter(a=>normalizeAr([a.label,a.info,a.group].join(' ')).includes(k)).slice(0,20);
document.getElementById('searchHits').innerHTML=searchHits.length?searchHits.map((a,i)=>'<button class="searchhit" onclick="chooseSearch('+i+')"><span class="searchglyph">'+icon(({meeting:'calendar',directive:'checklist',council:'building'})[a.kind],20)+'</span><span><b>'+esc(a.label)+'</b><small>'+esc(a.group)+' · '+esc(a.info)+'</small></span></button>').join(''):'<div class="empty">لا توجد نتائج مطابقة.</div>';}
function openSearch(){modal('البحث في ديوان','<label class="searchbox">'+icon('search')+'<input id="gsearch" type="search" placeholder="ابحث عن اجتماع أو توجيه أو لجنة…" aria-label="نص البحث" oninput="updateSearch(this.value)"></label><div class="searchhits" id="searchHits"></div>');updateSearch('');document.getElementById('gsearch').focus();}
function chooseSearch(i){const a=searchHits[i];if(a.kind==='meeting')openMeeting(a.id);if(a.kind==='directive')openDirective(a.id);if(a.kind==='council')openCouncil(a.id);}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape'&&document.body.classList.contains('nav-open'))toggleNav(false);});
function safeArg(v){return esc(JSON.stringify(String(v)));}
function tn(m){const h=Number(m.time.split(':')[0]);return {t:String(h%12||12).padStart(2,'0')+':'+m.time.slice(3,5),a:h>=12?'م':'ص'};}
function homeMeeting(m,i){const time=tn(m),theme=m.category==='استراتيجي'?'green':m.category==='تشغيلي'?'blue':'purple';return '<button class="agenda-row" onclick="openMeeting('+safeArg(m.id)+')"><span class="timebox"><b dir="ltr">'+esc(time.t)+'</b><small>'+time.a+'</small></span><span class="time-track"><i></i></span><span class="eventtext"><strong>'+esc(m.title)+'</strong><small>'+icon('pin',13)+esc(m.location||m.sector)+'<span>·</span>'+n(m.duration)+' دقيقة</small></span><span class="typebadge '+theme+'">'+esc(m.category)+'</span></button>';}
function homeStat(label,value,caption,ico,tone,route){return '<button class="stat" onclick="go(\''+route+'\')"><span class="stat-title"><span class="sticon '+tone+'">'+icon(ico,20)+'</span><span>'+label+'</span></span><strong class="stat-num" dir="ltr">'+n(value)+'</strong><small>'+esc(caption)+'</small></button>';}
function weekStats(){const records=S.meetings.filter(m=>!['pending','declined'].includes(m.invite)&&m.date>='2026-11-22'&&m.date<='2026-11-28');const entries={};records.forEach(x=>entries[x.sector]=(entries[x.sector]||0)+Number(x.duration));return Object.entries(entries).sort((a,b)=>b[1]-a[1]);}
function homeTimePanel(){const groups=weekStats(), total=groups.reduce((v,x)=>v+x[1],0);
 const shares=groups.map(([,value])=>value/total*100),labels=shares.map(Math.floor);
 const order=shares.map((s,i)=>({i,f:s-labels[i]})).sort((a,b)=>b.f-a.f);
 const remaining=100-labels.reduce((a,b)=>a+b,0);order.slice(0,remaining).forEach(x=>labels[x.i]++);
 return '<section class="panel sector-panel"><div class="panel-heading"><div><h2>توزيع وقت الاجتماعات</h2><p>الوقت المجدول لهذا الأسبوع حسب القطاع</p></div><span class="mini-icon">'+icon('chart',19)+'</span></div><div class="sectorbars">'+groups.map(([k,v],i)=>'<div class="sectorline"><span>'+esc(k)+'</span><div class="bartrack"><i style="width:'+Math.max(2,Math.round(v/Math.max(groups[0][1],1)*100))+'%;--bar:'+['#37796e','#6d9991','#98b4aa','#a99868','#9facb7'][i%5]+'"></i></div><b>'+labels[i]+'%</b></div>').join('')+'</div></section>';}
function officeBriefInsights(records){
 const labels={decision:'قرار',action:'تكليف',risk:'مخاطر'};
 const signals=[];
 for(const m of records){
   const source = m.minutes ?? m.transcript;
   if(!source || !window.DiwanAI)continue;
   const result=DiwanAI.analyze(source);
   for(const it of result.items)if(labels[it.kind])signals.push({item:it,meeting:m});
 }
 if(!signals.length)return '';
 const choices=['risk','decision','action'].map(k=>signals.find(x=>x.item.kind===k)).filter(Boolean);
 const rows=choices.map(({item,meeting})=>'<button type="button" class="brief-signal" onclick="openAIWorkspace('+safeArg(meeting.id)+',&quot;minutes&quot;)"><span class="signal-tag '+item.kind+'">'+labels[item.kind]+'</span><span><b>'+esc(item.text)+'</b><small>'+esc(meeting.title)+'</small></span></button>').join('');
 return '<section class="brief-ai"><div class="brief-ai-title">'+icon('sparkles',18)+'<h3>من تحليل المحاضر</h3></div>'+rows+'</section>';
}
function homeAITools(){
 const tools = [
   {title:'تحليل محضر اجتماع',detail:'استخرج القرارات والتكليفات والمخاطر من النص.',symbol:'notes',click:"openAIWorkspace(undefined,'minutes')"},
   {title:'مقارنة مؤشرات تقريرين',detail:'راجع اختلاف الأرقام والعبارة التي ورد فيها كل رقم.',symbol:'chart',click:"openAIWorkspace(undefined,'compare')"},
   {title:'البحث عن سابقة',detail:'اعثر على قرارات وتوجيهات مرتبطة بموضوعك.',symbol:'layers',click:'openPrecedents()'}
 ];
 return '<section class="home-ai" aria-labelledby="homeAIHeading"><div class="home-ai-heading"><span class="home-ai-symbol">'+icon('sparkles',19)+'</span><h2 id="homeAIHeading">أدوات الذكاء الاصطناعي</h2></div><div class="home-ai-tools">'+tools.map(t=>'<button onclick="'+t.click+'"><span class="home-ai-tool-icon">'+icon(t.symbol,19)+'</span><span><b>'+t.title+'</b><small>'+t.detail+'</small></span></button>').join('')+'</div></section>';
}
function homePage(){const ms=meetingsToday(),act=attention(),open=activeDirectives(),late=overdue(),findings=ms.filter(m=>m.finding).length,pending=S.meetings.filter(m=>m.invite==='pending').length,hold=Math.round(ms.reduce((v,m)=>v+Number(m.duration),0));const totalDocs=S.meetings.filter(m=>!['pending','declined'].includes(m.invite)&&m.summary).length;
return '<section class="hero"><img class="hero-art" src="riyadh.webp" alt=""><div class="hero-content"><div class="hero-kicker"><i></i>الإحاطة الصباحية</div><h1>لوحة المكتب التنفيذي</h1><p>اجتماعات اليوم والقرارات التي تتطلب متابعة في وزارة البلديات والإسكان.</p><button class="hero-btn" onclick="openDailyBrief(\'day\',today)">'+icon('notes',17)+'عرض الموجز اليومي</button></div></section>'+
homeAITools()+'<div class="section-label"><span></span><h2>المؤشرات الرئيسية</h2></div><section class="stats" aria-label="المؤشرات الرئيسية">'+homeStat('اجتماعات اليوم',ms.length,hold+' دقيقة مجدولة','calendar','mint','schedule')+homeStat('التوجيهات النشطة',open.length,late.length===2?'توجيهان تجاوزا موعد التنفيذ':late.length===1?'توجيه واحد تجاوز موعد التنفيذ':late.length?n(late.length)+' توجيهات تجاوزت موعد التنفيذ':'جميع التوجيهات ضمن الموعد','checklist','blue','directives')+homeStat('ملفات الاجتماعات',totalDocs,findings===1?'ملف واحد يحتاج إلى مراجعة':findings?n(findings)+' ملفات تحتاج إلى مراجعة':'اكتملت مراجعة ملفات اليوم','files','violet','content')+homeStat('المجالس واللجان',S.councils.length,S.councils.filter(c=>c.type==='داخلي').length+' داخلية · '+S.councils.filter(c=>c.type==='خارجي').length+' خارجية','building','amber','councils')+'</section>'+
'<div class="primary-grid"><section class="panel daypanel"><div class="panel-heading"><div><div class="panel-kicker"><span></span>الجدولة الذكية</div><h2>اجتماعات اليوم</h2></div><button class="panel-link" onclick="go(\'schedule\')">عرض الجدول</button></div><div class="agenda-list">'+(ms.length?ms.map(homeMeeting).join(''):'<div class="empty">لا توجد اجتماعات مؤكدة لهذا اليوم.</div>')+'</div></section><section class="panel attentionpanel"><div class="panel-heading"><div><div class="panel-kicker sand"><span></span>أولويات المكتب</div><h2>يتطلب انتباهك</h2></div><span class="count-badge" aria-label="عدد التنبيهات">'+act.length+'</span></div><div class="alertlist">'+(act.length?act.map(actionRow).join(''):'<div class="empty">لا توجد عناصر تستدعي المتابعة.</div>')+'</div><button class="allalerts" onclick="showAlerts()">'+icon('bell',15)+'عرض الإشعارات</button></section></div>'+
'<div class="secondary-grid">'+homeTimePanel()+'<section class="panel status-panel"><div class="panel-heading"><div><h2>حالة تنفيذ التوجيهات</h2><p>توزيع التوجيهات حسب حالة التنفيذ</p></div><span class="mini-icon">'+icon('checklist',20)+'</span></div>'+directiveSummary()+'</section></div>';}
function directiveSummary(){const states=['قيد التنفيذ','بانتظار البدء','مكتمل'];const values=states.map(s=>S.directives.filter(d=>d.status===s).length),total=values.reduce((a,b)=>a+b,0);return '<div class="statbar">'+values.map((v,i)=>'<i style="flex:'+v+';background:'+['#5b8093','#d1b87c','#5c9786'][i]+'"></i>').join('')+'</div><div class="legend">'+states.map((s,i)=>'<div><i style="background:'+['#5b8093','#d1b87c','#5c9786'][i]+'"></i><span>'+s+'</span><b>'+n(values[i])+'</b></div>').join('')+'</div>';}
render();
