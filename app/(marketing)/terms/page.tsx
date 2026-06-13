export default function Terms() {
  return (
    <div className="bg-[#F5F0EA]">
      <div className="container max-w-2xl py-20">
        <div className="max-w-xl">
          <div className="text-xs tracking-[3px] text-[#7A6848] mb-2">THE FINE PRINT</div>
          <h1 className="font-display text-[52px] tracking-[-2.4px] leading-none">Terms of Service</h1>
        </div>

        <div className="mt-10 max-w-prose text-[15px] text-[#5C5249] space-y-7 leading-relaxed">
          <p>By using ALAYA INSIDER you agree to these simple terms:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All content is for personal, non-commercial use unless otherwise stated.</li>
            <li>We make every effort to ensure product information is accurate, but we are not responsible for changes made by brands or retailers.</li>
            <li>Affiliate links may earn us a commission at no cost to you.</li>
            <li>We reserve the right to update these terms at any time. Continued use means you accept the updated version.</li>
          </ul>
          <p>If you have questions about these terms, reach us at <a href="mailto:legal@alayainsider.com" className="underline hover:text-[#7A6848]">legal@alayainsider.com</a>.</p>
        </div>

        <div className="mt-12 text-xs tracking-widest text-[#5C5249] border-t border-[#E4DDD5] pt-6">Last updated: June 2026</div>
      </div>
    </div>
  );
}
