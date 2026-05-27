const coreData = window.CorelyticData || {};
const coreStorage = window.CorelyticStorage || {};
const coreGenerator = window.CorelyticGenerator || {};
const coreAnalytics = window.CorelyticAnalytics || {};
const coreExporter = window.CorelyticExporter || {};
const coreRouter = window.CorelyticRouter || {};
const coreCanvas = window.CorelyticCanvas || {};
const coreFormatters = window.CorelyticFormatters || {};
const bootStatusNode = document.getElementById("saveStatus");
if (bootStatusNode) bootStatusNode.textContent = "Booting...";

const { industryRecipes, goals, platforms, styles, sizePresets, motionTemplates, assetLibrary, defaultThemes } = coreData;
const { loadState, saveState, resetState } = coreStorage;
const { generateCampaign, createVariation, applySuggestion, duplicateScene, addBlankScene, addTextLayer, applySizePreset, deleteScene } = coreGenerator;
const { scoreCampaign } = coreAnalytics;
const { exportProjectJson, exportStandaloneHtml, exportCampaignReport, exportPreviewPng } = coreExporter;
const { createRouter } = coreRouter;
const { createCanvasEditor } = coreCanvas;
const { formatSeconds, friendlyDate, titleize } = coreFormatters;
const gsap = window.gsap || {
  fromTo() {},
  to(target, options = {}) {
    if (typeof options.onComplete === "function") options.onComplete();
  },
  killTweensOf() {}
};

if (!industryRecipes || !loadState || !generateCampaign || !scoreCampaign || !exportProjectJson || !createRouter || !createCanvasEditor || !formatSeconds) {
  throw new Error("Core runtime dependency failed to load.");
}

const state = loadState();
const captureParams = new URLSearchParams(window.location.search);
const captureMode = captureParams.get("capture") === "1";
const app = {
  selectedSceneId: null,
  selectedElementId: null,
  analytics: scoreCampaign(null),
  router: "dashboard",
  previewTimer: null,
  previewIndex: 0,
  selectedTemplateId: motionTemplates[0]?.id || null,
  templateFilters: { industry: "all", platform: "all", style: "all" },
  inspectorTab: "text",
  showcaseIndex: 0,
  showcaseTimer: null,
  showcasePlaying: true
};

const $ = (id) => document.getElementById(id);
const els = {
  body: document.body,
  projectTitle: $("projectTitle"),
  saveStatus: $("saveStatus"),
  campaignBuilderForm: $("campaignBuilderForm"),
  generationPreview: $("generationPreview"),
  heroMetrics: $("heroMetrics"),
  dashboardGrid: $("dashboardGrid"),
  campaignList: $("campaignList"),
  templateGrid: $("templateGrid"),
  hookCards: $("hookCards"),
  ctaCards: $("ctaCards"),
  variationCards: $("variationCards"),
  exportGrid: $("exportGrid"),
  exportLog: $("exportLog"),
  assetGrid: $("assetGrid"),
  brandKitForm: $("brandKitForm"),
  brandThemeCards: $("brandThemeCards"),
  conversionScore: $("conversionScore"),
  scoreSummary: $("scoreSummary"),
  analyticsBreakdown: $("analyticsBreakdown"),
  suggestionActions: $("suggestionActions"),
  sceneTimelineList: $("sceneTimelineList"),
  layerTimelineList: $("layerTimelineList"),
  sizePresetPills: $("sizePresetPills"),
  motionIntensityInput: $("motionIntensityInput"),
  inspectorForm: $("inspectorForm"),
  stageMount: $("stageMount"),
  heroStageMount: $("heroStageMount"),
  heroStageLabel: $("heroStageLabel"),
  heroStageProgressBar: $("heroStageProgressBar"),
  heroStageSceneTabs: $("heroStageSceneTabs"),
  heroStagePlayBtn: $("heroStagePlayBtn"),
  heroStageNextBtn: $("heroStageNextBtn"),
  toastRegion: $("toastRegion"),
  importProjectInput: $("importProjectInput"),
  wizardModal: $("campaignWizardModal"),
  wizardForm: $("campaignWizardForm")
};

let canvas = null;

function ensureCanvas() {
  if (canvas) return canvas;
  if (!els.stageMount) return null;
  const hiddenTimeline = app.router !== "timeline" && els.stageMount.offsetParent === null;
  if (hiddenTimeline) return null;
  try {
    canvas = createCanvasEditor(els.stageMount, {
      onSelectElement(elementId) {
        app.selectedElementId = elementId;
        renderInspector();
        renderTimeline();
      },
      onUpdateElement(elementId, changes) {
        updateSelectedScene((scene) => ({
          ...scene,
          elements: scene.elements.map((element) => element.id === elementId ? { ...element, ...changes } : element)
        }));
      }
    });
  } catch (error) {
    console.error(error);
    els.saveStatus.textContent = "Preview unavailable";
    return null;
  }
  return canvas;
}

createRouter((route) => {
  const validRoute = document.querySelector(`.route-view[data-view="${route}"]`) ? route : "dashboard";
  if (validRoute !== route) location.hash = "dashboard";
  app.router = validRoute;
  document.querySelectorAll(".route-view").forEach((view) => view.classList.toggle("active", view.dataset.view === validRoute));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.route === validRoute));
  if (validRoute === "timeline") restartPreviewLoop();
  if (validRoute !== "timeline") clearInterval(app.previewTimer);
  renderHeroStage();
});

function activeProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || null;
}

function activeScene() {
  const project = activeProject();
  return project?.scenes.find((scene) => scene.id === app.selectedSceneId) || project?.scenes[0] || null;
}

function persist(message = "Saved locally") {
  const result = saveState(state);
  const suffix = result?.mode === "window.name" ? " • file mode" : result?.ok === false ? " • session only" : "";
  els.saveStatus.textContent = `${message}${suffix}`;
}

function clampDuration(value) {
  if (!Number.isFinite(value)) return 2.4;
  return Math.min(12, Math.max(0.8, Number(value)));
}

function setLoading(button, loading, text = "Working...") {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = text;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function toast(title, body, tone = "info") {
  const node = document.createElement("div");
  node.className = `toast toast-${tone}`;
  node.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
  els.toastRegion.appendChild(node);
  gsap.fromTo(node, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.26 });
  setTimeout(() => gsap.to(node, { opacity: 0, y: 10, duration: 0.22, onComplete: () => node.remove() }), 3200);
}

function patchProject(projectId, updater, message = "Saved locally") {
  state.projects = state.projects.map((project) => {
    if (project.id !== projectId) return project;
    const next = updater(structuredClone(project));
    next.updatedAt = new Date().toISOString();
    next.totalDuration = next.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
    return next;
  });
  persist(message);
  refreshApp();
}

function updateSelectedScene(updater) {
  const project = activeProject();
  const scene = activeScene();
  if (!project || !scene) return;
  patchProject(project.id, (draft) => ({
    ...draft,
    scenes: draft.scenes.map((item) => item.id === scene.id ? updater(structuredClone(item)) : item)
  }));
}

function buildField(name, label, type, value, options = []) {
  if (type === "select") {
    return `<div class="field"><label for="${name}">${label}</label><select id="${name}" name="${name}">${options.map((option) => `<option value="${option.value}" ${option.value === value ? "selected" : ""}>${option.label}</option>`).join("")}</select></div>`;
  }
  if (type === "textarea") {
    return `<div class="field"><label for="${name}">${label}</label><textarea id="${name}" name="${name}">${value || ""}</textarea></div>`;
  }
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${value ?? ""}"></div>`;
}

