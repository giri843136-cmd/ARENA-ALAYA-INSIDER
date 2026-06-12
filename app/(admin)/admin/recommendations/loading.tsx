import { LoadingState } from "@/components/ui/LoadingState";

export default function RecommendationsLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading recommendation engine..." />
    </div>
  );
}