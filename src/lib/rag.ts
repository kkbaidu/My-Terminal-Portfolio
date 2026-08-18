import { portfolio } from "@/lib/portfolio";

function score(query: string, text: string) {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const source = text.toLowerCase();

  return queryTokens.reduce((total, token) => {
    if (source.includes(token)) return total + 3;
    return token.length > 3 && source.includes(token.replace(/[^a-z0-9]/g, "")) ? total + 1 : total;
  }, 0);
}

export function retrievePortfolioContext(query: string) {
  const corpus = [
    portfolio.about,
    portfolio.story,
    portfolio.intro,
    portfolio.careerGoals,
    ...portfolio.knowledgeBase,
    ...portfolio.projects.map(
      (project) =>
        `${project.name} ${project.headline} ${project.summary} ${project.challenge} ${project.lesson} ${project.architecture}`,
    ),
    ...portfolio.skills.flatMap((group) => group.items.map((item) => `${group.title} ${item.name}`)),
    ...portfolio.experience.flatMap((job) => `${job.company} ${job.title} ${job.period} ${job.points.join(" ")}`),
    ...portfolio.articles.map((article) => `${article.title} ${article.summary} ${article.tags.join(" ")}`),
    ...portfolio.hackathons.map((h) => `${h.name} ${h.project} ${h.result} ${h.role} ${h.description}`),
    ...portfolio.leadership,
    ...portfolio.hobbies,
    ...portfolio.education,
    ...portfolio.certifications,
    portfolio.personalBackground.origin,
    portfolio.personalBackground.gapYear,
    portfolio.personalBackground.workingStyle,
    ...portfolio.personalBackground.softSkills,
    ...portfolio.personalBackground.favoriteSubjects,
    ...portfolio.personalBackground.schools,
  ];

  const matches = corpus
    .map((text) => ({ text, score: score(query, text) }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);

  const context = matches.length
    ? matches.map((match) => `- ${match.text}`).join("\n")
    : portfolio.knowledgeBase.map((item) => `- ${item}`).join("\n");

  return { context, matches };
}