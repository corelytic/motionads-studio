const { industryRecipes, sizePresets } = window.CorelyticData;

const coreSceneTypes = ["intro", "product", "offer", "cta", "ending"];

const variationProfiles = {
  aggressive: {
    tone: "urgent",
    intensity: 94,
    durationScale: 0.78,
    colorShift: ["#ff4d6d", "#ff9f1c", "#ffe66d"],
    cta: ["Buy now", "Claim the deal", "Move fast"],
    hookPrefix: "Stop scrolling.",
    order: ["intro", "offer", "product", "cta", "ending"]
  },
  luxury: {
    tone: "premium",
    intensity: 48,
    durationScale: 1.18,
    colorShift: ["#d6a77a", "#f3ebdc", "#111827"],
    cta: ["Reserve now", "Experience it", "Enter the collection"],
    hookPrefix: "Elevate the moment.",
    order: ["intro", "product", "offer", "ending", "cta"]
  },
  emotional: {
    tone: "warm",
    intensity: 62,
    durationScale: 1.04,
    colorShift: ["#f472b6", "#fde68a", "#7dd3fc"],
    cta: ["Feel the difference", "Start today", "Choose your moment"],
    hookPrefix: "Make it personal.",
    order: ["intro", "product", "cta", "offer", "ending"]
  },
  minimal: {
    tone: "clean",
    intensity: 38,
    durationScale: 0.92,
    colorShift: ["#dbeafe", "#94a3b8", "#0f172a"],
    cta: ["Learn more", "See details", "Explore now"],
    hookPrefix: "Less noise. More clarity.",
    order: ["intro", "product", "offer", "cta", "ending"]
  },
  "high-energy": {
    tone: "hype",
    intensity: 100,
    durationScale: 0.72,
    colorShift: ["#22c55e", "#06b6d4", "#f97316"],
    cta: ["Jump in now", "Launch today", "Act now"],
    hookPrefix: "Big energy.",
    order: ["intro", "product", "cta", "offer", "ending"]
  }
};

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getPlatformKey(platform) {
  const value = platform.toLowerCase();
  if (value.includes("story")) return "story";
  if (value.includes("square")) return "square";
  if (value.includes("youtube")) return "youtube";
  if (value.includes("banner")) return "banner";
  if (value.includes("hero")) return "hero";
  return "reel";
}

function titleCase(value) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

function createTextElement(sceneId, layerName, text, x, y, width, fontSize, fill, animation = "rise", weight = "700") {
  return {
    id: uid("el"),
    sceneId,
    layerName,
    type: "text",
    text,
    x,
    y,
    width,
    height: 0.12,
    rotation: 0,
    fontSize,
    fill,
    fontWeight: weight,
    align: "left",
    animation,
    start: 0,
    end: 1
  };
}

function createShapeElement(sceneId, layerName, shapeKind, fill, x, y, width, height, opacity = 1) {
  return { id: uid("el"), sceneId, layerName, type: "shape", shapeKind, fill, x, y, width, height, rotation: 0, opacity, start: 0, end: 1 };
}

function createImageElement(sceneId, dataUrl) {
  return {
    id: uid("el"),
    sceneId,
    layerName: "Uploaded Asset",
    type: "image",
    dataUrl,
    x: 0.62,
    y: 0.18,
    width: 0.22,
    height: 0.36,
    rotation: 0,
    opacity: 1,
    animation: "float",
    start: 0,
    end: 1
  };
}

function buildHook(recipe, config, productName) {
  const base = recipe.hooks[0];
  const goalMap = {
    "Launch Product": `Launch ${productName} with instant attention.`,
    "Drive Sales": `Turn attention into buyers for ${productName}.`,
    "Promote Offer": `${config.offer} before the scroll is gone.`,
    "Book Appointments": `Make booking ${productName} feel irresistible.`,
    "Grow Leads": `Get warmer leads with a clearer first hook.`,
    "Boost Awareness": `Make ${productName} memorable in the first beat.`
  };
  return goalMap[config.goal] || base;
}