function populateWizardOptions() {
  $("wizardIndustry").innerHTML = Object.entries(industryRecipes).map(([value, recipe]) => `<option value="${value}">${recipe.label}</option>`).join("");
  $("wizardGoal").innerHTML = goals.map((value) => `<option value="${value}">${value}</option>`).join("");
  $("wizardPlatform").innerHTML = platforms.map((value) => `<option value="${value}">${value}</option>`).join("");
  $("wizardStyle").innerHTML = styles.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function openWizard(prefill = null) {
  const selectedIndustry = prefill?.industry || activeProject()?.industry || "restaurants";
  const recipe = industryRecipes[selectedIndustry];
  els.wizardModal.hidden = false;
  $("wizardIndustry").value = selectedIndustry;
  $("wizardGoal").value = prefill?.goal || activeProject()?.goal || goals[0];
  $("wizardPlatform").value = prefill?.platform || activeProject()?.platform || platforms[0];
  $("wizardStyle").value = prefill?.style || activeProject()?.style || styles[0];
  $("wizardProductName").value = prefill?.productName || activeProject()?.productName || "";
  $("wizardBrandName").value = prefill?.brandName || activeProject()?.brandKit?.brandName || "";
  $("wizardOffer").value = prefill?.offer || activeProject()?.offer || `Limited ${recipe.label.toLowerCase()} offer`;
  $("wizardCta").value = prefill?.cta || activeProject()?.cta || recipe.ctas[0];
  $("wizardMotionIntensity").value = String(prefill?.motionIntensity || activeProject()?.motionIntensity || 72);
  $("wizardPrimary").value = prefill?.primary || activeProject()?.brandKit?.primary || recipe.palette[0];
  $("wizardSecondary").value = prefill?.secondary || activeProject()?.brandKit?.secondary || recipe.palette[1];
  $("wizardAccent").value = prefill?.accent || activeProject()?.brandKit?.accent || recipe.palette[2];
  $("wizardAsset").value = "";
}

function closeWizard() {
  els.wizardModal.hidden = true;
}

function syncWizardColors() {
  const recipe = industryRecipes[$("wizardIndustry").value];
  $("wizardPrimary").value = recipe.palette[0];
  $("wizardSecondary").value = recipe.palette[1];
  $("wizardAccent").value = recipe.palette[2];
  if (!$("wizardCta").value) $("wizardCta").value = recipe.ctas[0];
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function motionGlyph(type) {
  return ({
    rise: "↑",
    zoom: "◎",
    pulse: "◉",
    flash: "✦",
    fade: "◌",
    float: "↕"
  })[type] || "•";
}

function stageVisualProfile(project, scene) {
  const industry = project?.industry || "general";
  const style = (project?.style || "").toLowerCase();
  const profile = {
    industry,
    industryKey: industry.replace(/\s+/g, "-"),
    styleKey: style.replace(/\s+/g, "-"),
    isRestaurant: false,
    isSaas: false,
    isLuxury: false,
    isEcommerce: false,
    atmosphere: "Cinematic motion composition",
    kicker: industryRecipes[industry]?.label || "Campaign",
    badge: scene?.type || "Scene",
    accentLabel: project?.offer || scene?.cta || "Launch now",
    detailLabel: project?.goal || "Conversion focus",
    surfaceLabel: project?.platform || "Desktop preview",
    overlayClass: "overlay-cinematic",
    sceneCountLabel: `${project?.scenes?.length || 0} scenes`,
    motionTone: "Cinematic sweep"
  };

  if (industry === "restaurants") {
    return {
      ...profile,
      isRestaurant: true,
      atmosphere: "Fresh menu hero with heat, texture, and appetite cues",
      badge: "Fresh drop",
      detailLabel: "Chef-fired offer",
      surfaceLabel: "Food promo stage",
      overlayClass: "overlay-restaurant",
      motionTone: "Steam spotlight"
    };
  }

  if (industry === "saas" || industry === "ai tools") {
    return {
      ...profile,
      isSaas: true,
      atmosphere: "Product-led interface story with dashboard depth",
      badge: "Live metrics",
      detailLabel: "Workflow spotlight",
      surfaceLabel: "Interface reveal",
      overlayClass: "overlay-saas",
      motionTone: "Metric sweep"
    };
  }

  if (style.includes("luxury") || industry === "hotels" || industry === "fashion") {
    return {
      ...profile,
      isLuxury: true,
      atmosphere: "Luxury reveal with editorial framing and glow",
      badge: "Premium reveal",
      detailLabel: "Refined pacing",
      surfaceLabel: "Editorial surface",
      overlayClass: "overlay-luxury",
      motionTone: "Gold fade reveal"
    };
  }

  if (industry === "ecommerce") {
    return {
      ...profile,
      isEcommerce: true,
      atmosphere: "Conversion-led product card motion with urgency cues",
      badge: "Flash drop",
      detailLabel: "Offer pulse",
      surfaceLabel: "Commerce stage",
      overlayClass: "overlay-commerce",
      motionTone: "Urgency lift"
    };
  }

  return profile;
}

function showcaseScene(project) {
  if (!project?.scenes?.length) return null;
  return project.scenes[app.showcaseIndex % project.scenes.length] || project.scenes[0];
}

function stopShowcaseAutoplay() {
  clearInterval(app.showcaseTimer);
  app.showcaseTimer = null;
}

function startShowcaseAutoplay() {
  stopShowcaseAutoplay();
  const project = activeProject();
  if (!project?.scenes?.length || !app.showcasePlaying) return;
  app.showcaseTimer = setInterval(() => {
    const liveProject = activeProject();
    if (!liveProject?.scenes?.length || !app.showcasePlaying) return;
    app.showcaseIndex = (app.showcaseIndex + 1) % liveProject.scenes.length;
    renderHeroStage();
  }, 2800);
}

function renderHeroMetrics() {
  const project = activeProject();
  const metrics = project ? [
    { label: "Platform", value: project.sizePreset.toUpperCase() },
    { label: "Scenes", value: project.scenes.length },
    { label: "Duration", value: `${project.totalDuration.toFixed(1)}s` },
    { label: "Score", value: `${app.analytics.total}/100` }
  ] : [
    { label: "Industries", value: Object.keys(industryRecipes).length },
    { label: "Templates", value: motionTemplates.length },
    { label: "Variations", value: 5 },
    { label: "Local Save", value: "On" }
  ];
  els.heroMetrics.innerHTML = metrics.map((item) => `<div class="metric-card compact"><strong>${item.value}</strong><span>${item.label}</span></div>`).join("");
}

function renderHeroStage() {
  const project = activeProject();
  if (!project?.scenes?.length) {
    els.heroStageLabel.textContent = "No scene loaded";
    els.heroStageProgressBar.style.width = "0%";
    els.heroStageMount.innerHTML = `<div class="hero-stage-empty"><strong>Motion preview will appear here.</strong><span>Create a campaign or use a template to animate the stage.</span></div>`;
    els.heroStageSceneTabs.innerHTML = "";
    els.heroStagePlayBtn.textContent = "Play";
    stopShowcaseAutoplay();
    return;
  }

  if (app.showcaseIndex >= project.scenes.length) app.showcaseIndex = 0;
  const scene = showcaseScene(project);
  const scenePercent = ((app.showcaseIndex + 1) / project.scenes.length) * 100;
  const imageLayer = scene.elements.find((element) => element.type === "image" && element.dataUrl) || (project.assetDataUrl ? { dataUrl: project.assetDataUrl } : null);
  const accent = project.brandKit.accent || "#7bf1a8";
  const primary = project.brandKit.primary || "#56f0c3";
  const secondary = project.brandKit.secondary || "#ff9157";
  const profile = stageVisualProfile(project, scene);
  const overlayTags = (project.motionRecipe?.overlays || []).slice(0, 3).map((item) => `<span class="tag">${item}</span>`).join("");
  const showcaseClass = [
    `industry-${profile.industryKey}`,
    `style-${profile.styleKey}`,
    `is-${scene.animationType}`,
    profile.isRestaurant ? "preset-restaurant" : "",
    profile.isSaas ? "preset-saas" : "",
    profile.isLuxury ? "preset-luxury" : "",
    profile.isEcommerce ? "preset-ecommerce" : ""
  ].filter(Boolean).join(" ");

  els.heroStageLabel.textContent = `${scene.name} • ${scene.animationType}`;
  els.heroStageProgressBar.style.width = `${scenePercent}%`;
  els.heroStagePlayBtn.textContent = app.showcasePlaying ? "Pause" : "Play";
  els.heroStageMount.innerHTML = `
    <div class="motion-showcase ${showcaseClass}" style="--stage-bg:${scene.background}; --brand-bg:${project.brandKit.background || "#08131f"}; --stage-accent:${accent}; --stage-primary:${primary}; --stage-secondary:${secondary};">
      <div class="motion-noise"></div>
      <div class="motion-vignette"></div>
      <div class="motion-stage-flash"></div>
      <div class="motion-energy-line"></div>
      <div class="motion-light-beam beam-a"></div>
      <div class="motion-light-beam beam-b"></div>
      <div class="motion-light-streak streak-a"></div>
      <div class="motion-light-streak streak-b"></div>
      <div class="motion-orb orb-a"></div>
      <div class="motion-orb orb-b"></div>
      <div class="motion-particle particle-a"></div>
      <div class="motion-particle particle-b"></div>
      <div class="motion-particle particle-c"></div>
      <div class="motion-grid"></div>
      <div class="motion-heat"></div>
      <div class="motion-sweep"></div>
      <div class="motion-offer-burst">${project.offer}</div>
      <div class="motion-composition ${profile.overlayClass}">
        <div class="composition-card card-back"></div>
        <div class="composition-card card-mid"></div>
        <div class="composition-card card-front"></div>
        <div class="composition-line line-a"></div>
        <div class="composition-line line-b"></div>
        <div class="composition-dot dot-a"></div>
        <div class="composition-dot dot-b"></div>
        <div class="composition-steam steam-a"></div>
        <div class="composition-steam steam-b"></div>
        <div class="composition-dashboard">
          <span class="dashboard-pill">${profile.badge}</span>
          <span class="dashboard-pill subtle">${profile.surfaceLabel}</span>
          <div class="dashboard-bars"><span></span><span></span><span></span></div>
        </div>
        <div class="metric-float metric-a"><strong>+24%</strong><span>CTR lift</span></div>
        <div class="metric-float metric-b"><strong>${profile.sceneCountLabel}</strong><span>${profile.motionTone}</span></div>
      </div>
      <div class="motion-copy">
        <span class="motion-kicker">${profile.kicker} • ${project.platform}</span>
        <h4 class="motion-headline">${scene.headline}</h4>
        <p class="motion-subheadline">${scene.subheadline || scene.body}</p>
        <div class="motion-atmosphere">${profile.atmosphere}</div>
        <div class="motion-bottom">
          <button class="motion-cta"><span>${scene.cta}</span><small>${profile.detailLabel}</small></button>
          <div class="tag-list">${overlayTags}</div>
        </div>
      </div>
      <div class="motion-visual">
        ${imageLayer?.dataUrl ? `<div class="motion-product-stack"><div class="product-shadow-card"></div><div class="product-aura-ring"></div><div class="motion-product-float"><img src="${imageLayer.dataUrl}" alt="Campaign asset"></div><div class="product-highlight-strip"></div></div>` : `<div class="motion-logo-stack"><div class="product-shadow-card"></div><div class="product-aura-ring"></div><div class="motion-logo-float">${project.brandKit.logoText || project.brandKit.brandName?.slice(0, 2) || "CM"}</div><div class="logo-caption">${profile.badge}</div></div>`}
      </div>
    </div>`;
  els.heroStageSceneTabs.innerHTML = project.scenes.map((item, index) => `
    <button class="scene-chip ${index === app.showcaseIndex ? "active" : ""}" data-showcase-scene="${index}">
      <span class="scene-chip-glyph">${motionGlyph(item.animationType)}</span>
      <span>${item.name}</span>
      <small>${formatSeconds(item.duration)}</small>
    </button>`).join("");
  startShowcaseAutoplay();
}

function renderDashboard() {
  const project = activeProject();
  const nextAction = project?.recommendedNextAction || "Open the wizard to generate your first campaign.";
  const metrics = project ? [
    { label: "Campaign", value: project.name, tone: "wide" },
    { label: "Platform", value: sizePresets[project.sizePreset].label },
    { label: "Scenes", value: project.scenes.length },
    { label: "Score", value: `${app.analytics.total}/100` },
    { label: "Next", value: nextAction, tone: "wide" }
  ] : [
    { label: "Campaign", value: "None yet", tone: "wide" },
    { label: "Platform", value: "Choose in wizard" },
    { label: "Scenes", value: "0" },
    { label: "Score", value: "0/100" },
    { label: "Next", value: nextAction, tone: "wide" }
  ];
  els.dashboardGrid.innerHTML = metrics.map((metric) => `<div class="metric-card compact ${metric.tone === "wide" ? "wide" : ""}"><strong>${metric.value}</strong><span>${metric.label}</span></div>`).join("");
  const summary = project ? `<article class="insight-card campaign-summary-card"><div class="section-heading slim"><div><p class="eyebrow">Campaign Summary</p><h3>${project.productName}</h3></div><span class="scene-type-badge">${project.style}</span></div><p class="muted-copy">${project.headline}</p><div class="tag-list"><span class="tag">${project.offer}</span><span class="tag">${project.cta}</span><span class="tag">${project.platform}</span></div><div class="summary-mini-grid"><div><small>Hook</small><strong>${project.scenes[0]?.headline || project.headline}</strong></div><div><small>Best Scene</small><strong>${showcaseScene(project)?.name || project.scenes[0]?.name}</strong></div></div></article>` : `<div class="empty-state">The dashboard will surface campaign summaries, performance, and next actions once your first campaign is created.</div>`;
  const list = state.projects.length ? state.projects.map((item) => `<article class="campaign-card"><div class="section-heading slim"><div><h4>${item.name}</h4><div class="campaign-meta"><span>${industryRecipes[item.industry].label}</span><span>${sizePresets[item.sizePreset].label}</span><span>${friendlyDate(item.updatedAt)}</span></div></div><button class="button button-ghost button-small" data-project-open="${item.id}">Open</button></div><p class="muted-copy">${item.productName} • ${item.offer}</p></article>`).join("") : "";
  els.campaignList.innerHTML = `${summary}${list}`;
}

function renderBuilderForm() {
  const project = activeProject();
  if (!project) {
    els.campaignBuilderForm.innerHTML = `<div class="empty-state">Create a campaign first. The builder will then let you edit headline, subheadline, CTA, offer, colors, and motion intensity.</div>`;
    return;
  }
  els.campaignBuilderForm.innerHTML = [
    buildField("builder-headline", "Headline", "textarea", project.headline),
    buildField("builder-subheadline", "Subheadline", "textarea", project.subheadline),
    buildField("builder-cta", "CTA", "text", project.cta),
    buildField("builder-offer", "Offer", "text", project.offer),
    buildField("builder-productName", "Product Name", "text", project.productName),
    buildField("builder-style", "Motion Style", "select", project.style, styles.map((value) => ({ value, label: value }))),
    buildField("builder-primary", "Primary Color", "color", project.brandKit.primary),
    buildField("builder-secondary", "Secondary Color", "color", project.brandKit.secondary),
    buildField("builder-accent", "Accent Color", "color", project.brandKit.accent),
    buildField("builder-motionIntensity", "Motion Intensity", "number", project.motionIntensity)
  ].join("");
}

function renderGenerationPreview() {
  const project = activeProject();
  if (!project) {
    els.generationPreview.innerHTML = `<div class="empty-state">The generated campaign scenes will appear here after you create a campaign.</div>`;
    return;
  }
  els.generationPreview.innerHTML = project.scenes.map((scene, index) => `<article class="preview-scene"><div class="timeline-meta"><span>Scene ${index + 1}</span><span>${scene.name}</span><span>${formatSeconds(scene.duration)}</span><span>${scene.animationType}</span></div><h4>${scene.headline}</h4><p class="muted-copy">${scene.subheadline}</p><p class="muted-copy">${scene.body}</p></article>`).join("");
}

function templateMiniPreview(template) {
  return `<div class="template-mini-stage theme-${template.style.toLowerCase().replace(/\s+/g, "-")}">
    <span class="mini-badge">${template.platform}</span>
    <div class="mini-headline">${template.hook}</div>
    <div class="mini-cta">${template.cta}</div>
    <div class="mini-orb one" style="background:${template.colors[0]}"></div>
    <div class="mini-orb two" style="background:${template.colors[2]}"></div>
  </div>`;
}

function renderTemplates() {
  const filters = app.templateFilters;
  const filtered = motionTemplates.filter((template) => (filters.industry === "all" || template.industry === filters.industry) && (filters.platform === "all" || template.platform === filters.platform) && (filters.style === "all" || template.style === filters.style));
  const selected = filtered.find((template) => template.id === app.selectedTemplateId) || filtered[0] || motionTemplates[0];
  if (selected) app.selectedTemplateId = selected.id;
  const filterBar = `
    <div class="insight-card">
      <div class="form-grid">
        ${buildField("template-filter-industry", "Industry", "select", filters.industry, [{ value: "all", label: "All Industries" }, ...Object.entries(industryRecipes).map(([value, recipe]) => ({ value, label: recipe.label }))])}
        ${buildField("template-filter-platform", "Platform", "select", filters.platform, [{ value: "all", label: "All Platforms" }, ...platforms.map((value) => ({ value, label: value }))])}
        ${buildField("template-filter-style", "Style", "select", filters.style, [{ value: "all", label: "All Styles" }, ...styles.map((value) => ({ value, label: value }))])}
      </div>
    </div>`;
  const detail = selected ? `<article class="insight-card"><div class="section-heading slim"><div><p class="eyebrow">Template Preview</p><h3>${selected.name}</h3></div><button class="button button-primary" data-use-template-id="${selected.id}">Use Template</button></div>${templateMiniPreview(selected)}<p class="muted-copy">${selected.hook}</p><div class="tag-list"><span class="tag">${industryRecipes[selected.industry].label}</span><span class="tag">${selected.platform}</span><span class="tag">${selected.style}</span><span class="tag">${selected.cta}</span><span class="tag">${selected.scenes.length} scenes</span></div><p class="muted-copy">${selected.motionRecipe}</p><p class="muted-copy">Scenes: ${selected.scenes.join(" • ")}</p></article>` : `<div class="empty-state">No templates match the current filters.</div>`;
  const cards = filtered.map((template) => `<article class="template-card ${template.id === app.selectedTemplateId ? "active" : ""}">${templateMiniPreview(template)}<div class="tag-list"><span class="tag">${industryRecipes[template.industry].label}</span><span class="tag">${template.style}</span><span class="tag">${template.scenes.length} scenes</span></div><h4>${template.name}</h4><p class="muted-copy">${template.goal} • ${template.platform}</p><p class="muted-copy">${template.hook}</p><div class="timeline-actions"><button class="button button-ghost button-small" data-preview-template-id="${template.id}">Preview Details</button><button class="button button-secondary button-small" data-use-template-id="${template.id}">Use Template</button></div></article>`).join("");
  els.templateGrid.innerHTML = `${filterBar}${detail}${cards || `<div class="empty-state">No template matches this filter combination yet.</div>`}`;
}

function renderHooksAndCtas() {
  const project = activeProject();
  els.hookCards.innerHTML = project ? project.hooks.map((hook) => `<article class="hook-card"><div class="tag-list"><span class="tag">${hook.pacing}</span><span class="tag">${hook.attentionPattern}</span></div><h4>${hook.text}</h4><button class="button button-secondary" data-apply-hook="${hook.id}">Apply Hook</button></article>`).join("") : `<div class="empty-state">Generate a campaign to unlock real hook suggestions.</div>`;
  els.ctaCards.innerHTML = project ? project.ctas.map((cta) => `<article class="cta-card"><h4>${cta.label}</h4><p class="muted-copy">${cta.rationale}</p><button class="button button-secondary" data-apply-cta="${cta.id}">Use CTA</button></article>`).join("") : `<div class="empty-state">Generate a campaign to unlock CTA suggestions.</div>`;
}

function renderVariations() {
  const project = activeProject();
  const labels = ["aggressive", "luxury", "emotional", "minimal", "high-energy"];
  els.variationCards.innerHTML = labels.map((label) => `<article class="variation-card"><div class="tag-list"><span class="tag">${titleize(label)}</span><span class="tag">${project ? "Ready" : "Needs campaign"}</span></div><h4>${titleize(label)} Variation</h4><p class="muted-copy">Changes hook, CTA, colors, pacing, and scene order to fit a different campaign angle.</p><button class="button button-secondary" ${project ? "" : "disabled"} data-create-variation="${label}">Generate Variation</button></article>`).join("");
}

function renderExports() {
  const cards = [
    { id: "html", title: "Export HTML", copy: "Download a standalone animated ad page." },
    { id: "json", title: "Export JSON Backup", copy: "Save the full project for restore or transfer." },
    { id: "report", title: "Export Campaign Report", copy: "Download a readable performance and scene report." },
    { id: "png", title: "Download Frame Preview as PNG", copy: "Capture the current preview as an image file." }
  ];
  els.exportGrid.innerHTML = cards.map((card) => `<article class="export-card"><h4>${card.title}</h4><p class="muted-copy">${card.copy}</p><button class="button button-primary" data-export="${card.id}">Run Export</button></article>`).join("");
}

function renderAssets() {
  els.assetGrid.innerHTML = assetLibrary.map((asset) => `<article class="asset-card"><div class="tag-list"><span class="tag">${asset.type}</span></div><h4>${asset.label}</h4><p class="muted-copy">Add this asset treatment into the selected scene.</p><button class="button button-secondary" data-add-asset="${asset.id}">Add to Scene</button></article>`).join("");
}

function renderBrandKit() {
  const project = activeProject();
  if (!project) {
    els.brandKitForm.innerHTML = `<div class="empty-state">Create a campaign to edit and save brand colors and theme presets.</div>`;
  } else {
    els.brandKitForm.innerHTML = [
      buildField("brandKit-brandName", "Brand Name", "text", project.brandKit.brandName),
      buildField("brandKit-logoText", "Logo Text", "text", project.brandKit.logoText),
      buildField("brandKit-primary", "Primary", "color", project.brandKit.primary),
      buildField("brandKit-secondary", "Secondary", "color", project.brandKit.secondary),
      buildField("brandKit-accent", "Accent", "color", project.brandKit.accent),
      buildField("brandKit-background", "Background", "color", project.brandKit.background),
      buildField("brandKit-fontFamily", "Font Family", "text", project.brandKit.fontFamily)
    ].join("");
  }
  els.brandThemeCards.innerHTML = defaultThemes.map((theme) => `<article class="theme-card"><div class="tag-list"><span class="tag" style="background:${theme.primary}; color:#04111b;">${theme.primary}</span><span class="tag">${theme.fontFamily}</span></div><h4>${theme.name}</h4><button class="button button-secondary" data-apply-theme="${theme.id}">Apply Theme</button></article>`).join("");
}

function renderAnalytics() {
  const result = app.analytics;
  els.conversionScore.textContent = result.total;
  document.querySelector(".score-ring").style.setProperty("--score", String(result.total));
  els.scoreSummary.textContent = result.summary;
  els.analyticsBreakdown.innerHTML = result.metrics.length ? result.metrics.map((metric) => `<article class="insight-card"><div class="metric-row"><span>${metric.label}</span><div class="progress-track"><div class="progress-fill" style="width:${metric.value}%"></div></div><strong>${metric.value}</strong></div><p class="muted-copy">${metric.reason}</p><button class="button button-secondary button-small" data-suggestion="${metric.action}">${metric.action}</button></article>`).join("") : `<div class="empty-state">No analytics yet.</div>`;
  els.suggestionActions.innerHTML = result.suggestions.length ? result.suggestions.map((suggestion) => `<button class="button button-ghost" data-suggestion="${suggestion}">${suggestion}</button>`).join("") : `<div class="empty-state">Smart suggestions will appear after a campaign is created.</div>`;
}

function renderTimeline() {
  const project = activeProject();
  const scene = activeScene();
  if (!project || !scene) {
    els.sceneTimelineList.innerHTML = `<div class="empty-state">Generate a campaign to unlock the timeline.</div>`;
    els.layerTimelineList.innerHTML = `<div class="empty-state">Select a campaign to inspect layers.</div>`;
    els.sizePresetPills.innerHTML = "";
    return;
  }

  els.motionIntensityInput.value = String(project.motionIntensity);
  els.sizePresetPills.innerHTML = Object.entries(sizePresets).map(([key, preset]) => `<button class="size-pill ${project.sizePreset === key ? "active" : ""}" data-size-preset="${key}">${preset.label}</button>`).join("");
  const totalDuration = Math.max(project.totalDuration || 1, 1);
  els.sceneTimelineList.innerHTML = project.scenes.map((item, index) => `<article class="timeline-card sequencer-card ${item.id === scene.id ? "active" : ""}"><div class="timeline-card-head"><div class="reorder-handle" aria-hidden="true">⋮⋮</div><div class="timeline-focus"><small>Scene ${index + 1}</small><div class="timeline-chip-row"><span class="scene-chip-glyph">${motionGlyph(item.animationType)}</span><h4>${item.name}</h4></div><div class="timeline-meta"><span class="scene-type-badge">${item.type}</span><span>${formatSeconds(item.duration)}</span><span>${item.animationType}</span></div></div><button class="button button-ghost button-small" data-select-scene="${item.id}">Edit</button></div><div class="timeline-rail"><span class="trim-handle" aria-hidden="true"></span><div class="duration-track"><span style="width:${Math.max(14, (item.duration / totalDuration) * 100)}%"></span></div><span class="trim-handle" aria-hidden="true"></span></div><div class="form-grid compact"><div class="field"><label>Duration</label><input type="number" min="0.8" max="12" step="0.1" value="${item.duration}" data-scene-duration="${item.id}"></div><div class="field"><label>Animation</label><select data-scene-animation="${item.id}"><option value="rise" ${item.animationType === "rise" ? "selected" : ""}>Rise</option><option value="zoom" ${item.animationType === "zoom" ? "selected" : ""}>Zoom</option><option value="pulse" ${item.animationType === "pulse" ? "selected" : ""}>Pulse</option><option value="flash" ${item.animationType === "flash" ? "selected" : ""}>Flash</option><option value="fade" ${item.animationType === "fade" ? "selected" : ""}>Fade</option></select></div></div><div class="timeline-actions"><button class="button button-ghost button-small" data-duplicate-scene="${item.id}">Duplicate</button><button class="button button-ghost button-small" data-delete-scene="${item.id}" ${project.scenes.length === 1 ? "disabled" : ""}>Delete</button><button class="button button-ghost button-small" data-scene-up="${item.id}" ${index === 0 ? "disabled" : ""}>Up</button><button class="button button-ghost button-small" data-scene-down="${item.id}" ${index === project.scenes.length - 1 ? "disabled" : ""}>Down</button></div></article>`).join("");
  els.layerTimelineList.innerHTML = scene.elements.map((element) => `<article class="layer-card ${element.id === app.selectedElementId ? "active" : ""}"><div class="subsection-head"><div><h4>${element.layerName}</h4><div class="timeline-meta"><span>${element.type}</span><span>${element.animation || element.shapeKind || "static"}</span></div></div><button class="button button-ghost button-small" data-select-element="${element.id}">Edit</button></div><div class="timeline-meta"><span>X ${Math.round(element.x * 100)}%</span><span>Y ${Math.round(element.y * 100)}%</span><span>W ${Math.round(element.width * 100)}%</span></div></article>`).join("");
}

function renderInspector() {
  const scene = activeScene();
  if (!scene) {
    els.inspectorForm.innerHTML = `<div class="empty-state">Select a scene or layer to edit details here.</div>`;
    return;
  }
  const selectedElement = scene.elements.find((element) => element.id === app.selectedElementId);
  const tabs = ["text", "motion", "colors", "cta", "timing"];
  const tabButtons = `<div class="inspector-tabs">${tabs.map((tab) => `<button type="button" class="inspector-tab ${app.inspectorTab === tab ? "active" : ""}" data-inspector-tab="${tab}">${titleize(tab)}</button>`).join("")}</div>`;
  if (selectedElement) {
    const groups = {
      text: [
        buildField("element-layerName", "Layer Name", "text", selectedElement.layerName),
        selectedElement.type === "text" ? buildField("element-text", "Text", "textarea", selectedElement.text) : `<div class="insight-card"><p class="muted-copy">Uploaded image and shape layers can be positioned and resized visually on the stage.</p></div>`,
        selectedElement.type === "text" ? buildField("element-fontSize", "Font Size", "number", selectedElement.fontSize || 24) : ""
      ],
      motion: [
        buildField("element-x", "X (0-1)", "number", selectedElement.x),
        buildField("element-y", "Y (0-1)", "number", selectedElement.y),
        buildField("element-width", "Width (0-1)", "number", selectedElement.width),
        selectedElement.type === "text" ? "" : buildField("element-height", "Height (0-1)", "number", selectedElement.height || 0.18)
      ],
      colors: [selectedElement.fill ? buildField("element-fill", "Fill", "color", selectedElement.fill) : `<div class="empty-state">This layer relies on the uploaded image colors instead of a fill value.</div>`],
      cta: [`<div class="empty-state">CTA settings are applied on the scene level for clearer ad sequencing.</div>`],
      timing: [`<div class="insight-card"><p class="muted-copy">Motion type is inherited from the scene timeline. Use the sequencer to change timing and pacing for this layer.</p></div>`]
    };
    els.inspectorForm.innerHTML = `${tabButtons}<div class="inspector-pane">${groups[app.inspectorTab].join("")}</div>`;
  } else {
    const groups = {
      text: [
        buildField("scene-name", "Scene Name", "text", scene.name),
        buildField("scene-headline", "Headline", "textarea", scene.headline),
        buildField("scene-subheadline", "Subheadline", "textarea", scene.subheadline || ""),
        buildField("scene-body", "Body", "textarea", scene.body)
      ],
      motion: [
        buildField("scene-transition", "Transition", "text", scene.transition),
        `<div class="insight-card"><p class="muted-copy">Scene animation style is edited in the timeline card so pacing stays visible while sequencing.</p></div>`
      ],
      colors: [buildField("scene-background", "Background", "color", scene.background)],
      cta: [
        buildField("scene-cta", "CTA", "text", scene.cta),
        buildField("scene-offer", "Offer", "text", scene.offer || "")
      ],
      timing: [buildField("scene-duration", "Duration", "number", scene.duration)]
    };
    els.inspectorForm.innerHTML = `${tabButtons}<div class="inspector-pane">${groups[app.inspectorTab].join("")}</div>`;
  }
}

function renderStage() {
  const project = activeProject();
  const scene = activeScene();
  const editor = ensureCanvas();
  if (!project || !scene || !editor) return;
  editor.render(project, scene, app.selectedElementId);
}

function refreshAnalytics() {
  app.analytics = scoreCampaign(activeProject());
}

function restartPreviewLoop() {
  clearInterval(app.previewTimer);
  const project = activeProject();
  const editor = ensureCanvas();
  if (!project || !editor) return;
  renderStage();
  editor.playScene(activeScene());
  app.previewIndex = Math.max(0, project.scenes.findIndex((scene) => scene.id === app.selectedSceneId));
  app.previewTimer = setInterval(() => {
    const liveProject = activeProject();
    if (!liveProject || app.router !== "timeline") return;
    app.previewIndex = (app.previewIndex + 1) % liveProject.scenes.length;
    app.selectedSceneId = liveProject.scenes[app.previewIndex].id;
    app.selectedElementId = null;
    renderTimeline();
    renderInspector();
    renderStage();
    editor.playScene(activeScene());
  }, 2200);
}

function refreshApp() {
  const project = activeProject();
  if (project && !app.selectedSceneId) app.selectedSceneId = project.scenes[0]?.id || null;
  if (project && !project.scenes.some((scene) => scene.id === app.selectedSceneId)) app.selectedSceneId = project.scenes[0]?.id || null;
  if (project && app.showcaseIndex >= project.scenes.length) app.showcaseIndex = 0;
  if (!project) {
    app.selectedSceneId = null;
    app.selectedElementId = null;
    clearInterval(app.previewTimer);
    stopShowcaseAutoplay();
  }
  refreshAnalytics();
  els.projectTitle.textContent = project?.name || "No campaign selected";
  renderHeroMetrics();
  renderHeroStage();
  renderDashboard();
  renderBuilderForm();
  renderGenerationPreview();
  renderTemplates();
  renderHooksAndCtas();
  renderVariations();
  renderExports();
  renderAssets();
  renderBrandKit();
  renderAnalytics();
  renderTimeline();
  renderInspector();
  renderStage();
  if (app.router === "timeline" && project) restartPreviewLoop();
}

function openProject(projectId) {
  state.activeProjectId = projectId;
  app.selectedSceneId = activeProject()?.scenes[0]?.id || null;
  app.selectedElementId = null;
  persist("Project opened");
  refreshApp();
}

function reorderScenes(direction, sceneId) {
  const project = activeProject();
  if (!project) return;
  patchProject(project.id, (draft) => {
    const index = draft.scenes.findIndex((scene) => scene.id === sceneId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= draft.scenes.length) return draft;
    [draft.scenes[index], draft.scenes[target]] = [draft.scenes[target], draft.scenes[index]];
    return draft;
  }, "Scene order updated");
}

function buildProjectFromTemplate(template) {
  const project = generateCampaign({
    industry: template.industry,
    goal: template.goal,
    platform: template.platform,
    style: template.style,
    productName: template.name,
    offer: template.scenes[2] || "Limited offer",
    cta: template.cta,
    motionIntensity: template.style === "High-Energy" ? 88 : template.style === "Luxury" ? 48 : 72
  }, {
    brandName: titleize(template.industry),
    primary: template.colors[0],
    secondary: template.colors[1],
    accent: template.colors[2],
    background: "#08131f",
    fontFamily: "Manrope",
    logoText: titleize(template.industry).slice(0, 2).toUpperCase()
  });
  project.name = template.name;
  project.headline = template.hook;
  project.cta = template.cta;
  project.motionRecipe = {
    summary: template.motionRecipe,
    transitions: template.motionRecipe.split(",").map((item) => item.trim()),
    overlays: [template.style, template.platform],
    structure: template.scenes
  };
  project.brandKit.primary = template.colors[0];
  project.brandKit.secondary = template.colors[1];
  project.brandKit.accent = template.colors[2];
  project.scenes = project.scenes.map((scene, index) => {
    const next = { ...scene };
    next.name = template.scenes[index] || scene.name;
    if (index === 0) next.headline = template.hook;
    if (scene.type === "cta" || scene.type === "ending") next.cta = template.cta;
    next.elements = scene.elements.map((element) => {
      if (element.layerName === "Headline") return { ...element, text: next.headline, animation: next.animationType };
      if (element.layerName === "CTA") return { ...element, text: next.cta.toUpperCase(), fill: template.colors[2] };
      return element;
    });
    return next;
  });
  project.recommendedNextAction = "Template loaded. Review the hook and offer, then export or generate variations.";
  return project;
}

function applyAsset(assetId) {
  const asset = assetLibrary.find((item) => item.id === assetId);
  if (!asset || !activeScene()) return;
  updateSelectedScene((draft) => {
    if (asset.type === "background") {
      draft.background = asset.fill;
      return draft;
    }
    draft.elements.push({
      id: `asset-${Date.now()}`,
      sceneId: draft.id,
      layerName: asset.label,
      type: asset.type === "shape" ? "shape" : "text",
      shapeKind: asset.type === "shape" ? "circle" : undefined,
      text: asset.text || asset.label,
      x: 0.6,
      y: 0.66,
      width: asset.type === "shape" ? 0.14 : 0.22,
      height: asset.type === "shape" ? 0.14 : 0.1,
      rotation: 0,
      fill: asset.fill,
      fontSize: 18,
      animation: "pulse"
    });
    return draft;
  });
  toast("Asset Added", `${asset.label} was added to the active scene.`);
}

function applyBuilderForm() {
  const project = activeProject();
  if (!project) return;
  const fd = new FormData(els.campaignBuilderForm);
  patchProject(project.id, (draft) => {
    draft.headline = String(fd.get("builder-headline") || draft.headline);
    draft.subheadline = String(fd.get("builder-subheadline") || draft.subheadline);
    draft.cta = String(fd.get("builder-cta") || draft.cta);
    draft.offer = String(fd.get("builder-offer") || draft.offer);
    draft.productName = String(fd.get("builder-productName") || draft.productName);
    draft.style = String(fd.get("builder-style") || draft.style);
    draft.motionIntensity = Math.min(100, Math.max(20, Number(fd.get("builder-motionIntensity") || draft.motionIntensity)));
    draft.brandKit.primary = String(fd.get("builder-primary") || draft.brandKit.primary);
    draft.brandKit.secondary = String(fd.get("builder-secondary") || draft.brandKit.secondary);
    draft.brandKit.accent = String(fd.get("builder-accent") || draft.brandKit.accent);
    draft.recommendedNextAction = "Review preview timing and export the winning variation.";
    draft.scenes = draft.scenes.map((scene, index) => {
      const nextScene = { ...scene, motionIntensity: draft.motionIntensity };
      if (index === 0) {
        nextScene.headline = draft.headline;
        nextScene.subheadline = draft.subheadline;
      }
      if (scene.type === "offer") nextScene.headline = draft.offer;
      if (scene.type === "cta" || scene.type === "ending") nextScene.cta = draft.cta;
      nextScene.elements = scene.elements.map((element) => {
        if (element.layerName === "Headline") return { ...element, text: nextScene.headline };
        if (element.layerName === "Subheadline") return { ...element, text: nextScene.subheadline };
        if (element.layerName === "CTA") return { ...element, text: nextScene.cta.toUpperCase(), fill: draft.brandKit.accent };
        if (element.layerName === "Backdrop") return { ...element, fill: `${nextScene.background}22` };
        return element;
      });
      return nextScene;
    });
    return draft;
  }, "Campaign builder updated");
}

function saveBrandKit() {
  const project = activeProject();
  if (!project) {
    toast("Brand Kit Unavailable", "Create a campaign before saving brand settings.", "error");
    return;
  }
  const fd = new FormData(els.brandKitForm);
  patchProject(project.id, (draft) => {
    draft.brandKit = {
      ...draft.brandKit,
      brandName: String(fd.get("brandKit-brandName") || draft.brandKit.brandName),
      logoText: String(fd.get("brandKit-logoText") || draft.brandKit.logoText),
      primary: String(fd.get("brandKit-primary") || draft.brandKit.primary),
      secondary: String(fd.get("brandKit-secondary") || draft.brandKit.secondary),
      accent: String(fd.get("brandKit-accent") || draft.brandKit.accent),
      background: String(fd.get("brandKit-background") || draft.brandKit.background),
      fontFamily: String(fd.get("brandKit-fontFamily") || draft.brandKit.fontFamily)
    };
    return draft;
  }, "Brand kit saved");
}

function applyTheme(themeId) {
  const theme = defaultThemes.find((item) => item.id === themeId);
  const project = activeProject();
  if (!theme || !project) {
    toast("Theme Apply Blocked", "Create a campaign before applying a brand theme.", "error");
    return;
  }
  patchProject(project.id, (draft) => {
    draft.brandKit.primary = theme.primary;
    draft.brandKit.secondary = theme.secondary;
    draft.brandKit.accent = theme.accent;
    draft.brandKit.background = theme.background;
    draft.brandKit.fontFamily = theme.fontFamily;
    return draft;
  }, `${theme.name} theme applied`);
}

function applyHook(hookId) {
  const project = activeProject();
  const hook = project?.hooks.find((item) => item.id === hookId);
  if (!project || !hook) {
    toast("Hook Apply Blocked", "Generate a campaign before applying hooks.", "error");
    return;
  }
  patchProject(project.id, (draft) => {
    draft.headline = hook.text;
    draft.scenes[0].headline = hook.text;
    draft.scenes[0].elements = draft.scenes[0].elements.map((element) => element.layerName === "Headline" ? { ...element, text: hook.text } : element);
    return draft;
  }, "Hook applied");
}

function applyCta(ctaId = null) {
  const project = activeProject();
  if (!project) {
    toast("CTA Apply Blocked", "Generate a campaign before applying CTA suggestions.", "error");
    return;
  }
  const cta = ctaId ? project.ctas.find((item) => item.id === ctaId) : project.ctas[0];
  if (!cta) return;
  patchProject(project.id, (draft) => {
    draft.cta = cta.label;
    draft.scenes = draft.scenes.map((scene) => ({
      ...scene,
      cta: scene.type === "offer" ? scene.cta : cta.label,
      elements: scene.elements.map((element) => element.layerName === "CTA" ? { ...element, text: cta.label.toUpperCase(), fill: draft.brandKit.accent } : element)
    }));
    return draft;
  }, "CTA updated");
}

function exportAction(kind) {
  const project = activeProject();
  if (!project) {
    toast("No Campaign", "Create a campaign before exporting.");
    return;
  }
  let message = "";
  const originalSceneId = app.selectedSceneId;
  if (kind === "html") message = exportStandaloneHtml(project);
  if (kind === "json") message = exportProjectJson(project);
  if (kind === "report") message = exportCampaignReport(project, app.analytics);
  if (kind === "png") {
    const editor = ensureCanvas();
    if (!editor) {
      toast("Preview Unavailable", "Open the timeline once before exporting a frame preview.", "error");
      return;
    }
    message = exportPreviewPng(project, (scene) => {
      app.selectedSceneId = scene.id;
      editor.render(project, scene, null);
      editor.playScene(scene);
    }, editor.stage);
    app.selectedSceneId = originalSceneId;
    renderStage();
  }
  state.lastExport = { kind, at: new Date().toISOString() };
  persist("Export completed");
  els.exportLog.innerHTML = `<div class="metric-card"><strong>${titleize(kind)}</strong><span>${message}</span><span>${friendlyDate(state.lastExport.at)}</span></div>`;
  toast("Export Ready", message);
}

function loadDemoProject() {
  const demo = generateCampaign({
    industry: "restaurants",
    goal: "Drive Sales",
    platform: "Instagram Reel",
    style: "High-Energy",
    productName: "Double Stack Combo",
    offer: "25% off today only",
    cta: "Order now",
    motionIntensity: 78
  }, {
    brandName: "Corelytic Bites",
    logoText: "CB",
    primary: "#ff6b2c",
    secondary: "#ffd166",
    accent: "#7bf1a8",
    background: "#08131f",
    fontFamily: "Manrope"
  });
  state.projects.unshift(demo);
  state.activeProjectId = demo.id;
  app.selectedSceneId = demo.scenes[0].id;
  app.selectedElementId = null;
  persist("Demo restored");
  refreshApp();
}

function buildCaptureProject() {
  const templateId = captureParams.get("template");
  if (templateId) {
    const template = motionTemplates.find((item) => item.id === templateId);
    if (template) return buildProjectFromTemplate(template);
  }
  const industry = captureParams.get("industry") || "restaurants";
  const style = captureParams.get("style") || (industry === "saas" ? "Conversion Heavy" : industry === "fashion" ? "Luxury" : "High-Energy");
  const goal = captureParams.get("goal") || (industry === "saas" ? "Grow Leads" : "Drive Sales");
  const platform = captureParams.get("platform") || (industry === "saas" ? "Website Hero" : "Instagram Reel");
  const recipe = industryRecipes[industry] || industryRecipes.restaurants;
  return generateCampaign({
    industry,
    goal,
    platform,
    style,
    productName: captureParams.get("product") || `${recipe.label} Feature`,
    offer: captureParams.get("offer") || `Limited ${recipe.label.toLowerCase()} offer`,
    cta: captureParams.get("cta") || recipe.ctas[0],
    motionIntensity: Number(captureParams.get("intensity") || (style === "Luxury" ? 48 : 78))
  }, {
    brandName: captureParams.get("brand") || `${titleize(industry)} Studio`,
    logoText: (captureParams.get("logo") || recipe.label).slice(0, 2).toUpperCase(),
    primary: recipe.palette[0],
    secondary: recipe.palette[1],
    accent: recipe.palette[2],
    background: "#08131f",
    fontFamily: style === "Luxury" ? "Space Grotesk" : "Manrope"
  });
}

function applyCaptureMode() {
  if (!captureMode) return false;
  const project = buildCaptureProject();
  state.projects = [project];
  state.activeProjectId = project.id;
  app.selectedSceneId = project.scenes[0]?.id || null;
  app.selectedElementId = null;
  app.showcaseIndex = Math.max(0, Number(captureParams.get("scene") || 0));
  app.showcasePlaying = captureParams.get("play") !== "0";
  const templateId = captureParams.get("template");
  if (templateId) app.selectedTemplateId = templateId;
  const route = captureParams.get("route");
  if (route) location.hash = route;
  if (els.saveStatus) els.saveStatus.textContent = captureParams.get("status") || "Saved locally";
  els.body.classList.add("capture-mode");
  if (route) els.body.classList.add(`capture-route-${route}`);
  return true;
}

function handleInspectorChange() {
  const scene = activeScene();
  if (!scene) return;
  const fd = new FormData(els.inspectorForm);
  if (app.selectedElementId) {
    updateSelectedScene((draft) => ({
      ...draft,
      elements: draft.elements.map((element) => {
        if (element.id !== app.selectedElementId) return element;
        return {
          ...element,
          layerName: String(fd.get("element-layerName") || element.layerName),
          text: element.type === "text" ? String(fd.get("element-text") || element.text) : element.text,
          fill: element.fill ? String(fd.get("element-fill") || element.fill) : element.fill,
          x: Number(fd.get("element-x") || element.x),
          y: Number(fd.get("element-y") || element.y),
          width: Number(fd.get("element-width") || element.width),
          height: element.type === "text" ? element.height : Number(fd.get("element-height") || element.height),
          fontSize: element.type === "text" ? Number(fd.get("element-fontSize") || element.fontSize) : element.fontSize
        };
      })
    }));
  } else {
    updateSelectedScene((draft) => {
      draft.name = String(fd.get("scene-name") || draft.name);
      draft.headline = String(fd.get("scene-headline") || draft.headline);
      draft.subheadline = String(fd.get("scene-subheadline") || draft.subheadline);
      draft.body = String(fd.get("scene-body") || draft.body);
      draft.cta = String(fd.get("scene-cta") || draft.cta);
      draft.offer = String(fd.get("scene-offer") || draft.offer);
      draft.transition = String(fd.get("scene-transition") || draft.transition);
      draft.duration = clampDuration(Number(fd.get("scene-duration") || draft.duration));
      draft.background = String(fd.get("scene-background") || draft.background);
      draft.elements = draft.elements.map((element) => {
        if (element.layerName === "Headline") return { ...element, text: draft.headline };
        if (element.layerName === "Subheadline") return { ...element, text: draft.subheadline };
        if (element.layerName === "Body") return { ...element, text: draft.body };
        if (element.layerName === "CTA") return { ...element, text: draft.cta.toUpperCase() };
        if (element.layerName === "Backdrop") return { ...element, fill: `${draft.background}22` };
        return element;
      });
      return draft;
    });
  }
}

async function handleWizardSubmit(event) {
  event.preventDefault();
  const fd = new FormData(els.wizardForm);
  const assetFile = $("wizardAsset").files?.[0] || null;
  const submitButton = event.submitter;
  if (assetFile && !assetFile.type.startsWith("image/")) {
    toast("Upload Error", "Please upload an image file for the optional asset.", "error");
    return;
  }
  if (assetFile && assetFile.size > 5 * 1024 * 1024) {
    toast("Upload Error", "Image uploads must be under 5MB.", "error");
    return;
  }
  setLoading(submitButton, true, "Creating...");
  try {
    const assetDataUrl = await readFileAsDataUrl(assetFile);
    const project = generateCampaign({
      industry: String(fd.get("industry")),
      goal: String(fd.get("goal")),
      platform: String(fd.get("platform")),
      style: String(fd.get("style")),
      productName: String(fd.get("productName") || industryRecipes[String(fd.get("industry"))].label),
      offer: String(fd.get("offer") || "Limited-time offer"),
      cta: String(fd.get("cta") || industryRecipes[String(fd.get("industry"))].ctas[0]),
      motionIntensity: Number(fd.get("motionIntensity") || 72),
      assetDataUrl
    }, {
      brandName: String(fd.get("brandName") || industryRecipes[String(fd.get("industry"))].label),
      primary: String(fd.get("primary")),
      secondary: String(fd.get("secondary")),
      accent: String(fd.get("accent")),
      background: "#08131f",
      fontFamily: "Manrope",
      logoText: String(fd.get("brandName") || industryRecipes[String(fd.get("industry"))].label).slice(0, 2).toUpperCase()
    });
    state.projects.unshift(project);
    state.activeProjectId = project.id;
    app.selectedSceneId = project.scenes[0].id;
    app.selectedElementId = null;
    persist("Campaign created");
    closeWizard();
    refreshApp();
    location.hash = "dashboard";
    toast("Campaign Generated", `${project.name} is live and saved locally.`, "success");
  } catch (error) {
    console.error(error);
    toast("Campaign Error", "Something went wrong while creating the campaign.", "error");
  } finally {
    setLoading(submitButton, false);
  }
}

els.campaignBuilderForm.addEventListener("change", applyBuilderForm);
els.campaignBuilderForm.addEventListener("input", (event) => {
  if (event.target.tagName !== "TEXTAREA") applyBuilderForm();
});

$("newCampaignBtn").addEventListener("click", () => openWizard());
$("generateCampaignBtn").addEventListener("click", () => openWizard());
$("closeWizardBtn").addEventListener("click", closeWizard);
$("backupProjectBtn").addEventListener("click", () => exportAction("json"));
$("downloadBackupBtn").addEventListener("click", () => exportAction("json"));
$("refreshHooksBtn").addEventListener("click", (event) => {
  setLoading(event.currentTarget, true, "Analyzing...");
  setTimeout(() => {
    refreshApp();
    setLoading(event.currentTarget, false);
    toast("Hooks Refreshed", "Hook suggestions were regenerated for the active campaign.", "success");
  }, 500);
});
$("applyCtaBtn").addEventListener("click", () => applyCta());
$("themeToggleBtn").addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  els.body.dataset.theme = state.theme;
  persist("Theme updated");
});
$("saveBrandKitBtn").addEventListener("click", saveBrandKit);
$("heroStagePlayBtn").addEventListener("click", () => {
  app.showcasePlaying = !app.showcasePlaying;
  renderHeroStage();
});
$("heroStageNextBtn").addEventListener("click", () => {
  const project = activeProject();
  if (!project?.scenes?.length) return;
  app.showcaseIndex = (app.showcaseIndex + 1) % project.scenes.length;
  renderHeroStage();
});
$("playPreviewBtn").addEventListener("click", () => {
  const scene = activeScene();
  if (!scene) {
    toast("Preview Unavailable", "Create a campaign before previewing motion.", "error");
    return;
  }
  ensureCanvas()?.playScene(scene);
  app.showcaseIndex = activeProject()?.scenes.findIndex((item) => item.id === scene.id) || 0;
  renderHeroStage();
});
$("duplicateSceneBtn").addEventListener("click", () => {
  const project = activeProject();
  const scene = activeScene();
  if (!project || !scene) {
    toast("Duplicate Unavailable", "Select a campaign scene before duplicating.", "error");
    return;
  }
  patchProject(project.id, (draft) => {
    const index = draft.scenes.findIndex((item) => item.id === scene.id);
    draft.scenes.splice(index + 1, 0, duplicateScene(scene));
    return draft;
  }, "Scene duplicated");
});
$("addSceneBtn").addEventListener("click", () => {
  const project = activeProject();
  if (!project) {
    toast("Scene Add Blocked", "Create a campaign first, then add more scenes.", "error");
    return;
  }
  const next = addBlankScene(project);
  state.projects = state.projects.map((item) => item.id === project.id ? next : item);
  persist("Scene added");
  refreshApp();
});
$("addTextLayerBtn").addEventListener("click", () => {
  const scene = activeScene();
  if (!scene) {
    toast("Layer Add Blocked", "Select a campaign scene before adding text.", "error");
    return;
  }
  const next = addTextLayer(scene, "Add supporting persuasive copy");
  updateSelectedScene(() => next);
});
$("restoreDemoBtn").addEventListener("click", loadDemoProject);
$("resetWorkspaceBtn").addEventListener("click", () => {
  const fresh = resetState();
  state.projects = fresh.projects;
  state.activeProjectId = fresh.activeProjectId;
  state.theme = fresh.theme;
  state.lastExport = fresh.lastExport;
  app.selectedSceneId = null;
  app.selectedElementId = null;
  clearInterval(app.previewTimer);
  els.body.dataset.theme = state.theme;
  persist("Studio reset");
  refreshApp();
});

