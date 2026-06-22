"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Package, Heart, Bell, CreditCard, Settings, LogOut, ChevronRight, MapPin, Shield } from "lucide-react";

type TabType = "overview" | "orders" | "addresses" | "payment" | "security";

const MOCK_ORDERS = [
  {
    id: "ORD-2026-0421",
    date: "April 21, 2026",
    status: "Delivered",
    total: 189,
    items: 2,
    image: "/images/products/linen-bedding.jpg",
  },
  {
    id: "ORD-2026-0315",
    date: "March 15, 2026",
    status: "Delivered",
    total: 68,
    items: 1,
    image: "/images/products/ceramic-pour-over.jpg",
  },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: User },
    { id: "orders" as const, label: "Orders", icon: Package },
    { id: "addresses" as const, label: "Addresses", icon: MapPin },
    { id: "payment" as const, label: "Payment", icon: CreditCard },
    { id: "security" as const, label: "Security", icon: Shield },
  ];

  const sidebarLinks = [
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings/notifications", label: "Preferences", icon: Settings },
  ];

  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      <div className="container py-12 px-6 md:px-0">
        {/* Page Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-[#6D655F] hover:text-[#C5AA8A] text-sm flex items-center gap-1.5 mb-3 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="font-display text-[36px] tracking-[-1.5px] text-[#26221E]">
            My Account
          </h1>
          <p className="text-[#6D655F] mt-1.5 text-[15px]">
            Manage your profile, orders, and preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#26221E] text-[#F5F0EA]"
                      : "text-[#5C5249] hover:bg-white/60 hover:text-[#26221E]"
                  }`}
                >
                  <tab.icon size={17} />
                  {tab.label}
                  <ChevronRight
                    size={14}
                    className={`ml-auto transition-opacity ${
                      activeTab === tab.id ? "opacity-70" : "opacity-0"
                    }`}
                  />
                </button>
              ))}
            </nav>

            <div className="h-px bg-[#E4DDD5] my-6" />

            <nav className="space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#5C5249] hover:bg-white/60 hover:text-[#26221E] transition-all"
                >
                  <link.icon size={17} />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="h-px bg-[#E4DDD5] my-6" />

            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#A36B6B] hover:bg-red-50/60 transition-all">
              <LogOut size={17} />
              Sign Out
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-[#E4DDD5] p-8">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-full bg-[#26221E] flex items-center justify-center">
                      <span className="text-[#F5F0EA] text-xl font-semibold">A</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#26221E]">Alex Morgan</h2>
                      <p className="text-sm text-[#6D655F]">alex@example.com</p>
                      <p className="text-sm text-[#6D655F]">Member since 2026</p>
                    </div>
                    <button className="ml-auto text-sm text-[#C5AA8A] hover:underline">
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-[#E4DDD5] p-6">
                    <Package size={20} className="text-[#C5AA8A] mb-3" />
                    <div className="text-2xl font-semibold text-[#26221E]">2</div>
                    <div className="text-sm text-[#6D655F]">Orders</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E4DDD5] p-6">
                    <Heart size={20} className="text-[#C5AA8A] mb-3" />
                    <div className="text-2xl font-semibold text-[#26221E]">12</div>
                    <div className="text-sm text-[#6D655F]">Wishlist Items</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E4DDD5] p-6">
                    <Bell size={20} className="text-[#C5AA8A] mb-3" />
                    <div className="text-2xl font-semibold text-[#26221E]">4</div>
                    <div className="text-sm text-[#6D655F]">Notifications</div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#26221E]">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-sm text-[#C5AA8A] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {MOCK_ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl border border-[#E4DDD5] p-4 flex items-center gap-4"
                      >
                        <div className="h-14 w-14 rounded-lg bg-[#EFE7DE] flex-shrink-0 flex items-center justify-center text-xs text-[#5C5249]">
                          {order.items} items
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#26221E]">
                            {order.id}
                          </p>
                          <p className="text-xs text-[#6D655F]">{order.date}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                          {order.status}
                        </span>
                        <span className="text-sm font-medium text-[#26221E]">
                          ${order.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-[#E4DDD5] p-8">
                <h2 className="text-lg font-semibold text-[#26221E] mb-6">Order History</h2>
                {MOCK_ORDERS.length > 0 ? (
                  <div className="space-y-4">
                    {MOCK_ORDERS.map((order) => (
                      <div
                        key={order.id}
                        className="border border-[#E4DDD5] rounded-xl p-5 flex items-center justify-between hover:border-[#C5AA8A] transition-colors"
                      >
                        <div>
                          <p className="font-medium text-[#26221E]">{order.id}</p>
                          <p className="text-sm text-[#6D655F] mt-0.5">{order.date}</p>
                          <p className="text-sm text-[#6D655F]">{order.items} items · ${order.total}</p>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium">
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#6D655F] text-center py-12">No orders yet.</p>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl border border-[#E4DDD5] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#26221E]">Saved Addresses</h2>
                  <button className="text-sm text-[#C5AA8A] hover:underline">+ Add New</button>
                </div>
                <div className="border border-dashed border-[#E4DDD5] rounded-xl p-8 text-center">
                  <MapPin size={24} className="mx-auto mb-2 text-[#C5AA8A]" />
                  <p className="text-sm text-[#6D655F]">No addresses saved yet.</p>
                  <p className="text-xs text-[#8A8178] mt-1">Add an address for faster checkout.</p>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="bg-white rounded-2xl border border-[#E4DDD5] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#26221E]">Payment Methods</h2>
                  <button className="text-sm text-[#C5AA8A] hover:underline">+ Add New</button>
                </div>
                <div className="border border-dashed border-[#E4DDD5] rounded-xl p-8 text-center">
                  <CreditCard size={24} className="mx-auto mb-2 text-[#C5AA8A]" />
                  <p className="text-sm text-[#6D655F]">No payment methods saved.</p>
                  <p className="text-xs text-[#8A8178] mt-1">Your payment info is stored securely.</p>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-2xl border border-[#E4DDD5] p-8">
                <h2 className="text-lg font-semibold text-[#26221E] mb-6">Security & Sign-In</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-[#E4DDD5]">
                    <div>
                      <p className="text-sm font-medium text-[#26221E]">Password</p>
                      <p className="text-xs text-[#6D655F]">Last changed 3 months ago</p>
                    </div>
                    <button className="text-sm text-[#C5AA8A] hover:underline">Update</button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#E4DDD5]">
                    <div>
                      <p className="text-sm font-medium text-[#26221E]">Two-Factor Authentication</p>
                      <p className="text-xs text-[#6D655F]">Add an extra layer of security</p>
                    </div>
                    <button className="text-sm text-[#C5AA8A] hover:underline">Enable</button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[#26221E]">Active Sessions</p>
                      <p className="text-xs text-[#6D655F]">1 active session</p>
                    </div>
                    <button className="text-sm text-[#A36B6B] hover:underline">Revoke all</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