function buildSubheadline(config, recipe) {
  return `${config.style} pacing, ${recipe.transitions[0]} transitions, and ${config.goal.toLowerCase()} messaging tuned for ${config.platform.toLowerCase()}.`;
}

function buildMotionRecipe(recipe, style) {
  return {
    summary: `${style} ad system using ${recipe.transitions.join(", ")} with ${recipe.overlays.join(", ")}.`,
    transitions: recipe.transitions,
    overlays: recipe.overlays,
    structure: recipe.structure
  };
}

function sceneBlueprint(type, config, recipe) {
  const productName = config.productName || recipe.label;
  const baseHook = buildHook(recipe, config, productName);
  const sceneMap = {
    intro: {
      name: "Intro Scene",
      headline: baseHook,
      subheadline: `${config.goal} for ${productName}`,
      body: `${config.style} motion opens with immediate visual contrast and a promise of value.`,
      cta: config.cta
    },
    product: {
      name: "Product Focus",
      headline: `${productName} in focus`,
      subheadline: `Hero product reveal for ${config.platform}`,
      body: `Zoom the product or service benefits first, then anchor credibility with one strong detail.`,
      cta: config.cta
    },
    offer: {
      name: "Offer Scene",
      headline: config.offer,
      subheadline: "Offer clarity with visual urgency",
      body: `Present the offer, value stack, and timing pressure in a single readable composition.`,
      cta: config.cta
    },
    cta: {
      name: "CTA Scene",
      headline: `${config.cta} now`,
      subheadline: "Direct response close",
      body: `Make the action simple, high-contrast, and impossible to miss.`,
      cta: config.cta
    },
    ending: {
      name: "Ending Scene",
      headline: `${config.brandName || recipe.label} closes strong`,
      subheadline: "Memorable sign-off and final push",
      body: `End with brand recall, clean pacing, and one final action signal.`,
      cta: config.cta
    }
  };
  return sceneMap[type];
}

function createScene(index, type, recipe, config) {
  const sceneId = uid("scene");
  const palette = [config.primary, config.secondary, config.accent];
  const blueprint = sceneBlueprint(type, config, recipe);
  const durationMap = {
    intro: 2.4,
    product: 3.2,
    offer: 2.6,
    cta: 2.3,
    ending: 1.9
  };
  const animationMap = {
    intro: "rise",
    product: "zoom",
    offer: "pulse",
    cta: "flash",
    ending: "fade"
  };

  const scene = {
    id: sceneId,
    type,
    name: blueprint.name,
    animationType: animationMap[type],
    duration: durationMap[type],
    transition: recipe.transitions[index % recipe.transitions.length],
    headline: blueprint.headline,
    subheadline: blueprint.subheadline,
    body: blueprint.body,
    cta: blueprint.cta,
    offer: config.offer,
    background: palette[index % palette.length],
    motionIntensity: config.motionIntensity,
    elements: []
  };

  scene.elements.push(createShapeElement(sceneId, "Backdrop", "rect", `${scene.background}22`, 0.06, 0.08, 0.88, 0.84, 1));
  scene.elements.push(createShapeElement(sceneId, "Accent Orb", "circle", palette[(index + 1) % palette.length], 0.71, 0.1, 0.2, 0.2, 0.24));
  scene.elements.push(createTextElement(sceneId, "Headline", scene.headline, 0.1, 0.14, 0.72, 54, "#ffffff", "rise", "800"));
  scene.elements.push(createTextElement(sceneId, "Subheadline", scene.subheadline, 0.1, 0.3, 0.66, 24, "#dce7ff", "fade", "700"));
  scene.elements.push(createTextElement(sceneId, "Body", scene.body, 0.1, 0.42, 0.64, 22, "#bfd2ef", "fade", "500"));
  scene.elements.push(createTextElement(sceneId, "CTA", scene.cta.toUpperCase(), 0.1, 0.74, 0.34, 22, palette[(index + 2) % palette.length], "pulse", "800"));
  if (config.assetDataUrl && (type === "product" || type === "ending")) {
    scene.elements.push(createImageElement(sceneId, config.assetDataUrl));
  }
  return scene;
}

