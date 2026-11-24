"""Train and export the small Diwan Arabic minutes classifier. Python 3, standard library only.

Run python tooling/train_ai.py from the deployment root. All examples are authored
for this prototype and contain no ministry records. CALIBRATION is separate from
training; EVALUATION is never used to select weights or reject thresholds.
"""
from collections import Counter
from functools import lru_cache
from pathlib import Path
import base64
import json
import math
import random
import re
import struct

LABELS = ('action', 'decision', 'risk', 'info')
DIMS = 4096
# One independently authored training statement per line.
CORPUS = {
    'action': """
كلف رئيس الجلسة إدارة التراخيص بإعداد تصور جديد.
تتولى إدارة المشتريات التفاوض مع المورد وإبلاغ المكتب بالنتيجة.
على فريق الدعم تحديث قنوات الاستقبال قبل الاجتماع المقبل.
وجه الرئيس وكالة التخطيط بمراجعة خط الأساس.
طلب المجلس من الإدارة المالية تقديم كشف يتضمن حجم الالتزامات.
أسندت مهمة التنسيق إلى أمانة المجلس.
تلتزم إدارة المخاطر بتزويد اللجنة بتقييم الأثر خلال أسبوع.
يرجى من إدارة الجودة فحص قائمة الملاحظات وإعادتها.
أنيط بفريق التنفيذ حصر المواقع التي تحتاج إلى إعادة تأهيل.
أسند رئيس اللجنة إلى مكتب التحول إعداد النسخة النهائية.
يتعين على مدير البرنامج استكمال المستندات.
مطلوب من مكتب المشروعات مراجعة جدول التكاليف.
أحيلت الحالة إلى فريق المعالجة لمراجعتها ورفع التوصيات.
تقوم الأمانة بإعداد مسودة الرد وإرسالها للمراجعة.
تتكفل الشؤون الهندسية بإجراء زيارة ميدانية.
على الإدارات المعنية تسمية ممثليها وتسليم أسمائهم للأمانة.
كلفت اللجنة القطاع التقني باختبار اتصال الأنظمة.
تتابع إدارة الخدمات الطلبات المفتوحة وترفع تقريرا يوميا إلى المدير.
يكلف منسق البرنامج بمتابعة جاهزية الفرق وتوثيق النتائج.
يرفع فريق المشاريع بيان الكلفة إلى المجلس قبل الجلسة التالية.
تعد الإدارة القانونية مذكرة توضح شروط التعاقد.
تقدم إدارة العمليات خطة تشغيل بديلة خلال يومين.
يتولى مكتب الاستراتيجية جمع مقترحات الجهات.
تم تكليف فريق الصيانة بمراجعة الأعطال المتكررة.
أوكل إلى إدارة المالية تدقيق المطالبات الواردة.
يسند إلى إدارة التشريعات إعداد الرأي النظامي.
طلبت رئيسة اللجنة من فريق البيانات حصر السجلات المتأثرة.
نرجو تزويد مكتب المتابعة بالتقرير نهاية الأسبوع.
ينبغي لفريق المشروع تأكيد موعد التسليم مع الجهات المشاركة.
ترفع الأمانة قائمة المشاركين للموافقة عليها غدا.
أعدوا تقريرا بالأسباب وخطة المعالجة قبل الاجتماع.
تحققوا من بيانات المؤشر وأرسلوا الرقم الصحيح.
المطلوب إعداد نموذج متابعة مستقل لكل جهة.
وجه المكتب قطاع الأصول إلى مطابقة الأرقام مع كشف الجرد.
تتولى الوحدة المالية توثيق ملاحظات المراجعين.
التكليف هو تحديد أسباب التباين وموافاة المكتب بالأدلة.
يرجى مراجعة أرقام التكاليف وتقديم نسخة مصححة.
تنسق الأمانة مع الجهة المالكة لاستكمال الاشتراطات.
تتعهد إدارة النقل بتأمين مركبات احتياطية.
سيلتزم فريق الامتثال بإعداد سجل المخالفات.
طلب الرئيس مراجعة خيارات النقل ورفعها قبل الاجتماع.
إعداد خطة تصحيحية من مسؤولية الإدارة المعنية.
على إدارة الشراكات رفع مذكرة تتضمن توصيات التمديد.
كلف مدير المكتب قسم الأرشفة بتصحيح الوثائق الرقمية.
تكلف إدارة الاستثمار بتحديد المواقع المناسبة للمبادرة.
تتولى أمانة المحافظة إعداد الأولويات وتسليمها في الموعد.
مهمة فريق التصميم تقديم الرسومات المعدلة قبل الاثنين.
أرسلوا تفاصيل التكلفة إلى أمانة المجلس.
""",
    'decision': """
وافق المجلس على إطلاق المرحلة الأولى من البرنامج.
أقرت اللجنة خطة التحول بصيغتها الجديدة.
قرر الرئيس تأجيل الإطلاق إلى الشهر القادم.
اعتمد أعضاء المجلس ميزانية المسار التشغيلي.
تمت الموافقة على تمديد العقد لمدة شهر.
أجيز تخصيص الاعتماد المالي للمشروع.
صدرت الموافقة النهائية على دمج الوحدتين.
صادق المجلس على مخرجات الاجتماع السابق.
تم اعتماد التوصيات وإدراجها في خطة العمل.
اختارت اللجنة البديل الثاني ليكون أساسا للتنفيذ.
رفض المجلس طلب تعديل النطاق.
تقرر إيقاف العمل في المسار القديم.
أرجأ المجلس البت في المقترح إلى الدورة القادمة.
أقر المجتمعون تثبيت سعر الخدمة للربع المقبل.
جرى إلغاء البند الخامس من الخطة بعد التصويت.
حسمت اللجنة اختيار الموقع الشرقي للمركز.
اعتمدت آلية الاستلام الجديدة بالإجماع.
أجاز رئيس اللجنة بدء المرحلة التجريبية.
صدر قرار باعتماد الصلاحيات الجديدة.
أصبح الدليل الموحد معتمدا اعتبارا من الأحد.
خلص المجلس إلى الإبقاء على آلية التصعيد القائمة.
صوت الأعضاء لصالح تحويل المخصص إلى مسار الخدمات.
الموافقة على تمديد فترة المراجعة حتى نهاية الشهر.
أجمع الحاضرون على تعليق أعمال الحزمة مؤقتا.
اتفق الأعضاء نهائيا على إبقاء الضوابط الحالية.
تقررت إعادة توزيع المقاعد على الجهات.
أقر المكتب استثناء الحالات العاجلة من الإجراء المعتاد.
تم التصديق على ميثاق اللجنة.
اعتماد الجدول النهائي للزيارات الميدانية.
قرر المجتمعون المضي في خيار التنفيذ الداخلي.
رُفض طلب المورد لعدم اكتمال إثباتات الإنجاز.
صودق على تسوية المطالبة المالية.
ألغت اللجنة التعديل المقترح وأبقت الشروط السابقة.
اختيرت الأمانة مقرا للجلسة المقبلة.
صدر تعميم يقر بدء التشغيل المتدرج.
خرجت اللجنة بقرار يقضي بتوحيد معايير التقييم.
أجيز اعتماد جدول الدفعات وفق ما ورد في الملحق.
وافقت اللجنة على وقف الصرف من المخصص الاحتياطي.
أقر مجلس الإدارة إعادة الإجراء إلى مالكه.
حسم المجلس الخلاف باعتماد النسخة المعدلة.
""",
    'risk': """
قد يتأخر إطلاق الخدمة إذا لم تكتمل موافقات المورد.
تواجه الخطة مخاطر تشغيلية نتيجة محدودية الكوادر.
يهدد نقص مواد البناء القدرة على تسليم المواقع.
تعطل الربط يحول دون استكمال اختبارات القبول.
يحذر الفريق من احتمال تجاوز سقف الإنفاق.
تأخر صرف المستحقات قد يؤثر في التزام المقاول.
توجد فجوة في توافر مواقع بديلة وقت الإغلاق.
التوريد المتباطئ يعرض الجدول الزمني للخطر.
هناك احتمال لفقدان جزء من سجلات المعاملات أثناء الانتقال.
استمرار العطل يهدد استمرارية الخدمة.
تجاوزت تكلفة الحزمة السقف المسموح ولا يوجد غطاء للفارق.
من المرجح أن تفوتنا نافذة الافتتاح.
تخشى إدارة البرنامج تعذر تشغيل المرفق في موعده.
نقص المستندات يمنع إغلاق المطالبة.
لم تصل الموافقات اللازمة مما يعرقل بدء المشروع.
قد يؤدي تباين الأرقام إلى قرار مبني على تقدير خاطئ.
من دون تأمين مقاعد إضافية يصعب تحقيق مستهدف الحجوزات.
يوجد عائق في إصدار التصاريح وقد يمتد لأسبوع.
رحيل المشغل الحالي قبل جاهزية البديل يعرض الخدمة للانقطاع.
زمن الانتظار الطويل قد ينعكس سلبا على إقبال المستفيدين.
السعة المتاحة لا تكفي لتغطية الطلب المتوقع.
الاحتياطي يكفي أربعة أيام بينما تستغرق التوريدات عشرة أيام.
تظل سلامة المبنى مهددة إلى حين معالجة الشروخ.
إذا تأخر إصدار أمر الشراء فسيتأجل التسليم.
توقفت أعمال التأسيس لعدم وصول الخرائط المؤكدة.
أصبح تاريخ الإنجاز معرضا للتغيير بسبب نقص العمالة.
تثير مؤشرات التكاليف مخاوف من تجاوز الميزانية.
نقص السيولة يضع التزامات الربع القادم تحت ضغط.
لم تكتمل الاختبارات ما قد يحد من جاهزية المنصة.
غياب البديل سيصعب استعادة الخدمة عند الانقطاع.
من شأن التداخل بين الموعدين تعطيل حضور الجهات.
تتجاوز الطلبات الطاقة الحالية بما ينذر بتراكمها.
يرجح تأثر التسليم بسبب تأخر اعتماد الرسم الهندسي.
يمثل الاعتماد على مورد واحد خطرا على استمرارية التغطية.
احتمل الفريق ارتفاع التكلفة مع استمرار التأخير.
يحمل المقترح مخاطر بشأن دقة المطابقة.
الوحدات الاحتياطية أقل من الحد اللازم لتغطية الطوارئ.
تأمين المرحلة التالية غير مؤكد حتى الآن.
تعرقل صعوبة الوصول إلى المواقع إنجاز المسح.
يخشى المختصون أن ترتفع نسبة الأعطال مجددا.
""",
    'info': """
استعرض أعضاء اللجنة تقدم البرنامج منذ الربع الماضي.
بلغت نسبة الإنجاز اثنتين وسبعين في المئة.
حضر اللقاء ممثلون عن الأمانات ومكتب المتابعة.
افتتحت الجلسة بكلمة ترحيبية من الرئيس.
قدم الفريق شرحا لخطوات استقبال الطلبات.
ورد في التقرير أن عدد الزيارات تجاوز ألف زيارة.
ناقشت اللجنة مقترح تمديد العقد.
كان جدول الأعمال يتضمن ثلاثة محاور رئيسية.
عرضت إدارة التشغيل نموذجا أوليا لشاشة المتابعة.
أفادت الأمانة بأن الاجتماع سيعقد في المقر الرئيسي.
استمعت اللجنة إلى ملاحظات ممثلي القطاعات.
تحدث الخبير عن آلية تمويل المشروعات.
تم استعراض نسب الإنجاز دون صدور قرار بشأنها.
أوضح العرض الفرق بين آليتي التوزيع.
اطلع المشاركون على ملخص الورشة الماضية.
شمل التقرير ثلاثة مواقع في شمال المدينة.
بين الفريق أن الخدمة متاحة في قناتين.
استمر الاجتماع ساعة ونصف.
لم تتخذ اللجنة قرارا بشأن التوسع.
لا يوجد تكليف إضافي في هذا البند.
طُرحت فكرة إطلاق خدمة مساندة للنقاش.
جرى تداول الخيارات قبل الانتقال إلى البند التالي.
تلقى المكتب إشعارا بوصول العينة.
أعلن المقرر اكتمال النصاب.
أشار العرض إلى ارتفاع عدد المستفيدين.
توضح الشريحة الرابعة توزيع المسؤوليات.
ورد في المحضر وصف للخطة التشغيلية المعتمدة سابقا.
جاء في التقرير أن المشروع بدأ في يناير.
انتهى الاجتماع عند الساعة الثانية.
عرضت الأمانة حالة التكليفات السابقة.
تضمن جدول الأعمال مناقشة المخاطر.
أدرج الحاضرون نتائج الاستبيان ضمن مواد الجلسة.
نوقشت آلية اعتماد الطلبات عبر البوابة.
أطلع المدير الحضور على آخر المستجدات.
قدمت الشؤون القانونية عرضا حول قرارات سابقة.
استفسر عضو المجلس عن موعد افتتاح الفرع.
لا تزال صيغة القرار محل نقاش بين الأعضاء.
سيعرض المقترح على اللجنة للحصول على قرار لاحق.
لم يعتمد المجلس توصيات جديدة في جلسة اليوم.
أورد التقرير بعض الأمثلة من المدن الكبرى.
سجل التقرير أربعين حالة خلال الشهر.
""",
}
CALIBRATION = {
 'action': ['على وحدة الأداء إعداد مسودة للمؤشر في غضون أسبوع.', 'كلفت الإدارة فريق البلاغات بتدقيق السجل.', 'تتولى هيئة التطوير اختبار الموقع المقترح.', 'أوكلت متابعة المورد إلى مكتب التحول.', 'يرجى من أمانة اللجنة تسليم كشف الحضور.'],
 'decision': ['أقر الأعضاء إدخال تعديلات على جدول المتابعة.', 'وافقت اللجنة بالإجماع على أولوية المسار الشرقي.', 'تم التصديق على تمديد العمل بالإجراء.', 'أجاز المجلس إطلاق الخدمة للمستفيدين.', 'قرر الرئيس إغلاق المسار التجريبي.'],
 'risk': ['ربما يتعذر افتتاح الموقع بسبب تأخر التوريدات.', 'العطل الحالي يعرض سلامة العاملين للخطر.', 'لا تكفي الطاقة لدعم العدد المتوقع من الطلبات.', 'قد يتأثر إنجاز المشروع إذا استمر الإغلاق.', 'يمثل نقص المقاولين تحديا يهدد أعمال الصيانة.'],
 'info': ['استعرضت الأمانة أعداد الطلبات قيد الدراسة.', 'تضمن عرض البيانات أرقاما للربع الحالي.', 'حضر الجلسة ممثلان عن فريق الاستثمار.', 'تركز النقاش على مقترح إعادة الجدولة.', 'أورد الفريق في عرضه تفاصيل المسح.'],
}
EVALUATION = {
 'action': ['تتولى إدارة التشغيل مطابقة سجلات العدادات قبل ظهر الخميس.', 'على أمانة اللجنة موافاتنا بنسخة من محضر الاستلام خلال ثلاثة أيام عمل.', 'أُسندت مراجعة عقود الحزمة الثالثة إلى الشؤون القانونية، على أن ترفع ملاحظاتها في 12 ديسمبر.'],
 'decision': ['أقرّ المجلس تمديد مهلة التقديم أسبوعين، ويسري التمديد من تاريخ الجلسة.', 'استقر رأي اللجنة على الإبقاء على رسوم الخدمة عند 40 ريالًا للطلب.', 'أُجيز الصرف للدفعة الأولى وحدها، وأُرجئ البت في الدفعة الثانية.'],
 'risk': ['إذا استمر تعطل بوابة المورد، فقد يتعذر تسليم 18 وحدة في موعدها.', 'تغطي الكمية المتاحة خمسة أيام فقط، بينما تستغرق إعادة التوريد ثمانية أيام.', 'لم يصل تصريح الحفر حتى الآن، ما يهدد تاريخ بدء أعمال الموقع.'],
 'info': ['استُعرضت نتائج الربع الثالث، وبلغ عدد الطلبات المنجزة 320 طلبًا.', 'حضر الاجتماع ممثلون عن أربع أمانات، واعتذرت أمانة واحدة.', 'لم يصدر في الجلسة قرار بشأن زيادة السعة، واكتفى الأعضاء بمناقشة المقترح.'],
}
VOCAB = str.maketrans('إأآٱىةؤئ','اااايهوي')
def normalized(s):
    return re.sub(r'[\u064b-\u065f\u0670\u0640]', '', s).translate(VOCAB).lower()