els.motionIntensityInput.addEventListener("input", (event) => {
  const project = activeProject();
  if (!project) return;
  const value = Number(event.target.value);
  patchProject(project.id, (draft) => ({
    ...draft,
    motionIntensity: value,
    scenes: draft.scenes.map((scene) => ({ ...scene, motionIntensity: value }))
  }), "Motion intensity updated");
});

els.sceneTimelineList.addEventListener("change", (event) => {
  const durationId = event.target.dataset.sceneDuration;
  const animationId = event.target.dataset.sceneAnimation;
  const project = activeProject();
  if (!project) return;
  if (durationId) {
    const value = clampDuration(Number(event.target.value));
    event.target.value = value;
    patchProject(project.id, (draft) => ({
      ...draft,
      scenes: draft.scenes.map((scene) => scene.id === durationId ? { ...scene, duration: value } : scene)
    }), "Scene duration updated");
  }
  if (animationId) {
    const value = String(event.target.value);
    patchProject(project.id, (draft) => ({
      ...draft,
      scenes: draft.scenes.map((scene) => scene.id === animationId ? { ...scene, animationType: value, elements: scene.elements.map((element) => element.layerName === "Headline" || element.layerName === "Subheadline" || element.layerName === "CTA" ? { ...element, animation: value } : element) } : scene)
    }), "Scene animation updated");
  }
});

