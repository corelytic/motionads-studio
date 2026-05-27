const T = (id, name, industry, goal, platform, style, hook, cta, colors, motionRecipe, scenes) => ({
  id, name, industry, goal, platform, style, hook, cta, colors, motionRecipe, scenes
});

const motionTemplates = [
  T("restaurant-burger-promo", "Restaurant Burger Promo", "restaurants", "Drive Sales", "Instagram Reel", "High-Energy", "Bite-first motion that makes the craving immediate.", "Order now", ["#ff6b2c", "#ffd166", "#7bf1a8"], "Steam rise, fast zoom, CTA pulse", ["Intro appetite hook", "Burger hero reveal", "Offer stack", "Order CTA", "Brand sign-off"]),
  T("pizza-offer", "Pizza Offer", "restaurants", "Promote Offer", "Story Ad", "High-Energy", "Cheese pull motion meets a same-day offer push.", "Claim pizza deal", ["#e85d04", "#ffba08", "#f48c06"], "Cheese stretch, discount flash, timer bounce", ["Hot opening", "Pizza product focus", "Offer scene", "Urgency CTA", "Closing stamp"]),
  T("fashion-drop", "Fashion Drop", "fashion", "Launch Product", "Instagram Reel", "Editorial", "New drop. Clean silhouette. No wasted motion.", "Shop the drop", ["#f4f1eb", "#1b1b1d", "#d6a77a"], "Runway wipe, soft flash, luxe fade", ["Hook line", "Look reveal", "Collection focus", "Drop CTA", "Brand close"]),
  T("saas-launch", "SaaS Launch", "saas", "Grow Leads", "Website Hero", "Conversion Heavy", "Show the result before the feature list appears.", "Book demo", ["#00d1b2", "#0f172a", "#60a5fa"], "Dashboard wipe, metric count, glow anchor", ["Pain hook", "Dashboard product reveal", "Offer proof", "Demo CTA", "Trust ending"]),
  T("app-promo", "App Promo", "saas", "Launch Product", "Story Ad", "Minimal", "The fastest way to show utility in one screen.", "Download now", ["#22c55e", "#0f172a", "#93c5fd"], "Phone slide, icon pop, CTA glow", ["Utility hook", "App screen reveal", "Benefit frame", "Install CTA", "App badge ending"]),
  T("gym-challenge", "Gym Challenge", "gyms", "Drive Sales", "Instagram Reel", "High-Energy", "Challenge energy that feels like a dare.", "Join the challenge", ["#ef4444", "#101828", "#f59e0b"], "Power burst, counter pulse, fast cuts", ["Challenge intro", "Transformation focus", "Offer scene", "Join CTA", "Motivation ending"]),
  T("hotel-weekend", "Hotel Weekend", "hotels", "Promote Offer", "Square Post", "Luxury", "Sell the weekend feeling before the room details.", "Book your stay", ["#fbbf24", "#0f172a", "#38bdf8"], "Cinematic pan, gold fade, booking pulse", ["Escape hook", "Room reveal", "Weekend offer", "Reserve CTA", "Luxury sign-off"]),
  T("real-estate-listing", "Real Estate Listing", "real estate", "Boost Awareness", "YouTube Ad", "Cinematic", "Make the property feel aspirational in the first frame.", "Schedule a tour", ["#0ea5e9", "#f8fafc", "#1e293b"], "Parallax pan, price flag, blueprint rise", ["Lifestyle hook", "Property focus", "Amenity offer", "Tour CTA", "Broker ending"]),
  T("beauty-salon-offer", "Beauty Salon Offer", "beauty salons", "Book Appointments", "Story Ad", "Luxury", "Glow-first motion with booking-focused clarity.", "Reserve your glow", ["#f472b6", "#fde68a", "#1f2937"], "Silk fade, shine sweep, CTA bloom", ["Beauty promise", "Service reveal", "Offer value", "Book CTA", "Elegant close"]),
  T("event-countdown", "Event Countdown", "events", "Drive Sales", "Instagram Reel", "High-Energy", "Count the audience into action.", "Get tickets", ["#fb7185", "#0f172a", "#facc15"], "Countdown pulse, confetti burst, crowd flash", ["Hype hook", "Event reveal", "Urgency offer", "Ticket CTA", "Countdown ending"]),
  T("podcast-clip", "Podcast Clip", "podcasts", "Boost Awareness", "Square Post", "Minimal", "Turn one quote into a share-worthy teaser.", "Listen now", ["#8b5cf6", "#111827", "#22d3ee"], "Wave pulse, subtitle snap, neon ring", ["Quote hook", "Host scene", "Episode tease", "Listen CTA", "Follow ending"]),
  T("ai-tool-promo", "AI Tool Promo", "ai tools", "Grow Leads", "Website Hero", "Conversion Heavy", "From manual pain to AI speed in seconds.", "Try it free", ["#22c55e", "#0f172a", "#a78bfa"], "Interface pop, insight rise, CTA beam", ["Pain hook", "Tool reveal", "Result offer", "Trial CTA", "AI close"]),
  T("course-launch", "Course Launch", "saas", "Launch Product", "YouTube Ad", "Editorial", "Teach the outcome before the curriculum.", "Enroll today", ["#2563eb", "#f8fafc", "#f59e0b"], "Lesson card stack, progress rise, CTA pin", ["Outcome hook", "Course product focus", "Launch offer", "Enroll CTA", "Instructor ending"]),
  T("ecommerce-flash-sale", "Ecommerce Flash Sale", "ecommerce", "Drive Sales", "Instagram Reel", "High-Energy", "Fast-sale urgency built for instant taps.", "Grab the deal", ["#7c3aed", "#ffcb47", "#0ea5e9"], "Offer flash, sticker pulse, timer slide", ["Sale hook", "Product reveal", "Offer stack", "Purchase CTA", "Final urgency"]),
  T("product-reveal", "Product Reveal", "ecommerce", "Launch Product", "Square Post", "Cinematic", "Slow reveal that lands like a launch event.", "See the reveal", ["#0f172a", "#e2e8f0", "#38bdf8"], "Glow reveal, depth pan, badge rise", ["Mystery hook", "Reveal scene", "Feature focus", "Launch CTA", "Signature ending"]),
  T("coffee-shop-promo", "Coffee Shop Promo", "restaurants", "Drive Sales", "Story Ad", "Warm", "The smell is almost on screen.", "Visit today", ["#6f4e37", "#f4d58d", "#d99a6c"], "Steam drift, cup lift, sticker pulse", ["Morning hook", "Drink focus", "Offer scene", "Visit CTA", "Cafe sign-off"]),
  T("travel-deal", "Travel Deal", "hotels", "Promote Offer", "Banner Ad", "Cinematic", "Sell the escape while the price still feels urgent.", "Book the deal", ["#0ea5e9", "#f8fafc", "#14b8a6"], "Map pulse, horizon pan, CTA anchor", ["Escape hook", "Destination reveal", "Deal scene", "Book CTA", "Closing horizon"]),
  T("clinic-promo", "Clinic Promo", "beauty salons", "Book Appointments", "Website Hero", "Minimal", "Trust, clarity, and easy booking in one flow.", "Book consultation", ["#14b8a6", "#ecfeff", "#0f172a"], "Clean wipe, trust badge, CTA glow", ["Care hook", "Clinic service focus", "Offer scene", "Consult CTA", "Trust ending"]),
  T("car-rental-offer", "Car Rental Offer", "events", "Drive Sales", "Square Post", "Conversion Heavy", "Move faster with price clarity and availability pressure.", "Reserve now", ["#2563eb", "#111827", "#f59e0b"], "Speed line wipe, price lock, CTA snap", ["Mobility hook", "Vehicle focus", "Rental offer", "Reserve CTA", "Fleet ending"]),
  T("agency-service-promo", "Agency Service Promo", "saas", "Grow Leads", "Website Hero", "Luxury", "Results feel premium when the message is disciplined.", "Book strategy call", ["#111827", "#d6a77a", "#f9fafb"], "Case-study slide, metric rise, luxe fade", ["Growth hook", "Service product focus", "Offer proof", "Call CTA", "Authority ending"]),
  T("webinar-reminder", "Webinar Reminder", "events", "Boost Awareness", "Story Ad", "High-Energy", "Remind fast, clarify value, close with attendance urgency.", "Save your seat", ["#ec4899", "#0f172a", "#facc15"], "Countdown ring, host frame, CTA pulse", ["Reminder hook", "Topic reveal", "Seat offer", "Register CTA", "Countdown ending"]),
  T("black-friday-deal", "Black Friday Deal", "ecommerce", "Drive Sales", "Instagram Reel", "Aggressive", "Maximum urgency with hard-sale motion pressure.", "Unlock Black Friday", ["#111827", "#ef4444", "#facc15"], "Flash cut, timer lock, CTA burst", ["Deal hook", "Product rush", "Discount scene", "Buy CTA", "Final call"]),
  T("new-collection", "New Collection", "fashion", "Launch Product", "Square Post", "Luxury", "A premium drop told with restraint.", "Explore collection", ["#f5f5f4", "#1c1917", "#b45309"], "Silhouette pan, soft glow, CTA fade", ["Collection hook", "Hero look", "Range focus", "Explore CTA", "Logo ending"]),
  T("luxury-brand-reveal", "Luxury Brand Reveal", "fashion", "Boost Awareness", "Website Hero", "Luxury", "Cinematic identity motion for premium recall.", "Enter the brand", ["#d4af37", "#111111", "#faf7f0"], "Gold fade, soft focus, emblem rise", ["Mood hook", "Brand reveal", "Signature offer", "Enter CTA", "Prestige ending"]),
  T("local-business-ad", "Local Business Ad", "events", "Boost Awareness", "Banner Ad", "Conversion Heavy", "Simple, local, and direct enough to convert attention fast.", "Visit us today", ["#0f766e", "#fefce8", "#ea580c"], "Local pin pop, offer card, CTA anchor", ["Local hook", "Business focus", "Offer scene", "Visit CTA", "Map ending"])
];

