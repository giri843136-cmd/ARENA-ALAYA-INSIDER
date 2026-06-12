import { LoadingState } from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <div className="bg-[#F5F0EA] min-h-[60vh]">
      <LoadingState message="Curating the finest details..." />
    </div>
  );
}
