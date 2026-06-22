import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="bg-[#F5F0EA] min-h-[70vh] flex items-center">
      <div className="container">
        <EmptyState
          title="Page not found"
          description="The page you’re looking for has moved or never existed. Let’s get you back to something beautiful."
          icon="search"
          actionLabel="Go to homepage"
          actionHref="/"
          secondaryAction={
            <Link href="/search" className="btn btn-secondary">Browse the collection</Link>
          }
        />
      </div>
    </div>
  );
}
