import type { Article } from "@/lib/api/types";
import { ph } from "./images";

/**
 * Sample editorial content for the fictional brand "Atlas Estates".
 * It makes no factual claims about real places, people or markets and is not professional advice.
 */
export const articles: Article[] = [
  {
    slug: "reading-a-house-from-the-street",
    title: { en: "Reading a house from the street", ar: "كيف تقرأ البيت من الشارع" },
    excerpt: {
      en: "Before you step inside, the facade has already told you a great deal. A short guide to looking.",
      ar: "قبل أن تدخل، تكون الواجهة قد أخبرتك الكثير. دليل قصير في فنّ النظر.",
    },
    category: { en: "Architecture", ar: "عمارة" },
    author: { en: "Editorial desk (sample)", ar: "هيئة التحرير (تجريبي)" },
    date: "2026-09-18T12:00:00Z",
    readMinutes: 6,
    image: ph(12, "A modern house seen from the street", "بيت حديث يُرى من الشارع"),
    body: {
      en: [
        "Stand across the road for a full minute before you ring the bell. A house is a composition, and the street is the best place to see how it was composed: where the mass is heaviest, where it opens, and where it keeps its distance.",
        "Start with the roofline. A low, wide roof often belongs to a home meant to sit close to the ground and to its garden. A tall, narrow one suggests rooms stacked to catch light or a view. Neither is better, but each promises a different kind of life inside.",
        "Look next at the rhythm of openings. Windows that repeat evenly suggest a plan of equal rooms. Windows that vary in size usually mean someone decided which rooms deserved more sky. Ask yourself whether the largest opening faces the quietest side.",
        "Materials age differently. Timber greys, brick darkens, render stains where water runs. None of that is a flaw, but it tells you where the building has been working hardest and what kind of care it will want.",
        "Notice the threshold: the path, the step, the door. The way a house receives you is the way it will greet you every evening. A generous, sheltered entrance is worth more than most people think when they are carrying shopping in the rain.",
        "Finally, read the neighbours. The best houses talk to the street without shouting at it. If the facade, the fence and the planting seem to agree with the buildings beside them, the setting is likely to feel settled.",
      ],
      ar: [
        "قف على الجانب الآخر من الطريق دقيقة كاملة قبل أن تضغط الجرس. البيت تكوين مدروس، والشارع أفضل مكان لترى كيف رُكّب: أين تثقل الكتلة، وأين تنفتح، وأين تحتفظ بمسافتها.",
        "ابدأ بخط السقف. السقف المنخفض العريض يخص غالباً بيتاً أُريد له أن يلتصق بالأرض وبحديقته، والسقف العالي الضيق يوحي بغرف متراصة لتلتقط الضوء أو المنظر. لا أحدهما أفضل من الآخر، لكن كلاً منهما يَعِد بحياة مختلفة في الداخل.",
        "انتقل بعد ذلك إلى إيقاع الفتحات. النوافذ المتكررة بانتظام توحي بمخطط من غرف متساوية، أما اختلاف أحجامها فيعني عادة أن أحداً قرر أي الغرف تستحق سماء أوسع. اسأل نفسك: هل تطل أكبر فتحة على أهدأ الجهات؟",
        "المواد تشيخ بطرق مختلفة. الخشب يميل إلى الرمادي والطوب يغمق والطلاء يتبقع حيث يسيل الماء. ليس في ذلك عيب، لكنه يدلّك على المواضع التي كدّ فيها المبنى أكثر وعلى نوع العناية التي سيطلبها.",
        "تأمل العتبة: الممر والدرجة والباب. الطريقة التي يستقبلك بها البيت هي الطريقة التي سيحييك بها كل مساء. المدخل الرحب المظلل أثمن مما يظن كثيرون حين تحمل مشترياتك تحت المطر.",
        "وأخيراً اقرأ الجيران. أجمل البيوت تحاور الشارع دون أن تصيح فيه. إذا بدت الواجهة والسور والنباتات متفقة مع المباني المجاورة، فالأرجح أن المكان يبعث على الاستقرار.",
      ],
    },
  },
  {
    slug: "light-is-the-cheapest-luxury",
    title: { en: "Light is the cheapest luxury", ar: "الضوء أرخص أشكال الفخامة" },
    excerpt: {
      en: "Why designers obsess over orientation, and how to judge daylight on a single visit.",
      ar: "لماذا يهتم المصممون بالاتجاه إلى هذا الحد، وكيف تحكم على الضوء الطبيعي في زيارة واحدة.",
    },
    category: { en: "Design", ar: "تصميم" },
    author: { en: "Editorial desk (sample)", ar: "هيئة التحرير (تجريبي)" },
    date: "2026-08-27T12:00:00Z",
    readMinutes: 5,
    image: ph(19, "A bright interior with large windows", "فضاء داخلي مضيء بنوافذ كبيرة"),
    body: {
      en: [
        "Surfaces can be changed, kitchens can be replaced, walls can be moved. Daylight is the one quality that is almost impossible to buy afterwards. That is why careful designers think about orientation before they think about finishes.",
        "On a viewing, ask which way each room faces and then check it with your own eyes. In the northern hemisphere, south-facing rooms tend to receive the longest sun; north-facing ones hold a cooler, steadier light that many artists prefer. Neither is wrong.",
        "Visit at more than one hour if you can. A room that glows at noon may be dim by five. If a second visit is not possible, ask to see the home in the late afternoon, when the evening routine of a household actually happens.",
        "Look at how light travels. An open stair, a glazed door or a high window can borrow brightness from one room and lend it to the next. Deep floor plans with a single window wall often need this kind of help.",
        "Finally, consider the shade you cannot see: trees that will grow, buildings that may rise. A garden that is bright in winter can be dense in summer, and the reverse can also be true.",
      ],
      ar: [
        "يمكن تغيير الأسطح، واستبدال المطابخ، ونقل الجدران. أما الضوء الطبيعي فهو الصفة الوحيدة التي يكاد يستحيل شراؤها لاحقاً. ولهذا يفكر المصممون المتأنون في الاتجاه قبل التشطيبات.",
        "في المعاينة اسأل إلى أي جهة تطل كل غرفة، ثم تحقق بعينيك. في نصف الكرة الشمالي تنال الغرف المطلة جنوباً أطول مدة شمس، وتحتفظ الشمالية بضوء أبرد وأثبت يفضّله كثير من الفنانين. ولا أحدهما خطأ.",
        "زُر في أكثر من ساعة إن استطعت. غرفة تتوهج عند الظهر قد تخفت عند الخامسة. وإن تعذرت زيارة ثانية فاطلب رؤية البيت في العصر المتأخر، حين تجري الروتينات المسائية للأسرة فعلاً.",
        "انظر كيف يسافر الضوء. درج مفتوح أو باب زجاجي أو نافذة عالية قد تستعير السطوع من غرفة وتعيره لأخرى. والمخططات العميقة ذات جدار النوافذ الواحد تحتاج غالباً إلى هذا النوع من العون.",
        "وأخيراً فكّر في الظل الذي لا تراه: أشجار ستنمو ومبانٍ قد ترتفع. حديقة مشرقة في الشتاء قد تكثف في الصيف، والعكس ممكن أيضاً.",
      ],
    },
  },
  {
    slug: "a-calm-guide-to-moving-day",
    title: { en: "A calm guide to moving day", ar: "دليل هادئ ليوم الانتقال" },
    excerpt: {
      en: "Six weeks, one list and a few small rituals that make moving feel less like a siege.",
      ar: "ستة أسابيع وقائمة واحدة وبعض الطقوس الصغيرة تجعل الانتقال أقل شبهاً بالحصار.",
    },
    category: { en: "Moving", ar: "انتقال" },
    author: { en: "Editorial desk (sample)", ar: "هيئة التحرير (تجريبي)" },
    date: "2026-08-04T12:00:00Z",
    readMinutes: 6,
    image: ph(2, "A quiet street at the start of a new chapter", "شارع هادئ في بداية فصل جديد"),
    body: {
      en: [
        "Moving is mostly a problem of sequence. Done in the right order, it is a series of small, ordinary tasks. Done all at once, it is a crisis. A six-week rhythm turns the second into the first.",
        "In the first two weeks, decide what is leaving the household. Sell, donate or recycle before you pack anything. Every box you never fill is a box you never carry, never pay to carry, and never unpack.",
        "In the middle weeks, handle the paperwork: addresses, utilities, subscriptions, school or work notifications. Keep a single list and tick it as you go. A list on paper beside the kettle is often more reliable than any app.",
        "In the final week, pack by room and label by destination, not by content. A box marked kitchen, top shelf, is more useful to a tired helper than a box marked glasses and kettle.",
        "Prepare an essentials bag that travels with you: chargers, medicines, bedding for the first night, a few tools and something for a first meal. You will not want to search for any of these at nine in the evening.",
        "On the day itself, walk the empty home once more. Take a last photograph, say a short goodbye, and leave it ready for the next household. Endings done kindly make the arrival easier.",
      ],
      ar: [
        "الانتقال مسألة ترتيب في المقام الأول. إذا جرى بالتسلسل الصحيح كان سلسلة من مهام صغيرة عادية، وإذا جرى دفعة واحدة صار أزمة. وإيقاع الأسابيع الستة يحوّل الثانية إلى الأولى.",
        "في الأسبوعين الأولين قرّر ما الذي سيغادر البيت. بِع أو تبرّع أو أعد التدوير قبل أن تحزم شيئاً. كل صندوق لن تملأه هو صندوق لن تحمله ولن تدفع لحمله ولن تفرغه.",
        "في الأسابيع الوسطى أنجز الأوراق: العناوين والخدمات والاشتراكات وإخطارات المدرسة أو العمل. احتفظ بقائمة واحدة وضع عليها علامة كلما أنجزت بنداً. قائمة ورقية بجوار الغلاية أوثق غالباً من أي تطبيق.",
        "في الأسبوع الأخير ضع في الصناديق بحسب الغرفة وسمّها بحسب الوجهة لا بحسب المحتوى. صندوق مكتوب عليه مطبخ، الرف العلوي، أنفع لمساعد متعب من صندوق مكتوب عليه أكواب وغلاية.",
        "جهّز حقيبة أساسيات تسافر معك: شواحن وأدوية وفراش الليلة الأولى وبعض الأدوات وما يكفي لوجبة أولى. لن ترغب في البحث عن أي منها في التاسعة مساءً.",
        "وفي اليوم نفسه امشِ في البيت الفارغ مرة أخيرة. التقط صورة أخيرة وودّعه بكلمة قصيرة واتركه جاهزاً للأسرة التالية. النهايات اللطيفة تُسهّل الوصول.",
      ],
    },
  },
  {
    slug: "how-to-compare-three-homes",
    title: { en: "How to compare three homes without losing your mind", ar: "كيف تقارن بين ثلاثة بيوت دون أن تفقد صوابك" },
    excerpt: {
      en: "A simple method for property discovery: same questions, same order, same notes.",
      ar: "طريقة بسيطة لاكتشاف العقار: الأسئلة نفسها بالترتيب نفسه والملاحظات نفسها.",
    },
    category: { en: "Property discovery", ar: "اكتشاف العقار" },
    author: { en: "Editorial desk (sample)", ar: "هيئة التحرير (تجريبي)" },
    date: "2026-07-15T12:00:00Z",
    readMinutes: 5,
    image: ph(20, "A living room prepared for a viewing", "غرفة معيشة جاهزة للمعاينة"),
    body: {
      en: [
        "After the third viewing, most people cannot remember which kitchen belonged to which house. The remedy is not a better memory but a better method, and it fits on one page.",
        "Before you start, write down five things that matter most to you. Three might be practical, such as space, light and commute. Two might be about feeling, such as calm or a place to host friends. This list is your compass.",
        "At each visit, ask the same questions in the same order and note the answers immediately. Take three photographs from the same positions: the entrance, the main living space and the view from the largest window.",
        "Score each home out of five against your list the same evening, not the next week. Impressions fade quickly, and the charm of the last house can quietly erase the faults of the first.",
        "Use a side-by-side view to compare measures that are comparable, and leave the rest to judgement. A number cannot tell you which hallway feels welcoming. It can tell you which one is wider.",
        "If two homes remain close, return to the one you keep describing in the longer sentences. The home you talk about most easily is often the one you imagine living in.",
      ],
      ar: [
        "بعد المعاينة الثالثة لا يتذكر أكثر الناس أي مطبخ كان لأي بيت. والعلاج ليس ذاكرة أفضل بل طريقة أفضل، وهي تتسع لصفحة واحدة.",
        "قبل أن تبدأ اكتب خمسة أمور هي الأهم لك. ثلاثة منها قد تكون عملية كالمساحة والضوء والمسافة إلى العمل، واثنان قد يتصلان بالإحساس كالهدوء أو مكان لاستضافة الأصدقاء. هذه القائمة بوصلتك.",
        "في كل زيارة اطرح الأسئلة نفسها بالترتيب نفسه ودوّن الإجابات فوراً. والتقط ثلاث صور من المواضع نفسها: المدخل ومساحة المعيشة الرئيسية والمنظر من أكبر نافذة.",
        "قيّم كل بيت من خمس درجات بحسب قائمتك في المساء نفسه لا في الأسبوع التالي. الانطباعات تتلاشى بسرعة، وسحر البيت الأخير قد يمحو بهدوء عيوب الأول.",
        "استخدم العرض المتجاور لمقارنة ما يمكن قياسه، واترك الباقي للحكم الشخصي. الرقم لا يخبرك أي ممر يبدو مرحّباً، لكنه يخبرك أيهما أعرض.",
        "وإن بقي بيتان متقاربين فارجع إلى الذي تصفه بجمل أطول. البيت الذي تتحدث عنه بسهولة أكبر هو غالباً الذي تتخيل نفسك تعيش فيه.",
      ],
    },
  },
  {
    slug: "choosing-a-neighborhood-by-pace",
    title: { en: "Choosing a neighborhood by its pace", ar: "اختيار الحي بحسب إيقاعه" },
    excerpt: {
      en: "Streets have tempos. Learning to hear them is the quickest way to find where you belong.",
      ar: "للشوارع إيقاعات. وتعلّم الإصغاء إليها أسرع طريق لتعرف أين تنتمي.",
    },
    category: { en: "Neighborhoods", ar: "أحياء" },
    author: { en: "Editorial desk (sample)", ar: "هيئة التحرير (تجريبي)" },
    date: "2026-06-30T12:00:00Z",
    readMinutes: 5,
    image: ph(4, "A tree-lined residential street", "شارع سكني تصطف فيه الأشجار"),
    body: {
      en: [
        "Every neighborhood has a pace. Some wake early with bakeries and school runs, others stay up late and sleep in. Neither is better, but a mismatch between your rhythm and the street's can wear you down quietly.",
        "Visit on three occasions: a weekday morning, a weekday evening and a weekend afternoon. Watch who is on the pavement, how fast they walk and whether anyone lingers. Lingering is a good sign for a place.",
        "Listen. Count the sounds you can name from the pavement, then from the garden or balcony of the home you like. A little noise is life; constant noise is a cost you pay every day.",
        "Walk your real errands. Time the route to the shop you will use, the stop you will wait at, the park you imagine visiting. Maps compress distance; legs do not.",
        "Sample indicators such as walkability or greenery can be a helpful starting point, but treat them as prompts for your own observation. On this demo site they are invented scores, labelled as such.",
      ],
      ar: [
        "لكل حي إيقاع. بعضها يستيقظ مبكراً مع المخابز وجولات المدارس، وبعضها يسهر ويتأخر في النوم. ليس أحدها أفضل، لكن التنافر بين إيقاعك وإيقاع الشارع يُنهكك بصمت.",
        "زُر في ثلاث مناسبات: صباح يوم عمل ومساء يوم عمل وعصر عطلة. راقب من يمشي على الرصيف وبأي سرعة وهل يتمهّل أحد. التمهّل علامة طيبة على المكان.",
        "أصغِ. عُدّ الأصوات التي تميّزها من الرصيف، ثم من حديقة البيت الذي أعجبك أو شرفته. قليل من الضجيج حياة، أما الضجيج الدائم فكلفة تدفعها كل يوم.",
        "امشِ مشاويرك الفعلية. احسب زمن الطريق إلى المتجر الذي ستقصده والمحطة التي ستنتظر فيها والحديقة التي تتخيل زيارتها. الخرائط تضغط المسافات أما الأقدام فلا.",
        "المؤشرات التجريبية كقابلية المشي والخضرة قد تكون نقطة بداية مفيدة، لكن اعتبرها دعوة إلى ملاحظتك الخاصة. في هذا الموقع التجريبي هي درجات مختلقة وموسومة بذلك.",
      ],
    },
  },
  {
    slug: "mortgage-basics-in-plain-words",
    title: { en: "Mortgage basics in plain words", ar: "أساسيات التمويل العقاري بكلمات بسيطة" },
    excerpt: {
      en: "Principal, interest, term and deposit explained simply. General education only, not financial advice.",
      ar: "الأصل والفائدة والمدة والدفعة الأولى مشروحة ببساطة. للتثقيف العام فقط وليست نصيحة مالية.",
    },
    category: { en: "Finance basics", ar: "أساسيات التمويل" },
    author: { en: "Editorial desk (sample)", ar: "هيئة التحرير (تجريبي)" },
    date: "2026-06-10T12:00:00Z",
    readMinutes: 7,
    image: ph(10, "Hills and a house at dusk", "تلال وبيت عند الغروب"),
    body: {
      en: [
        "This is general education written for a demo site. It is not financial advice, and terms and rules differ widely between lenders and places. Speak to a qualified professional before making decisions.",
        "A home loan has two main parts. The principal is the amount you borrow. The interest is the price of borrowing it, usually expressed as a yearly rate. Each payment normally repays some of both.",
        "The term is how long you take to repay. A longer term lowers each payment but usually means paying more interest in total. A shorter term raises the payment and lowers the total cost. The right balance depends on your budget and your comfort.",
        "The deposit is the part of the price you pay yourself. A larger deposit means a smaller loan and, often, easier terms. It also lowers the monthly payment, which is useful when other costs rise.",
        "Remember the costs around the loan: fees, taxes, insurance, maintenance and moving. A calm budget includes them from the start so there are no surprises later.",
        "Rates can be fixed for a period or can vary. A fixed rate gives certainty; a variable rate can move up or down. Which suits you depends on how much uncertainty you can comfortably carry.",
        "The calculator on this site is a simple illustration of how these ideas combine. Change the price, deposit, rate and term to feel how each lever moves the monthly figure, and then ask a professional for a real quotation.",
      ],
      ar: [
        "هذا محتوى تثقيفي عام كُتب لموقع تجريبي. وهو ليس نصيحة مالية، فالشروط والأنظمة تختلف كثيراً بين الجهات والبلدان. استشر مختصاً مؤهلاً قبل اتخاذ أي قرار.",
        "لتمويل المنزل جزءان رئيسيان. الأصل هو المبلغ الذي تقترضه، والفائدة هي ثمن اقتراضه وتُعبَّر عنها عادة بنسبة سنوية. وكل دفعة تسدّد في العادة جزءاً من الاثنين.",
        "المدة هي الوقت الذي تستغرقه في السداد. المدة الأطول تخفض الدفعة لكنها عادة تعني فائدة إجمالية أكبر. والمدة الأقصر ترفع الدفعة وتخفض الكلفة الإجمالية. والتوازن الصحيح يتوقف على ميزانيتك وراحتك.",
        "الدفعة الأولى هي الجزء من السعر الذي تدفعه من مالك. كلما كبرت صغر القرض وسهلت الشروط غالباً. كما أنها تخفض القسط الشهري، وهذا مفيد حين ترتفع نفقات أخرى.",
        "تذكّر التكاليف المحيطة بالقرض: الرسوم والضرائب والتأمين والصيانة والانتقال. الميزانية الهادئة تتضمنها من البداية فلا مفاجآت لاحقة.",
        "قد تكون النسبة ثابتة لمدة محددة وقد تتغير. النسبة الثابتة تمنح اليقين والمتغيرة قد ترتفع أو تنخفض. وما يناسبك يتوقف على قدر عدم اليقين الذي تتحمله براحة.",
        "الحاسبة في هذا الموقع توضيح بسيط لكيفية اجتماع هذه الأفكار. غيّر السعر والدفعة الأولى والنسبة والمدة لتشعر بأثر كل عامل في القسط الشهري، ثم اطلب من مختص عرضاً حقيقياً.",
      ],
    },
  },
];
