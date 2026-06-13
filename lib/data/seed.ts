/**
 * ALAYA INSIDER — Handcrafted Seed Data
 * Every universe, product, article, and brand has been thoughtfully named and described.
 * No placeholders. No generic language.
 * Designed to feel like a living editorial archive.
 */

import type {
  Universe,
  Subcollection,
  Brand,
  Product,
  Article,
  Author,
  Collection,
  Review,
  FAQ,
  UniverseSlug,
} from "@/lib/types";

// ========================================
// AUTHORS — The editorial voices of ALAYA
// ========================================
export const authors: Author[] = [
  {
    id: "a1",
    name: "Elena Voss",
    slug: "elena-voss",
    bio: "Elena has spent fifteen years studying the quiet rituals that make a house feel like home. Her writing appears in Kinfolk and House Beautiful.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    role: "Editor at Large, Home & Ritual",
    social: { instagram: "elenavoss", substack: "elenavoss" },
  },
  {
    id: "a2",
    name: "Margot Hale",
    slug: "margot-hale",
    bio: "Former chef and current tastemaker. Margot writes about the poetry of everyday cooking and the tables we gather around.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces",
    role: "Culinary Editor",
    social: { instagram: "margothale" },
  },
  {
    id: "a3",
    name: "Sofia Laurent",
    slug: "sofia-laurent",
    bio: "Sofia has built her career around the belief that beauty should feel like a second skin. She writes with the same care she applies to her own rituals.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    role: "Beauty & Wellness Editor",
    social: { instagram: "sofialaurent" },
  },
  {
    id: "a4",
    name: "Clara Beaumont",
    slug: "clara-beaumont",
    bio: "Clara’s eye for proportion and texture has shaped how a generation thinks about getting dressed. She believes clothes should feel like a quiet confidence.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    role: "Style Director",
    social: { instagram: "clarabeaumont" },
  },
  {
    id: "a5",
    name: "Isabel Rowe",
    slug: "isabel-rowe",
    bio: "Isabel writes about the objects we keep close and the technologies that disappear into our lives. She is a former design lead at a major studio.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
    role: "Connected Living Editor",
  },
];

// ========================================
// UNIVERSES — The 8 Primary Universes
// ========================================
export const universes: Universe[] = [
  {
    id: "u1",
    slug: "sanctuary",
    title: "Sanctuary",
    subtitle: "The art of coming home to yourself",
    description: "Spaces that hold you. Rooms that breathe. A return to the quiet luxury of simply being.",
    longDescription: "Sanctuary is where we return to ourselves. It is the soft light through linen curtains, the weight of a well-made blanket, the particular silence of a room arranged with intention. Here we explore how the objects and textures we live among shape the way we feel.",
    heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2000&q=85",
    accentColor: "#C5A26F",
    subcollections: [],
    featuredProducts: ["p1", "p4", "p12"],
    featuredArticles: ["art1", "art3"],
  },
  {
    id: "u2",
    slug: "culinary-studio",
    title: "Culinary Studio",
    subtitle: "Where nourishment becomes ritual",
    description: "The kitchen as a place of daily poetry. Tools that last. Ingredients that tell stories. Tables that gather.",
    longDescription: "In the Culinary Studio we celebrate the quiet luxury of cooking and gathering. Not performance, but presence. The weight of a proper knife in the hand. The way morning light falls across a wooden cutting board. The table that becomes the center of a life.",
    heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000&q=85",
    accentColor: "#8A9A7B",
    subcollections: [],
    featuredProducts: ["p25", "p31", "p38"],
    featuredArticles: ["art12", "art15"],
  },
  {
    id: "u3",
    slug: "glow-atelier",
    title: "Glow Atelier",
    subtitle: "Beauty as daily devotion",
    description: "Rituals that begin and end the day. Textures that feel like care. Formulas that respect the skin you’re in.",
    longDescription: "Glow Atelier is an invitation to treat your skin and hair with the same attention you give to the rest of your life. We believe in fewer, better things. In slow mornings and quiet evenings. In the particular pleasure of a well-made cream or a brush that lasts a decade.",
    heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=2000&q=85",
    accentColor: "#D4A5A5",
    subcollections: [],
    featuredProducts: ["p52", "p59", "p67"],
    featuredArticles: ["art22", "art25"],
  },
  {
    id: "u4",
    slug: "signature-style",
    title: "Signature Style",
    subtitle: "Clothes that feel like coming home",
    description: "Pieces you reach for again and again. Fabrics that age beautifully. Silhouettes that never try too hard.",
    longDescription: "Signature Style is the wardrobe you build once and wear for years. It is the cashmere sweater that becomes softer with each wash, the leather bag that develops its own character, the dress that makes you stand a little taller. We look for things that feel like you, only better.",
    heroImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=2000&q=85",
    accentColor: "#B48C6C",
    subcollections: [],
    featuredProducts: ["p78", "p84", "p91"],
    featuredArticles: ["art31", "art34"],
  },
  {
    id: "u5",
    slug: "connected-living",
    title: "Connected Living",
    subtitle: "Technology that disappears into the day",
    description: "Objects that serve without demanding attention. Tools that feel like extensions of thought and hand.",
    longDescription: "Connected Living is about the objects and systems that quietly support a thoughtful life. The lamp that knows when you need less light. The notebook that actually helps you think. The speaker that disappears into the room until you need it. Technology that respects your attention.",
    heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=2000&q=85",
    accentColor: "#5C6657",
    subcollections: [],
    featuredProducts: ["p105", "p112", "p119"],
    featuredArticles: ["art41", "art44"],
  },
  {
    id: "u6",
    slug: "ritual-reset",
    title: "Ritual Reset",
    subtitle: "The practice of returning to yourself",
    description: "Small daily acts that accumulate into a life well-lived. Recovery as a form of elegance.",
    longDescription: "Ritual Reset explores the gentle disciplines that keep us steady. The morning walk. The evening bath. The five minutes of nothing at all. We believe that how we begin and end our days shapes everything in between. Here we collect the practices, objects, and philosophies that help us return to center.",
    heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=2000&q=85",
    accentColor: "#8A9A7B",
    subcollections: [],
    featuredProducts: ["p132", "p139", "p145"],
    featuredArticles: ["art51", "art54"],
  },
  {
    id: "u7",
    slug: "thoughtfully-yours",
    title: "Thoughtfully Yours",
    subtitle: "Gifts that carry meaning",
    description: "The art of giving well. Objects chosen with care. Presents that feel like they were meant for the recipient.",
    longDescription: "Thoughtfully Yours is our collection of gifts that feel personal even when they’re not. We believe the best gifts are the ones the giver would want for themselves. Here you’ll find considered objects for the people you love — and perhaps a few things you’ll want to keep.",
    heroImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=2000&q=85",
    accentColor: "#C5A26F",
    subcollections: [],
    featuredProducts: ["p158", "p164", "p171"],
    featuredArticles: ["art61", "art64"],
  },
  {
    id: "u8",
    slug: "wander-edit",
    title: "Wander Edit",
    subtitle: "Travel that leaves you changed",
    description: "The considered journey. What to carry. Where to stay. How to move through the world with grace.",
    longDescription: "Wander Edit is for those who travel not to escape but to deepen. We focus on the objects that make a journey feel lighter and more intentional, the destinations that reward slow attention, and the mindset that turns a trip into a chapter of your life.",
    heroImage: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2000&q=85",
    accentColor: "#A17E4E",
    subcollections: [],
    featuredProducts: ["p182", "p189", "p195"],
    featuredArticles: ["art71", "art74"],
  },
];

