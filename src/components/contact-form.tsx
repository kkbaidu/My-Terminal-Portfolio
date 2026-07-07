"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Send } from "lucide-react";

import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus("idle");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
        <Mail className="h-4 w-4 text-accent" />
        Contact terminal
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-muted">Name</span>
          <input
            {...register("name")}
            className={cn("w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30", errors.name && "border-error")}
            placeholder="Your name"
          />
          {errors.name ? <p className="text-xs text-error">{errors.name.message}</p> : null}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.24em] text-muted">Email</span>
          <input
            {...register("email")}
            className={cn("w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30", errors.email && "border-error")}
            placeholder="you@example.com"
          />
          {errors.email ? <p className="text-xs text-error">{errors.email.message}</p> : null}
        </label>
        <label className="space-y-2 md:col-span-1">
          <span className="text-xs uppercase tracking-[0.24em] text-muted">Message</span>
          <textarea
            {...register("message")}
            rows={3}
            className={cn("w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30", errors.message && "border-error")}
            placeholder="Tell Kingsley what you're building"
          />
          {errors.message ? <p className="text-xs text-error">{errors.message.message}</p> : null}
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send message
        </button>
        <span className={cn("text-sm", status === "success" && "text-accent", status === "error" && "text-error", status === "idle" && "text-muted")}>
          {status === "success" ? "Message queued successfully." : status === "error" ? "Message failed to send." : "Reply path ready for Vercel deployment."}
        </span>
      </div>
    </form>
  );
}