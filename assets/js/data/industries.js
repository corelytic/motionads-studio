const industryRecipes = {
  restaurants: {
    label: "Restaurants",
    hooks: [
      "Your next craving starts in the first 2 seconds.",
      "Fresh, hot, impossible to scroll past.",
      "Turn dinner indecision into instant orders."
    ],
    ctas: ["Order now", "Reserve tonight", "Claim lunch deal"],
    scenes: ["intro", "product", "offer", "review", "cta", "ending"],
    transitions: ["steam-rise", "cheese-stretch", "price-pop"],
    overlays: ["steam overlay", "sauce drip", "spark badge"],
    structure: ["Signature dish", "Offer stack", "Social proof", "Fast CTA"],
    palette: ["#ff6b2c", "#ffd166", "#7bf1a8"]
  },
  fashion: {
    label: "Fashion",
    hooks: [
      "Looks that stop the scroll before the fit even lands.",
      "New drop. Clean silhouette. Limited run.",
      "Style the moment before everyone else does."
    ],
    ctas: ["Shop the drop", "View collection", "Unlock early access"],
    scenes: ["intro", "product", "offer", "cta", "ending"],
    transitions: ["runway-swipe", "flash-cut", "luxury-fade"],
    overlays: ["grain glow", "frame badge", "drop shadow card"],
    structure: ["Hero fit", "Texture detail", "Urgency", "Purchase CTA"],
    palette: ["#f4f1eb", "#1b1b1d", "#d6a77a"]
  },
  ecommerce: {
    label: "Ecommerce",
    hooks: [
      "Best seller momentum in motion.",
      "Scroll-stopping products, instantly understood.",
      "Show the offer before the bounce happens."
    ],
    ctas: ["Buy now", "Grab the deal", "Add to cart"],
    scenes: ["intro", "product", "offer", "review", "cta"],
    transitions: ["zoom-snap", "highlight-flare", "offer-slide"],
    overlays: ["deal sticker", "spark particles", "review stars"],
    structure: ["Problem", "Hero product", "Offer ladder", "CTA snap"],
    palette: ["#7c3aed", "#ffcb47", "#0ea5e9"]
  },
  saas: {
    label: "SaaS",
    hooks: [
      "Show the win before the feature list.",
      "Let the dashboard sell the transformation.",
      "One pain point. One metric jump. One CTA."
    ],
    ctas: ["Start free trial", "Book demo", "See it in action"],
    scenes: ["intro", "product", "offer", "cta", "ending"],
    transitions: ["metric-rise", "dashboard-wipe", "spotlight-glow"],
    overlays: ["chart beam", "grid pulse", "badge highlight"],
    structure: ["Pain hook", "Feature spotlight", "Result proof", "Demo CTA"],
    palette: ["#00d1b2", "#0f172a", "#60a5fa"]
  },
  gyms: {
    label: "Gyms",
    hooks: [
      "Momentum begins before the first rep.",
      "Energy on screen that feels like a challenge.",
      "Transform interest into booked sessions."
    ],
    ctas: ["Join now", "Claim trial pass", "Start transformation"],
    scenes: ["intro", "product", "offer", "review", "cta"],
    transitions: ["power-burst", "sweat-flash", "pulse-cut"],
    overlays: ["power ring", "performance meter", "goal badge"],
    structure: ["Challenge hook", "Results promise", "Offer", "CTA"],
    palette: ["#ef4444", "#101828", "#f59e0b"]
  },
  "beauty salons": {
    label: "Beauty Salons",
    hooks: [
      "Glow upgrades begin in one elegant reveal.",
      "Before-and-after energy without saying too much.",
      "Bookable beauty moments made cinematic."
    ],
    ctas: ["Book appointment", "Reserve your glow", "See services"],
    scenes: ["intro", "product", "offer", "review", "cta"],
    transitions: ["silk-fade", "shine-sweep", "soft-zoom"],
    overlays: ["glow dust", "beauty frame", "sparkline"],
    structure: ["Beauty promise", "Service reveal", "Offer", "Booking CTA"],
    palette: ["#f472b6", "#fde68a", "#1f2937"]
  },
  hotels: {
    label: "Hotels",
    hooks: [
      "Sell the feeling before the room category.",
      "Escape begins with atmosphere, not inventory.",
      "Make the stay feel booked already."
    ],
    ctas: ["Book your stay", "View rooms", "Claim weekend offer"],
    scenes: ["intro", "product", "offer", "cta", "ending"],
    transitions: ["cinema-pan", "gold-fade", "luxury-reveal"],
    overlays: ["sunrise haze", "concierge badge", "map pulse"],
    structure: ["Mood hook", "Room reveal", "Offer", "Reservation CTA"],
    palette: ["#fbbf24", "#0f172a", "#38bdf8"]
  },
  "real estate": {
    label: "Real Estate",
    hooks: [
      "Open with aspiration, close with urgency.",
      "Make the property feel larger than the listing.",
      "Sell lifestyle, then details, then action."
    ],
    ctas: ["Schedule a tour", "View listing", "Contact agent"],
    scenes: ["intro", "product", "review", "offer", "cta"],
    transitions: ["parallax-pan", "window-glow", "blueprint-rise"],
    overlays: ["price flag", "location pin", "amenity bar"],
    structure: ["Lifestyle hook", "Property highlight", "Proof", "Tour CTA"],
    palette: ["#0ea5e9", "#f8fafc", "#1e293b"]
  },
  podcasts: {
    label: "Podcasts",
    hooks: [
      "Make the first line impossible to skip.",
      "Audio personality translated into motion.",
      "Turn clips into binge-worthy promo loops."
    ],
    ctas: ["Listen now", "Watch clip", "Subscribe today"],
    scenes: ["intro", "product", "offer", "cta", "ending"],
    transitions: ["wave-pulse", "sound-react", "subtitle-snap"],
    overlays: ["audio bars", "neon ring", "social badge"],
    structure: ["Quote hook", "Host intro", "Episode value", "Listen CTA"],
    palette: ["#8b5cf6", "#111827", "#22d3ee"]
  },
  "ai tools": {
    label: "AI Tools",
    hooks: [
      "Lead with leverage, not jargon.",
      "Show the time saved in the first motion beat.",
      "From manual pain to AI speed in seconds."
    ],
    ctas: ["Try it free", "Launch workflow", "See AI demo"],
    scenes: ["intro", "product", "offer", "cta", "ending"],
    transitions: ["neural-sweep", "insight-rise", "interface-pop"],
    overlays: ["signal grid", "chip badge", "assistant glow"],
    structure: ["Pain hook", "Automation proof", "Speed result", "CTA"],
    palette: ["#22c55e", "#0f172a", "#a78bfa"]
  },
  events: {
    label: "Events",
    hooks: [
      "Make attendance feel urgent and social.",
      "Launch the vibe before the agenda.",
      "Tickets move faster when the energy is visible."
    ],
    ctas: ["Get tickets", "Reserve spot", "Join the event"],
    scenes: ["intro", "offer", "product", "cta", "ending"],
    transitions: ["crowd-flash", "confetti-rise", "countdown-pulse"],
    overlays: ["ticket badge", "event glow", "countdown ring"],
    structure: ["Hype hook", "Event value", "Urgency", "Ticket CTA"],
    palette: ["#fb7185", "#0f172a", "#facc15"]
  }
};

const goals = [
  "Launch Product",
  "Drive Sales",
  "Promote Offer",
  "Book Appointments",
  "Grow Leads",
  "Boost Awareness"
];

const platforms = [
  "Instagram Reel",
  "Story Ad",
  "Square Post",
  "YouTube Ad",
  "Website Hero",
  "Banner Ad"
];

const styles = [
  "High-Energy",
  "Luxury",
  "Minimal",
  "Cinematic",
  "Editorial",
  "Conversion Heavy"
];

const sizePresets = {
  reel: { label: "Reel 1080x1920", width: 1080, height: 1920 },
  story: { label: "Story 1080x1920", width: 1080, height: 1920 },
  square: { label: "Square 1080x1080", width: 1080, height: 1080 },
  youtube: { label: "YouTube 1920x1080", width: 1920, height: 1080 },
  banner: { label: "Banner 1600x600", width: 1600, height: 600 },
  hero: { label: "Hero 1440x900", width: 1440, height: 900 }
};

window.CorelyticData = {
  ...(window.CorelyticData || {}),
  industryRecipes,
  goals,
  platforms,
  styles,
  sizePresets
};
