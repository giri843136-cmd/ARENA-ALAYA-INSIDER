import { LoadingState } from "@/components/ui/LoadingState";

export default function BrandVaultLoading() {
  return (
    <div className="p-8">
      <LoadingState message="Loading the brand vault..." />
    </div>
  );
}
