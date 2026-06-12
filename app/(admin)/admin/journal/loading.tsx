import { LoadingState } from "@/components/ui/LoadingState";

export default function JournalAdminLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading the journal..." />
    </div>
  );
}