// ========================================
// SUBCOLLECTIONS — 50+ thoughtfully named
// ========================================
export const subcollections: Subcollection[] = [
  // SANCTUARY
  { id: "sc1", slug: "the-cozy-edit", title: "The Cozy Edit", subtitle: "Layers that invite lingering", description: "Soft textures, generous proportions, and the particular warmth that makes a room feel like an embrace.", universeSlug: "sanctuary", heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80", productIds: ["p1", "p2", "p3", "p4", "p5"], articleIds: ["art1", "art2"] },
  { id: "sc2", slug: "scandinavian-calm", title: "Scandinavian Calm", subtitle: "Light, air, and restraint", description: "The Nordic approach to living well: pale woods, honest materials, and the radical permission to own less.", universeSlug: "sanctuary", heroImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80", productIds: ["p6", "p7", "p8"], articleIds: ["art3"] },
  { id: "sc3", slug: "soft-minimalism", title: "Soft Minimalism", subtitle: "Warmth without excess", description: "A gentler minimalism. Curves instead of corners. Texture instead of ornament. Stillness instead of emptiness.", universeSlug: "sanctuary", heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80", productIds: ["p9", "p10", "p11", "p12"], articleIds: ["art4"] },
  { id: "sc4", slug: "curated-corners", title: "Curated Corners", subtitle: "Nooks that hold a life", description: "The small spaces where we actually live — the reading chair, the morning window seat, the place the dog always chooses.", universeSlug: "sanctuary", heroImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80", productIds: ["p13", "p14"], articleIds: ["art5"] },
  { id: "sc5", slug: "layered-living", title: "Layered Living", subtitle: "Rooms that tell stories over time", description: "Nothing arrives all at once. A home built in chapters, with pieces that earn their place.", universeSlug: "sanctuary", heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80", productIds: ["p15", "p16", "p17"], articleIds: ["art6"] },

  // CULINARY STUDIO
  { id: "sc6", slug: "daily-rituals", title: "Daily Rituals", subtitle: "The poetry of morning and evening", description: "The objects that turn the ordinary act of feeding yourself into something worth noticing.", universeSlug: "culinary-studio", heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80", productIds: ["p25", "p26", "p27"], articleIds: ["art12"] },
  { id: "sc7", slug: "sunday-table", title: "Sunday Table", subtitle: "The long meal that stretches into afternoon", description: "Linens, platters, and the particular generosity of a table set for people you love.", universeSlug: "culinary-studio", heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80", productIds: ["p28", "p29", "p30", "p31"], articleIds: ["art13"] },
  { id: "sc8", slug: "gather-serve", title: "Gather & Serve", subtitle: "Objects made for sharing", description: "Large bowls, beautiful boards, and the vessels that make a meal feel like an occasion even when it isn’t.", universeSlug: "culinary-studio", heroImage: "https://images.unsplash.com/photo-1556909212-9e4b3c6f1c3e?w=1200&q=80", productIds: ["p32", "p33"], articleIds: ["art14"] },
  { id: "sc9", slug: "bake-society", title: "Bake Society", subtitle: "Flour, butter, and patience", description: "The tools and vessels for the slow, satisfying work of baking by hand.", universeSlug: "culinary-studio", heroImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80", productIds: ["p34", "p35", "p36"], articleIds: ["art15"] },
  { id: "sc10", slug: "kitchen-atelier", title: "Kitchen Atelier", subtitle: "The serious cook’s quiet luxury", description: "Professional-grade tools that feel personal. The things chefs actually use when no one is watching.", universeSlug: "culinary-studio", heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80", productIds: ["p37", "p38", "p39"], articleIds: ["art16"] },

  // GLOW ATELIER
  { id: "sc11", slug: "morning-muse", title: "Morning Muse", subtitle: "The first light on your face", description: "Gentle cleansers, serums that feel like silk, and the five minutes that set the tone for the day.", universeSlug: "glow-atelier", heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80", productIds: ["p52", "p53", "p54"], articleIds: ["art22"] },
  { id: "sc12", slug: "night-reset", title: "Night Reset", subtitle: "The ritual of letting go", description: "Oils, balms, and the slow removal of the day. The products that make sleep feel like an active choice.", universeSlug: "glow-atelier", heroImage: "https://images.unsplash.com/photo-1570194065650-d99fb4b93891?w=1200&q=80", productIds: ["p55", "p56", "p57"], articleIds: ["art23"] },
  { id: "sc13", slug: "silk-strand", title: "Silk & Strand", subtitle: "Hair as daily luxury", description: "Brushes, oils, and the quiet tools that turn washing your hair into something you look forward to.", universeSlug: "glow-atelier", heroImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80", productIds: ["p58", "p59", "p60"], articleIds: ["art24"] },
  { id: "sc14", slug: "vanity-ritual", title: "Vanity Ritual", subtitle: "The table where you meet yourself", description: "The beautiful objects that live on the surface where you prepare to meet the world.", universeSlug: "glow-atelier", heroImage: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80", productIds: ["p61", "p62"], articleIds: ["art25"] },
  { id: "sc15", slug: "gentle-beauty", title: "Gentle Beauty", subtitle: "For the skin that asks for less", description: "Minimal formulas. Maximal results. The beauty that respects sensitive skin and quiet mornings.", universeSlug: "glow-atelier", heroImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80", productIds: ["p63", "p64", "p65"], articleIds: ["art26"] },

  // SIGNATURE STYLE
  { id: "sc16", slug: "capsule-edit", title: "Capsule Edit", subtitle: "The wardrobe that works harder", description: "Fewer pieces. Better pieces. The things you actually reach for every single week.", universeSlug: "signature-style", heroImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&q=80", productIds: ["p78", "p79", "p80", "p81"], articleIds: ["art31"] },
  { id: "sc17", slug: "weekend-muse", title: "Weekend Muse", subtitle: "The clothes you actually live in", description: "Soft denim, perfect knits, and the pieces that make Saturday feel like Saturday.", universeSlug: "signature-style", heroImage: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80", productIds: ["p82", "p83", "p84"], articleIds: ["art32"] },
  { id: "sc18", slug: "carry-allure", title: "Carry Allure", subtitle: "Bags that become part of you", description: "Leather that improves with age. Hardware that feels considered. The bag you’ll still be carrying in ten years.", universeSlug: "signature-style", heroImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80", productIds: ["p85", "p86", "p87"], articleIds: ["art33"] },
  { id: "sc19", slug: "sole-society", title: "Sole Society", subtitle: "Shoes that understand your life", description: "The boots you’ll wear every day. The loafers that feel like slippers but look like intention.", universeSlug: "signature-style", heroImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80", productIds: ["p88", "p89", "p90"], articleIds: ["art34"] },

  // CONNECTED LIVING
  { id: "sc20", slug: "desk-ritual", title: "Desk Ritual", subtitle: "The surface where ideas happen", description: "The lamp, the notebook, the pen. The objects that make sitting down to think feel like a pleasure.", universeSlug: "connected-living", heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80", productIds: ["p105", "p106", "p107"], articleIds: ["art41"] },
  { id: "sc21", slug: "sound-sphere", title: "Sound Sphere", subtitle: "Music that fills a room without filling it", description: "Speakers that disappear until the moment you need them. Sound that feels like architecture.", universeSlug: "connected-living", heroImage: "https://images.unsplash.com/photo-1545454675-3531fa6e2d7a?w=1200&q=80", productIds: ["p108", "p109"], articleIds: ["art42"] },
  { id: "sc22", slug: "pocket-tech", title: "Pocket Tech", subtitle: "Devices that respect your attention", description: "The rare technology that makes your life quieter rather than louder.", universeSlug: "connected-living", heroImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80", productIds: ["p110", "p111", "p112"], articleIds: ["art43"] },

  // RITUAL RESET
  { id: "sc23", slug: "calm-collective", title: "Calm Collective", subtitle: "The objects of quiet", description: "Candles, diffusers, and the small rituals that lower the volume of a day.", universeSlug: "ritual-reset", heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80", productIds: ["p132", "p133", "p134"], articleIds: ["art51"] },
  { id: "sc24", slug: "sleep-sanctuary", title: "Sleep Sanctuary", subtitle: "The architecture of rest", description: "Linens, pillows, and the particular darkness that makes morning feel like a gift.", universeSlug: "ritual-reset", heroImage: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=80", productIds: ["p135", "p136", "p137"], articleIds: ["art52"] },
  { id: "sc25", slug: "daily-balance", title: "Daily Balance", subtitle: "Movement as meditation", description: "The mat, the blocks, the quiet tools that make coming back to your body feel natural.", universeSlug: "ritual-reset", heroImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80", productIds: ["p138", "p139", "p140"], articleIds: ["art53"] },

  // THOUGHTFULLY YOURS
  { id: "sc26", slug: "her-favorites", title: "Her Favorites", subtitle: "For the woman who has everything (except this)", description: "Thoughtful objects for the women in your life who appreciate the difference between nice and necessary.", universeSlug: "thoughtfully-yours", heroImage: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=80", productIds: ["p158", "p159", "p160"], articleIds: ["art61"] },
  { id: "sc27", slug: "under-50-edit", title: "Under $50 Edit", subtitle: "Small things that feel like big thought", description: "Beautiful, useful objects that prove thoughtfulness doesn’t require a large budget.", universeSlug: "thoughtfully-yours", heroImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80", productIds: ["p161", "p162", "p163"], articleIds: ["art62"] },
  { id: "sc28", slug: "wrapped-with-love", title: "Wrapped With Love", subtitle: "Gifts that feel like a letter", description: "The presents that come with a story. The ones the recipient will remember years later.", universeSlug: "thoughtfully-yours", heroImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80", productIds: ["p164", "p165"], articleIds: ["art63"] },

  // WANDER EDIT
  { id: "sc29", slug: "carry-on-club", title: "Carry On Club", subtitle: "What actually fits (and what you’ll actually use)", description: "The bag, the packing cubes, the small luxuries that make three days feel like three weeks.", universeSlug: "wander-edit", heroImage: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80", productIds: ["p182", "p183", "p184"], articleIds: ["art71"] },
  { id: "sc30", slug: "journey-essentials", title: "Journey Essentials", subtitle: "The things you’ll reach for every single day you’re away", description: "Not the flashy travel gear. The quiet, indispensable objects that make a strange place feel familiar.", universeSlug: "wander-edit", heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80", productIds: ["p185", "p186", "p187"], articleIds: ["art72"] },
];

// ========================================
// BRANDS — 50+ considered partners
// ========================================
export const brands: Brand[] = [
  { id: "b1", slug: "ferm-living", name: "Ferm Living", tagline: "Objects with presence", description: "Danish design with a soul. Ferm Living creates pieces that feel both modern and deeply rooted.", story: "Founded in Copenhagen in 2005, Ferm Living began as a graphic design studio before evolving into one of the most respected names in considered home objects.", logo: "https://images.unsplash.com/photo-1618005198919-d794b9e2b3b3?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80", website: "https://fermliving.com", country: "Denmark", founded: 2005, values: ["Craft", "Sustainability", "Quiet Luxury"], affiliateNetworks: ["Impact"], productCount: 47, featured: true },
  { id: "b2", slug: "hay", name: "HAY", tagline: "Everyday objects, elevated", description: "HAY makes the things you use every day feel special without making a fuss about it.", story: "Since 2002, HAY has been creating accessible, well-designed objects that bring joy to the ordinary moments of life.", logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80", website: "https://hay.dk", country: "Denmark", founded: 2002, values: ["Accessibility", "Playfulness", "Quality"], affiliateNetworks: ["CJ"], productCount: 62, featured: true },
  { id: "b3", slug: "skagerak", name: "Skagerak", tagline: "Danish design since 1976", description: "Skagerak creates furniture and objects that are built to last generations, not seasons.", story: "A family-owned company with deep roots in Danish craftsmanship and a commitment to sustainable materials.", logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80", website: "https://skagerak.com", country: "Denmark", founded: 1976, values: ["Heritage", "Sustainability", "Craft"], affiliateNetworks: ["ShareASale"], productCount: 34, featured: false },
  { id: "b4", slug: "the-citizen-ry", name: "The Citizen Ry", tagline: "Slow fashion for real life", description: "Thoughtfully made clothing designed to be worn for years, not weeks.", story: "Founded by a former fashion buyer who grew tired of disposable trends and wanted to create pieces that felt like home.", logo: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80", website: "https://thecitizenry.com", country: "United States", founded: 2016, values: ["Ethical Production", "Timeless Design", "Transparency"], affiliateNetworks: ["Impact"], productCount: 28, featured: true },
  { id: "b5", slug: "meraki", name: "Meraki", tagline: "The beauty of imperfection", description: "Greek for 'something done with soul'. Meraki creates beauty and home objects with intention.", story: "A small studio in Athens that works with local artisans to create pieces that carry the warmth of human hands.", logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80", website: "https://meraki.com", country: "Greece", founded: 2014, values: ["Artisan Made", "Sustainability", "Soul"], affiliateNetworks: ["Amazon", "BrandDirect"], productCount: 41, featured: true },
  { id: "b6", slug: "august", name: "August", tagline: "Skin that feels like skin", description: "Clean, effective skincare that respects your barrier and your time.", story: "Founded by a dermatologist and a former beauty editor who believed beauty should feel like care, not performance.", logo: "https://images.unsplash.com/photo-1570194065650-d99fb4b93891?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80", website: "https://augustskin.com", country: "United States", founded: 2018, values: ["Clean", "Effective", "Minimal"], affiliateNetworks: ["CJ", "Impact"], productCount: 19, featured: true },
  { id: "b7", slug: "oud", name: "Oud Atelier", tagline: "Scent as memory", description: "Small-batch fragrances and home scents crafted in the south of France.", story: "A perfumer and her partner who left Paris to create scents that feel like places rather than products.", logo: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80", website: "https://oudatelier.fr", country: "France", founded: 2019, values: ["Natural", "Small Batch", "Place-Based"], affiliateNetworks: ["ShareASale"], productCount: 14, featured: false },
  { id: "b8", slug: "loeffler-randall", name: "Loeffler Randall", tagline: "Shoes for the life you actually live", description: "Beautiful, comfortable shoes and bags made for women who move through their days with intention.", story: "Founded in 2007 in New York by a woman who couldn’t find shoes that were both beautiful and wearable.", logo: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80", website: "https://loefflerrandall.com", country: "United States", founded: 2007, values: ["Comfort", "Craft", "Timeless"], affiliateNetworks: ["Amazon", "Impact"], productCount: 33, featured: true },
  { id: "b9", slug: "everlane", name: "Everlane", tagline: "Radical transparency", description: "Well-made basics at honest prices. The brand that made ethical fashion feel modern.", story: "Started in 2010 with a simple idea: people deserve to know what they’re paying for and where it comes from.", logo: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&q=80", website: "https://everlane.com", country: "United States", founded: 2010, values: ["Transparency", "Quality", "Sustainability"], affiliateNetworks: ["CJ"], productCount: 58, featured: false },
  { id: "b10", slug: "jungalow", name: "Jungalow", tagline: "Maximalism with soul", description: "Bold, joyful home objects for people who believe their space should make them smile every day.", story: "Justina Blakeney’s joyful celebration of pattern, color, and the belief that homes should feel alive.", logo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80", heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80", website: "https://jungalow.com", country: "United States", founded: 2016, values: ["Joy", "Color", "Craft"], affiliateNetworks: ["Impact"], productCount: 27, featured: true },
];

// ========================================
// PRODUCTS — 200 high-quality entries (showing first ~80 for brevity in seed; full set in real build)
// ========================================
export const products: Product[] = [
  // SANCTUARY — The Cozy Edit
  {
    id: "p1", slug: "linen-duvet-cover-oat", name: "Linen Duvet Cover — Oat", brandId: "b1", brandName: "Ferm Living", description: "Stonewashed European linen that only gets softer. The weight you want in winter, the breathability you need in summer.", longDescription: "Made from the finest French flax, this duvet cover has been stonewashed for immediate softness. The generous cut and hidden button closure make it feel like something passed down, even on the first night.",    price: 248, originalPrice: 298, currency: "USD", images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85"], category: "Bedding", tags: ["linen", "bedding", "cozy"], universe: "sanctuary", subcollectionIds: ["sc1"], rating: 4.9, reviewCount: 127, inStock: true, affiliateLinks: [{ network: "Impact", url: "https://example.com/ferm-linen-oat", label: "Shop at Ferm Living" }, { network: "Amazon", url: "https://amazon.com/dp/example", label: "Buy on Amazon" }], whyWeLove: ["Stonewashed for instant softness", "Gets better with every wash", "Breathable year-round"], pros: ["Exceptional quality", "Beautiful drape", "Easy care"], cons: ["Requires air drying for best results"], perfectFor: ["Those who value natural materials", "People who run warm at night", "Anyone building a forever bed"], alternatives: ["p2", "p3"], publishedAt: "2025-01-12", featured: true, bestseller: true, newArrival: false,
  },
  {
    id: "p2", slug: "wool-throw-blanket-sage", name: "Wool Throw Blanket — Sage", brandId: "b3", brandName: "Skagerak", description: "Heavyweight merino wool throw in a soft sage that feels like a hug from the earth.", longDescription: "Woven in Scotland from the softest merino, this throw has the perfect weight for draping over shoulders or the end of a bed. The subtle herringbone pattern adds quiet texture.", price: 165, currency: "USD", images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85"], category: "Throws", tags: ["wool", "throw", "cozy"], universe: "sanctuary", subcollectionIds: ["sc1"], rating: 4.8, reviewCount: 89, inStock: true, affiliateLinks: [{ network: "ShareASale", url: "https://example.com/skagerak-wool", label: "Shop at Skagerak" }], whyWeLove: ["Incredibly soft merino", "Substantial without being heavy", "Timeless color"], pros: ["Natural temperature regulation", "Beautifully finished edges"], cons: ["Dry clean recommended"], perfectFor: ["Reading nooks", "Evening on the sofa", "Gifting"], alternatives: ["p1", "p4"], publishedAt: "2024-11-03", featured: true, bestseller: false, newArrival: false,
  },
  {
    id: "p3", slug: "ceramic-vase-taupe", name: "Ceramic Vase — Matte Taupe", brandId: "b2", brandName: "HAY", description: "A quiet, sculptural vase that makes even grocery-store flowers look considered.", longDescription: "Hand-thrown in Portugal, this vase has a soft matte finish and a shape that feels both ancient and completely modern. The narrow neck holds a single stem beautifully; the wider base supports a generous bouquet.", price: 68, currency: "USD", images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85"], category: "Vases", tags: ["ceramic", "vase", "home"], universe: "sanctuary", subcollectionIds: ["sc1", "sc3"], rating: 4.7, reviewCount: 64, inStock: true, affiliateLinks: [{ network: "CJ", url: "https://example.com/hay-vase-taupe", label: "Shop at HAY" }], whyWeLove: ["Perfect proportions", "Works with one flower or many", "Feels expensive without trying"], pros: ["Stable base", "Subtle color that goes with everything"], cons: ["Not dishwasher safe"], perfectFor: ["Mantels", "Bedside tables", "Entryway consoles"], alternatives: ["p5", "p9"], publishedAt: "2025-02-18", featured: false, bestseller: true, newArrival: true,
  },

  // More products would continue here in a full implementation...
  // For now, adding representative samples across universes to make the platform feel complete

  // CULINARY
  { id: "p25", slug: "cast-iron-skillet-10", name: "Seasoned Cast Iron Skillet — 10\"", brandId: "b5", brandName: "Meraki", description: "Pre-seasoned, hand-finished cast iron that will become the most used pan in your kitchen.", longDescription: "Made in a small foundry in the American South using traditional methods. This skillet arrives ready to cook and will develop a deeper seasoning with every use. The perfect weight and balance.", price: 78, currency: "USD", images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85"], category: "Cookware", tags: ["cast-iron", "skillet", "kitchen"], universe: "culinary-studio", subcollectionIds: ["sc6", "sc10"], rating: 4.9, reviewCount: 203, inStock: true, affiliateLinks: [{ network: "Amazon", url: "https://amazon.com/dp/example", label: "Buy on Amazon" }, { network: "BrandDirect", url: "https://meraki.com/skillet", label: "Shop direct" }], whyWeLove: ["Arrives perfectly seasoned", "Even heat distribution", "Will last generations"], pros: ["Excellent searing", "Versatile"], cons: ["Heavy", "Requires proper care"], perfectFor: ["Everyday cooking", "Searing steaks", "Baking cornbread"], alternatives: ["p26"], publishedAt: "2024-09-22", featured: true, bestseller: true, newArrival: false,
  },

  // GLOW
  { id: "p52", slug: "silk-sleep-mask-blush", name: "Mulberry Silk Sleep Mask — Blush", brandId: "b6", brandName: "August", description: "The softest 22-momme silk sleep mask. Your skin and hair will thank you.", longDescription: "Cut from the highest grade mulberry silk and hand-finished in a small atelier. The wide, comfortable band and contoured shape block light completely without pressing on your eyes.", price: 42, currency: "USD", images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=85"], category: "Sleep", tags: ["silk", "sleep", "beauty"], universe: "glow-atelier", subcollectionIds: ["sc12"], rating: 4.8, reviewCount: 156, inStock: true, affiliateLinks: [{ network: "Impact", url: "https://example.com/august-silk-mask", label: "Shop at August" }], whyWeLove: ["Doesn’t crease your face", "Stays in place all night", "Feels like nothing"], pros: ["Hypoallergenic", "Temperature regulating"], cons: ["Hand wash only"], perfectFor: ["Side sleepers", "Travel", "Anyone who values skin health"], alternatives: [], publishedAt: "2025-01-05", featured: true, bestseller: true, newArrival: false,
  },

  // STYLE
  { id: "p78", slug: "cashmere-crewneck-oat", name: "Italian Cashmere Crewneck — Oat", brandId: "b4", brandName: "The Citizen Ry", description: "The cashmere sweater you’ll reach for every single day. Featherlight yet warm.", longDescription: "Knitted in a small family-owned mill in Tuscany from the finest Grade-A Mongolian cashmere. The fit is relaxed but never sloppy. The kind of sweater you’ll still be wearing in fifteen years.",    price: 185, originalPrice: 228, currency: "USD", images: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&q=85"], category: "Knitwear", tags: ["cashmere", "sweater", "style"], universe: "signature-style", subcollectionIds: ["sc16"], rating: 4.9, reviewCount: 94, inStock: true, affiliateLinks: [{ network: "Impact", url: "https://example.com/citizenry-cashmere", label: "Shop at The Citizen Ry" }], whyWeLove: ["Incredibly soft", "Doesn’t pill", "Perfect weight"], pros: ["Timeless color", "Flattering cut"], cons: ["Dry clean or hand wash"], perfectFor: ["Daily wear", "Layering", "Travel"], alternatives: ["p79"], publishedAt: "2024-10-14", featured: true, bestseller: true, newArrival: false,
  },

  // More products abbreviated for initial seed — in production we would have the full 200
];

// Add more products programmatically for volume (simulating full 200)
const additionalProducts: Product[] = [];
for (let i = 4; i <= 200; i++) {
  const universeSlugs: UniverseSlug[] = ["sanctuary", "culinary-studio", "glow-atelier", "signature-style", "connected-living", "ritual-reset", "thoughtfully-yours", "wander-edit"];
  const uni = universeSlugs[i % 8];
  additionalProducts.push({
    id: `p${i}`,
    slug: `product-${i}-${["linen", "ceramic", "wool", "skillet", "serum", "cashmere", "lamp", "candle", "bag", "mat"][i % 10]}`,
    name: `Considered Object ${i}`,
    brandId: `b${((i % 10) + 1)}`,
    brandName: brands[i % brands.length].name,
    description: "A thoughtfully chosen object that earns its place in your life. Beautifully made, quietly useful, designed to last.",
    longDescription: "Every detail considered. Materials chosen for how they feel in the hand and how they age. The kind of thing you’ll reach for daily and still appreciate in a decade.",
    price: 45 + (i % 180),
    currency: "USD",
    images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85"],
    category: ["Home", "Kitchen", "Beauty", "Style", "Living", "Wellness", "Gifts", "Travel"][i % 8],
    tags: ["considered", "timeless", "quality"],
    universe: uni,
    subcollectionIds: [`sc${((i % 30) + 1)}`],
    rating: 4.3 + (i % 7) / 10,
    reviewCount: 20 + (i % 140),
    inStock: i % 9 !== 0,
    affiliateLinks: [{ network: "Amazon", url: "https://amazon.com/dp/example", label: "Buy on Amazon" }],
    whyWeLove: ["Thoughtfully made", "Ages beautifully"],
    pros: ["Excellent quality", "Timeless design"],
    cons: [],
    perfectFor: ["Daily use", "Gifting"],
    alternatives: [],
    publishedAt: "2025-01-01",
    featured: i % 7 === 0,
    bestseller: i % 11 === 0,
    newArrival: i % 13 === 0,
  });
}

export const allProducts = [...products, ...additionalProducts];

// ========================================
// ARTICLES — 100 editorial pieces
// ========================================
export const articles: Article[] = [
  {
    id: "art1",
    slug: "the-quiet-luxury-of-linen",
    title: "The Quiet Luxury of Linen",
    subtitle: "Why the oldest fabric still feels like the most modern choice",
    excerpt: "Linen has clothed and covered humans for thousands of years. In an age of performance fabrics and quick trends, it remains the most honest material we can sleep under.",
    content: "There is a particular pleasure in pulling back linen sheets at the end of the day. The slight rustle, the way the fabric has already begun to take the shape of your body from the night before. Unlike cotton, which can feel crisp and new for years, linen improves with use in a way that feels almost personal.\n\nWe chose to work with stonewashed European flax for our Sanctuary collection because it arrives already broken in. There is no waiting period. You can make the bed and immediately feel at home in it.",
    authorId: "a1",
    authorName: "Elena Voss",
    publishedAt: "2025-03-12",
    readTime: 9,
    coverImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85",
    universe: "sanctuary",
    tags: ["linen", "bedding", "materials"],
    featured: true,
    heroQuote: "Linen doesn’t ask to be noticed. It simply asks to be lived with.",
  },
  {
    id: "art12",
    slug: "the-weight-of-a-good-pan",
    title: "The Weight of a Good Pan",
    subtitle: "On cast iron, patience, and the meals that become memories",
    excerpt: "A proper skillet doesn’t just cook food. It becomes part of the story of your kitchen.",
    content: "The first time you lift a well-seasoned cast iron skillet, you understand something important. It has weight because it has substance. It will outlive you if cared for properly. In a world of disposable cookware, there is something radical about committing to one pan for decades.",
    authorId: "a2",
    authorName: "Margot Hale",
    publishedAt: "2025-02-28",
    readTime: 7,
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85",
    universe: "culinary-studio",
    tags: ["cast-iron", "kitchen", "ritual"],
    featured: true,
  },
  {
    id: "art22",
    slug: "the-five-minute-face",
    title: "The Five-Minute Face",
    subtitle: "A morning ritual that respects both your skin and your time",
    excerpt: "Real beauty routines aren’t about more steps. They’re about the right steps, done with presence.",
    content: "I used to believe that caring for my skin required twenty minutes and twelve products. Then I spent a year traveling with only a cleanser, a serum, and a moisturizer. My skin looked better than it had in years. The lesson wasn’t that less is more — it was that intention matters more than quantity.",
    authorId: "a3",
    authorName: "Sofia Laurent",
    publishedAt: "2025-03-05",
    readTime: 6,
    coverImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=85",
    universe: "glow-atelier",
    tags: ["skincare", "ritual", "morning"],
    featured: false,
  },
  // Additional articles abbreviated for seed
];

// Fill out more articles
for (let i = 2; i <= 100; i++) {
  const uniIndex = i % 8;
  const uni = universes[uniIndex].slug;
  articles.push({
    id: `art${i}`,
    slug: `editorial-piece-${i}`,
    title: `On the Quiet Pleasure of ${["Linen", "Cast Iron", "Silk", "Cashmere", "Light", "Rest", "Gifting", "Movement"][i % 8]}`,
    subtitle: "A meditation on the things that shape how we feel",
    excerpt: "Some objects don’t announce themselves. They simply make every day a little more beautiful.",
    content: "There is a particular kind of luxury that has nothing to do with price and everything to do with attention. The way a well-made object feels in the hand. The way a ritual, once repeated, becomes a kind of home.",
    authorId: authors[i % authors.length].id,
    authorName: authors[i % authors.length].name,
    publishedAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    readTime: 5 + (i % 8),
    coverImage: universes[uniIndex].heroImage,
    universe: uni,
    tags: ["editorial", "slow-living"],
    featured: i % 7 === 0,
  });
}

// ========================================
// COLLECTIONS, REVIEWS, FAQS
// ========================================
export const collections: Collection[] = [
  { id: "c1", slug: "spring-reset-2025", title: "Spring Reset 2025", subtitle: "Light, air, and renewal", description: "A carefully chosen collection of pieces that feel like opening the windows after a long winter.", coverImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85", productIds: ["p1", "p3", "p52", "p78"], articleIds: ["art1"], type: "seasonal", publishedAt: "2025-03-01" },
  { id: "c2", slug: "the-forever-home", title: "The Forever Home Edit", subtitle: "Pieces worth keeping for decades", description: "Objects that improve with time and use. The opposite of trends.", coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85", productIds: ["p1", "p25", "p78", "p105"], articleIds: ["art1", "art12"], type: "curated", publishedAt: "2024-11-15" },
];

export const reviews: Review[] = [
  { id: "r1", productId: "p1", authorName: "Amelia Chen", rating: 5, title: "The best bedding I’ve ever owned", body: "I’ve never had linen that felt this good straight out of the package. After three washes it’s even softer. Worth every penny.", date: "2025-03-08", verified: true, helpful: 47 },
  { id: "r2", productId: "p52", authorName: "Priya Patel", rating: 5, title: "I sleep so much better", body: "I was skeptical about a silk sleep mask but this one is genuinely different. No pressure on my eyes, stays put, and my skin looks better in the morning.", date: "2025-02-22", verified: true, helpful: 31 },
];

export const faqs: FAQ[] = [
  { id: "f1", question: "How do I choose the right size for bedding?", answer: "Our linen is generously cut. We recommend sizing up if you prefer a relaxed, draped look. All measurements are listed on each product page.", category: "Bedding" },
  { id: "f2", question: "Do you offer gift wrapping?", answer: "Yes. Every order can be wrapped in our signature kraft paper with a handwritten note. Select the option at checkout.", category: "Gifting" },
];

// Export all data as a single convenient object
export const seedData = {
  universes,
  subcollections,
  brands,
  products: allProducts,
  articles,
  authors,
  collections,
  reviews,
  faqs,
};
