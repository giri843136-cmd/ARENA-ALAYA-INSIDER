"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw, ExternalLink } from "lucide-react";

interface ArticleData {
  id: string; title: string; slug: string; status: string; featured: boolean;
  publishedAt: string | null; createdAt: string;
  author?: { id: string; name: string; slug: string } | null;
  universe?: { id: string; title: string; slug: string } | null;
  _count?: { comments: number };
}

export default function JournalAdmin() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ published: 0, draft: 0, review: 0, scheduled: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/articles?limit=100&status=PUBLISHED");
      const json = await res.json();
      if (json.success) {
        setArticles(json.data || []);
        // Get counts for different statuses
        const allRes = await fetch("/api/v1/articles?limit=1");
        const allJson = await allRes.json();
        const total = allJson.pagination?.total || json.pagination?.total || 0;
        setStats({ published: total, draft: 0, review: 0, scheduled: 0 });
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles, refreshKey]);

  const recentArticles = articles.slice(0, 10);

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-[2.5px] text-[var(--admin-accent)]">INSIDER JOURNAL</div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] mt-1">
              {loading ? "Loading..." : `${stats.published} published`}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setRefreshKey(k => k + 1)} className="btn-admin text-xs"><RefreshCw size={14} /> Refresh</button>
            <Link href="/admin/story-builder" className="btn-admin-primary text-xs flex items-center gap-1"><Plus size={14} /> New Essay</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Stats */}
        <div className="admin-card p-7">
          <div className="text-xs text-[var(--admin-accent)] tracking-widest mb-1">TOTAL ARTICLES</div>
          <div className="text-4xl font-semibold">{loading ? "..." : stats.published}</div>
          <div className="text-sm text-[var(--admin-text-secondary)]">Published essays</div>
          <div className="mt-6 text-xs text-[var(--admin-text-muted)]">Use Story Builder to create new content.</div>
        </div>

        <div className="lg:col-span-2 admin-card p-7">
          <div className="flex justify-between mb-5">
            <div>
              <div className="text-xs text-[var(--admin-accent)] tracking-widest">STORY BUILDER</div>
              <div className="font-medium text-lg">Create beautiful long-form content</div>
            </div>
            <Link href="/admin/story-builder" className="btn-admin-primary text-xs">New Essay</Link>
          </div>
          <div className="text-sm text-[var(--admin-text-secondary)]">
            Access the full editorial workspace to write, preview, and publish articles with AI assistance.
          </div>
        </div>
      </div>

      <div className="admin-card p-6 mt-6">
        <div className="text-xs tracking-widest text-[var(--admin-accent)] mb-4">RECENT ESSAYS</div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" /></div>
        ) : recentArticles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[var(--admin-text-secondary)]">No articles yet</p>
            <Link href="/admin/story-builder" className="text-xs text-[var(--admin-accent)] hover:underline mt-2 inline-block">Create your first essay →</Link>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {recentArticles.map((article) => (
              <div key={article.id} className="flex justify-between border-b border-[var(--admin-border)] pb-3 last:border-none items-center">
                <div className="flex items-center gap-3">
                  <span>{article.title}</span>
                  {article.featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]">Featured</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--admin-text-muted)]">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Draft"}
                  </span>
                  <a href={`/journal/${article.slug}`} target="_blank" className="text-[var(--admin-accent)] hover:underline">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        {recentArticles.length > 0 && (
          <Link href="/journal" className="text-xs text-[var(--admin-accent)] mt-4 block">View public journal →</Link>
        )}
      </div>
    </div>
  );
}
