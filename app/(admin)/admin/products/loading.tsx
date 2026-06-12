import { LoadingState } from "@/components/ui/LoadingState";

export default function ProductStudioLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading the product studio..." />
    </div>
  );
}