els.templateGrid.addEventListener("change", (event) => {
  if (event.target.id === "template-filter-industry") app.templateFilters.industry = event.target.value;
  if (event.target.id === "template-filter-platform") app.templateFilters.platform = event.target.value;
  if (event.target.id === "template-filter-style") app.templateFilters.style = event.target.value;
  renderTemplates();
});

els.inspectorForm.addEventListener("change", handleInspectorChange);
els.inspectorForm.addEventListener("input", (event) => {
  if (event.target.tagName !== "TEXTAREA") handleInspectorChange();
});

els.importProjectInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const project = payload.project || payload;
    if (!project || !Array.isArray(project.scenes) || !project.scenes.length) {
      throw new Error("Invalid campaign structure");
    }
    state.projects.unshift(project);
    state.activeProjectId = project.id;
    app.selectedSceneId = project.scenes[0]?.id || null;
    app.selectedElementId = null;
    persist("Project imported");
    refreshApp();
    toast("Import Complete", `${project.name} restored successfully.`, "success");
  } catch (error) {
    console.error(error);
    toast("Import Failed", "The selected file could not be parsed.", "error");
  }
});

els.wizardForm.addEventListener("submit", handleWizardSubmit);
$("wizardIndustry").addEventListener("change", syncWizardColors);

