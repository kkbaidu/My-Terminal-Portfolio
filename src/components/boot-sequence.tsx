"use client";

import { motion } from "framer-motion";

type BootSequenceProps = {
  lines: Array<{ label: string; progress: number }>;
  currentLine: string;
  completed: boolean;
};

export function BootSequence({ lines, currentLine, completed }: BootSequenceProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="terminal-glass noise scanlines w-full max-w-4xl rounded-[2rem] border border-white/10 p-6 shadow-2xl md:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent/80">System boot</p>
            <h1 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl md:text-4xl">Kingsley Terminal Portfolio</h1>
          </div>
          <div className="rounded-full border border-accent/20 bg-accent/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-accent">
            <span className={completed ? "text-accent" : "blink-cursor"}>●</span> initializing
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-5 font-mono text-sm text-foreground/90">
            <pre className="overflow-x-auto whitespace-pre-wrap text-[0.82rem] leading-5 text-accent/80">
{String.raw` ____  _                 _                 
|  _ \(_) ___  ___ _   _| | ___  _ __ ___  
| | | | |/ __|/ __| | | | |/ _ \| '__/ _ \ 
| |_| | | (__| (__| |_| | | (_) | | |  __/ 
|____/|_|\___|\___|\__,_|_|\___/|_|  \___|`}
            </pre>
            <div className="space-y-3">
              {lines.map((line) => (
                <div key={line.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
                    <span>{line.label}</span>
                    <span>{line.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${line.progress}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 text-sm text-foreground/80">
              <p>{currentLine}</p>
              {!completed ? <p className="blink-cursor text-accent">▋</p> : <p className="text-accent">Welcome Kingsley.</p>}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-muted">Boot checklist</p>
              <div className="mt-4 space-y-3 text-sm text-foreground/85">
                <p>Initializing portfolio...</p>
                <p>Loading kernel...</p>
                <p>Checking environment...</p>
                <p>Loading AI assistant...</p>
                <p>Connecting GitHub...</p>
                <p>Loading projects...</p>
                <p>Done.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm text-foreground/90">
              Built to feel like a real OS, with terminal commands, AI retrieval, project cards, and premium motion.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}