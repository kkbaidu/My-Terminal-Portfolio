"use client";

import { useEffect, useState } from "react";
import { ExternalLink, GitBranch, Star, Users } from "lucide-react";

import { cn } from "@/lib/utils";

type GitHubPayload = {
  user: {
    login: string;
    name: string | null;
    avatar_url: string;
    bio: string | null;
    followers: number;
    following: number;
    public_repos: number;
    html_url: string;
  };
  repos: Array<{
    name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    description: string | null;
    updated_at: string;
  }>;
  note: string;
};

export function GitHubProfile() {
  const [data, setData] = useState<GitHubPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/github")
      .then((response) => response.json())
      .then((payload: GitHubPayload) => setData(payload))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-muted">Loading GitHub snapshot...</div>;
  }

  if (!data) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-muted">GitHub snapshot unavailable.</div>;
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-4">
        <img src={data.user.avatar_url} alt={data.user.login} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {data.user.name ?? data.user.login}
            <a href={data.user.html_url} target="_blank" rel="noreferrer" className="text-accent">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-1 text-sm text-foreground/70">{data.user.bio ?? "No bio available."}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <Metric icon={<Users className="h-4 w-4" />} label="Followers" value={data.user.followers} />
        <Metric icon={<GitBranch className="h-4 w-4" />} label="Repos" value={data.user.public_repos} />
        <Metric icon={<Star className="h-4 w-4" />} label="Following" value={data.user.following} />
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Latest repos</p>
        {data.repos.slice(0, 4).map((repo) => (
          <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 bg-black/30 p-3 transition hover:border-accent/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{repo.name}</p>
                <p className="text-sm text-foreground/70">{repo.description ?? "No description available."}</p>
              </div>
              <span className={cn("rounded-full border border-white/10 px-2 py-1 text-xs text-muted")}>{repo.language ?? "—"}</span>
            </div>
          </a>
        ))}
      </div>

      <p className="text-xs leading-6 text-muted">{data.note}</p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
      <div className="mx-auto flex w-fit items-center gap-1 text-accent">{icon}</div>
      <div className="mt-1 text-base font-semibold text-foreground">{value}</div>
      <div className="text-xs uppercase tracking-[0.22em] text-muted">{label}</div>
    </div>
  );
}