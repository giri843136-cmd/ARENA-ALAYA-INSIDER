"use client";

import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";

interface EditorialCardProps {
  article: Article;
}

export function EditorialCard({ article }: EditorialCardProps) {
  return (
    <Link href={`/journal/${article.slug}`} className="group block">
      <div className="card-editorial overflow-hidden rounded-3xl bg-white border border-[#E8E2D9]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F1EDE6]">
          <Image 
            src={article.coverImage} 
            alt={article.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-[800ms] group-hover:scale-[1.04]"
          />
          {article.universe && (
            <div className="absolute top-4 right-4 badge badge-neutral text-[10px] tracking-widest">
              {article.universe.replace("-", " ")}
            </div>
          )}
        </div>

        <div className="p-7">
          <div className="flex items-center gap-3 text-xs text-[#5C5249] mb-3 tracking-wide">
            <span>{article.authorName}</span>
            <span>•</span>
            <span>{article.readTime} min read</span>
          </div>

          <h3 className="font-display text-[21px] leading-[1.15] tracking-[-0.4px] text-[#2C2522] mb-3 group-hover:text-[#7A6848] transition-colors">
            {article.title}
          </h3>
          
          {article.subtitle && (
            <p className="text-[#5C5249] text-[15px] leading-snug mb-4 line-clamp-2">
              {article.subtitle}
            </p>
          )}

          <p className="text-sm text-[#5C5249] line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>

          <div className="mt-5 text-xs text-[#7A6848] group-hover:underline tracking-widest font-medium">
            READ THE ESSAY →
          </div>
        </div>
      </div>
    </Link>
  );
}
