export interface RegionalMetric {
  region: 'Asia Pacific' | 'EMEA' | 'Americas';
  score: number;
  growthRate: number;
  target2030: number;
}

export interface SDGGoal {
  id: number;
  title: string;
  color: string;
  globalAverage: number;
  description: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  regions: RegionalMetric[];
}

export const SDG_GOALS: SDGGoal[] = [
  {
    id: 1,
    title: "No Poverty",
    color: "#E5243B",
    globalAverage: 68.4,
    description: "End poverty in all its forms everywhere by empowering vulnerable communities.",
    keyMetricLabel: "Extreme Poverty Rate",
    keyMetricValue: "8.5%",
    regions: [
      { region: "Asia Pacific", score: 65.2, growthRate: 4.1, target2030: 85.0 },
      { region: "EMEA", score: 79.8, growthRate: 2.3, target2030: 92.0 },
      { region: "Americas", score: 72.1, growthRate: 1.8, target2030: 88.0 },
    ],
  },
  {
    id: 2,
    title: "Zero Hunger",
    color: "#DDA63A",
    globalAverage: 61.2,
    description: "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
    keyMetricLabel: "Food Insecurity Index",
    keyMetricValue: "9.2%",
    regions: [
      { region: "Asia Pacific", score: 58.9, growthRate: 3.2, target2030: 80.0 },
      { region: "EMEA", score: 71.4, growthRate: 1.1, target2030: 88.0 },
      { region: "Americas", score: 66.5, growthRate: 2.0, target2030: 84.0 },
    ],
  },
  {
    id: 3,
    title: "Good Health & Well-Being",
    color: "#4C9F38",
    globalAverage: 74.8,
    description: "Ensure healthy lives and promote well-being for all at all ages.",
    keyMetricLabel: "Universal Health Index",
    keyMetricValue: "77/100",
    regions: [
      { region: "Asia Pacific", score: 71.0, growthRate: 3.8, target2030: 90.0 },
      { region: "EMEA", score: 82.3, growthRate: 1.5, target2030: 95.0 },
      { region: "Americas", score: 76.4, growthRate: 2.1, target2030: 91.0 },
    ],
  },
  {
    id: 4,
    title: "Quality Education",
    color: "#C5192D",
    globalAverage: 71.5,
    description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities.",
    keyMetricLabel: "Global Literacy Rate",
    keyMetricValue: "86.3%",
    regions: [
      { region: "Asia Pacific", score: 69.4, growthRate: 2.9, target2030: 88.0 },
      { region: "EMEA", score: 84.1, growthRate: 0.8, target2030: 96.0 },
      { region: "Americas", score: 75.0, growthRate: 1.7, target2030: 90.0 },
    ],
  },
  {
    id: 5,
    title: "Gender Equality",
    color: "#FF3A21",
    globalAverage: 63.7,
    description: "Achieve gender equality and empower all women and girls globally.",
    keyMetricLabel: "Gender Parity Index",
    keyMetricValue: "68.2%",
    regions: [
      { region: "Asia Pacific", score: 59.1, growthRate: 2.4, target2030: 82.0 },
      { region: "EMEA", score: 73.2, growthRate: 1.9, target2030: 90.0 },
      { region: "Americas", score: 68.9, growthRate: 2.2, target2030: 86.0 },
    ],
  },
  {
    id: 6,
    title: "Clean Water & Sanitation",
    color: "#26BDE2",
    globalAverage: 69.8,
    description: "Ensure availability and sustainable management of water and sanitation for all.",
    keyMetricLabel: "Safe Water Access",
    keyMetricValue: "74.1%",
    regions: [
      { region: "Asia Pacific", score: 64.5, growthRate: 3.5, target2030: 85.0 },
      { region: "EMEA", score: 78.9, growthRate: 1.2, target2030: 93.0 },
      { region: "Americas", score: 71.3, growthRate: 1.6, target2030: 89.0 },
    ],
  },
  {
    id: 7,
    title: "Affordable & Clean Energy",
    color: "#FCC30B",
    globalAverage: 66.3,
    description: "Ensure access to affordable, reliable, sustainable, and modern energy.",
    keyMetricLabel: "Renewable Share",
    keyMetricValue: "29.8%",
    regions: [
      { region: "Asia Pacific", score: 63.8, growthRate: 5.2, target2030: 85.0 },
      { region: "EMEA", score: 77.4, growthRate: 2.8, target2030: 92.0 },
      { region: "Americas", score: 70.1, growthRate: 3.1, target2030: 88.0 },
    ],
  },
  {
    id: 8,
    title: "Decent Work & Growth",
    color: "#A21942",
    globalAverage: 67.9,
    description: "Promote sustained, inclusive, and sustainable economic growth and decent work for all.",
    keyMetricLabel: "GDP Growth Trajectory",
    keyMetricValue: "+3.4%",
    regions: [
      { region: "Asia Pacific", score: 66.1, growthRate: 3.9, target2030: 84.0 },
      { region: "EMEA", score: 75.8, growthRate: 1.4, target2030: 89.0 },
      { region: "Americas", score: 69.5, growthRate: 2.0, target2030: 86.0 },
    ],
  },
  {
    id: 9,
    title: "Industry & Innovation",
    color: "#FD6925",
    globalAverage: 62.4,
    description: "Build resilient infrastructure, promote inclusive industrialization, and foster innovation.",
    keyMetricLabel: "R&D Expenditure Index",
    keyMetricValue: "2.1%",
    regions: [
      { region: "Asia Pacific", score: 61.0, growthRate: 4.8, target2030: 82.0 },
      { region: "EMEA", score: 78.2, growthRate: 1.6, target2030: 91.0 },
      { region: "Americas", score: 65.4, growthRate: 2.5, target2030: 85.0 },
    ],
  },
  {
    id: 10,
    title: "Reduced Inequalities",
    color: "#DD1367",
    globalAverage: 59.6,
    description: "Reduce inequality within and among countries across economic and social dimensions.",
    keyMetricLabel: "Gini Index Global Avg",
    keyMetricValue: "37.8",
    regions: [
      { region: "Asia Pacific", score: 55.4, growthRate: 2.1, target2030: 78.0 },
      { region: "EMEA", score: 70.1, growthRate: 1.0, target2030: 85.0 },
      { region: "Americas", score: 60.3, growthRate: 1.8, target2030: 80.0 },
    ],
  },
  {
    id: 11,
    title: "Sustainable Cities",
    color: "#FD9D24",
    globalAverage: 64.1,
    description: "Make cities and human settlements inclusive, safe, resilient, and sustainable.",
    keyMetricLabel: "Urban Green Space Index",
    keyMetricValue: "42.1%",
    regions: [
      { region: "Asia Pacific", score: 60.8, growthRate: 3.7, target2030: 81.0 },
      { region: "EMEA", score: 74.6, growthRate: 1.3, target2030: 88.0 },
      { region: "Americas", score: 66.2, growthRate: 2.1, target2030: 84.0 },
    ],
  },
  {
    id: 12,
    title: "Responsible Consumption",
    color: "#BF8B2E",
    globalAverage: 58.2,
    description: "Ensure sustainable consumption and production patterns worldwide.",
    keyMetricLabel: "Waste Recycling Rate",
    keyMetricValue: "34.5%",
    regions: [
      { region: "Asia Pacific", score: 56.1, growthRate: 1.8, target2030: 77.0 },
      { region: "EMEA", score: 67.9, growthRate: 2.4, target2030: 84.0 },
      { region: "Americas", score: 59.8, growthRate: 1.5, target2030: 80.0 },
    ],
  },
  {
    id: 13,
    title: "Climate Action",
    color: "#3F7E44",
    globalAverage: 62.9,
    description: "Take urgent action to combat climate change and its impacts through global policy.",
    keyMetricLabel: "CO2 Emissions Reduction",
    keyMetricValue: "-2.1% YoY",
    regions: [
      { region: "Asia Pacific", score: 57.4, growthRate: 4.5, target2030: 80.0 },
      { region: "EMEA", score: 72.8, growthRate: 3.2, target2030: 89.0 },
      { region: "Americas", score: 64.1, growthRate: 2.8, target2030: 83.0 },
    ],
  },
  {
    id: 14,
    title: "Life Below Water",
    color: "#0A97D9",
    globalAverage: 54.7,
    description: "Conserve and sustainably use the oceans, seas, and marine resources.",
    keyMetricLabel: "Protected Marine Area",
    keyMetricValue: "18.2%",
    regions: [
      { region: "Asia Pacific", score: 52.3, growthRate: 2.0, target2030: 75.0 },
      { region: "EMEA", score: 63.1, growthRate: 1.7, target2030: 81.0 },
      { region: "Americas", score: 56.4, growthRate: 1.9, target2030: 78.0 },
    ],
  },
  {
    id: 15,
    title: "Life On Land",
    color: "#56C02B",
    globalAverage: 61.8,
    description: "Protect, restore, and promote sustainable use of terrestrial ecosystems.",
    keyMetricLabel: "Forest Cover Conservation",
    keyMetricValue: "31.2%",
    regions: [
      { region: "Asia Pacific", score: 58.6, growthRate: 2.3, target2030: 79.0 },
      { region: "EMEA", score: 70.4, growthRate: 1.1, target2030: 85.0 },
      { region: "Americas", score: 62.9, growthRate: 1.5, target2030: 82.0 },
    ],
  },
  {
    id: 16,
    title: "Peace, Justice & Institutions",
    color: "#00689D",
    globalAverage: 65.4,
    description: "Promote peaceful and inclusive societies, provide access to justice for all.",
    keyMetricLabel: "Institutional Integrity",
    keyMetricValue: "66/100",
    regions: [
      { region: "Asia Pacific", score: 61.2, growthRate: 1.9, target2030: 81.0 },
      { region: "EMEA", score: 78.5, growthRate: 0.9, target2030: 90.0 },
      { region: "Americas", score: 63.8, growthRate: 1.4, target2030: 84.0 },
    ],
  },
  {
    id: 17,
    title: "Partnerships for the Goals",
    color: "#19486A",
    globalAverage: 67.1,
    description: "Strengthen the means of implementation and revitalize global partnerships.",
    keyMetricLabel: "Global Development Fund",
    keyMetricValue: "$182B",
    regions: [
      { region: "Asia Pacific", score: 64.8, growthRate: 3.6, target2030: 85.0 },
      { region: "EMEA", score: 75.3, growthRate: 2.1, target2030: 90.0 },
      { region: "Americas", score: 68.2, growthRate: 2.5, target2030: 87.0 },
    ],
  },
];

