"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Save, ArrowLeft, Loader2, Plus, Trash2,
  Package, DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface ProductData {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  salePrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  availability: string;
  status: string;
  brandId: string;
  universeId: string;
  brand?: { id: string; name: string; slug: string };
  universe?: { id: string; slug: string; title: string };
  benefits: string[];
  pros: string[];
  cons: string[];
  perfectFor: string[];
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  affiliateLinks: Array<{ id: string; network: string; url: string; label: string; commissionRate?: number; health: string }>;
  media: Array<{ id: string; url: string; altText?: string }>;
  variants: Array<{ id: string; sku: string; color?: string; size?: string; priceAdjustment: number; stockStatus: string }>;
  metadata?: { asin?: string; upc?: string; sku?: string; gtin?: string; manufacturer?: string; weightOz?: number };
  deals: Array<{ id: string; title: string; discount?: number; endsAt?: string }>;
  faqs: Array<{ id: string; question: string; answer: string; order: number }>;
  productCategories: Array<{ category: { id: string; name: string } }>;
  productTags: Array<{ tag: { id: string; name: string } }>;
}

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = !params?.id || params.id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "", slug: "", shortDescription: "", longDescription: "",
    price: "", salePrice: "", currency: "USD", rating: "", reviewCount: "",
    availability: "IN_STOCK", status: "DRAFT", brandId: "", universeId: "",
    benefits: [], pros: [], cons: [], perfectFor: [],
    seoTitle: "", metaDescription: "", canonicalUrl: "",
  });
  const [newBenefit, setNewBenefit] = useState("");
  const [newPro, setNewPro] = useState("");
  const [newCons, setNewCons] = useState("");
  const [newPerfect, setNewPerfect] = useState("");

  const fetchProduct = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/products/${params.id}`);
      const json = await res.json();
      if (json.success) {
        const p = json.data;
        setForm({
          name: p.name, slug: p.slug, shortDescription: p.shortDescription || "",
          longDescription: p.longDescription || "",
          price: String(p.price), salePrice: p.salePrice ? String(p.salePrice) : "",
          currency: p.currency || "USD", rating: String(p.rating || ""),
          reviewCount: String(p.reviewCount || ""),
          availability: p.availability || "IN_STOCK", status: p.status || "DRAFT",
          brandId: p.brandId, universeId: p.universeId,
          benefits: p.benefits || [], pros: p.pros || [], cons: p.cons || [],
          perfectFor: p.perfectFor || [],
          seoTitle: p.seoTitle || "", metaDescription: p.metaDescription || "",
          canonicalUrl: p.canonicalUrl || "",
        });
      }
    } catch { toast.error("Failed to load product"); }
    finally { setLoading(false); }
  }, [params.id, isNew]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        rating: parseFloat(form.rating) || 0,
        reviewCount: parseInt(form.reviewCount) || 0,
      };

      const url = isNew
        ? "/api/v1/products"
        : `/api/v1/admin/products/${params.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        toast.success(isNew ? "Product created" : "Product saved");
        if (isNew && json.data) router.push(`/admin/products/${json.data.id}`);
      } else {
        toast.error(json.error?.message || "Failed to save");
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const addArrayItem = (field: string, value: string, setter: any) => {
    if (!value.trim()) return;
    setForm({ ...form, [field]: [...form[field], value.trim()] });
    setter("");
  };

  const removeArrayItem = (field: string, index: number) => {
    setForm({ ...form, [field]: form[field].filter((_: any, i: number) => i !== index) });
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <Loader2 size={24} className="animate-spin text-[var(--admin-accent)]" />
    </div>
  );

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Package size={14} /> PRODUCT STUDIO
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="btn-admin btn-admin-ghost text-xs p-2"><ArrowLeft size={16} /></button>
              <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">
                {isNew ? "New Product" : `Edit: ${form.name || "Loading..."}`}
              </h1>
            </div>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">{isNew ? "Add a new product to the catalog." : `Status: ${form.status}`}</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-admin-primary text-xs">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Product</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">BASIC INFORMATION</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Product Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })}
                    placeholder="Linen Duvet Cover — Oat" className="input-admin w-full" />
                </div>
                <div>
                  <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="linen-duvet-cover-oat" className="input-admin w-full font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Short Description</label>
                <textarea value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Brief product description..." className="input-admin w-full h-20 resize-y" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Long Description</label>
                <textarea value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  placeholder="Full product description..." className="input-admin w-full h-40 resize-y" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]"><DollarSign size={14} className="inline" /> PRICING</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Price *</label>
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="248.00" className="input-admin w-full" type="number" step="0.01" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Sale Price</label>
                <input value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  placeholder="198.00" className="input-admin w-full" type="number" step="0.01" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="input-admin w-full">
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="EUR">EUR</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status & Availability */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">STATUS & AVAILABILITY</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-admin w-full">
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">In Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Availability</label>
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="input-admin w-full">
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="PREORDER">Preorder</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Rating</label>
                <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="4.9" className="input-admin w-full" type="number" step="0.1" max="5" />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">SEO & METADATA</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">SEO Title</label>
                <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Linen Duvet Cover — Oat | ALAYA INSIDER" className="input-admin w-full" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="Discover the stonewashed..." className="input-admin w-full h-20 resize-y" />
              </div>
              <div>
                <label className="text-xs text-[var(--admin-text-secondary)] block mb-1">Canonical URL</label>
                <input value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                  placeholder="https://alaya.com/products/linen-duvet-cover-oat" className="input-admin w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Benefits */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">BENEFITS</h3>
            <div className="flex gap-2 mb-3">
              <input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addArrayItem("benefits", newBenefit, setNewBenefit)}
                placeholder="Add benefit..." className="input-admin flex-1 text-sm" />
              <button onClick={() => addArrayItem("benefits", newBenefit, setNewBenefit)} className="btn-admin text-xs"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {form.benefits.map((b: string, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--admin-bg-active)] text-sm">
                  <span>{b}</span>
                  <button onClick={() => removeArrayItem("benefits", i)} className="text-[#F87171]"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Pros */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">PROS</h3>
            <div className="flex gap-2 mb-3">
              <input value={newPro} onChange={(e) => setNewPro(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addArrayItem("pros", newPro, setNewPro)}
                placeholder="Add pro..." className="input-admin flex-1 text-sm" />
              <button onClick={() => addArrayItem("pros", newPro, setNewPro)} className="btn-admin text-xs"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {form.pros.map((p: string, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--admin-bg-active)] text-sm">
                  <span>{p}</span>
                  <button onClick={() => removeArrayItem("pros", i)} className="text-[#F87171]"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Cons */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">CONS</h3>
            <div className="flex gap-2 mb-3">
              <input value={newCons} onChange={(e) => setNewCons(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addArrayItem("cons", newCons, setNewCons)}
                placeholder="Add con..." className="input-admin flex-1 text-sm" />
              <button onClick={() => addArrayItem("cons", newCons, setNewCons)} className="btn-admin text-xs"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {form.cons.map((c: string, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--admin-bg-active)] text-sm">
                  <span>{c}</span>
                  <button onClick={() => removeArrayItem("cons", i)} className="text-[#F87171]"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Perfect For */}
          <div className="admin-card p-6 border border-[var(--admin-border)]">
            <h3 className="text-sm font-medium mb-4 tracking-wider text-[var(--admin-accent)]">PERFECT FOR</h3>
            <div className="flex gap-2 mb-3">
              <input value={newPerfect} onChange={(e) => setNewPerfect(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addArrayItem("perfectFor", newPerfect, setNewPerfect)}
                placeholder="Add..." className="input-admin flex-1 text-sm" />
              <button onClick={() => addArrayItem("perfectFor", newPerfect, setNewPerfect)} className="btn-admin text-xs"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {form.perfectFor.map((p: string, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--admin-bg-active)] text-sm">
                  <span>{p}</span>
                  <button onClick={() => removeArrayItem("perfectFor", i)} className="text-[#F87171]"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        Changes are logged in the activity audit trail. Media, variants, affiliate links, and FAQ management are accessible from the product detail view.
      </div>
    </div>
  );
}