@lru_cache(maxsize=None)
def index(key):
    h = 2166136261
    for char in key:
        h = ((h ^ ord(char)) * 16777619) & 0xffffffff
    return h % DIMS

def features(s):
    words = re.findall(r'[a-z\u0621-\u063a\u0641-\u064a]+', normalized(s))
    values = Counter()
    def add(key, weight):
        values[index(key)] += weight
    for i, word in enumerate(words):
        add('w'+word, 1.35)
        if i < 3:
            add('s'+word, .9)
        if i:
            add('b'+words[i-1]+' '+word,.65)
        bounded = '^'+word+'$'
        for size in (3,4):
            for j in range(len(bounded)-size+1):
                add('c'+bounded[j:j+size], .48)
    norm = math.sqrt(sum(v*v for v in values.values())) or 1
    return [(k,v/norm) for k,v in values.items()]

def scores(weights, bias, fv):
    return [b+sum(row[k]*v for k,v in fv) for row,b in zip(weights,bias)]

def probs(values):
    vals = [math.exp(v-max(values)) for v in values]
    den = sum(vals)
    return [v/den for v in vals]

def samples(dataset):
    for i, label in enumerate(LABELS):
        group=dataset[label]
        for s in (group.strip().splitlines() if isinstance(group,str) else group):
            yield s, i

