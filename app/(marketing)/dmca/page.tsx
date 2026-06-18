import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Shield, Mail, ArrowLeft, Scale, AlertTriangle, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "DMCA Policy | ALAYA INSIDER",
  description: "Digital Millennium Copyright Act Notice & Takedown Procedure for ALAYA INSIDER. File a copyright infringement notice with our designated DMCA agent.",
};

export default function DMCA() {
  return (
    <div className="bg-[#F5F0EA] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E4DDD5] bg-white">
        <div className="container py-10 px-6 md:px-0">
          <Link
            href="/"
            className="text-xs text-[#6D655F] hover:text-[#7A6848] flex items-center gap-1 mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE7DE] flex items-center justify-center">
              <Scale size={18} className="text-[#7A6848]" />
            </div>
            <div>
              <h1 className="font-display text-[42px] tracking-[-2px] leading-[0.92]">
                DMCA Policy
              </h1>
              <p className="text-[#5C5249] text-sm mt-1">
                Digital Millennium Copyright Act Notice & Takedown Procedure
              </p>
            </div>
          </div>
          <div className="text-[10px] text-[#8A8178] tracking-wider">
            Effective: June 18, 2026
          </div>
        </div>
      </div>

      <div className="container py-12 px-6 md:px-0 max-w-3xl mx-auto">
        <div className="space-y-10">
          {/* Overview */}
          <section>
            <h2 className="font-display text-xl tracking-tight text-[#26221E] mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[#7A6848]" /> Overview
            </h2>
            <div className="prose prose-sm text-[#5C5249] leading-relaxed space-y-3">
              <p>
                ALAYA INSIDER respects the intellectual property rights of others and expects
                its users to do the same. In accordance with the Digital Millennium Copyright
                Act (DMCA), we have implemented a policy to respond to notices of alleged
                copyright infringement.
              </p>
              <p>
                If you believe that any content on our site infringes upon your copyright(s),
                you may submit a notification pursuant to the DMCA by providing our Copyright
                Agent with the information described below.
              </p>
            </div>
          </section>

          {/* Filing a Notice */}
          <section>
            <h2 className="font-display text-xl tracking-tight text-[#26221E] mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#7A6848]" /> Filing a DMCA Notice
            </h2>
            <div className="bg-white rounded-2xl border border-[#E4DDD5] p-6">
              <p className="text-sm text-[#5C5249] mb-4">
                To file a DMCA notice, please include all of the following:
              </p>
              <ol className="space-y-3 text-sm text-[#5C5249] list-decimal pl-5">
                <li>
                  Identify the copyrighted work claimed to have been infringed.
                </li>
                <li>
                  Identify the material that is claimed to be infringing and provide
                  enough information for us to locate it (URL, page title, etc.).
                </li>
                <li>
                  Provide your contact information (address, telephone number, and
                  email address).
                </li>
                <li>
                  Include a statement that you have a good faith belief that use of
                  the material is not authorized by the copyright owner, its agent,
                  or the law.
                </li>
                <li>
                  Include a statement that the information in the notification is
                  accurate, and under penalty of perjury, that you are authorized to
                  act on behalf of the owner of an exclusive right that is allegedly
                  infringed.
                </li>
                <li>Include your physical or electronic signature.</li>
              </ol>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display text-xl tracking-tight text-[#26221E] mb-4 flex items-center gap-2">
              <Mail size={16} className="text-[#7A6848]" /> Submit to Designated Agent
            </h2>
            <div className="bg-[#26221E] rounded-2xl p-6">
              <p className="text-sm text-[#C5A26F] mb-3 font-medium">
                Send your DMCA notice or counter-notification to:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#999]" />
                  <a
                    href="mailto:dmca@alayainsider.com"
                    className="text-white hover:text-[#C5A26F] transition-colors"
                  >
                    dmca@alayainsider.com
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-[#666] mt-3">
                We will respond to all valid DMCA notices within 5 business days.
              </p>
            </div>
          </section>

          {/* Counter-Notification */}
          <section>
            <h2 className="font-display text-xl tracking-tight text-[#26221E] mb-4 flex items-center gap-2">
              <FileText size={16} className="text-[#7A6848]" /> Counter-Notification
            </h2>
            <div className="prose prose-sm text-[#5C5249] leading-relaxed space-y-3">
              <p>
                If you believe that material you posted was removed or disabled as a
                result of mistake or misidentification, you may file a
                counter-notification with our Copyright Agent.
              </p>
              <p className="text-xs text-[#8A8178]">
                Counter-notifications must include your signature, identification of
                the removed material, a statement under penalty of perjury of good
                faith belief, your contact information, and consent to federal
                jurisdiction.
              </p>
            </div>
          </section>

          {/* Repeat Infringer Policy */}
          <section>
            <h2 className="font-display text-xl tracking-tight text-[#26221E] mb-4">
              Repeat Infringer Policy
            </h2>
            <div className="prose prose-sm text-[#5C5249] leading-relaxed">
              <p>
                ALAYA INSIDER will terminate, in appropriate circumstances, the accounts
                of users who are repeat infringers. We reserve the right to remove
                content alleged to be infringing without prior notice, at our sole
                discretion, and without liability to the user.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-[#E4DDD5] pt-6">
            <p className="text-xs text-[#8A8178]">
              ALAYA INSIDER is committed to complying with the safe harbor provisions
              of the DMCA. If you have any questions about this policy, please contact
              our legal team at{" "}
              <a
                href="mailto:legal@alayainsider.com"
                className="text-[#7A6848] hover:underline"
              >
                legal@alayainsider.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
