/**
 * fetch-bulletins — RSS fetcher + auto-seeder for bulletin_items
 * Fetches from PIB, Agriculture, Labour, Rural Development RSS feeds
 * Deduplicates by rss_guid or title+publish_date
 * Seeds verified scheme data if total < 50
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Strip HTML tags from text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}

/** Categorize based on keywords */
function categorize(title: string, desc: string): "Farmer" | "Worker" | "General" {
  const text = (title + " " + desc).toLowerCase();
  if (text.match(/farm|kisan|crop|agri|soil|seed|irrigation|fertil|harvest|wheat|rice|paddy|msp/)) return "Farmer";
  if (text.match(/wage|labour|labor|worker|employ|mgnrega|shram|minimum wage|factory|construct/)) return "Worker";
  return "General";
}

/** Detect source ministry from feed URL or content */
function detectSource(feedUrl: string, text: string): string {
  if (feedUrl.includes("agricoop") || text.toLowerCase().match(/agricult|kisan|farm|crop/)) return "Ministry of Agriculture";
  if (feedUrl.includes("labour") || text.toLowerCase().match(/labour|labor|wage|worker/)) return "Ministry of Labour";
  if (feedUrl.includes("rural") || text.toLowerCase().match(/rural|gram|panchayat|mgnrega/)) return "Ministry of Rural Development";
  if (text.toLowerCase().match(/health|ayushman|hospital/)) return "Ministry of Health";
  if (text.toLowerCase().match(/food|ration|pds/)) return "Dept. of Food & PDS";
  return "Press Information Bureau";
}

/** Parse RSS XML and extract items */
function parseRss(xml: string, feedUrl: string): Array<{
  title: string;
  description: string;
  category: "Farmer" | "Worker" | "General";
  source: string;
  publish_date: string;
  source_url: string;
  rss_guid: string;
}> {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const getTag = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const m = itemXml.match(r);
      return stripHtml(m ? (m[1] || m[2] || "") : "");
    };

    const title = getTag("title");
    const description = getTag("description");
    const link = getTag("link");
    const pubDate = getTag("pubDate");
    const guid = getTag("guid") || `${title}-${pubDate}`;

    if (!title) continue;

    items.push({
      title: title.slice(0, 500),
      description: description.slice(0, 2000) || title,
      category: categorize(title, description),
      source: detectSource(feedUrl, title + " " + description),
      publish_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      source_url: link || feedUrl,
      rss_guid: guid.slice(0, 500),
    });
  }
  return items;
}

