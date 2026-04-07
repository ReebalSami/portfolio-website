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
      "Multi-agent AI system automating B2B lead generation and qualification with LLMs.",
    fullDescription:
      "Built an end-to-end multi-agent pipeline that automates B2B sales lead research, enrichment, and qualification. Multiple specialized LLM agents collaborate to analyze company data, generate personalized outreach, and score leads — reducing manual workload by 53%.",
    tech: ["Python", "Streamlit", "LangChain", "OpenAI", "Multi-Agent"],
    category: ["ai", "nlp"],
    metric: "53% workload reduction",
    highlights: [
      "Multi-agent architecture with specialized LLM agents",
      "Automated lead research, enrichment, and scoring",
      "Streamlit dashboard for sales team interaction",
      "Reduced manual workload by 53%",
    ],
  },
  {
    slug: "urban-farming-plant-health",
    title: "Urban Farming Plant Health",
    shortDescription:
      "Deep learning system for automated plant disease detection using Vision Transformers.",
    fullDescription:
      "Developed a computer vision pipeline for detecting plant diseases in urban farming environments. Compared CNN and Vision Transformer architectures, with GradCAM explainability to build trust in model predictions for farmers.",
    tech: ["PyTorch", "Vision Transformer", "CNN", "GradCAM", "Python"],
    category: ["ai", "data-science"],
    metric: "Automated detection",
    highlights: [
      "Vision Transformer vs CNN architecture comparison",
      "GradCAM explainability for model interpretability",
      "Real-world dataset from urban farming environments",
      "Production-ready inference pipeline",
    ],
  },
  {
    slug: "bankruptcy-early-warning",
    title: "Bankruptcy Early Warning",
    shortDescription:
      "Econometric analysis and ML models for early bankruptcy prediction in German companies.",
    fullDescription:
      "Seminar project at FH Wedel combining traditional econometric methods with modern machine learning for early bankruptcy detection. Applied XGBoost, Random Forest, and Logistic Regression on financial statement data.",
    tech: ["XGBoost", "Random Forest", "Logistic Regression", "Python", "Econometrics"],
    category: ["data-science"],
    metric: "Seminar, FH Wedel",
    highlights: [
      "Combined econometric and ML approaches",
      "Feature engineering from financial statements",
      "Model comparison: XGBoost, RF, Logistic Regression",
      "Presented at FH Wedel seminar",
    ],
  },
  {
    slug: "biotech-regulatory-rag",
    title: "Biotech Regulatory RAG",
    shortDescription:
      "RAG-powered compliance tool for navigating biotech regulatory documents with LLMs.",
    fullDescription:
      "Built a Retrieval-Augmented Generation system to help biotech professionals navigate complex regulatory documents. Uses vector embeddings for semantic search over regulatory texts, with LLM-powered Q&A for accurate compliance guidance.",
    tech: ["RAG", "LangChain", "Vector DB", "OpenAI", "Python"],
    category: ["ai", "nlp"],
    metric: "Compliance tool",
    highlights: [
      "Semantic search over regulatory documents",
      "RAG pipeline with vector embeddings",
      "LLM-powered Q&A with source citations",
      "Designed for biotech compliance teams",
    ],
  },
  {
    slug: "otto-recommender",
    title: "OTTO Recommender System",
    shortDescription:
      "Multi-objective recommendation engine using Word2Vec and co-visitation for e-commerce.",
    fullDescription:
      "Built a multi-objective recommender system for the OTTO e-commerce platform. Combined Word2Vec embeddings with co-visitation matrices to optimize for clicks, cart additions, and purchases simultaneously. Deployed on GCP.",
    tech: ["Word2Vec", "Co-Visitation", "GCP", "Python", "Polars"],
    category: ["data-science", "ai"],
    metric: "Multi-objective optimization",
    githubUrl: "https://github.com/ReebalSami",
    highlights: [
      "Multi-objective optimization (clicks, carts, orders)",
      "Word2Vec embeddings for product similarity",
      "Co-visitation matrix for session-based recommendations",
      "Scaled on Google Cloud Platform",
    ],
  },
  {
    slug: "myrecipes-app",
    title: "MyRecipes App",
    shortDescription:
      "Full-stack recipe management app with AI-powered recipe suggestions.",
    fullDescription:
      "Full-stack web application for recipe management with AI-powered suggestions. Built with Java/Spring Boot backend, React frontend, and MongoDB for flexible recipe data storage. Includes image upload, search, and personalized recommendations.",
    tech: ["Java", "Spring Boot", "React", "MongoDB", "AI"],
    category: ["full-stack"],
    metric: "Full-stack + AI",
    githubUrl: "https://github.com/ReebalSami",
    demoUrl: "https://fullstack-recipies-app.onrender.com",
    highlights: [
      "Java/Spring Boot REST API",
      "React frontend with responsive design",
      "MongoDB for flexible recipe storage",
      "AI-powered recipe suggestions",
    ],
  },
];
