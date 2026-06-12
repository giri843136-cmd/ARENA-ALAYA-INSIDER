import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading command center..." />
    </div>
  );
}
