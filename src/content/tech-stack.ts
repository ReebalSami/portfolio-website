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
    label: "Languages",
    category: "language",
    skills: [
      { name: "Python", category: "language" },
      { name: "TypeScript", category: "language" },
      { name: "JavaScript", category: "language" },
      { name: "Java", category: "language" },
      { name: "SQL", category: "language" },
      { name: "HTML/CSS", category: "language" },
      { name: "VBA", category: "language" },
    ],
  },
  {
    label: "AI / ML",
    category: "ai",
    skills: [
      { name: "PyTorch", category: "ai" },
      { name: "TensorFlow", category: "ai" },
      { name: "scikit-learn", category: "ai" },
      { name: "Hugging Face", category: "ai" },
      { name: "OpenCV", category: "ai" },
      { name: "timm", category: "ai" },
      { name: "XGBoost", category: "ai" },
      { name: "OpenAI API", category: "ai" },
      { name: "LangChain", category: "ai" },
      { name: "Agno (Agents)", category: "ai" },
      { name: "RAG", category: "ai" },
      { name: "Multi-Agent Orchestration", category: "ai" },
      { name: "Prompt Engineering", category: "ai" },
      { name: "Function Calling", category: "ai" },
      { name: "Structured Outputs", category: "ai" },
      { name: "Vision Transformers (ViT)", category: "ai" },
      { name: "CNN", category: "ai" },
      { name: "Grad-CAM", category: "ai" },
      { name: "Attention Rollout", category: "ai" },
      { name: "Word2Vec", category: "ai" },
      { name: "NLP", category: "ai" },
    ],
  },
  {
    label: "Frameworks",
    category: "framework",
    skills: [
      { name: "Next.js", category: "framework" },
      { name: "React", category: "framework" },
      { name: "FastAPI", category: "framework" },
      { name: "Streamlit", category: "framework" },
      { name: "Spring Boot", category: "framework" },
      { name: "Pydantic", category: "framework" },
      { name: "SQLAlchemy", category: "framework" },
      { name: "MDX", category: "framework" },
    ],
  },
  {
    label: "Cloud & DevOps",
    category: "cloud",
    skills: [
      { name: "AWS", category: "cloud" },
      { name: "AWS CDK", category: "cloud" },
      { name: "GCP", category: "cloud" },
      { name: "Docker", category: "cloud" },
      { name: "GitHub Actions", category: "cloud" },
      { name: "Makefile", category: "cloud" },
      { name: "Render", category: "cloud" },
      { name: "MLflow", category: "cloud" },
    ],
  },
  {
    label: "Databases",
    category: "database",
    skills: [
      { name: "PostgreSQL (3NF)", category: "database" },
      { name: "MongoDB", category: "database" },
      { name: "Vector DB", category: "database" },
      { name: "FAISS", category: "database" },
      { name: "Pinecone", category: "database" },
      { name: "SAP FI-CO / BPC", category: "database" },
    ],
  },
  {
    label: "Tools",
    category: "tool",
    skills: [
      { name: "Git", category: "tool" },
      { name: "Jupyter", category: "tool" },
      { name: "Pandas", category: "tool" },
      { name: "Polars", category: "tool" },
      { name: "NumPy", category: "tool" },
      { name: "Plotly", category: "tool" },
      { name: "BeautifulSoup", category: "tool" },
      { name: "Oxylabs", category: "tool" },
      { name: "Tailwind CSS", category: "tool" },
      { name: "Playwright", category: "tool" },
      { name: "UiPath (RPA)", category: "tool" },
      { name: "Obsidian", category: "tool" },
    ],
  },
];
