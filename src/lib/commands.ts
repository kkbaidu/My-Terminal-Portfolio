import { format } from "date-fns";
import { portfolio, projectBySlug, type CommandName } from "@/lib/portfolio";
import { retrievePortfolioContext } from "@/lib/rag";

export type TerminalTheme = "green" | "blue" | "purple" | "amber";

export type TerminalOutputEntry =
  | { type: "text"; value: string }
  | { type: "markdown"; value: string }
  | { type: "ascii"; value: string }
  | { type: "projects" }
  | { type: "skills" }
  | { type: "contact" }
  | { type: "resume" }
  | { type: "articles" }
  | { type: "experience" }
  | { type: "stat-grid" }
  | { type: "github" }
  | { type: "matrix" };

export type TerminalResult = {
  output: TerminalOutputEntry[];
  clear?: boolean;
  matrix?: boolean;
  theme?: TerminalTheme;
  aiQuery?: string;
};

function markdown(title: string, body: string) {
  return `### ${title}\n\n${body}`;
}

export function parseCommandInput(rawInput: string) {
  const tokens = rawInput.match(/(?:"[^"]*"|'[^']*'|\S)+/g)?.map((part) => part.replace(/^['"]|['"]$/g, "")) ?? [];
  const [name = "", ...args] = tokens;
  return { name: name.toLowerCase(), args };
}

export function getCommandSuggestions(input: string) {
  const { listSuggestions } = require("@/lib/portfolio") as typeof import("@/lib/portfolio");
  return listSuggestions(input);
}

export function executeCommand(rawInput: string, history: string[] = []): TerminalResult {
  const input = rawInput.trim();
  if (!input) return { output: [] };

  const { name, args } = parseCommandInput(input);
  const joinedArgs = args.join(" ").trim();

  if (input === "42") {
    return { output: [{ type: "markdown", value: markdown("The answer", "Forty-two, but engineered beautifully.") }] };
  }

  if (input.toLowerCase().startsWith("sudo ")) {
    return {
      output: [
        {
          type: "markdown",
          value: markdown("Privilege escalation denied", "Nice try. This terminal escalates careers, not root access."),
        },
      ],
    };
  }

  const project = projectBySlug(args[0]);

  switch (name as CommandName) {
    case "help":
      return {
        output: [
          {
            type: "markdown",
            value: markdown(
              "Available commands",
              [
                "- `about` / `whoami` — Who is Kingsley?",
                "- `experience` — Work history",
                "- `projects` — All projects",
                "- `skills` / `stack` — Tech skills",
                "- `education` — Academic background",
                "- `certifications` — AWS & credentials",
                "- `hackathons` — Hackathon history",
                "- `leadership` — Leadership roles",
                "- `hobbies` — Interests & fun facts",
                "- `contact` / `hire` — Get in touch",
                "- `github` — Live GitHub stats",
                "- `social` — All social links",
                "- `timeline` — Career timeline",
                "- `ai <question>` — Ask Kingsley's AI assistant anything",
                "- `theme green|blue|purple|amber` — Switch color theme",
                "- `matrix` — Enter the matrix",
              ].join("\n"),
            ),
          },
        ],
      };
    case "about":
    case "whoami":
      return {
        output: [
          { type: "markdown", value: markdown("About Kingsley", `${portfolio.about}\n\n${portfolio.story}`) },
          { type: "stat-grid" },
        ],
      };
    case "skills":
    case "stack":
    case "tech":
      return { output: [{ type: "skills" }] };
    case "experience":
      return { output: [{ type: "experience" }] };
    case "projects":
      return { output: [{ type: "projects" }] };
    case "project":
      return {
        output: [
          { type: "markdown", value: project ? markdown(project.name, `${project.headline}\n\n${project.summary}`) : markdown("Project not found", `Try: ${portfolio.projects.map((item) => item.slug).join(", ")}`) },
        ],
      };
    case "education":
      return { output: [{ type: "markdown", value: markdown("Education", portfolio.education.map((item) => `- ${item}`).join("\n")) }] };
    case "certifications":
      return { output: [{ type: "markdown", value: markdown("Certifications", portfolio.certifications.map((item) => `- ${item}`).join("\n")) }] };
    case "resume":
      return { output: [{ type: "resume" }] };
    case "contact":
    case "hire":
      return { output: [{ type: "contact" }] };
    case "github":
      return {
        output: [
          { type: "github" },
          { type: "markdown", value: markdown("GitHub", `Profile: ${portfolio.links.github}\n\nLive GitHub data is fetched in the terminal card.`) },
        ],
      };
    case "linkedin":
      return { output: [{ type: "markdown", value: markdown("LinkedIn", portfolio.links.linkedin) }] };
    case "blog":
    case "articles":
      return {
        output: [
          {
            type: "articles",
          },
          {
            type: "markdown",
            value: portfolio.articles
              .map((article) => `### ${article.title}\n\n${article.summary}\n\n${format(new Date(article.date), "MMM d, yyyy")}`)
              .join("\n\n"),
          },
        ],
      };
    case "services":
      return { output: [{ type: "markdown", value: markdown("Services", portfolio.services.map((item) => `- ${item}`).join("\n")) }] };
    case "hobbies":
      return {
        output: [
          {
            type: "markdown",
            value: markdown(
              "Hobbies & Interests",
              portfolio.hobbies.map((item) => `- ${item}`).join("\n"),
            ),
          },
        ],
      };
    case "hackathons":
      return {
        output: [
          {
            type: "markdown",
            value: markdown(
              "Hackathons",
              portfolio.hackathons
                .map((h) => `### ${h.name}\n**Result:** ${h.result}\n**Project:** ${h.project}\n**Role:** ${h.role}\n\n${h.description}`)
                .join("\n\n---\n\n"),
            ),
          },
        ],
      };
    case "leadership":
      return {
        output: [
          {
            type: "markdown",
            value: markdown(
              "Leadership Roles",
              portfolio.leadership.map((item) => `- ${item}`).join("\n"),
            ),
          },
        ],
      };
    case "social":
      return {
        output: [
          {
            type: "markdown",
            value: markdown(
              "Social & Contact",
              `- GitHub: ${portfolio.links.github}\n- LinkedIn: ${portfolio.links.linkedin}\n- Email: ${portfolio.links.email}\n- Phone: ${portfolio.links.phone}`,
            ),
          },
        ],
      };
    case "pwd":
      return { output: [{ type: "text", value: "/home/kingsley/portfolio" }] };
    case "ls":
      return { output: [{ type: "text", value: ["about.md", "projects/", "skills/", "experience/", "blog/", "resume.pdf", "contact.form"].join("  ") }] };
    case "cat":
      return { output: [{ type: "markdown", value: markdown(joinedArgs || "portfolio.md", joinedArgs === "resume" ? `Focus areas: ${portfolio.identity.role}\n\n${portfolio.intro}` : portfolio.intro) }] };
    case "echo":
      return { output: [{ type: "text", value: joinedArgs }] };
    case "date":
      return { output: [{ type: "text", value: new Date().toString() }] };
    case "history":
      return { output: [{ type: "markdown", value: markdown("Command history", history.length ? history.map((entry, index) => `${index + 1}. ${entry}`).join("\n") : "No history yet.") }] };
    case "theme":
      return { theme: (args[0] as TerminalTheme | undefined) ?? "green", output: [{ type: "text", value: `Theme set to ${args[0] ?? "green"}` }] };
    case "matrix":
      return { matrix: true, output: [{ type: "matrix" }] };
    case "ascii":
      return { output: [{ type: "ascii", value: portfolio.asciiLogos.join("\n\n") }] };
    case "weather":
      return { output: [{ type: "markdown", value: markdown("Weather", args[0] ? `Live weather for ${joinedArgs} should be wired to an API key.` : "Pass a city name, e.g. weather Lagos.") }] };
    case "quote":
      return { output: [{ type: "markdown", value: markdown("Quote", "Simplicity is a feature. Clarity is a performance optimization.") }] };
    case "joke":
      return { output: [{ type: "markdown", value: markdown("Joke", "Why did the engineer keep a terminal open? For command presence.") }] };
    case "coffee":
      return { output: [{ type: "markdown", value: markdown("Coffee", "Brewing a deployable interface with extra espresso and zero boilerplate foam.") }] };
    case "timeline":
      return { output: [{ type: "markdown", value: markdown("Timeline", portfolio.experience.map((item) => `- ${item.period} · ${item.title} at ${item.company}`).join("\n")) }] };
    case "search":
      return { output: [{ type: "markdown", value: markdown("Search", `RAG context:\n\n${retrievePortfolioContext(joinedArgs).context}`) }] };
    case "exit":
      return { output: [{ type: "markdown", value: markdown("Session", "Terminal closed. Reload the page to continue.") }] };
    case "ai":
    case "ask":
      return { aiQuery: joinedArgs || input.replace(/^(ai|ask)\s*/i, "").trim() || "Give me Kingsley's overview.", output: [] };
    case "sudo":
      if (args[0]?.toLowerCase() === "hire-me") return { output: [{ type: "markdown", value: markdown("Root granted", "Great teams hire Kingsley.") }] };
      if (args[0]?.toLowerCase() === "make-me-rich") return { output: [{ type: "markdown", value: markdown("Transaction complete", "Impact first. Revenue follows.") }] };
      return { output: [{ type: "text", value: "Permission denied." }] };
    default:
      return { output: [{ type: "markdown", value: markdown("Unknown command", `\`${input}\` is not recognized. Try \`help\`, \`projects\`, or \`ai Tell me about Kingsley's cloud experience\`.`) }] };
  }
}

export function buildAIPrompt(question: string) {
  const retrieval = retrievePortfolioContext(question);
  return {
    context: retrieval.context,
    systemPrompt: [
      "You are Kingsley Korankye Baidu's personal AI terminal assistant embedded in his portfolio website.",
      "Your job is to answer visitor questions about Kingsley in a professional, friendly, confident, and concise manner.",
      "You have full access to Kingsley's background: he is a Software Engineer from Accra, Ghana who grew up in Nsawam.",
      "He specializes in backend engineering (Node.js, Express, PostgreSQL, Prisma, MongoDB), cloud infrastructure (AWS — Elastic Beanstalk, RDS, Amplify, CodePipeline), full-stack web (React, Next.js, TypeScript, Tailwind CSS), mobile apps (React Native, Expo), and game development (Godot Engine, GDScript).",
      "His professional experience includes: Tradelio Trading Technologies (primary backend engineer for Miyaka, a sexual harassment reporting platform), Dext Consortium (Dext Freelance frontend and Radici — a property listing platform for the Ghanaian diaspora), Backslash Technologies (rebuilt Arts & Cocktail platform backend from Laravel to Node.js, -30% page load, -120ms latency), Polymorph Labs (GIMPA admissions system with React, TypeScript, GraphQL), and OGames Studio (game developer intern, Godot Engine, GDScript, remote).",
      "His projects include: ClimateHealth Systems (GreenRes Hackathon 2026), Interactive AI Storyteller (3rd Place out of 12 teams — COMPSSA x Alle-AI Hackathon July 2025), Radici (property listing for Ghanaian diaspora), IPAM (IP Address Management System), and Student Result Management System.",
      "He is a proven leader: Senior Compound Overseer in primary school, Section Leader in JHS, Organizing Secretary for NUPS-G Akuafo Hall (2 years), Academic Committee Head of CSSA UG, led both hackathon teams, and led backend for Miyaka.",
      "Personal: Born in Cantonments Accra, raised in Nsawam. Christian. Attended Good Foundation International School, Rev. Father Wieggers R/C Basic School (BECE 2017), Pope John Senior High School & Minor Seminary (General Arts — Economics, Elective Maths, Geography, French), and University of Ghana (BSc Computer Science 2022–2025).",
      "After high school he spent a gap year learning to repair phones and electronics. He can fix computers, laptops, phones, and gadgets.",
      "Hobbies: football video games (FIFA/EA FC and PES), watching football (favorite club: Real Madrid).",
      "Career goal: to become one of the best Software Engineers in the world and make a positive impact in people's lives through everything he does.",
      "Answer questions using the context provided. If the question falls outside your knowledge, state what you know and be honest that you don't have more details.",
      "Use natural language with terminal-style clarity and a premium product tone. Keep answers concise but complete.",
    ].join(" "),
  };
}