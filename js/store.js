/**
 * THEHAMMER - Central CMS Store & Data Layer
 * Handles persistent state for Water Pumps, Fire Fighting Systems, Electric Motors, Pressure Systems, Quotes, Downloads, and Settings.
 */

const SEED_DATA = {
  settings: {
    companyName: "THEHAMMER Industrial Water Pump Solutions",
    tagline: "Heavy Duty Hydraulic & Fire Protection Pump Systems",
    logoUrl:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=200&q=80",
    phone: "+201203666634",
    email: "example@gmail.com",
    whatsAppNumber: "201203666634",
    addressEN: "THEHAMMER Industrial Park, Works Avenue 100, London, UK",
    addressIT: "THEHAMMER Industrial Park, Works Avenue 100, Londra, UK",
    addressAR: "مجمع هامر الصناعي، شارع الأعمال 100، لندن، المملكة المتحدة",
    themeDefault: "light",
    cloudinaryCloudName: "thehammer-pumps-cloud",
    ga4Id: "G-HAMMERPUMPS2026",
    gtmId: "GTM-HM8900",
  },
  categories: [
    {
      id: "cat-ff",
      slug: "fire-fighting-pumps",
      filterTag: "fire-fighting",
      icon: "flame",
      image: "images/system_fire_pumb.jpeg",
      nameEN: "Fire Fighting Pumps",
      nameIT: "Pompe Antincendio",
      nameAR: "مضخات مكافحة الحريق",
      descEN: "Certified NFPA-20 fire fighting pump packages, diesel drives, and pressure maintenance systems.",
      descIT: "Gruppi pompe antincendio certificati NFPA-20 con azionamenti diesel e sistemi jockey.",
      descAR: "مجموعات وأنظمة مضخات مكافحة الحريق المعتمدة وفق معايير NFPA-20 مع محركات الديزل وأنظمة الضغط."
    },
    {
      id: "cat-booster",
      slug: "booster-systems",
      filterTag: "booster",
      icon: "gauge",
      image: "images/Booster-Systems.png",
      nameEN: "Booster Systems",
      nameIT: "Sistemi di Pressurizzazione",
      nameAR: "أنظمة ضغط المياه",
      descEN: "Automated pressure booster stations for high-rise buildings and industrial water networks.",
      descIT: "Stazioni di pressurizzazione automatiche per edifici alti e reti idriche industriali.",
      descAR: "محطات ضغط المياه الأوتوماتيكية للمباني العالية والشبكات الصناعية."
    },
    {
      id: "cat-centrifugal",
      slug: "centrifugal-pumps",
      filterTag: "centrifugal",
      icon: "refresh-cw",
      image: "images/Centrifugal-Pumps.png",
      nameEN: "Centrifugal Pumps",
      nameIT: "Pompe Centrifughe",
      nameAR: "مضخات طاردة مركزية",
      descEN: "High-efficiency heavy duty centrifugal water pumps for industrial fluid transfer.",
      descIT: "Pompe idrauliche centrifughe ad alta efficienza per il trasferimento di fluidi industriali.",
      descAR: "مضخات مياه طاردة مركزية عالية الكفاءة لنقل السوائل الصناعية."
    },
    {
      id: "cat-end-suction",
      slug: "end-suction-pumps",
      filterTag: "end-suction",
      icon: "arrow-right-circle",
      image: "images/end-section-pumb.jpg",
      nameEN: "End Suction Pumps",
      nameIT: "Pompe End Suction",
      nameAR: "مضخات السحب الطرفي",
      descEN: "Single-stage horizontal end suction pumps designed to ISO/EN standard specifications.",
      descIT: "Pompe monostadio ad aspirazione frontale progettate secondo standard ISO/EN.",
      descAR: "مضخات أفقية أحادية المرحلة مصممة وفقًا لمعايير ISO/EN القياسية."
    },
    {
      id: "cat-split-case",
      slug: "split-case-pumps",
      filterTag: "split-case",
      icon: "layers",
      image: "images/Split-Case-Pumps.png",
      nameEN: "Split Case Pumps",
      nameIT: "Pompe a Cassa Divisa",
      nameAR: "مضخات انقسام العلبة",
      descEN: "Double suction split case pumps for high volume water flow and utility installations.",
      descIT: "Pompe a doppia aspirazione a cassa divisa per grandi portate e impianti idrici.",
      descAR: "مضخات مزدوجة السحب ذات تدفق مرتفع للمشروعات والشبكات الكبرى."
    },
    {
      id: "cat-vertical-multistage",
      slug: "vertical-multistage-pumps",
      filterTag: "vertical-multistage",
      icon: "bar-chart-2",
      image: "images/Vertical-Multistage-Pumps.png",
      nameEN: "Vertical Multistage Pumps",
      nameIT: "Pompe Multistadio Verticali",
      nameAR: "مضخات رأسية متعددة المراحل",
      descEN: "High head vertical multistage stainless steel pumps for industrial pressure boosting.",
      descIT: "Pompe verticali multistadio in acciaio inossidabile ad alta prevalenza.",
      descAR: "مضخات رأسية متعددة المراحل من الستانلس ستيل لضغط الارتفاع العالي."
    },
    {
      id: "cat-electric",
      slug: "electric-pumps",
      filterTag: "electric",
      icon: "zap",
      image: "images/Electric-Pumps.png",
      nameEN: "Electric Pumps",
      nameIT: "Elettropompe",
      nameAR: "المضخات الكهربائية",
      descEN: "High-efficiency electric motor-driven pump packages for continuous industrial operation.",
      descIT: "Gruppi elettropompa con motori ad alta efficienza per funzionamento continuo.",
      descAR: "مجموعات مضخات تعمل بمحركات كهربائية عالية الكفاءة للتشغيل المستمر."
    },
    {
      id: "cat-diesel",
      slug: "diesel-pumps",
      filterTag: "diesel",
      icon: "fuel",
      image: "images/PSD-Diesel-Pump.jpeg",
      nameEN: "Diesel Pumps",
      nameIT: "Motopompe Diesel",
      nameAR: "مضخات الديزل",
      descEN: "Heavy-duty diesel engine-driven emergency water and fire pump packages.",
      descIT: "Gruppi motopompa diesel per servizi di emergenza e antincendio.",
      descAR: "مجموعات مضخات تعمل بمحركات الديزل للطوارئ وأنظمة الحريق."
    },
    {
      id: "cat-jockey",
      slug: "jockey-pumps",
      filterTag: "jockey",
      icon: "activity",
      image: "images/PV-Jockey-Pump.jpg",
      nameEN: "Jockey Pumps",
      nameIT: "Pompe Jockey",
      nameAR: "مضخات الجوكي",
      descEN: "Auxiliary pressure maintenance jockey pumps for automated fire main stabilization.",
      descIT: "Pompe jockey ausiliarie per la stabilizzazione della pressione della rete antincendio.",
      descAR: "مضخات جوكي مساعدة للحفاظ على ضغط شبكة مكافحة الحريق باستمرار."
    }
  ],
  brands: [
    {
      id: "b-hammer",
      name: "THEHAMMER Master Line",
      country: "United Kingdom 🇬🇧",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
      website: "https://thehammer-pumps.com",
    },
    {
      id: "b-euro",
      name: "THEHAMMER EuroHydraulic",
      country: "Italy 🇮🇹",
      logo: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=120&q=80",
      website: "https://thehammer.it",
    },
  ],
  products: [
    {
      id: "pedj-pedj-50-6-5-5-8-6-2---option-1",
      model: "PEDJ 50/6-5.5-8.6-2 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/6-5.5-8.6-2 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/6-5.5-8.6-2 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/6-5.5-8.6-2 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/6-5.5-8.6-2 - Option 1. Features high-performance P2C 32-200/40 5.5HP electric drive, PSD 32-250/55 8.6HP diesel engine backup, and PV 4x9/2HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/6-5.5-8.6-2 - Option 1. Dotato di azionamento elettrico P2C 32-200/40 5.5HP, azionamento diesel PSD 32-250/55 8.6HP e pompa jockey PV 4x9/2HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/6-5.5-8.6-2 - Option 1. يحتوي على مضخة كهربائية P2C 32-200/40 5.5HP، مضخة ديزل احتياطية PSD 32-250/55 8.6HP، ومضخة جوكي PV 4x9/2HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "6",
      electricPump: "P2C 32-200/40 5.5HP",
      dieselPump: "PSD 32-250/55 8.6HP",
      jockeyPump: "PV 4x9/2HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-50-6-5-5-8-6-2---option-2",
      model: "PEDJ 50/6-5.5-8.6-2 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/6-5.5-8.6-2 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/6-5.5-8.6-2 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/6-5.5-8.6-2 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/6-5.5-8.6-2 - Option 2. Features high-performance PSM 32-250/55 7.5HP electric drive, PSD 32-250/55 8.6HP diesel engine backup, and PVT(S) 1-15 1HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/6-5.5-8.6-2 - Option 2. Dotato di azionamento elettrico PSM 32-250/55 7.5HP, azionamento diesel PSD 32-250/55 8.6HP e pompa jockey PVT(S) 1-15 1HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/6-5.5-8.6-2 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/55 7.5HP، مضخة ديزل احتياطية PSD 32-250/55 8.6HP، ومضخة جوكي PVT(S) 1-15 1HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "6",
      electricPump: "PSM 32-250/55 7.5HP",
      dieselPump: "PSD 32-250/55 8.6HP",
      jockeyPump: "PVT(S) 1-15 1HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-50-7-7-5-10-2---option-1",
      model: "PEDJ 50/7-7.5-10-2 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/7-7.5-10-2 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/7-7.5-10-2 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/7-7.5-10-2 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/7-7.5-10-2 - Option 1. Features high-performance P2C 40-210/55 7.5HP electric drive, PSD 32-250/75 10HP diesel engine backup, and PV 4x9/2HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/7-7.5-10-2 - Option 1. Dotato di azionamento elettrico P2C 40-210/55 7.5HP, azionamento diesel PSD 32-250/75 10HP e pompa jockey PV 4x9/2HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/7-7.5-10-2 - Option 1. يحتوي على مضخة كهربائية P2C 40-210/55 7.5HP، مضخة ديزل احتياطية PSD 32-250/75 10HP، ومضخة جوكي PV 4x9/2HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "7",
      electricPump: "P2C 40-210/55 7.5HP",
      dieselPump: "PSD 32-250/75 10HP",
      jockeyPump: "PV 4x9/2HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-50-7-7-5-10-2---option-2",
      model: "PEDJ 50/7-7.5-10-2 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/7-7.5-10-2 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/7-7.5-10-2 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/7-7.5-10-2 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/7-7.5-10-2 - Option 2. Features high-performance PSM 32-250/75 10HP electric drive, PSD 32-250/75 10HP diesel engine backup, and PVT(S) 1-15 1HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/7-7.5-10-2 - Option 2. Dotato di azionamento elettrico PSM 32-250/75 10HP, azionamento diesel PSD 32-250/75 10HP e pompa jockey PVT(S) 1-15 1HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/7-7.5-10-2 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/75 10HP، مضخة ديزل احتياطية PSD 32-250/75 10HP، ومضخة جوكي PVT(S) 1-15 1HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "7",
      electricPump: "PSM 32-250/75 10HP",
      dieselPump: "PSD 32-250/75 10HP",
      jockeyPump: "PVT(S) 1-15 1HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-50-8-10-12-3---option-1",
      model: "PEDJ 50/8-10-12-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/8-10-12-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/8-10-12-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/8-10-12-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/8-10-12-3 - Option 1. Features high-performance P2C 40-210/75 10HP electric drive, PSD 32-250/110 12HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/8-10-12-3 - Option 1. Dotato di azionamento elettrico P2C 40-210/75 10HP, azionamento diesel PSD 32-250/110 12HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/8-10-12-3 - Option 1. يحتوي على مضخة كهربائية P2C 40-210/75 10HP، مضخة ديزل احتياطية PSD 32-250/110 12HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "8",
      electricPump: "P2C 40-210/75 10HP",
      dieselPump: "PSD 32-250/110 12HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-50-8-10-12-3---option-2",
      model: "PEDJ 50/8-10-12-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/8-10-12-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/8-10-12-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/8-10-12-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/8-10-12-3 - Option 2. Features high-performance PSM 32-250/110 15HP electric drive, PSD 32-250/110 12HP diesel engine backup, and PVT(S) 1-15 1HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/8-10-12-3 - Option 2. Dotato di azionamento elettrico PSM 32-250/110 15HP, azionamento diesel PSD 32-250/110 12HP e pompa jockey PVT(S) 1-15 1HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/8-10-12-3 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/110 15HP، مضخة ديزل احتياطية PSD 32-250/110 12HP، ومضخة جوكي PVT(S) 1-15 1HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "8",
      electricPump: "PSM 32-250/110 15HP",
      dieselPump: "PSD 32-250/110 12HP",
      jockeyPump: "PVT(S) 1-15 1HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-50-9-10-27-3---option-1",
      model: "PEDJ 50/9-10-27-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/9-10-27-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/9-10-27-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/9-10-27-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/9-10-27-3 - Option 1. Features high-performance P2C 40-210/75 10HP electric drive, PSD 32-250/150 27HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/9-10-27-3 - Option 1. Dotato di azionamento elettrico P2C 40-210/75 10HP, azionamento diesel PSD 32-250/150 27HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/9-10-27-3 - Option 1. يحتوي على مضخة كهربائية P2C 40-210/75 10HP، مضخة ديزل احتياطية PSD 32-250/150 27HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "9",
      electricPump: "P2C 40-210/75 10HP",
      dieselPump: "PSD 32-250/150 27HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-50-9-10-27-3---option-2",
      model: "PEDJ 50/9-10-27-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 50/9-10-27-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 50/9-10-27-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 50/9-10-27-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 50/9-10-27-3 - Option 2. Features high-performance PSM 32-250/150 20HP electric drive, PSD 32-250/150 27HP diesel engine backup, and PVT(S) 1-17 1.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 50/9-10-27-3 - Option 2. Dotato di azionamento elettrico PSM 32-250/150 20HP, azionamento diesel PSD 32-250/150 27HP e pompa jockey PVT(S) 1-17 1.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 50/9-10-27-3 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/150 20HP، مضخة ديزل احتياطية PSD 32-250/150 27HP، ومضخة جوكي PVT(S) 1-17 1.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 50,
      hBar: "9",
      electricPump: "PSM 32-250/150 20HP",
      dieselPump: "PSD 32-250/150 27HP",
      jockeyPump: "PVT(S) 1-17 1.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-100-7-10-10-2---option-1",
      model: "PEDJ 100/7-10-10-2 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 100/7-10-10-2 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 100/7-10-10-2 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 100/7-10-10-2 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 100/7-10-10-2 - Option 1. Features high-performance PST 32-250/75 10HP electric drive, PSD 32-250/75 10HP diesel engine backup, and PV 4x9/2HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 100/7-10-10-2 - Option 1. Dotato di azionamento elettrico PST 32-250/75 10HP, azionamento diesel PSD 32-250/75 10HP e pompa jockey PV 4x9/2HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 100/7-10-10-2 - Option 1. يحتوي على مضخة كهربائية PST 32-250/75 10HP، مضخة ديزل احتياطية PSD 32-250/75 10HP، ومضخة جوكي PV 4x9/2HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 100,
      hBar: "6-7",
      electricPump: "PST 32-250/75 10HP",
      dieselPump: "PSD 32-250/75 10HP",
      jockeyPump: "PV 4x9/2HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-100-7-10-10-2---option-2",
      model: "PEDJ 100/7-10-10-2 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 100/7-10-10-2 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 100/7-10-10-2 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 100/7-10-10-2 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 100/7-10-10-2 - Option 2. Features high-performance PSM 32-250/75 10HP electric drive, PSD 32-250/75 10HP diesel engine backup, and PVT(S) 2-11 1.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 100/7-10-10-2 - Option 2. Dotato di azionamento elettrico PSM 32-250/75 10HP, azionamento diesel PSD 32-250/75 10HP e pompa jockey PVT(S) 2-11 1.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 100/7-10-10-2 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/75 10HP، مضخة ديزل احتياطية PSD 32-250/75 10HP، ومضخة جوكي PVT(S) 2-11 1.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 100,
      hBar: "6-7",
      electricPump: "PSM 32-250/75 10HP",
      dieselPump: "PSD 32-250/75 10HP",
      jockeyPump: "PVT(S) 2-11 1.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-100-8-15-27-3---option-1",
      model: "PEDJ 100/8-15-27-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 100/8-15-27-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 100/8-15-27-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 100/8-15-27-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 100/8-15-27-3 - Option 1. Features high-performance P2C 40-200/110 15HP electric drive, PSD 32-250/150 27HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 100/8-15-27-3 - Option 1. Dotato di azionamento elettrico P2C 40-200/110 15HP, azionamento diesel PSD 32-250/150 27HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 100/8-15-27-3 - Option 1. يحتوي على مضخة كهربائية P2C 40-200/110 15HP، مضخة ديزل احتياطية PSD 32-250/150 27HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 100,
      hBar: "8",
      electricPump: "P2C 40-200/110 15HP",
      dieselPump: "PSD 32-250/150 27HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-100-8-15-27-3---option-2",
      model: "PEDJ 100/8-15-27-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 100/8-15-27-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 100/8-15-27-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 100/8-15-27-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 100/8-15-27-3 - Option 2. Features high-performance PSM 32-250/150 20HP electric drive, PSD 32-250/150 27HP diesel engine backup, and PVT(S) 2-13 2HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 100/8-15-27-3 - Option 2. Dotato di azionamento elettrico PSM 32-250/150 20HP, azionamento diesel PSD 32-250/150 27HP e pompa jockey PVT(S) 2-13 2HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 100/8-15-27-3 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/150 20HP، مضخة ديزل احتياطية PSD 32-250/150 27HP، ومضخة جوكي PVT(S) 2-13 2HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 100,
      hBar: "8",
      electricPump: "PSM 32-250/150 20HP",
      dieselPump: "PSD 32-250/150 27HP",
      jockeyPump: "PVT(S) 2-13 2HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-100-9-17-5-27-3---option-1",
      model: "PEDJ 100/9-17.5-27-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 100/9-17.5-27-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 100/9-17.5-27-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 100/9-17.5-27-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 100/9-17.5-27-3 - Option 1. Features high-performance P2C 40-250/130 17.5HP electric drive, PSD 40-250/185 27HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 100/9-17.5-27-3 - Option 1. Dotato di azionamento elettrico P2C 40-250/130 17.5HP, azionamento diesel PSD 40-250/185 27HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 100/9-17.5-27-3 - Option 1. يحتوي على مضخة كهربائية P2C 40-250/130 17.5HP، مضخة ديزل احتياطية PSD 40-250/185 27HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 100,
      hBar: "9",
      electricPump: "P2C 40-250/130 17.5HP",
      dieselPump: "PSD 40-250/185 27HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-100-9-17-5-27-3---option-2",
      model: "PEDJ 100/9-17.5-27-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 100/9-17.5-27-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 100/9-17.5-27-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 100/9-17.5-27-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 100/9-17.5-27-3 - Option 2. Features high-performance PSM 40-250/185 25HP electric drive, PSD 40-250/185 27HP diesel engine backup, and PVT(S) 2-13 2HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 100/9-17.5-27-3 - Option 2. Dotato di azionamento elettrico PSM 40-250/185 25HP, azionamento diesel PSD 40-250/185 27HP e pompa jockey PVT(S) 2-13 2HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 100/9-17.5-27-3 - Option 2. يحتوي على مضخة كهربائية PSM 40-250/185 25HP، مضخة ديزل احتياطية PSD 40-250/185 27HP، ومضخة جوكي PVT(S) 2-13 2HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 100,
      hBar: "9",
      electricPump: "PSM 40-250/185 25HP",
      dieselPump: "PSD 40-250/185 27HP",
      jockeyPump: "PVT(S) 2-13 2HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-120-7-10-12-3---option-1",
      model: "PEDJ 120/7-10-12-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 120/7-10-12-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 120/7-10-12-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 120/7-10-12-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 120/7-10-12-3 - Option 1. Features high-performance PST 32-250/75D 10HP electric drive, PSD 32-250/75H 12HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 120/7-10-12-3 - Option 1. Dotato di azionamento elettrico PST 32-250/75D 10HP, azionamento diesel PSD 32-250/75H 12HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 120/7-10-12-3 - Option 1. يحتوي على مضخة كهربائية PST 32-250/75D 10HP، مضخة ديزل احتياطية PSD 32-250/75H 12HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 120,
      hBar: "7",
      electricPump: "PST 32-250/75D 10HP",
      dieselPump: "PSD 32-250/75H 12HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-120-7-10-12-3---option-2",
      model: "PEDJ 120/7-10-12-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 120/7-10-12-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 120/7-10-12-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 120/7-10-12-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 120/7-10-12-3 - Option 2. Features high-performance PSM 32-250/75H 10HP electric drive, PSD 32-250/75H 12HP diesel engine backup, and PVT(S) 2-13 2HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 120/7-10-12-3 - Option 2. Dotato di azionamento elettrico PSM 32-250/75H 10HP, azionamento diesel PSD 32-250/75H 12HP e pompa jockey PVT(S) 2-13 2HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 120/7-10-12-3 - Option 2. يحتوي على مضخة كهربائية PSM 32-250/75H 10HP، مضخة ديزل احتياطية PSD 32-250/75H 12HP، ومضخة جوكي PVT(S) 2-13 2HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 120,
      hBar: "7",
      electricPump: "PSM 32-250/75H 10HP",
      dieselPump: "PSD 32-250/75H 12HP",
      jockeyPump: "PVT(S) 2-13 2HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-150-7-15-12-3---option-1",
      model: "PEDJ 150/7-15-12-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 150/7-15-12-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 150/7-15-12-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 150/7-15-12-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 150/7-15-12-3 - Option 1. Features high-performance PST 40-250/110 15HP electric drive, PSD 40-250/110 12HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 150/7-15-12-3 - Option 1. Dotato di azionamento elettrico PST 40-250/110 15HP, azionamento diesel PSD 40-250/110 12HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 150/7-15-12-3 - Option 1. يحتوي على مضخة كهربائية PST 40-250/110 15HP، مضخة ديزل احتياطية PSD 40-250/110 12HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 150,
      hBar: "7",
      electricPump: "PST 40-250/110 15HP",
      dieselPump: "PSD 40-250/110 12HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-150-7-15-12-3---option-2",
      model: "PEDJ 150/7-15-12-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 150/7-15-12-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 150/7-15-12-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 150/7-15-12-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 150/7-15-12-3 - Option 2. Features high-performance PSM 40-250/110 15HP electric drive, PSD 40-250/110 12HP diesel engine backup, and PVT(S) 4-10 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 150/7-15-12-3 - Option 2. Dotato di azionamento elettrico PSM 40-250/110 15HP, azionamento diesel PSD 40-250/110 12HP e pompa jockey PVT(S) 4-10 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 150/7-15-12-3 - Option 2. يحتوي على مضخة كهربائية PSM 40-250/110 15HP، مضخة ديزل احتياطية PSD 40-250/110 12HP، ومضخة جوكي PVT(S) 4-10 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 150,
      hBar: "7",
      electricPump: "PSM 40-250/110 15HP",
      dieselPump: "PSD 40-250/110 12HP",
      jockeyPump: "PVT(S) 4-10 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-6-20-27-3---option-1",
      model: "PEDJ 200/6-20-27-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/6-20-27-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/6-20-27-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/6-20-27-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/6-20-27-3 - Option 1. Features high-performance PST 50-250/150 20HP electric drive, PSD 50-250/150 27HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/6-20-27-3 - Option 1. Dotato di azionamento elettrico PST 50-250/150 20HP, azionamento diesel PSD 50-250/150 27HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/6-20-27-3 - Option 1. يحتوي على مضخة كهربائية PST 50-250/150 20HP، مضخة ديزل احتياطية PSD 50-250/150 27HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "6",
      electricPump: "PST 50-250/150 20HP",
      dieselPump: "PSD 50-250/150 27HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-6-20-27-3---option-2",
      model: "PEDJ 200/6-20-27-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/6-20-27-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/6-20-27-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/6-20-27-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/6-20-27-3 - Option 2. Features high-performance PSM 50-250/150 20HP electric drive, PSD 50-250/150 27HP diesel engine backup, and PVT(S) 4-10 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/6-20-27-3 - Option 2. Dotato di azionamento elettrico PSM 50-250/150 20HP, azionamento diesel PSD 50-250/150 27HP e pompa jockey PVT(S) 4-10 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/6-20-27-3 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/150 20HP، مضخة ديزل احتياطية PSD 50-250/150 27HP، ومضخة جوكي PVT(S) 4-10 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "6",
      electricPump: "PSM 50-250/150 20HP",
      dieselPump: "PSD 50-250/150 27HP",
      jockeyPump: "PVT(S) 4-10 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-7-25-27-3---option-1",
      model: "PEDJ 200/7-25-27-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/7-25-27-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/7-25-27-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/7-25-27-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/7-25-27-3 - Option 1. Features high-performance PST 50-250/185 25HP electric drive, PSD 50-250/185 27HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/7-25-27-3 - Option 1. Dotato di azionamento elettrico PST 50-250/185 25HP, azionamento diesel PSD 50-250/185 27HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/7-25-27-3 - Option 1. يحتوي على مضخة كهربائية PST 50-250/185 25HP، مضخة ديزل احتياطية PSD 50-250/185 27HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "7",
      electricPump: "PST 50-250/185 25HP",
      dieselPump: "PSD 50-250/185 27HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-7-25-27-3---option-2",
      model: "PEDJ 200/7-25-27-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/7-25-27-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/7-25-27-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/7-25-27-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/7-25-27-3 - Option 2. Features high-performance PSM 50-250/185 25HP electric drive, PSD 50-250/185 27HP diesel engine backup, and PVT(S) 4-10 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/7-25-27-3 - Option 2. Dotato di azionamento elettrico PSM 50-250/185 25HP, azionamento diesel PSD 50-250/185 27HP e pompa jockey PVT(S) 4-10 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/7-25-27-3 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/185 25HP، مضخة ديزل احتياطية PSD 50-250/185 27HP، ومضخة جوكي PVT(S) 4-10 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "7",
      electricPump: "PSM 50-250/185 25HP",
      dieselPump: "PSD 50-250/185 27HP",
      jockeyPump: "PVT(S) 4-10 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-200-8-30-32-3---option-1",
      model: "PEDJ 200/8-30-32-3 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/8-30-32-3 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/8-30-32-3 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/8-30-32-3 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/8-30-32-3 - Option 1. Features high-performance PST 50-250/220 30HP electric drive, PSD 50-250/220 32HP diesel engine backup, and PV 4x13/3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/8-30-32-3 - Option 1. Dotato di azionamento elettrico PST 50-250/220 30HP, azionamento diesel PSD 50-250/220 32HP e pompa jockey PV 4x13/3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/8-30-32-3 - Option 1. يحتوي على مضخة كهربائية PST 50-250/220 30HP، مضخة ديزل احتياطية PSD 50-250/220 32HP، ومضخة جوكي PV 4x13/3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "8",
      electricPump: "PST 50-250/220 30HP",
      dieselPump: "PSD 50-250/220 32HP",
      jockeyPump: "PV 4x13/3HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-8-30-32-3---option-2",
      model: "PEDJ 200/8-30-32-3 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/8-30-32-3 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/8-30-32-3 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/8-30-32-3 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/8-30-32-3 - Option 2. Features high-performance PSM 50-250/220 30HP electric drive, PSD 50-250/220 32HP diesel engine backup, and PVT(S) 4-12 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/8-30-32-3 - Option 2. Dotato di azionamento elettrico PSM 50-250/220 30HP, azionamento diesel PSD 50-250/220 32HP e pompa jockey PVT(S) 4-12 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/8-30-32-3 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/220 30HP، مضخة ديزل احتياطية PSD 50-250/220 32HP، ومضخة جوكي PVT(S) 4-12 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "8",
      electricPump: "PSM 50-250/220 30HP",
      dieselPump: "PSD 50-250/220 32HP",
      jockeyPump: "PVT(S) 4-12 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-9-40-38-4---option-2",
      model: "PEDJ 200/9-40-38-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/9-40-38-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/9-40-38-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/9-40-38-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/9-40-38-4 - Option 2. Features high-performance PSM 50-250/300 40HP electric drive, PSD 50-250/300 38HP diesel engine backup, and PVT(S) 4-12 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/9-40-38-4 - Option 2. Dotato di azionamento elettrico PSM 50-250/300 40HP, azionamento diesel PSD 50-250/300 38HP e pompa jockey PVT(S) 4-12 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/9-40-38-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/300 40HP، مضخة ديزل احتياطية PSD 50-250/300 38HP، ومضخة جوكي PVT(S) 4-12 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "9",
      electricPump: "PSM 50-250/300 40HP",
      dieselPump: "PSD 50-250/300 38HP",
      jockeyPump: "PVT(S) 4-12 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-200-10-50-58-4---option-2",
      model: "PEDJ 200/10-50-58-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 200/10-50-58-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 200/10-50-58-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 200/10-50-58-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 200/10-50-58-4 - Option 2. Features high-performance PSM 50-315/370 50HP electric drive, PSD 50-315/370 58HP diesel engine backup, and PVT(S) 4-14 4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 200/10-50-58-4 - Option 2. Dotato di azionamento elettrico PSM 50-315/370 50HP, azionamento diesel PSD 50-315/370 58HP e pompa jockey PVT(S) 4-14 4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 200/10-50-58-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-315/370 50HP، مضخة ديزل احتياطية PSD 50-315/370 58HP، ومضخة جوكي PVT(S) 4-14 4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 200,
      hBar: "10",
      electricPump: "PSM 50-315/370 50HP",
      dieselPump: "PSD 50-315/370 58HP",
      jockeyPump: "PVT(S) 4-14 4HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-250-7-25-27-4---option-1",
      model: "PEDJ 250/7-25-27-4 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/7-25-27-4 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/7-25-27-4 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/7-25-27-4 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/7-25-27-4 - Option 1. Features high-performance PST 50-250/185 25HP electric drive, PSD 50-250/185 27HP diesel engine backup, and PV 6x15/4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/7-25-27-4 - Option 1. Dotato di azionamento elettrico PST 50-250/185 25HP, azionamento diesel PSD 50-250/185 27HP e pompa jockey PV 6x15/4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/7-25-27-4 - Option 1. يحتوي على مضخة كهربائية PST 50-250/185 25HP، مضخة ديزل احتياطية PSD 50-250/185 27HP، ومضخة جوكي PV 6x15/4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "7",
      electricPump: "PST 50-250/185 25HP",
      dieselPump: "PSD 50-250/185 27HP",
      jockeyPump: "PV 6x15/4HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-250-7-25-27-4---option-2",
      model: "PEDJ 250/7-25-27-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/7-25-27-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/7-25-27-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/7-25-27-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/7-25-27-4 - Option 2. Features high-performance PSM 50-250/185 25HP electric drive, PSD 50-250/185 27HP diesel engine backup, and PVT(S) 4-12 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/7-25-27-4 - Option 2. Dotato di azionamento elettrico PSM 50-250/185 25HP, azionamento diesel PSD 50-250/185 27HP e pompa jockey PVT(S) 4-12 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/7-25-27-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/185 25HP، مضخة ديزل احتياطية PSD 50-250/185 27HP، ومضخة جوكي PVT(S) 4-12 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "7",
      electricPump: "PSM 50-250/185 25HP",
      dieselPump: "PSD 50-250/185 27HP",
      jockeyPump: "PVT(S) 4-12 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-250-6-25-27-4---option-1",
      model: "PEDJ 250/6-25-27-4 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/6-25-27-4 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/6-25-27-4 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/6-25-27-4 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/6-25-27-4 - Option 1. Features high-performance PST 50-250/185 25HP electric drive, PSD 50-250/185 27HP diesel engine backup, and PV 6x15/4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/6-25-27-4 - Option 1. Dotato di azionamento elettrico PST 50-250/185 25HP, azionamento diesel PSD 50-250/185 27HP e pompa jockey PV 6x15/4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/6-25-27-4 - Option 1. يحتوي على مضخة كهربائية PST 50-250/185 25HP، مضخة ديزل احتياطية PSD 50-250/185 27HP، ومضخة جوكي PV 6x15/4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "6",
      electricPump: "PST 50-250/185 25HP",
      dieselPump: "PSD 50-250/185 27HP",
      jockeyPump: "PV 6x15/4HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-250-6-25-27-4---option-2",
      model: "PEDJ 250/6-25-27-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/6-25-27-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/6-25-27-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/6-25-27-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/6-25-27-4 - Option 2. Features high-performance PSM 50-250/185 25HP electric drive, PSD 50-250/185 27HP diesel engine backup, and PVT(S) 8-6 3HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/6-25-27-4 - Option 2. Dotato di azionamento elettrico PSM 50-250/185 25HP, azionamento diesel PSD 50-250/185 27HP e pompa jockey PVT(S) 8-6 3HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/6-25-27-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/185 25HP، مضخة ديزل احتياطية PSD 50-250/185 27HP، ومضخة جوكي PVT(S) 8-6 3HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "6",
      electricPump: "PSM 50-250/185 25HP",
      dieselPump: "PSD 50-250/185 27HP",
      jockeyPump: "PVT(S) 8-6 3HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-250-7-30-32-4---option-1",
      model: "PEDJ 250/7-30-32-4 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/7-30-32-4 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/7-30-32-4 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/7-30-32-4 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/7-30-32-4 - Option 1. Features high-performance PST 50-250/220 30HP electric drive, PSD 50-250/220 32HP diesel engine backup, and PV 6x15/4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/7-30-32-4 - Option 1. Dotato di azionamento elettrico PST 50-250/220 30HP, azionamento diesel PSD 50-250/220 32HP e pompa jockey PV 6x15/4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/7-30-32-4 - Option 1. يحتوي على مضخة كهربائية PST 50-250/220 30HP، مضخة ديزل احتياطية PSD 50-250/220 32HP، ومضخة جوكي PV 6x15/4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "7",
      electricPump: "PST 50-250/220 30HP",
      dieselPump: "PSD 50-250/220 32HP",
      jockeyPump: "PV 6x15/4HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-250-7-30-32-4---option-2",
      model: "PEDJ 250/7-30-32-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/7-30-32-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/7-30-32-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/7-30-32-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/7-30-32-4 - Option 2. Features high-performance PSM 50-250/220 30HP electric drive, PSD 50-250/220 32HP diesel engine backup, and PVT(S) 8-8 4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/7-30-32-4 - Option 2. Dotato di azionamento elettrico PSM 50-250/220 30HP, azionamento diesel PSD 50-250/220 32HP e pompa jockey PVT(S) 8-8 4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/7-30-32-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/220 30HP، مضخة ديزل احتياطية PSD 50-250/220 32HP، ومضخة جوكي PVT(S) 8-8 4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "7",
      electricPump: "PSM 50-250/220 30HP",
      dieselPump: "PSD 50-250/220 32HP",
      jockeyPump: "PVT(S) 8-8 4HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-250-8-40-58-4---option-2",
      model: "PEDJ 250/8-40-58-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 250/8-40-58-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 250/8-40-58-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 250/8-40-58-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 250/8-40-58-4 - Option 2. Features high-performance PSM 50-250/250 40HP electric drive, PSD 50-250/250 58HP diesel engine backup, and PVT(S) 8-8 4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 250/8-40-58-4 - Option 2. Dotato di azionamento elettrico PSM 50-250/250 40HP, azionamento diesel PSD 50-250/250 58HP e pompa jockey PVT(S) 8-8 4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 250/8-40-58-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/250 40HP، مضخة ديزل احتياطية PSD 50-250/250 58HP، ومضخة جوكي PVT(S) 8-8 4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 250,
      hBar: "8",
      electricPump: "PSM 50-250/250 40HP",
      dieselPump: "PSD 50-250/250 58HP",
      jockeyPump: "PVT(S) 8-8 4HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-300-10-50-58-5-5---option-2",
      model: "PEDJ 300/10-50-58-5.5 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 300/10-50-58-5.5 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 300/10-50-58-5.5 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 300/10-50-58-5.5 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 300/10-50-58-5.5 - Option 2. Features high-performance PSM 50-315/370 50HP electric drive, PSD 50-315/370 58HP diesel engine backup, and PVT(S) 8-12 5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 300/10-50-58-5.5 - Option 2. Dotato di azionamento elettrico PSM 50-315/370 50HP, azionamento diesel PSD 50-315/370 58HP e pompa jockey PVT(S) 8-12 5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 300/10-50-58-5.5 - Option 2. يحتوي على مضخة كهربائية PSM 50-315/370 50HP، مضخة ديزل احتياطية PSD 50-315/370 58HP، ومضخة جوكي PVT(S) 8-12 5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 300,
      hBar: "9-10",
      electricPump: "PSM 50-315/370 50HP",
      dieselPump: "PSD 50-315/370 58HP",
      jockeyPump: "PVT(S) 8-12 5.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-350-7-30-32-4---option-1",
      model: "PEDJ 350/7-30-32-4 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 350/7-30-32-4 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 350/7-30-32-4 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 350/7-30-32-4 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 350/7-30-32-4 - Option 1. Features high-performance PST 50-250/220 30HP electric drive, PSD 50-250/220 32HP diesel engine backup, and PV 8x12/4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 350/7-30-32-4 - Option 1. Dotato di azionamento elettrico PST 50-250/220 30HP, azionamento diesel PSD 50-250/220 32HP e pompa jockey PV 8x12/4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 350/7-30-32-4 - Option 1. يحتوي على مضخة كهربائية PST 50-250/220 30HP، مضخة ديزل احتياطية PSD 50-250/220 32HP، ومضخة جوكي PV 8x12/4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 350,
      hBar: "7",
      electricPump: "PST 50-250/220 30HP",
      dieselPump: "PSD 50-250/220 32HP",
      jockeyPump: "PV 8x12/4HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-350-7-30-32-4---option-2",
      model: "PEDJ 350/7-30-32-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 350/7-30-32-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 350/7-30-32-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 350/7-30-32-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 350/7-30-32-4 - Option 2. Features high-performance PSM 50-250/220 30HP electric drive, PSD 50-250/220 32HP diesel engine backup, and PVT(S) 8-8 4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 350/7-30-32-4 - Option 2. Dotato di azionamento elettrico PSM 50-250/220 30HP, azionamento diesel PSD 50-250/220 32HP e pompa jockey PVT(S) 8-8 4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 350/7-30-32-4 - Option 2. يحتوي على مضخة كهربائية PSM 50-250/220 30HP، مضخة ديزل احتياطية PSD 50-250/220 32HP، ومضخة جوكي PVT(S) 8-8 4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 350,
      hBar: "7",
      electricPump: "PSM 50-250/220 30HP",
      dieselPump: "PSD 50-250/220 32HP",
      jockeyPump: "PVT(S) 8-8 4HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-400-6-30-32-4---option-1",
      model: "PEDJ 400/6-30-32-4 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/6-30-32-4 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/6-30-32-4 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/6-30-32-4 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/6-30-32-4 - Option 1. Features high-performance PST 65-250/220 30HP electric drive, PSD 65-250/220 32HP diesel engine backup, and PV 8x12/4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/6-30-32-4 - Option 1. Dotato di azionamento elettrico PST 65-250/220 30HP, azionamento diesel PSD 65-250/220 32HP e pompa jockey PV 8x12/4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/6-30-32-4 - Option 1. يحتوي على مضخة كهربائية PST 65-250/220 30HP، مضخة ديزل احتياطية PSD 65-250/220 32HP، ومضخة جوكي PV 8x12/4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "6",
      electricPump: "PST 65-250/220 30HP",
      dieselPump: "PSD 65-250/220 32HP",
      jockeyPump: "PV 8x12/4HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-400-6-30-32-4---option-2",
      model: "PEDJ 400/6-30-32-4 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/6-30-32-4 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/6-30-32-4 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/6-30-32-4 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/6-30-32-4 - Option 2. Features high-performance PSM 65-250/220 30HP electric drive, PSD 65-250/220 32HP diesel engine backup, and PVT(S) 8-8 4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/6-30-32-4 - Option 2. Dotato di azionamento elettrico PSM 65-250/220 30HP, azionamento diesel PSD 65-250/220 32HP e pompa jockey PVT(S) 8-8 4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/6-30-32-4 - Option 2. يحتوي على مضخة كهربائية PSM 65-250/220 30HP، مضخة ديزل احتياطية PSD 65-250/220 32HP، ومضخة جوكي PVT(S) 8-8 4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "6",
      electricPump: "PSM 65-250/220 30HP",
      dieselPump: "PSD 65-250/220 32HP",
      jockeyPump: "PVT(S) 8-8 4HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-400-7-40-38-5-5---option-1",
      model: "PEDJ 400/7-40-38-5.5 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/7-40-38-5.5 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/7-40-38-5.5 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/7-40-38-5.5 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/7-40-38-5.5 - Option 1. Features high-performance PST 65-250/300 40HP electric drive, PSD 65-250/300 38HP diesel engine backup, and PV 8x16/5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/7-40-38-5.5 - Option 1. Dotato di azionamento elettrico PST 65-250/300 40HP, azionamento diesel PSD 65-250/300 38HP e pompa jockey PV 8x16/5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/7-40-38-5.5 - Option 1. يحتوي على مضخة كهربائية PST 65-250/300 40HP، مضخة ديزل احتياطية PSD 65-250/300 38HP، ومضخة جوكي PV 8x16/5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "7",
      electricPump: "PST 65-250/300 40HP",
      dieselPump: "PSD 65-250/300 38HP",
      jockeyPump: "PV 8x16/5.5HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-400-7-40-38-5-5---option-2",
      model: "PEDJ 400/7-40-38-5.5 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/7-40-38-5.5 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/7-40-38-5.5 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/7-40-38-5.5 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/7-40-38-5.5 - Option 2. Features high-performance PSM 65-250/300 40HP electric drive, PSD 65-250/300 38HP diesel engine backup, and PVT(S) 8-8 4HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/7-40-38-5.5 - Option 2. Dotato di azionamento elettrico PSM 65-250/300 40HP, azionamento diesel PSD 65-250/300 38HP e pompa jockey PVT(S) 8-8 4HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/7-40-38-5.5 - Option 2. يحتوي على مضخة كهربائية PSM 65-250/300 40HP، مضخة ديزل احتياطية PSD 65-250/300 38HP، ومضخة جوكي PVT(S) 8-8 4HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "7",
      electricPump: "PSM 65-250/300 40HP",
      dieselPump: "PSD 65-250/300 38HP",
      jockeyPump: "PVT(S) 8-8 4HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-400-8-50-58-5-5---option-1",
      model: "PEDJ 400/8-50-58-5.5 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/8-50-58-5.5 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/8-50-58-5.5 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/8-50-58-5.5 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/8-50-58-5.5 - Option 1. Features high-performance PST 65-250/370 50HP electric drive, PSD 65-250/370 58HP diesel engine backup, and PV 8x16/5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/8-50-58-5.5 - Option 1. Dotato di azionamento elettrico PST 65-250/370 50HP, azionamento diesel PSD 65-250/370 58HP e pompa jockey PV 8x16/5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/8-50-58-5.5 - Option 1. يحتوي على مضخة كهربائية PST 65-250/370 50HP، مضخة ديزل احتياطية PSD 65-250/370 58HP، ومضخة جوكي PV 8x16/5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "8",
      electricPump: "PST 65-250/370 50HP",
      dieselPump: "PSD 65-250/370 58HP",
      jockeyPump: "PV 8x16/5.5HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-400-8-50-58-5-5---option-2",
      model: "PEDJ 400/8-50-58-5.5 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/8-50-58-5.5 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/8-50-58-5.5 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/8-50-58-5.5 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/8-50-58-5.5 - Option 2. Features high-performance PSM 65-250/370 50HP electric drive, PSD 65-250/370 58HP diesel engine backup, and PVT(S) 8-10 5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/8-50-58-5.5 - Option 2. Dotato di azionamento elettrico PSM 65-250/370 50HP, azionamento diesel PSD 65-250/370 58HP e pompa jockey PVT(S) 8-10 5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/8-50-58-5.5 - Option 2. يحتوي على مضخة كهربائية PSM 65-250/370 50HP، مضخة ديزل احتياطية PSD 65-250/370 58HP، ومضخة جوكي PVT(S) 8-10 5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "8",
      electricPump: "PSM 65-250/370 50HP",
      dieselPump: "PSD 65-250/370 58HP",
      jockeyPump: "PVT(S) 8-10 5.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-400-9-60-61-7-5---option-1",
      model: "PEDJ 400/9-60-61-7.5 - Option 1",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/9-60-61-7.5 - Option 1",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/9-60-61-7.5 - Option 1",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/9-60-61-7.5 - Option 1",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/9-60-61-7.5 - Option 1. Features high-performance PST 65-315/450 60HP electric drive, PSD 65-315/450 61HP diesel engine backup, and PV 12x17/7.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/9-60-61-7.5 - Option 1. Dotato di azionamento elettrico PST 65-315/450 60HP, azionamento diesel PSD 65-315/450 61HP e pompa jockey PV 12x17/7.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/9-60-61-7.5 - Option 1. يحتوي على مضخة كهربائية PST 65-315/450 60HP، مضخة ديزل احتياطية PSD 65-315/450 61HP، ومضخة جوكي PV 12x17/7.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "9",
      electricPump: "PST 65-315/450 60HP",
      dieselPump: "PSD 65-315/450 61HP",
      jockeyPump: "PV 12x17/7.5HP",
      configuration: "Close Coupled Electric + Plastic Jockey",
      active: true,
      featured: true,
    },
    {
      id: "pedj-pedj-400-9-60-61-7-5---option-2",
      model: "PEDJ 400/9-60-61-7.5 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 400/9-60-61-7.5 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 400/9-60-61-7.5 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 400/9-60-61-7.5 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 400/9-60-61-7.5 - Option 2. Features high-performance PSM 65-315/450 60HP electric drive, PSD 65-315/450 61HP diesel engine backup, and PVT(S) 8-12 5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 400/9-60-61-7.5 - Option 2. Dotato di azionamento elettrico PSM 65-315/450 60HP, azionamento diesel PSD 65-315/450 61HP e pompa jockey PVT(S) 8-12 5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 400/9-60-61-7.5 - Option 2. يحتوي على مضخة كهربائية PSM 65-315/450 60HP، مضخة ديزل احتياطية PSD 65-315/450 61HP، ومضخة جوكي PVT(S) 8-12 5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 400,
      hBar: "9",
      electricPump: "PSM 65-315/450 60HP",
      dieselPump: "PSD 65-315/450 61HP",
      jockeyPump: "PVT(S) 8-12 5.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-500-8-75-75-5-5---option-2",
      model: "PEDJ 500/8-75-75-5.5 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 500/8-75-75-5.5 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 500/8-75-75-5.5 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 500/8-75-75-5.5 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 500/8-75-75-5.5 - Option 2. Features high-performance PSM 80-250/450 75HP electric drive, PSD 80-250/450 75HP diesel engine backup, and PVT(S) 8-10 5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 500/8-75-75-5.5 - Option 2. Dotato di azionamento elettrico PSM 80-250/450 75HP, azionamento diesel PSD 80-250/450 75HP e pompa jockey PVT(S) 8-10 5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 500/8-75-75-5.5 - Option 2. يحتوي على مضخة كهربائية PSM 80-250/450 75HP، مضخة ديزل احتياطية PSD 80-250/450 75HP، ومضخة جوكي PVT(S) 8-10 5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 500,
      hBar: "8",
      electricPump: "PSM 80-250/450 75HP",
      dieselPump: "PSD 80-250/450 75HP",
      jockeyPump: "PVT(S) 8-10 5.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-500-10-100-100-5-5---option-2",
      model: "PEDJ 500/10-100-100-5.5 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 500/10-100-100-5.5 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 500/10-100-100-5.5 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 500/10-100-100-5.5 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 500/10-100-100-5.5 - Option 2. Features high-performance PSM 80-315/750 100HP electric drive, PSD 80-315/750 100HP diesel engine backup, and PVT(S) 8-10 5.5HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 500/10-100-100-5.5 - Option 2. Dotato di azionamento elettrico PSM 80-315/750 100HP, azionamento diesel PSD 80-315/750 100HP e pompa jockey PVT(S) 8-10 5.5HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 500/10-100-100-5.5 - Option 2. يحتوي على مضخة كهربائية PSM 80-315/750 100HP، مضخة ديزل احتياطية PSD 80-315/750 100HP، ومضخة جوكي PVT(S) 8-10 5.5HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 500,
      hBar: "10",
      electricPump: "PSM 80-315/750 100HP",
      dieselPump: "PSD 80-315/750 100HP",
      jockeyPump: "PVT(S) 8-10 5.5HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-750-8-100-99-10---option-2",
      model: "PEDJ 750/8-100-99-10 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 750/8-100-99-10 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 750/8-100-99-10 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 750/8-100-99-10 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 750/8-100-99-10 - Option 2. Features high-performance PSM 100-250/750 100HP electric drive, PSD 100-250/750 99HP diesel engine backup, and PVT(S) 20-8 15HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 750/8-100-99-10 - Option 2. Dotato di azionamento elettrico PSM 100-250/750 100HP, azionamento diesel PSD 100-250/750 99HP e pompa jockey PVT(S) 20-8 15HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 750/8-100-99-10 - Option 2. يحتوي على مضخة كهربائية PSM 100-250/750 100HP، مضخة ديزل احتياطية PSD 100-250/750 99HP، ومضخة جوكي PVT(S) 20-8 15HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 750,
      hBar: "8",
      electricPump: "PSM 100-250/750 100HP",
      dieselPump: "PSD 100-250/750 99HP",
      jockeyPump: "PVT(S) 20-8 15HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-750-10-150-150-12---option-2",
      model: "PEDJ 750/10-150-150-12 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 750/10-150-150-12 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 750/10-150-150-12 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 750/10-150-150-12 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 750/10-150-150-12 - Option 2. Features high-performance PSM 100-315/750 150HP electric drive, PSD 100-315/750 150HP diesel engine backup, and PVT(S) 20-10 15HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 750/10-150-150-12 - Option 2. Dotato di azionamento elettrico PSM 100-315/750 150HP, azionamento diesel PSD 100-315/750 150HP e pompa jockey PVT(S) 20-10 15HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 750/10-150-150-12 - Option 2. يحتوي على مضخة كهربائية PSM 100-315/750 150HP، مضخة ديزل احتياطية PSD 100-315/750 150HP، ومضخة جوكي PVT(S) 20-10 15HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 750,
      hBar: "10",
      electricPump: "PSM 100-315/750 150HP",
      dieselPump: "PSD 100-315/750 150HP",
      jockeyPump: "PVT(S) 20-10 15HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-1000-8-150-150-12---option-2",
      model: "PEDJ 1000/8-150-150-12 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 1000/8-150-150-12 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 1000/8-150-150-12 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 1000/8-150-150-12 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 1000/8-150-150-12 - Option 2. Features high-performance PSM 125-250/1100 150HP electric drive, PSD 125-250/1100 150HP diesel engine backup, and PVT(S) 32-60 15HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 1000/8-150-150-12 - Option 2. Dotato di azionamento elettrico PSM 125-250/1100 150HP, azionamento diesel PSD 125-250/1100 150HP e pompa jockey PVT(S) 32-60 15HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 1000/8-150-150-12 - Option 2. يحتوي على مضخة كهربائية PSM 125-250/1100 150HP، مضخة ديزل احتياطية PSD 125-250/1100 150HP، ومضخة جوكي PVT(S) 32-60 15HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 1000,
      hBar: "8",
      electricPump: "PSM 125-250/1100 150HP",
      dieselPump: "PSD 125-250/1100 150HP",
      jockeyPump: "PVT(S) 32-60 15HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: false,
    },
    {
      id: "pedj-pedj-1000-10-220-225-15---option-2",
      model: "PEDJ 1000/10-220-225-15 - Option 2",
      brandId: "b-hammer",
      categoryId: "cat-ff",
      nameEN: "Fire Pump System PEDJ 1000/10-220-225-15 - Option 2",
      nameIT: "Gruppo Pompe Antincendio PEDJ 1000/10-220-225-15 - Option 2",
      nameAR: "مجموعة مضخات الحريق PEDJ 1000/10-220-225-15 - Option 2",
      descEN:
        "Industrial Fire Pump System configuration PEDJ 1000/10-220-225-15 - Option 2. Features high-performance PSM 125-315/1600 220HP electric drive, PSD 125-315/1600 225HP diesel engine backup, and PVT(S) 32-80 20HP jockey pressure maintenance pump.",
      descIT:
        "Gruppo Pompe Antincendio Industriale modello PEDJ 1000/10-220-225-15 - Option 2. Dotato di azionamento elettrico PSM 125-315/1600 220HP, azionamento diesel PSD 125-315/1600 225HP e pompa jockey PVT(S) 32-80 20HP.",
      descAR:
        "نظام مضخات مكافحة الحريق الصناعي موديل PEDJ 1000/10-220-225-15 - Option 2. يحتوي على مضخة كهربائية PSM 125-315/1600 220HP، مضخة ديزل احتياطية PSD 125-315/1600 225HP، ومضخة جوكي PVT(S) 32-80 20HP للحفاظ على الضغط.",
      image: "images/PEDJ-System.jpg",
      qGpm: 1000,
      hBar: "10",
      electricPump: "PSM 125-315/1600 220HP",
      dieselPump: "PSD 125-315/1600 225HP",
      jockeyPump: "PVT(S) 32-80 20HP",
      configuration: "Separate Coupled Electric + SS304 Jockey",
      active: true,
      featured: true,
    },
  ],
  certificates: [
    {
      id: "cert-1",
      titleEN: "ISO 9001:2015 Quality Management System",
      titleIT: "Sistema Gestione Qualità ISO 9001:2015",
      titleAR: "نظام إدارة الجودة ISO 9001:2015",
      issuer: "TÜV UK",
      code: "CERT-HAMMER-9001",
      pdf: "ISO-9001-THEHAMMER.pdf",
    },
    {
      id: "cert-2",
      titleEN: "NFPA-20 & UL/FM Fire Pump Compliance",
      titleIT: "Conformità Antincendio NFPA-20 & UL/FM",
      titleAR: "التوافق مع أنظمة الحريق NFPA-20 و UL/FM",
      issuer: "Underwriters Laboratories",
      code: "UL-FM-2026",
      pdf: "UL-FM-Fire-Certificate.pdf",
    },
    {
      id: "cert-3",
      titleEN: "CE Machinery Safety Directive 2006/42/EC",
      titleIT: "Direttiva Macchine CE 2006/42/CE",
      titleAR: "توجيه سلامة الآلات الأوروبي CE 2006/42/EC",
      issuer: "European Standards Board",
      code: "CE-PUMP-2026",
      pdf: "CE-Machinery-Directive.pdf",
    },
  ],
  downloads: [
    {
      id: "dl-1",
      titleEN: "THEHAMMER Master Industrial Pump Catalog 2026 (PDF 38MB)",
      titleIT: "Catalogo Generale Pompe THEHAMMER 2026 (PDF 38MB)",
      titleAR: "كتالوج مضخات THEHAMMER الصناعي الرئيسي 2026 (PDF 38MB)",
      file: "THEHAMMER-Master-Catalog-2026.pdf",
      count: 2450,
      category: "Catalog",
    },
    {
      id: "dl-2",
      titleEN: "Centrifugal Water Pump Installation & Engineering Guide",
      titleIT: "Guida di Installazione e Ingegneria Pompe Centrifughe",
      titleAR: "دليل التركيب والهندسة لمضخات المياه الطاردة المركزية",
      file: "Centrifugal-Pump-Engineering-Guide.pdf",
      count: 1420,
      category: "Engineering Guide",
    },
    {
      id: "dl-3",
      titleEN: "3D CAD STEP Files Pack for THEHAMMER Pump Series",
      titleIT: "Pacchetto File CAD STEP 3D Serie Pompe THEHAMMER",
      titleAR: "حزمة ملفات 3D CAD STEP لسلسلة مضخات THEHAMMER",
      file: "THEHAMMER-3D-STEP-CAD.zip",
      count: 890,
      category: "CAD Models",
    },
  ],
  quotes: [
    {
      id: "HM-QT-2026-0104",
      companyName: "Metropolitan Water Authority",
      fullName: "Eng. David Sterling",
      email: "d.sterling@mwa-water.gov.uk",
      phone: "+201203666634",
      country: "United Kingdom",
      productName: "Heavy Duty End-Suction Centrifugal Water Pump TH-5000X",
      model: "TH-CENTRIFUGAL 5000-X",
      quantity: 6,
      contactMethod: "Email",
      message:
        "Requesting formal quotation for 6 units including spare mechanical seals and delivery to Thames Water treatment facility.",
      attachment: "RFQ-Thames-Water-Pump-Spec.pdf",
      status: "New",
      date: "2026-07-21T11:00:00Z",
    },
  ],
  users: [
    {
      id: "usr-1",
      name: "THEHAMMER Admin Officer",
      email: "admin@thehammer-pumps.com",
      role: "Super Admin",
      status: "Active",
    },
  ],
  auditLogs: [
    {
      id: "log-1",
      user: "admin@thehammer-pumps.com",
      action: "SYSTEM_INIT",
      entity: "THEHAMMER Data Layer Initialized",
      timestamp: new Date().toLocaleString(),
    },
  ],
};

