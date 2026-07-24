/**
 * THEHAMMER - Multi-Language i18n Engine
 * Supports: English 🇬🇧 (en), Italian 🇮🇹 (it), Arabic 🇪🇬 (ar)
 */

const DICTIONARIES = {
  en: {
    nav: {
      home: "Home",
      products: "Products Catalog",
      categories: "Categories",
      about: "About THEHAMMER",
      certificates: "Certificates",
      downloads: "Download Center",
      contact: "Contact Us",
      requestQuote: "Request a Quote",
    },
    hero: {
      tag: "INDUSTRIAL WATER PUMP SOLUTIONS",

      subtitle:
        "Explore our range of water pumps, fire pumps, motors, spare parts, and industrial solutions. Contact us for technical information and quotations.",
      brandIntro:
        "TheHammer for Industrial equipment, pumps, motors, fire systems, and technical solutions you can rely on.",
      exploreProducts: "Browse Products",
      requestCustomQuote: "Request a Quote",
      stat1Label: "Max Flow Rate",
      stat2Label: "Head Pressure",
      stat3Label: "Global Installations",
    },
    catalog: {
      title: "Industrial Product Catalog",
      subtitle:
        "Select a category below or search by model number, flow rate, or power output.",
      searchPlaceholder: "Search by product name or code...",
      allCategories: "All Categories",
      allBrands: "All Brands",
      viewDetails: "View Details",
      requestQuoteBtn: "Add to Quote",
      downloadDatasheet: "Download PDF",
      whatsAppQuote: "Contact via WhatsApp",
      addToQuote: "Add to Quote",
      clearFilters: "Clear Filters",
      productsFound: "Products Found",
      noResults: "No products match your search.",
      resultsCount: "Products Count",
      allFlowRates: "All Flow Rates",
      allHeads: "All Head Pressures",
      allCouplings: "All Coupling Types",
      closeCoupledAvailable: "Close Coupled Available",
      separateCoupledAvailable: "Separate Coupled Available",
      flowRate: "Flow Rate",
      headPressure: "Head Pressure",
      electricCloseCoupled: "Electric Pump — Close Coupled",
      electricSeparateCoupled: "Electric Pump — Separate Coupled",
      dieselPump: "Diesel Pump",
      jockeyPlastic: "Jockey Pump — Plastic Impeller",
      jockeySS304: "Jockey Pump — SS304 Impeller",
      notAvailable: "Not Available",
      reset: "Reset",
      breakdownTitle: "System Configuration Breakdown",
      electricPumpLabel: "Electric Pump",
      dieselPumpLabel: "Diesel Pump",
      jockeyPumpLabel: "Jockey Pump",
    },
    quoteModal: {
      title: "Request a Quotation | THEHAMMER",
      subtitle:
        "Complete the technical inquiry below. Our pump engineers respond within 24 business hours.",
      companyName: "Company / Project Name *",
      fullName: "Full Name *",
      email: "Corporate Email Address *",
      phone: "Phone Number (with Country Code) *",
      country: "Country / Installation Region *",
      selectedProduct: "Selected Pump Model & Specs",
      productName: "Product Name",
      productCode: "Product Code",
      quantity: "Required Quantity (Units) *",
      contactMethod: "Preferred Contact Method",
      methodEmail: "Email",
      methodPhone: "Phone Call",
      methodWhatsApp: "WhatsApp",
      message:
        "Technical Operating Conditions (Fluid Type, Temp, Operating Hours)...",
      fileUpload:
        "Attach Project RFQ / Technical CAD / Site Diagram (PDF, PNG, JPG)",
      dragDropText: "Drag and drop project files here or click to browse",
      submitBtn: "Submit Quotation Request",
      successMsg:
        "Your quotation request has been logged successfully! Inquiry Reference: ",
      cancelBtn: "Cancel",
      companyPlaceholder: "e.g. Thames Water / Veolia",
      namePlaceholder: "e.g. Eng. David Sterling",
      emailPlaceholder: "engineering@company.com",
      phonePlaceholder: "+201226806622",
      countryPlaceholder: "United Kingdom / Italy / UAE",
      messagePlaceholder:
        "Specify required flow rate (m³/h), head pressure (m), fluid temperature, or electrical Hz frequency...",
    },
    quoteList: {
      title: "Quote List",
      empty: "Your Quote List is empty.",
      emptyTitle: "Your quote list is empty",
      emptyDescription:
        "Add products to request pricing and technical details.",
      remove: "Remove",
      sendRequest: "Send Quote Request",
      addedAlert: "Product added to your Quote List!",
      itemRemoved: "Product removed from your Quote List.",
      checkoutTitle: "Requester Information",
      quantity: "Quantity",
    },
    contact: {
      title: "Contact Us",
      subtitle:
        "Have questions or need technical support? Send us a message directly via WhatsApp or email.",
      nameLabel: "Full Name *",
      phoneLabel: "Phone Number (with Country Code) *",
      emailLabel: "Email Address *",
      companyLabel: "Company",
      subjectLabel: "Subject *",
      messageLabel: "Message *",
      submitBtn: "Send Message",
      namePlaceholder: "e.g. John Doe",
      phonePlaceholder: "e.g. +201226806622",
      emailPlaceholder: "e.g. john@example.com",
      companyPlaceholder: "e.g. Company Ltd.",
      subjectPlaceholder: "e.g. Technical Support",
      messagePlaceholder: "Type your message here...",
      contactWhatsApp: "Contact via WhatsApp",
      sendEmail: "Send an Email",
      requestQuote: "Request a Quote",
    },
    validation: {
      fullNameRequired: "Full name is required.",
      phoneRequired: "Phone number is required.",
      phoneInvalid: "Please enter a valid phone number.",
      emailInvalid: "Please enter a valid email address.",
      productNameRequired: "Product name is required.",
      quantityMin: "Quantity must be greater than zero.",
      messageRequired: "Please enter your message.",
      whatsappError: "Unable to open WhatsApp. Please try again.",
      companyRequired: "Company / Project name is required.",
      countryRequired: "Country / Installation region is required.",
      subjectRequired: "Subject is required.",
    },
    pdf: {
      download: "Download PDF",
      unavailable: "PDF document is currently unavailable.",
    },
    whatsApp: {
      template:
        "Hello THEHAMMER Team,\nI would like to request a quotation for:\n\nProduct: {productName}\nModel: {model}\nPower: {power}\nFlow Rate: {flow}\nHead: {head}\nURL: {productUrl}\n\nPlease contact me.",
    },
    cookie: {
      text: "THEHAMMER uses essential technical cookies to ensure optimal system performance and GDPR compliance.",
      acceptAll: "Accept Cookies",
      settings: "Cookie Preferences",
    },
    footer: {
      companyDesc:
        "THEHAMMER is a global manufacturer of heavy-duty industrial water pumps, fire protection pump sets, electric motors, and pressure boosting systems.",
      rights:
        "© 2026 THEHAMMER Industrial Water Pump Solutions. All Rights Reserved.",
    },
  },
  it: {
    nav: {
      home: "Home",
      products: "Catalogo Prodotti",
      categories: "Categorie",
      about: "Chi siamo",
      downloads: "Download",
      contact: "Contatti",
      requestQuote: "Richiedi un preventivo",
    },
    hero: {
      tag: "SOLUZIONI PER POMPE IDRAULICHE INDUSTRIALI",
      title: "Attrezzature industriali su cui puoi contare",
      subtitle:
        "Scopri la nostra gamma di pompe idrauliche, pompe antincendio, motori, ricambi e soluzioni industriali. Contattaci per informazioni tecniche e preventivi.",
      brandIntro:
        "Attrezzature industriali, pompe, motori, sistemi antincendio e soluzioni tecniche su cui puoi contare.",
      exploreProducts: "Esplora i prodotti",
      requestCustomQuote: "Richiedi un preventivo",
      stat1Label: "Portata Massima",
      stat2Label: "Prevalenza Max",
      stat3Label: "Installazioni Globali",
    },
    catalog: {
      title: "Catalogo Prodotti Industriali",
      subtitle:
        "Seleziona una categoria o cerca per modello, portata o potenza motore.",
      searchPlaceholder: "Cerca per nome o codice prodotto...",
      allCategories: "Tutte le categorie",
      allBrands: "Tutti i Marchi",
      viewDetails: "Visualizza dettagli",
      requestQuoteBtn: "Aggiungi al preventivo",
      downloadDatasheet: "Scarica PDF",
      whatsAppQuote: "Contatta via WhatsApp",
      addToQuote: "Aggiungi al preventivo",
      clearFilters: "Cancella filtri",
      productsFound: "Prodotti trovati",
      noResults: "Nessun prodotto corrisponde alla ricerca.",
      resultsCount: "Prodotti trovati",
      allFlowRates: "Tutte le portate",
      allHeads: "Tutte le prevalenze",
      allCouplings: "Tutti i tipi di accoppiamento",
      closeCoupledAvailable: "Pompa monoblocco disponibile",
      separateCoupledAvailable: "Pompa giunto spaziatore disp.",
      flowRate: "Portata",
      headPressure: "Prevalenza",
      electricCloseCoupled: "Pompa Elettrica — Accoppiamento Diretto",
      electricSeparateCoupled: "Pompa Elettrica — Accoppiamento Separato",
      dieselPump: "Pompa Diesel",
      jockeyPlastic: "Pompa Jockey — Girante in Plastica",
      jockeySS304: "Pompa Jockey — Girante SS304",
      notAvailable: "Non disponibile",
      reset: "Ripristina",
      breakdownTitle: "Dettaglio Configurazione Sistema",
      electricPumpLabel: "Pompa Elettrica",
      dieselPumpLabel: "Pompa Diesel",
      jockeyPumpLabel: "Pompa Jockey",
    },
    quoteModal: {
      title: "Richiesta di Preventivo | THEHAMMER",
      subtitle:
        "Compila la richiesta tecnica sottostante. I nostri ingegneri risponderanno entro 24 ore lavorative.",
      companyName: "Nome Azienda / Progetto *",
      fullName: "Nome e Cognome *",
      email: "Email Aziendale *",
      phone: "Telefono (con prefisso) *",
      country: "Paese / Regione Installazione *",
      selectedProduct: "Modello Pompa Selezionato e Specifiche",
      productName: "Nome Prodotto",
      productCode: "Codice Prodotto",
      quantity: "Quantità Richiesta (Unità) *",
      contactMethod: "Metodo di Contatto Preferito",
      methodEmail: "Email",
      methodPhone: "Chiamata Telefonica",
      methodWhatsApp: "WhatsApp",
      message:
        "Condizioni Operative Tecniche (Tipo Fluido, Temperatura, Ore Operative)...",
      fileUpload: "Allega File RFQ Progetto / Schema CAD (PDF, PNG, JPG)",
      dragDropText: "Trascina i file del progetto qui o clicca per sfogliare",
      submitBtn: "Invia Richiesta Preventivo",
      successMsg:
        "La tua richiesta di preventivo è stata registrata con successo! Riferimento: ",
      cancelBtn: "Annulla",
      companyPlaceholder: "es. Thames Water / Veolia",
      namePlaceholder: "es. Ingg. David Sterling",
      emailPlaceholder: "ingegneria@azienda.com",
      phonePlaceholder: "+201226806622",
      countryPlaceholder: "Regno Unito / Italia / EAU",
      messagePlaceholder:
        "Specificare la portata richiesta (m³/h), la prevalenza (m), la temperatura del fluido o la frequenza Hz...",
    },
    quoteList: {
      title: "Elenco Preventivo",
      empty: "L'elenco del preventivo è vuoto.",
      emptyTitle: "La lista del preventivo è vuota",
      emptyDescription:
        "Aggiungi i prodotti per richiedere prezzi e informazioni tecniche.",
      remove: "Rimuovi",
      sendRequest: "Invia richiesta di preventivo",
      addedAlert: "Prodotto aggiunto all'elenco del preventivo!",
      itemRemoved: "Prodotto rimosso dall'elenco del preventivo.",
      checkoutTitle: "Informazioni del Richiedente",
      quantity: "Quantità",
    },
    contact: {
      title: "Contatti",
      subtitle:
        "Hai domande o hai bisogno di supporto tecnico? Inviaci un messaggio direttamente tramite WhatsApp o email.",
      nameLabel: "Nome e Cognome *",
      phoneLabel: "Numero di Telefono (con prefisso) *",
      emailLabel: "Indirizzo Email *",
      companyLabel: "Azienda",
      subjectLabel: "Oggetto *",
      messageLabel: "Messaggio *",
      submitBtn: "Invia Messaggio",
      namePlaceholder: "es. Mario Rossi",
      phonePlaceholder: "es. +201226806622",
      emailPlaceholder: "es. mario@esempio.com",
      companyPlaceholder: "es. Azienda S.r.l.",
      subjectPlaceholder: "es. Supporto Tecnico",
      messagePlaceholder: "Scrivi il tuo messaggio qui...",
      contactWhatsApp: "Contatta via WhatsApp",
      sendEmail: "Invia un'email",
      requestQuote: "Richiedi un preventivo",
    },
    validation: {
      fullNameRequired: "Il nome completo è obbligatorio.",
      phoneRequired: "Il numero di telefono è obbligatorio.",
      phoneInvalid: "Inserisci un numero di telefono valido.",
      emailInvalid: "Inserisci un indirizzo email valido.",
      productNameRequired: "Il nome del prodotto è obbligatorio.",
      quantityMin: "La quantità deve essere maggiore di zero.",
      messageRequired: "Inserisci il tuo messaggio.",
      whatsappError: "Impossibile aprire WhatsApp. Riprova.",
      companyRequired: "Il nome dell'azienda/progetto è obbligatorio.",
      countryRequired: "La località/regione è obbligatoria.",
      subjectRequired: "L'oggetto è obbligatorio.",
    },
    pdf: {
      download: "Scarica PDF",
      unavailable: "Il documento PDF non è attualmente disponibile.",
    },
    whatsApp: {
      template:
        "Buongiorno Team THEHAMMER,\nVorrei richiedere un preventivo per:\n\nProdotto: {productName}\nModello: {model}\nPotenza: {power}\nPortata: {flow}\nPrevalenza: {head}\nURL: {productUrl}\n\nSi prega di contattarmi.",
    },
    cookie: {
      text: "THEHAMMER utilizza cookie tecnici essenziali per garantire prestazioni ottimali in conformità al GDPR.",
      acceptAll: "Accetta Cookie",
      settings: "Preferenze Cookie",
    },
    footer: {
      companyDesc:
        "THEHAMMER è un produttore globale di pompe idrauliche industriali, gruppi pompe antincendio, motori elettrici e sistemi di pressurizzazione.",
      rights:
        "© 2026 THEHAMMER Industrial Water Pump Solutions. Tutti i diritti riservati.",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      products: "المنتجات",
      categories: "التصنيفات",
      about: "من نحن",
      downloads: "التحميلات",
      contact: "تواصل معنا",
      requestQuote: "اطلب عرض سعر",
    },
    hero: {
      tag: "حلول مضخات المياه الصناعية",
      title: "معدات صناعية يمكنك الاعتماد عليها",
      subtitle:
        "اكتشف مجموعتنا من مواتير المياه، ومضخات الحريق، والمحركات، وقطع الغيار، والحلول الصناعية. تواصل معنا للحصول على المعلومات الفنية وعروض الأسعار.",
      brandIntro:
        " TheHammer معدات صناعية، ومضخات، ومحركات، وأنظمة حريق، وحلول فنية يمكنك الاعتماد عليها.",
      exploreProducts: "تصفح المنتجات",
      requestCustomQuote: "اطلب عرض سعر",
      stat1Label: "معدل التدفق الأقصى",
      stat2Label: "ضغط الارتفاع الأقصى",
      stat3Label: "التركيبات العالمية",
    },
    catalog: {
      title: "كتالوج المنتجات الصناعية",
      subtitle:
        "اختر تصنيفًا أدناه أو ابحث برقم الموديل، معدل التدفق، أو قوة المحرك.",
      searchPlaceholder: "ابحث باسم المنتج أو الكود...",
      allCategories: "جميع التصنيفات",
      allBrands: "جميع العلامات التجارية",
      viewDetails: "عرض التفاصيل",
      requestQuoteBtn: "أضف إلى طلب السعر",
      downloadDatasheet: "تحميل ملف PDF",
      whatsAppQuote: "تواصل عبر واتساب",
      addToQuote: "أضف إلى طلب السعر",
      clearFilters: "مسح عوامل التصفية",
      productsFound: "المنتجات المطابقة",
      noResults: "لا توجد منتجات مطابقة لبحثك.",
      resultsCount: "عدد المنتجات",
      allFlowRates: "جميع معدلات التدفق",
      allHeads: "جميع مستويات الضغط",
      allCouplings: "جميع أنواع الاقتران",
      closeCoupledAvailable: "متاح اقتران مباشر",
      separateCoupledAvailable: "متاح اقتران منفصل",
      flowRate: "معدل التدفق",
      headPressure: "ضغط الارتفاع",
      electricCloseCoupled: "المضخة الكهربائية — اقتران مباشر",
      electricSeparateCoupled: "المضخة الكهربائية — اقتران منفصل",
      dieselPump: "مضخة الديزل",
      jockeyPlastic: "مضخة الجوكي — مروحة بلاستيكية",
      jockeySS304: "مضخة الجوكي — مروحة ستانلس ستيل SS304",
      notAvailable: "غير متاح",
      reset: "إعادة تعيين",
      breakdownTitle: "تفاصيل مكونات النظام",
      electricPumpLabel: "المضخة الكهربائية",
      dieselPumpLabel: "مضخة الديزل",
      jockeyPumpLabel: "مضخة الجوكي",
    },
    quoteModal: {
      title: "طلب عرض سعر | THEHAMMER",
      subtitle:
        "أكمل بيانات الاستفسار الفني أدناه. يقوم مهندسو المضخات لدينا بالرد خلال 24 ساعة عمل.",
      companyName: "اسم الشركة / المشروع *",
      fullName: "الاسم بالكامل *",
      email: "البريد الإلكتروني للشركة *",
      phone: "رقم الهاتف (مع كود الدولة) *",
      country: "الدولة / منطقة التركيب *",
      selectedProduct: "موديل المضخة المحدد والمواصفات",
      productName: "اسم المنتج",
      productCode: "كود المنتج",
      quantity: "الكمية المطلوبة (بالوحدات) *",
      contactMethod: "طريقة الاتصال المفضلة",
      methodEmail: "البريد الإلكتروني",
      methodPhone: "اتصال هاتفي",
      methodWhatsApp: "واتساب",
      message:
        "ظروف التشغيل الفنية (نوع السائل، درجة الحرارة، ساعات التشغيل)...",
      fileUpload:
        "إرفاق ملف طلب عرض السعر / تصميم CAD / مخطط الموقع (PDF, PNG, JPG)",
      dragDropText: "اسحب وأسقط ملفات المشروع هنا أو انقر للتصفح",
      submitBtn: "إرسال طلب عرض السعر",
      successMsg: "تم تسجيل طلب عرض السعر الخاص بك بنجاح! رقم المرجع: ",
      cancelBtn: "إلغاء",
      companyPlaceholder: "مثال: مياه التايمز / فيوليا",
      namePlaceholder: "مثال: م. ديفيد ستيرلينغ",
      emailPlaceholder: "engineering@company.com",
      phonePlaceholder: "+201226806622",
      countryPlaceholder: "المملكة المتحدة / إيطاليا / الإمارات",
      messagePlaceholder:
        "حدد معدل التدفق المطلوب (m³/h)، ضغط الارتفاع (m)، درجة حرارة السائل، أو التردد الكهربائي بالهرتز...",
    },
    quoteList: {
      title: "قائمة طلب السعر",
      empty: "قائمة طلب السعر فارغة.",
      emptyTitle: "قائمة طلب عرض السعر فارغة",
      emptyDescription:
        "أضف المنتجات التي تريد معرفة أسعارها وتفاصيلها الفنية.",
      remove: "إزالة",
      sendRequest: "إرسال طلب عرض السعر",
      addedAlert: "تم إضافة المنتج إلى قائمة طلب السعر!",
      itemRemoved: "تم إزالة المنتج من قائمة طلب السعر.",
      checkoutTitle: "بيانات مقدم الطلب",
      quantity: "الكمية",
    },
    contact: {
      title: "تواصل معنا",
      subtitle:
        "لديك أسئلة أو بحاجة إلى دعم فني؟ أرسل لنا رسالة مباشرة عبر الواتساب أو البريد الإلكتروني.",
      nameLabel: "الاسم بالكامل *",
      phoneLabel: "رقم الهاتف (مع كود الدولة) *",
      emailLabel: "البريد الإلكتروني *",
      companyLabel: "الشركة",
      subjectLabel: "الموضوع *",
      messageLabel: "الرسالة *",
      submitBtn: "إرسال الرسالة",
      namePlaceholder: "مثال: أحمد محمد",
      phonePlaceholder: "مثال: +201226806622",
      emailPlaceholder: "مثال: ahmed@example.com",
      companyPlaceholder: "مثال: الشركة المحدودة",
      subjectPlaceholder: "مثال: الدعم الفني",
      messagePlaceholder: "اكتب رسالتك هنا...",
      contactWhatsApp: "تواصل عبر واتساب",
      sendEmail: "إرسال بريد إلكتروني",
      requestQuote: "اطلب عرض سعر",
    },
    validation: {
      fullNameRequired: "الاسم الكامل مطلوب.",
      phoneRequired: "رقم الهاتف مطلوب.",
      phoneInvalid: "يرجى إدخال رقم هاتف صحيح.",
      emailInvalid: "يرجى إدخال بريد إلكتروني صحيح.",
      productNameRequired: "اسم المنتج مطلوب.",
      quantityMin: "يجب أن تكون الكمية أكبر من الصفر.",
      messageRequired: "يرجى إدخال رسالتك.",
      whatsappError: "تعذر فتح واتساب. يرجى المحاولة مرة أخرى.",
      companyRequired: "اسم الشركة / المشروع مطلوب.",
      countryRequired: "الدولة / منطقة التركيب مطلوبة.",
      subjectRequired: "الموضوع مطلوب.",
    },
    pdf: {
      download: "تحميل ملف PDF",
      unavailable: "ملف PDF غير متاح حاليًا.",
    },
    whatsApp: {
      template:
        "مرحبًا أستاذ John Adel،\nأود طلب عرض سعر للمنتج التالي:\n\nالمنتج: {productName}\nالموديل: {model}\nالقوة: {power}\nالتدفق: {flow}\nالضغط: {head}\nالرابط: {productUrl}\n\nيرجى التواصل معي.",
    },
    cookie: {
      text: "يستخدم THEHAMMER ملفات تعريف الارتباط الفنية الأساسية لضمان الأداء الأمثل للنظام والامتثال للوائح حماية البيانات العامة (GDPR).",
      acceptAll: "قبول ملفات تعريف الارتباط",
      settings: "تفضيلات ملفات تعريف الارتباط",
    },
    footer: {
      companyDesc:
        "THEHAMMER هي شركة تصنيع عالمية لمضخات المياه الصناعية الثقيلة، ومجموعات مضخات مكافحة الحريق، والمحركات الكهربائية، وأنظمة ضغط المياه.",
      rights:
        "جميع الحقوق محفوظة © 2026 لمصنع THEHAMMER لحلول مضخات المياه الصناعية.",
    },
  },
};

