/**
 * Bilingual & Multilingual Localization Utility for Voice Khata Kirana Assistant.
 * Supports Hindi (hi-IN), Indian English (en-IN), Kannada (kn-IN), Tamil (ta-IN), Telugu (te-IN).
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", native: "English", en: "Indian English", flag: "🇮🇳" },
  { code: "hi-IN", native: "हिन्दी", en: "Hindi", flag: "🇮🇳" },
  { code: "kn-IN", native: "ಕನ್ನಡ", en: "Kannada", flag: "🇮🇳" },
  { code: "ta-IN", native: "தமிழ்", en: "Tamil", flag: "🇮🇳" },
  { code: "te-IN", native: "తెలుగు", en: "Telugu", flag: "🇮🇳" },
];

export const TRANSLATIONS = {
  "en-IN": {
    // Navigation & App Shell
    navDashboard: "Dashboard (Khata)",
    navCustomers: "Customers",
    navLedgers: "Customer Ledgers",
    navSettings: "Settings",
    logout: "Logout",
    storeSubtitle: "Voice Khata · Kirana AI Digital Accountant",
    viewAll: "View All",

    // Stat Cards
    statCreditToday: "🔴 Today's Credit",
    statPaymentsToday: "🟢 Today's Payments",
    statTotalDue: "Total Due",
    statCustomers: "Total Customers",
    emptyCreditToday: "No credit given today",
    emptyPaymentsToday: "No payments received today",

    // Quick Voice & Test Prompts
    quickVoiceTitle: "Quick Voice / Test Prompts",
    quickVoiceSub: "Tap any prompt or press the mic button to speak in English, Hindi, Kannada, Tamil, or Telugu.",
    manualEntry: "Manual Entry",
    selectCustomer: "Select Customer...",
    amountPlaceholder: "Amount ₹",
    creditOption: "Credit (Udhaar)",
    paymentOption: "Payment (Jama)",
    noteOptional: "Note (optional)",
    saveBtn: "Save",
    recentActivity: "Recent Activity",
    noTransactionsYet: "No transactions yet. Use voice or manual entry to add your first khata record.",

    // AI Assistant HUD (JarvisHud)
    hudReady: "Ready · Tap to speak or type command",
    hudProcessing: "Calculating khata... · Processing",
    hudSpeaking: "Assistant speaking...",
    hudAwaitingName: "Speak customer name",
    hudConfirm: "Confirm: Say 'Yes' or 'No'",
    hudListeningLive: "Listening Live... · Speak now",
    hudListening: "Listening... Speak now",
    hudSubtitleLive: "Real-Time Voice Assistant (Gemini 3.8 Live)",
    hudSubtitlePtt: "Speak naturally, auto-records when you pause",
    liveAiOn: "Live AI: ON",
    liveAiOff: "Push-to-Talk",
    confirmRuleOn: "Confirm Rule: ON",
    confirmRuleOff: "Confirm Rule: OFF",
    yourVoiceLabel: "YOUR VOICE",
    aiAssistantLabel: "KIRANA ASSISTANT · AI",
    listenBtn: "Listen",
    listenHint: 'Listening — e.g. "Ramesh 340 credit" or "Suresh paid 200"...',
    idleHint: "Tap mic button and speak — your words appear here instantly.",
    aiIdleHint: "Tap mic and speak — assistant calculates and replies immediately.",
    newCustomerPrompt: "New customer: Speak or type name below:",
    confirmPrompt: "Confirm: Say 'Yes, save' or tap button:",
    yesSave: "Yes, Save",
    cancel: "Cancel",
    whichCustomer: "Which customer's account?",
    inputPlaceholder: "Speak or type command...",
    sendBtn: "Send",

    // Customer & Ledger Lists
    searchCustomers: "Search customers by name or phone...",
    addCustomer: "Add Customer",
    filterAll: "All",
    filterDue: "Due Only",
    filterSettled: "Settled",
    whatsappStatement: "WhatsApp Statement",
  },

  "hi-IN": {
    // Navigation & App Shell
    navDashboard: "डैशबोर्ड (खाता)",
    navCustomers: "ग्राहक",
    navLedgers: "खाते",
    navSettings: "सेटिंग्स",
    logout: "लॉग आउट",
    storeSubtitle: "वॉयस खाता · किराना एआई डिजिटल मुनीम",
    viewAll: "सभी देखें",

    // Stat Cards
    statCreditToday: "🔴 आज का उधार · Credit Today",
    statPaymentsToday: "🟢 आज का जमा · Payments Today",
    statTotalDue: "कुल बाज़ार बाकी · Total Due",
    statCustomers: "कुल ग्राहक · Customers",
    emptyCreditToday: "आज कोई उधार नहीं",
    emptyPaymentsToday: "आज कोई जमा नहीं",

    // Quick Voice & Test Prompts
    quickVoiceTitle: "वॉइस टेस्ट प्रॉम्प्ट्स · Quick Voice Prompts",
    quickVoiceSub: "किसी भी प्रॉम्प्ट पर टैप करें या माइक दबाकर बोलें (हिन्दी, ಕನ್ನಡ, தமிழ், తెలుగు, English)।",
    manualEntry: "मैनुअल एंट्री",
    selectCustomer: "ग्राहक चुनें...",
    amountPlaceholder: "राशि ₹",
    creditOption: "उधार (Credit)",
    paymentOption: "जमा (Payment)",
    noteOptional: "विवरण (वैकल्पिक)",
    saveBtn: "सेव करें",
    recentActivity: "हालिया लेन-देन",
    noTransactionsYet: "अभी कोई लेन-देन नहीं है। माइक दबाकर पहली एंट्री करें।",

    // AI Assistant HUD (JarvisHud)
    hudReady: "तैयार · बोलकर एंट्री करें (Tap to Speak)",
    hudProcessing: "हिसाब जोड़ रहा हूँ... · Processing",
    hudSpeaking: "सहायक बोल रहा है · Assistant Speaking",
    hudAwaitingName: "ग्राहक का नाम बोलें · Awaiting Name",
    hudConfirm: "पुष्टि करें: 'हाँ' या 'ना' बोलें · Confirm",
    hudListeningLive: "लाइव सुन रहा हूँ... · Listening Live",
    hudListening: "बोलिए, सुन रहा हूँ... · Listening",
    hudSubtitleLive: "रीयल-टाइम आवाज़ बातचीत (Gemini 3.8 Live)",
    hudSubtitlePtt: "आराम से बोलें, रुकने पर अपने आप दर्ज होगा (Hands-Free Voice)",
    liveAiOn: "Live AI: चालू",
    liveAiOff: "Push-to-Talk",
    confirmRuleOn: "पुष्टि नियम: चालू (ON)",
    confirmRuleOff: "पुष्टि नियम: बंद (OFF)",
    yourVoiceLabel: "आपकी आवाज़ · YOU",
    aiAssistantLabel: "किराना सहायक · AI",
    listenBtn: "सुनें",
    listenHint: 'सुन रहा हूँ — बोलें जैसे "सुरेश का 340 उधार" या "रमेश ने 200 दिया"...',
    idleHint: "माइक बटन दबाएं और बोलें — यहाँ आपकी बात तुरंत दिखेगी।",
    aiIdleHint: "माइक दबाकर बोलें — सहायक हिसाब जोड़कर तुरंत जवाब देगा।",
    newCustomerPrompt: "नया ग्राहक: नाम बोलें या नीचे लिखें:",
    confirmPrompt: "पुष्टि: “हाँ, सेव करो” बोलें या बटन दबाएं:",
    yesSave: "हाँ, सेव करें (Save)",
    cancel: "रद्द करें (Cancel)",
    whichCustomer: "कौन से ग्राहक का हिसाब?",
    inputPlaceholder: "बोलें या कमांड टाइप करें...",
    sendBtn: "भेजें",

    // Customer & Ledger Lists
    searchCustomers: "नाम या फ़ोन नंबर से खोजें...",
    addCustomer: "नया ग्राहक जोड़ें",
    filterAll: "सभी",
    filterDue: "बाकी वाले",
    filterSettled: "चुका दिए",
    whatsappStatement: "व्हाट्सएप स्टेटमेंट",
  },

  "kn-IN": {
    // Navigation & App Shell
    navDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (ಖಾತೆ)",
    navCustomers: "ಗ್ರಾಹಕರು",
    navLedgers: "ಖಾತೆ ಲೆಡ್ಜರ್",
    navSettings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    logout: "ಲಾಗ್‌ಔಟ್",
    storeSubtitle: "ವಾಯ್ಸ್ ಖಾತೆ · ಕಿರಾಣಿ ಎಐ ಡಿಜಿಟಲ್ ಲೆಕ್ಕಿಗ",
    viewAll: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",

    // Stat Cards
    statCreditToday: "🔴 ಇಂದಿನ ಉದ್ಧಾರ · Credit Today",
    statPaymentsToday: "🟢 ಇಂದಿನ ಜಮಾ · Payments Today",
    statTotalDue: "ಒಟ್ಟು ಬಾಕಿ · Total Due",
    statCustomers: "ಒಟ್ಟು ಗ್ರಾಹಕರು · Customers",
    emptyCreditToday: "ಇಂದು ಯಾವುದೇ ಸಾಲ ಇಲ್ಲ",
    emptyPaymentsToday: "ಇಂದು ಯಾವುದೇ ಜಮಾ ಇಲ್ಲ",

    // Quick Voice & Test Prompts
    quickVoiceTitle: "ಧ್ವನಿ ಪರೀಕ್ಷಾ ವಾಕ್ಯಗಳು · Voice Prompts",
    quickVoiceSub: "ಯಾವುದೇ ವಾಕ್ಯದ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಹಿಡಿದು ಕನ್ನಡ, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ.",
    manualEntry: "ಮ್ಯಾನುಯಲ್ ಎಂಟ್ರಿ",
    selectCustomer: "ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ...",
    amountPlaceholder: "ಮೊತ್ತ ₹",
    creditOption: "ಉದ್ಧಾರ (Credit)",
    paymentOption: "ಜಮಾ (Payment)",
    noteOptional: "ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)",
    saveBtn: "ಉಳಿಸಿ",
    recentActivity: "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
    noTransactionsYet: "ಇನ್ನೂ ಯಾವುದೇ ವಹಿವಾಟು ನಡೆದಿಲ್ಲ. ಧ್ವನಿ ಮೂಲಕ ಮೊದಲ ಖಾತೆ ದಾಖಲಿಸಿ.",

    // AI Assistant HUD (JarvisHud)
    hudReady: "ಸಿದ್ಧವಾಗಿದೆ · ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ (Tap to Speak)",
    hudProcessing: "ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತಿದೆ... · Processing",
    hudSpeaking: "ಸಹಾಯಕ ಮಾತನಾಡುತ್ತಿದ್ದಾನೆ · Speaking",
    hudAwaitingName: "ಗ್ರಾಹಕರ ಹೆಸರು ಹೇಳಿ · Awaiting Name",
    hudConfirm: "ದೃಢೀಕರಿಸಿ: 'ಹೌದು' ಅಥವಾ 'ಇಲ್ಲ' ಎನ್ನಿ · Confirm",
    hudListeningLive: "ಲೈವ್ ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... · Listening Live",
    hudListening: "ಮಾತನಾಡಿ, ಕೇಳುತ್ತಿದ್ದೇನೆ... · Listening",
    hudSubtitleLive: "ನೈಜ-ಸಮಯದ ಧ್ವನಿ ಸಹಾಯಕ (Gemini 3.8 Live)",
    hudSubtitlePtt: "ಆರಾಮವಾಗಿ ಮಾತನಾಡಿ, ನಿಲ್ಲಿಸಿದಾಗ ತಾನಾಗಿಯೇ ದಾಖಲಾಗುತ್ತದೆ",
    liveAiOn: "Live AI: ಆನ್",
    liveAiOff: "Push-to-Talk",
    confirmRuleOn: "ದೃಢೀಕರಣ ನಿಯಮ: ಆನ್",
    confirmRuleOff: "ದೃಢೀಕರಣ ನಿಯಮ: ಆಫ್",
    yourVoiceLabel: "ನಿಮ್ಮ ಧ್ವನಿ · YOU",
    aiAssistantLabel: "ಕಿರಾಣಿ ಸಹಾಯಕ · AI",
    listenBtn: "ಕೇಳಿ",
    listenHint: 'ಕೇಳುತ್ತಿದ್ದೇನೆ — ಉದಾ. "ರಮೇಶ್ 340 ಸಾಲ" ಅಥವಾ "ಸುರೇಶ್ 200 ಕೊಟ್ಟಿದ್ದಾರೆ"...',
    idleHint: "ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ — ನಿಮ್ಮ ಮಾತು ಇಲ್ಲಿ ತಕ್ಷಣ ಕಾಣಿಸುತ್ತದೆ.",
    aiIdleHint: "ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ — ಸಹಾಯಕ ತಕ್ಷಣ ಲೆಕ್ಕ ಹಾಕಿ ಉತ್ತರಿಸುತ್ತಾನೆ.",
    newCustomerPrompt: "ಹೊಸ ಗ್ರಾಹಕ: ಹೆಸರು ಹೇಳಿ ಅಥವಾ ಕೆಳಗೆ ಬರೆಯಿರಿ:",
    confirmPrompt: "ದೃಢೀಕರಣ: 'ಹೌದು, ಉಳಿಸಿ' ಎನ್ನಿ ಅಥವಾ ಬಟನ್ ಒತ್ತಿ:",
    yesSave: "ಹೌದು, ಉಳಿಸಿ (Save)",
    cancel: "ರದ್ದುಮಾಡಿ (Cancel)",
    whichCustomer: "ಯಾವ ಗ್ರಾಹಕರ ಲೆಕ್ಕ?",
    inputPlaceholder: "ಮಾತನಾಡಿ ಅಥವಾ ಕಮಾಂಡ್ ಟೈಪ್ ಮಾಡಿ...",
    sendBtn: "ಕಳುಹಿಸಿ",

    // Customer & Ledger Lists
    searchCustomers: "ಹೆಸರು ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯಿಂದ ಹುಡುಕಿ...",
    addCustomer: "ಹೊಸ ಗ್ರಾಹಕರನ್ನು ಸೇರಿಸಿ",
    filterAll: "ಎಲ್ಲಾ",
    filterDue: "ಬಾಕಿ ಇರುವವರು",
    filterSettled: "ಪಾವತಿಸಿದವರು",
    whatsappStatement: "ವಾಟ್ಸಾಪ್ ಸ್ಟೇಟ್‌ಮೆಂಟ್",
  },

  "ta-IN": {
    // Navigation & App Shell
    navDashboard: "டாஷ்போர்டு (கணக்கு)",
    navCustomers: "வாடிக்கையாளர்கள்",
    navLedgers: "பேரேடு",
    navSettings: "அமைப்புகள்",
    logout: "வெளியேறு",
    storeSubtitle: "வாய்ஸ் கணக்கு · கிரானா ஏஐ டிஜிட்டல் கணக்காளர்",
    viewAll: "அனைத்தையும் பார்",

    // Stat Cards
    statCreditToday: "🔴 இன்றைய கடன் · Credit Today",
    statPaymentsToday: "🟢 இன்றைய வரவு · Payments Today",
    statTotalDue: "மொத்த பாக்கி · Total Due",
    statCustomers: "மொத்த வாடிக்கையாளர்கள் · Customers",
    emptyCreditToday: "இன்று கடன் எதுவும் இல்லை",
    emptyPaymentsToday: "இன்று வரவு எதுவும் இல்லை",

    // Quick Voice & Test Prompts
    quickVoiceTitle: "குரல் தேர்வு வாக்கியங்கள் · Voice Prompts",
    quickVoiceSub: "எந்த வாக்கியத்தையும் தட்டவும் அல்லது மைக் அழுத்திப் பேசவும்.",
    manualEntry: "நேரடி பதிவு",
    selectCustomer: "வாடிக்கையாளரைத் தேர்வுசெய்...",
    amountPlaceholder: "தொகை ₹",
    creditOption: "கடன் (Credit)",
    paymentOption: "வரவு (Payment)",
    noteOptional: "குறிப்பு (விருப்பமானது)",
    saveBtn: "சேமிக்கவும்",
    recentActivity: "சமீபத்திய பரிவர்த்தனைகள்",
    noTransactionsYet: "இன்னும் பரிவர்த்தனைகள் இல்லை.",

    // AI Assistant HUD (JarvisHud)
    hudReady: "தயார் · பேச தட்டவும் (Tap to Speak)",
    hudProcessing: "கணக்கிடுகிறது... · Processing",
    hudSpeaking: "உதவியாளர் பேசுகிறார் · Speaking",
    hudAwaitingName: "வாடிக்கையாளர் பெயர் கூறவும் · Name",
    hudConfirm: "உறுதிப்படுத்தவும்: 'ஆம்' அல்லது 'இல்லை' · Confirm",
    hudListeningLive: "நேரலையாகக் கேட்கிறது... · Listening Live",
    hudListening: "பேசுங்கள், கேட்கிறேன்... · Listening",
    hudSubtitleLive: "நேரலை குரல் உரையாடல் (Gemini 3.8 Live)",
    hudSubtitlePtt: "இயல்பாகப் பேசுங்கள், நிறுத்தியதும் தானாகப் பதிவாகும்",
    liveAiOn: "Live AI: ஆன்",
    liveAiOff: "Push-to-Talk",
    confirmRuleOn: "உறுதி விதி: ஆன்",
    confirmRuleOff: "உறுதி விதி: ஆஃப்",
    yourVoiceLabel: "உங்கள் குரல் · YOU",
    aiAssistantLabel: "கிரானா உதவியாளர் · AI",
    listenBtn: "கேட்க",
    listenHint: 'கேட்கிறது — எ.கா "ரமேஷ் 340 கடன்" அல்லது "சுரேஷ் 200 கொடுத்தார்"...',
    idleHint: "மைக்கை அழுத்திப் பேசுங்கள் — உங்கள் பேச்சு உடனே தெரியும்.",
    aiIdleHint: "மைக்கை அழுத்திப் பேசுங்கள் — உதவியாளர் உடனே பதிலளிப்பார்.",
    newCustomerPrompt: "புதிய வாடிக்கையாளர்: பெயர் சொல்லவும்:",
    confirmPrompt: "உறுதிப்படுத்தவும்: 'ஆம், சேமி' அல்லது பொத்தானை அழுத்தவும்:",
    yesSave: "ஆம், சேமி (Save)",
    cancel: "ரத்து செய் (Cancel)",
    whichCustomer: "எந்த வாடிக்கையாளரின் கணக்கு?",
    inputPlaceholder: "பேசுங்கள் அல்லது தட்டச்சு செய்க...",
    sendBtn: "அனுப்பு",

    // Customer & Ledger Lists
    searchCustomers: "பெயர் அல்லது தொலைபேசி மூலம் தேடுங்கள்...",
    addCustomer: "வாடிக்கையாளர் சேர்க்க",
    filterAll: "அனைத்தும்",
    filterDue: "பாக்கி உள்ளவர்கள்",
    filterSettled: "முடிந்தவை",
    whatsappStatement: "வாட்ஸ்அப் அறிக்கை",
  },

  "te-IN": {
    // Navigation & App Shell
    navDashboard: "డాష్‌బోర్డ్ (ఖాతా)",
    navCustomers: "కస్టమర్లు",
    navLedgers: "లెడ్జర్లు",
    navSettings: "సెట్టింగ్‌లు",
    logout: "లాగ్ అవుట్",
    storeSubtitle: "వాయిస్ ఖాతా · కిరాణా ఏఐ డిజిటల్ అకౌంటెంట్",
    viewAll: "అన్నీ చూడండి",

    // Stat Cards
    statCreditToday: "🔴 నేటి అప్పు · Credit Today",
    statPaymentsToday: "🟢 నేటి చెల్లింపులు · Payments Today",
    statTotalDue: "మొత్తం బాకీ · Total Due",
    statCustomers: "మొత్తం కస్టమర్లు · Customers",
    emptyCreditToday: "ఈరోజు ఎలాంటి అప్పు లేదు",
    emptyPaymentsToday: "ఈరోజు ఎలాంటి చెల్లింపు లేదు",

    // Quick Voice & Test Prompts
    quickVoiceTitle: "వాయిస్ ప్రాంప్ట్‌లు · Voice Prompts",
    quickVoiceSub: "ఏదైనా ప్రాంప్ట్‌పై నొక్కండి లేదా మైక్ పట్టుకుని మాట్లాడండి.",
    manualEntry: "మాన్యువల్ ఎంట్రీ",
    selectCustomer: "కస్టమర్‌ను ఎంచుకోండి...",
    amountPlaceholder: "మొత్తం ₹",
    creditOption: "అప్పు (Credit)",
    paymentOption: "జమ (Payment)",
    noteOptional: "గమనిక (ఐచ్ఛికం)",
    saveBtn: "సేవ్ చేయండి",
    recentActivity: "ఇటీవలి లావాదేవీలు",
    noTransactionsYet: "ఇంకా లావాదేవీలు లేవు.",

    // AI Assistant HUD (JarvisHud)
    hudReady: "సిద్ధంగా ఉంది · మాట్లాడటానికి నొక్కండి (Tap to Speak)",
    hudProcessing: "లెక్కిస్తోంది... · Processing",
    hudSpeaking: "సహాయకుడు మాట్లాడుతున్నాడు · Speaking",
    hudAwaitingName: "కస్టమర్ పేరు చెప్పండి · Name",
    hudConfirm: "నిర్ధారించండి: 'అవును' లేదా 'వద్దు' · Confirm",
    hudListeningLive: "లైవ్ వింటోంది... · Listening Live",
    hudListening: "మాట్లాడండి, వింటున్నాను... · Listening",
    hudSubtitleLive: "రియల్ టైమ్ వాయిస్ అసిస్టెంట్ (Gemini 3.8 Live)",
    hudSubtitlePtt: "స్వేచ్ఛగా మాట్లాడండి, ఆగినప్పుడు ఆటోమేటిక్‌గా రికార్డ్ అవుతుంది",
    liveAiOn: "Live AI: ఆన్",
    liveAiOff: "Push-to-Talk",
    confirmRuleOn: "నిర్ధారణ నియమం: ఆన్",
    confirmRuleOff: "నిర్ధారణ నియమం: ఆఫ్",
    yourVoiceLabel: "మీ వాయిస్ · YOU",
    aiAssistantLabel: "కిరాణా సహాయకుడు · AI",
    listenBtn: "వినండి",
    listenHint: 'వింటున్నాను — ఉదా. "రమేష్ 340 అప్పు" లేదా "సురేష్ 200 ఇచ్చాడు"...',
    idleHint: "మైక్ నొక్కి మాట్లాడండి — మీ మాటలు వెంటనే కనిపిస్తాయి.",
    aiIdleHint: "మైక్ నొక్కి మాట్లాడండి — సహాయకుడు వెంటనే బదులిస్తాడు.",
    newCustomerPrompt: "కొత్త కస్టమర్: పేరు చెప్పండి లేదా క్రింద రాయండి:",
    confirmPrompt: "నిర్ధారణ: 'అవును, సేవ్ చేయి' లేదా బటన్ నొక్కండి:",
    yesSave: "అవును, సేవ్ చేయండి (Save)",
    cancel: "రద్దు చేయండి (Cancel)",
    whichCustomer: "ఏ కస్టమర్ ఖాతా?",
    inputPlaceholder: "మాట్లాడండి లేదా టైప్ చేయండి...",
    sendBtn: "పంపు",

    // Customer & Ledger Lists
    searchCustomers: "పేరు లేదా ఫోన్ నంబర్ ద్వారా శోధించండి...",
    addCustomer: "కొత్త కస్టమర్‌ని జోడించండి",
    filterAll: "అన్నీ",
    filterDue: "బాకీ ఉన్నవి",
    filterSettled: "చెల్లించినవి",
    whatsappStatement: "వాట్సాప్ స్టేట్‌మెంట్",
  },
};

export function t(key, lang = "hi-IN") {
  const code = lang || "hi-IN";
  const dict = TRANSLATIONS[code] || TRANSLATIONS["en-IN"] || TRANSLATIONS["hi-IN"];
  return dict?.[key] ?? TRANSLATIONS["en-IN"]?.[key] ?? TRANSLATIONS["hi-IN"]?.[key] ?? key;
}

export function getDemoPhrases(lang = "hi-IN") {
  switch (lang) {
    case "en-IN":
      return [
        "Ramesh credit 340, paid 200 yesterday",
        "Suresh credit three hundred forty rupees",
        "No, 430",
        "Ramesh 300 credit",
        "Ramesh Gowda",
        "How much credit given today?",
        "Tell me Suresh's total balance",
        "Who owes the highest balance?",
      ];
    case "kn-IN":
      return [
        "ರಮೇಶ್ 340 ಸಾಲ, ನಿನ್ನೆ 200 ಕೊಟ್ಟಿದ್ರು",
        "ಸುರೇಶ್ ಮುನ್ನೂರ ನಲವತ್ತು ಉದ್ಧಾರ",
        "ಇಲ್ಲ, 430",
        "ರಮೇಶ್ ಗೌಡ",
        "ಇವತ್ತು ಎಷ್ಟು ಸಾಲ ಆಗಿದೆ?",
        "ಸುರೇಶ್ ಒಟ್ಟು ಲೆಕ್ಕ ಎಷ್ಟು?",
        "ಯಾರ ಬಳಿ ಹೆಚ್ಚು ಸಾಲ ಬಾಕಿ ಇದೆ?",
      ];
    case "ta-IN":
      return [
        "ரமேஷ் 340 கடன், நேற்று 200 கொடுத்தார்",
        "சுரேஷ் 340 ரூபாய் கடன்",
        "இல்லை, 430",
        "ரமேஷ் கவுடா",
        "இன்று எவ்வளவு கடன் கொடுக்கப்பட்டது?",
        "சுரேஷ் மொத்த பாக்கி சொல்",
        "யாருக்கு அதிக பாக்கி உள்ளது?",
      ];
    case "te-IN":
      return [
        "రమేష్ 340 అప్పు, నిన్న 200 ఇచ్చాడు",
        "సురేష్ 340 రూపాయల అప్పు",
        "కాదు, 430",
        "రమేష్ గౌడ",
        "ఈరోజు ఎంత అప్పు ఇచ్చాం?",
        "సురేష్ మొత్తం బాకీ ఎంత?",
        "ఎవరి దగ్గర ఎక్కువ అప్పు ఉంది?",
      ];
    case "hi-IN":
    default:
      return [
        "Ramesh ka 340 udhaar, kal 200 diya tha",
        "Suresh ka teen sau chaalis udhaar",
        "Nahi, 430",
        "Ramesh ka 300 udhaar",
        "Ramesh Gowda",
        "Aaj kitna udhaar gaya?",
        "Suresh ka total batao",
        "Sabse zyada udhaar kiske paas hai?",
      ];
  }
}