function generateCampaign(config, brandKit = {}) {
  const recipe = industryRecipes[config.industry];
  const presetKey = getPlatformKey(config.platform);
  const sizePreset = sizePresets[presetKey];
  const merged = {
    ...config,
    brandName: brandKit.brandName || config.brandName || recipe.label,
    productName: config.productName || recipe.label,
    offer: config.offer || "Limited-time offer",
    cta: config.cta || recipe.ctas[0],
    motionIntensity: Number(config.motionIntensity || 72),
    primary: brandKit.primary || config.primary || recipe.palette[0],
    secondary: brandKit.secondary || config.secondary || recipe.palette[1],
    accent: brandKit.accent || config.accent || recipe.palette[2],
    assetDataUrl: config.assetDataUrl || null
  };

  const scenes = coreSceneTypes.map((type, index) => createScene(index, type, recipe, merged));
  const motionRecipe = buildMotionRecipe(recipe, config.style);
  const hooks = recipe.hooks.map((text, index) => ({
    id: uid("hook"),
    text: index === 0 ? buildHook(recipe, merged, merged.productName) : `${text} ${merged.productName}`,
    pacing: ["Snap open", "Anchor product", "Close with urgency"][index % 3],
    attentionPattern: ["Contrast", "Specificity", "Offer-first"][index % 3]
  }));
  const ctas = (config.cta ? [config.cta, ...recipe.ctas] : recipe.ctas).slice(0, 5).map((label, index) => ({
    id: uid("cta"),
    label,
    rationale: [
      "Direct response phrasing that reduces friction.",
      "Balances urgency and clarity for mid-funnel buyers.",
      "Works well when the offer needs a cleaner close."
    ][index % 3]
  }));

  return {
    id: uid("project"),
    name: `${merged.brandName} ${titleCase(config.goal)} Campaign`,
    industry: config.industry,
    goal: config.goal,
    platform: config.platform,
    style: config.style,
    variation: "original",
    sizePreset: presetKey,
    width: sizePreset.width,
    height: sizePreset.height,
    motionIntensity: merged.motionIntensity,
    productName: merged.productName,
    offer: merged.offer,
    cta: merged.cta,
    headline: hooks[0].text,
    subheadline: buildSubheadline(config, recipe),
    recommendedNextAction: "Review the hook, then refine product and offer scenes.",
    motionRecipe,
    brandKit: {
      brandName: merged.brandName,
      primary: merged.primary,
      secondary: merged.secondary,
      accent: merged.accent,
      background: brandKit.background || "#08131f",
      fontFamily: brandKit.fontFamily || "Manrope",
      logoText: brandKit.logoText || merged.brandName.slice(0, 2).toUpperCase()
    },
    assetDataUrl: merged.assetDataUrl,
    hooks,
    ctas,
    suggestions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
    scenes
  };
}

function reorderByType(scenes, orderedTypes) {
  return orderedTypes.map((type) => scenes.find((scene) => scene.type === type)).filter(Boolean);
}

