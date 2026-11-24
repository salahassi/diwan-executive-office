/* Arabic numeric cross-check. Figures are compared only inside matching metric, unit and scope. */
(function (root) {
  'use strict';
  const months = 'يناير فبراير مارس ابريل مايو يونيو يوليو اغسطس سبتمبر اكتوبر نوفمبر ديسمبر'.split(' ');
  const ordinals = {اول:1,اولي:1,اولا:1,ثاني:2,ثانيه:2,ثان:2,ثالث:3,ثالثه:3,رابع:4,رابعه:4,خامس:5,خامسه:5,سادس:6,سادسه:6};
  const scales = {الف:1e3,الاف:1e3,مليون:1e6,ملايين:1e6,مليار:1e9,مليارات:1e9};
  const scalar = Object.keys(scales).join('|');
  const units = [
    ['pct','%', /^(?:%|بالمئه|في\s+المئه|بالمائه|في\s+المائه)/u],
    ['sar','ريال',/^(?:ريالات|ريالا|ريال)(?:\s+سعودي(?:ا|ه)?)?/u],
    ['usd','دولار',/^(?:دولارات|دولارا|دولار)/u],
    ['days','يوم',/^(?:ايام|يوما|يوم)/u],
    ['hours','ساعة',/^(?:ساعات|ساعه)/u],
    ['minutes','دقيقة',/^(?:دقائق|دقيقه)/u],
    ['units','وحدة',/^(?:وحدات|وحده)/u],
    ['projects','مشروع',/^(?:مشروعا|مشروع|مشاريع)/u],
    ['requests','طلب',/^(?:طلبات|طلبا|طلب)/u],
    ['cases','بلاغ',/^(?:بلاغات|بلاغا|بلاغ)/u],
    ['users','مستفيد',/^(?:مستفيدين|مستفيدون|مستفيدا|مستفيد)/u],
    ['km','كم',/^(?:كيلومترا|كيلومتر|كم)(?![\u0621-\u064a])/u],
    ['count','',null]
  ];
  const names = {انجاز:'نسبة الإنجاز',رضا:'رضا المستفيدين',اشغال:'نسبة الإشغال',جاهزيه:'الجاهزية',تكلفه:'التكلفة',ميزانيه:'الميزانية',انفاق:'الإنفاق',ايراد:'الإيرادات',التزام:'الالتزام',تغطيه:'التغطية',استجابه:'الاستجابة',معالجه:'المعالجة',تسليم:'التسليم',اغلاق:'الإغلاق',حوادث:'عدد الحوادث',حضور:'الحضور',غياب:'الغياب',نمو:'النمو',استفاده:'الاستفادة',استيعاب:'الطاقة الاستيعابية'};
  const stop = new Set(('ان و او ثم من الي في على علي عن قبل بعد خلال بنسبة بنسبه نسبه النسبه معدل متوسط مؤشر المؤشر هذا هذه ذلك تلك الحالي الحاليه حسب المصدر الاجتماع عرض تقرير الفريق افاد افادت تظهر ظهر اشار اشارت يفيد بين تعادل ما يقدر قدر قدرت قدرتها يساوي ساوي سجل سجلت تسجل بلغ بلغت تبلغ وصل وصلت يصل ارتفع ارتفعت انخفض انخفضت حقق حققت اصبح اصبحت كانت كان تم اجمالي قيمه قيمته عند حتي نحو قرابه حوالي مع بتاريخ تاريخ منجز مقارنه كما بينما فيما مقابل قطاع منطقه مرحله دفعه سنه عام شهر ربع الربع النصف العام فتره يوم منذ للمؤشر نفسه نفسها عدد بنسبه انجازا اعمال بشأن بشان وفق بموجب حققت حقق العروض عرضا عن تقرير ميداني ميدانيه تحقق شرائح شريحه جدول وزاره مشاريع مشروع فريق ويوضح اوضح اكد ورد وردت').split(' '));
  const coreAliases = [
    ['انجاز',/^(?:انجاز(?:ات|ا)?|تقدم)$/],['رضا',/^رض[اي]$/],['اشغال',/^اشغال$/],['جاهزيه',/^جاهزي[هت]$/],
    ['تكلفه',/^(?:تكلفه|تكاليف|كلفه)$/],['ميزانيه',/^(?:ميزانيه|موازنه)$/],['انفاق',/^(?:انفاق|مصروفات|صرف)$/],
    ['ايراد',/^(?:ايراد|ايرادات|عائدات)$/],['التزام',/^(?:التزام|امتثال)$/],['تغطيه',/^تغطيه$/],['استجابه',/^استجابه$/],
    ['معالجه',/^معالجه$/],['تسليم',/^تسليم$/],['اغلاق',/^اغلاق$/],['حوادث',/^(?:حوادث|حادث)$/],
    ['حضور',/^حضور$/],['غياب',/^غياب$/],['نمو',/^نمو$/],['استفاده',/^استفاده$/],['استيعاب',/^استيعابي[هت]$/]
  ];
  function normalize(text) {
    return String(text || '').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0))
      .replace(/(?<=\d)[,٬](?=\d{3}(?:\D|$))/g,'').replace(/٫/g,'.').replace(/٪/g,'%')
      .replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase();
  }
  function stripArticle(token) {
    return token.replace(/^(?:وبال|ولل|فال|وال|بال|لل|ال)(?=[\u0621-\u064a]{2})/u,'');
  }
  function tokens(s){return (s.match(/[\u0621-\u064a]+/gu)||[]).map(stripArticle);}
  function foldOrdinal(token){return ordinals[stripArticle(token)] || Number(token) || null;}
  function groupOf(s, re) {const m=s.match(re);return m ? m[1] : '';}
  const monthsRe=months.join('|');
  function scope(raw) {
    const result={};
    const month=groupOf(raw,new RegExp('('+monthsRe+')','u')); if(month) result.month=months.indexOf(month)+1;
    const year=groupOf(raw,/(?:^|\D)((?:20|14)\d{2})(?=\D|$)/u);if(year) result.year=+year;
    const namedDay=groupOf(raw,new RegExp('(\\d{1,2})\\s+(?:'+monthsRe+')','u'));if(namedDay) result.day=+namedDay;
    const iso=raw.match(/(?:^|\D)(20\d{2})[-/](\d{1,2})[-/](\d{1,2})(?!\d)/u);
    const dmy=raw.match(/(?:^|\D)(\d{1,2})[-/](\d{1,2})[-/](20\d{2})(?!\d)/u);
    if(iso) Object.assign(result,{year:+iso[1],month:+iso[2],day:+iso[3]});
    if(dmy) Object.assign(result,{year:+dmy[3],month:+dmy[2],day:+dmy[1]});
    for(const [key,word] of [['quarter','ربع'],['half','نصف'],['batch','دفعه'],['phase','مرحله'],['wave','موجه']]) {
      const next=groupOf(raw,new RegExp('(?:ال)?'+word+'\\s+(?:رقم\\s+)?([\\u0621-\\u064a]+|\\d+)','u'));
      const n=foldOrdinal(next);if(n) result[key]=n;
    }
    const list=tokens(raw);
    const location=list.filter(t=>/^(?:رياض|جده|مكه|مدينه|دمام|خبر|طائف|حائل|تبوك|عسير|جازان|قصيم|جوف|احساء|نجران|باحه|شماليه|جنوبيه|غربيه|شرقيه|شمالي|جنوبي|غربي|شرقي)$/.test(t));
    if(location.length) result.location=[...new Set(location)].sort().join(' ');
    for(const [key,keyword] of [['project','مشروع'],['district','حي'],['sector','قطاع']]) {
      const m=raw.match(new RegExp('(?:^|\\s)(?:'+keyword+')\\s+([\\u0621-\\u064a]+)(?:\\s+(ال[\\u0621-\\u064a]+))?','u'));
      if(!m) continue;
      const first=stripArticle(m[1]),second=stripArticle(m[2]||'');
      if(first.length<3 || stop.has(first) || /^(?:هذا|هذه|كل|كنسبه|خلال|ضمن|بنسبه|مقابل|بتاريخ|وفق|المذكور|تحت)$/.test(first)) continue;
      result[key]=[first,second].filter(Boolean).join(' ');
    }
    const target=list.some(t=>/^(مستهدفه?|مخططه?|متوقعه?|هدف|تستهدف|يستهدف)$/.test(t));
    const actual=list.some(t=>/^(فعلي|فعليه|متحقق|متحققه|حقيقي|حقيقيه)$/.test(t));
    if(target)result.scenario='target';else if(actual)result.scenario='actual';
    return result;
  }
  function comparableScope(a,b) {
    if((a.scenario==='target') !== (b.scenario==='target')) return false;
    return Object.keys(a).every(k=>!b[k]||a[k]===b[k]);
  }
  function parseUnit(tail,context) {
    const scaleMatch=tail.match(new RegExp('^('+scalar+')(?![\\u0621-\\u064a])','u'));
    const scale=scaleMatch?scaleMatch[1]:'';
    const rem=(scale?tail.slice(scale.length):tail).trimStart();
    for(const [key,label,re] of units){if(re && re.test(rem)) return {key,label,multiple:scales[scale]||1,scale};}
    // A bare number is accepted only with an explicit count cue such as "عدد الطلبات 120".
    if(/(?:^|\s)(?:عدد|تعداد)\s+/.test(context) && !new RegExp('^(?:'+monthsRe+')','u').test(rem)) {
      return {key:'count',label:'',multiple:scales[scale]||1,scale};
    }
    return null;
  }
  function labelInfo(ctx,unit) {
    const words=tokens(ctx);
    const ids=new Set();for(const word of words) {for(const [id,pattern] of coreAliases){if(pattern.test(word)) ids.add(id);}}
    const features=new Set(words.filter(w=>w.length>=2 && !stop.has(w) && !months.includes(w) && !ordinals[w] && !scales[w] && !['فعلي','فعليه','مستهدف','مستهدفه','ربع','التي','الذي','في','مئه','مائه'].includes(w)));
    let inferred=unit;
    if(unit==='count') {const possibilities=[['requests',/طلبات/],['cases',/بلاغات/],['units',/وحدات/],['projects',/مشاريع|مشروعات/],['users',/مستفيد/]];const found=possibilities.find(([k,re])=>re.test(ctx)); if(found) inferred=found[0];}
    return {ids,features,inferred};
  }
  const format=n=>new Intl.NumberFormat('en-US',{useGrouping:false,maximumFractionDigits:9}).format(n);
  const readableScale={الف:'ألف',الاف:'آلاف',مليون:'مليون',ملايين:'ملايين',مليار:'مليار',مليارات:'مليارات'};
  function display(raw,unit){return format(raw)+(unit.scale?' '+readableScale[unit.scale]:'')+(unit.key==='pct'?'%':unit.label?' '+unit.label:'');}
  function extract(text) {
    const records=[];
    // Match punctuation only when it is not the decimal separator of a reported value.
    const sentences=String(text||'').slice(0,60000).split(/\r?\n|[!?؟؛;]|(?<![0-9٠-٩۰-۹])\.|\.(?![0-9٠-٩۰-۹])/u).map(s=>s.trim()).filter(Boolean);
    for(const sentence of sentences) {
      const clauses=sentence.split(/،|,\s+(?![0-9])|\s+(?=(?:بينما|فيما)\s)|\s+(?=و(?:بلغت?|سجلت?|وصلت?|ارتفعت?|بلغ عدد)\s)/u).filter(s=>s.trim());
      for(const clause of clauses) {
        const line=normalize(clause), hits=[];
        for(const m of line.matchAll(/[-+]?\d+(?:\.\d+)?/g)) {
          const i=m.index,j=i+m[0].length;const before=line.slice(0,i),tail=line.slice(j).trimStart();
          if(/[-/][0-9]$/.test(line.slice(Math.max(0,i-2),i+1)) || /^(?:[-/]\d)/.test(tail) || /[-/]$/.test(before)) continue;
          if(/(?:ال)?(?:دفعه|مرحله|موجه|ربع|عام|سنه|شهر|يوم|بتاريخ|شريحه|جدول)\s+(?:رقم\s+)?$/.test(before)) continue;
          if(new RegExp('^(?:'+monthsRe+')','u').test(tail)) continue;
          const numeric=Number(m[0]);if(!Number.isFinite(numeric))continue;
          const unit=parseUnit(tail,before);if(!unit)continue;
          hits.push({i,j,numeric,unit});
        }
        // Ranges and two values sharing an ambiguous label cannot be compared reliably.
        if(hits.length!==1)continue;
        const {i,j,numeric,unit}=hits[0];let ctx=line.slice(0,i)+' '+line.slice(j);
        ctx=ctx.replace(/(?:بتاريخ|بموجب تقرير مؤرخ في|بتاريخ يوم)\s+.*$/u,'').replace(/[-+]?\d+(?:\.\d+)?|%/g,' ');
        const info=labelInfo(ctx,unit.key);if(!info.features.size&&!info.ids.size && info.inferred==='count') continue;
        const context=scope(line);
        if(clauses.length>1){ // Inherit an adjacent standalone date caption, including a leading report date.
          const dated=clauses.map(c=>normalize(c).trim()).filter(c=>/^(?:(?:بتاريخ|خلال|في|عن|نهايه|بنهايه|حتي)\s+)(?:يوم\s+)?(?:\d|الربع|عام|شهر|النصف)/.test(c) && !/%|ريال|دولار|وحده/.test(c));
          if(dated.length===1) Object.assign(context,scope(dated[0]),scope(line));
        }
        records.push({raw:numeric,value:numeric*unit.multiple,unit,info,scope:context,quote:sentence,context:ctx});
      }
    }
    return records;
  }
  function affinity(a,b) {
    if(a.info.inferred!==b.info.inferred || !comparableScope(a.scope,b.scope)) return 0;
    const x=a.info.ids,y=b.info.ids;
    if(x.size!==y.size || [...x].some(k=>!y.has(k))) return 0;
    const af=a.info.features,bf=b.info.features,intersection=[...af].filter(t=>bf.has(t)).length;
    const denom=Math.max(1,Math.max(af.size,bf.size));
    const similarity=intersection/denom;
    if(!x.size && (!intersection||similarity<.64))return 0;
    // Shared metric words alone cannot identify unrelated named projects/sectors.
    const aSpecific=[...af].filter(w=>!coreAliases.some(([id,re])=>re.test(w))&&!units.some(([k,l,re])=>re&&re.test(w)));
    const bSpecific=[...bf].filter(w=>!coreAliases.some(([id,re])=>re.test(w))&&!units.some(([k,l,re])=>re&&re.test(w)));
    if(aSpecific.length && bSpecific.length && !aSpecific.some(w=>bSpecific.includes(w)))return 0;
    if(x.size && similarity<.33) return 0;
    const scopeMatches=Object.keys(a.scope).filter(k=>b.scope[k]&&a.scope[k]===b.scope[k]).length;
    return 1+similarity+Math.min(scopeMatches,4)*.12;
  }
  function title(a,b){
    const k=[...a.info.ids][0];if(k) return names[k]||k;
    const countNames={units:'عدد الوحدات',projects:'عدد المشاريع',requests:'عدد الطلبات',cases:'عدد البلاغات',users:'عدد المستفيدين'};
    if(countNames[a.info.inferred])return countNames[a.info.inferred];
    return [...a.info.features].filter(w=>b.info.features.has(w)).slice(0,5).join(' ')||a.unit.label;
  }
  function compareExtracted(a,b) {
    const edges=[],bestA=new Map(),bestB=new Map();
    function remember(map,key,score) {
      const best=map.get(key);
      if(!best || score>best.score+1e-8) map.set(key,{score,count:1});
      else if(Math.abs(score-best.score)<1e-8)best.count++;
    }
    for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){const s=affinity(a[i],b[j]);if(s>0){edges.push({i,j,s});remember(bestA,i,s);remember(bestB,j,s);}}
    const issues=[],usedA=new Set(),usedB=new Set();
    for(const e of edges.sort((p,q)=>q.s-p.s)) {
      if(usedA.has(e.i)||usedB.has(e.j)) continue;
      // Equally plausible counterparts are ambiguous, even if one contains the same value.
      const forA=bestA.get(e.i),forB=bestB.get(e.j);
      if(forA.count!==1 || forB.count!==1 || e.s<forA.score-1e-8 || e.s<forB.score-1e-8)continue;
      usedA.add(e.i);usedB.add(e.j);
      const l=a[e.i],r=b[e.j],diff=Math.abs(l.value-r.value);
      if(diff<=Math.max(1e-8,Math.max(Math.abs(l.value),Math.abs(r.value))*1e-12))continue;
      const inferredUnit=units.find(u=>u[0]===l.info.inferred);
      const unit=l.unit.key==='pct'?'نقطة مئوية':l.unit.label||r.unit.label||inferredUnit?.[1]||'';
      issues.push({metric:title(l,r),firstValue:display(l.raw,l.unit),secondValue:display(r.raw,r.unit),
        delta:format(diff)+(unit?' '+(unit==='نقطة مئوية'&&Number.isInteger(diff)&&diff>=3&&diff<=10?'نقاط مئوية':unit):''),unit,
        firstQuote:l.quote,secondQuote:r.quote});
    }
    return {issues,matchedCount:usedA.size,equalCount:usedA.size-issues.length,leftCount:a.length,rightCount:b.length};
  }
  function compare(left,right){return compareExtracted(extract(left),extract(right));}
  root.DiwanCompare=Object.freeze({compare,extract,compareExtracted});
})(typeof window==='undefined'?globalThis:window);