const assetLibrary = [
  { id: "gradient-wave", type: "background", label: "Gradient Wave", fill: "#1d4ed8" },
  { id: "sunset-glow", type: "background", label: "Sunset Glow", fill: "#fb7185" },
  { id: "spark-badge", type: "badge", label: "Spark Badge", fill: "#facc15", text: "Trending" },
  { id: "cta-pill", type: "badge", label: "CTA Pill", fill: "#22c55e", text: "Order Now" },
  { id: "focus-ring", type: "shape", label: "Focus Ring", fill: "#60a5fa" },
  { id: "social-proof", type: "badge", label: "5-Star Burst", fill: "#f59e0b", text: "5.0 Rated" },
  { id: "particle-cluster", type: "shape", label: "Particle Cluster", fill: "#a78bfa" },
  { id: "price-sticker", type: "badge", label: "Price Sticker", fill: "#ef4444", text: "20% Off" }
];

const defaultThemes = [
  { id: "midnight-pulse", name: "Midnight Pulse", primary: "#56f0c3", secondary: "#ff9157", accent: "#6ba3ff", background: "#08131f", fontFamily: "Manrope" },
  { id: "sand-luxe", name: "Sand Luxe", primary: "#d6a77a", secondary: "#f4f1eb", accent: "#1b1b1d", background: "#101113", fontFamily: "Space Grotesk" },
  { id: "electric-growth", name: "Electric Growth", primary: "#22c55e", secondary: "#0f172a", accent: "#a78bfa", background: "#06111e", fontFamily: "Manrope" }
];

window.CorelyticData = {
  ...(window.CorelyticData || {}),
  motionTemplates,
  assetLibrary,
  defaultThemes
};