export interface SummitEvent {
  id: string;
  year: number;
  title: string;
  date: string;
  location: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  delegatesCount: number;
  keyNoteSpeaker: string;
  theme: string;
}

export const SUMMIT_EVENTS: SummitEvent[] = [
  {
    id: "summit-2026",
    year: 2026,
    title: "UNA Global SDG Summit 2026",
    date: "October 5, 2026",
    location: "Geneva, Switzerland",
    status: "Upcoming",
    delegatesCount: 2400,
    keyNoteSpeaker: "Dr. Elena Rostova (UN SDG Envoy)",
    theme: "Accelerating Action Beyond 2030 Milestones",
  },
  {
    id: "summit-2025",
    year: 2025,
    title: "Global Sustainability Forum 2025",
    date: "November 12, 2025",
    location: "Tokyo, Japan",
    status: "Completed",
    delegatesCount: 1820,
    keyNoteSpeaker: "Kenji Sato (Asia Sustainability Institute)",
    theme: "AI & Innovation for Clean Energy Scaling",
  },
  {
    id: "summit-2024",
    year: 2024,
    title: "Climate & Action Conference 2024",
    date: "September 20, 2024",
    location: "New York, USA",
    status: "Completed",
    delegatesCount: 1600,
    keyNoteSpeaker: "Maria Fernandez (Americas Green Council)",
    theme: "Financing Resilient Infrastructure in Developing Nations",
  },
];

