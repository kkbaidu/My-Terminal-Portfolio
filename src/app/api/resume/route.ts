import { NextResponse } from "next/server";

import { portfolio } from "@/lib/portfolio";

export async function GET() {
  const body = [
    portfolio.identity.name,
    portfolio.identity.role,
    "",
    portfolio.about,
    "",
    "Experience",
    ...portfolio.experience.flatMap((job) => [
      `${job.title} · ${job.company} · ${job.period}`,
      ...job.points.map((point) => `- ${point}`),
      "",
    ]),
    "",
    "Skills",
    ...portfolio.skills.map((group) => `${group.title}: ${group.items.map((item) => item.name).join(", ")}`),
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kingsley-resume.txt"',
    },
  });
}