"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Search, RefreshCw, Loader2, Shield, UserCheck,
  UserX, ChevronLeft, ChevronRight
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  blocked: boolean;
  createdAt: string;
  roles: Array<{ role: string }>;
}

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/v1/admin/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users || json.data);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { /* eslint-disable react-hooks/set-state-in-effect */ fetchUsers(); /* eslint-enable react-hooks/set-state-in-effect */ }, [fetchUsers]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs tracking-[2.5px] text-[var(--admin-accent)] font-medium">
          <Users size={14} /> USER MANAGEMENT
        </div>
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-[42px] font-semibold tracking-[-1.2px] leading-none">Users</h1>
            <p className="text-[var(--admin-text-secondary)] mt-2 text-sm">Manage users, roles, and permissions.</p>
          </div>
          <button onClick={fetchUsers} disabled={loading} className="btn-admin text-xs">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..." className="input-admin w-full pl-10" />
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden border border-[var(--admin-border)]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={18} className="animate-spin text-[var(--admin-accent)]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--admin-text-muted)]">
            <Users size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-[var(--admin-border)] hover:bg-[var(--admin-bg-hover)]">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--admin-accent)]/20 flex items-center justify-center text-xs font-medium text-[var(--admin-accent)]">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="text-sm text-[var(--admin-text-secondary)]">{u.email}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {u.roles?.map((r) => (
                        <span key={r.role} className="badge-admin badge-admin-neutral text-[10px]">{r.role}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {u.blocked ? (
                      <span className="flex items-center gap-1 text-xs text-[#F87171]"><UserX size={12} /> Blocked</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-[#4ADE80]"><UserCheck size={12} /> Active</span>
                    )}
                  </td>
                  <td className="text-xs text-[var(--admin-text-muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <button className="btn-admin btn-admin-ghost text-xs"><Shield size={12} /> Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-[var(--admin-text-muted)]">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30"><ChevronLeft size={14} /> Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-admin btn-admin-ghost text-xs disabled:opacity-30">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      <div className="mt-8 text-xs text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-6">
        User management is restricted to SUPER_ADMIN and ADMIN roles. All actions are logged.
      </div>
    </div>
  );
}
