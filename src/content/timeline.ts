export interface TimelineEntry {
  date: string;
  title: string;
  company: string;
  description: string;
  type: "education" | "work" | "transition";
}

export const timelineData: TimelineEntry[] = [
  {
    date: "2025 – 2026",
    title: "Data Scientist (Working Student)",
    company: "Datalogue GmbH",
    description:
      "Building multi-agent AI systems for B2B sales. Delivered pipeline reducing manual workload by 53%.",
    type: "work",
  },
  {
    date: "2023 – 2026",
    title: "M.Sc. Data Science & Artificial Intelligence",
    company: "FH Wedel",
    description:
      "Focus on deep learning, NLP, computer vision, and econometrics. Thesis on multi-agent systems.",
    type: "education",
  },
  {
    date: "2022 – 2023",
    title: "Data Science Bootcamps",
    company: "neuefische & Le Wagon",
    description:
      "Intensive training in Python, ML, deep learning, and data engineering. Career transition from finance.",
    type: "transition",
  },
  {
    date: "2017 – 2022",
    title: "Financial Analyst / Controller",
    company: "Otto Group",
    description:
      "5 years in corporate finance — budgeting, reporting, and process automation. Built foundation for data-driven thinking.",
    type: "work",
  },
  {
    date: "2015 – 2017",
    title: "Au-Pair & Language Studies",
    company: "Hamburg, Germany",
    description:
      "Moved to Germany. Learned German (C1), integrated into Hamburg culture, and explored career options.",
    type: "transition",
  },
  {
    date: "2010 – 2014",
    title: "B.Sc. Banking & Finance",
    company: "Damascus University, Syria",
    description:
      "Studied economics, banking, and financial analysis. First professional experience in banking sector.",
    type: "education",
  },
];
