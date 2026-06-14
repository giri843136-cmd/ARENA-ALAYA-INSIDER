/**
 * ProductSchema — Renders JSON-LD structured data for Google rich snippets.
 *
 * Injects Product schema with star rating, price, availability, brand,
 * and review data so search results show rich cards with stars and pricing.
 *
 * Usage:
 *   <ProductSchema product={product} brand={brand} reviews={reviews} />
 */
import type { Product, Brand, Review } from "@/lib/types";

interface ProductSchemaProps {
  product: Product;
  brand?: Brand;
  reviews?: Review[];
}

import { useMemo } from 'react';

export function ProductSchema({ product, brand, reviews }: ProductSchemaProps) {
  const defaultPriceDate = useMemo(() => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: product.brandName,
      ...(brand?.website && { url: brand.website }),
    },
    offers: {
      "@type": "Offer",
      url: `https://alayainsider.com/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      priceValidUntil: defaultPriceDate,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/LimitedAvailability",
      itemCondition: "https://schema.org/NewCondition",
      ...(product.originalPrice && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: product.originalPrice,
          priceCurrency: "USD",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
          },
        },
      }),
    },
    ...(reviews && reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.authorName },
        datePublished: r.date,
        reviewBody: r.body,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
        },
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * FAQSchema — Renders FAQPage structured data for rich search results.
 *
 * Enables Google to show FAQ rich results with expandable questions/answers.
 *
 * Usage:
 *   <FAQSchema faqs={faqs} />
 */
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

/**
 * BreadcrumbSchema — Renders BreadcrumbList structured data.
 */
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://alayainsider.com${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}
