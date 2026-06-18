import { NextResponse } from "next/server";

/**
 * ALAYA INSIDER — DMCA Takedown Policy & Procedure
 * Compliant with DMCA 17 U.S.C. § 512
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const dmcaData = {
    service: "ALAYA INSIDER",
    designationAgent: "DMCA Agent",
    contactEmail: "dmca@alayainsider.com",
    effectiveDate: "2026-06-18",
    policy: {
      overview: "ALAYA INSIDER respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we have implemented a policy to respond to notices of alleged copyright infringement.",
      filingProcedure: [
        "Identify the copyrighted work claimed to have been infringed.",
        "Identify the material that is claimed to be infringing and provide enough information for us to locate it (URL, page title, etc.).",
        "Provide your contact information (address, telephone number, and email address).",
        "Include a statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.",
        "Include a statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.",
        "Include your physical or electronic signature.",
        "Send the written notice to our designated Copyright Agent at: dmca@alayainsider.com",
      ],
      counterNotification: [
        "If you believe that material you posted was removed or disabled as a result of mistake or misidentification, you may file a counter-notification.",
        "Your counter-notification must include: (a) your physical or electronic signature; (b) identification of the material that has been removed and where it was located before removal; (c) a statement under penalty of perjury that you have a good faith belief that the material was removed as a result of mistake or misidentification; (d) your name, address, telephone number, and email; and (e) a statement that you consent to the jurisdiction of the federal district court for the judicial district in which your address is located.",
        "Send counter-notifications to: dmca@alayainsider.com",
      ],
      repeatInfringerPolicy: "ALAYA INSIDER will terminate, in appropriate circumstances, the accounts of users who are repeat infringers. We reserve the right to remove content alleged to be infringing without prior notice, at our sole discretion, and without liability to the user.",
      modifications: "We reserve the right to modify this DMCA Policy at any time. Changes will be effective immediately upon posting to this page.",
      safeHarbor: "ALAYA INSIDER is committed to complying with the safe harbor provisions of the DMCA. We have registered a designated agent with the U.S. Copyright Office.",
    },
  };

  return NextResponse.json(dmcaData, {
    status: 200,
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
