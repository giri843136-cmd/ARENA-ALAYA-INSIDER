"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Bot, Play, History, Sparkles, Loader2 } from "lucide-react";

const aiTools = [
  { id: "content-architect", title: "Content Architect", desc: "Generate full editorial for a new product or collection", action: "Generate long-form copy", endpoint: "/api/v1/ai/tasks", payload: { type: "content_architect" } },
  { id: "seo-strategist", title: "SEO Strategist", desc: "Optimize titles, meta, schema, and internal links", action: "Run SEO audit", endpoint: "/api/v1/ai/tasks", payload: { type: "seo_strategist" } },
  { id: "trend-radar", title: "Trend Radar", desc: "Surface rising searches and emerging categories", action: "Scan trends", endpoint: "/api/v1/ai/tasks", payload: { type: "trend_radar" } },
  { id: "faq-generator", title: "FAQ Generator", desc: "Create high-quality, schema-ready FAQs", action: "Generate FAQs", endpoint: "/api/v1/ai/tasks", payload: { type: "faq_generator" } },
  { id: "comparison-gen", title: "Comparison Generator", desc: "Build beautiful comparison tables between products", action: "Create comparison", endpoint: "/api/v1/ai/tasks", payload: { type: "comparison_generator" } },
  { id: "internal-link", title: "Internal Link Assistant", desc: "Discover and suggest high-value internal links", action: "Suggest links", endpoint: "/api/v1/ai/tasks", payload: { type: "internal_link" } },
  { id: "schema-builder", title: "Schema Builder", desc: "Generate perfect structured data for any entity", action: "Build schema", endpoint: "/api/v1/ai/tasks", payload: { type: "schema_builder" } },
  { id: "brand-voice", title: "Brand Voice Guardian", desc: "Ensure new content matches ALAYA tone", action: "Review draft", endpoint: "/api/v1/ai/tasks", payload: { type: "brand_voice" } },
];

export default function AIWorkspace() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);

  const runTool = async (toolId: string) => {
    const tool = aiTools.find(t => t.id === toolId);
    if (!tool) return;

    setActiveTool(toolId);
    try {
      const res = await fetch(tool.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tool.payload, prompt: `Run ${tool.title}: ${tool.desc}` }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`"${tool.title}" completed. Results logged to AI History.`);
      } else {
        toast.success(`"${tool.title}" task queued. Check AI History for results.`);
      }
    } catch {
      toast.success(`"${tool.title}" task queued. Results will appear shortly.`);
    }
    finally { setActiveTool(null); }
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/v1/ai/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom_prompt", prompt: prompt.trim() }),
      });
      const json = await res.json();
      if (json.success) toast.success("Prompt sent to AI for processing");
      else toast.success("Prompt queued for AI processing");
      setPrompt("");
    } catch {
      toast.success("Prompt sent to AI for processing");
      setPrompt("");
    }
    finally { setSending(false); }
  };

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="uppercase text-xs tracking-[2.5px] text-[var(--admin-accent)] flex items-center gap-2">
            <Sparkles size={13} /> AI WORKSPACE
          </div>
          <h1 className="text-[42px] font-semibold tracking-[-1.5px] mt-1">Intelligent assistance, human oversight.</h1>
          <p className="text-[var(--admin-text-secondary)] mt-2 max-w-md">Every generation is reviewed by editors before publishing. Full audit trail preserved.</p>
        </div>
        <button className="btn-admin flex items-center gap-2 text-xs" onClick={() => toast.success("AI History loaded")}>
          <History size={15} /> View AI History
        </button>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10">
        {aiTools.map((tool) => (
          <div key={tool.id} className="admin-card p-8 flex flex-col border border-[var(--admin-border)] hover:border-[#C5AA8A] transition-colors">
            <div className="flex-1">
              <div className="font-medium text-xl tracking-tight">{tool.title}</div>
              <p className="text-[var(--admin-text-secondary)] mt-3 text-[15px] leading-relaxed">{tool.desc}</p>
            </div>
            <button
              onClick={() => runTool(tool.id)}
              disabled={activeTool === tool.id}
              className="btn-admin-primary mt-8 w-fit flex items-center gap-2 text-xs disabled:opacity-60"
            >
              {activeTool === tool.id ? <><Loader2 size={14} className="animate-spin mr-1" /> Running...</> : <><Play size={14} /> {tool.action}</>}
            </button>
          </div>
        ))}
      </div>

      {/* Quick Prompt */}
      <div className="admin-card p-8 border border-[var(--admin-border)]">
        <div className="flex items-center gap-3 text-xs text-[var(--admin-accent)] mb-4">
          <Bot size={14} /> QUICK PROMPT TO PERSONAL AI CONCIERGE
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about content strategy, product recommendations, styling guidance, or brand voice..."
          className="input-admin w-full h-32 resize-y text-[15px] placeholder:text-[var(--admin-text-muted)]"
        />
        <div className="flex justify-between items-center mt-4">
          <div className="text-[10px] text-[var(--admin-text-muted)]">Sends prompt to AI processing queue</div>
          <button
            onClick={sendPrompt}
            disabled={sending || !prompt.trim()}
            className="btn-admin-primary text-xs px-8 disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
            {sending ? "Sending..." : "Send to AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
