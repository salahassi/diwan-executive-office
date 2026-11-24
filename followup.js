/* Follow-up, council workspaces and the minister's mobile view. */
const officeFollow = {
  directiveFilter: 'الكل',
  councilFilter: 'الكل',
  ministerFilter: 'الأولويات',
  statuses: ['بانتظار البدء', 'قيد التنفيذ', 'مكتمل'],
  priorities: ['متوسطة', 'عالية'],
  icons: {
    add: '<path d="M12 5v14M5 12h14"/>',
    directive: '<path d="M5 5h11a2 2 0 0 1 2 2v3M5 5v15h13v-4M8 9h5M8 13h3M13 13l2.5 2.5L21 10"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    building: '<path d="M3 21h18M5 21V8h14v13M3 8l9-5 9 5M8 11v6m4-6v6m4-6v6"/>',
    team: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.4a3 3 0 0 1 0 5.2M18 14a5 5 0 0 1 3 4.5V20"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    flag: '<path d="M5 21V4m0 1q3-3 7 0t7 0v9q-3 3-7 0t-7 0"/>',
    doc: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h5"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    book: '<path d="M6 4h12v17l-6-4-6 4z"/>',
    dots: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5m0 4h.01"/>',
    stack: '<path d="m12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    chevron: '<path d="m14 6-6 6 6 6"/>',
    pin: '<path d="M18.5 10.5c0 5-6.5 10.5-6.5 10.5S5.5 15.5 5.5 10.5a6.5 6.5 0 0 1 13 0Z"/><circle cx="12" cy="10.5" r="2"/>',
    edit: '<path d="m14 5 4 4M4 20l4-.8L20 7.2a2.8 2.8 0 0 0-4-4L4.8 15.3z"/>'
  }
};
function followIcon(key, size = 19) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + officeFollow.icons[key] + '</svg>';
}
function followArg(value) {
  return esc(JSON.stringify(String(value)));
}
function followDate(date) {
  return date ? esc(prettyDate(date)) : 'غير محدد';
}
function followDeadline(offset) {
  const d = new Date(today + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
function followSoon(d) {
  return d.status !== 'مكتمل' && d.deadline && d.deadline <= followDeadline(7);
}
function followHigh(d) {
  return ['عالية', 'عاجل', 'عاجلة', 'مرتفع', 'مرتفعة', 'high'].includes(d.priority);
}
function followStatus(status) {
  const idx = officeFollow.statuses.indexOf(status);
  return '<span class="fo-status fo-s' + idx + '"><i></i>' + esc(status || 'بانتظار البدء') + '</span>';
}
function followEmpty(text, key = 'doc') {
  return '<div class="fo-empty">' + followIcon(key, 26) + '<p>' + esc(text) + '</p></div>';
}
function followHead(title, intro, button) {
  return '<header class="page-head fo-head"><div><h1>' + esc(title) + '</h1><p class="muted">' + esc(intro) + '</p></div>' + (button || '') + '</header>';
}
function followTab(label, current, fn, count) {
  return '<button type="button" class="fo-tab' + (current === label ? ' selected' : '') + '" aria-pressed="' + (current === label) + '" onclick="' + fn + '(' + followArg(label) + ')">' + esc(label) + (count !== undefined ? '<small>' + n(count) + '</small>' : '') + '</button>';
}
function followMetric(heading, value, sub, glyph, tone) {
  return '<div class="fo-metric"><span class="fo-symbol ' + tone + '">' + followIcon(glyph, 21) + '</span><div><span>' + esc(heading) + '</span><strong>' + n(value) + '</strong><small>' + esc(sub) + '</small></div></div>';
}
function followStats() {
  const rows = S.directives;
  return '<div class="fo-metrics">' +
    followMetric('إجمالي التوجيهات', rows.length, 'في سجل المكتب', 'directive', 'blue') +
    followMetric('قيد التنفيذ', rows.filter(x => x.status === 'قيد التنفيذ').length, 'لدى الجهات المسند إليها', 'clock', 'teal') +
    followMetric('تستحق المتابعة', rows.filter(followSoon).length, 'متأخرة أو تستحق خلال أسبوع', 'flag', 'amber') +
    followMetric('توجيهات مكتملة', rows.filter(x => x.status === 'مكتمل').length, 'أُغلقت بعد التنفيذ', 'check', 'green') + '</div>';
}
function directivesPage() {
  const filters = ['الكل', ...officeFollow.statuses, 'تستحق المتابعة'];
  return '<div class="fo-page">' + followHead('التوجيهات', 'تابع التوجيهات الصادرة عن معالي الوزير من الإسناد حتى اكتمال التنفيذ.', '<button class="btn primary" onclick="newDirective()">' + followIcon('add') + 'إصدار توجيه</button>') +
    followStats() + '<section class="panel fo-panel"><div class="fo-sectionhead"><div><h2>سجل التوجيهات</h2></div><label class="fo-search">' + followIcon('search', 18) + '<input id="fo-dir-search" aria-label="البحث في التوجيهات" placeholder="ابحث بالموضوع أو الجهة" oninput="followDrawDirectives()"></label></div>' +
    '<div class="fo-tabs" id="fo-dir-tabs">' + filters.map(x => followTab(x, officeFollow.directiveFilter, 'followFilterDirectives')).join('') + '</div><div id="fo-dir-rows">' + followDirectiveRows('') + '</div></section></div>';
}
function followFilterDirectives(filter) {
  officeFollow.directiveFilter = filter;
  document.getElementById('fo-dir-tabs').querySelectorAll('button').forEach(b => {
    const selected = b.textContent === filter;
    b.classList.toggle('selected', selected);
    b.setAttribute('aria-pressed', selected);
  });
  followDrawDirectives();
}
function followDrawDirectives() {
  document.getElementById('fo-dir-rows').innerHTML = followDirectiveRows(document.getElementById('fo-dir-search').value);
}
function followDirectiveRows(query) {
  const filter = officeFollow.directiveFilter;
  const list = S.directives.filter(d => (filter === 'الكل' || (filter === 'تستحق المتابعة' ? followSoon(d) : d.status === filter)) && (d.title + ' ' + d.owner).includes(query.trim()));
  if (!list.length) return followEmpty('لا توجد توجيهات تطابق البحث أو التصفية.');
  return '<div class="fo-table"><div class="fo-tablehead"><span>موضوع التوجيه</span><span>الجهة المسؤولة</span><span>الاستحقاق</span><span>الحالة</span><span></span></div>' + list.map(d => {
    const meeting = S.meetings.find(m => m.id === d.meetingId);
    return '<button type="button" class="fo-row" onclick="openDirective(' + followArg(d.id) + ')"><span class="fo-rowtitle"><strong>' + esc(d.title) + '</strong><small>' + esc(meeting ? meeting.title : 'صادر عن مكتب معالي الوزير') + '</small></span><span class="fo-owner">' + esc(d.owner) + '</span><span class="fo-deadline' + (d.deadline < today && d.status !== 'مكتمل' ? ' late' : '') + '">' + followDate(d.deadline) + '</span><span>' + followStatus(d.status) + '</span><span class="fo-rowchev">' + followIcon('chevron', 15) + '</span></button>';
  }).join('') + '</div>';
}
function followOwners() {
  return [...new Set([...S.directives.map(d => d.owner), ...S.meetings.map(m => m.sector), 'المكتب التنفيذي'].filter(Boolean))];
}
function followOwnerField(owner) {
  return '<label class="field">الجهة المسؤولة<input name="owner" required maxlength="90" list="fo-owners" autocomplete="off" value="' + esc(owner || '') + '" placeholder="اختر جهة أو اكتب اسمها"></label><datalist id="fo-owners">' + followOwners().map(o => '<option value="' + esc(o) + '"></option>').join('') + '</datalist>';
}
function followOptions(items, selected) {
  return items.map(x => '<option' + (x === selected ? ' selected' : '') + '>' + esc(x) + '</option>').join('');
}
function newDirective(defaults = {}) {
  const sourceId = defaults.meetingId || '';
  const m = S.meetings.find(x => x.id === sourceId);
  const linkedSource = Boolean(defaults.sourceText && m);
  const list = linkedSource ? [m] : defaults.councilId ? S.meetings.filter(x => x.councilId === defaults.councilId) : S.meetings;
  const form = '<form class="fo-form" onsubmit="followSaveNewDirective(event)"><input type="hidden" name="sourceText" value="' + esc(defaults.sourceText || '') + '"><input type="hidden" name="councilId" value="' + esc(defaults.councilId || '') + '"><label class="field">نص التوجيه<textarea required maxlength="400" name="title" rows="3" placeholder="حدّد الإجراء المطلوب من الجهة">' + esc(defaults.title || '') + '</textarea></label><div class="fo-formgrid">' + followOwnerField(defaults.owner || m?.sector || '') + '<label class="field">تاريخ الاستحقاق<input required name="deadline" type="date" value="' + followDeadline(7) + '"></label></div><div class="fo-formgrid"><label class="field">الأولوية<select name="priority">' + followOptions(officeFollow.priorities, defaults.priority || 'متوسطة') + '</select></label><label class="field">الاجتماع المرتبط<select name="meetingId">' + (linkedSource ? '' : '<option value="">توجيه مباشر</option>') + list.map(x => '<option value="' + esc(x.id) + '"' + (sourceId === x.id ? ' selected' : '') + '>' + esc(x.title) + '</option>').join('') + '</select></label></div><div class="fo-actions"><button class="btn primary" type="submit">' + followIcon('check', 17) + 'إصدار التوجيه</button><button class="btn secondary" type="button" onclick="closeModal()">إلغاء</button></div></form>';
  modal('إصدار توجيه جديد', form);
}
function followSaveNewDirective(event) {
  event.preventDefault();
  const fields = new FormData(event.target);
  const title = fields.get('title').trim(), owner = fields.get('owner').trim();
  if (!title || !owner) return toast('أدخل نص التوجيه واسم الجهة المسؤولة.');
  const meetingId = fields.get('meetingId');
  const councilId = S.meetings.find(x => x.id === meetingId)?.councilId || fields.get('councilId') || '';
  const d = {id: 'dir-' + crypto.randomUUID(), title, owner, deadline: fields.get('deadline'), priority: fields.get('priority'), status: 'بانتظار البدء', meetingId, councilId, history: [{date: today, text: 'أُصدر التوجيه وأُسند إلى ' + owner + '.'}]};
  if (fields.get('sourceText')) d.sourceText = fields.get('sourceText');
  S.directives.unshift(d);
  officeFollow.directiveFilter = 'الكل';
  persist();
  closeModal();
  render();
  openDirective(d.id);
  toast('صدر التوجيه وأُضيف إلى سجل المتابعة.');
}
function followDetailField(title, value, glyph) {
  return '<div class="fo-prop"><span class="fo-proplabel">' + followIcon(glyph, 15) + esc(title) + '</span><strong>' + value + '</strong></div>';
}
function openDirective(id) {
  const d = S.directives.find(x => x.id === id);
  if (!d) return;
  const meeting = S.meetings.find(m => m.id === d.meetingId);
  const items = (d.history || []).slice().reverse();
  const history = items.length ? items.map(h => '<li><strong>' + esc(typeof h === 'string' ? h : h.text || h.note || h.status || '') + '</strong>' + (h.date ? '<small>' + followDate(h.date.slice(0, 10)) + '</small>' : '') + '</li>').join('') : '<li><strong>الجهة المكلّفة بالتنفيذ</strong><small>' + esc(d.owner) + '</small></li>';
  const source = meeting ? '<button class="fo-link" onclick="openMeeting(' + followArg(meeting.id) + ')">' + esc(meeting.title) + ' ' + followIcon('chevron', 13) + '</button>' : 'مكتب معالي الوزير';
  modal('تفاصيل التوجيه', '<article class="fo-detail"><div class="fo-topline">' + followStatus(d.status) + (followHigh(d) ? '<span class="fo-priority">' + followIcon('flag', 14) + 'أولوية عالية</span>' : '') + '</div><h3>' + esc(d.title) + '</h3><div class="fo-props">' + followDetailField('الجهة المسؤولة', esc(d.owner), 'building') + followDetailField('تاريخ الاستحقاق', followDate(d.deadline), 'calendar') + '</div><div class="fo-source"><span>' + followIcon('doc', 16) + 'مصدر التوجيه</span>' + source + '</div>' + (d.sourceText ? '<h4>النص المستخرج من المحضر</h4><p class="fo-note">' + esc(d.sourceText) + '</p>' : '') + (d.note ? '<p class="fo-note">' + esc(d.note) + '</p>' : '') + '<h4>سجل المتابعة</h4><ol class="fo-history">' + history + '</ol><div class="fo-actions"><button class="btn primary" onclick="followEditDirective(' + followArg(id) + ')">' + followIcon('edit', 17) + 'تحديث التوجيه</button></div></article>');
}
function followEditDirective(id) {
  const d = S.directives.find(x => x.id === id);
  if (!d) return;
  modal('تحديث التوجيه', '<form class="fo-form" onsubmit="followSaveChanges(event,' + followArg(id) + ')"><p class="fo-note">' + esc(d.title) + '</p><div class="fo-formgrid"><label class="field">حالة التنفيذ<select name="status">' + followOptions(officeFollow.statuses, d.status) + '</select></label>' + followOwnerField(d.owner) + '</div><div class="fo-formgrid"><label class="field">تاريخ الاستحقاق<input type="date" name="deadline" required value="' + esc(d.deadline) + '"></label><label class="field">الأولوية<select name="priority">' + followOptions(officeFollow.priorities, followHigh(d) ? 'عالية' : 'متوسطة') + '</select></label></div><label class="field">ملاحظات المتابعة<textarea name="note" rows="3" maxlength="600" placeholder="أضف مستجدات التنفيذ أو مخرجات الإغلاق"></textarea></label><div class="fo-actions"><button class="btn primary" type="submit">حفظ التحديث</button><button class="btn secondary" type="button" onclick="openDirective(' + followArg(id) + ')">رجوع</button></div></form>');
}
function followSaveChanges(event, id) {
  event.preventDefault();
  const f = new FormData(event.target), d = S.directives.find(x => x.id === id);
  if (!d) return;
  const owner = f.get('owner').trim(), status = f.get('status'), deadline = f.get('deadline'), priority = f.get('priority'), note = f.get('note').trim();
  if (!owner) return toast('أدخل الجهة المسؤولة.');
  const parts = [];
  if (status !== d.status) parts.push('تغيّرت الحالة إلى «' + status + '»');
  if (owner !== d.owner) parts.push('أُعيد الإسناد إلى ' + owner);
  if (deadline !== d.deadline) parts.push('تغيّر موعد الاستحقاق إلى ' + prettyDate(deadline));
  if (priority !== (followHigh(d) ? 'عالية' : 'متوسطة')) parts.push('تغيّرت الأولوية إلى ' + priority);
  if (note) parts.push(note);
  if (!parts.length) {openDirective(id); return;}
  Object.assign(d, {status, owner, deadline, priority});
  if (note) d.note = note;
  (d.history ||= []).push({date: today, text: parts.join('، ')});
  persist();
  closeModal();
  render();
  openDirective(id);
  toast(status === 'مكتمل' ? 'حُفظ التحديث وأُغلق التوجيه.' : 'حُفظ التحديث في سجل المتابعة.');
}
function followSessions(c) {
  return S.meetings.filter(m => m.councilId === c.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
function followTasks(c) {
  const ids = followSessions(c).map(x => x.id);
  return S.directives.filter(d => d.councilId === c.id || ids.includes(d.meetingId));
}
function followExternal(type) {return /خارج/.test(type || '');}
function councilsPage() {
  const options = ['الكل', 'داخلية', 'خارجية'];
  return '<div class="fo-page">' + followHead('المجالس واللجان', 'مساحات عمل تجمع جلسات كل مجلس ولجنة ومخرجاتها والتوجيهات المرتبطة بها.', '<button class="btn primary" onclick="followNewCouncil()">' + followIcon('add') + 'إنشاء مساحة عمل</button>') +
    '<div class="fo-sectionhead fo-councilfilters"><div class="fo-tabs" id="fo-c-tabs">' + options.map(x => followTab(x, officeFollow.councilFilter, 'followCouncilFilter')).join('') + '</div><label class="fo-search">' + followIcon('search', 17) + '<input id="fo-c-search" aria-label="البحث في المجالس واللجان" placeholder="ابحث عن مجلس أو لجنة" oninput="followDrawCouncils()"></label></div><div id="fo-c-cards">' + followCouncilCards('') + '</div></div>';
}
function followCouncilFilter(filter) {
  officeFollow.councilFilter = filter;
  document.querySelectorAll('#fo-c-tabs button').forEach(b => {const hit = b.textContent === filter; b.classList.toggle('selected',hit); b.setAttribute('aria-pressed',hit);});
  followDrawCouncils();
}
function followDrawCouncils() {
  document.getElementById('fo-c-cards').innerHTML = followCouncilCards(document.getElementById('fo-c-search').value.trim());
}
function followCouncilCards(query) {
  const filter = officeFollow.councilFilter;
  const list = S.councils.filter(c => (filter === 'الكل' || followExternal(c.type) === (filter === 'خارجية')) && (c.name + ' ' + c.chair).includes(query));
  if (!list.length) return followEmpty('لا توجد مساحات عمل تطابق التصفية.', 'team');
  return '<div class="fo-cards">' + list.map(c => {
    const ext = followExternal(c.type), sessions = followSessions(c), active = followTasks(c).filter(x => x.status !== 'مكتمل');
    return '<button type="button" class="fo-councilcard" onclick="openCouncil(' + followArg(c.id) + ')"><span class="fo-crown"><span class="fo-symbol ' + (ext ? 'violet' : 'teal') + '">' + followIcon(ext ? 'team' : 'building', 24) + '</span><span class="fo-type">' + (ext ? 'جهة خارجية' : 'جهة داخلية') + '</span></span><strong>' + esc(c.name) + '</strong><span class="fo-carddesc">' + esc(c.description || 'مساحة لتنسيق الجلسات ومتابعة مخرجاتها.') + '</span><span class="fo-cardstats"><span>' + followIcon('calendar', 15) + 'الجلسات <b>' + n(sessions.length) + '</b></span><span>' + followIcon('directive', 15) + 'توجيهات مفتوحة <b>' + n(active.length) + '</b></span></span><span class="fo-cardfoot">فتح مساحة العمل ' + followIcon('chevron', 15) + '</span></button>';
  }).join('') + '</div>';
}
function followNewCouncil() {
  modal('إنشاء مساحة عمل', '<form class="fo-form" onsubmit="followSaveCouncil(event)"><label class="field">اسم المجلس أو اللجنة<input name="name" required maxlength="100" placeholder="اسم مساحة العمل"></label><div class="fo-formgrid"><label class="field">نطاق العمل<select name="type"><option>داخلية</option><option>خارجية</option></select></label><label class="field">رئيس المجلس أو اللجنة<input name="chair" required maxlength="90"></label></div><label class="field">اختصاص المجلس أو اللجنة<textarea name="description" rows="2" required maxlength="360" placeholder="ما الموضوعات التي تختص بها هذه المساحة؟"></textarea></label><label class="field">الأعضاء <small>افصل بين الأسماء بفاصلة</small><textarea name="members" rows="2" maxlength="800"></textarea></label><div class="fo-actions"><button class="btn primary" type="submit">إنشاء المساحة</button><button class="btn secondary" type="button" onclick="closeModal()">إلغاء</button></div></form>');
}
function followSaveCouncil(event) {
  event.preventDefault();
  const f = new FormData(event.target);
  const name = f.get('name').trim(), chair = f.get('chair').trim(), description = f.get('description').trim();
  if (!name || !chair || !description) return toast('أكمل اسم المساحة ورئيسها واختصاصها.');
  if (S.councils.some(c => c.name === name)) return toast('توجد مساحة عمل بهذا الاسم.');
  const c = {id: 'council-' + crypto.randomUUID(), name, chair, type: f.get('type'), description, members: [...new Set(f.get('members').split(/[,،\n]/).map(x => x.trim()).filter(Boolean))], outputs: []};
  S.councils.unshift(c); officeFollow.councilFilter = 'الكل';
  persist(); closeModal(); render(); openCouncil(c.id); toast('أُنشئت مساحة العمل.');
}
function openCouncil(id, tab = 'الجلسات') {
  const c = S.councils.find(x => x.id === id);
  if (!c) return;
  const tabs = ['الجلسات', 'المخرجات', 'التوجيهات', 'الأعضاء'];
  const count = [followSessions(c).length, (c.outputs || []).length, followTasks(c).length, new Set([c.chair, ...(c.members || [])].filter(Boolean)).size];
  const tabsHtml = tabs.map((t, idx) => '<button type="button" class="fo-tab' + (tab === t ? ' selected' : '') + '" aria-pressed="' + (tab === t) + '" onclick="openCouncil(' + followArg(id) + ',' + followArg(t) + ')">' + esc(t) + '<small>' + n(count[idx]) + '</small></button>').join('');
  let body;
  if (tab === 'المخرجات') body = followCouncilOutputs(c);
  else if (tab === 'التوجيهات') body = followCouncilTasks(c);
  else if (tab === 'الأعضاء') body = followCouncilMembers(c);
  else body = followCouncilSessions(c);
  modal(c.name, '<div class="fo-detail fo-workspace"><div class="fo-topline"><span class="fo-type">' + (followExternal(c.type) ? 'مساحة خارجية' : 'مساحة داخلية') + '</span><span class="fo-meta">' + followIcon('team', 16) + 'برئاسة ' + esc(c.chair) + '</span></div><p class="fo-description">' + esc(c.description) + '</p><div class="fo-tabs fo-worktabs">' + tabsHtml + '</div>' + body + '</div>');
}
function followCouncilSessions(c) {
  const meetings = followSessions(c);
  const out = (c.outputs || []).length;
  const sorted = [...meetings.filter(m => m.date >= today), ...meetings.filter(m => m.date < today).reverse()];
  const rows = sorted.map(m => '<button class="fo-sourcebutton" onclick="openMeeting(' + followArg(m.id) + ')"><span class="fo-symbol teal">' + followIcon('calendar') + '</span><span><strong>' + esc(m.title) + '</strong><small>' + followDate(m.date) + ' · <bdi>' + esc(m.time) + '</bdi> · ' + (m.date < today ? 'جلسة سابقة' : 'جلسة مجدولة') + '</small></span>' + followIcon('chevron', 14) + '</button>').join('');
  return '<div class="fo-subhead"><h4>جلسات المجلس أو اللجنة</h4><button class="fo-link" onclick="followScheduleCouncil(' + followArg(c.id) + ')">' + followIcon('add', 16) + 'جدولة جلسة</button></div>' + (rows || followEmpty('لم تُضف جلسات لهذه المساحة بعد.', 'calendar')) + (out ? '<button type="button" class="fo-callout" onclick="openCouncil(' + followArg(c.id) + ',&quot;المخرجات&quot;)">' + followIcon('stack', 19) + '<span>استعرض مخرجات الجلسات عند التحضير للجلسة التالية.</span>' + followIcon('chevron', 14) + '</button>' : '');
}
function followScheduleCouncil(id) {
  const c = S.councils.find(x => x.id === id);
  if (c) newMeeting({title: 'اجتماع ' + c.name, councilId: c.id, people: [...new Set([c.chair, ...(c.members || [])])], sector: followSessions(c).at(-1)?.sector || c.name, category: 'استراتيجي'});
}
function followCouncilOutputs(c) {
  const past = followSessions(c).filter(m => m.date < today).at(-1);
  const outputs = (c.outputs || []).map(o => {
    const legacy = typeof o === 'string';
    const session = legacy ? past : S.meetings.find(m => m.id === o.meetingId);
    const label = legacy ? o : o.text || o.title || '';
    const src = session ? '<button type="button" class="fo-link" onclick="openMeeting(' + followArg(session.id) + ')">' + esc(session.title) + '</button>' : '<small>' + (legacy ? 'محضر الجلسة السابقة' : 'مساحة المجلس أو اللجنة') + '</small>';
    return '<div class="fo-output"><span class="fo-symbol green">' + followIcon('doc', 17) + '</span><div><strong>' + esc(label) + '</strong>' + src + '</div></div>';
  });
  return '<div class="fo-subhead"><h4>سجل المخرجات</h4><button class="fo-link" onclick="followNewOutput(' + followArg(c.id) + ')">' + followIcon('add', 16) + 'توثيق مخرج</button></div>' + (outputs.join('') || followEmpty('لم توثّق مخرجات في هذه المساحة بعد.'));
}
function followNewOutput(id) {
  const c = S.councils.find(x => x.id === id);
  if (!c) return;
  modal('توثيق مخرج جلسة', '<form class="fo-form" onsubmit="followSaveOutput(event,' + followArg(id) + ')"><label class="field">الجلسة<select name="meetingId">' + followSessions(c).reverse().map(m => '<option value="' + esc(m.id) + '">' + esc(m.title) + ' · ' + followDate(m.date) + '</option>').join('') + '<option value="">سجل المجلس أو اللجنة</option></select></label><label class="field">المخرج المعتمد<textarea name="text" rows="3" maxlength="500" required placeholder="دوّن ما اتفق عليه الأعضاء"></textarea></label><div class="fo-actions"><button type="submit" class="btn primary">توثيق المخرج</button><button type="button" class="btn secondary" onclick="openCouncil(' + followArg(id) + ',&quot;المخرجات&quot;)">رجوع</button></div></form>');
}
function followSaveOutput(event, id) {
  event.preventDefault();
  const c = S.councils.find(x => x.id === id), f = new FormData(event.target), text = f.get('text').trim();
  if (!c || !text) return toast('أدخل نص المخرج.');
  (c.outputs ||= []).push({text, meetingId: f.get('meetingId'), date: today});
  persist(); closeModal(); render(); openCouncil(id, 'المخرجات'); toast('وُثّق مخرج الجلسة.');
}
function followCouncilTasks(c) {
  const rows = followTasks(c).map(d => '<button class="fo-sourcebutton" onclick="openDirective(' + followArg(d.id) + ')"><span class="fo-symbol blue">' + followIcon('directive') + '</span><span><strong>' + esc(d.title) + '</strong><small>' + esc(d.owner) + ' · ' + followDate(d.deadline) + '</small></span>' + followStatus(d.status) + '</button>');
  return '<div class="fo-subhead"><h4>توجيهات ومهام المساحة</h4><button class="fo-link" onclick="newDirective({councilId:' + followArg(c.id) + '})">' + followIcon('add', 16) + 'إصدار توجيه</button></div>' + (rows.join('') || followEmpty('لا توجد توجيهات مسندة إلى هذه المساحة.', 'directive'));
}
function followCouncilMembers(c) {
  const people = [...new Set([c.chair, ...(c.members || [])].filter(Boolean))];
  return '<div class="fo-members">' + people.map(p => '<div class="fo-person"><span class="fo-person-icon">' + followIcon('team', 17) + '</span><div><strong>' + esc(p) + '</strong><small>' + (p === c.chair ? 'رئيس المجلس أو اللجنة' : 'عضو') + '</small></div></div>').join('') + '</div>';
}
function followWatch() {return S.ministerWatch || [];}
function followToggleWatch(key) {
  const saved = followWatch();
  S.ministerWatch = saved.includes(key) ? saved.filter(x => x !== key) : [...saved, key];
  persist(); render(); toast(S.ministerWatch.includes(key) ? 'أُضيف الموضوع إلى قائمتي.' : 'أُزيل الموضوع من قائمتي.');
}
function followMinisterFilter(filter) {officeFollow.ministerFilter = filter; render();}
function followMinisterItem(x) {
  const saved = followWatch().includes(x.key);
  const action = (x.type === 'اجتماع' ? 'openMeeting' : 'openDirective') + '(' + followArg(x.id) + ')';
  return '<article class="fo-minitem"><button class="fo-minopen" onclick="' + action + '"><span class="fo-symbol ' + (x.type === 'اجتماع' ? 'blue' : 'amber') + '">' + followIcon(x.type === 'اجتماع' ? 'calendar' : 'directive') + '</span><span><small>' + esc(x.type) + ' · ' + esc(x.reason) + '</small><strong>' + esc(x.title) + '</strong><small>' + esc(x.meta) + '</small></span></button><button type="button" class="fo-mark' + (saved ? ' saved' : '') + '" aria-label="' + (saved ? 'إزالة من قائمتي' : 'إضافة إلى قائمتي') + '" title="' + (saved ? 'إزالة من قائمتي' : 'إضافة إلى قائمتي') + '" aria-pressed="' + saved + '" onclick="followToggleWatch(' + followArg(x.key) + ')">' + followIcon('book', 19) + '</button></article>';
}
function ministerPage() {
  const upcoming = S.meetings.filter(m => m.date >= today && !['declined','pending'].includes(m.invite)).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
  const active = S.directives.filter(d => d.status !== 'مكتمل');
  const mt = S.meetings.map(m => ({type: 'اجتماع', id: m.id, key: 'm:' + m.id, title: m.title, meta: m.sector + ' · ' + prettyDate(m.date), reason: m.finding ? 'نقاط تستدعي المراجعة' : 'ملف الاجتماع', featured: !!m.finding && m.date >= today}));
  const dt = S.directives.map(d => ({type: 'توجيه', id: d.id, key: 'd:' + d.id, title: d.title, meta: d.owner + ' · ' + prettyDate(d.deadline), reason: d.status === 'مكتمل' ? 'مكتمل' : d.deadline < today ? 'تجاوز موعد الاستحقاق' : followHigh(d) ? 'أولوية عالية' : 'متابعة التنفيذ', featured: d.status !== 'مكتمل' && (followSoon(d) || followHigh(d))}));
  const filter = officeFollow.ministerFilter, all = [...mt, ...dt];
  const topics = filter === 'قائمتي' ? all.filter(x => followWatch().includes(x.key)) : filter === 'كل المواضيع' ? all : all.filter(x => x.featured);
  const next = upcoming[0];
  const call = next ? '<div class="fo-minnext"><div><small>الاجتماع القادم في الجدول</small><h2>' + esc(next.title) + '</h2><p>' + followIcon('calendar', 16) + followDate(next.date) + ' <bdi>' + esc(next.time) + '</bdi> · ' + esc(next.location || next.sector) + '</p></div><button class="btn secondary" onclick="openMeeting(' + followArg(next.id) + ')">' + followIcon('doc',17) + 'عرض ملف الاجتماع</button></div>' : '';
  return '<div class="fo-page">' + followHead('واجهة معالي الوزير', 'تابع الموضوعات التي تتطلب عنايتكم، وأصدر توجيهًا مباشرًا إلى الجهة المختصة.', '<button class="btn primary" onclick="newDirective()">' + followIcon('add') + 'إصدار توجيه</button>') + call +
    '<div class="fo-minlayout"><section class="panel fo-panel"><div class="fo-sectionhead"><h2>الموضوعات المهمة</h2></div><div class="fo-tabs">' + ['الأولويات','قائمتي','كل المواضيع'].map(x => followTab(x,filter,'followMinisterFilter',x === 'قائمتي' ? followWatch().length : undefined)).join('') + '</div><div class="fo-minlist">' + (topics.map(followMinisterItem).join('') || followEmpty(filter === 'قائمتي' ? 'احفظ موضوعًا عبر رمز الإشارة المرجعية ليظهر هنا.' : 'لا توجد مواضيع تتطلب المتابعة حاليًا.', 'book')) + '</div></section><section class="panel fo-panel"><div class="fo-sectionhead"><h2>متابعة التنفيذ</h2></div><div class="fo-min-summary"><p><span>توجيهات مفتوحة</span><strong>' + n(active.length) + '</strong></p><p><span>تستحق المتابعة</span><strong>' + n(active.filter(followSoon).length) + '</strong></p><p><span>توجيهات مكتملة</span><strong>' + n(S.directives.length - active.length) + '</strong></p><button class="fo-link" onclick="go(\'directives\')">فتح سجل التوجيهات ' + followIcon('chevron',14) + '</button></div></section></div></div>';
}