class HammerStore {
  constructor() {
    this.init();
  }

  init() {
    const existingProducts = localStorage.getItem("hammer_db_products");
    let needsReset = false;
    if (existingProducts) {
      try {
        const parsed = JSON.parse(existingProducts);
        if (
          parsed.length !== 50 ||
          parsed.some((p) => !p.model || !p.model.startsWith("PEDJ"))
        ) {
          needsReset = true;
        }
      } catch (e) {
        needsReset = true;
      }
    } else {
      needsReset = true;
    }

    if (!localStorage.getItem("hammer_db_initialized") || needsReset) {
      localStorage.setItem(
        "hammer_db_settings",
        JSON.stringify(SEED_DATA.settings),
      );
      localStorage.setItem(
        "hammer_db_categories",
        JSON.stringify(SEED_DATA.categories),
      );
      localStorage.setItem(
        "hammer_db_brands",
        JSON.stringify(SEED_DATA.brands),
      );
      localStorage.setItem(
        "hammer_db_products",
        JSON.stringify(SEED_DATA.products),
      );
      localStorage.setItem(
        "hammer_db_certificates",
        JSON.stringify(SEED_DATA.certificates),
      );
      localStorage.setItem(
        "hammer_db_downloads",
        JSON.stringify(SEED_DATA.downloads),
      );
      localStorage.setItem(
        "hammer_db_quotes",
        JSON.stringify(SEED_DATA.quotes),
      );
      localStorage.setItem("hammer_db_users", JSON.stringify(SEED_DATA.users));
      localStorage.setItem(
        "hammer_db_audit_logs",
        JSON.stringify(SEED_DATA.auditLogs),
      );
      localStorage.setItem("hammer_db_initialized", "true");
    } else {
      // Safety update for returning users to ensure owner details and new fields are correct
      const settings = this.getSettings();
      let settingsChanged = false;
      if (settings) {
        if (settings.whatsAppNumber !== "201203666634") {
          settings.whatsAppNumber = "201203666634";
          settings.phone = "+20 12 03666634";
          settingsChanged = true;
        }
        if (settings.email !== "johnadelm23@gmail.com") {
          settings.email = "johnadelm23@gmail.com";
          settingsChanged = true;
        }
        if (!settings.addressAR) {
          settings.addressAR =
            "مجمع هامر الصناعي، شارع الأعمال 100، لندن، المملكة المتحدة";
          settingsChanged = true;
        }
        if (settingsChanged) {
          localStorage.setItem("hammer_db_settings", JSON.stringify(settings));
        }
      }

      // Sync categories
      let categories = this.getCategories();
      let catsChanged = false;

      // If categories missing or outdated, update with SEED_DATA
      if (!categories || categories.length < SEED_DATA.categories.length) {
        categories = [...SEED_DATA.categories];
        catsChanged = true;
      } else {
        SEED_DATA.categories.forEach((sc) => {
          const idx = categories.findIndex((c) => c.id === sc.id || c.slug === sc.slug);
          if (idx === -1) {
            categories.push(sc);
            catsChanged = true;
          } else {
            // Update fields if missing
            ["filterTag", "image", "descEN", "descIT", "descAR", "slug", "icon"].forEach((key) => {
              if (!categories[idx][key] && sc[key]) {
                categories[idx][key] = sc[key];
                catsChanged = true;
              }
            });
          }
        });
      }

      if (catsChanged) {
        this.setItem("categories", categories);
      }

      // Sync products
      const products = this.getProducts();
      let prodsChanged = false;
      products.forEach((p) => {
        const seedP = SEED_DATA.products.find((sp) => sp.id === p.id);
        if (seedP) {
          if (!p.nameAR) {
            p.nameAR = seedP.nameAR;
            prodsChanged = true;
          }
          if (!p.descAR) {
            p.descAR = seedP.descAR;
            prodsChanged = true;
          }
        }
      });
      if (prodsChanged) {
        this.setItem("products", products);
      }

      // Sync certificates
      const certificates = this.getCertificates();
      let certsChanged = false;
      certificates.forEach((c) => {
        const seedC = SEED_DATA.certificates.find((sc) => sc.id === c.id);
        if (seedC && !c.titleAR) {
          c.titleAR = seedC.titleAR;
          certsChanged = true;
        }
      });
      if (certsChanged) {
        this.setItem("certificates", certificates);
      }

      // Sync downloads
      const downloads = this.getDownloads();
      let dlsChanged = false;
      downloads.forEach((d) => {
        const seedD = SEED_DATA.downloads.find((sd) => sd.id === d.id);
        if (seedD && !d.titleAR) {
          d.titleAR = seedD.titleAR;
          dlsChanged = true;
        }
      });
      if (dlsChanged) {
        this.setItem("downloads", downloads);
      }
    }
  }

