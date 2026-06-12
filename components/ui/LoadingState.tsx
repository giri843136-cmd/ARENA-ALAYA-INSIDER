export function LoadingState({ message = "Loading beautiful things..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-8 w-8 border-2 border-[#E4DDD5] border-t-[#C5AA8A] rounded-full animate-spin mb-4" />
      <p className="text-sm tracking-widest text-[#8A8178]">{message}</p>
    </div>
  );
}
