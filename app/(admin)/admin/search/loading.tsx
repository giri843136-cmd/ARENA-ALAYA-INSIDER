import { LoadingState } from "@/components/ui/LoadingState";

export default function SearchIntelligenceLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading search intelligence..." />
    </div>
  );
}
