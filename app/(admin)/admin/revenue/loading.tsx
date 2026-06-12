import { LoadingState } from "@/components/ui/LoadingState";

export default function RevenueLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading revenue intelligence..." />
    </div>
  );
}
