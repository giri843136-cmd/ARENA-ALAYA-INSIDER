import { LoadingState } from "@/components/ui/LoadingState";

export default function AutomationLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading automation center..." />
    </div>
  );
}
