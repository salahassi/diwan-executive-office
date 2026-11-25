/* A local workspace. Editing source text never changes the underlying meeting record. */
const aiSamples = [
  {name:'تسليم مخرجات المشروع', text:'استعرضت اللجنة تقدم أعمال المشروع.\nقررت اللجنة اعتماد خطة تسليم المخرجات المكتملة.\nكلفت اللجنة إدارة المشاريع بمراجعة جدول التسليم قبل يوم الخميس.\nقد يؤدي تأخر اختبارات القبول إلى تأجيل التسليم.'},
  {name:'تحسين الاستجابة لطلبات المستفيدين', text:'استعرض فريق الخدمات مؤشرات الاستجابة للطلبات في الربع الثالث.\nوافق المجلس على توسيع تجربة تصنيف الطلبات لتشمل ثلاثة فروع.\nتتولى إدارة العمليات إعداد خطة التطبيق خلال أسبوع.\nقد يؤثر نقص الموظفين في سرعة الاستجابة للطلبات.'}
];
const aiComparisonSample = ['بلغت نسبة إنجاز الدفعة الأولى 84% بتاريخ 22 نوفمبر.','بلغت نسبة إنجاز الدفعة الأولى 76% بتاريخ 22 نوفمبر.'];
const aiWork = {
  mode:'minutes', source:'sample-0', text:aiSamples[0].text, meetingId:'', fileNote:'',
  originalText:aiSamples[0].text, originName:'مثال '+aiSamples[0].name, pairOriginal:aiComparisonSample.slice(),
  result:null, pair:aiComparisonSample.slice(), pairNames:['عرض تقدم المشروع · مثال','تقرير التحقق الميداني · مثال'],
  comparison:null, pairMeeting:'', error:'', pairError:'', initial:true,
  running:false, comparing:false, textRevision:0, pairRevision:0
};
const aiKinds = {
  action:{title:'تكليف',plural:'تكليفات',icon:'checklist'},
  decision:{title:'قرار',plural:'قرارات',icon:'target'},
  risk:{title:'مخاطر',plural:'مخاطر',icon:'alert'},
  info:{title:'معلومة',plural:'معلومات',icon:'file'}
};
function aiTrim(text) {return String(text ?? '').trim();}
function aiMeetingById(id) {return (S.meetings || []).find(m => m.id === id);}
function aiMeetingMinutes(m) {
  if (typeof meetSeedMinutes === 'function') return aiTrim(meetSeedMinutes(m));
  return aiTrim(m.minutes ?? m.transcript);
}
function aiDocuments(m) {
  return (m?.documents || []).map((d,i) => ({
    key:'doc-' + i, name:d.name || 'مستند مرفق',
    text:(d.pages || []).map(p => aiTrim(p.text)).filter(Boolean).join('\n\n')
  })).filter(d => d.text);
}
function aiMeetingSources(m) {
  if (!m) return [];
  const sources=aiDocuments(m);
  const minutes=aiMeetingMinutes(m);
  if (minutes) sources.unshift({key:'minutes', name:'محضر الاجتماع', text:minutes});
  return sources;
}
function aiSelectOption(value, label, current) {
  return '<option value="' + esc(value) + '"' + (value===current?' selected':'') + '>' + esc(label) + '</option>';
}
function aiSetSource(value) {
  aiWork.source=value;aiWork.fileNote='';aiWork.originName='';
  aiWork.result=null;
  aiWork.initial=false;
  aiWork.error='';
  aiWork.running=false;
  aiWork.textRevision++;
  aiWork.meetingId='';
  if (value.startsWith('sample-')) {
    const sample=aiSamples[Number(value.slice(7))];
    aiWork.text=sample?.text || '';aiWork.originName=sample?'مثال '+sample.name:'';
  } else if (value.startsWith('meeting:')) {
    const id=value.slice(8), m=aiMeetingById(id);
    aiWork.meetingId=m?.id || '';
    const source=aiMeetingSources(m)[0];
    aiWork.text=source?.text || '';
    aiWork.originName=source ? source.name+' · '+m.title : '';
  } else {
    aiWork.text='';
  }
  aiWork.originalText=aiWork.text;
}
function aiLoadPair(id) {
  aiWork.pairMeeting=id || '';
  aiWork.pairRevision++;
  aiWork.comparing=false;
  aiWork.comparison=null;
  aiWork.pairError='';
  const m=aiMeetingById(id), docs=aiDocuments(m);
  if (!docs.length && m?.comparisonSources?.length >= 2) {
    aiWork.pair = m.comparisonSources.slice(0,2).map(source=>aiTrim(source.text));
    aiWork.pairOriginal=aiWork.pair.slice();
    aiWork.pairNames = m.comparisonSources.slice(0,2).map(source=>aiTrim(source.name));
    return;
  }
  if (!docs.length && !id) {
    aiWork.pair=aiComparisonSample.slice();aiWork.pairOriginal=aiWork.pair.slice();
    aiWork.pairNames=['عرض تقدم المشروع · مثال','تقرير التحقق الميداني · مثال'];
    return;
  }
  aiWork.pair=[docs[0]?.text || '',docs[1]?.text || ''];
  aiWork.pairOriginal=aiWork.pair.slice();
  aiWork.pairNames=[docs[0]?.name || 'نص يدوي',docs[1]?.name || 'نص يدوي'];
}
function openAIWorkspace(meetingId,mode) {
  aiWork.mode=['compare','metrics','analysis'].includes(mode)?'compare':'minutes';
  if (meetingId && aiMeetingById(meetingId)) {
    aiSetSource('meeting:' + meetingId);
    aiLoadPair(meetingId);
  }
  go('ai');
}
function aiSourceSelect() {
  const v=aiWork.source;
  const meetings=(S.meetings||[]).filter(m=>m.invite!=='declined');
  return '<select data-ai-input="source" aria-label="مصدر النص">' +
    aiSamples.map((s,i)=>aiSelectOption('sample-'+i,'مثال · '+s.name,v)).join('') +
    aiSelectOption('custom','كتابة نص أو لصقه',v) +
    (meetings.length?'<optgroup label="اجتماعات المكتب">'+meetings.map(m=>aiSelectOption('meeting:'+m.id,m.title,v)).join('')+'</optgroup>':'') +
    '</select>';
}
function aiButton(action,label,glyph,style='btn secondary',attrs='') {
  return '<button type="button" class="'+style+'" data-ai-action="'+action+'" '+attrs+'>'+(glyph?icon(glyph,16):'')+esc(label)+'</button>';
}
function aiWordCount(value) {
  const text=aiTrim(value);
  return text?text.split(/\s+/u).length:0;
}
function aiCounter(text) {return n(aiWordCount(text))+' كلمة';}
function aiRowsToText(rows) {return rows.map(l=>'<li>'+esc(l)+'</li>').join('');}
function aiSourceNote() {
  if (aiWork.fileNote) return '<p class="ais-source-caption">'+icon('file',15)+esc(aiWork.fileNote)+'</p>';
  if (aiWork.meetingId) {
    const m=aiMeetingById(aiWork.meetingId), sources=aiMeetingSources(m);
    if (!sources.length) return '<p class="ais-missing">'+icon('file',15)+'لا يتضمن ملف هذا الاجتماع محضرًا أو نصًا مرفقًا. ألصق المادة التي تريد تحليلها أدناه.</p>';
    if (sources.length===1) return '<p class="ais-source-caption">'+icon('file',15)+'المادة المتاحة: '+esc(sources[0].name)+'</p>';
    return '<label class="ais-select-source"><span>المادة المتاحة</span><select data-ai-input="document">'+
      '<option value="">اختر مادة لإدراج نصها</option>'+sources.map(s=>aiSelectOption(s.key,s.name,'')).join('')+'</select></label>';
  }
  return '';
}
function aiProvenance() {
  if (!aiWork.originName) return aiWork.meetingId?'نص أُدخل يدويًا لهذا الاجتماع':'نص أُدخل يدويًا';
  return aiWork.text===aiWork.originalText?aiWork.originName:'نسخة معدّلة من «'+aiWork.originName+'»';
}
function aiPairName(slot) {
  const name=aiWork.pairNames[slot];
  if (!aiWork.pairOriginal[slot] || aiWork.pair[slot]===aiWork.pairOriginal[slot]) return name;
  return 'نسخة معدّلة من «'+name+'»';
}
function aiEditor() {
  return '<section class="panel ais-card"><div class="ais-card-head"><span class="ais-head-icon">'+icon('notes',21)+'</span><h2>النص المراد تحليله</h2></div>'+
    '<div class="ais-card-content"><label class="ais-field"><span>مصدر النص</span>'+aiSourceSelect()+'</label>'+aiSourceNote()+
    '<label class="ais-field ais-text-field"><span>نص المحضر أو المذكرة</span><textarea id="ais-text" data-ai-input="text" maxlength="40000" rows="8" placeholder="ألصق النص هنا…">'+esc(aiWork.text)+'</textarea></label>'+
    '<p id="ais-origin" class="ais-origin">'+esc(aiProvenance())+'</p><div class="ais-util"><span id="ais-count">'+aiCounter(aiWork.text)+'</span><label class="ais-file">'+icon('plus',14)+'قراءة ملف<input type="file" data-ai-input="upload" accept=".txt,.pptx" aria-label="قراءة ملف نصي أو PowerPoint للتحليل"></label></div>'+
    '<small class="ais-error" id="ais-error" role="status">'+esc(aiWork.error)+'</small>'+
    aiButton('analyze',aiWork.running?'جارٍ تحليل النص…':'تحليل النص','sparkles','btn primary ais-run',(!aiWork.text.trim()||aiWork.running)?'disabled':'')+
    '</div></section>';
}
function aiResultsHeader(title) {
  return '<div class="ais-card-head"><span class="ais-head-icon accent">'+icon('sparkles',21)+'</span><h2>'+title+'</h2></div>';
}
function aiPlaceholder(pair) {
  return '<div class="ais-placeholder"><span>'+icon(pair?'chart':'notes',30)+'</span><h3>'+(pair?'قارن بين المصدرين':'حلّل النص لعرض نتائجه')+'</h3><p>'+(pair?'ستظهر المؤشرات المشتركة والقيم التي تحتاج إلى تحقق.':'ستجد هنا موجز النص والتكليفات والقرارات والمخاطر المستخرجة منه.')+'</p></div>';
}
function aiExisting(item) {
  const target=aiTrim(item.text);
  return (S.directives||[]).find(d => (!aiWork.meetingId || d.meetingId===aiWork.meetingId) &&
    (aiTrim(d.sourceText)===target || aiTrim(d.title)===target));
}
function aiEvidence(text,summary='عرض العبارة في المصدر') {
  return '<details class="ais-evidence"><summary>'+icon('book',14)+esc(summary)+'</summary><blockquote>'+esc(text)+'</blockquote></details>';
}
function aiOriginalPassage(item) {
  const source=aiWork.text, found=source.indexOf(item.text);
  if (found<0) return aiEvidence(item.text);
  const start=Math.max(0,found-70), end=Math.min(source.length,found+item.text.length+70);
  const before=source.slice(start,found),after=source.slice(found+item.text.length,end);
  return '<details class="ais-evidence"><summary>'+icon('book',14)+'عرض السياق في المصدر</summary><blockquote>'+
    (start?'…':'')+esc(before)+'<mark>'+esc(item.text)+'</mark>'+esc(after)+(end<source.length?'…':'')+'</blockquote></details>';
}
function aiResultRow(item,index) {
  const kind=Object.prototype.hasOwnProperty.call(aiKinds,item.kind)?item.kind:'info';
  const cls=aiKinds[kind], existing=kind==='action' && aiExisting(item);
  const owner=aiTrim(item.owner),deadline=aiTrim(item.deadline);
  return '<article class="ais-row"><div class="ais-row-top"><span class="ais-tag '+kind+'">'+icon(cls.icon,13)+cls.title+'</span>'+
    (Number.isInteger(item.sentenceIndex)?'<small>العبارة '+n(item.sentenceIndex+1)+'</small>':'')+'</div><p>'+esc(item.text)+'</p>'+
    (owner || deadline?'<div class="ais-meta">'+(owner?'<span>'+icon('users',14)+esc(owner)+'</span>':'')+
    (deadline?'<span>'+icon('calendar',14)+esc(deadline)+'</span>':'')+'</div>':'')+
    '<div class="ais-row-actions">'+aiOriginalPassage(item)+
    (kind==='action'?aiButton(existing?'existing':'draft',existing?'عرض التوجيه':'تحويل إلى توجيه',existing?'check':'plus','ais-text-button','data-ai-index="'+index+'"'):'')+
    '</div></article>';
}
function aiResultContent() {
  const r=aiWork.result;
  if (!r) return aiPlaceholder(false);
  const brief=r.brief || [], items=(r.items||[]).map((v,i)=>({v,i})).filter(x=>x.v.text);
  const significant=items.filter(x=>['action','decision','risk'].includes(x.v.kind));
  const counts=['action','decision','risk'].map(kind=>{
    const count=significant.filter(x=>x.v.kind===kind).length;
    return '<div><span class="ais-tally-dot '+kind+'"></span><strong>'+n(count)+'</strong><small>'+aiKinds[kind].plural+'</small></div>';
  }).join('');
  return '<p class="ais-origin ais-result-origin">'+icon('file',14)+esc(aiProvenance())+'</p><div class="ais-tallies">'+counts+'</div>'+
    (brief.length?'<div class="ais-brief"><h3>'+icon('notes',16)+'الموجز المستخرج</h3><ul>'+aiRowsToText(brief)+'</ul></div>':'')+
    (significant.length?'<h3 class="ais-subtitle">بنود المتابعة</h3><div class="ais-rows">'+significant.map(x=>aiResultRow(x.v,x.i)).join('')+'</div>':
    '<p class="ais-notice">'+icon('notes',16)+'لم يحدد النموذج قرارًا أو تكليفًا أو خطرًا يستدعي المتابعة في هذا النص.</p>')+
    (r.truncated?'<p class="ais-notice">تجاوز النص سعة التحليل. قسّمه إلى أجزاء لقراءة بقية العبارات.</p>':'');
}
function aiMinutes() {
  return '<div class="ais-grid">'+aiEditor()+'<section class="panel ais-card ais-output">'+aiResultsHeader('نتائج التحليل')+
    '<div id="ais-results" class="ais-card-content" aria-live="polite">'+aiResultContent()+'</div></section></div>';
}
function aiPairResult() {
  if (!aiWork.comparison) return aiPlaceholder(true);
  const c=aiWork.comparison, issues=c.issues||[];
  if (!issues.length) {
    const matched=Number(c.matchedCount)||0;
    return '<div class="ais-match"><span>'+icon(matched?'check':'search',24)+'</span><h3>'+(matched?'القيم متفقة بين المصدرين':'لم يُعثر على مؤشر قابل للمقارنة')+'</h3><p>'+
      (matched?'عدد المؤشرات التي قورنت واتسقت قيمها: '+n(matched)+'.':'تحقق من أن المصدرين يذكران اسم المؤشر والوحدة والفترة والنطاق نفسيهما.')+'</p></div>';
  }
  return '<p class="ais-compare-summary">'+icon('alert',16)+'اختلافات تستدعي التحقق: <strong>'+n(issues.length)+'</strong></p>'+
    issues.map(issue=>'<article class="ais-issue"><h3>'+esc(issue.metric)+'</h3><div class="ais-value-grid">'+
      [issue.firstValue,issue.secondValue].map((value,i)=>'<div><small>'+esc(aiPairName(i))+'</small><strong><bdi>'+esc(value)+'</bdi></strong></div>').join('')+
      '</div><div class="ais-difference"><span>الفارق</span><b>'+esc(issue.delta)+'</b></div>'+
      aiEvidence(issue.firstQuote,'شاهد المصدر الأول')+aiEvidence(issue.secondQuote,'شاهد المصدر الثاني')+'</article>').join('');
}
function aiPairEditor(slot) {
  const m=aiMeetingById(aiWork.pairMeeting);
  const docs=aiDocuments(m);
  const choices=docs.length?'<select data-ai-input="pair-doc" data-ai-slot="'+slot+'" aria-label="اختيار مستند للمصدر '+(slot+1)+'"><option value="">اختيار ملف الاجتماع</option>'+docs.map(d=>aiSelectOption(d.key,d.name,'')).join('')+'</select>':'';
  return '<div class="ais-pair-editor"><label class="ais-field"><span>'+(slot?'المصدر الثاني':'المصدر الأول')+' <small id="ais-pair-name-'+slot+'">· '+esc(aiPairName(slot))+'</small></span><textarea rows="4" maxlength="40000" data-ai-input="pair-text" data-ai-slot="'+slot+'" placeholder="أدخل المقتطف والرقم كما وردا في المصدر">'+esc(aiWork.pair[slot])+'</textarea></label>'+choices+'</div>';
}
function aiCompare() {
  return '<div class="ais-grid"><section class="panel ais-card"><div class="ais-card-head"><span class="ais-head-icon">'+icon('files',21)+'</span><h2>مصادر المقارنة</h2></div>'+
    '<div class="ais-card-content"><p class="ais-help">أدخل مقتطفين يتناولان المؤشر نفسه، مع الفترة ووحدة القياس.</p>'+aiPairEditor(0)+aiPairEditor(1)+
    '<div class="ais-pair-tools">'+aiButton('example-pair','استخدام المثال','','ais-text-button')+aiButton('blank-pair','نصّان جديدان','','ais-text-button')+'</div>'+
    '<small class="ais-error" id="ais-pair-error" role="status">'+esc(aiWork.pairError)+'</small>'+
    aiButton('compare',aiWork.comparing?'جارٍ فحص المصدرين…':'مقارنة المصدرين','chart','btn primary ais-run',(!aiWork.pair.every(x=>x.trim())||aiWork.comparing)?'disabled':'')+'</div></section>'+
    '<section class="panel ais-card ais-output">'+aiResultsHeader('نتيجة المقارنة')+'<div class="ais-card-content" id="ais-pair-results" aria-live="polite">'+aiPairResult()+'</div></section></div>';
}
function aiPage() {
  if (aiWork.initial && aiWork.mode==='minutes') {
    aiWork.initial=false;
    if (window.DiwanAI?.analyze) {
      try {const preview=window.DiwanAI.analyze(aiWork.text);if (Array.isArray(preview?.items)) aiWork.result=preview;} catch { /* Manual run offers a retry. */ }
    }
  }
  const isText=aiWork.mode==='minutes';
  return '<div class="ais-page"><header class="ais-pagehead"><div><h1>مركز الذكاء الاصطناعي</h1><p>استخرج القرارات والتكليفات والمخاطر من المحاضر، وقارن مؤشرات التقارير مع مصادرها.</p></div><span class="ais-local">'+icon('shield',16)+'معالجة محلية</span></header>'+
   '<details class="ais-method"><summary>كيف يعمل التحليل؟</summary><p>يصنّف نموذج مدرّب على نصوص عربية عبارات المحضر، ويستخرج منها موجزًا وبنود متابعة بألفاظ المصدر. قد يفوته التكليف أو القرار إذا كانت صياغته ملتبسة. تقارن أداة الأرقام قيم المؤشرات المشتركة بين النصّين، ويبحث استرجاع السوابق في سجلات المكتب عن مواضيع ذات صلة.</p></details>'+
   '<div class="ais-modes" role="group" aria-label="أدوات التحليل">'+
   aiButton('minutes-mode','تحليل المحاضر','notes','ais-mode','aria-pressed="'+isText+'"')+
   aiButton('compare-mode','مقارنة الأرقام','chart','ais-mode','aria-pressed="'+!isText+'"')+
   aiButton('precedents','البحث في السوابق','search','ais-mode ais-precedents')+
   '</div>'+(isText?aiMinutes():aiCompare())+'</div>';
}
function aiInvalidate(kind) {
  const compare=kind==='compare';
  if (compare) {
    aiWork.comparison=null;aiWork.comparing=false;aiWork.pairError='';aiWork.pairRevision++;
  } else {
    aiWork.result=null;aiWork.running=false;aiWork.error='';aiWork.textRevision++;
  }
  const output=document.getElementById(compare?'ais-pair-results':'ais-results');
  if (output) output.innerHTML=aiPlaceholder(compare);
  const error=document.getElementById(compare?'ais-pair-error':'ais-error');
  if (error) error.textContent='';
  const button=document.querySelector('.ais-page [data-ai-action="'+(compare?'compare':'analyze')+'"]');
  if (button) button.disabled=compare?!aiWork.pair.every(x=>x.trim()):!aiWork.text.trim();
}
async function aiRun(compare) {
  const module=compare?window.DiwanCompare:window.DiwanAI;
  const revision=compare?aiWork.pairRevision:aiWork.textRevision;
  if ((compare && (aiWork.comparing || !aiWork.pair.every(x=>x.trim()))) ||
      (!compare && (aiWork.running || !aiWork.text.trim()))) return;
  if (compare) {aiWork.comparing=true;aiWork.pairError='';}
  else {aiWork.running=true;aiWork.error='';}
  render();
  try {
    if (!module) throw new Error('module');
    const result=compare?await module.compare(...aiWork.pair):await module.analyze(aiWork.text);
    if (revision !== (compare?aiWork.pairRevision:aiWork.textRevision)) return;
    if (compare && Array.isArray(result?.issues)) aiWork.comparison=result;
    else if (!compare && Array.isArray(result?.items)) aiWork.result=result;
    else throw new Error('format');
  } catch {
    if (revision !== (compare?aiWork.pairRevision:aiWork.textRevision)) return;
    const message='تعذّر تشغيل التحليل المحلي. أعد تحميل الصفحة وجرّب مجددًا.';
    if (compare) {aiWork.comparison=null;aiWork.pairError=message;}
    else {aiWork.result=null;aiWork.error=message;}
  } finally {
    if (revision === (compare?aiWork.pairRevision:aiWork.textRevision)) {
      if (compare) aiWork.comparing=false;else aiWork.running=false;
      if (view==='ai') render();
    }
  }
}
async function aiReadInputFile(file) {
  if (!file) return;
  const revision=aiWork.textRevision;
  try {
    const fmt=(file.name.split('.').pop()||'').toLowerCase();
    if (!['txt','pptx'].includes(fmt)) throw new Error('اختر ملف TXT أو PPTX.');
    if (file.size>8*1024*1024) throw new Error('يتجاوز الملف حد 8 ميغابايت. اختر نسخة أصغر.');
    let value;
    if (fmt==='pptx') {
      const pages=await meetReadPresentation(file);
      value=pages.map(p=>aiTrim(p.text)).filter(Boolean).join('\n\n');
    } else value=await file.text();
    if (!aiTrim(value)) throw new Error('تعذرت قراءة نص من هذا الملف.');
    if (value.length>40000) throw new Error('يتجاوز النص 40,000 محرف. الصق المقتطف الذي تريد تحليله.');
    if (revision!==aiWork.textRevision || view!=='ai') return;
    if (!aiWork.meetingId) aiWork.source='custom';
    aiWork.fileNote=fmt==='pptx'?'قراءة حتى 1,300 محرف نصي لكل شريحة':'ملف نصي مستورد';
    aiWork.originName=file.name;aiWork.originalText=value;
    aiWork.text=value; aiInvalidate('minutes'); render();
    toast('قُرئ نص الملف وأصبح جاهزًا للتحليل.');
  } catch (error) {
    if (revision!==aiWork.textRevision || view!=='ai') return;
    aiWork.error=error.message || 'تعذرت قراءة الملف.';
    const el=document.getElementById('ais-error');
    if (el) el.textContent=aiWork.error;
  }
}
function aiDraft(item) {
  if (!item || item.kind!=='action') return;
  const existing=aiExisting(item);
  if (existing) {openDirective(existing.id);return;}
  newDirective({
    aiDraft:true,title:item.text.slice(0,400),sourceText:item.text,aiSourceLabel:aiProvenance(),
    meetingId:aiWork.meetingId,owner:aiTrim(item.owner),deadline:aiTrim(item.deadline)
  });
}
document.addEventListener('click',event=>{
  const control=event.target.closest?.('.ais-page [data-ai-action]');
  if (!control) return;
  const action=control.dataset.aiAction;
  switch(action) {
    case 'precedents': openPrecedents(aiWork.mode==='minutes'?aiWork.meetingId:aiWork.pairMeeting);break;
    case 'analyze': aiRun(false);break;
    case 'compare': aiRun(true);break;
    case 'minutes-mode': aiWork.mode='minutes';render();break;
    case 'compare-mode': aiWork.mode='compare';render();break;
    case 'example-pair': {
      const meeting=aiWork.pairMeeting;
      aiLoadPair('');
      /* Keep the meeting's documents selectable when temporarily showing the example. */
      aiWork.pairMeeting=meeting;
      render();
      break;
    }
    case 'blank-pair':
      aiWork.pair=['',''];aiWork.pairOriginal=['',''];aiWork.pairNames=['نص يدوي','نص يدوي'];aiInvalidate('compare');render();
      document.querySelector('.ais-page [data-ai-input="pair-text"]')?.focus();
      break;
    case 'draft':
    case 'existing': aiDraft(aiWork.result?.items[Number(control.dataset.aiIndex)]);break;
  }
});
document.addEventListener('input',event=>{
  const el=event.target;
  if (!el.closest?.('.ais-page')) return;
  if (el.dataset.aiInput==='text') {
    aiWork.text=el.value;aiInvalidate('minutes');
    const origin=document.getElementById('ais-origin');if (origin) origin.textContent=aiProvenance();
    const counter=document.getElementById('ais-count');if (counter) counter.textContent=aiCounter(el.value);
  } else if (el.dataset.aiInput==='pair-text') {
    const slot=Number(el.dataset.aiSlot);aiWork.pair[slot]=el.value;aiInvalidate('compare');
    const label=document.getElementById('ais-pair-name-'+slot);if (label) label.textContent='· '+aiPairName(slot);
  }
});
document.addEventListener('change',event=>{
  const el=event.target;
  if (!el.closest?.('.ais-page')) return;
  switch(el.dataset.aiInput) {
    case 'source':
      aiSetSource(el.value);render();
      if (!aiWork.text) document.getElementById('ais-text')?.focus();
      break;
    case 'document': {
      const source=aiMeetingSources(aiMeetingById(aiWork.meetingId)).find(d=>d.key===el.value);
      if (source) {aiWork.fileNote='';aiWork.originName=source.name+' · '+aiMeetingById(aiWork.meetingId).title;aiWork.originalText=source.text;aiWork.text=source.text;aiInvalidate('minutes');render();}
      break;
    }
    case 'pair-doc': {
      const doc=aiDocuments(aiMeetingById(aiWork.pairMeeting)).find(d=>d.key===el.value);
      if (doc) {const slot=Number(el.dataset.aiSlot);aiWork.pair[slot]=doc.text;aiWork.pairOriginal[slot]=doc.text;aiWork.pairNames[slot]=doc.name;aiInvalidate('compare');render();}
      break;
    }
    case 'upload': aiReadInputFile(el.files[0]);el.value='';break;
  }
});
