"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";

interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  inStock: boolean;
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('alaya-cart');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('alaya-cart', JSON.stringify(items));
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  useEffect(() => {
    setItems(loadCart());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) saveCart(items);
  }, [items, loading]);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 12;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  if (items.length === 0) {
    return (
      <div className="bg-[#F5F0EA] min-h-[70vh] flex items-center">
        <div className="container">
          <EmptyState
            title="Your cart is empty"
            description="Your cart is waiting to be filled with carefully curated pieces. Start exploring and add what speaks to you."
            icon="cart"
            actionLabel="Discover products"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      <div className="container py-12 px-6 md:px-0">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#6D655F] hover:text-[#C5AA8A] text-sm flex items-center gap-1.5 mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-[36px] tracking-[-1.5px] text-[#26221E]">
                Shopping Cart
              </h1>
              <p className="text-[#6D655F] mt-1.5 text-[15px]">
                {items.length} {items.length === 1 ? "item" : "items"} in your bag
              </p>
            </div>
            <button
              onClick={() => setItems([])}
              className="text-sm text-[#A36B6B] hover:underline flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E4DDD5] p-5 flex gap-5 hover:border-[#C5AA8A]/30 transition-colors"
              >
                {/* Image placeholder */}
                <div className="h-24 w-24 rounded-xl bg-[#EFE7DE] flex-shrink-0 flex items-center justify-center text-xs text-[#5C5249]">
                  {item.brand.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#6D655F] uppercase tracking-wider">
                        {item.brand}
                      </p>
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-[#26221E] font-medium hover:text-[#C5AA8A] transition-colors mt-0.5 block"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <p className="text-[#26221E] font-semibold whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-0 border border-[#E4DDD5] rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-9 w-9 flex items-center justify-center text-[#5C5249] hover:bg-[#EFE7DE] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="h-9 w-10 flex items-center justify-center text-sm font-medium text-[#26221E] border-x border-[#E4DDD5]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-9 w-9 flex items-center justify-center text-[#5C5249] hover:bg-[#EFE7DE] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-[#A36B6B] hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-[#6D655F]">
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-[#C5AA8A]" />
                Free shipping on orders over $150
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#C5AA8A]" />
                Secure checkout
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E4DDD5] p-6 sticky top-24">
              <h2 className="font-semibold text-[#26221E] mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#5C5249]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#26221E]">${subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[#5C5249]">
                  <span>Shipping</span>
                  <span className="font-medium text-[#26221E]">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(0)}`
                    )}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo (10%)</span>
                    <span>-${discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="h-px bg-[#E4DDD5]" />
                <div className="flex justify-between text-[#26221E] font-semibold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(0)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E4DDD5] text-sm bg-white text-[#26221E] placeholder:text-[#8A8178] focus:outline-none focus:ring-2 focus:ring-[#C5AA8A]/30 focus:border-[#C5AA8A] transition-all"
                  />
                  <button
                    onClick={() => {
                      if (promoCode.trim()) setPromoApplied(true);
                    }}
                    disabled={!promoCode.trim()}
                    className="px-4 py-2 rounded-xl bg-[#26221E] text-white text-sm font-medium hover:bg-[#3D3530] transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-green-600 mt-1.5">Promo code applied! 10% discount.</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (items.length === 0) { toast.error('Your cart is empty'); return; }
                  toast.success('Checkout coming soon! You would be redirected to secure payment.');
                }}
                className="w-full mt-6 py-3 bg-[#26221E] text-white text-sm font-medium rounded-xl hover:bg-[#3D3530] transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Proceed to Checkout — ${total.toFixed(0)}
              </button>

              <div className="mt-4 text-center text-xs text-[#8A8178]">
                <ShieldCheck size={14} className="inline mr-1" />
                Secure encrypted payment
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
