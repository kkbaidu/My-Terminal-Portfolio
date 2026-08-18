import portfolioData from "@/data/portfolio.json";

export type SkillItem = { name: string; level: number };
export type SkillGroup = { title: string; items: SkillItem[] };
export type Project = {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  tech: string[];
  github?: string;
  demo?: string;
  challenge: string;
  lesson: string;
  architecture: string;
  screenshots: string[];
};
export type Article = { slug: string; title: string; summary: string; date: string; tags: string[] };
export type Hackathon = { name: string; result: string; project: string; role: string; description: string };

export const portfolio = portfolioData as {
  identity: {
    name: string;
    role: string;
    handle: string;
    location: string;
    availability: string;
  };
  intro: string;
  about: string;
  story: string;
  links: { github: string; linkedin: string; email: string; phone: string; blog: string };
  stats: Array<{ label: string; value: string }>;
  services: string[];
  skills: SkillGroup[];
  projects: Project[];
  experience: Array<{ company: string; title: string; period: string; points: string[] }>;
  education: string[];
  certifications: string[];
  hackathons: Hackathon[];
  leadership: string[];
  personalBackground: {
    origin: string;
    schools: string[];
    religion: string;
    favoriteSubjects: string[];
    softSkills: string[];
    gapYear: string;
    workingStyle: string;
    faith: string;
  };
  hobbies: string[];
  careerGoals: string;
  articles: Article[];
  asciiLogos: string[];
  knowledgeBase: string[];
};

export const commandCatalog = [
  "help", "about", "skills", "stack", "tech", "experience", "projects", "project",
  "education", "certifications", "resume", "contact", "github", "linkedin", "blog",
  "articles", "services", "hire", "social", "whoami", "pwd", "ls", "cat", "echo",
  "date", "history", "theme", "matrix", "ascii", "weather", "quote", "joke", "coffee",
  "exit", "sudo", "ai", "ask", "timeline", "search", "42", "hobbies", "hackathons", "leadership"
] as const;

export type CommandName = (typeof commandCatalog)[number];

export function listSuggestions(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return commandCatalog.slice(0, 8);
  return commandCatalog.filter((command) => command.startsWith(trimmed)).slice(0, 6);
}

export function projectBySlug(slug?: string) {
  return portfolio.projects.find((project) => project.slug === slug);
}