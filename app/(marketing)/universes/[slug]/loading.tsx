import { LoadingState } from "@/components/ui/LoadingState";

export default function UniverseLoading() {
  return (
    <div className="bg-[#F5F0EA] min-h-[60vh]">
      <LoadingState message="Entering the universe..." />
    </div>
  );
}
