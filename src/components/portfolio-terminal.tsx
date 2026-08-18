"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Copy, ExternalLink, Maximize2, Search, Sparkles, TerminalSquare, X } from "lucide-react";

import { BootSequence } from "@/components/boot-sequence";
import { ContactForm } from "@/components/contact-form";
import { GitHubProfile } from "@/components/github-profile";
import { TerminalMarkdown } from "@/components/terminal-markdown";
import { portfolio } from "@/lib/portfolio";
import { buildAIPrompt, executeCommand, getCommandSuggestions, type TerminalOutputEntry, type TerminalTheme } from "@/lib/commands";
import { cn } from "@/lib/utils";

type TerminalEntry = {
  id: string;
  kind: "system" | "command" | "result" | "ai";
  value: string;
  prompt?: string;
  output?: TerminalOutputEntry[];
  loading?: boolean;
};

const bootLines = [
  { label: "Kernel", progress: 100 },
  { label: "Portfolio index", progress: 100 },
  { label: "AI assistant", progress: 100 },
  { label: "GitHub bridge", progress: 95 },
  { label: "Command shell", progress: 100 },
];

const accentThemes: Record<TerminalTheme, string> = {
  green: "#00FF9C",
  blue: "#4CC9F0",
  purple: "#C084FC",
  amber: "#FFB703",
};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function TypingText({ text }: { text: string }) {
  return <span>{text}</span>;
}

function ThemeSwatch({ label, value, active, onClick }: { label: TerminalTheme; value: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2 text-xs uppercase tracking-[0.22em] transition",
        active ? "border-white/20 bg-white/10 text-foreground" : "border-white/10 bg-black/30 text-muted hover:border-white/20",
      )}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: value }} />
      {label}
    </button>
  );
}

