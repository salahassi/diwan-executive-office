/* The schedule and content library share a single meeting record and its source materials. */
let scheduleDay = '';
let libraryFilter = 'all';
let libraryQuery = '';
let currentBriefPeriod = 'day';
const meetingCategories = ['استراتيجي', 'تشغيلي', 'تميّز مؤسسي'];
const meetingDateFmt = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC' });
const meetingMonthFmt = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const meetingWeekday = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { weekday: 'long', timeZone: 'UTC' });
const meetI = (name, size=18) => icon(name, size);
const meetText = value => esc(String(value ?? ''));
const meetNow = () => scheduleDay || today;
const meetDate = iso => new Date(iso + 'T12:00:00Z');
const meetISO = d => d.toISOString().slice(0, 10);
function meetShift(iso, count) { const d=meetDate(iso); d.setUTCDate(d.getUTCDate()+count); return meetISO(d); }
function meetWeekStart(iso) { return meetShift(iso, -meetDate(iso).getUTCDay()); }
function meetTime(raw) { const [h,m]=String(raw || '00:00').split(':').map(Number); return h*60 + (m||0); }
function meetTimeStr(minutes) { return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0'); }
function meetTimeDisplay(raw) { const t=meetTime(raw), h=Math.floor(t/60); return (h%12||12)+':'+String(t%60).padStart(2,'0')+' '+(h<12?'ص':'م'); }
function meetDateDisplay(iso) { return meetingDateFmt.format(meetDate(iso)); }
function meetDuration(value) { if(value<60)return value+' دقيقة'; const hours=Math.floor(value/60),rest=value%60;const hourText=hours===1?'ساعة':hours===2?'ساعتان':hours+' ساعات'; return hourText + (rest?' و'+rest+' دقيقة':''); }
function meetMeetings() { return S.meetings || []; }
function meetFind(id) { return meetMeetings().find(m=>String(m.id)===String(id)); }
function meetConfirmed() { return meetMeetings().filter(m=>m.invite!=='pending' && m.invite!=='declined'); }
function meetSort(arr) { return arr.slice().sort((a,b)=>(a.date+' '+a.time).localeCompare(b.date+' '+b.time)); }
function meetAct(action, label, props={}, css='btn secondary') {
 const attrs=Object.entries(props).map(([key,value])=>'data-meet-'+key+'="'+meetText(value)+'"').join(' ');
 return '<button type="button" class="'+css+'" data-meet-action="'+action+'" '+attrs+'>'+label+'</button>';
}
function meetEmpty(message) { return '<div class="meet-empty">'+meetI('calendar',24)+'<p>'+meetText(message)+'</p></div>'; }
function meetDateRange(iso, period) {
 if(period==='week'){const start=meetWeekStart(iso);return [start,meetShift(start,6)];}
 if(period==='month'){const d=meetDate(iso);d.setUTCMonth(d.getUTCMonth()+1,0);return [iso.slice(0,8)+'01',meetISO(d)];}
 return [iso,iso];
}
function meetPeriodMeetings(date,period) {
 const [start,end]=meetDateRange(date,period);
 return meetSort(meetConfirmed().filter(m=>m.date>=start && m.date<=end));
}
function meetRangeText(date,period) {
 const [s,e]=meetDateRange(date,period);
 return period==='month'?meetingMonthFmt.format(meetDate(date)):period==='week'?meetDateDisplay(s)+' – '+meetDateDisplay(e):meetDateDisplay(date);
}
function meetPeriodBar(selected,action) {
 return '<div class="meet-segments" aria-label="فترة الموجز">'+[['day','يومي'],['week','أسبوعي'],['month','شهري']].map(([key,label])=>meetAct(action,label,{period:key},key===selected?'selected':'')).join('')+'</div>';
}
function meetTimeBars(records) {
 const sectors=new Map();let total=0;
 records.forEach(m=>{const minutes=Number(m.duration || 30);total+=minutes;sectors.set(m.sector || 'المكتب التنفيذي',(sectors.get(m.sector || 'المكتب التنفيذي')||0)+minutes);});
 if(!total) return '<p class="meet-subtle">يظهر توزيع الوقت بعد إضافة الاجتماعات.</p>';
 return '<div class="meet-bars">'+[...sectors].sort((a,b)=>b[1]-a[1]).map(([sector,min],i)=>'<div><div class="meet-bar-label"><span>'+meetText(sector)+'</span><span>'+meetText(meetDuration(min))+'</span></div><div class="meet-track"><i style="width:'+Math.round(min/total*100)+'%;background:var(--meet-bar-'+(i%4)+')"></i></div></div>').join('')+'</div>';
}
function meetCheckOverlap(date,time,duration,exceptId) {
 const start=meetTime(time),end=start+Number(duration);
 return meetConfirmed().filter(m=>m.date===date&&String(m.id)!==String(exceptId)&&meetTime(m.time)<end&&meetTime(m.time)+Number(m.duration||30)>start);
}
function meetNextSlot(date,time,duration,exceptId) {
 for(let offset=0;offset<14;offset++) {
  const candidate=meetShift(date,offset);
  if(offset && [5,6].includes(meetDate(candidate).getUTCDay())) continue;
  const first=offset?480:Math.max(480,Math.ceil(meetTime(time)/15)*15);
  for(let from=first;from+duration<=1080;from+=15){
   const slot=meetTimeStr(from);
   if(!meetCheckOverlap(candidate,slot,duration,exceptId).length) return {date:candidate,time:slot};
  }
 }
 return null;
}
function meetTag(txt,kind='') { return '<span class="meet-tag '+kind+'">'+meetText(txt)+'</span>'; }
function meetAgendaRow(m,withDate=false) {
 return '<button class="meet-agenda-row" type="button" data-meet-action="open" data-meet-id="'+meetText(m.id)+'"><span class="meet-hour"><b>'+meetText(meetTimeDisplay(m.time))+'</b><small>'+meetText(withDate?meetDateDisplay(m.date):meetDuration(Number(m.duration||30)))+'</small></span><span class="meet-row-copy"><strong>'+meetText(m.title)+'</strong><small>'+meetText(m.sector)+(m.location?' · '+meetText(m.location):'')+'</small></span>'+meetTag(m.category||'اجتماع','category')+meetI('chevron-left',16)+'</button>';
}
function schedulePage() {
 const date=meetNow(), start=meetWeekStart(date), records=meetPeriodMeetings(date,'day');
 const pending=meetSort(meetMeetings().filter(m=>m.invite==='pending'));
 const dateRail=Array.from({length:7},(_,i)=>{const iso=meetShift(start,i),d=meetDate(iso);const count=meetConfirmed().filter(x=>x.date===iso).length;return '<button type="button" aria-pressed="'+(iso===date)+'" data-meet-action="day" data-meet-date="'+iso+'" class="meet-day '+(iso===date?'selected':'')+'"><small>'+meetingWeekday.format(d)+'</small><b>'+d.getUTCDate()+'</b><span class="meet-day-mark '+(count?'has-meetings':'')+'"></span></button>';}).join('');
 return '<section class="meet-page"><div class="page-head meet-page-head"><div><h1>الجدولة الذكية</h1><p>راجع الدعوات المتعارضة وتوزيع وقت الاجتماعات بين القطاعات.</p></div><div class="meet-actions">'+meetAct('daily',meetI('file')+'الموجز التنفيذي',{date},'btn secondary')+meetAct('calendar-import',meetI('calendar')+'استيراد من التقويم',{},'btn secondary')+meetAct('new',meetI('plus')+'إضافة اجتماع',{},'btn primary')+'</div></div><div class="meet-dashboard"><div class="panel meet-panel"><div class="meet-section-head"><div><h2>جدول الاجتماعات</h2><p>'+meetText(meetingMonthFmt.format(meetDate(date)))+'</p></div><div class="meet-navigation">'+meetAct('shift','الأسبوع السابق',{delta:-7},'meet-nav-text')+meetAct('today','اليوم',{},'meet-nav-text')+meetAct('shift','الأسبوع التالي',{delta:7},'meet-nav-text')+'</div></div><div class="meet-date-rail">'+dateRail+'</div><div class="meet-section-head meet-list-heading"><h3>'+meetText(meetDateDisplay(date))+'</h3><small>'+records.length+' اجتماعات</small></div><div>'+ (records.map(m=>meetAgendaRow(m)).join('') || meetEmpty('لا توجد اجتماعات مؤكدة في هذا اليوم.'))+'</div></div><aside class="meet-side"><div class="panel meet-panel"><div class="meet-section-head"><h2>دعوات بانتظار القرار</h2>'+meetTag(pending.length,'count')+'</div>'+ (pending.map(m=>{const clashes=meetCheckOverlap(m.date,m.time,m.duration,m.id);return '<div class="meet-invite"><div>'+meetTag(clashes.length?'تعارض في الجدول':'دعوة جديدة',clashes.length?'attention':'category')+'</div><h3>'+meetText(m.title)+'</h3><small>'+meetText(meetDateDisplay(m.date))+' · '+meetText(meetTimeDisplay(m.time))+'</small>'+meetAct('invitation','مراجعة الدعوة',{id:m.id},'meet-link')+'</div>';}).join('')||'<p class="meet-subtle">تمت مراجعة جميع الدعوات.</p>')+'</div><div class="panel meet-panel"><div class="meet-section-head"><h2>توزيع الوقت حسب القطاع</h2></div>'+meetPeriodBar(currentBriefPeriod,'chart-period')+meetTimeBars(meetPeriodMeetings(date,currentBriefPeriod))+'</div></aside></div></section>';
}
function meetMonthLabel(m) { return meetDateDisplay(m.date)+' · '+meetTimeDisplay(m.time); }
function meetLibraryRecords() {
 const q=libraryQuery.trim();
 const records=meetConfirmed().filter(m=>(libraryFilter==='all'||(libraryFilter==='findings'&&m.finding)||(libraryFilter==='today'&&m.date===today))&&(!q||[m.title,m.sector,m.summary].filter(Boolean).join(' ').includes(q)));
 return records.sort((a,b)=>{
  const group=m=>m.date===today?0:m.date>today?1:2;
  return group(a)-group(b)||(group(a)===2?b.date.localeCompare(a.date):a.date.localeCompare(b.date))||a.time.localeCompare(b.time);
 });
}
function meetLibraryCards() {
 const meetings=meetLibraryRecords();
 if(!meetings.length)return meetEmpty('لا توجد ملفات اجتماعات تطابق اختيارك.');
 return meetings.map(m=>'<article class="meet-library-card"><div class="meet-card-top"><span class="meet-doc-icon">'+meetI('file',23)+'</span>'+meetTag(m.finding?'يحتاج مراجعة':m.summary?'جاهز للتحضير':'بانتظار المحتوى',m.finding?'attention':'category')+'</div><div class="meet-card-main"><small>'+meetText(m.sector||'المكتب التنفيذي')+'</small><h2>'+meetText(m.title)+'</h2><p>'+meetText(m.summary||'يمكن إضافة محضر الاجتماع واستخراج التوجيهات من ملف التحضير.')+'</p></div><div class="meet-card-footer"><span>'+meetI('calendar',15)+meetText(meetDateDisplay(m.date))+'</span>'+meetAct('open','فتح الملف',{id:m.id},'meet-link')+'</div></article>').join('');
}
function contentPage() {
 return '<section class="meet-page"><div class="page-head meet-page-head"><div><h1>المحتوى التنفيذي</h1><p>ملفات التحضير، وملخصات العروض، والملاحظات التي تحتاج مراجعة قبل الاجتماع.</p></div><div class="meet-actions">'+meetAct('studio-home',meetI('sparkles',17)+'فتح محلّل المكتب',{},'btn primary')+'</div></div><div class="meet-library-tools"><div class="meet-segments">'+[['all','جميع الملفات'],['today','اجتماعات اليوم'],['findings','تحتاج مراجعة']].map(([k,v])=>meetAct('library-filter',v,{filter:k},k===libraryFilter?'selected':'')).join('')+'</div><label class="meet-search">'+meetI('search',18)+'<input id="meet-library-search" type="search" placeholder="بحث في الملفات" aria-label="بحث في ملفات الاجتماعات" value="'+meetText(libraryQuery)+'"></label></div><div class="meet-library-grid" id="meet-library-records">'+meetLibraryCards()+'</div></section>';
}
function meetRecommendation(m) {
 if(m.recommendation) return m.recommendation;
 const category=String(m.category||'');
 const sector=m.sector||'القطاع المعني';
 if(category.includes('استراتيج')) return 'تحتاج البنود الاستراتيجية إلى صاحب صلاحية القرار وممثل '+sector+' لعرض أثر البدائل.';
 if(category.includes('تشغيل'))return 'يمكن إسناد المتابعة التشغيلية إلى ممثل '+sector+' وإحالة البنود التي تحتاج اعتمادًا إلى رئيس الاجتماع.';
 return 'يُقترح إشراك ممثل '+sector+' لشرح مؤشرات الأداء وتوثيق القرار المطلوب.';
}
function meetPeople(m) {const p=m.people||[];return p.length?p.map(x=>meetTag(x)).join(''):'<span class="meet-subtle">لم يُحدَّد الحضور بعد.</span>';}
function meetAgenda(m) {return m.agenda?.length?'<ol class="meet-ordered">'+m.agenda.map(a=>'<li>'+meetText(a)+'</li>').join('')+'</ol>':'<p class="meet-subtle">لم يضف المكتب بنودًا إلى جدول الأعمال بعد.</p>';}
function meetBriefTab(m) {
 return '<div class="meet-highlight"><div class="meet-label">'+meetI('file',17)+'الموجز التنفيذي</div><p>'+meetText(m.summary || 'لم يُضف ملخص لهذا الاجتماع بعد.')+'</p></div><div class="meet-ai-shortcut">'+meetAct('precedents',meetI('search',16)+'استرجاع السوابق',{id:m.id},'btn secondary')+'</div><section class="meet-block"><h3>محاور النقاش</h3>'+meetAgenda(m)+'</section><section class="meet-block"><h3>توصية الحضور</h3><p>'+meetText(meetRecommendation(m))+'</p><div class="meet-chips">'+meetPeople(m)+'</div></section>';
}
function meetFinding(m) {
 const f=m.finding;
 if(!f)return '<div class="meet-highlight"><div class="meet-label">'+meetI('check',18)+'مراجعة المحتوى</div><p>'+(m.summary?'لا يحتوي ملف التحضير التجريبي على تنبيهات مسجلة.':'لم تُرفق مواد تحليل لهذا الاجتماع بعد.')+'</p></div>';
 const comparison = Array.isArray(f.readings) ? '<div class="source-compare">'+f.readings.map((r,i)=>'<div class="source-value"><small>'+meetText(r.label)+'</small><b dir="ltr">'+meetText(r.value)+'%</b><div><i style="width:'+Math.min(100,Math.max(0,Number(r.value)||0))+'%;background:'+(i?'#497c8a':'#aa894b')+'"></i></div><span>'+meetText(r.ref)+'</span></div>').join('')+'</div>' : '';
 return '<div class="meet-finding"><div class="meet-label">'+meetI('alert',18)+'نقطة تحتاج التحقق</div><h3>'+meetText(f.title)+'</h3>'+comparison+'<p>'+meetText(f.detail)+'</p><div class="meet-source"><strong>المصدر المرجعي</strong><span>'+meetText(f.source||'العرض المرفق بالاجتماع')+'</span></div></div>';
}
function meetAnalysisTab(m) {
 const question=m.question||(m.finding?'أيّ المصدرين يُعتمد، ومن يتولى التحقق من القياس؟':'ما الإجراء الذي يستدعي اعتمادًا بعد مراجعة المواد؟');
 const compare=meetAct('studio',meetI('sparkles',17)+'مقارنة الأرقام في محلّل المكتب',{id:m.id,mode:'compare'},'btn secondary');
 return meetFinding(m)+'<div class="meet-ai-shortcut">'+compare+'</div>'+meetMaterials(m)+
  (m.value?'<section class="meet-block"><h3>أهمية العرض</h3><p>'+meetText(m.value)+'</p></section>':'')+
  '<section class="meet-block"><h3>سؤال مقترح للنقاش</h3><p>'+meetText(question)+'</p></section>';
}
function meetSeedMinutes(m) {
 if(m.minutes!==undefined)return String(m.minutes||'');
 return String(m.transcript||'');
}
function meetMinutesResults(m, linked) {
 const report=m.minuteReview;
 if(!report) {
  return m.extractionDone ? '<p class="meet-subtle">أعد تحليل المحضر لعرض النتائج المرتبطة بعبارات المصدر.</p>' : '';
 }
 const counts={action:0,decision:0,risk:0};
 const entries=report.items||[];
 entries.forEach(item=>{if(Object.hasOwn(counts,item.kind))counts[item.kind]++;});
 const labels={action:'تكليف',decision:'قرار',risk:'مخاطر'};
 const countBar=Object.keys(labels).map(k=>'<span><b>'+counts[k]+'</b> '+labels[k]+'</span>').join('');
 const summary=(report.brief||[]).map(sentence=>'<li>'+meetText(sentence)+'</li>').join('');
 const otherEvidence=entries.filter(item=>item.kind==='decision'||item.kind==='risk').map(item=>
  '<li><small>'+meetText(item.kind==='decision'?'قرار':'مخاطر')+' · العبارة '+(item.sentenceIndex+1)+'</small><p>«'+meetText(item.text)+'»</p></li>').join('');
 const linkedAlready=text=>linked.some(d=>d.title===text||d.sourceText===text);
 const proposals=entries.map((item,i)=>{
  if(item.kind!=='action')return '';
  const source='المحضر · العبارة '+(item.sentenceIndex+1);
  const fields=[item.owner&&'الجهة الواردة: '+item.owner,item.deadline&&'الموعد الوارد: '+item.deadline].filter(Boolean).join(' · ');
  const issueButton=linkedAlready(item.text)?meetTag('أُضيف إلى سجل المتابعة','category'):meetAct('issue','مراجعة وإسناد',{id:m.id,index:i},'meet-link');
  return '<div class="meet-candidate"><div><small>'+meetText(source)+'</small><p>«'+meetText(item.text)+'»</p>'+(fields?'<small>'+meetText(fields)+'</small>':'')+'</div>'+issueButton+'</div>';
 }).join('');
 return '<section class="meet-block meet-minute-result" id="meet-reviewed"><div class="meet-section-head"><h3>'+meetI('sparkles',17)+' نتائج التحليل</h3></div><div class="meet-ai-counts">'+countBar+'</div>'+
  (report.truncated?'<p class="meet-subtle">يتجاوز المحضر حدود التحليل المحلي. قسّمه إلى مقاطع لمراجعة بقية النص.</p>':'')+
  (summary?'<h4>موجز من المحضر</h4><ul class="meet-brief-source">'+summary+'</ul>':'')+
  '<h4>التكليفات المقترحة</h4>'+(proposals||'<p class="meet-subtle">لم يتعرّف النموذج على تكليف صريح في النص.</p>')+
  (otherEvidence?'<details class="meet-comparison-proof"><summary>شواهد القرارات والمخاطر</summary><ul class="meet-brief-source">'+otherEvidence+'</ul></details>':'')+'</section>';
}
function meetMinutesTab(m) {
 const text=meetSeedMinutes(m);
 const linked=(S.directives||[]).filter(d=>String(d.meetingId)===String(m.id));
 const related=linked.map(d=>'<div class="meet-extracted"><p>'+meetText(d.title)+'</p>'+meetTag(d.status)+'</div>').join('');
 return '<div class="meet-note-header"><h3>محضر الاجتماع</h3><small>'+(m.minutes===undefined&&text?'محضر تجريبي قابل للتعديل':'نص قابل للتعديل')+'</small></div>'+
  '<label class="meet-text-label" for="meet-minutes">نص المحضر</label><textarea class="meet-input" id="meet-minutes" rows="5" placeholder="الصق نص المحضر. يتعرّف النموذج على التكليفات والقرارات والمخاطر.">'+meetText(text)+'</textarea>'+
  '<div class="meet-actions meet-note-actions">'+meetAct('extract',meetI('sparkles',16)+'تحليل المحضر بالذكاء الاصطناعي',{id:m.id},'btn primary')+meetAct('save-minutes','حفظ المحضر',{id:m.id},'btn secondary')+'</div>'+
  meetMinutesResults(m,linked)+'<div class="meet-ai-shortcut">'+meetAct('studio','فتح المحضر في محلّل المكتب',{id:m.id,mode:'minutes'},'meet-link')+'</div>'+
  '<section class="meet-block"><div class="meet-section-head"><h3>توجيهات مرتبطة بالاجتماع</h3>'+meetAct('manual','إضافة توجيه',{id:m.id},'meet-link')+'</div>'+
  (related||'<p class="meet-subtle">لم يصدر توجيه مرتبط بهذا الاجتماع بعد.</p>')+'</section>';
}
function meetSetMinutes(m,raw) {
 if(m.minutes!==raw) {
  delete m.minuteReview;
  delete m.extracted;
  delete m.extractionDone;
 }
 m.minutes=raw;
}
function openMeeting(id,tab='brief') {
 const m=meetFind(id); if(!m){toast('تعذّر العثور على الاجتماع');return;}
 if(tab==='content'||tab==='findings')tab='analysis';
 if(tab==='directives'||tab==='extract')tab='minutes';
 if(m.invite==='pending' && (tab==='invite'||tab==='brief')){openInvitation(id);return;}
 if(!['brief','analysis','minutes'].includes(tab))tab='brief';
 const tabs=[['brief','ملخص الاجتماع'],['analysis','تحليل المحتوى'],['minutes','المحضر والتوجيهات']];
 const inner=tab==='analysis'?meetAnalysisTab(m):tab==='minutes'?meetMinutesTab(m):meetBriefTab(m);
 modal(m.title,'<div class="meet-dialog"><div class="meet-meta">'+meetTag(m.category||'اجتماع','category')+'<span>'+meetI('calendar',15)+meetText(meetMonthLabel(m))+'</span><span>'+meetI('clock',15)+meetText(meetDuration(Number(m.duration||30)))+'</span>'+(m.location?'<span>'+meetI('pin',15)+meetText(m.location)+'</span>':'')+'</div><div class="meet-tabs" aria-label="أقسام ملف الاجتماع">'+tabs.map(([k,label])=>meetAct('open',label,{id:m.id,tab:k},k===tab?'selected':'')).join('')+'</div>'+inner+'</div>');
}
function openInvitation(id) {
 const m=meetFind(id);if(!m)return;
 if(m.invite!=='pending'){openMeeting(id);return;}
 const clashes=meetCheckOverlap(m.date,m.time,m.duration,m.id);
 const slot=clashes.length?meetNextSlot(m.date,m.time,m.duration,m.id):null;
 const decision=clashes.length?'<div class="meet-finding"><div class="meet-label">'+meetI('alert',18)+'تعارض في الموعد المقترح</div><p>'+clashes.map(x=>meetText(x.title)+' ('+meetText(meetTimeDisplay(x.time))+')').join('، ')+'</p>'+(slot?'<p><strong>الموعد البديل المقترح</strong> · '+meetText(meetDateDisplay(slot.date))+'، '+meetText(meetTimeDisplay(slot.time))+'</p>':'<p>يمكن رفض الدعوة أو اختيار موعد يدوي عند الجدولة.</p>')+'</div>':'<div class="meet-highlight"><div class="meet-label">'+meetI('check',16)+'الموعد متاح في جدول الاجتماعات</div></div>';
 modal('مراجعة الدعوة','<div class="meet-dialog"><h3>'+meetText(m.title)+'</h3><div class="meet-meta"><span>'+meetI('calendar',16)+meetText(meetMonthLabel(m))+'</span><span>'+meetText(meetDuration(Number(m.duration||30)))+'</span></div>'+decision+'<section class="meet-block"><h3>توصية الحضور</h3><p>'+meetText(meetRecommendation(m))+'</p></section><div class="meet-actions">'+(!clashes.length||slot?meetAct('accept',clashes.length?'اعتماد الموعد البديل':'قبول الدعوة',{id:m.id},'btn primary'):'')+meetAct('decline','اعتذار عن الدعوة',{id:m.id},'btn secondary')+'</div></div>');
}
function openDailyBrief(period='day',date) {
 const iso=date||today;
 if(!['day','week','month'].includes(period))period='day';
 const records=meetPeriodMeetings(iso,period), total=records.reduce((s,m)=>s+Number(m.duration||30),0);
 const findings=records.filter(m=>m.finding);
 modal('الموجز التنفيذي للجدول','<div class="meet-dialog"><div class="meet-section-head"><p>'+meetText(meetRangeText(iso,period))+'</p>'+meetPeriodBar(period,'brief-period')+'</div><div class="meet-brief-metrics"><div><b>'+records.length+'</b><small>اجتماعات مؤكدة</small></div><div><b>'+total+'</b><small>دقائق مجدولة</small></div><div><b>'+findings.length+'</b><small>ملفات تحتاج مراجعة</small></div></div>'+officeBriefInsights(records)+'<section class="meet-block"><h3>أبرز الاجتماعات</h3>'+ (records.map(m=>meetAgendaRow(m,period!=='day')).join('')||meetEmpty('لا توجد اجتماعات لهذه الفترة.'))+'</section><section class="meet-block"><h3>توزيع الوقت حسب القطاع</h3>'+meetTimeBars(records)+'</section></div>');
 const periodButtons=document.querySelectorAll('[data-meet-action="brief-period"]');periodButtons.forEach(b=>b.dataset.meetDate=iso);
}
function newMeeting(defaults={}) {
 if(typeof defaults!=='object'||!defaults)defaults={};
 const d=defaults;
 const categories=meetingCategories.map(k=>'<option '+(d.category===k?'selected':'')+'>'+k+'</option>').join('');
 modal('إضافة اجتماع','<form id="meet-new-form" class="meet-form" data-meet-council="'+meetText(d.councilId||'')+'"><div class="meet-form-grid"><label class="wide">عنوان الاجتماع<input name="title" required maxlength="150" value="'+meetText(d.title||'')+'" placeholder="أدخل عنوانًا واضحًا"></label><label>التاريخ<input name="date" required type="date" value="'+meetText(d.date||meetNow())+'"></label><label>وقت البداية<input name="time" required type="time" value="'+meetText(d.time||'09:00')+'"></label><label>المدة بالدقائق<input name="duration" required type="number" min="5" max="600" step="5" value="'+meetText(d.duration||45)+'"></label><label>التصنيف<select name="category">'+categories+'</select></label><label>الجهة أو القطاع<input name="sector" required maxlength="100" value="'+meetText(d.sector||'')+'" placeholder="اسم الجهة المعنية"></label><label>الموقع<input name="location" maxlength="100" value="'+meetText(d.location||'')+'" placeholder="قاعة أو اجتماع عن بُعد"></label><label class="wide">محاور الاجتماع<textarea rows="2" name="agenda" placeholder="كل محور في سطر مستقل">'+meetText(Array.isArray(d.agenda)?d.agenda.join('\n'):'')+'</textarea></label><label class="wide">الموجز التنفيذي<textarea rows="2" name="summary" placeholder="الهدف والقرار المطلوب">'+meetText(d.summary||'')+'</textarea></label></div><div id="meet-new-conflict" aria-live="polite"></div><div class="meet-actions"><button class="btn primary" type="submit">حفظ الاجتماع</button>'+meetAct('close','إلغاء',{},'btn secondary')+'</div></form>');
}
function meetNewConflict(form) {
 const box=form.querySelector('#meet-new-conflict'), f=form.elements;
 if(!f.date.value||!f.time.value||!f.duration.value){box.innerHTML='';return false;}
 const duration=Number(f.duration.value);
 if(meetTime(f.time.value)+duration>1440){box.innerHTML='<p class="meet-error">يجب أن ينتهي الاجتماع في اليوم نفسه.</p>';return true;}
 const matches=meetCheckOverlap(f.date.value,f.time.value,duration,null);
 if(!matches.length){box.innerHTML='';return false;}
 const slot=meetNextSlot(f.date.value,f.time.value,duration,null);
 box.innerHTML='<div class="meet-finding"><strong>هذا الموعد يتعارض مع «'+meetText(matches[0].title)+'».</strong>'+(slot?meetAct('use-slot','اختيار '+meetText(meetMonthLabel(slot)),slot,'meet-link'):'')+'</div>';
 return true;
}
document.addEventListener('submit',e=>{
 const f=e.target;if(f.id!=='meet-new-form')return;
 e.preventDefault();if(!f.reportValidity()||meetNewConflict(f))return;
 const d=Object.fromEntries(new FormData(f));
 const title=d.title.trim(),sector=d.sector.trim();
 if(!title||!sector){toast('أدخل عنوان الاجتماع والجهة المعنية');return;}
 const meeting={id:'mt-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5),title,sector,date:d.date,time:d.time,duration:Number(d.duration),category:d.category,location:d.location.trim(),agenda:d.agenda.split('\n').map(x=>x.trim()).filter(Boolean),summary:d.summary.trim(),people:[]};
 if(f.dataset.meetCouncil)meeting.councilId=f.dataset.meetCouncil;
 S.meetings.push(meeting); scheduleDay=meeting.date;persist();closeModal();render();toast('أُضيف الاجتماع إلى الجدول');
});
document.addEventListener('input',e=>{
 const el=e.target;
 if(el.id==='meet-minutes'){const result=document.getElementById('meet-reviewed');if(result)result.hidden=true;}
 if(el.id==='meet-library-search'){libraryQuery=el.value;const list=document.getElementById('meet-library-records');if(list)list.innerHTML=meetLibraryCards();}
 if(el.form?.id==='meet-new-form'&&['date','time','duration'].includes(el.name))meetNewConflict(el.form);
});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-meet-action]');if(!b)return;
 const a=b.dataset.meetAction,id=b.dataset.meetId,m=id?meetFind(id):null;
 if(a==='open')openMeeting(id,b.dataset.meetTab||'brief');
 if(a==='invitation')openInvitation(id);
 if(a==='studio-home')openAIWorkspace();
 if(a==='precedents'&&m)openPrecedents(m.id);
 if(a==='day'||a==='shift'||a==='today'){scheduleDay=a==='today'?today:a==='shift'?meetShift(meetNow(),Number(b.dataset.meetDelta)):b.dataset.meetDate;render();}
 if(a==='daily'||a==='brief-period')openDailyBrief(b.dataset.meetPeriod||'day',b.dataset.meetDate);
 if(a==='chart-period'){currentBriefPeriod=b.dataset.meetPeriod;render();}
 if(a==='new')newMeeting();
 if(a==='close')closeModal();
 if(a==='library-filter'){libraryFilter=b.dataset.meetFilter;render();}
 if(a==='accept'&&m?.invite==='pending'){
  const clashes=meetCheckOverlap(m.date,m.time,m.duration,m.id);
  if(clashes.length){const slot=meetNextSlot(m.date,m.time,m.duration,m.id);if(!slot){openInvitation(id);return;}Object.assign(m,slot);}
  m.invite='accepted';scheduleDay=m.date;persist();closeModal();render();toast('اعتُمد الموعد وأُضيف الاجتماع إلى الجدول');
 }
 if(a==='decline'&&m?.invite==='pending'){m.invite='declined';persist();closeModal();render();toast('سُجّل الاعتذار عن الدعوة');}
 if(a==='use-slot'){const form=b.closest('form');if(form){form.elements.date.value=b.dataset.meetDate;form.elements.time.value=b.dataset.meetTime;meetNewConflict(form);}}
 if(a==='studio'&&m) {
  const editor=document.getElementById('meet-minutes');
  if(editor&&b.dataset.meetMode==='minutes') {meetSetMinutes(m,editor.value.trim());persist();}
  closeModal();
  openAIWorkspace(m.id,b.dataset.meetMode);
 }
 if((a==='extract'||a==='save-minutes')&&m) {
  const editor=document.getElementById('meet-minutes');
  if(!editor)return;
  const raw=editor.value.trim();
  if(a==='extract'&&!raw){toast('أدخل نص المحضر أولًا');return;}
  meetSetMinutes(m,raw);
  if(a==='extract') {
   const report=window.DiwanAI.analyze(raw);
   const items=report.items.filter(item=>['action','decision','risk'].includes(item.kind)&&item.text&&raw.includes(item.text));
   m.minuteReview={items,brief:report.brief.filter(line=>line&&raw.includes(line)),truncated:report.truncated};
  }
  persist();openMeeting(id,'minutes');toast(a==='extract'?'اكتمل تحليل نص المحضر':'حُفظ المحضر');
 }
 if(a==='issue'&&m) {
  const candidate=m.minuteReview?.items[Number(b.dataset.meetIndex)];
  const raw=document.getElementById('meet-minutes')?.value.trim();
  if(!candidate||candidate.kind!=='action'||raw!==m.minutes||!raw.includes(candidate.text)) {
   toast('حلّل النص الحالي قبل مراجعة التكليف.');return;
  }
  if((S.directives||[]).some(d=>d.meetingId===m.id&&(d.title===candidate.text||d.sourceText===candidate.text))) {
   openMeeting(m.id,'minutes');return;
  }
  newDirective({title:candidate.text.slice(0,400),sourceText:candidate.text,meetingId:m.id,owner:candidate.owner||'',deadline:candidate.deadline||'',aiDraft:true});
 }
 if(a==='manual'&&m)newDirective({meetingId:m.id,owner:m.sector||''});
});

