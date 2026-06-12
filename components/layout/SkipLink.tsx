export function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[#26221E] focus:text-[#F5F0EA] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:tracking-widest"
    >
      Skip to main content
    </a>
  );
}