  getItem(key) {
    const data = localStorage.getItem(`hammer_db_${key}`);
    return data ? JSON.parse(data) : [];
  }

  setItem(key, value) {
    localStorage.setItem(`hammer_db_${key}`, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("storeUpdated", { detail: { key } }));
  }

  getSettings() {
    return JSON.parse(localStorage.getItem("hammer_db_settings"));
  }
  saveSettings(newSettings) {
    const updated = { ...this.getSettings(), ...newSettings };
    localStorage.setItem("hammer_db_settings", JSON.stringify(updated));
    return updated;
  }

  getProducts() {
    return this.getItem("products");
  }
  saveProduct(product) {
    const products = this.getProducts();
    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      if (idx !== -1) products[idx] = product;
    } else {
      product.id = "prod-" + Date.now();
      products.unshift(product);
    }
    this.setItem("products", products);
    return product;
  }
  deleteProduct(id) {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.setItem("products", products);
  }

  getCategories() {
    return this.getItem("categories");
  }

  getCategoryBySlug(slug) {
    if (!slug) return null;
    const categories = this.getCategories();
    return categories.find(
      (c) =>
        c.slug === slug ||
        c.id === slug ||
        c.slug.toLowerCase().includes(slug.toLowerCase()) ||
        slug.toLowerCase().includes(c.slug.toLowerCase())
    ) || null;
  }

  getProductsForCategory(categoryOrSlug) {
    const products = this.getProducts().filter((p) => p.active !== false);
    if (!categoryOrSlug || categoryOrSlug === "all") return products;

    let catObj = null;
    if (typeof categoryOrSlug === "object") {
      catObj = categoryOrSlug;
    } else {
      catObj = this.getCategoryBySlug(categoryOrSlug);
    }

    const catId = catObj ? catObj.id : categoryOrSlug;
    const catSlug = catObj ? catObj.slug : categoryOrSlug;
    const filterTag = catObj ? catObj.filterTag : "";

    return products.filter((p) => {
      // 100% Dynamic category matching based on product category ID or slug
      if (p.categoryId === catId || p.categoryId === catSlug) return true;
      if (catObj && p.categoryId === catObj.id) return true;

      // Category filter tag fallback for fire fighting pumps
      if (filterTag === "fire-fighting" && (p.categoryId === "cat-ff" || p.categoryId === "fire-fighting-pumps")) {
        return true;
      }

      return false;
    });
  }
  getBrands() {
    return this.getItem("brands");
  }
  getQuotes() {
    return this.getItem("quotes");
  }
  saveQuote(quote) {
    const quotes = this.getQuotes();
    if (!quote.id) {
      quote.id = "HM-QT-2026-" + Math.floor(1000 + Math.random() * 9000);
      quote.date = new Date().toISOString();
      quote.status = "New";
      quotes.unshift(quote);
    } else {
      const idx = quotes.findIndex((q) => q.id === quote.id);
      if (idx !== -1) quotes[idx] = quote;
    }
    this.setItem("quotes", quotes);
    return quote;
  }

  getCertificates() {
    return this.getItem("certificates");
  }
  getDownloads() {
    return this.getItem("downloads");
  }
  getUsers() {
    return this.getItem("users");
  }
  getAuditLogs() {
    return this.getItem("audit_logs");
  }

  incrementDownloadCount(id) {
    const downloads = this.getDownloads();
    const d = downloads.find((item) => item.id === id);
    if (d) {
      d.count += 1;
      this.setItem("downloads", downloads);
    }
  }
}

window.store = new HammerStore();
