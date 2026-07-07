import type { Metadata } from "next";

import { portfolio } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Projects | Kingsley Terminal Portfolio",
  description: "Selected full-stack, AI, cloud, and mobile projects.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground md:text-5xl">Built to solve real product problems.</h1>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {portfolio.projects.map((project) => (
            <article key={project.slug} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-accent">{project.slug}</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{project.name}</h2>
              <p className="mt-3 text-sm leading-7 text-foreground/75">{project.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span key={tech} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}