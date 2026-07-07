import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type TerminalMarkdownProps = {
  content: string;
  className?: string;
};

export function TerminalMarkdown({ content, className }: TerminalMarkdownProps) {
  return (
    <div className={cn("space-y-4 text-sm leading-7 text-foreground/90", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-semibold text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-foreground">{children}</h3>,
          p: ({ children }) => <p className="text-sm leading-7 text-foreground/90">{children}</p>,
          ul: ({ children }) => <ul className="space-y-2 pl-4 text-sm text-foreground/90">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-2 pl-4 text-sm text-foreground/90">{children}</ol>,
          li: ({ children }) => <li className="list-disc">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-accent underline decoration-accent/40 underline-offset-4 transition hover:text-accent-2"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            const inline = !className;
            return inline ? (
              <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.84em] text-accent">
                {children}
              </code>
            ) : (
              <code className={cn("block overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-sm text-foreground", className)}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-foreground shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/60 pl-4 text-foreground/80">{children}</blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}