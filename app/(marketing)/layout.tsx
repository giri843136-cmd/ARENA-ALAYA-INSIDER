import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { FloatingAIAssistant } from "@/components/FloatingAIAssistant";
import { SkipLink } from "@/components/layout/SkipLink";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <Navigation />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <FloatingAIAssistant />
    </>
  );
}