class I18nEngine {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.init();
  }

  detectLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    if (langParam && DICTIONARIES[langParam]) {
      localStorage.setItem("hammer_lang", langParam);
      return langParam;
    }

    const saved = localStorage.getItem("hammer_lang");
    if (saved && DICTIONARIES[saved]) return saved;

    const navLang = navigator.language
      ? navigator.language.substring(0, 2)
      : "en";
    return DICTIONARIES[navLang] ? navLang : "en";
  }

  init() {
    this.setLanguage(this.currentLang, false);
  }

  setLanguage(lang, reload = true) {
    if (!DICTIONARIES[lang]) lang = "en";
    this.currentLang = lang;
    localStorage.setItem("hammer_lang", lang);

    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    this.translateDOM();

    if (reload) {
      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: { lang } }),
      );
    }
  }

  t(keyPath, fallback = "") {
    const keys = keyPath.split(".");
    let value = DICTIONARIES[this.currentLang];

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        let fallbackVal = DICTIONARIES["en"];
        for (const fk of keys) {
          if (fallbackVal && fallbackVal[fk] !== undefined) {
            fallbackVal = fallbackVal[fk];
          } else {
            return fallback || keyPath;
          }
        }
        return fallbackVal;
      }
    }
    return value;
  }

  translateDOM() {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);

      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translation);
        }
      } else {
        el.innerHTML = translation;
      }
    });

    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = this.t(key);
      el.setAttribute("placeholder", translation);
    });
  }
}

window.i18n = new I18nEngine();
