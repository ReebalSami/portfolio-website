export interface TimelineEntry {
  date: string;
  title: string;
  company: string;
  description: string;
  type: "education" | "work" | "transition";
  expanded?: string[];
}

export const timelineData: TimelineEntry[] = [
  {
    date: "Apr 2024 – Present",
    title: "M.Sc. Data Science & Artificial Intelligence",
    company: "FH Wedel",
    description:
      "Deep learning, NLP, computer vision, econometrics, e-commerce, strategic management. Thesis in progress: Document Intelligence and Knowledge Graph Construction with Donut, LayoutLMv3, and GraphRAG — fully local, zero cloud dependency.",
    type: "education",
    expanded: [
      "Core: Deep Learning, Computer Vision, Machine Learning, Symbolic AI, Econometrics, Empirical Research Methods",
      "Business track: Category Management, E-Commerce Business Models, Digital Transformation",
      "Process: Agile Project Management, Change Management, Strategic Management, Organizational Theory",
      "Technical: Unix and Shell Programming, Data Engineering",
      "Thesis: 3-layer pipeline — OCR-free extraction (Donut F1 0.86) → knowledge graph construction (NetworkX/Neo4j, entity resolution) → GraphRAG reasoning (Ollama, local LLM). Streamlit demo, Docker, MLflow tracking.",
    ],
  },
  {
    date: "Jun 2025 – Dec 2025",
    title: "AI & Data Science Working Student",
    company: "Datalogue, Hamburg",
    description:
      "20h/week. Designed and shipped a B2B sales lead pipeline from concept to MVP — cut manual research by roughly half.",
    type: "work",
    expanded: [
      "Co-shaped the architecture combining a multi-agent app with a generic news-crawler pipeline",
      "Defined data flow, validation points, PostgreSQL 3NF schema, and human-in-the-loop feedback",
      "Built the full Streamlit MVP running four LLM agents: Company Targeting, Insights, Contact Discovery, Outreach Drafting",
      "Implemented the news-crawler pipeline: BeautifulSoup, Oxylabs, multi-LLM analysis (GPT, Gemini), structured outputs with Pydantic",
      "Vector semantic search for company matching; fuzzy scoring for homepage resolution",
      "Shipped as Docker containers; iterated with sales team through weekly standups",
    ],
  },
  {
    date: "Nov 2022 – Apr 2024",
    title: "Data Science & AI, Full-Stack Java Bootcamps",
    company: "neuefische GmbH, Hamburg",
    description:
      "Two intensive bootcamps back-to-back. Career transition from finance into Python, ML, deep learning, and end-to-end engineering.",
    type: "transition",
    expanded: [
      "Data Science & AI bootcamp (Nov 2022 – Feb 2023, 540h): Python, statistics, ML, deep learning, data visualization, big-data analysis.",
      "DS capstone: Multi-Objective Recommender System for OTTO on GCP — Word2Vec embeddings plus co-visitation matrices optimizing clicks, carts, orders.",
      "Full-Stack Java Development bootcamp (Jan 2024 – Apr 2024, 540h): Java, Spring Boot, OOP, MongoDB, OAuth, Docker, TypeScript, advanced React.",
      "Java capstone: MyRecipes — AI-powered recipe suggestion web app, deployed and still live at fullstack-recipies-app.onrender.com.",
      "Deliberate breadth: picked Java after DS to round out the engineering side before starting the M.Sc.",
    ],
  },
  {
    date: "Nov 2016 – Jul 2022",
    title: "Financial Accountant (Bilanzbuchhalter)",
    company: "Otto Group, Hamburg",
    description:
      "Over five years in corporate finance — budgeting, reporting, and process automation. Built the foundation for data-driven thinking.",
    type: "work",
    expanded: [
      "Started Nov 2016 as intern in Group Financial Reporting: IFRS implementation (IFRS 7, 9, 13), options valuation, SAP BPC consolidation.",
      "Promoted to Bilanzbuchhalter in Apr 2017. Independently owned the books for multiple subsidiaries (shopping24, OG data.works, Lieferfactory, MTI) in SAP FI-CO.",
      "Monthly, quarterly, and annual closes under both HGB and IFRS.",
      "Led RPA initiatives with UiPath: automated vacation-accrual bookings and interest-schedule postings — shaved hours off every close.",
      "Main contact for external auditors and consulting firms.",
      "Advanced Accounting & Taxation Program ‘Bilanzbuchhalter’ at GFS Steuerfachschule (2018 – 2020), evenings alongside the full-time role.",
    ],
  },
  {
    date: "Sep 2015 – Nov 2016",
    title: "Au-Pair & German Language",
    company: "Hamburg, Germany",
    description:
      "Moved to Germany. Learned German and lived German culture as part of a host family",
    type: "transition",
    expanded: [
      "Supported a working family with two young children: childcare, school runs, sports, household.",
      "Worked German up to B2/C1 through daily use plus formal courses.",
      "Stepped straight from the au-pair year into the German workforce — leading directly into my first Otto Group internship.",
    ],
  },
  {
    date: "2009 – 2015",
    title: "B.Sc. Business Administration & Banking",
    company: "Yarmouk Private University · alBaraka Bank · Damascus",
    description:
      "B.Sc. in Business Administration, specialization in Financial Management & Banking (2009 – 2013). First professional role at alBaraka Bank Syria (2014 – 2015).",
    type: "education",
    expanded: [
      "B.Sc. thesis: Testing the Capital Asset Pricing Model (CAPM) in the Syrian Stock Market.",
      "Core coursework: economics, banking, financial analysis, statistics, quantitative methods, E-commerce, Management Information Systems.",
      "alBaraka Bank Syria (Apr 2014 – Aug 2015): Trade Relations Specialist serving corporate and VIP clients.",
      "Handled letters of credit, document collections, and international trade documentation.",
    ],
  },
];
