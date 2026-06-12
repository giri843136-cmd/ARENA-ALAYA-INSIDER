import { LoadingState } from "@/components/ui/LoadingState";

export default function JournalLoading() {
  return (
    <div className="bg-[#F5F0EA] min-h-[60vh]">
      <LoadingState message="Opening the essay..." />
    </div>
  );
}
