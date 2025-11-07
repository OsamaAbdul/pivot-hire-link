export type JobType = "Full-time" | "Part-time" | "Contract";
export type JobExperience = "Entry" | "Mid" | "Senior";

export type JobRecord = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  experience: JobExperience;
  tags: string[];
  summary: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  preferred?: string[];
  salaryRange?: string;
  officePolicy?: string;
  applyBy?: string;
};

export const JOBS: JobRecord[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    company: "InnovateTech Inc.",
    location: "Toronto, ON",
    type: "Full-time",
    experience: "Senior",
    tags: ["React", "TypeScript", "GraphQL"],
    summary:
      "We’re looking for a skilled developer to build beautiful, responsive UIs. Join our team and shape the future of our product.",
    description:
      "InnovateTech Inc. is looking for a passionate Senior Frontend Engineer to join our dynamic team. In this role, you will be a key contributor to our user-facing products, shaping the way our customers interact with our platform. You’ll work with modern technologies, collaborate with a talented team of engineers and designers, and have a direct impact on our product’s success.",
    responsibilities: [
      "Develop and maintain high-quality, responsive, and performant web applications using React and TypeScript.",
      "Collaborate with product managers, designers, and backend engineers to create seamless user experiences.",
      "Architect and implement robust, scalable, and maintainable frontend solutions.",
      "Mentor junior engineers and contribute to our team’s best practices and coding standards.",
      "Participate in code reviews to ensure code quality and knowledge sharing.",
    ],
    requirements: [
      "5+ years of professional experience in frontend development.",
      "Expertise in JavaScript, HTML5, and CSS3.",
      "Deep understanding of React and its core principles (Hooks, Context API).",
      "Experience with state management libraries like Redux or Zustand.",
      "Familiarity with modern frontend build pipelines and tools (e.g., Webpack, Vite, Babel).",
    ],
    preferred: [
      "Experience with TypeScript.",
      "Knowledge of Next.js or other server-side rendering frameworks.",
      "Familiarity with GraphQL.",
      "Experience with testing frameworks like Jest and React Testing Library.",
      "Contributions to open-source projects.",
    ],
    salaryRange: "$120,000 - $160,000 CAD",
    officePolicy: "Hybrid",
    applyBy: "July 31, 2024",
  },
  {
    id: "j2",
    title: "Product Manager",
    company: "DataDriven Co.",
    location: "Toronto, ON",
    type: "Full-time",
    experience: "Senior",
    tags: ["Agile", "Roadmapping", "Analytics"],
    summary:
      "Lead the product vision and strategy for our core analytics platform. Work with a talented team to deliver value to our users.",
  },
  {
    id: "j3",
    title: "UX/UI Designer",
    company: "NextGen Solutions",
    location: "Vancouver, BC",
    type: "Contract",
    experience: "Mid",
    tags: ["Figma", "User Research", "Prototyping"],
    summary:
      "Craft intuitive and visually appealing interfaces for our innovative suite of tools. A strong portfolio in product design is required.",
  },
  {
    id: "j4",
    title: "Backend Engineer (Go)",
    company: "CloudCorp",
    location: "Global",
    type: "Full-time",
    experience: "Senior",
    tags: ["Golang", "Kubernetes", "PostgreSQL"],
    summary:
      "Build and maintain scalable microservices that power our global infrastructure. Experience with distributed systems is a plus.",
  },
  {
    id: "j5",
    title: "Digital Marketing Specialist",
    company: "MarketMakers",
    location: "Remote • Canada",
    type: "Part-time",
    experience: "Mid",
    tags: ["SEO", "Google Analytics", "Content Strategy"],
    summary:
      "Drive growth through strategic SEO, SEM, and content marketing campaigns. Analyze performance and optimize for results.",
  },
  {
    id: "j6",
    title: "DevOps Engineer",
    company: "InnovateTech Inc.",
    location: "Remote • Canada",
    type: "Full-time",
    experience: "Senior",
    tags: ["AWS", "Terraform", "CI/CD"],
    summary:
      "Automate and streamline our operations and processes. Build and maintain tools for deployment, monitoring, and operations.",
  },
];

export function getJobById(id: string) {
  return JOBS.find((j) => j.id === id) || null;
}