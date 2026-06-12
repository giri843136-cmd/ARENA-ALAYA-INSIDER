export default function AboutPage() {
  return (
    <div className="bg-[#F5F0EA]">
      <div className="container max-w-3xl py-20">
        <div className="font-display text-[56px] tracking-[-2.8px] leading-[0.92] text-[#26221E]">
          We believe in fewer, better things.
        </div>
        
        <div className="mt-10 max-w-2xl space-y-7 text-[17px] text-[#5C5249] leading-relaxed">
          <p>ALAYA INSIDER began as a simple question: What if the objects we bring into our lives were chosen with the same care we give to the people we love?</p>
          <p>We are not a store. We are an editorial platform that happens to make beautiful things discoverable. Every product you see here has been lived with, tested, and loved by our team of editors, writers, and designers.</p>
          <p>We work only with makers who share our values — craftsmanship over speed, honesty over hype, objects that improve with time and use rather than objects designed to be replaced.</p>
        </div>

        <div className="mt-16 pt-10 border-t border-[#E4DDD5]">
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 text-sm">
            <div>
              <div className="uppercase tracking-[2.5px] text-xs text-[#C5AA8A] mb-4">OUR PROMISE</div>
              <ul className="space-y-2.5 text-[#5C5249]">
                <li>• Every object is personally tested</li>
                <li>• We disclose every affiliate relationship</li>
                <li>• We never recommend anything we wouldn’t buy ourselves</li>
                <li>• We believe less is more, when what you have is truly good</li>
              </ul>
            </div>
            <div>
              <div className="uppercase tracking-[2.5px] text-xs text-[#C5AA8A] mb-4">THE TEAM</div>
              <p className="text-[#5C5249]">A small group of women (and a few excellent men) who have spent their careers thinking about how objects shape the way we feel in our homes and in our bodies.</p>
              <p className="mt-3 text-[#8A8178] text-xs">New York • London • Sydney</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
