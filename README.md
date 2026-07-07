# Kingsley Terminal Portfolio

An AI-powered terminal portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, markdown rendering, and the Vercel AI SDK.

## Features

- Fake boot sequence with typing and progress bars
- Custom terminal with history, autocomplete, shortcuts, and theme switching
- AI assistant backed by retrieval over portfolio data
- Project, skill, experience, blog, and resume commands
- Contact form with API route and optional Resend delivery
- Markdown rendering with syntax highlighting
- SEO-friendly `/blog` and `/projects` routes
- Dark-only futuristic UI with glassmorphism and neon accents

## Getting Started

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Open the app at `http://localhost:3000`.

## Commands

Try `help`, `projects`, `skills`, `about`, `resume`, `contact`, `blog`, `matrix`, `theme blue`, or `ask Why should I hire Kingsley?`.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` if you want to override the default model
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

## Deploying

Deploy to Vercel as a standard Next.js app. The AI route falls back to a local response if no OpenAI key is configured, so the app still works during preview.