function createVariation(project, variationKey) {
  const profile = variationProfiles[variationKey];
  if (!profile) return project;
  const next = structuredClone(project);
  next.id = uid("project");
  next.name = `${project.name} - ${titleCase(variationKey)}`;
  next.variation = variationKey;
  next.style = titleCase(variationKey);
  next.motionIntensity = profile.intensity;
  next.offer = variationKey === "aggressive" ? `${project.offer} • Ends tonight` : project.offer;
  next.cta = profile.cta[0];
  next.headline = `${profile.hookPrefix} ${project.productName}`;
  next.subheadline = `${titleCase(variationKey)} pacing tuned for ${project.goal.toLowerCase()}.`;
  next.brandKit = {
    ...next.brandKit,
    primary: profile.colorShift[0],
    secondary: profile.colorShift[1],
    accent: profile.colorShift[2]
  };
  next.hooks = next.hooks.map((hook, index) => ({
    ...hook,
    text: `${profile.hookPrefix} ${index === 0 ? project.productName : hook.text}`,
    pacing: profile.tone
  }));
  next.ctas = profile.cta.map((label, index) => ({
    id: uid("cta"),
    label,
    rationale: `Variation-specific ${profile.tone} CTA option ${index + 1}.`
  }));
  next.scenes = reorderByType(next.scenes, profile.order).map((scene, index) => {
    const updated = { ...scene };
    updated.duration = Number((scene.duration * profile.durationScale).toFixed(1));
    updated.motionIntensity = profile.intensity;
    updated.background = profile.colorShift[index % profile.colorShift.length];
    updated.animationType = ["flash", "zoom", "pulse", "rise", "fade"][index % 5];
    updated.headline = index === 0 ? next.headline : `${titleCase(profile.tone)} ${scene.headline}`;
    updated.cta = next.cta;
    updated.offer = next.offer;
    updated.subheadline = `${scene.subheadline} ${titleCase(profile.tone)} version.`;
    updated.elements = scene.elements.map((element) => {
      if (element.layerName === "Headline") return { ...element, text: updated.headline };
      if (element.layerName === "Subheadline") return { ...element, text: updated.subheadline };
      if (element.layerName === "Body") return { ...element, text: updated.body };
      if (element.layerName === "CTA") return { ...element, text: next.cta.toUpperCase(), fill: profile.colorShift[(index + 1) % profile.colorShift.length] };
      if (element.layerName === "Backdrop") return { ...element, fill: `${updated.background}22` };
      if (element.layerName === "Accent Orb") return { ...element, fill: profile.colorShift[(index + 2) % profile.colorShift.length] };
      return { ...element };
    });
    return updated;
  });
  next.recommendedNextAction = `Compare the ${titleCase(variationKey)} pacing against the original before export.`;
  next.updatedAt = new Date().toISOString();
  next.totalDuration = next.scenes.reduce((sum, scene) => sum + scene.duration, 0);
  return next;
}

function applySuggestion(project, action) {
  const next = structuredClone(project);
  const firstScene = next.scenes[0];
  const ctaScene = next.scenes.find((scene) => scene.type === "cta") || next.scenes[next.scenes.length - 1];
  if (action === "Improve Hook" && firstScene) {
    next.headline = `${project.productName} solves the scroll in 2 seconds.`;
    firstScene.headline = next.headline;
    firstScene.elements = firstScene.elements.map((element) => element.layerName === "Headline" ? { ...element, text: firstScene.headline } : element);
  }
  if (action === "Reduce Text") {
    next.scenes = next.scenes.map((scene) => {
      const shorterBody = scene.body.split(".")[0] + ".";
      return { ...scene, body: shorterBody, elements: scene.elements.map((element) => element.layerName === "Body" ? { ...element, text: shorterBody } : element) };
    });
  }
  if (action === "Strengthen CTA" && ctaScene) {
    next.cta = `Claim ${project.offer}`;
    ctaScene.cta = next.cta;
    ctaScene.elements = ctaScene.elements.map((element) => element.layerName === "CTA" ? { ...element, text: next.cta.toUpperCase() } : element);
  }
  if (action === "Add Urgency") {
    next.offer = `${project.offer} • Today only`;
    next.scenes = next.scenes.map((scene) => scene.type === "offer" ? { ...scene, headline: next.offer, elements: scene.elements.map((element) => element.layerName === "Headline" ? { ...element, text: next.offer } : element) } : scene);
  }
  if (action === "Increase Product Focus") {
    next.scenes.forEach((scene) => {
      if (!scene.elements.some((element) => element.layerName === "Product Focus")) {
        scene.elements.push(createShapeElement(scene.id, "Product Focus", "rect", `${next.brandKit.primary}33`, 0.58, 0.18, 0.24, 0.42, 0.94));
      }
    });
  }
  if (action === "Adjust Motion") {
    next.motionIntensity = Math.min(82, Math.max(58, next.motionIntensity));
    next.scenes = next.scenes.map((scene) => ({ ...scene, motionIntensity: next.motionIntensity, animationType: scene.type === "cta" ? "pulse" : "rise" }));
  }
  if (action === "Improve Platform Fit") {
    next.scenes = next.scenes.map((scene, index) => ({
      ...scene,
      duration: next.platform.toLowerCase().includes("banner") ? Math.min(2.2, scene.duration) : scene.duration,
      body: next.platform.toLowerCase().includes("banner") ? scene.body.split(".")[0] + "." : scene.body,
      elements: scene.elements.map((element) => element.layerName === "Body" && next.platform.toLowerCase().includes("banner") ? { ...element, text: scene.body.split(".")[0] + "." } : element)
    }));
  }
  if (action === "Balance Scenes") {
    next.scenes = next.scenes.map((scene, index) => ({ ...scene, duration: [2.2, 2.8, 2.4, 2.1, 1.8][index] || 2.3 }));
  }
  next.recommendedNextAction = `${action} applied. Review the updated preview before export.`;
  next.updatedAt = new Date().toISOString();
  return next;
}

