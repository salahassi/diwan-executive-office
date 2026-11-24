/* Local evidence retrieval from the user's current executive records. */
(() => {
  'use strict';

  function normalize(text) {
    return String(text || '').normalize('NFKC').toLowerCase().replace(/[\u064b-\u065f\u0670ـ]/g, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  }

  function stem(word) {
    // Keep the root of words such as وحدة and وثائق intact.
    if (/^[وف](?:ال|لل|بال|كال)/.test(word)) word = word.slice(1);
    if (/^(?:بال|كال)/.test(word) && word.length > 5) word = word.slice(3);
    else if (/^لل/.test(word) && word.length > 4) word = word.slice(2);
    else if (/^ال/.test(word) && word.length > 4) word = word.slice(2);
    return word;
  }

  const stopWords = new Set(normalize('في من عن على إلى قبل بعد حتى مع عند بين ضمن حول بخصوص بالنسبة بشأن خلال بالخصوص ما ماذا كيف متى وين أين هل كم أي الذي التي هذه هذا ذلك تلك إلى أن إن أو ثم و هي هو كان كانت تكون يكون قد تم منذ اليوم عندنا عنا شو ايش بدنا بدي أريد ابحث بحث أبحث عطني اعطيني السجل سجلات سوابق السابق السابقة سابقة السابقه السابقين موضوع بموضوع بخصوص بموضوعه اللجنة المجلس الجلسة جلسة الاجتماع اجتماع اجتماعات قرار قرارات تقرر قرر قرروا تقررت قررت توجيه توجيهات اتفق اتفقت توصلنا بشأن نظام تنفيذ متعلق يتعلق الخاص الخاصة تخص يخص بخص يتعلق يخصها ماذا عملنا صار حدث مشروع مشاريع المبادرة فريق أعمال استعراض متابعة متابعه مراجعة').split(/\s+/).map(stem));
  const equivalents = [
    'إسكان سكن سكني سكنية مساكن شقة شقق منزل منازل وحدة وحدات سكنيه',
    'تسليم استلام تسلّم استلامها تسليمها تسليمات تسلم تسليمها',
    'جاهزية جاهزة جاهز جاهزيتها للجاهزية',
    'موعد مواعيد توقيت تاريخ',
    'مطابقة تدقيق تحقق مراجعةالقياسات مقارنة مطابقتها مطابقتهم',
    'إنجاز انجازات المنجز تقدم التقدم',
    'ميداني ميدانية ميدان حقل حقلي ميدانياً',
    'تقرير تقارير',
    'بلاغ بلاغات شكاوى شكوى شكاوي',
    'إغلاق إقفال اغلاقها إغلاقه اقفالها',
    'زمن مدة أزمنة',
    'رخصة رخص تراخيص ترخيص رخصه تصاريح تصريح',
    'تبسيط مبسط ميسر مبسطة أسهل',
    'استمارة نموذج نماذج',
    'حفريات حفر حفرية حفرات',
    'خريطة خرائط خرائطية مخططات',
    'مرور مرورية مروري المرور',
    'طريق طرق شوارع شارع',
    'حي أحياء',
    'زيارة زيارات',
    'استبيان استطلاع استبانة استطلاعات',
    'مؤشر مؤشرات',
    'أولوية أولويات ترتيب مفاضلة',
    'مستفيد المستفيدين مستفيدة مستفيدون',
    'دفعة دفعات',
    'رسوم رسم',
    'مقاول مقاولين مقاولون',
    'تمويل تمويلي ميزانية موازنة',
    'مرافق مرفق',
    'تأخر تأخير تأجيل تأخرت'
  ];
  const lexicon = new Map();
  equivalents.forEach(group => {
    const words = normalize(group).split(/\s+/).map(stem);
    words.forEach(w => lexicon.set(w, words[0]));
  });

  function tokens(value) {
    return (normalize(value).match(/[\p{L}\p{N}]+/gu) || []).map(w => {
      let s = stem(w);
      if (!lexicon.has(s) && /^[ولبف]/.test(s) && lexicon.has(s.slice(1))) s = s.slice(1);
      return lexicon.get(s) || s;
    }).filter(w => w.length > 1 && !stopWords.has(w));
  }

  function extractDocs(state, date) {
    const meetings = state.meetings || [], byId = new Map(meetings.map(m => [m.id,m]));
    const confirmed = m => m && !['pending','declined'].includes(m.invite);
    const rows = [];
    meetings.filter(confirmed).forEach(m => {
      const minutes = String(m.minutes || m.transcript || '').trim();
      const quote = minutes || m.summary || '';
      if (quote) rows.push({kind:'meeting',id:m.id,meetingId:m.id,title:m.title,context:m.sector,label:minutes?'محضر جلسة':'ملخص اجتماع',quote,date:m.date,view:minutes?'minutes':'brief'});
    });
    (state.directives || []).forEach(d => {
      const m = byId.get(d.meetingId);
      const issued = (d.history || [])[0]?.date || d.createdAt?.slice?.(0,10) || m?.date || '';
      rows.push({kind:'directive',id:d.id,meetingId:d.meetingId,title:d.title,
        context:[d.owner,m?.title].filter(Boolean).join(' · '),label:'توجيه',quote:d.sourceText || d.title,
        date:issued,status:d.status});
    });
    (state.councils || []).forEach(c => {
      const previous = meetings.filter(m => confirmed(m) && m.councilId === c.id && m.date < date)
        .sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time))[0];
      (c.outputs || []).forEach(output => {
        const legacy = typeof output === 'string', m = legacy ? previous : byId.get(output.meetingId);
        const quote = legacy ? output : output.text || output.title;
        if (!quote) return;
        rows.push({kind:'council',id:c.id,meetingId:m?.id,title:c.name,context:m?.title || '',
          label:'مخرج موثّق',quote,date:legacy ? (m?.date || '') : (output.date || m?.date || '')});
      });
    });
    return rows;
  }

  function search(state, query, options = {}) {
    const q = [...new Set(tokens(query))];
    if (!q.length) return [];
    const now = options.today || '2026-11-25';
    const record = state.meetings.find(m => m.id === options.meetingId);
    const cutoff = record?.date < now ? record.date : now;
    const docs = extractDocs(state, now).filter(d =>
      (!record || d.meetingId !== record.id) && (options.includeCurrent || (d.date && d.date < cutoff)));
    if (!docs.length) return [];

    const df = new Map();
    const data = docs.map(doc => {
      const tf = new Map();
      // BM25 weights reflect relevance of the record itself first; source/owner supply context.
      [[doc.quote,1.8],[doc.title,1.2],[doc.context,0.45]].forEach(([text,weight]) => {
        tokens(text).forEach(w => tf.set(w, (tf.get(w) || 0) + weight));
      });
      tf.forEach((_,w) => df.set(w,(df.get(w) || 0)+1));
      return {doc,tf,length:[...tf.values()].reduce((a,b)=>a+b,0)};
    });
    const average = data.reduce((a,b)=>a+b.length,0)/data.length || 1;
    const found = [];
    for (const {doc,tf,length} of data) {
      const matched = q.filter(w => tf.has(w));
      if (matched.length / q.length < (q.length>5 ? 0.33 : 0.47)) continue;
      let score = 0;
      for (const w of matched) {
        const idf = Math.log(1 + (docs.length - df.get(w) + 0.5)/(df.get(w) + 0.5));
        const f = tf.get(w);
        score += idf * f * 2.4 / (f + 1.4 * (0.3 + 0.7 * length / average));
      }
      const inContent = new Set(tokens(doc.quote + ' ' + doc.title));
      if (!matched.some(w => inContent.has(w))) continue;
      score *= 0.5 + matched.length / q.length;
      const sentences = (String(doc.quote).match(/[^\n.!؟؛]+(?:[.!؟؛]|$)/g) || [doc.quote]).map(s=>s.trim()).filter(Boolean);
      const strongest = sentences.map((s,i)=>({s,i,n:tokens(s).filter(t=>matched.includes(t)).length})).sort((a,b)=>b.n-a.n||a.i-b.i)[0];
      found.push({...doc,excerpt:strongest?.s || doc.quote,score});
    }
    return found.sort((a,b)=>b.score-a.score || (b.date||'').localeCompare(a.date||'')).slice(0,8);
  }

  let relatedMeeting = '';
  let visible = [];
  function list() {
    const field = document.getElementById('dp-query');
    if (!field) return;
    const query = field.value.trim(), includeCurrent = document.getElementById('dp-mode').checked;
    visible = search(S, query, {today,meetingId:relatedMeeting,includeCurrent});
    const target = document.getElementById('dp-results');
    if (!query || !visible.length) {
      target.innerHTML = '<div class="dp-empty">'+esc(query ? 'لا توجد سوابق مطابقة لهذا البحث في النطاق المحدد.' : 'أدخل موضوعًا للبحث في السجل.')+'</div>';
      return;
    }
    target.innerHTML = '<p class="dp-count">'+visible.length+' نتائج مرتبطة بالموضوع</p>'+visible.map((r,i)=>{
      const dateText = r.date ? prettyDate(r.date) : 'تاريخ غير مسجّل';
      const period = !r.date?'':(r.date < today ? 'سابق' : r.date === today ? 'اليوم' : 'مجدول');
      return '<button type="button" class="dp-hit" data-dp-hit="'+i+'"><span class="dp-top"><b>'+esc(r.label)+'</b><small>'+esc([dateText,period,r.status].filter(Boolean).join(' · '))+'</small></span><strong>'+esc(r.title)+'</strong><span class="dp-excerpt">'+esc(r.excerpt)+'</span><small class="dp-src">'+icon('file',14)+' فتح المصدر</small></button>';
    }).join('');
  }

  function open(meetingId) {
    const m = (S.meetings || []).find(x=>x.id===meetingId);
    relatedMeeting = m?.id || '';
    const query = m ? [m.title, m.agenda?.[0]].filter(Boolean).join(' ') : '';
    modal('استرجاع السوابق','<div class="dp-body"><p class="dp-intro">'+esc(m ? 'استعدّ لاجتماع «'+m.title+'» بالرجوع إلى السجل السابق.': 'ابحث في ملخصات الاجتماعات والتوجيهات ومخرجات المجالس واللجان.')+'</p><form id="dp-form"><label for="dp-query">ما الموضوع الذي تريد معرفة ما سبق بشأنه؟</label><div class="dp-search"><input id="dp-query" type="search" maxlength="250" placeholder="مثال: ماذا اعتمدت اللجنة لتسليم المساكن؟" value="'+esc(query)+'"><button class="btn primary" type="submit">'+icon('search',16)+' بحث</button></div><label class="dp-mode"><input type="checkbox" id="dp-mode"> تضمين سجلات اليوم والجلسات القادمة</label></form><div id="dp-results" aria-live="polite"></div></div>');
    document.getElementById('dp-form').addEventListener('submit', e => {e.preventDefault();list();});
    document.getElementById('dp-mode').addEventListener('change', list);
    document.getElementById('dp-query').addEventListener('input', list);
    document.getElementById('dp-results').addEventListener('click', e => {
      const hit = e.target.closest('[data-dp-hit]');
      if (!hit) return;
      const d = visible[Number(hit.dataset.dpHit)];
      if (d?.kind === 'meeting') openMeeting(d.id,d.view);
      else if (d?.kind === 'council') openCouncil(d.id,'المخرجات');
      else if (d) openDirective(d.id);
    });
    list();
  }

  window.DiwanPrecedents = {search};
  window.openPrecedents = open;
})();
