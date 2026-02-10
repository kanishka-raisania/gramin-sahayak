// Mock data and API functions for Gramin Sahayak
// In production, these would be API calls to the Express backend

export interface NewsItem {
  id: number;
  titleKey: string;
  descKey: string;
  category: "Farmer" | "Worker" | "General";
  imageUrl: string;
}

// Data from /backend/data/news.json equivalent
// Each item uses translation keys for multi-language support
export const newsData: NewsItem[] = [
  {
    id: 1,
    titleKey: "news.pmKisan.title",
    descKey: "news.pmKisan.desc",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    titleKey: "news.minWage.title",
    descKey: "news.minWage.desc",
    category: "Worker",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    titleKey: "news.cropIns.title",
    descKey: "news.cropIns.desc",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    titleKey: "news.ration.title",
    descKey: "news.ration.desc",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    titleKey: "news.mgnrega.title",
    descKey: "news.mgnrega.desc",
    category: "Worker",
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    titleKey: "news.soil.title",
    descKey: "news.soil.desc",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop",
  },
];

// GET /api/news
export function fetchNews(): NewsItem[] {
  return newsData;
}

// POST /api/chat — simple keyword-based chatbot
export function getChatResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("wage") || lower.includes("payment") || lower.includes("salary") || lower.includes("मजदूरी")) {
    return "💰 As per the latest government notification, the minimum daily wage for unskilled workers is ₹382. If your employer is paying less, you can file a complaint at the Labour Commissioner's office or call helpline 14434.";
  }

  if (lower.includes("crop") || lower.includes("farming") || lower.includes("kisan") || lower.includes("kheti") || lower.includes("खेती")) {
    return "🌾 For crop-related help: PM-KISAN provides ₹6,000/year. For crop insurance, visit your nearest Common Service Centre (CSC). For soil testing, contact your block-level agriculture officer.";
  }

  if (lower.includes("ration") || lower.includes("food") || lower.includes("राशन")) {
    return "🍚 Under the National Food Security Act, eligible families get 5kg of foodgrains per person per month at ₹1-3/kg. Visit your nearest PDS (ration) shop with your ration card.";
  }

  if (lower.includes("health") || lower.includes("hospital") || lower.includes("doctor") || lower.includes("स्वास्थ्य")) {
    return "🏥 Under Ayushman Bharat, eligible families get free treatment up to ₹5 lakh/year. Visit your nearest government hospital or Health & Wellness Centre for more information.";
  }

  if (lower.includes("school") || lower.includes("education") || lower.includes("padhai") || lower.includes("शिक्षा")) {
    return "📚 Under the Right to Education Act, education is free for children aged 6-14. Contact your nearest government school for admission. Mid-day meals are also provided free.";
  }

  // Generic help message
  // ML integration here later
  return "🙏 Namaste! I can help you with information about wages, farming schemes, ration, health services, and education. Please ask me about any of these topics.";
}

// POST /api/verify — fake news checker
// ML integration here later — will use trained NLP model
export function verifyNews(text: string): { status: string; likely: "false" | "true"; explanation: string } {
  return {
    status: "Likely False",
    likely: "false",
    explanation:
      "Our analysis suggests this message contains patterns commonly found in misinformation. Always verify news from official government sources before sharing.",
  };
}
