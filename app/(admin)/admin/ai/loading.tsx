import { LoadingState } from "@/components/ui/LoadingState";

export default function AIWorkspaceLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Waking the AI..." />
    </div>
  );
}