def train():
    rng = random.Random(1125)
    data = [(features(s),target) for s,target in samples(CORPUS)]
    weights = [[0.] * DIMS for _ in LABELS]
    bias = [0.]*len(LABELS)
    for epoch in range(120):
        rng.shuffle(data)
        rate = .65/(1+epoch*.016)
        for fv, target in data:
            for label, p in enumerate(probs(scores(weights,bias,fv))):
                step=rate*(p-(label==target))
                for k,v in fv:
                    weights[label][k] -= step*v
                bias[label] -= step*.12
    return weights,bias

def rank(p):
    order=sorted(range(len(p)),key=p.__getitem__,reverse=True)
    return order[0], p[order[0]], p[order[0]]-p[order[1]]

def rejection_threshold(model,bias):
    # Maximize accepted correct classifications on a held-back set at >=95% precision.
    points=[(rank(probs(scores(model,bias,features(s)))), y) for s,y in samples(CALIBRATION)]
    best=(0,0,0)
    for threshold in (.42,.48,.54,.6,.66,.72):
        for margin in (.09,.13,.18,.24):
            used=[(cls,y) for (cls,p,m),y in points if p>=threshold and m>=margin]
            correct=sum(c==y for c,y in used)
            if used and correct/len(used)>=.95 and (correct,threshold,margin)>best:
                best=correct,threshold,margin
    return (best[1],best[2]) if best[0] else (.54,.18)
