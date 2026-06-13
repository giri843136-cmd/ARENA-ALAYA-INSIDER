export default function AdminNotFound() {
  return (
    <div className="p-8">
      <div className="admin-card p-12 text-center max-w-md mx-auto">
        <div className="text-[var(--admin-accent)] text-xs tracking-[3px] mb-2">404</div>
        <div className="font-semibold text-3xl tracking-tight">This admin page doesn’t exist yet.</div>
        <p className="mt-3 text-sm text-[var(--admin-text-secondary)]">The section you’re looking for may be under construction or moved. Check the sidebar.</p>
      </div>
    </div>
  );
}
