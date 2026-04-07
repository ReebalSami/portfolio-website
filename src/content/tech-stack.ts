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
      { name: "SQL", category: "language" },
      { name: "R", category: "language" },
    ],
  },
  {
    label: "AI / ML",
    category: "ai",
    skills: [
      { name: "PyTorch", category: "ai" },
      { name: "scikit-learn", category: "ai" },
      { name: "Hugging Face", category: "ai" },
      { name: "LangChain", category: "ai" },
      { name: "OpenAI API", category: "ai" },
      { name: "RAG", category: "ai" },
      { name: "Computer Vision", category: "ai" },
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
    ],
  },
  {
    label: "Cloud & DevOps",
    category: "cloud",
    skills: [
      { name: "AWS", category: "cloud" },
      { name: "GCP", category: "cloud" },
      { name: "Docker", category: "cloud" },
      { name: "GitHub Actions", category: "cloud" },
      { name: "CDK", category: "cloud" },
    ],
  },
  {
    label: "Databases & Tools",
    category: "database",
    skills: [
      { name: "PostgreSQL", category: "database" },
      { name: "MongoDB", category: "database" },
      { name: "Redis", category: "database" },
      { name: "Pinecone", category: "database" },
    ],
  },
  {
    label: "Tools",
    category: "tool",
    skills: [
      { name: "Git", category: "tool" },
      { name: "Jupyter", category: "tool" },
      { name: "Pandas", category: "tool" },
      { name: "Tailwind CSS", category: "tool" },
      { name: "Playwright", category: "tool" },
    ],
  },
];