function duplicateScene(scene) {
  const next = structuredClone(scene);
  next.id = uid("scene");
  next.name = `${scene.name} Copy`;
  next.elements = scene.elements.map((element) => ({ ...element, id: uid("el"), sceneId: next.id }));
  return next;
}

function addBlankScene(project) {
  const next = structuredClone(project);
  const recipe = industryRecipes[next.industry];
  const appended = createScene(next.scenes.length, "ending", recipe, {
    ...next,
    primary: next.brandKit.primary,
    secondary: next.brandKit.secondary,
    accent: next.brandKit.accent
  });
  appended.name = `Custom Scene ${next.scenes.length + 1}`;
  next.scenes.push(appended);
  next.updatedAt = new Date().toISOString();
  return next;
}

function addTextLayer(scene, text) {
  const nextScene = structuredClone(scene);
  nextScene.elements.push(createTextElement(scene.id, `Text ${scene.elements.length + 1}`, text, 0.14, 0.58, 0.42, 22, "#ffffff", "fade"));
  return nextScene;
}

function deleteScene(project, sceneId) {
  const next = structuredClone(project);
  if (next.scenes.length <= 1) return next;
  next.scenes = next.scenes.filter((scene) => scene.id !== sceneId);
  next.updatedAt = new Date().toISOString();
  return next;
}

function applySizePreset(project, presetKey) {
  const preset = sizePresets[presetKey];
  const next = structuredClone(project);
  next.sizePreset = presetKey;
  next.width = preset.width;
  next.height = preset.height;
  next.platform = preset.label;
  next.scenes = next.scenes.map((scene) => ({
    ...scene,
    elements: scene.elements.map((element) => {
      const clone = { ...element };
      if (presetKey === "banner") {
        clone.y = Math.min(clone.y * 0.64 + 0.04, 0.78);
        clone.width = Math.min(clone.width * 0.86, 0.72);
        clone.fontSize = clone.fontSize ? Math.max(18, Math.round(clone.fontSize * 0.86)) : clone.fontSize;
      } else if (presetKey === "square") {
        clone.x = Math.min(clone.x + 0.02, 0.7);
        clone.width = Math.min(clone.width + 0.05, 0.82);
      } else if (presetKey === "youtube" || presetKey === "hero") {
        clone.width = Math.min(clone.width * 0.84, 0.64);
        clone.y = Math.min(clone.y * 0.88, 0.78);
      }
      return clone;
    })
  }));
  next.updatedAt = new Date().toISOString();
  return next;
}

window.CorelyticGenerator = {
  generateCampaign,
  createVariation,
  applySuggestion,
  duplicateScene,
  addBlankScene,
  addTextLayer,
  deleteScene,
  applySizePreset
};
