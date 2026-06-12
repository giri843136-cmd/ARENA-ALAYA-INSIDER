import { LoadingState } from "@/components/ui/LoadingState";

export default function AudienceLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading audience insights..." />
    </div>
  );
}
