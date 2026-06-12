import { LoadingState } from "@/components/ui/LoadingState";

export default function QueuesLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading queues..." />
    </div>
  );
}