export interface CountryAward {
  id: string;
  country: string;
  code: string;
  flag: string;
  region: 'Asia Pacific' | 'EMEA' | 'Americas';
  mostImprovedGoal: string;
  improvementDelta: string;
  overallScore: number;
  rank: number;
  impactHighlight: string;
}

export const MOST_IMPROVED_COUNTRIES: CountryAward[] = [
  {
    id: "award-1",
    country: "Costa Rica",
    code: "CRI",
    flag: "🇨🇷",
    region: "Americas",
    mostImprovedGoal: "Climate Action (SDG 13)",
    improvementDelta: "+14.2%",
    overallScore: 78.4,
    rank: 1,
    impactHighlight: "Achieved 99.2% renewable grid electricity and expanded forest protection.",
  },
  {
    id: "award-2",
    country: "Vietnam",
    code: "VNM",
    flag: "🇻🇳",
    region: "Asia Pacific",
    mostImprovedGoal: "No Poverty (SDG 1)",
    improvementDelta: "+12.8%",
    overallScore: 72.1,
    rank: 2,
    impactHighlight: "Lifted 1.4M citizens above extreme poverty threshold via rural electrification.",
  },
  {
    id: "award-3",
    country: "Rwanda",
    code: "RWA",
    flag: "🇷🇼",
    region: "EMEA",
    mostImprovedGoal: "Gender Equality (SDG 5)",
    improvementDelta: "+11.5%",
    overallScore: 69.8,
    rank: 3,
    impactHighlight: "Maintained 61% female parliamentary representation and tech equal access.",
  },
  {
    id: "award-4",
    country: "Norway",
    code: "NOR",
    flag: "🇳🇴",
    region: "EMEA",
    mostImprovedGoal: "Clean Energy (SDG 7)",
    improvementDelta: "+9.8%",
    overallScore: 84.2,
    rank: 4,
    impactHighlight: "Reached 92% EV market adoption and offshore wind expansion.",
  },
  {
    id: "award-5",
    country: "Chile",
    code: "CHL",
    flag: "🇨🇱",
    region: "Americas",
    mostImprovedGoal: "Clean Water (SDG 6)",
    improvementDelta: "+8.9%",
    overallScore: 75.3,
    rank: 5,
    impactHighlight: "Deployed solar-powered desalination networks across arid northern zones.",
  },
];