/* Text is processed in the browser. Only the extracted excerpts stay with the meeting. */
function meetMaterials(m) {
 const docs=m.documents || [];
 const compare=m.documentFindings || [];
 return '<section class="meet-block meet-materials"><div class="meet-section-head"><h3>مواد الاجتماع</h3><label class="meet-filepick btn secondary">'+meetI('plus',16)+'إرفاق مادة<input aria-label="إرفاق عرض أو ملف نصي بالاجتماع" type="file" accept=".pptx,.txt" data-meet-file="'+meetText(m.id)+'"></label></div><small class="meet-subtle">يمكن قراءة نصوص شرائح PowerPoint أو ملف نصّي داخل المتصفح (حتى 8 م.ب.).</small><div id="meet-file-status" role="status"></div>'+
  docs.map(doc=>'<details class="meet-document"><summary><span>'+meetI('file',16)+meetText(doc.name)+'</span><small>'+doc.pages.length+' '+(doc.type==='pptx'?'شرائح مقروءة':'مقاطع')+'</small></summary>'+doc.pages.map(p=>'<div class="meet-source-excerpt"><b>'+meetText(p.label)+'</b><p>'+meetText(p.text)+'</p></div>').join('')+'</details>').join('')+
  (compare.length?'<div class="meet-file-results"><h3>ملاحظات من المواد المرفقة</h3>'+compare.map(f=>'<div class="meet-finding"><strong>'+meetText(f.title)+'</strong><p>'+meetText(f.detail)+'</p><small>'+meetText(f.source)+'</small>'+(f.evidence?.length?'<details class="meet-comparison-proof"><summary>عرض عبارتي المصدر</summary>'+f.evidence.map(e=>'<blockquote><small>'+meetText(e.ref)+'</small><p>'+meetText(e.quote)+'</p></blockquote>').join('')+'</details>':'')+'</div>').join('')+'</div>':'')+'</section>';
}
function meetParsePlain(text) {
 const paragraphs=text.replace(/\r/g,'').trim().split(/\n\s*\n/).filter(Boolean);
 return paragraphs.slice(0,80).map((t,i)=>({label:'المقطع '+(i+1),text:t.trim().slice(0,1300)}));
}
async function meetReadPresentation(file) {
 const b=new Uint8Array(await file.arrayBuffer()), dv=new DataView(b.buffer), decoder=new TextDecoder();
 const sig=p=>dv.getUint32(p,true), u16=p=>dv.getUint16(p,true);
 let end=-1;
 for(let p=b.length-22;p>=Math.max(0,b.length-65557);p--)if(sig(p)===0x06054b50){end=p;break;}
 if(end<0)throw Error('تعذّرت قراءة بنية العرض. احفظ نسخة PowerPoint بصيغة PPTX.');
 const records=u16(end+10);
 if(records>5000)throw Error('يحتوي العرض على عدد كبير من العناصر. جرّب نسخة مختصرة.');
 let pos=sig(end+16);const slides=[];
 for(let i=0;i<records;i++){
  if(pos+46>b.length||sig(pos)!==0x02014b50)throw Error('ملف العرض غير مكتمل.');
  const method=u16(pos+10), compressed=sig(pos+20), expanded=sig(pos+24), nlen=u16(pos+28), extra=u16(pos+30), comment=u16(pos+32), location=sig(pos+42);
  const name=decoder.decode(b.subarray(pos+46,pos+46+nlen));pos+=46+nlen+extra+comment;
  const match=/^ppt\/slides\/slide(\d+)\.xml$/.exec(name);
  if(match)slides.push({number:Number(match[1]),location,method,compressed,expanded});
 }
 if(!slides.length)throw Error('لم نجد شرائح قابلة للقراءة في الملف.');
 if(slides.length>80)throw Error('يدعم النموذج العروض التي تحتوي على 80 شريحة أو أقل.');
 let total=0;const parsed=[];
 for(const s of slides.sort((a,b)=>a.number-b.number)){
  total+=s.expanded;
  if(total>16*1024*1024||s.expanded>3*1024*1024)throw Error('نصوص العرض كبيرة. جرّب نسخة مختصرة.');
  if(s.location+30>b.length||sig(s.location)!==0x04034b50)throw Error('تعذّرت قراءة إحدى الشرائح.');
  const off=s.location+30+u16(s.location+26)+u16(s.location+28);
  if(off+s.compressed>b.length)throw Error('ملف العرض غير مكتمل.');
  const blob=new Blob([b.subarray(off,off+s.compressed)]);
  let text;
  if(s.method===0)text=await blob.text();
  else if(s.method===8 && typeof DecompressionStream==='function'){
   const reader=blob.stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();let length=0;const fragments=[];
   for(;;){const chunk=await reader.read();if(chunk.done)break;length+=chunk.value.byteLength;if(length>s.expanded||length>3*1024*1024){await reader.cancel();throw Error('تجاوزت الشريحة حد القراءة.');}fragments.push(chunk.value);}
   text=await new Blob(fragments).text();
  } else throw Error('هذا المتصفح لا يدعم قراءة ضغط العرض. أرفق نسخة نصية.');
  const xml=new DOMParser().parseFromString(text,'application/xml');
  if(xml.getElementsByTagName('parsererror').length)throw Error('تحتوي الشريحة على نص غير قابل للقراءة.');
  const rows=Array.from(xml.getElementsByTagNameNS('*','p'),p=>Array.from(p.getElementsByTagNameNS('*','t'),t=>t.textContent).join(''));
  const excerpt=rows.filter(x=>x.trim()).join('\n').slice(0,1300).trim();if(excerpt)parsed.push({label:'الشريحة '+s.number,text:excerpt});
 }
 return parsed;
}
function meetCheckDocuments(docs) {
 const extracts=[];
 const findings=[];
 const seen=new Set();
 for(const doc of docs) {
  for(const page of doc.pages||[]) {
   const records=window.DiwanCompare.extract(page.text);
   if(!records.length)continue;
   const reference=doc.name+'، '+page.label;
   for(const previous of extracts) {
    const comparison=window.DiwanCompare.compareExtracted(previous.records,records);
    for(const issue of comparison.issues) {
     const key=JSON.stringify([issue.metric,issue.firstQuote,issue.secondQuote]);
     if(seen.has(key))continue;
     seen.add(key);
     findings.push({
      fromMaterials:true,
      title:'تباين في '+issue.metric,
      detail:'وردت '+issue.firstValue+' في المصدر الأول و'+issue.secondValue+' في الثاني، بفارق '+issue.delta+'.',
      source:previous.reference+' • '+reference,
      evidence:[{ref:previous.reference,quote:issue.firstQuote},{ref:reference,quote:issue.secondQuote}]
     });
     if(findings.length===6)return findings;
    }
   }
   extracts.push({reference,records});
  }
 }
 return findings;
}
function meetUpdateDocumentFindings(m,findings) {
 const previous=m.documentFindings||[];
 const wasFromMaterials=m.finding?.fromMaterials||previous.some(item=>item.title===m.finding?.title&&item.source===m.finding?.source);
 m.documentFindings=findings;
 if(wasFromMaterials||!m.finding) {
  if(findings.length)m.finding=findings[0];
  else delete m.finding;
 }
 m.materialAnalysisVersion=2;
}
document.addEventListener('DOMContentLoaded',()=>{
 const legacy=meetMeetings().filter(m=>m.documents?.length&&m.materialAnalysisVersion!==2);
 if(!legacy.length)return;
 for(const m of legacy)meetUpdateDocumentFindings(m,meetCheckDocuments(m.documents));
 persist();
 render();
});
document.addEventListener('change',async event=>{
 const input=event.target;
 if(!input.matches?.('input[data-meet-file]'))return;
 const m=meetFind(input.dataset.meetFile),file=input.files?.[0], feedback=document.getElementById('meet-file-status');
 if(!m||!file||!feedback)return;
 const fail=msg=>{feedback.textContent=msg;input.value='';};
 if(file.size>8*1024*1024){fail('حجم الملف يتجاوز 8 م.ب. اختر ملفًا أصغر.');return;}
 if((m.documents||[]).length>=5){fail('يمكن إرفاق خمس مواد بملف الاجتماع التجريبي.');return;}
 if((m.documents||[]).some(doc=>doc.name===file.name)){fail('أُرفق ملف بهذا الاسم مسبقًا.');return;}
 feedback.textContent='تجري قراءة النصوص وتحديد مواضع المؤشرات…';input.disabled=true;
 try{
  const type=file.name.toLowerCase().split('.').pop();
  if(!['txt','pptx'].includes(type))throw Error('اختر ملفًا من نوع TXT أو PPTX.');
  const pages=type==='pptx'?await meetReadPresentation(file):meetParsePlain(await file.text());
  if(!pages.length)throw Error('لم يُعثر على نص قابل للقراءة في المادة. يمكن إرفاق نسخة نصية.');
  const doc={name:file.name,type,pages};
  const docs=[...(m.documents||[]),doc];const findings=meetCheckDocuments(docs);
  m.documents=docs;meetUpdateDocumentFindings(m,findings);
  persist();render();
  if(input.isConnected)openMeeting(m.id,'analysis');
  toast('أُرفقت المادة بملف الاجتماع');
 }catch(err){if(input.isConnected)fail(err?.message||'تعذرت قراءة الملف.');}
 finally{input.disabled=false;}
});

