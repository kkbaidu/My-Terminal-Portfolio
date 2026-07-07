import type { Metadata } from "next";

import { portfolio } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Blog | Kingsley Terminal Portfolio",
  description: "Notes on AI, cloud systems, and product engineering.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Blog</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground md:text-5xl">Notes on building useful systems.</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {portfolio.articles.map((article) => (
            <article key={article.slug} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-accent">{article.date}</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-foreground/75">{article.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                    {tag}
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