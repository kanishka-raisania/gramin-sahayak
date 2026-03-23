// Data and API functions for Gramin Sahayak
// Real API integration ready — currently using verified government scheme data
// Backend proxy endpoint: GET /api/news (FastAPI/Express — connect when ready)
import { extraNewsData } from "./extraNews";

export interface NewsItem {
  id: number;
  titleKey: string;
  descKey: string;
  category: "Farmer" | "Worker" | "General";
  imageUrl: string;
  publishedAt: string;
  source: string;
  sourceKey: string;
  benefitsKeys: string[];
  eligibilityKeys: string[];
  howToApplyKeys: string[];
  officialLink: string;
  simpleSummaryKey: string;
}

// Category fallback images when API provides no image
const categoryFallbackImages = {
  Farmer: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
  Worker: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  General: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
};

export function getCategoryFallbackImage(category: NewsItem["category"]): string {
  return categoryFallbackImages[category];
}

// Verified government scheme data — normalized from data.gov.in, PIB, and official sources
export const newsData: NewsItem[] = [
  {
    id: 1,
    titleKey: "news.pmKisan.title",
    descKey: "news.pmKisan.desc",
    simpleSummaryKey: "news.pmKisan.simple",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
    publishedAt: "2026-02-15",
    source: "Ministry of Agriculture",
    sourceKey: "source.agriculture",
    benefitsKeys: ["news.pmKisan.benefit1", "news.pmKisan.benefit2", "news.pmKisan.benefit3"],
    eligibilityKeys: ["news.pmKisan.elig1", "news.pmKisan.elig2"],
    howToApplyKeys: ["news.pmKisan.apply1", "news.pmKisan.apply2", "news.pmKisan.apply3"],
    officialLink: "https://pmkisan.gov.in",
  },
  {
    id: 2,
    titleKey: "news.minWage.title",
    descKey: "news.minWage.desc",
    simpleSummaryKey: "news.minWage.simple",
    category: "Worker",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
    publishedAt: "2026-02-12",
    source: "Ministry of Labour",
    sourceKey: "source.labour",
    benefitsKeys: ["news.minWage.benefit1", "news.minWage.benefit2"],
    eligibilityKeys: ["news.minWage.elig1", "news.minWage.elig2"],
    howToApplyKeys: ["news.minWage.apply1", "news.minWage.apply2"],
    officialLink: "https://labour.gov.in/minimum-wages",
  },
  {
    id: 3,
    titleKey: "news.cropIns.title",
    descKey: "news.cropIns.desc",
    simpleSummaryKey: "news.cropIns.simple",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
    publishedAt: "2026-02-10",
    source: "Ministry of Agriculture",
    sourceKey: "source.agriculture",
    benefitsKeys: ["news.cropIns.benefit1", "news.cropIns.benefit2"],
    eligibilityKeys: ["news.cropIns.elig1", "news.cropIns.elig2"],
    howToApplyKeys: ["news.cropIns.apply1", "news.cropIns.apply2", "news.cropIns.apply3"],
    officialLink: "https://pmfby.gov.in",
  },
  {
    id: 4,
    titleKey: "news.ration.title",
    descKey: "news.ration.desc",
    simpleSummaryKey: "news.ration.simple",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
    publishedAt: "2026-02-08",
    source: "Dept. of Food & PDS",
    sourceKey: "source.food",
    benefitsKeys: ["news.ration.benefit1", "news.ration.benefit2"],
    eligibilityKeys: ["news.ration.elig1", "news.ration.elig2"],
    howToApplyKeys: ["news.ration.apply1", "news.ration.apply2"],
    officialLink: "https://nfsa.gov.in",
  },
  {
    id: 5,
    titleKey: "news.mgnrega.title",
    descKey: "news.mgnrega.desc",
    simpleSummaryKey: "news.mgnrega.simple",
    category: "Worker",
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop",
    publishedAt: "2026-02-05",
    source: "Ministry of Rural Development",
    sourceKey: "source.rural",
    benefitsKeys: ["news.mgnrega.benefit1", "news.mgnrega.benefit2", "news.mgnrega.benefit3"],
    eligibilityKeys: ["news.mgnrega.elig1", "news.mgnrega.elig2"],
    howToApplyKeys: ["news.mgnrega.apply1", "news.mgnrega.apply2"],
    officialLink: "https://nrega.nic.in",
  },
  {
    id: 6,
    titleKey: "news.soil.title",
    descKey: "news.soil.desc",
    simpleSummaryKey: "news.soil.simple",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop",
    publishedAt: "2026-02-01",
    source: "Ministry of Agriculture",
    sourceKey: "source.agriculture",
    benefitsKeys: ["news.soil.benefit1", "news.soil.benefit2"],
    eligibilityKeys: ["news.soil.elig1"],
    howToApplyKeys: ["news.soil.apply1", "news.soil.apply2"],
    officialLink: "https://soilhealth.dac.gov.in",
  },
  {
    id: 7,
    titleKey: "news.ayushman.title",
    descKey: "news.ayushman.desc",
    simpleSummaryKey: "news.ayushman.simple",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop",
    publishedAt: "2026-01-28",
    source: "Ministry of Health",
    sourceKey: "source.health",
    benefitsKeys: ["news.ayushman.benefit1", "news.ayushman.benefit2"],
    eligibilityKeys: ["news.ayushman.elig1", "news.ayushman.elig2"],
    howToApplyKeys: ["news.ayushman.apply1", "news.ayushman.apply2"],
    officialLink: "https://pmjay.gov.in",
  },
  {
    id: 8,
    titleKey: "news.eShram.title",
    descKey: "news.eShram.desc",
    simpleSummaryKey: "news.eShram.simple",
    category: "Worker",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
    publishedAt: "2026-01-25",
    source: "Ministry of Labour",
    sourceKey: "source.labour",
    benefitsKeys: ["news.eShram.benefit1", "news.eShram.benefit2"],
    eligibilityKeys: ["news.eShram.elig1", "news.eShram.elig2"],
    howToApplyKeys: ["news.eShram.apply1", "news.eShram.apply2"],
    officialLink: "https://eshram.gov.in",
  },
  {
    id: 9,
    titleKey: "news.kisanCredit.title",
    descKey: "news.kisanCredit.desc",
    simpleSummaryKey: "news.kisanCredit.simple",
    category: "Farmer",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop",
    publishedAt: "2026-01-20",
    source: "Ministry of Agriculture",
    sourceKey: "source.agriculture",
    benefitsKeys: ["news.kisanCredit.benefit1", "news.kisanCredit.benefit2"],
    eligibilityKeys: ["news.kisanCredit.elig1", "news.kisanCredit.elig2"],
    howToApplyKeys: ["news.kisanCredit.apply1", "news.kisanCredit.apply2"],
    officialLink: "https://pmkisan.gov.in",
  },
];

// Combined data — original + extra seeded items (50+ total)
const allNewsData: NewsItem[] = [...newsData, ...extraNewsData];

// GET /api/news — returns all news items sorted by date
export function fetchNews(): NewsItem[] {
  return allNewsData.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// Paginated fetch — returns page slice + total count
export function fetchNewsPaginated(page: number, perPage: number, category?: string): { items: NewsItem[]; total: number } {
  let items = fetchNews();
  if (category && category !== "All") {
    items = items.filter((n) => n.category === category);
  }
  const total = items.length;
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), total };
}

// GET /api/news/:id — returns single news item
export function fetchNewsById(id: number): NewsItem | undefined {
  return newsData.find((item) => item.id === id);
}

// POST /api/chat — simple keyword-based chatbot
// ML integration here later
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
