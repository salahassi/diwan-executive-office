/* Diwan Arabic minutes classifier. Regenerate with tooling/train_ai.py. */
(function (root) {
  'use strict';
  const model = {"bins":4096,"scale":0.0304536316,"bias":[-0.2891181,-0.8709719,0.5681158,0.5919741],"minP":0.54,"minMargin":0.18,"data":"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"};
  const labels = ['action','decision','risk','info'];
  const MAX_CHARS = 40000, MAX_SENTENCES = 320;
  const weightBytes = Uint8Array.from(atob(model.data), c=>c.charCodeAt(0));
  const weights = new Int8Array(weightBytes.buffer);
  const translit = {'إ':'ا','أ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ة':'ه','ؤ':'و','ئ':'ي'};
  const marks = /[\u064b-\u065f\u0670\u0640]/;
  function normalized(s) {
    return s.replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[إأآٱىةؤئ]/g,c=>translit[c]).toLowerCase();
  }
  // Keep offsets into the original text for literal citation of owners and dates.
  function withOffsets(s) {
    const offsets=[]; let value='';
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(marks.test(c)) continue;
      value+=translit[c] || c.toLowerCase();
      offsets.push(i);
    }
    offsets.push(s.length);
    return {value, offsets, original:s};
  }
  function excerpt(src, start, end) {
    return src.original.slice(src.offsets[start], src.offsets[end]).trim();
  }
  function hash(key) {
    let h=2166136261;
    for(let i=0;i<key.length;i++) h=Math.imul(h ^ key.charCodeAt(i),16777619);
    return (h>>>0)%model.bins;
  }
  function features(words) {
    const values=new Map();
    function add(key,weight){const k=hash(key);values.set(k,(values.get(k)||0)+weight);}
    words.forEach((word,i)=>{
      add('w'+word,1.35);
      if(i<3) add('s'+word,.9);
      if(i) add('b'+words[i-1]+' '+word,.65);
      const bounded='^'+word+'$';
      for(const size of [3,4]) for(let k=0;k<=bounded.length-size;k++) add('c'+bounded.slice(k,k+size),.48);
    });
    const norm=Math.sqrt([...values.values()].reduce((a,v)=>a+v*v,0))||1;
    return [...values].map(([k,v])=>[k,v/norm]);
  }
  function classify(s) {
    const value=normalized(s);
    const words=value.match(/[a-z\u0621-\u063a\u0641-\u064a]+/g)||[];
    const fv=features(words);
    const logits=model.bias.map((bias,c)=>fv.reduce((sum,[i,v])=>sum+weights[c*model.bins+i]*model.scale*v,bias));
    const max=Math.max(...logits), numer=logits.map(x=>Math.exp(x-max)), den=numer.reduce((a,b)=>a+b);
    const sorted=numer.map((v,i)=>({kind:labels[i],p:v/den})).sort((a,b)=>b.p-a.p);
    const best=sorted[0], margin=best.p-sorted[1].p;
    const noOutcome=/(?:لم|لن)\s+(?:يصدر|يتم|يتخذ|تعتمد|يعتمد|يبت|تتخذ|تصدر)\s+(?:(?:قرار|اي قرار|تكليف)|(?:.{0,28}?)\s+(?:قرار|تكليف|القرار|التوصيات))|(?:لم|لن)\s+(?:تقرر|تصادق|تكلف)\s|لا\s+(?:توجد|يوجد)\s+(?:اي\s+)?(?:قرار|تكليف)/.test(value);
    // A governing body's explicit past-tense ruling is performative Arabic.
    // Questions, reported ideas, and conditional approvals don't establish a ruling.
    const rulingVerb='(?:قرر(?:ت|وا)?|اقر(?:ت|وا)?|وافق(?:ت|وا)?|اعتمد(?:ت|وا)?|صادق(?:ت|وا)?|اجاز(?:ت|وا)?|رفض(?:ت|وا)?|الغي|الغت|ارجا(?:ت)?|اجل(?:ت)?|الغوا)';
    const body='(?:اللجنه|المجلس|الاداره|الوزاره|الوزير|المكتب|الهييه|الجمعيه|المجتمعون|الاعضاء|الحاضرون|رييس(?:ه)?\\s+(?:اللجنه|المجلس|الجلسه)|مجلس\\s+(?:الاداره|اللجنه))';
    const approved=new RegExp('^(?:[وف]?(?:قد\\s+)?'+rulingVerb+'\\s+'+body+'|'+body+'\\s+'+rulingVerb+')\\s+(?!(?:بان|بوجود|بحدوث|بوقوع|بتاخر)\\s)\\S+').test(value);
    const negatedRuling=/^(?:[وف]?(?:لم|لن|لا)\s+(?:تقرر|يقرر|توافق|يوافق|يقر|تقر|تعتمد|يعتمد|يصادق|تصادق|يجيز|تجيز)|لم\s+يتم\s+(?:اعتماد|اقرار|البت)|لا\s+تزال\s+(?:الموافقه|المساله|التوصيه))(?=\s|$)/.test(value);
    const mentionOnly=/^(?:[وف]?(?:هل|متي|ماذا|لعل|ربما|لو|في حال|في انتظار|ريثما|حالما)\s|اذا\s+(?:وافق|اقر|قرر|اعتمد|صادق)|(?:طُ?رح|نوقش|ناقش(?:ت)?|بحث(?:ت)?|تدارس(?:ت)?|استعرض(?:ت)?|عرض(?:ت)?)\s.{0,55}(?:مقترح|مشروع قرار|فكره|مسوده|قرار سابق)|(?:اقترح(?:ت)?|اوصي|اوصت)\s)/.test(value);
    if(noOutcome || negatedRuling || (mentionOnly && best.kind!=='risk') || /[؟?]\s*$/.test(s))return {kind:'info',uncertain:false};
    if(approved)return {kind:'decision',uncertain:false};
    const insufficient=words.length<3 || !/[\u0621-\u064a]/.test(value);
    const uncertain=insufficient || best.p<model.minP || margin<model.minMargin;
    return {kind:uncertain?'info':best.kind,uncertain};
  }
  const orgStart='(?:الاداره|اداره|القطاع|قطاع|الفريق|فريق|امانه|الامانه|الوكاله|وكاله|مكتب|المكتب|وحده|الوحده|شركه|هييه|قسم|القسم|مركز|المركز|مدير|مديره|رييس|رييسه|لجنه|اللجنه|الشوون|وزاره|الوزاره|البلديه|الامانه|المقاول|المورد|المشغل|المنسق|ادارات|الادارات|الجهه)';
  const orgToken='[ء-ي]+';
  const stopOwner=/^(?:باعداد|بتقديم|بمراجعه|بمتابعه|بمطابقه|بتحديث|بتدقيق|بفحص|بتوثيق|بتزويد|بتامين|بتنسيق|بتسليم|برفع|باعتماد|بانجاز|بحصر|بتصحيح|بتحديد|باختبار|بارسال|بتنفيذ|بمعالجه|باستكمال|باقفال|بالتنسيق|بالتواصل|باصدار|بموافاه|بدراسه|ببحث|بجمع|بتصعيد|بوضع|بتجهيز|على|الي|من|في|مع|قبل|خلال|ضمن|حتي|عليها|عليه|ان|مراجعه|مطابقه|تقديم|رفع|تسليم|تحديث|اعداد|حصر|تدقيق|فحص|جمع|استكمال|تصحيح|تزويد|موافاه|اختبار|تنسيق|موافاته|موافاتنا|تحديد|توقيع|اصدار|انجاز|وتتولي|وترفع|بارسال|حفظ|ارشال|ارسال|صياغه|تدريب|متابعه|دراسه|تنفيذ|معالجه|تعيين|توريد|توفير|اعاده|تبادل|تطبيق|اغلاق|تقريرها|تقريره|ملاحظاتها|ملاحظاته|تقرير|خطاب|القائمه|قائمه)$/;
  const sourcePhrases=[
    // Explicit recipient after a task description, e.g. «أُسندت مراجعة العقود إلى الشؤون القانونية».
    new RegExp('(?:اسندت?|اوكلت?|احيلت?|اسناد|تحويل|وجهت?|تكليف).{1,95}?\\s(?:الي|لصالح)\\s+('+orgStart+')(?=\\s|[،,.؛;:]|$)'),
    new RegExp('(?:كلفت?|يكلف|تكلف|وجهت?|طلبت?|تدعو|دعت)\\s+(?:(?:رييس(?:ه)?\\s+)?(?:اللجنه|المجلس|المكتب|الاجتماع|الجلسه|الوزير|المدير|الرييس)\\s+)?(?:من\\s+)?('+orgStart+')(?=\\s|[،,.؛;:]|$)'),
    new RegExp('(?:يتولي|تتولي|تقوم|يقوم|تلتزم|يلتزم|تتعهد|يتعهد|تتكفل|يتكفل|تنسق|يرفع|ترفع|يقدم|تقدم|تعد|تتابع|يتابع|سترسل|سيرسل|سيتولي|ستتولي|سترفع|سيرفع|علي|علي عاتق|يرجي من|مطلوب من|مهمه|تكليف|كلفت?|وجهت?)\\s+('+orgStart+')(?=\\s|[،,.؛;:]|$)'),
    new RegExp('(?:من مسووليه|الجهه المسووله\\s*[:：]|المسوول\\s*[:：])\\s*('+orgStart+')(?=\\s|[،,.؛;:]|$)'),
  ];
  function owner(src) {
    for(const pattern of sourcePhrases){
      const match=pattern.exec(src.value);
      if(!match)continue;
      const start=match.index+match[0].length-match[1].length;
      let end=start+match[1].length;
      for(let i=0;i<4;i++){
        const next=new RegExp('^\\s+('+orgToken+')').exec(src.value.slice(end));
        if(!next||stopOwner.test(next[1])||/^ب(?:م|ت|ا|ح|ف|ر|و|ج|ع|ص|ن)/.test(next[1])||/^(?:لت|لمراجع|لاعداد)/.test(next[1]))break;
        end+=next[0].length;
      }
      // «فريق» without a qualifier is not a named owner; e.g. «على فريق مراجعة ...».
      if(end===start+match[1].length && !/^(?:الامانه|المقاول|المورد|المدير|البلديه|المشغل)$/.test(match[1])) continue;
      return excerpt(src,start,end);
    }
    return '';
  }
  const number='(?:[0-9٠-٩۰-۹]+|واحد|اثنان|اثنين|ثلاثه?|اربعه?|خمسه?|سته?|سبعه?|ثمانيه?|تسعه?|عشره?|خمسه عشر|خمسه عشره)';
  const month='(?:يناير|فبراير|مارس|ابريل|مايو|يونيو|يوليو|اغسطس|سبتمبر|اكتوبر|نوفمبر|ديسمبر|محرم|صفر|رمضان|شوال)';
  const day='(?:الاحد|الاثنين|الثلاثاء|الاربعاء|الخميس|الجمعه|السبت)';
  const moment='(?:(?:ظهر|صباح|مساء|نهايه|منتصف|يوم)\\s+)?';
  const unit='(?:ايام(?:\\s+عمل)?|يوم(?:ين|ان|ا)?(?:\\s+عمل)?|اسابيع|اسبوع(?:ين|ان|ا)?|اشهر|شهر(?:ين|ان|ا)?|ساعات|ساع(?:ه|تين))';
  const dates='(?:'+moment+day+'|'+number+'\\s+'+month+'(?:\\s+[0-9٠-٩۰-۹]{4})?|[0-9٠-٩۰-۹]{1,4}[./-][0-9٠-٩۰-۹]{1,2}(?:[./-][0-9٠-٩۰-۹]{2,4})?|غدا|نهايه\\s+(?:الدوام|الاسبوع|الشهر)|الاجتماع\\s+المقبل|الجلسه\\s+(?:التاليه|المقبله))';
  const timeModifier='(?:\\s+(?:المقبل(?:ه)?|التالي(?:ه)?|القادم(?:ه)?|الحالي(?:ه)?))?';
  const deadlinePatterns=[
    new RegExp('(?:خلال|في غضون|بمده)\\s+(?:'+number+'\\s+)?'+unit+timeModifier),
    new RegExp('(?:قبل|بحلول|حتي|في موعد (?:اقصاه|لا يتجاوز)|في|موعد التسليم[:：]?)\\s+'+dates+timeModifier),
    new RegExp('(?:غدا|نهايه (?:الاسبوع|الدوام)|'+dates+timeModifier+')(?=\\s*[.!؟؛،,]?\\s*$)'),
  ];
  function deadline(src) {
    for(const pattern of deadlinePatterns){
      const match=pattern.exec(src.value);
      if(match) return excerpt(src,match.index,match.index+match[0].length);
    }
    return '';
  }
  const stop=new Set('في من علي عن الي ان كان مع تم هذا هذه وقد بين لدى عند او الذي التي هي هو خلال الي كما قد ذلك لل بين علي للاجتماع'.split(' '));
  function keyTerms(text){
    return new Set((normalized(text).match(/[ء-يa-z]{3,}/g)||[]).filter(v=>!stop.has(v)));
  }
  function similarity(a,b){
    if(!a.size||!b.size)return 0;
    let count=0;for(const w of a) if(b.has(w)) count++;
    return count/(a.size+b.size-count);
  }
  function sentences(text){
    // Preserve decimals, full dates and dotted abbreviations inside words/numbers.
    const parts=text.split(/(?:\r?\n)+|(?<=[!؟؛;])\s*|(?<=\.)(?=\s|$)|(?<=[،,])\s*(?=و(?:قررت|كلفت|اعتمدت|أقرت|أوصت|تتولى|قد يؤدي|تم تكليف)\s)/u);
    return parts.map(v=>v.trim()).filter(s=>s.length>1&&/[\u0600-\u06ffa-z]/i.test(s));
  }
  function summarize(items){
    if(!items.length)return [];
    const keys=items.map(x=>keyTerms(x.text));
    const scores=items.map((v,i)=>{
      const topical=keys.reduce((sum,set,j)=>sum+(j===i?0:similarity(keys[i],set)),0)/Math.max(1,items.length-1);
      const relevant={decision:.28,risk:.24,action:.26,info:0}[v.kind];
      return topical+relevant+.12/(1+i*.3)+(v.uncertain?-.12:0)+Math.min(keys[i].size,12)*.008;
    });
    const selected=[]; const kinds=new Set();
    const cap=Math.min(items.length,Math.max(1,Math.min(4,Math.ceil(items.length*.55))));
    while(selected.length<cap){
      let best=-1, bestScore=-Infinity;
      scores.forEach((s,i)=>{
        if(selected.includes(i))return;
        const overlap=selected.reduce((m,j)=>Math.max(m,similarity(keys[i],keys[j])),0);
        if(overlap>.75)return;
        const final=s-.40*overlap+(kinds.has(items[i].kind)?0:.10);
        if(final>bestScore){best=i;bestScore=final;}
      });
      if(best<0)break;
      selected.push(best);kinds.add(items[best].kind);
    }
    return selected.sort((a,b)=>a-b).map(i=>items[i].text);
  }
  function analyze(input){
    const raw=String(input||'');
    const separated=sentences(raw.slice(0,MAX_CHARS));
    const items=separated.slice(0,MAX_SENTENCES).map((text,sentenceIndex)=>{
      const result={text,sentenceIndex,...classify(text)};
      if(result.kind==='action'){
        const src=withOffsets(text);
        const o=owner(src), d=deadline(src);
        if(o)result.owner=o;
        if(d)result.deadline=d;
      }
      return result;
    });
    return {items,brief:summarize(items),truncated:raw.length>MAX_CHARS||separated.length>MAX_SENTENCES};
  }
  root.DiwanAI=Object.freeze({analyze,version:'1.0',maxChars:MAX_CHARS,maxSentences:MAX_SENTENCES});
})(typeof window==='undefined'?globalThis:window);
