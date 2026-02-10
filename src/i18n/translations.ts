// Dictionary-based translation system for Gramin Sahayak
// Supports English and Hindi — easily extendable to more languages

export type Language = "en" | "hi";

export const translations = {
  en: {
    // Navbar
    appTitle: "Gramin Sahayak",
    langLabel: "Language",
    navHome: "Home",
    navHelp: "Help",
    navCheck: "Check",
    navAbout: "About",

    // Home page
    bulletinTitle: "Latest Updates",
    quickActions: "Quick Actions",
    askForHelp: "Ask for Help",
    askForHelpDesc: "Get answers to your questions",
    checkNews: "Check News",
    checkNewsDesc: "Verify if news is real or fake",
    aboutApp: "About",
    aboutAppDesc: "Learn about Gramin Sahayak",

    // Bulletin filters
    filterAll: "All",
    filterFarmer: "Farmer",
    filterWorker: "Worker",
    filterGeneral: "General",

    // News items
    "news.pmKisan.title": "PM Kisan Installment Released",
    "news.pmKisan.desc": "₹6,000 yearly benefit under PM-KISAN scheme. Check your bank account for the latest installment.",
    "news.minWage.title": "Minimum Wage Updated",
    "news.minWage.desc": "Daily minimum wage for unskilled workers increased to ₹382. Know your rights.",
    "news.cropIns.title": "Crop Insurance Deadline",
    "news.cropIns.desc": "Last date for Kharif crop insurance registration is approaching. Visit your nearest CSC.",
    "news.ration.title": "Free Ration Distribution",
    "news.ration.desc": "Government free ration scheme extended. Collect your monthly ration from the nearest PDS shop.",
    "news.mgnrega.title": "MGNREGA Work Available",
    "news.mgnrega.desc": "New MGNREGA projects starting in your district. Register at Gram Panchayat for guaranteed 100 days work.",
    "news.soil.title": "Soil Health Card",
    "news.soil.desc": "Get your soil tested for free. Collect Soil Health Card from the agriculture office.",

    // Chat page
    chatTitle: "Ask for Help",
    chatSubtitle: "Ask about wages, farming, ration & more",
    chatGreeting: "🙏 Namaste! I am your Gramin Sahayak. Ask me about wages, farming, ration, health, or education.",
    chatPlaceholder: "Type your question...",
    quickWage: "💰 Wage Issue",
    quickFarming: "🌾 Farming Help",
    quickRation: "🍚 Ration Card",

    // Verify page
    verifyTitle: "Check News",
    verifySubtitle: "Verify if a news message is real or fake",
    verifyLabel: "Paste the news message below:",
    verifyPlaceholder: "Paste a WhatsApp message or news text here...",
    verifyButton: "Check Now",
    verifyResult: "Result",
    verifyHow: "How does this work?",
    verifyHowDesc: "Our system analyzes the text to check for common patterns found in misinformation. Multi-language support coming soon.",

    // About page
    aboutTitle: "About Gramin Sahayak",
    aboutSubtitle: "Empowering rural communities",
    aboutHeroName: "Gramin Sahayak",
    aboutHeroDesc: "Rural Assistant — Your Digital Helper",
    aboutMission: "Our Mission",
    aboutMissionText: "Gramin Sahayak helps rural people — farmers, workers, and citizens — by providing easy access to verified government news, legal help, and tools to detect misinformation. Built for simplicity and accessibility.",
    aboutFeatures: "What We Do",
    aboutVerifiedNews: "Verified News",
    aboutVerifiedNewsDesc: "Get verified government announcements and scheme updates directly.",
    aboutLegalHelp: "Legal Help",
    aboutLegalHelpDesc: "Know your rights about wages, land, and government schemes.",
    aboutFakeNews: "Fake News Detection",
    aboutFakeNewsDesc: "Check if a WhatsApp message or news is real or fake.",
    aboutComingSoon: "Coming Soon",
    aboutVoice: "🗣 Voice input support",
    aboutAI: "🤖 AI-powered chatbot with real answers",
    aboutML: "📊 ML-based fake news detection model",
    aboutMultiLang: "🌍 Multi-language support",

    // Footer
    footer: "© Gramin Sahayak — Rural Digital Services",
  },
  hi: {
    // Navbar
    appTitle: "ग्रामीण सहायक",
    langLabel: "भाषा",
    navHome: "होम",
    navHelp: "मदद",
    navCheck: "जाँच",
    navAbout: "जानकारी",

    // Home page
    bulletinTitle: "ताज़ा अपडेट",
    quickActions: "त्वरित कार्य",
    askForHelp: "मदद माँगें",
    askForHelpDesc: "अपने सवालों के जवाब पाएं",
    checkNews: "खबर जाँचें",
    checkNewsDesc: "जानें कि खबर सच है या झूठ",
    aboutApp: "जानकारी",
    aboutAppDesc: "ग्रामीण सहायक के बारे में जानें",

    // Bulletin filters
    filterAll: "सभी",
    filterFarmer: "किसान",
    filterWorker: "मजदूर",
    filterGeneral: "सामान्य",

    // News items
    "news.pmKisan.title": "PM किसान किस्त जारी",
    "news.pmKisan.desc": "PM-KISAN योजना के तहत ₹6,000 वार्षिक लाभ। नवीनतम किस्त के लिए अपना बैंक खाता देखें।",
    "news.minWage.title": "न्यूनतम मजदूरी अपडेट",
    "news.minWage.desc": "अकुशल श्रमिकों के लिए दैनिक न्यूनतम मजदूरी बढ़कर ₹382 हो गई। अपने अधिकार जानें।",
    "news.cropIns.title": "फसल बीमा अंतिम तिथि",
    "news.cropIns.desc": "खरीफ फसल बीमा पंजीकरण की अंतिम तिथि नजदीक है। निकटतम CSC पर जाएं।",
    "news.ration.title": "मुफ्त राशन वितरण",
    "news.ration.desc": "सरकारी मुफ्त राशन योजना बढ़ाई गई। निकटतम PDS दुकान से अपना मासिक राशन लें।",
    "news.mgnrega.title": "मनरेगा कार्य उपलब्ध",
    "news.mgnrega.desc": "आपके जिले में नई मनरेगा परियोजनाएं शुरू हो रही हैं। 100 दिन के गारंटीड काम के लिए ग्राम पंचायत में पंजीकरण करें।",
    "news.soil.title": "मृदा स्वास्थ्य कार्ड",
    "news.soil.desc": "अपनी मिट्टी की मुफ्त जांच करवाएं। कृषि कार्यालय से मृदा स्वास्थ्य कार्ड लें।",

    // Chat page
    chatTitle: "मदद माँगें",
    chatSubtitle: "मजदूरी, खेती, राशन और अन्य के बारे में पूछें",
    chatGreeting: "🙏 नमस्ते! मैं आपका ग्रामीण सहायक हूँ। मुझसे मजदूरी, खेती, राशन, स्वास्थ्य या शिक्षा के बारे में पूछें।",
    chatPlaceholder: "अपना सवाल लिखें...",
    quickWage: "💰 मजदूरी समस्या",
    quickFarming: "🌾 खेती सहायता",
    quickRation: "🍚 राशन कार्ड",

    // Verify page
    verifyTitle: "खबर जाँचें",
    verifySubtitle: "जानें कि कोई संदेश सच है या झूठ",
    verifyLabel: "नीचे खबर का संदेश पेस्ट करें:",
    verifyPlaceholder: "WhatsApp संदेश या समाचार यहाँ पेस्ट करें...",
    verifyButton: "अभी जाँचें",
    verifyResult: "परिणाम",
    verifyHow: "यह कैसे काम करता है?",
    verifyHowDesc: "हमारा सिस्टम गलत सूचना में पाए जाने वाले सामान्य पैटर्न की जाँच करने के लिए टेक्स्ट का विश्लेषण करता है। बहु-भाषा समर्थन जल्द आ रहा है।",

    // About page
    aboutTitle: "ग्रामीण सहायक के बारे में",
    aboutSubtitle: "ग्रामीण समुदायों को सशक्त बनाना",
    aboutHeroName: "ग्रामीण सहायक",
    aboutHeroDesc: "ग्रामीण सहायक — आपका डिजिटल मददगार",
    aboutMission: "हमारा उद्देश्य",
    aboutMissionText: "ग्रामीण सहायक ग्रामीण लोगों — किसानों, श्रमिकों और नागरिकों — की सत्यापित सरकारी समाचार, कानूनी सहायता और गलत सूचना का पता लगाने के उपकरणों तक आसान पहुँच प्रदान करके मदद करता है।",
    aboutFeatures: "हम क्या करते हैं",
    aboutVerifiedNews: "सत्यापित समाचार",
    aboutVerifiedNewsDesc: "सत्यापित सरकारी घोषणाएं और योजना अपडेट सीधे प्राप्त करें।",
    aboutLegalHelp: "कानूनी सहायता",
    aboutLegalHelpDesc: "मजदूरी, जमीन और सरकारी योजनाओं के बारे में अपने अधिकार जानें।",
    aboutFakeNews: "फेक न्यूज़ पहचान",
    aboutFakeNewsDesc: "जांचें कि कोई WhatsApp संदेश या समाचार सच है या झूठ।",
    aboutComingSoon: "जल्द आ रहा है",
    aboutVoice: "🗣 आवाज इनपुट समर्थन",
    aboutAI: "🤖 AI-संचालित चैटबॉट",
    aboutML: "📊 ML-आधारित फेक न्यूज़ पहचान",
    aboutMultiLang: "🌍 बहु-भाषा समर्थन",

    // Footer
    footer: "© ग्रामीण सहायक — ग्रामीण डिजिटल सेवाएं",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
