export interface TechSkill {
  name: string;
  category: "language" | "framework" | "ai" | "cloud" | "database" | "tool";
}

export interface TechCategory {
  label: string;
  category: TechSkill["category"];
  skills: TechSkill[];
}

export const techStackData: TechCategory[] = [
  {
    label: "Programming Languages",
    category: "language",
    skills: [
      { name: "Python", category: "language" },
      { name: "TypeScript", category: "language" },
      { name: "JavaScript", category: "language" },
      { name: "Java", category: "language" },
      { name: "SQL", category: "language" },
      { name: "VBA", category: "language" },
      { name: "HTML", category: "language" },
      { name: "CSS", category: "language" },
    ],
  },
  {
    label: "AI / Machine Learning",
    category: "ai",
    skills: [
      { name: "LLM Agents", category: "ai" },
      { name: "Multi-Agent Orchestration", category: "ai" },
      { name: "RAG", category: "ai" },
      { name: "Prompt Engineering", category: "ai" },
      { name: "Context Engineering", category: "ai" },
      { name: "Function Calling", category: "ai" },
      { name: "Structured Outputs", category: "ai" },
      { name: "Local Inference (llama.cpp)", category: "ai" },
      { name: "LLM APIs", category: "ai" },
      { name: "Vision Transformers", category: "ai" },
      { name: "CNNs", category: "ai" },
      { name: "YOLO", category: "ai" },
      { name: "Grad-CAM", category: "ai" },
      { name: "Attention Rollout", category: "ai" },
      { name: "Word2Vec", category: "ai" },
      { name: "Embeddings", category: "ai" },
      { name: "XGBoost / LightGBM", category: "ai" },
      { name: "EDA", category: "ai" },
      { name: "Regression", category: "ai" },
      { name: "Time Series", category: "ai" },
      { name: "Statistical Modeling", category: "ai" },
    ],
  },
  {
    label: "Frameworks & Libraries",
    category: "framework",
    skills: [
      { name: "PyTorch", category: "framework" },
      { name: "TensorFlow", category: "framework" },
      { name: "Hugging Face", category: "framework" },
      { name: "timm", category: "framework" },
      { name: "scikit-learn", category: "framework" },
      { name: "OpenCV", category: "framework" },
      { name: "LangChain", category: "framework" },
      { name: "Agno", category: "framework" },
      { name: "AutoGen", category: "framework" },
      { name: "Next.js", category: "framework" },
      { name: "React", category: "framework" },
      { name: "FastAPI", category: "framework" },
      { name: "Streamlit", category: "framework" },
      { name: "Spring Boot", category: "framework" },
      { name: "Pydantic", category: "framework" },
      { name: "SQLAlchemy", category: "framework" },
      { name: "BeautifulSoup", category: "framework" },
      { name: "Tailwind CSS", category: "framework" },
      { name: "MDX", category: "framework" },
      { name: "Pandas", category: "framework" },
      { name: "Polars", category: "framework" },
      { name: "NumPy", category: "framework" },
      { name: "Plotly", category: "framework" },
      { name: "Matplotlib", category: "framework" },
      { name: "Seaborn", category: "framework" },
    ],
  },
  {
    label: "Cloud & DevOps",
    category: "cloud",
    skills: [
      { name: "AWS (CDK, Lambda, S3, CloudFront)", category: "cloud" },
      { name: "GCP", category: "cloud" },
      { name: "Docker", category: "cloud" },
      { name: "GitHub Actions", category: "cloud" },
      { name: "Render", category: "cloud" },
      { name: "MLflow", category: "cloud" },
      { name: "Makefile", category: "cloud" },
      { name: "Playwright", category: "cloud" },
    ],
  },
  {
    label: "Databases",
    category: "database",
    skills: [
      { name: "PostgreSQL (3NF)", category: "database" },
      { name: "MongoDB", category: "database" },
      { name: "Vector DB (FAISS, Pinecone)", category: "database" },
      { name: "SAP FI-CO / BPC", category: "database" },
    ],
  },
  {
    label: "Tools",
    category: "tool",
    skills: [
      { name: "Git", category: "tool" },
      { name: "Jupyter", category: "tool" },
      { name: "UiPath (RPA)", category: "tool" },
      { name: "Oxylabs", category: "tool" },
      { name: "Sanity CMS", category: "tool" },
      { name: "Stripe", category: "tool" },
    ],
  },
];
