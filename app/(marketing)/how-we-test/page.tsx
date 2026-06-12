import { CheckCircle2, FileSearch, Users, FlaskConical, ShieldCheck, Heart, Clock, Award } from "lucide-react";

const STEPS = [
  {
    icon: FileSearch,
    title: "1. Research & Curation",
    description: "We begin by surveying the market — reading reviews, analyzing specs, and identifying the products that meet our standards for quality, design, and durability.",
    details: "Each category starts with 30–50 candidates. We narrow to 15–20 based on materials, construction, brand ethics, and reader interest."
  },
  {
    icon: FlaskConical,
    title: "2. Hands-On Testing",
    description: "Every product we recommend is tested in real homes by real editors. We live with each object for at least two weeks before making a recommendation.",
    details: "Our editors test across different environments, climates, and use cases. A linen duvet cover is tested in warm and cool seasons. Cast iron is used daily for a month."
  },
  {
    icon: Users,
    title: "3. Panel Evaluation",
    description: "Products are evaluated by a panel of at least three editors who rate them across multiple criteria specific to their category.",
    details: "Criteria include: quality of materials, construction, ease of use, aesthetic, value, and durability. Scores are averaged and debated before final decisions."
  },
  {
    icon: Heart,
    title: "4. The ALAYA Test",
    description: "The final question: would we buy this for ourselves, with our own money, and give it to someone we love? Only products that pass this test earn a recommendation.",
    details: "This subjective but rigorous filter ensures every product on ALAYA carries genuine enthusiasm, not just objective adequacy."
  },
  {
    icon: Clock,
    title: "5. Long-Term Review",
    description: "We revisit recommendations after 3, 6, and 12 months to see how they hold up. Products that fail over time are removed or updated.",
    details: "Our long-term testing has led to more than 20% of our original picks being updated or replaced after discovering issues only time reveals."
  },
  {
    icon: Award,
    title: "6. Continuous Updates",
    description: "Recommendations are reviewed every quarter. New products enter the market, prices change, and our understanding evolves.",
    details: "Every product page on ALAYA includes a 'Last reviewed' date so you know how current our recommendation is."
  }
];

const PRINCIPLES = [
  {
    title: "Editorial Independence",
    description: "We never accept payment for positive reviews. Our affiliate relationships are transparent and never influence our recommendations.",
    icon: ShieldCheck,
  },
  {
    title: "No Sponsored Placements",
    description: "Brands cannot pay to be featured. Every product on ALAYA has earned its place through genuine merit.",
    icon: ShieldCheck,
  },
  {
    title: "Reader-First Philosophy",
    description: "We recommend the best product for the reader, not the one with the highest commission. Period.",
    icon: Heart,
  },
  {
    title: "Full Transparency",
    description: "Every product page clearly marks affiliate links. Our disclosure is never hidden or minimized.",
    icon: CheckCircle2,
  },
];

export default function HowWeTestPage() {
  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Hero */}
      <div className="border-b border-[#E4DDD5] bg-white">
        <div className="container py-16">
          <div className="text-xs tracking-[3px] text-[#C5AA8A] mb-3 uppercase">Our Process</div>
          <h1 className="font-display text-[52px] tracking-[-2.4px] leading-[0.92] max-w-2xl">
            How We Test &amp; <span className="text-[#C5AA8A]">Recommend</span>
          </h1>
          <p className="mt-4 text-lg text-[#5C5249] max-w-xl">
            Every product on ALAYA INSIDER has been researched, tested, and lived with before earning a recommendation. Here&apos;s how we do it.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Testing Steps */}
        <div className="max-w-3xl">
          <div className="text-xs tracking-[2px] text-[#8A8178] mb-6 uppercase">The Process</div>
          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-[#C5AA8A]/10 flex items-center justify-center">
                    <step.icon size={22} className="text-[#C5AA8A]" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="mx-auto w-px h-8 bg-[#E4DDD5] mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <h2 className="font-display text-2xl tracking-tight text-[#26221E] mb-2">{step.title}</h2>
                  <p className="text-[#5C5249] leading-relaxed mb-3">{step.description}</p>
                  <p className="text-sm text-[#8A8178] leading-relaxed">{step.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editorial Principles */}
        <div className="mt-20 pt-12 border-t border-[#E4DDD5]">
          <div className="text-xs tracking-[2px] text-[#8A8178] mb-6 uppercase">Our Commitments</div>
          <div className="grid md:grid-cols-2 gap-6">
            {PRINCIPLES.map((principle, i) => (
              <div key={i} className="card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#C5AA8A]/10 flex items-center justify-center">
                    <principle.icon size={18} className="text-[#C5AA8A]" />
                  </div>
                  <h3 className="font-display text-xl tracking-tight">{principle.title}</h3>
                </div>
                <p className="text-sm text-[#5C5249] leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-12 border-t border-[#E4DDD5]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "200+", label: "Products tested" },
              { value: "18", label: "Months of reviews" },
              { value: "20%", label: "Picks updated annually" },
              { value: "100%", label: "Editorially independent" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-4xl text-[#C5AA8A]">{stat.value}</div>
                <div className="text-xs text-[#8A8178] tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-white border border-[#E4DDD5] rounded-3xl p-10 text-center">
          <div className="text-xs tracking-[3px] text-[#C5AA8A] mb-3 uppercase">Have Questions?</div>
          <p className="text-[#5C5249] max-w-md mx-auto">
            We&apos;d love to hear from you. If you&apos;d like to know more about our testing process or have suggestions for products to review, reach out.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[#C5AA8A] hover:underline"
          >
            Get in touch →
          </a>
        </div>
      </div>
    </div>
  );
}
