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

    // Bulletin board
    noUpdates: "No new updates right now. Please check again later.",
    refresh: "Refresh",

    // Detail page
    whyThisMatters: "Why this matters to you",
    benefitsTitle: "✅ Benefits",
    eligibilityTitle: "👤 Who can apply",
    howToApplyTitle: "➡ How to apply",
    openGovPage: "Open Government Page",
    backToHome: "Back",
    newsNotFound: "This update was not found.",

    // Sources
    "source.agriculture": "Ministry of Agriculture",
    "source.labour": "Ministry of Labour",
    "source.food": "Dept. of Food & PDS",
    "source.rural": "Ministry of Rural Development",
    "source.health": "Ministry of Health",

    // === News items ===
    // PM Kisan
    "news.pmKisan.title": "PM Kisan: ₹6,000 Yearly for Farmers",
    "news.pmKisan.desc": "Get ₹6,000 every year directly in your bank account under PM-KISAN scheme.",
    "news.pmKisan.simple": "You can get ₹6,000 every year directly in your bank. No middleman needed.",
    "news.pmKisan.benefit1": "₹6,000 per year in 3 installments of ₹2,000 each",
    "news.pmKisan.benefit2": "Money goes directly to your bank account",
    "news.pmKisan.benefit3": "No loan — this is free government money",
    "news.pmKisan.elig1": "Small and marginal farmers owning cultivable land",
    "news.pmKisan.elig2": "Must have Aadhaar card linked to bank account",
    "news.pmKisan.apply1": "Visit your nearest Common Service Centre (CSC)",
    "news.pmKisan.apply2": "Carry Aadhaar card, bank passbook, and land papers",
    "news.pmKisan.apply3": "You can also register online at pmkisan.gov.in",

    // Minimum Wage
    "news.minWage.title": "Daily Minimum Wage Now ₹382",
    "news.minWage.desc": "If you're a daily wage worker, your employer must pay at least ₹382 per day.",
    "news.minWage.simple": "Your boss must pay you at least ₹382 per day. If they pay less, you can complain.",
    "news.minWage.benefit1": "Minimum ₹382 per day for unskilled workers",
    "news.minWage.benefit2": "Legal protection if employer pays less",
    "news.minWage.elig1": "All daily wage and unskilled workers",
    "news.minWage.elig2": "Works in construction, farming, factories, or shops",
    "news.minWage.apply1": "If paid less, complain at Labour Commissioner office",
    "news.minWage.apply2": "Call helpline 14434 for free assistance",

    // Crop Insurance
    "news.cropIns.title": "Protect Your Crops — Insurance Available",
    "news.cropIns.desc": "Register for Kharif crop insurance before the deadline. Low premium for farmers.",
    "news.cropIns.simple": "If your crop is damaged by rain or flood, the government will give you money. Register now.",
    "news.cropIns.benefit1": "Get money if crops damaged by weather, pests, or floods",
    "news.cropIns.benefit2": "Pay only 2% premium — government pays the rest",
    "news.cropIns.elig1": "All farmers growing notified crops",
    "news.cropIns.elig2": "Both loanee and non-loanee farmers eligible",
    "news.cropIns.apply1": "Visit your bank or nearest CSC",
    "news.cropIns.apply2": "Carry land records and bank account details",
    "news.cropIns.apply3": "Register before the deadline for your crop season",

    // Free Ration
    "news.ration.title": "Free Ration — Collect Every Month",
    "news.ration.desc": "Government free ration scheme extended. Get rice, wheat, and dal at your PDS shop.",
    "news.ration.simple": "You can get free rice, wheat, and dal every month from the ration shop near you.",
    "news.ration.benefit1": "5 kg foodgrains per person per month at ₹1-3/kg",
    "news.ration.benefit2": "Free ration under PM Garib Kalyan Anna Yojana",
    "news.ration.elig1": "Families with BPL or Antyodaya ration card",
    "news.ration.elig2": "Priority household (PHH) cardholders",
    "news.ration.apply1": "Visit your nearest PDS (ration) shop with ration card",
    "news.ration.apply2": "If you don't have a card, apply at Block/Tehsil office",

    // MGNREGA
    "news.mgnrega.title": "100 Days Guaranteed Work — MGNREGA",
    "news.mgnrega.desc": "New projects starting in your district. Register for guaranteed 100 days of paid work.",
    "news.mgnrega.simple": "The government will give you 100 days of work every year. Payment goes to your bank.",
    "news.mgnrega.benefit1": "100 days of guaranteed employment per year",
    "news.mgnrega.benefit2": "Wages paid directly to bank account within 15 days",
    "news.mgnrega.benefit3": "Work available in your own village",
    "news.mgnrega.elig1": "Any adult member of a rural household",
    "news.mgnrega.elig2": "Must be willing to do unskilled manual work",
    "news.mgnrega.apply1": "Go to your Gram Panchayat and ask for a Job Card",
    "news.mgnrega.apply2": "Carry Aadhaar and one passport-size photo",

    // Soil Health Card
    "news.soil.title": "Free Soil Testing for Farmers",
    "news.soil.desc": "Get your soil tested free. Know which fertilizer is best for your land.",
    "news.soil.simple": "Get your soil tested for free. Learn which crops and fertilizers work best for your land.",
    "news.soil.benefit1": "Free soil testing and Soil Health Card",
    "news.soil.benefit2": "Personalized fertilizer recommendations for your land",
    "news.soil.elig1": "All farmers with agricultural land",
    "news.soil.apply1": "Visit your block-level agriculture office",
    "news.soil.apply2": "Collect soil sample and submit for testing",

    // Ayushman Bharat
    "news.ayushman.title": "Free Hospital Treatment up to ₹5 Lakh",
    "news.ayushman.desc": "Under Ayushman Bharat, get free treatment at government and private hospitals.",
    "news.ayushman.simple": "You and your family can get free treatment up to ₹5 lakh per year at any listed hospital.",
    "news.ayushman.benefit1": "Free treatment up to ₹5 lakh per family per year",
    "news.ayushman.benefit2": "Covers surgeries, medicines, and hospital stays",
    "news.ayushman.elig1": "Families identified in SECC 2011 data",
    "news.ayushman.elig2": "Check eligibility at mera.pmjay.gov.in",
    "news.ayushman.apply1": "Visit any Ayushman Bharat listed hospital",
    "news.ayushman.apply2": "Carry Aadhaar card and ration card for verification",

    // e-Shram
    "news.eShram.title": "e-Shram Card for Workers — Register Free",
    "news.eShram.desc": "Register on e-Shram portal to get accident insurance and government scheme benefits.",
    "news.eShram.simple": "Register for free and get ₹2 lakh accident insurance plus access to all worker schemes.",
    "news.eShram.benefit1": "₹2 lakh accidental insurance coverage",
    "news.eShram.benefit2": "Access to all government worker welfare schemes",
    "news.eShram.elig1": "Unorganized sector workers aged 16-59",
    "news.eShram.elig2": "Must have Aadhaar and mobile number",
    "news.eShram.apply1": "Visit eshram.gov.in or nearest CSC",
    "news.eShram.apply2": "Carry Aadhaar, bank passbook, and mobile phone",

    // Kisan Credit Card
    "news.kisanCredit.title": "Kisan Credit Card — Low-Interest Farm Loan",
    "news.kisanCredit.desc": "Get farm loans at just 4% interest with KCC. Apply at your nearest bank.",
    "news.kisanCredit.simple": "Borrow money for farming at very low interest. Repay after harvest — no pressure.",
    "news.kisanCredit.benefit1": "Farm loans at just 4% annual interest",
    "news.kisanCredit.benefit2": "Flexible repayment after harvest season",
    "news.kisanCredit.elig1": "All farmers, sharecroppers, and tenant farmers",
    "news.kisanCredit.elig2": "Fisheries and animal husbandry farmers also eligible",
    "news.kisanCredit.apply1": "Visit your nearest bank branch with land documents",
    "news.kisanCredit.apply2": "Carry Aadhaar, passport photo, and land records",

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
    verifyHowDesc: "Our AI system analyzes the text using advanced language models and heuristic signals to detect misinformation patterns. It checks for source credibility, language patterns, and factual accuracy.",

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

    // Bulletin board
    noUpdates: "अभी कोई नई जानकारी नहीं है। कृपया बाद में जाँचें।",
    refresh: "ताज़ा करें",

    // Detail page
    whyThisMatters: "यह आपके लिए क्यों ज़रूरी है",
    benefitsTitle: "✅ फायदे",
    eligibilityTitle: "👤 कौन आवेदन कर सकता है",
    howToApplyTitle: "➡ कैसे आवेदन करें",
    openGovPage: "सरकारी पेज खोलें",
    backToHome: "वापस",
    newsNotFound: "यह जानकारी नहीं मिली।",

    // Sources
    "source.agriculture": "कृषि मंत्रालय",
    "source.labour": "श्रम मंत्रालय",
    "source.food": "खाद्य एवं PDS विभाग",
    "source.rural": "ग्रामीण विकास मंत्रालय",
    "source.health": "स्वास्थ्य मंत्रालय",

    // === News items ===
    "news.pmKisan.title": "PM किसान: हर साल ₹6,000 किसानों के लिए",
    "news.pmKisan.desc": "PM-KISAN योजना के तहत हर साल ₹6,000 सीधे आपके बैंक खाते में।",
    "news.pmKisan.simple": "आपको हर साल ₹6,000 सीधे बैंक में मिलेंगे। बिचौलिए की ज़रूरत नहीं।",
    "news.pmKisan.benefit1": "₹6,000 प्रति वर्ष — ₹2,000 की 3 किस्तें",
    "news.pmKisan.benefit2": "पैसा सीधे बैंक खाते में",
    "news.pmKisan.benefit3": "यह कर्ज़ नहीं — सरकार का मुफ्त पैसा",
    "news.pmKisan.elig1": "कृषि योग्य भूमि वाले छोटे किसान",
    "news.pmKisan.elig2": "आधार कार्ड बैंक खाते से जुड़ा होना चाहिए",
    "news.pmKisan.apply1": "नजदीकी जन सेवा केंद्र (CSC) पर जाएं",
    "news.pmKisan.apply2": "आधार, बैंक पासबुक और ज़मीन के कागज़ात लाएं",
    "news.pmKisan.apply3": "pmkisan.gov.in पर ऑनलाइन भी कर सकते हैं",

    "news.minWage.title": "दैनिक न्यूनतम मजदूरी अब ₹382",
    "news.minWage.desc": "अगर आप दिहाड़ी मजदूर हैं, तो मालिक को कम से कम ₹382 प्रतिदिन देना ज़रूरी है।",
    "news.minWage.simple": "आपके मालिक को कम से कम ₹382 प्रतिदिन देना होगा। कम मिले तो शिकायत करें।",
    "news.minWage.benefit1": "अकुशल श्रमिकों के लिए न्यूनतम ₹382 प्रतिदिन",
    "news.minWage.benefit2": "कम मजदूरी मिलने पर कानूनी सुरक्षा",
    "news.minWage.elig1": "सभी दिहाड़ी और अकुशल मजदूर",
    "news.minWage.elig2": "निर्माण, खेती, फैक्ट्री या दुकान में काम करने वाले",
    "news.minWage.apply1": "श्रम आयुक्त कार्यालय में शिकायत करें",
    "news.minWage.apply2": "हेल्पलाइन 14434 पर मुफ्त सहायता लें",

    "news.cropIns.title": "फसल की सुरक्षा करें — बीमा उपलब्ध",
    "news.cropIns.desc": "समय सीमा से पहले खरीफ फसल बीमा के लिए पंजीकरण करें।",
    "news.cropIns.simple": "बारिश या बाढ़ से फसल खराब हो तो सरकार पैसे देगी। अभी रजिस्टर करें।",
    "news.cropIns.benefit1": "मौसम, कीट या बाढ़ से फसल खराब होने पर पैसे मिलेंगे",
    "news.cropIns.benefit2": "सिर्फ 2% प्रीमियम — बाकी सरकार देगी",
    "news.cropIns.elig1": "अधिसूचित फसल उगाने वाले सभी किसान",
    "news.cropIns.elig2": "ऋणी और गैर-ऋणी दोनों किसान पात्र",
    "news.cropIns.apply1": "बैंक या नजदीकी CSC पर जाएं",
    "news.cropIns.apply2": "ज़मीन के कागज़ात और बैंक विवरण लाएं",
    "news.cropIns.apply3": "अपने फसल सीज़न की समय सीमा से पहले पंजीकरण करें",

    "news.ration.title": "मुफ्त राशन — हर महीने लें",
    "news.ration.desc": "सरकारी मुफ्त राशन योजना बढ़ाई गई। राशन दुकान से चावल, गेहूं और दाल लें।",
    "news.ration.simple": "हर महीने नजदीकी राशन दुकान से मुफ्त चावल, गेहूं और दाल ले सकते हैं।",
    "news.ration.benefit1": "₹1-3/किलो पर 5 किलो अनाज प्रति व्यक्ति प्रति माह",
    "news.ration.benefit2": "PM गरीब कल्याण अन्न योजना के तहत मुफ्त राशन",
    "news.ration.elig1": "BPL या अंत्योदय राशन कार्ड वाले परिवार",
    "news.ration.elig2": "प्राथमिकता परिवार (PHH) कार्डधारक",
    "news.ration.apply1": "राशन कार्ड लेकर नजदीकी PDS दुकान पर जाएं",
    "news.ration.apply2": "कार्ड नहीं है तो ब्लॉक/तहसील कार्यालय में आवेदन करें",

    "news.mgnrega.title": "100 दिन गारंटी रोज़गार — मनरेगा",
    "news.mgnrega.desc": "आपके जिले में नई परियोजनाएं शुरू। 100 दिन के भुगतान वाले काम के लिए पंजीकरण करें।",
    "news.mgnrega.simple": "सरकार हर साल 100 दिन का काम देगी। पैसा बैंक में आएगा।",
    "news.mgnrega.benefit1": "प्रति वर्ष 100 दिन का गारंटी रोज़गार",
    "news.mgnrega.benefit2": "15 दिनों के भीतर बैंक में मजदूरी",
    "news.mgnrega.benefit3": "अपने गांव में ही काम उपलब्ध",
    "news.mgnrega.elig1": "ग्रामीण परिवार का कोई भी वयस्क सदस्य",
    "news.mgnrega.elig2": "अकुशल शारीरिक काम करने को तैयार होना चाहिए",
    "news.mgnrega.apply1": "ग्राम पंचायत में जाकर जॉब कार्ड बनवाएं",
    "news.mgnrega.apply2": "आधार और एक पासपोर्ट फोटो लाएं",

    "news.soil.title": "किसानों के लिए मुफ्त मिट्टी जांच",
    "news.soil.desc": "मुफ्त मिट्टी जांच करवाएं। जानें कौन सी खाद आपकी ज़मीन के लिए सबसे अच्छी है।",
    "news.soil.simple": "मिट्टी की मुफ्त जांच करवाएं। जानें कौन सी फसल और खाद आपकी ज़मीन के लिए सही है।",
    "news.soil.benefit1": "मुफ्त मिट्टी जांच और स्वास्थ्य कार्ड",
    "news.soil.benefit2": "आपकी ज़मीन के लिए खाद की सिफारिश",
    "news.soil.elig1": "कृषि भूमि वाले सभी किसान",
    "news.soil.apply1": "ब्लॉक स्तर के कृषि कार्यालय में जाएं",
    "news.soil.apply2": "मिट्टी का नमूना लें और जांच के लिए जमा करें",

    "news.ayushman.title": "₹5 लाख तक मुफ्त इलाज",
    "news.ayushman.desc": "आयुष्मान भारत के तहत सरकारी और निजी अस्पतालों में मुफ्त इलाज।",
    "news.ayushman.simple": "आप और आपका परिवार हर साल ₹5 लाख तक का मुफ्त इलाज करवा सकते हैं।",
    "news.ayushman.benefit1": "हर साल परिवार को ₹5 लाख तक मुफ्त इलाज",
    "news.ayushman.benefit2": "ऑपरेशन, दवाइयां और अस्पताल में रहना शामिल",
    "news.ayushman.elig1": "SECC 2011 डेटा में चिन्हित परिवार",
    "news.ayushman.elig2": "mera.pmjay.gov.in पर पात्रता जांचें",
    "news.ayushman.apply1": "किसी भी आयुष्मान भारत सूचीबद्ध अस्पताल में जाएं",
    "news.ayushman.apply2": "सत्यापन के लिए आधार और राशन कार्ड लाएं",

    "news.eShram.title": "e-श्रम कार्ड — मुफ्त रजिस्ट्रेशन",
    "news.eShram.desc": "e-श्रम पोर्टल पर पंजीकरण करें। दुर्घटना बीमा और सरकारी योजनाओं का लाभ पाएं।",
    "news.eShram.simple": "मुफ्त रजिस्टर करें और ₹2 लाख का दुर्घटना बीमा पाएं।",
    "news.eShram.benefit1": "₹2 लाख का दुर्घटना बीमा",
    "news.eShram.benefit2": "सभी सरकारी कल्याण योजनाओं तक पहुंच",
    "news.eShram.elig1": "16-59 वर्ष के असंगठित क्षेत्र के मजदूर",
    "news.eShram.elig2": "आधार और मोबाइल नंबर होना ज़रूरी",
    "news.eShram.apply1": "eshram.gov.in या नजदीकी CSC पर जाएं",
    "news.eShram.apply2": "आधार, बैंक पासबुक और मोबाइल फोन लाएं",

    "news.kisanCredit.title": "किसान क्रेडिट कार्ड — कम ब्याज पर कर्ज़",
    "news.kisanCredit.desc": "KCC से सिर्फ 4% ब्याज पर खेती का कर्ज़। नजदीकी बैंक में आवेदन करें।",
    "news.kisanCredit.simple": "बहुत कम ब्याज पर खेती के लिए पैसे उधार लें। फसल के बाद चुकाएं।",
    "news.kisanCredit.benefit1": "सिर्फ 4% वार्षिक ब्याज पर खेती का कर्ज़",
    "news.kisanCredit.benefit2": "फसल के बाद लचीला भुगतान",
    "news.kisanCredit.elig1": "सभी किसान, बटाईदार और किरायेदार किसान",
    "news.kisanCredit.elig2": "मछली पालन और पशुपालन किसान भी पात्र",
    "news.kisanCredit.apply1": "ज़मीन के कागज़ात लेकर नजदीकी बैंक जाएं",
    "news.kisanCredit.apply2": "आधार, पासपोर्ट फोटो और भूमि रिकॉर्ड लाएं",

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
