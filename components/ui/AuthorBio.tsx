import { Twitter, Globe, BookOpen } from "lucide-react";

interface Author {
  name: string;
  avatar?: string;
  bio: string;
  role?: string;
  social?: { twitter?: string; website?: string };
  articleCount?: number;
}

interface AuthorBioProps {
  author: Author;
  className?: string;
}

/**
 * Author biography card with avatar, social links, and article count.
 * Used in article pages and editorial sections.
 */
export function AuthorBio({ author, className = "" }: AuthorBioProps) {
  return (
    <div className={`flex items-start gap-4 p-5 bg-[#FAF7F4] dark:bg-[#26221E] rounded-2xl ${className}`}>
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-[#7A6848]/20 flex items-center justify-center text-[#7A6848] font-display text-lg flex-shrink-0 overflow-hidden">
        {author.avatar ? (
          <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
        ) : (
          author.name.charAt(0)
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[#26221E] dark:text-[#EDE6DC]">{author.name}</span>
          {author.role && (
            <span className="text-[10px] tracking-[2px] text-[#7A6848] uppercase">{author.role}</span>
          )}
        </div>
        <p className="text-sm text-[#6D655F] dark:text-[#B8AFA3] mt-1 line-clamp-2">{author.bio}</p>
        <div className="flex items-center gap-3 mt-2">
          {author.articleCount !== undefined && (
            <span className="text-xs text-[#5C5249] flex items-center gap-1">
              <BookOpen size={12} />
              {author.articleCount} articles
            </span>
          )}
          {author.social?.twitter && (
            <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7A6848] hover:underline flex items-center gap-1">
              <Twitter size={12} />
              Follow
            </a>
          )}
          {author.social?.website && (
            <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7A6848] hover:underline flex items-center gap-1">
              <Globe size={12} />
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