document.addEventListener("click", (event) => {
  const closeTarget = event.target.closest("[data-close-modal]");
  if (closeTarget) closeWizard();

  const projectBtn = event.target.closest("[data-project-open]");
  if (projectBtn) openProject(projectBtn.dataset.projectOpen);

  const templateBtn = event.target.closest("[data-template]");
  if (templateBtn) {
    const [industry, style] = templateBtn.dataset.template.split("|");
    openWizard({ industry, style, goal: activeProject()?.goal || goals[0], platform: activeProject()?.platform || platforms[0] });
  }

  const filterIndustry = event.target.closest("#template-filter-industry");
  if (filterIndustry) {
    app.templateFilters.industry = filterIndustry.value;
    renderTemplates();
  }

  const filterPlatform = event.target.closest("#template-filter-platform");
  if (filterPlatform) {
    app.templateFilters.platform = filterPlatform.value;
    renderTemplates();
  }

  const filterStyle = event.target.closest("#template-filter-style");
  if (filterStyle) {
    app.templateFilters.style = filterStyle.value;
    renderTemplates();
  }

  const previewTemplateBtn = event.target.closest("[data-preview-template-id]");
  if (previewTemplateBtn) {
    app.selectedTemplateId = previewTemplateBtn.dataset.previewTemplateId;
    renderTemplates();
  }

  const showcaseSceneBtn = event.target.closest("[data-showcase-scene]");
  if (showcaseSceneBtn) {
    app.showcaseIndex = Number(showcaseSceneBtn.dataset.showcaseScene);
    renderHeroStage();
  }

  const inspectorTabBtn = event.target.closest("[data-inspector-tab]");
  if (inspectorTabBtn) {
    app.inspectorTab = inspectorTabBtn.dataset.inspectorTab;
    renderInspector();
  }

  const useTemplateBtn = event.target.closest("[data-use-template-id]");
  if (useTemplateBtn) {
    const template = motionTemplates.find((item) => item.id === useTemplateBtn.dataset.useTemplateId);
    if (!template) return;
    const project = buildProjectFromTemplate(template);
    state.projects.unshift(project);
    state.activeProjectId = project.id;
    app.selectedSceneId = project.scenes[0]?.id || null;
    app.selectedElementId = null;
    persist("Template campaign created");
    refreshApp();
    location.hash = "dashboard";
    toast("Template Loaded", `${template.name} became a live campaign.`, "success");
  }

  const hookBtn = event.target.closest("[data-apply-hook]");
  if (hookBtn) applyHook(hookBtn.dataset.applyHook);

  const ctaBtn = event.target.closest("[data-apply-cta]");
  if (ctaBtn) applyCta(ctaBtn.dataset.applyCta);

  const variationBtn = event.target.closest("[data-create-variation]");
  if (variationBtn) {
    const project = activeProject();
    if (!project) return;
    setLoading(variationBtn, true, "Generating...");
    const next = createVariation(project, variationBtn.dataset.createVariation);
    state.projects.unshift(next);
    state.activeProjectId = next.id;
    app.selectedSceneId = next.scenes[0].id;
    app.selectedElementId = null;
    persist("Variation generated");
    refreshApp();
    setLoading(variationBtn, false);
    toast("Variation Created", `${next.name} is ready.`, "success");
  }

  const exportBtn = event.target.closest("[data-export]");
  if (exportBtn) exportAction(exportBtn.dataset.export);

  const assetBtn = event.target.closest("[data-add-asset]");
  if (assetBtn) applyAsset(assetBtn.dataset.addAsset);

  const themeBtn = event.target.closest("[data-apply-theme]");
  if (themeBtn) applyTheme(themeBtn.dataset.applyTheme);

  const suggestionBtn = event.target.closest("[data-suggestion]");
  if (suggestionBtn) {
    const project = activeProject();
    if (!project) return;
    setLoading(suggestionBtn, true, "Improving...");
    const next = applySuggestion(project, suggestionBtn.dataset.suggestion);
    state.projects = state.projects.map((item) => item.id === project.id ? next : item);
    persist("Suggestion applied");
    refreshApp();
    setLoading(suggestionBtn, false);
    toast("Optimization Applied", suggestionBtn.dataset.suggestion, "success");
  }

  const selectSceneBtn = event.target.closest("[data-select-scene]");
  if (selectSceneBtn) {
    app.selectedSceneId = selectSceneBtn.dataset.selectScene;
    app.selectedElementId = null;
    app.showcaseIndex = Math.max(0, activeProject()?.scenes.findIndex((item) => item.id === app.selectedSceneId) ?? 0);
    refreshApp();
  }

  const upBtn = event.target.closest("[data-scene-up]");
  if (upBtn) reorderScenes("up", upBtn.dataset.sceneUp);
  const downBtn = event.target.closest("[data-scene-down]");
  if (downBtn) reorderScenes("down", downBtn.dataset.sceneDown);

  const duplicateBtn = event.target.closest("[data-duplicate-scene]");
  if (duplicateBtn) {
    const project = activeProject();
    const scene = project?.scenes.find((item) => item.id === duplicateBtn.dataset.duplicateScene);
    if (!project || !scene) return;
    patchProject(project.id, (draft) => {
      const index = draft.scenes.findIndex((item) => item.id === scene.id);
      draft.scenes.splice(index + 1, 0, duplicateScene(scene));
      return draft;
    }, "Scene duplicated");
  }

  const deleteBtn = event.target.closest("[data-delete-scene]");
  if (deleteBtn) {
    const project = activeProject();
    if (!project) return;
    if (project.scenes.length <= 1) {
      toast("Delete Blocked", "A campaign must keep at least one scene.", "error");
      return;
    }
    const next = deleteScene(project, deleteBtn.dataset.deleteScene);
    state.projects = state.projects.map((item) => item.id === project.id ? next : item);
    if (!next.scenes.some((scene) => scene.id === app.selectedSceneId)) app.selectedSceneId = next.scenes[0]?.id || null;
    persist("Scene deleted");
    refreshApp();
  }

  const elementBtn = event.target.closest("[data-select-element]");
  if (elementBtn) {
    app.selectedElementId = elementBtn.dataset.selectElement;
    renderInspector();
    renderTimeline();
    renderStage();
  }

  const sizeBtn = event.target.closest("[data-size-preset]");
  if (sizeBtn) {
    const project = activeProject();
    if (!project) return;
    const next = applySizePreset(project, sizeBtn.dataset.sizePreset);
    state.projects = state.projects.map((item) => item.id === project.id ? next : item);
    persist("Size preset updated");
    refreshApp();
  }
});