export function PortfolioTerminal() {
  const [bootPhase, setBootPhase] = useState(0);
  const [bootLine, setBootLine] = useState("Initializing portfolio...");
  const [bootDone, setBootDone] = useState(false);
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: createId(),
      kind: "system",
      value: `Welcome to ${portfolio.identity.name}'s terminal portfolio. Type ${portfolio.identity.handle}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState<TerminalTheme>("green");
  const [matrixMode, setMatrixMode] = useState(false);
  const [currentCommand, setCurrentCommand] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const sequence = [
      "Initializing Portfolio...",
      "Loading kernel...",
      "Checking environment...",
      "Loading AI assistant...",
      "Connecting GitHub...",
      "Loading projects...",
      "Done.",
      `Welcome ${portfolio.identity.name}.`,
    ];

    let index = 0;
    const interval = window.setInterval(() => {
      setBootLine(sequence[index]);
      setBootPhase(index + 1);
      index += 1;
      if (index >= sequence.length) {
        window.clearInterval(interval);
        window.setTimeout(() => setBootDone(true), 550);
      }
    }, 520);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && matrixMode) {
        setMatrixMode(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [matrixMode]);

  useEffect(() => {
    const commandSuggestions = getCommandSuggestions(input);
    setSuggestions(input ? commandSuggestions : []);
  }, [input]);

  async function executeAiQuery(query: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    const entryId = createId();
    setEntries((current) => [
      ...current,
      { id: entryId, kind: "ai", value: `AI>${query}`, loading: true, output: [] },
    ]);

    try {
      const payload = buildAIPrompt(query);
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query, ...payload }),
        signal: controller.signal,
      });

      if (!response.body) {
        throw new Error("Missing response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(chunk, { stream: true });
        const snapshot = accumulated;
        setEntries((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? { ...entry, value: snapshot, loading: true, output: [{ type: "markdown" as const, value: snapshot }] }
              : entry,
          ),
        );
      }

      const final = accumulated;
      setEntries((current) =>
        current.map((entry) =>
          entry.id === entryId
            ? { ...entry, value: final, loading: false, output: [{ type: "markdown" as const, value: final }] }
            : entry,
        ),
      );
    } catch {
      setEntries((current) =>
        current.map((entry) =>
          entry.id === entryId
            ? { ...entry, value: "AI request interrupted.", loading: false, output: [{ type: "text" as const, value: "AI request interrupted." }] }
            : entry,
        ),
      );
    }
  }

  function appendOutput(command: string, output: TerminalOutputEntry[]) {
    setEntries((current) => [
      ...current,
      { id: createId(), kind: "command", value: command },
      { id: createId(), kind: "result", value: command, output },
    ]);
  }

  function scrollToBottom() {
    window.requestAnimationFrame(() => {
      const el = document.getElementById("terminal-scroll");
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  async function runCommand(command: string) {
    const normalized = command.trim();
    if (!normalized) return;

    if (normalized.toLowerCase().startsWith("ai ") || normalized.toLowerCase().startsWith("ask ")) {
      setEntries((current) => [...current, { id: createId(), kind: "command", value: command }]);
      setHistory((current) => [normalized, ...current].slice(0, 50));
      setHistoryIndex(-1);
      setCurrentCommand(command);
      setInput("");
      await executeAiQuery(normalized.replace(/^(ai|ask)\s*/i, ""));
      return;
    }

    const result = executeCommand(normalized, history);
    if (result.matrix) setMatrixMode(true);
    if (result.theme) setTheme(result.theme);
    if (result.output.length) appendOutput(normalized, result.output);
    if (result.clear) setEntries([]);
    if (result.aiQuery) {
      await executeAiQuery(result.aiQuery);
    }

    setHistory((current) => [normalized, ...current].slice(0, 50));
    setHistoryIndex(-1);
    setCurrentCommand(command);
    setInput("");
    scrollToBottom();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      const firstSuggestion = suggestions[0];
      if (firstSuggestion) {
        const rest = input.trim().includes(" ") ? input : firstSuggestion;
        setInput(`${rest}${input.endsWith(" ") ? "" : " "}`);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = Math.min(history.length - 1, historyIndex + 1);
      if (history[nextIndex]) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex < 0) {
        setHistoryIndex(-1);
        setInput("");
      } else if (history[nextIndex]) {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      setEntries([]);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      if (abortRef.current) abortRef.current.abort();
      setInput("");
      setEntries((current) => [...current, { id: createId(), kind: "system", value: "^C" }]);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      void runCommand(input);
    }
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, [bootDone]);

  const accent = accentThemes[theme];

  const stats = useMemo(() => portfolio.stats, []);

  if (!bootDone) {
    return <BootSequence lines={bootLines} currentLine={bootLine} completed={bootPhase >= 7} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-100 [background-image:radial-gradient(circle_at_20%_20%,rgba(0,255,156,0.12),transparent_0_30%),radial-gradient(circle_at_80%_10%,rgba(76,201,240,0.10),transparent_0_24%),linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:auto,auto,100%_4px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col gap-4">
        <header className="terminal-glass flex flex-col gap-4 rounded-[2rem] border border-white/10 px-4 py-4 md:px-6 md:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent shadow-[0_0_24px_rgba(0,255,156,0.16)]">
              <TerminalSquare className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted">Interactive Terminal Portfolio</p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">{portfolio.identity.name}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-7 text-foreground/75">{portfolio.identity.role}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeSwatch label="green" value="#00FF9C" active={theme === "green"} onClick={() => setTheme("green")} />
            <ThemeSwatch label="blue" value="#4CC9F0" active={theme === "blue"} onClick={() => setTheme("blue")} />
            <ThemeSwatch label="purple" value="#C084FC" active={theme === "purple"} onClick={() => setTheme("purple")} />
            <ThemeSwatch label="amber" value="#FFB703" active={theme === "amber"} onClick={() => setTheme("amber")} />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="terminal-glass noise scanlines flex min-h-[72vh] flex-col rounded-[2rem] border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                {portfolio.identity.handle}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <button type="button" onClick={() => setMatrixMode(true)} className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-accent/30 hover:text-accent">
                  matrix
                </button>
                <button type="button" onClick={() => setEntries([])} className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-accent/30 hover:text-accent">
                  clear
                </button>
                <button type="button" onClick={() => navigator.clipboard.writeText(entries.map((entry) => `${entry.kind}: ${entry.value}`).join("\n"))} className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-accent/30 hover:text-accent">
                  copy
                </button>
              </div>
            </div>

            <div id="terminal-scroll" className="flex-1 space-y-4 overflow-y-auto px-4 py-5 font-mono text-sm md:px-5">
              {entries.map((entry) => (
                <TerminalEntryView
                  key={entry.id}
                  entry={entry}
                  accent={accent}
                  onCopy={(text) => {
                    void navigator.clipboard.writeText(text);
                    setCopiedId(entry.id);
                    window.setTimeout(() => setCopiedId(null), 1000);
                  }}
                  copied={copiedId === entry.id}
                  onSectionChange={setActiveSection}
                />
              ))}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent">{portfolio.identity.handle}</span>
                  <span className="text-foreground/70">{input || ""}</span>
                  <span className="blink-cursor text-accent">▋</span>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 focus-within:border-accent/30">
                    <span className="text-accent/80">$</span>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type help, projects, ask, matrix..."
                      className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button type="button" onClick={() => void runCommand(input)} className="rounded-xl border border-accent/30 bg-accent/10 p-2 text-accent transition hover:bg-accent/15">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted">
                    {suggestions.slice(0, 4).map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => setInput(suggestion + " ")} className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-accent/30 hover:text-accent">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="terminal-glass rounded-[2rem] border border-white/10 p-4 md:p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-muted">Status</p>
              <div className="mt-4 space-y-3">
                <StatusRow label="Location" value={portfolio.identity.location} />
                <StatusRow label="Availability" value={portfolio.identity.availability} />
                <StatusRow label="Active" value={activeSection} />
                <StatusRow label="Theme" value={theme} />
              </div>
            </div>

            <div className="terminal-glass rounded-[2rem] border border-white/10 p-4 md:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.32em] text-muted">Quick stats</p>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xl font-semibold text-foreground">{stat.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.24em] text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="terminal-glass rounded-[2rem] border border-white/10 p-4 md:p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-muted">Shortcuts</p>
              <div className="mt-4 space-y-2 text-sm text-foreground/80">
                <ShortcutRow keys="Tab" label="Autocomplete" />
                <ShortcutRow keys="Ctrl + L" label="Clear screen" />
                <ShortcutRow keys="Ctrl + C" label="Cancel input" />
                <ShortcutRow keys="Esc" label="Exit matrix mode" />
              </div>
            </div>

            <div className="terminal-glass rounded-[2rem] border border-white/10 p-4 md:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.32em] text-muted">Featured links</p>
                <ExternalLink className="h-4 w-4 text-accent" />
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <LinkRow href={portfolio.links.github} label="GitHub" />
                <LinkRow href={portfolio.links.linkedin} label="LinkedIn" />
                <LinkRow href={portfolio.links.blog} label="Blog" />
              </div>
            </div>
          </aside>
        </section>
      </div>

      <AnimatePresence>
        {matrixMode ? <MatrixOverlay onClose={() => setMatrixMode(false)} accent={accent} /> : null}
      </AnimatePresence>
    </div>
  );
}

/** Triggers a section change after render, avoiding setState-during-render. */
function SectionEffect({ section, onSectionChange }: { section: string; onSectionChange: (v: string) => void }) {
  useEffect(() => { onSectionChange(section); }, [section, onSectionChange]);
  return null;
}

function TerminalEntryView({ entry, accent, onCopy, copied, onSectionChange }: { entry: TerminalEntry; accent: string; onCopy: (text: string) => void; copied: boolean; onSectionChange: (value: string) => void; }) {
  if (entry.kind === "system") {
    return <div className="text-muted">{entry.value}</div>;
  }

  if (entry.kind === "command") {
    return (
      <div className="flex items-start gap-3 text-foreground/95">
        <span style={{ color: accent }}>{portfolio.identity.handle}</span>
        <span className="break-all">{entry.value}</span>
      </div>
    );
  }

  if (entry.loading && (!entry.output || entry.output.length === 0)) {
    return (
      <div className="flex items-center gap-2 text-muted text-sm">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
        Generating response...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entry.output?.map((output, index) => {
        if (output.type === "text") {
          return (
            <div key={index} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-foreground/85">
              <div className="flex items-start justify-between gap-3">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7">{output.value}</pre>
                <button type="button" onClick={() => onCopy(output.value)} className="rounded-full border border-white/10 p-2 text-muted transition hover:border-accent/30 hover:text-accent">
                  {copied ? <X className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          );
        }

        if (output.type === "markdown") {
          return (
            <div key={index} className="rounded-3xl border border-white/10 bg-black/35 p-4 md:p-5">
              <TerminalMarkdown content={output.value} />
            </div>
          );
        }

        if (output.type === "ascii") {
          return (
            <div key={index} className="rounded-3xl border border-white/10 bg-black/35 p-4 font-mono text-[0.68rem] leading-4 text-accent/85">
              <pre className="overflow-x-auto whitespace-pre-wrap">{output.value}</pre>
            </div>
          );
        }

        if (output.type === "projects") {
          return (
            <div key={index} className="grid gap-4 xl:grid-cols-2">
              <SectionEffect section="projects" onSectionChange={onSectionChange} />
              {portfolio.projects.map((project) => (
                <article key={project.slug} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-muted">Project</p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{project.name}</h3>
                      <p className="mt-1 text-sm text-foreground/75">{project.headline}</p>
                    </div>
                    <div className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent">{project.slug}</div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-foreground/80">{project.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-foreground/75">{item}</span>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-foreground/70">
                    <p><span className="text-accent">Challenge:</span> {project.challenge}</p>
                    <p><span className="text-accent">Lesson:</span> {project.lesson}</p>
                    <p><span className="text-accent">Architecture:</span> {project.architecture}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {project.github ? <a href={project.github} className="text-accent underline underline-offset-4">GitHub</a> : null}
                    {project.demo ? <a href={project.demo} className="text-accent-2 underline underline-offset-4">Demo</a> : null}
                  </div>
                </article>
              ))}
            </div>
          );
        }

        if (output.type === "skills") {
          return (
            <div key={index} className="grid gap-4 lg:grid-cols-2">
              <SectionEffect section="skills" onSectionChange={onSectionChange} />
              {portfolio.skills.map((group) => (
                <div key={group.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                  <div className="mt-4 space-y-4">
                    {group.items.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-foreground/80">
                          <span>{item.name}</span>
                          <span>{item.level}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${item.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (output.type === "experience") {
          return (
            <div key={index} className="space-y-4">
              <SectionEffect section="experience" onSectionChange={onSectionChange} />
              {portfolio.experience.map((job) => (
                <div key={`${job.company}-${job.title}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                      <p className="text-sm text-foreground/75">{job.company}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted">{job.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-7 text-foreground/80">
                    {job.points.map((point) => <li key={point} className="list-disc pl-4">{point}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          );
        }

        if (output.type === "resume") {
          return (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <SectionEffect section="resume" onSectionChange={onSectionChange} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Resume</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">Kingsley Resume Preview</h3>
                </div>
                <a href="#" className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">Download PDF</a>
              </div>
              <div className="mt-4 grid gap-4 text-sm text-foreground/80 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Highlights</p>
                  <p className="mt-2 leading-7">Full-stack engineering, AI assistants, cloud delivery, mobile development, and product-minded execution.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Contact</p>
                  <p className="mt-2 leading-7">Use the contact form below or the email route. This area can host a PDF export with Vercel deploys.</p>
                </div>
              </div>
            </div>
          );
        }

        if (output.type === "articles") {
          return (
            <div key={index} className="grid gap-4 md:grid-cols-2">
              <SectionEffect section="blog" onSectionChange={onSectionChange} />
              {portfolio.articles.map((article) => (
                <article key={article.slug} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Article</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{article.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-foreground/75">{article.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">{tag}</span>)}
                  </div>
                </article>
              ))}
            </div>
          );
        }

        if (output.type === "contact") {
          return (
            <div key={index}>
              <SectionEffect section="contact" onSectionChange={onSectionChange} />
              <ContactForm />
            </div>
          );
        }

        if (output.type === "github") {
          return (
            <div key={index}>
              <SectionEffect section="github" onSectionChange={onSectionChange} />
              <GitHubProfile />
            </div>
          );
        }

        if (output.type === "stat-grid") {
          return (
            <div key={index} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SectionEffect section="overview" onSectionChange={onSectionChange} />
              {portfolio.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-foreground/85">{value}</span>
    </div>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
      <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">{keys}</span>
      <span>{label}</span>
    </div>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition hover:border-accent/30 hover:text-accent">
      <span>{label}</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function MatrixOverlay({ onClose, accent }: { onClose: () => void; accent: string }) {
  const columns = Array.from({ length: 24 }, (_, index) => index);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95"
    >
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/60 p-3 text-white">
        <Maximize2 className="h-4 w-4" />
      </button>
      <div className="grid h-full grid-cols-12 gap-2 p-6 text-xs leading-4 text-accent/90">
        {columns.map((column) => (
          <div key={column} className="space-y-3 font-mono text-accent/80">
            {Array.from({ length: 24 }, (_, row) => (
              <motion.p
                key={row}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.4 + column * 0.04, repeat: Infinity, delay: row * 0.06 }}
                style={{ color: row % 2 === 0 ? accent : "#00FF9C" }}
              >
                {Math.random() > 0.5 ? "1" : "0"}
              </motion.p>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}