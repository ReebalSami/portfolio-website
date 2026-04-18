export type ProjectCategory = "ai" | "data-science" | "full-stack" | "nlp";

export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  tech: string[];
  category: ProjectCategory[];
  metric: string;
  githubUrl?: string;
  demoUrl?: string;
  highlights: string[];
}

export const projectCategories: { label: string; value: ProjectCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "AI / ML", value: "ai" },
  { label: "Data Science", value: "data-science" },
  { label: "NLP", value: "nlp" },
  { label: "Full-Stack", value: "full-stack" },
];

export const projectsData: Project[] = [
  {
    slug: "b2b-sales-pipeline",
    title: "B2B Sales Lead Pipeline",
    shortDescription:
      "Multi-agent LLM system that automates B2B lead research, contact discovery, and outreach drafting.",
    fullDescription:
      "End-to-end multi-agent pipeline built at Datalogue (Jun–Dec 2025) to automate B2B sales research. Four specialized LLM agents — Company Targeting, Insights, Contact Discovery, and Outreach Drafting — collaborate through shared state, backed by a PostgreSQL 3NF schema and a generic news-crawler pipeline. Human-in-the-loop feedback refines vectorization and prediction quality over time. Cut the sales team's manual research workload by roughly half.",
    tech: [
      "Python",
      "Streamlit",
      "Agno",
      "OpenAI",
      "Gemini",
      "Pydantic",
      "SQLAlchemy",
      "PostgreSQL",
      "Vector Search",
      "BeautifulSoup",
      "Oxylabs",
      "Docker",
    ],
    category: ["ai", "nlp"],
    metric: "~50% manual workload cut",
    githubUrl: "https://github.com/ReebalSami/b2b-sales-lead-multi-agent-pipeline-showcase",
    highlights: [
      "Four LLM agents with shared state: Company Targeting, Insights, Contact Discovery, Outreach Drafting",
      "Generic news-crawler pipeline: BeautifulSoup + Oxylabs, multi-LLM analysis (GPT + Gemini), structured outputs",
      "PostgreSQL 3NF schema with Pydantic validation and SQLAlchemy — full audit trail per crawl/task",
      "Vector semantic search for company matching; fuzzy scoring for homepage resolution",
      "Human-in-the-loop feedback improves prediction quality over time",
      "Concept-to-MVP delivery in six months at 20h/week",
    ],
  },
  {
    slug: "urban-farming-plant-health",
    title: "Urban Farming Plant Health",
    shortDescription:
      "Hierarchical deep-learning pipeline identifying plant species, health status, and specific diseases from a single leaf image.",
    fullDescription:
      "FH Wedel Deep Learning course project (SS 2025, team of 2). A three-stage hierarchical classifier — PlantID (3 species, ResNet50) → Binary Health (per-plant) → Disease Classification (per-plant) — across 31,616 curated images from multiple public sources. Headline finding: the training-deployment domain gap. Models that scored 99%+ on isolated leaf images degraded significantly on whole-plant scenes, reshaping the recommendations for real-world agricultural deployment.",
    tech: [
      "PyTorch",
      "timm",
      "ViT",
      "DINOv2",
      "ConvNeXt",
      "ResNet-50",
      "EfficientNet",
      "Grad-CAM",
      "Attention Rollout",
      "Streamlit",
      "Python",
    ],
    category: ["ai", "data-science"],
    metric: "99.9% / 99.7% / 99.1% per stage",
    githubUrl: "https://github.com/ReebalSami/urban-farming-plant-health-showcase",
    highlights: [
      "Hierarchical 3-stage pipeline: PlantID → Binary Health → Disease Classification — ~6pp accuracy gain over a single global classifier",
      "31,616 curated images, 3 species, 16 classes. Data-quality pipeline removed ~30% irrelevant samples and cross-split duplicates via perceptual hashing",
      "Compared 8+ architectures across 3 tiers (Transformer / Balanced / Fast). Strong augmentation cut the generalization gap by ~92%",
      "Explainability: Grad-CAM for CNNs, Attention Rollout for ViTs — integrated into a Streamlit dashboard with adjustable overlays",
      "Critical domain-gap discovery during whole-plant trials shaped the future-work plan (YOLO localization, whole-plant training data)",
    ],
  },
  {
    slug: "bankruptcy-early-warning",
    title: "Bankruptcy Early Warning",
    shortDescription:
      "Multi-horizon machine-learning early warning system for corporate bankruptcy, across 5 prediction windows.",
    fullDescription:
      "FH Wedel seminar project (WS 2024/25): Entwicklung eines Frühwarnsystems für Unternehmenskrisen mit Hilfe maschinellen Lernens. Horizon-specific models (H1–H5) on the Polish Companies Bankruptcy dataset — 43,004 observations, 64 financial ratios, 4.84% positive class. Automated feature-selection pipeline consensus over Filter + Wrapper + Embedded methods, with EPV guardrails. Best: Soft-Voting Ensemble (H1, AUC 0.796), Random Forest (H2–H5, AUC 0.78 – 0.86).",
    tech: [
      "Python",
      "scikit-learn",
      "XGBoost",
      "Random Forest",
      "Elastic Net",
      "Makefile",
      "Econometrics",
    ],
    category: ["data-science"],
    metric: "AUC 0.78 – 0.86 across H1–H5",
    githubUrl: "https://github.com/ReebalSami/seminar-bankruptcy-prediction",
    highlights: [
      "Horizon-specific modeling: 5 separate models for H1–H5 (1 to 5 years before bankruptcy)",
      "Consensus feature selection: Filter (Spearman, MI, ANOVA-F) + Wrapper (RFECV) + Embedded (Lasso, Ridge, RF)",
      "EPV guardrails (≥10 events per variable) to prevent overfitting on the 4.84% positive class",
      "Best AUC 0.796 (H1 Soft-Voting) to 0.864 (H5 Random Forest) via 5-fold stratified CV",
      "Full reproducible pipeline via Makefile — raw data to final paper in one command",
    ],
  },
  {
    slug: "biotech-regulatory-rag",
    title: "Biotech Regulatory RAG",
    shortDescription:
      "RAG-powered compliance tool for navigating biotech regulatory documents with LLMs.",
    fullDescription:
      "Built during the Future Founder program (Nov 2024 – Jan 2025) within a team of four. A Retrieval-Augmented Generation system helping biotech professionals navigate complex regulatory documents. Vector embeddings for semantic search over regulatory texts, GPT-4 for grounded Q&A with source citations, and an interactive questionnaire to guide compliance assessments.",
    tech: [
      "Python",
      "FastAPI",
      "React",
      "GPT-4",
      "RAG",
      "Vector DB",
      "OpenAI",
    ],
    category: ["ai", "nlp"],
    metric: "Future Founder Program · Hamburg",
    githubUrl: "https://github.com/ReebalSami/biotech-regulatory-Retrieving-Chatbot-tool",
    highlights: [
      "Interactive compliance questionnaire with personalized recommendations",
      "AI chatbot grounded in regulatory documents with source citations",
      "Smart semantic search over uploaded regulatory texts",
      "FastAPI backend + React frontend, mobile-responsive",
      "Designed to accelerate time-to-market for life-saving biotech products",
    ],
  },
  {
    slug: "otto-recommender",
    title: "OTTO Recommender System",
    shortDescription:
      "Multi-objective e-commerce recommender using Word2Vec embeddings and co-visitation matrices on GCP.",
    fullDescription:
      "Capstone of the neuefische Data Science & AI bootcamp (Feb 2023). A multi-objective recommender system for the OTTO Kaggle challenge: predicting clicks, cart additions, and orders simultaneously. Word2Vec embeddings for product similarity, co-visitation matrices for session-based recommendations, all scaled on Google Cloud Platform.",
    tech: ["Python", "Polars", "NumPy", "Word2Vec", "Co-Visitation", "GCP", "Parquet", "SQL"],
    category: ["data-science", "ai"],
    metric: "neuefische DS Bootcamp capstone",
    githubUrl: "https://github.com/ReebalSami/Capstone-OTTO-Multi-Objective-Recommender-System",
    highlights: [
      "Multi-objective optimization across clicks, carts, and orders",
      "Word2Vec embeddings capturing product similarity from session behavior",
      "Co-visitation matrices for session-based collaborative filtering",
      "Scaled on GCP with Polars and Parquet for large session data",
    ],
  },
  {
    slug: "myrecipes-app",
    title: "MyRecipes App",
    shortDescription:
      "Full-stack recipe management app with AI-powered recipe suggestions.",
    fullDescription:
      "Capstone of the neuefische Full-Stack Java bootcamp (Apr 2024). A full-stack web app for recipe management with AI-powered suggestions — Java/Spring Boot backend, React frontend, MongoDB for flexible recipe storage. Image upload, search, and personalized recommendations. Built test-driven, deployed and still live.",
    tech: ["Java", "Spring Boot", "React", "TypeScript", "MongoDB", "Docker", "OAuth", "OpenAI"],
    category: ["full-stack"],
    metric: "Full-stack + AI",
    githubUrl: "https://github.com/ReebalSami/java-Capston-Project-fullstack-recipes-app",
    demoUrl: "https://fullstack-recipies-app.onrender.com",
    highlights: [
      "Java + Spring Boot REST API with OAuth authentication",
      "React + TypeScript frontend with responsive design",
      "MongoDB for flexible recipe document storage",
      "AI-powered recipe suggestions from available ingredients",
      "Test-driven development throughout",
    ],
  },
];
