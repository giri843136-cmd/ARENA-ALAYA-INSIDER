"use client";

export default function BrandVault() {
  const brands = [
    { name: "Ferm Living", country: "Denmark", products: 47, rating: 4.9, featured: true },
    { name: "HAY", country: "Denmark", products: 62, rating: 4.8, featured: true },
    { name: "August", country: "United States", products: 19, rating: 4.7, featured: true },
    { name: "The Citizen Ry", country: "United States", products: 28, rating: 4.9, featured: false },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="text-xs text-[#C5A26F]">BRAND VAULT</div>
        <h1 className="text-3xl font-semibold tracking-tight">52 brands • 18,420 products</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {brands.map((b, i) => (
          <div key={i} className="admin-card p-5" onClick={() => alert(`Opening brand profile for ${b.name} (demo)`)}>
            <div className="font-medium text-lg">{b.name}</div>
            <div className="text-sm text-[#A1A1A1]">{b.country}</div>
            <div className="mt-4 flex justify-between text-sm">
              <div>{b.products} products</div>
              <div>★ {b.rating}</div>
            </div>
            {b.featured && <div className="mt-3 text-xs text-[#C5A26F]">FEATURED</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
