import { NextResponse } from "next/server";

import { portfolio } from "@/lib/portfolio";

const username = process.env.GITHUB_USERNAME ?? "kingsley";

export async function GET() {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Kingsley-Terminal-Portfolio",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [userResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 300 } }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers, next: { revalidate: 300 } }),
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error("GitHub API request failed");
    }

    const user = (await userResponse.json()) as {
      login: string;
      name: string | null;
      avatar_url: string;
      bio: string | null;
      followers: number;
      following: number;
      public_repos: number;
      html_url: string;
    };

    const repos = (await reposResponse.json()) as Array<{
      name: string;
      html_url: string;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      description: string | null;
      updated_at: string;
    }>;

    return NextResponse.json({
      user,
      repos,
      note: "Contribution graph and pinned projects can be expanded with a GitHub token and GraphQL endpoint.",
    });
  } catch {
    return NextResponse.json({
      user: {
        login: username,
        name: portfolio.identity.name,
        avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
        bio: "Live GitHub data is unavailable right now.",
        followers: 0,
        following: 0,
        public_repos: 0,
        html_url: `https://github.com/${username}`,
      },
      repos: [],
      note: "Set GITHUB_USERNAME and optionally GITHUB_TOKEN to enable live data.",
    });
  }
}