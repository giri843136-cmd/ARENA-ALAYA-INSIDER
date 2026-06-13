export default function Privacy() {
  return (
    <div className="bg-[#F5F0EA]">
      <div className="container max-w-2xl py-20">
        <div className="max-w-xl">
          <div className="text-xs tracking-[3px] text-[#7A6848] mb-2">YOUR DATA</div>
          <h1 className="font-display text-[52px] tracking-[-2.4px] leading-none">Privacy</h1>
        </div>

        <div className="mt-10 max-w-prose text-[15px] text-[#5C5249] space-y-7 leading-relaxed">
          <p>We take your privacy seriously. We collect only the information necessary to provide you with a beautiful, personalized experience on ALAYA INSIDER.</p>
          <p>We do not sell your data. We use cookies to remember your preferences and to understand how our site is used. You can manage cookie preferences at any time via your browser.</p>
          <p>We use trusted partners for payments, email, and analytics — they never receive more than they need to do their job.</p>
          <p>For full details or to request your data, please email us at <a href="mailto:privacy@alayainsider.com" className="underline hover:text-[#7A6848]">privacy@alayainsider.com</a> and we will send you our complete policy within 48 hours.</p>
        </div>

        <div className="mt-12 text-xs tracking-widest text-[#5C5249] border-t border-[#E4DDD5] pt-6">Last updated: June 2026</div>
      </div>
    </div>
  );
}
