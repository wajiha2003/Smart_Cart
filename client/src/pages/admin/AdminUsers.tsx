import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { User } from "../../lib/types";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  function load() {
    api.get("/admin/users").then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function toggleRole(u: User) {
    const newRole = u.role === "admin" ? "customer" : "admin";
    await api.put(`/admin/users/${u.id}/role`, { role: newRole });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Manage Users</h1>
        <p className="mt-1 text-sm text-ink-muted">{users.length} registered users</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-canvas text-left text-xs font-semibold uppercase tracking-wider text-ink-muted/60">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 animate-pulse rounded bg-border/60" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-primary-soft/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{u.name}</p>
                          <p className="text-xs text-ink-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        u.role === "admin"
                          ? "bg-warning/10 text-warning border border-warning/20"
                          : "bg-mint-soft text-mint border border-mint/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={u.id === currentUser?.id}
                        className="mr-3 text-xs font-semibold text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Make {u.role === "admin" ? "customer" : "admin"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === currentUser?.id}
                        className="text-xs font-semibold text-danger transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