/** Verified government scheme seed data */
const seedData = [
  { title: "PM Kisan Samman Nidhi – ₹6,000 Yearly for Farmers", description: "Under PM-KISAN, all land-holding farmer families receive ₹6,000 per year in three equal installments of ₹2,000 each, directly transferred to their bank accounts. Over 11 crore farmers have benefited.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pmkisan.gov.in", publish_date: "2026-02-25" },
  { title: "Daily Minimum Wage Increased to ₹382 for Unskilled Workers", description: "The central government has revised minimum wages for unskilled workers to ₹382 per day. Employers paying below this rate face legal penalties. Workers can report violations at the Labour Commissioner office or call 14434.", category: "Worker", source: "Ministry of Labour", source_url: "https://labour.gov.in", publish_date: "2026-02-24" },
  { title: "Pradhan Mantri Fasal Bima Yojana – Crop Insurance at 2% Premium", description: "Farmers can protect their crops against natural calamities, pests, and diseases. Premium is only 2% for Kharif and 1.5% for Rabi crops. Government pays the remaining premium.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pmfby.gov.in", publish_date: "2026-02-23" },
  { title: "Free Ration Under PM Garib Kalyan Anna Yojana Extended", description: "The government has extended free ration distribution. Eligible families get 5 kg foodgrains per person per month at subsidized rates through PDS shops.", category: "General", source: "Dept. of Food & PDS", source_url: "https://nfsa.gov.in", publish_date: "2026-02-22" },
  { title: "MGNREGA – 100 Days Guaranteed Employment", description: "Under MGNREGA, every rural household can get 100 days of guaranteed wage employment per year. Wages are paid directly to bank accounts within 15 days. New projects are being started in all districts.", category: "Worker", source: "Ministry of Rural Development", source_url: "https://nrega.nic.in", publish_date: "2026-02-21" },
  { title: "Free Soil Health Cards for All Farmers", description: "Get your soil tested for free and receive a Soil Health Card with personalized recommendations for fertilizers and crops suitable for your land.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://soilhealth.dac.gov.in", publish_date: "2026-02-20" },
  { title: "Ayushman Bharat – Free Treatment up to ₹5 Lakh", description: "Under Ayushman Bharat PM-JAY, eligible families get cashless treatment up to ₹5 lakh per year at any empanelled hospital. Covers surgeries, medicines, and diagnostics.", category: "General", source: "Ministry of Health", source_url: "https://pmjay.gov.in", publish_date: "2026-02-19" },
  { title: "e-Shram Card – Free Registration with ₹2 Lakh Insurance", description: "Unorganized sector workers aged 16-59 can register for free on the e-Shram portal and get ₹2 lakh accidental insurance coverage plus access to government welfare schemes.", category: "Worker", source: "Ministry of Labour", source_url: "https://eshram.gov.in", publish_date: "2026-02-18" },
  { title: "Kisan Credit Card – Farm Loans at 4% Interest", description: "Farmers can get crop loans at just 4% annual interest through Kisan Credit Card. Flexible repayment after harvest. Available for farming, fisheries, and animal husbandry.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pmkisan.gov.in", publish_date: "2026-02-17" },
  { title: "PM Awas Yojana Gramin – Pucca House for Rural Poor", description: "Eligible rural families can get financial assistance of ₹1.20 lakh (plains) to ₹1.30 lakh (hilly areas) to build pucca houses. Includes toilet construction assistance.", category: "General", source: "Ministry of Rural Development", source_url: "https://pmayg.nic.in", publish_date: "2026-02-16" },
  { title: "Pradhan Mantri Ujjwala Yojana – Free LPG Connection", description: "Women from BPL households can get a free LPG connection under Ujjwala 2.0. First refill and hot plate provided free. Over 9 crore connections distributed.", category: "General", source: "Ministry of Petroleum", source_url: "https://www.pmuy.gov.in", publish_date: "2026-02-15" },
  { title: "Skill India Mission – Free Training for Youth", description: "Free skill training programs under PMKVY for youth aged 15-45. Get industry-recognized certification, placement assistance, and stipend during training.", category: "Worker", source: "Ministry of Skill Development", source_url: "https://www.skillindia.gov.in", publish_date: "2026-02-14" },
  { title: "PM Vishwakarma Yojana – Support for Traditional Artisans", description: "Traditional artisans and craftspeople can get up to ₹3 lakh collateral-free loan at 5% interest, free toolkit, skill training, and digital marketing support.", category: "Worker", source: "Ministry of MSME", source_url: "https://pmvishwakarma.gov.in", publish_date: "2026-02-13" },
  { title: "Jal Jeevan Mission – Tap Water for Every Rural Home", description: "Under Jal Jeevan Mission, every rural household will get tap water connection. Over 14 crore households already connected. Report issues at 1800-121-3737.", category: "General", source: "Ministry of Jal Shakti", source_url: "https://jaljeevanmission.gov.in", publish_date: "2026-02-12" },
  { title: "PM Kisan Maandhan – Pension of ₹3,000/month for Farmers", description: "Farmers aged 18-40 can enroll for pension scheme. Contribute ₹55-200/month based on age. Get ₹3,000/month pension after age 60.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://maandhan.in", publish_date: "2026-02-11" },
  { title: "Atal Pension Yojana – Guaranteed Pension for Workers", description: "Workers in unorganized sector can get guaranteed pension of ₹1,000-5,000/month after age 60. Government co-contributes 50% for eligible subscribers.", category: "Worker", source: "Ministry of Finance", source_url: "https://www.npscra.nsdl.co.in", publish_date: "2026-02-10" },
  { title: "Sukanya Samriddhi Yojana – Savings for Girl Child", description: "Open a savings account for your daughter aged 0-10 with just ₹250. Get 8.2% interest rate. Tax-free maturity. Best investment for girl's education and marriage.", category: "General", source: "Ministry of Finance", source_url: "https://www.india.gov.in", publish_date: "2026-02-09" },
  { title: "PM Mudra Yojana – Loans up to ₹10 Lakh Without Guarantee", description: "Small entrepreneurs can get collateral-free loans up to ₹10 lakh under MUDRA. Three categories: Shishu (up to ₹50,000), Kishore (₹50,000-5 lakh), Tarun (5-10 lakh).", category: "General", source: "Ministry of Finance", source_url: "https://www.mudra.org.in", publish_date: "2026-02-08" },
  { title: "National Agriculture Market (eNAM) – Sell Crops Online", description: "Farmers can sell their produce directly through eNAM portal. Get better prices by accessing buyers across India. Over 1,000 mandis connected.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://enam.gov.in", publish_date: "2026-02-07" },
  { title: "Standup India – Loans for SC/ST and Women Entrepreneurs", description: "SC/ST and women entrepreneurs can get bank loans between ₹10 lakh and ₹1 crore for setting up greenfield enterprises in manufacturing or services.", category: "General", source: "Ministry of Finance", source_url: "https://www.standupmitra.in", publish_date: "2026-02-06" },
  { title: "PM Suraksha Bima Yojana – Accident Insurance at ₹20/year", description: "Get accidental death and disability cover of ₹2 lakh for just ₹20 per year. Auto-debit from bank account. Available for all bank account holders aged 18-70.", category: "General", source: "Ministry of Finance", source_url: "https://www.jansuraksha.gov.in", publish_date: "2026-02-05" },
  { title: "PM Jeevan Jyoti Bima – Life Insurance at ₹436/year", description: "Get life insurance cover of ₹2 lakh for just ₹436 per year. Available for all bank account holders aged 18-50. Nominee gets ₹2 lakh on death.", category: "General", source: "Ministry of Finance", source_url: "https://www.jansuraksha.gov.in", publish_date: "2026-02-04" },
  { title: "National Rural Livelihood Mission – Self Help Groups", description: "Women in rural areas can form Self Help Groups (SHGs) and access revolving fund of ₹15,000, community investment fund up to ₹2.5 lakh, and bank linkage loans.", category: "General", source: "Ministry of Rural Development", source_url: "https://aajeevika.gov.in", publish_date: "2026-02-03" },
  { title: "Pradhan Mantri Gram Sadak Yojana – Rural Roads", description: "New all-weather roads being built to connect unconnected villages. Over 7.5 lakh km roads built. Check your village road status online.", category: "General", source: "Ministry of Rural Development", source_url: "https://pmgsy.nic.in", publish_date: "2026-02-02" },
  { title: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana", description: "Free skill training for rural youth aged 15-35 from poor families. Includes residential training, placement support, and post-placement tracking.", category: "Worker", source: "Ministry of Rural Development", source_url: "https://ddugky.gov.in", publish_date: "2026-02-01" },
  { title: "National Horticulture Mission – Fruit & Vegetable Farming", description: "Farmers get subsidies up to 50% for setting up fruit orchards, vegetable cultivation, floriculture, and post-harvest infrastructure.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://nhm.nic.in", publish_date: "2026-01-31" },
  { title: "PM Matsya Sampada Yojana – Fisheries Development", description: "Fishermen and fish farmers get financial assistance for aquaculture, fishing vessels, cold storage, and marketing. Up to 60% subsidy for SC/ST/women.", category: "Farmer", source: "Ministry of Fisheries", source_url: "https://pmmsy.dof.gov.in", publish_date: "2026-01-30" },
  { title: "National Beekeeping & Honey Mission", description: "Beekeepers can get assistance for purchasing bee colonies, hives, processing units, and marketing. Subsidies up to 50% of project cost.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://nbb.gov.in", publish_date: "2026-01-29" },
  { title: "Rashtriya Krishi Vikas Yojana – Agriculture Development", description: "States get flexible funding for agriculture development. Farmers benefit from new technologies, infrastructure, and capacity building programs.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://rkvy.nic.in", publish_date: "2026-01-28" },
  { title: "PM Employment Generation Programme (PMEGP)", description: "Get margin money subsidy up to 35% for setting up micro enterprises. Maximum project cost ₹50 lakh for manufacturing and ₹20 lakh for services.", category: "Worker", source: "Ministry of MSME", source_url: "https://www.kviconline.gov.in", publish_date: "2026-01-27" },
  { title: "Deendayal Antyodaya Yojana – National Urban Livelihood Mission", description: "Urban poor get support for self-employment, skill training, shelters for homeless, and street vendor support including PM SVANidhi loans.", category: "Worker", source: "Ministry of Housing", source_url: "https://nulm.gov.in", publish_date: "2026-01-26" },
  { title: "Samagra Shiksha Abhiyan – Quality Education for All", description: "Free education from pre-school to class 12. Includes free textbooks, uniforms, mid-day meals, and transport allowance for children with disabilities.", category: "General", source: "Ministry of Education", source_url: "https://samagra.education.gov.in", publish_date: "2026-01-25" },
  { title: "PM SVANidhi – Micro Loans for Street Vendors", description: "Street vendors can get working capital loan of ₹10,000 (1st), ₹20,000 (2nd), ₹50,000 (3rd tranche). 7% interest subsidy on timely repayment.", category: "Worker", source: "Ministry of Housing", source_url: "https://pmsvanidhi.mohua.gov.in", publish_date: "2026-01-24" },
  { title: "National Food Security Act – Subsidized Foodgrains", description: "75% rural and 50% urban population covered. Get rice at ₹3/kg, wheat at ₹2/kg, coarse grains at ₹1/kg through PDS shops.", category: "General", source: "Dept. of Food & PDS", source_url: "https://nfsa.gov.in", publish_date: "2026-01-23" },
  { title: "Integrated Child Development Services (ICDS)", description: "Pregnant women, lactating mothers, and children 0-6 years get supplementary nutrition, immunization, health checkups, and preschool education at Anganwadi centres.", category: "General", source: "Ministry of Women & Child", source_url: "https://icds-wcd.nic.in", publish_date: "2026-01-22" },
  { title: "Pradhan Mantri Matru Vandana Yojana – ₹5,000 for Pregnant Women", description: "Pregnant women get ₹5,000 in installments for first live birth. Compensates wage loss during pregnancy and lactation. Register at Anganwadi centre.", category: "General", source: "Ministry of Women & Child", source_url: "https://pmmvy.wcd.gov.in", publish_date: "2026-01-21" },
  { title: "National Health Mission – Free Healthcare Services", description: "Free healthcare at government health centres. Includes maternal health, child health, immunization, and treatment for communicable diseases.", category: "General", source: "Ministry of Health", source_url: "https://nhm.gov.in", publish_date: "2026-01-20" },
  { title: "Saubhagya – Free Electricity Connection", description: "All willing rural and urban poor households get free electricity connection. Includes LED bulbs, wiring, and meter. Contact your electricity board.", category: "General", source: "Ministry of Power", source_url: "https://saubhagya.gov.in", publish_date: "2026-01-19" },
  { title: "Micro Irrigation Fund – Drip and Sprinkler Systems", description: "Farmers get 55% subsidy (small/marginal) or 45% subsidy (others) for installing drip and sprinkler irrigation. Save water, increase yield.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pmksy.gov.in", publish_date: "2026-01-18" },
  { title: "Paramparagat Krishi Vikas Yojana – Organic Farming", description: "Farmers get ₹50,000 per hectare over 3 years for adopting organic farming. Includes training, certification, and marketing support.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pgsindia-ncof.gov.in", publish_date: "2026-01-17" },
  { title: "National Pension System (NPS) for Workers", description: "Save as little as ₹1,000/year for retirement pension. Government adds ₹1,000-4,000/year for low-income subscribers. Tax benefits available.", category: "Worker", source: "Ministry of Finance", source_url: "https://www.npscra.nsdl.co.in", publish_date: "2026-01-16" },
  { title: "PM KUSUM – Solar Pumps for Farmers", description: "Farmers get 60% subsidy on solar pumps up to 7.5 HP. Generate and sell surplus solar power to DISCOM. Reduce electricity costs.", category: "Farmer", source: "Ministry of New & Renewable Energy", source_url: "https://pmkusum.mnre.gov.in", publish_date: "2026-01-15" },
  { title: "National Rural Employment Guarantee – Wage Revision", description: "MGNREGA wages revised upward across states. Average wage now ₹267-382 depending on state. Payment within 15 days mandatory.", category: "Worker", source: "Ministry of Rural Development", source_url: "https://nrega.nic.in", publish_date: "2026-01-14" },
  { title: "Digital India – Free WiFi in Rural Areas", description: "BharatNet project providing broadband connectivity to all gram panchayats. Free public WiFi at village centres. Access government services online.", category: "General", source: "Ministry of Electronics", source_url: "https://www.digitalindia.gov.in", publish_date: "2026-01-13" },
  { title: "Unnat Bharat Abhiyan – Technology for Villages", description: "Leading educational institutions adopt villages to help with technology solutions for challenges in agriculture, health, education, and infrastructure.", category: "General", source: "Ministry of Education", source_url: "https://unnatbharatabhiyan.gov.in", publish_date: "2026-01-12" },
  { title: "PM Jan Dhan Yojana – Zero Balance Bank Account", description: "Open a bank account with zero balance. Get RuPay debit card, ₹2 lakh accident insurance, and ₹30,000 life cover. Over 50 crore accounts opened.", category: "General", source: "Ministry of Finance", source_url: "https://pmjdy.gov.in", publish_date: "2026-01-11" },
  { title: "National Livestock Mission – Animal Husbandry Support", description: "Poultry, dairy, goat, sheep, and pig farmers get subsidies for breed improvement, feed manufacturing, and infrastructure development.", category: "Farmer", source: "Ministry of Animal Husbandry", source_url: "https://dahd.nic.in", publish_date: "2026-01-10" },
  { title: "Building & Construction Workers Welfare Fund", description: "Registered construction workers get benefits: ₹5,000 marriage assistance, ₹6,000 maternity benefit, ₹3,000 education allowance, and pension after 60.", category: "Worker", source: "Ministry of Labour", source_url: "https://labour.gov.in", publish_date: "2026-01-09" },
  { title: "Swachh Bharat Mission Gramin – Toilet Construction", description: "Get ₹12,000 incentive for constructing household toilet. Community sanitary complexes in public places. ODF Plus villages get additional benefits.", category: "General", source: "Ministry of Jal Shakti", source_url: "https://swachhbharatmission.gov.in", publish_date: "2026-01-08" },
  { title: "National Social Assistance Programme – Pension for Elderly", description: "Elderly persons above 60 years from BPL families get monthly pension of ₹200-500. Widows and disabled persons also eligible.", category: "General", source: "Ministry of Rural Development", source_url: "https://nsap.nic.in", publish_date: "2026-01-07" },
  { title: "Per Drop More Crop – Water Saving in Agriculture", description: "Micro irrigation including drip and sprinkler systems with subsidies. Water storage and management projects. Focus on water-scarce areas.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pmksy.gov.in", publish_date: "2026-01-06" },
  { title: "Beti Bachao Beti Padhao – Girl Child Education", description: "Campaign to protect and educate girl children. Incentives for girl child birth registration, school enrollment, and completion of education.", category: "General", source: "Ministry of Women & Child", source_url: "https://wcd.nic.in", publish_date: "2026-01-05" },
  { title: "PM Garib Kalyan Rojgar Abhiyaan – Employment in Rural Areas", description: "125 days of employment for migrant workers who returned to villages. Focus on road construction, building, water conservation, and plantation.", category: "Worker", source: "Ministry of Rural Development", source_url: "https://rural.nic.in", publish_date: "2026-01-04" },
  { title: "Rashtriya Gokul Mission – Indigenous Cattle Breeding", description: "Farmers get support for breeding indigenous cattle breeds. Artificial insemination services, breed improvement, and milk production enhancement.", category: "Farmer", source: "Ministry of Animal Husbandry", source_url: "https://dahd.nic.in", publish_date: "2026-01-03" },
  { title: "Operation Greens – Farm to Fork", description: "Support for farmers growing tomato, onion, and potato (TOP). 50% subsidy on transportation and storage from production to consumption centres.", category: "Farmer", source: "Ministry of Food Processing", source_url: "https://mofpi.nic.in", publish_date: "2026-01-02" },
  { title: "PM Laghu Vyapari Maan-Dhan – Pension for Small Traders", description: "Small traders with annual turnover under ₹1.5 crore can enroll for ₹3,000 monthly pension after 60. Monthly contribution ₹55-200 based on age.", category: "Worker", source: "Ministry of Labour", source_url: "https://maandhan.in", publish_date: "2026-01-01" },
  { title: "Krishi Vigyan Kendra – Agricultural Research Support", description: "Free agricultural advisory services at district-level KVKs. Soil testing, seed selection, pest management, and modern farming techniques training.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://kvk.icar.gov.in", publish_date: "2025-12-30" },
  { title: "Pradhan Mantri Shram Yogi Maan-Dhan – Worker Pension", description: "Unorganized workers earning under ₹15,000/month get ₹3,000 monthly pension after 60. Government matches worker contribution.", category: "Worker", source: "Ministry of Labour", source_url: "https://maandhan.in", publish_date: "2025-12-29" },
  { title: "National Agriculture Insurance Scheme – Weather Based", description: "Weather-based crop insurance available for areas prone to drought, flood, hailstorm. Automatic payout based on weather data from nearby station.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://pmfby.gov.in", publish_date: "2025-12-28" },
  { title: "Indira Gandhi National Widow Pension Scheme", description: "Widows aged 40-79 from BPL families get ₹300/month. After 80 years, pension increases to ₹500/month under National Old Age Pension.", category: "General", source: "Ministry of Rural Development", source_url: "https://nsap.nic.in", publish_date: "2025-12-27" },
  { title: "Free Legal Aid – National Legal Services Authority", description: "Free legal assistance for SC/ST, women, children, persons with disabilities, and those with annual income under ₹1 lakh. Call 1800-234-5432.", category: "General", source: "Ministry of Law", source_url: "https://nalsa.gov.in", publish_date: "2025-12-26" },
  { title: "Agriculture Infrastructure Fund – ₹1 Lakh Crore", description: "Farmers, FPOs, and agri-entrepreneurs get loans at 3% interest subvention for post-harvest management infrastructure.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://agriinfra.dac.gov.in", publish_date: "2025-12-25" },
  { title: "One Nation One Ration Card – Portability of Ration", description: "Use your ration card at any PDS shop across India. Migrant workers can collect ration in any state. Link Aadhaar to ration card.", category: "General", source: "Dept. of Food & PDS", source_url: "https://nfsa.gov.in", publish_date: "2025-12-24" },
  { title: "PM CARES for Children – Support for COVID Orphans", description: "Children who lost parents to COVID get ₹10 lakh corpus on turning 23, free education, health insurance under Ayushman Bharat.", category: "General", source: "Ministry of Women & Child", source_url: "https://pmcaresforchildren.in", publish_date: "2025-12-23" },
  { title: "Pradhan Mantri Kaushal Vikas Yojana 4.0", description: "Free skill training in over 300 courses including AI, IoT, drones, electric vehicles. Industry partnerships for job placement.", category: "Worker", source: "Ministry of Skill Development", source_url: "https://pmkvyofficial.org", publish_date: "2025-12-22" },
  { title: "Sub-Mission on Agricultural Mechanization", description: "Farmers get 50% subsidy on purchase of agricultural machinery and equipment. Custom hiring centres provide machines on rent.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://farmech.dac.gov.in", publish_date: "2025-12-21" },
  { title: "National Career Service Portal – Free Job Matching", description: "Register free on NCS portal for job matching, career counseling, skill training recommendations. Over 1 crore active job seekers and 30 lakh employers.", category: "Worker", source: "Ministry of Labour", source_url: "https://www.ncs.gov.in", publish_date: "2025-12-20" },
  { title: "Animal Husbandry Infrastructure Development Fund", description: "Dairy processing, value addition, and cattle feed infrastructure. Loans at 3% interest subvention. Encourage private investment in animal husbandry.", category: "Farmer", source: "Ministry of Animal Husbandry", source_url: "https://dahd.nic.in", publish_date: "2025-12-19" },
  { title: "Mid-Day Meal Scheme – Free Lunch for School Children", description: "Free cooked meals for children in classes 1-8 in government schools. Nutritional standards maintained. Hot meals ensure attendance and nutrition.", category: "General", source: "Ministry of Education", source_url: "https://mdm.nic.in", publish_date: "2025-12-18" },
  { title: "Rashtriya Swasthya Bima Yojana – Health Insurance for BPL", description: "BPL families get smart card-based health insurance. Cashless treatment at empanelled hospitals. Coverage includes 5 family members.", category: "General", source: "Ministry of Labour", source_url: "https://labour.gov.in", publish_date: "2025-12-17" },
  { title: "Gramin Bhandaran Yojana – Rural Godown Scheme", description: "Farmers get 25% subsidy (33% for SC/ST) for constructing farm-level storage facilities. Reduce post-harvest losses. Store produce and sell when prices are better.", category: "Farmer", source: "Ministry of Agriculture", source_url: "https://agricoop.nic.in", publish_date: "2025-12-16" },
];

/** Category-specific fallback images */
const categoryImages: Record<string, string> = {
  Farmer: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
  Worker: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  General: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check current count
    const { count } = await supabase
      .from("bulletin_items")
      .select("*", { count: "exact", head: true });

    // Seed if less than 50
    if ((count ?? 0) < 50) {
      console.log(`Seeding bulletin_items (current count: ${count})`);
      const seedRows = seedData.map((item) => ({
        title: item.title,
        description: item.description,
        category: item.category,
        source: item.source,
        image_url: categoryImages[item.category] || categoryImages.General,
        publish_date: item.publish_date,
        source_url: item.source_url,
        is_expiring: false,
        rss_guid: `seed-${item.title.slice(0, 50).replace(/\s+/g, "-").toLowerCase()}`,
      }));

      const { error: seedError } = await supabase
        .from("bulletin_items")
        .upsert(seedRows, { onConflict: "rss_guid", ignoreDuplicates: true });

      if (seedError) console.error("Seed error:", seedError);
      else console.log(`Seeded ${seedRows.length} items`);
    }

    // Try RSS feeds
    const feeds = [
      "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
      "https://agricoop.nic.in/rss-feeds",
      "https://rural.nic.in/rss-feeds",
    ];

    let rssItemsInserted = 0;
    for (const feedUrl of feeds) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const resp = await fetch(feedUrl, { 
          signal: controller.signal,
          headers: { "User-Agent": "GraminSahayak/1.0" }
        });
        clearTimeout(timeout);
        
        if (!resp.ok) continue;
        const xml = await resp.text();
        const items = parseRss(xml, feedUrl);

        for (const item of items.slice(0, 20)) {
          const { error } = await supabase
            .from("bulletin_items")
            .upsert({
              ...item,
              image_url: categoryImages[item.category] || categoryImages.General,
              is_expiring: false,
              last_fetched_at: new Date().toISOString(),
            }, { onConflict: "rss_guid", ignoreDuplicates: true });

          if (!error) rssItemsInserted++;
        }
      } catch (feedErr) {
        console.warn(`RSS feed failed: ${feedUrl}`, feedErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, seeded: (count ?? 0) < 50, rssItemsInserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-bulletins error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