try {
  populateWizardOptions();
  els.body.dataset.theme = state.theme;
  if (applyCaptureMode()) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    refreshApp();
    if (els.saveStatus) els.saveStatus.textContent = captureParams.get("status") || "Saved locally";
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 120);
    if (captureParams.get("wizard") === "1") {
      openWizard({
        industry: captureParams.get("industry") || activeProject()?.industry,
        goal: captureParams.get("goal") || activeProject()?.goal,
        platform: captureParams.get("platform") || activeProject()?.platform,
        style: captureParams.get("style") || activeProject()?.style,
        productName: captureParams.get("product") || activeProject()?.productName,
        brandName: captureParams.get("brand") || activeProject()?.brandKit?.brandName,
        offer: captureParams.get("offer") || activeProject()?.offer,
        cta: captureParams.get("cta") || activeProject()?.cta,
        motionIntensity: Number(captureParams.get("intensity") || activeProject()?.motionIntensity || 72)
      });
    }
  } else if (!state.projects.length) loadDemoProject(); else refreshApp();
  if (state.recoveryNotes?.length) {
    state.recoveryNotes.forEach((note) => toast("Recovery Notice", note, "error"));
  }
  window.corelyticMotionAds = { state, activeProject, activeScene, exportAction };
} catch (error) {
  console.error(error);
  els.saveStatus.textContent = "Boot failed";
  els.projectTitle.textContent = error.message || "Startup failed";
}