let meetImportReview = [];
const meetCalendarZones = new Map();
function meetCalendarParts(timestamp, zone) {
 if(!meetCalendarZones.has(zone))meetCalendarZones.set(zone,new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));
 return Object.fromEntries(meetCalendarZones.get(zone).formatToParts(timestamp).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
}
function meetCalendarInstant(raw, fallbackZone='Asia/Riyadh') {
 if(!raw)return NaN;
 const match=/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/i.exec(raw.value);
 if(!match)return NaN;
 const wall=Date.UTC(+match[1],+match[2]-1,+match[3],+match[4],+match[5],+(match[6]||0));
 if(match[7])return wall;
 const zone=raw.zone||fallbackZone;
 let stamp=wall;
 for(let i=0;i<3;i++){
  const t=meetCalendarParts(stamp,zone);
  const actual=Date.UTC(+t.year,+t.month-1,+t.day,+t.hour,+t.minute,+t.second);
  const delta=wall-actual;if(!delta)return stamp;stamp+=delta;
 }
 return NaN;
}
function meetTranslateEvent(event, calendarZone) {
 const val=k=>event[k]?.value||'';
 if(['CANCELLED','TENTATIVE-CANCELLED'].includes(val('STATUS').toUpperCase())||val('RRULE')||val('RDATE'))return null;
 const start=meetCalendarInstant(event.DTSTART,calendarZone);
 if(!Number.isFinite(start))return null;
 let duration=30;
 if(event.DTEND){const end=meetCalendarInstant(event.DTEND,event.DTSTART.zone||calendarZone);duration=Math.round((end-start)/60000);}
 else if(event.DURATION){const m=/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(val('DURATION'));if(!m)return null;duration=Math.ceil(+(m[1]||0)*60+ +(m[2]||0)+ +(m[3]||0)/60);}
 const t=meetCalendarParts(start,'Asia/Riyadh'),time=t.hour+':'+t.minute;
 if(!(duration>0)||meetTime(time)+duration>1440)return null;
 const clean=k=>val(k).replace(/\\([nN,;\\])/g,(_,c)=>c.toLowerCase()==='n'?'\n':c).trim();
 return {title:(clean('SUMMARY')||'اجتماع من التقويم').slice(0,150),date:t.year+'-'+t.month+'-'+t.day,time,duration,location:clean('LOCATION').slice(0,150),summary:clean('DESCRIPTION').slice(0,2000),sourceUid:val('UID')?(val('UID')+(val('RECURRENCE-ID')?'/'+val('RECURRENCE-ID'):'')).slice(0,500):''};
}
function meetReadCalendar(text) {
 const lines=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'').split('\n');
 if(!lines.some(l=>l.trim().toUpperCase()==='BEGIN:VCALENDAR'))throw Error('لم نجد تقويمًا بصيغة ICS داخل الملف.');
 if(lines.some(l=>l.trim().toUpperCase()==='METHOD:CANCEL'))throw Error('يحتوي الملف على إلغاءات مواعيد فقط.');
 const parsed=[];let raw=null,depth=0,zone='Asia/Riyadh';
 for(const line of lines){
  if(line.trim().toUpperCase()==='BEGIN:VEVENT'){raw={};depth=0;continue;}
  if(raw&&line.trim().toUpperCase()==='END:VEVENT'){parsed.push(raw);raw=null;continue;}
  if(raw && /^BEGIN:/i.test(line)){depth++;continue;}
  if(raw && /^END:/i.test(line)){depth--;continue;}
  if(depth>0)continue;
  const pos=line.indexOf(':');if(pos<1)continue;
  const head=line.slice(0,pos),key=head.split(';')[0].toUpperCase(),value=line.slice(pos+1);
  if(raw){const tz=/(?:^|;)TZID=(?:"([^"]+)"|([^;]+))/i.exec(head);raw[key]={value,zone:tz?(tz[1]||tz[2]):''};}
  else if(key==='X-WR-TIMEZONE')zone=value.trim()||zone;
 }
 if(parsed.length>300)throw Error('يتجاوز الملف 300 موعد. صدّر فترة أقصر للمعاينة.');
 const list=[];let skipped=0;
 parsed.forEach(event=>{try{const m=meetTranslateEvent(event,zone);if(m)list.push(m);else skipped++;}catch{skipped++;}});
 return {list:meetSort(list),skipped};
}
function meetImportDuplicate(a,b) {
 return (a.sourceUid&&b.sourceUid&&a.sourceUid===b.sourceUid)||(a.date===b.date&&a.time===b.time&&a.title===b.title);
}
function meetImportConflicts(item, accepted) {
 return accepted.filter(m=>m.date===item.date && m.invite!=='pending' && m.invite!=='declined' && meetTime(m.time)<meetTime(item.time)+item.duration && meetTime(m.time)+m.duration>meetTime(item.time));
}
function meetImportPlan(records, selected) {
 const known=meetMeetings().slice();
 return records.map((event,index)=>{
  const duplicate=known.some(m=>meetImportDuplicate(event,m));
  const conflicts=duplicate?[]:meetImportConflicts(event,known);
  const pick=selected.has(index)&&!duplicate;
  if(pick)known.push({...event,invite:conflicts.length?'pending':undefined});
  return {event,index,duplicate,conflicts,pick};
 });
}
function meetStartCalendarImport(){
 meetImportReview=[];
 modal('استيراد من التقويم','<div class="meet-dialog"><div class="meet-highlight"><div class="meet-label">'+meetI('calendar',18)+'إضافة مواعيد من ملف تقويم</div><p>صدّر المواعيد بصيغة ICS من التقويم، ثم اختر الملف لمراجعتها بتوقيت الرياض. تُحفظ المواعيد المعتمدة كنسخ محلية في النموذج.</p></div><p class="meet-subtle meet-import-note">تدعم المعاينة الاجتماعات المفردة ذات وقت البداية. تُستبعد المواعيد اليومية والمتكررة والملغاة.</p><label class="meet-filepick btn primary">اختيار ملف تقويم<input type="file" id="meet-ics-file" aria-label="اختيار ملف تقويم" accept=".ics,text/calendar"></label><div class="meet-import-note" role="status" id="meet-ics-status"></div></div>');
}
function meetReviewCalendar(list, skipped){
 meetImportReview=list;
 const plan=meetImportPlan(list,new Set(list.map((_,i)=>i)));
 const rows=plan.map(({event:m,index,duplicate,conflicts})=>'<label class="meet-import-row"><input type="checkbox" name="pick" value="'+index+'" '+(duplicate?'disabled':'checked')+'><span><b>'+meetText(m.title)+'</b><small>'+meetText(meetDateDisplay(m.date))+' · '+meetText(meetTimeDisplay(m.time))+' · '+meetText(meetDuration(m.duration))+'</small></span><span class="meet-import-status" data-index="'+index+'">'+meetTag(duplicate?'مكرر':conflicts.length?'تعارض محتمل':'متاح',conflicts.length?'attention':'category')+'</span></label>').join('');
 modal('مراجعة مواعيد التقويم','<form id="meet-ics-review" class="meet-dialog"><p class="meet-subtle">اختر المواعيد لنسخها إلى الجدول. تُحال المواعيد المتعارضة إلى قائمة الدعوات لاختيار موعد بديل.</p>'+(skipped?'<p class="meet-import-note">استُبعدت '+skipped+' من المواعيد المتكررة أو اليومية أو الملغاة أو غير المدعومة.</p>':'')+'<div class="meet-import-list">'+(rows||meetEmpty('لا توجد مواعيد مفردة قابلة للاستيراد في هذا الملف.'))+'</div><div class="meet-actions">'+(plan.some(p=>p.pick)?'<button type="submit" class="btn primary">اعتماد المواعيد المحددة</button>':'')+meetAct('close','إغلاق',{},'btn secondary')+'</div></form>');
}
document.addEventListener('click',event=>{if(event.target.closest('[data-meet-action="calendar-import"]'))meetStartCalendarImport();});
document.addEventListener('change',async event=>{
 const input=event.target;
 if(input.id==='meet-ics-file'){
  const file=input.files?.[0],feedback=document.getElementById('meet-ics-status');if(!file||!feedback)return;
  try{if(file.size>2*1024*1024)throw Error('يجب ألا يتجاوز حجم ملف التقويم 2 م.ب.');const result=meetReadCalendar(await file.text());if(input.isConnected)meetReviewCalendar(result.list,result.skipped);}
  catch(err){feedback.textContent=err.message||'تعذّرت قراءة ملف التقويم.';input.value='';}
 }else if(input.form?.id==='meet-ics-review'){
  const form=input.form,selected=new Set(new FormData(form).getAll('pick').map(Number)),plan=meetImportPlan(meetImportReview,selected);
  plan.forEach(({index,conflicts,duplicate})=>{const box=form.querySelector('input[value="'+index+'"]'),badge=form.querySelector('[data-index="'+index+'"]');if(box){box.disabled=!!duplicate;if(duplicate)box.checked=false;}if(badge)badge.innerHTML=meetTag(duplicate?'مكرر':conflicts.length?'تعارض محتمل':'متاح',conflicts.length?'attention':'category');});
 }
});
document.addEventListener('submit',event=>{
 const form=event.target;if(form.id!=='meet-ics-review')return;event.preventDefault();
 const selected=new Set(new FormData(form).getAll('pick').map(Number));
 const chosen=meetImportPlan(meetImportReview,selected).filter(row=>row.pick);
 if(!chosen.length){toast('حدّد موعدًا واحدًا على الأقل.');return;}
 for(const {event:item,conflicts} of chosen){
  S.meetings.push({...item,id:'ics-'+crypto.randomUUID(),sector:'المكتب التنفيذي',category:'تشغيلي',agenda:[],people:[],invite:conflicts.length?'pending':'accepted'});
 }
 scheduleDay=chosen[0].event.date;meetImportReview=[];persist();closeModal();render();
 const pending=chosen.filter(row=>row.conflicts.length).length;
 toast('أُضيفت '+chosen.length+' من مواعيد التقويم'+(pending?'، منها '+pending+' في انتظار معالجة التعارض.':'.'));
});