RUNTIME = r"""/* Diwan Arabic minutes classifier. Regenerate with tooling/train_ai.py. */
(function (root) {
  'use strict';
  const model = __MODEL__;
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
"""

def main():
    weights,bias=train()
    peak=max(abs(w) for row in weights for w in row)
    scale=peak/126
    packed=[round(w/scale) for row in weights for w in row]
    decoded=[[v*scale for v in packed[i*DIMS:(i+1)*DIMS]] for i in range(len(LABELS))]
    min_p,min_margin=rejection_threshold(decoded,bias)
    blob=struct.pack(f'{len(packed)}b',*packed)
    artifact=dict(bins=DIMS, scale=round(scale,10), bias=[round(b,7) for b in bias], minP=min_p, minMargin=min_margin, data=base64.b64encode(blob).decode())
    base = Path(__file__).resolve().parents[1]
    target = base / 'dist' if (base / 'dist' / 'index.html').is_file() else base
    out = target / 'ai-model.js'
    out.write_text(RUNTIME.replace('__MODEL__',json.dumps(artifact,separators=(',',':'))),encoding='utf-8')
    print('Written',out, 'training statements',sum(1 for _ in samples(CORPUS)), 'threshold',min_p,min_margin)
    count=correct=abstained=0
    for s,y in samples(EVALUATION):
        cls,p,m=rank(probs(scores(decoded,bias,features(s))))
        uncertain=p<min_p or m<min_margin
        count+=1;abstained+=uncertain
        correct+=int((3 if uncertain else cls)==y)
        print(LABELS[y],LABELS[cls],round(p,3), 'REVIEW' if uncertain else '',s)
    print('Independent model+abstention evaluation',correct,'/',count,'abstentions',abstained)
if __name__=='__main__':
    main()
