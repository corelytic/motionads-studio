const { sizePresets } = window.CorelyticData;
const Konva = window.Konva;
const gsap = window.gsap || {
  fromTo() {},
  to(target, options = {}) {
    if (typeof options.onComplete === "function") options.onComplete();
  },
  killTweensOf() {}
};

function visualProfile(project) {
  const industry = project?.industry || "general";
  const style = (project?.style || "").toLowerCase();
  return {
    industry,
    isRestaurant: industry === "restaurants",
    isSaas: industry === "saas" || industry === "ai tools",
    isLuxury: style.includes("luxury") || industry === "hotels" || industry === "fashion",
    isEcommerce: industry === "ecommerce"
  };
}

function studioSettings(project) {
  return {
    zoom: Number(project?.productStudio?.zoom || 1),
    x: Number(project?.productStudio?.x || 0),
    y: Number(project?.productStudio?.y || 0),
    rotation: Number(project?.productStudio?.rotation || 0),
    brightness: Number(project?.productStudio?.brightness || 100),
    contrast: Number(project?.productStudio?.contrast || 100),
    saturation: Number(project?.productStudio?.saturation || 100),
    blurBackground: Number(project?.productStudio?.blurBackground || 0),
    overlayIntensity: Number(project?.productStudio?.overlayIntensity || 62),
    shadowIntensity: Number(project?.productStudio?.shadowIntensity || 0),
    glowIntensity: Number(project?.productStudio?.glowIntensity || 0),
    heroMode: Boolean(project?.productStudio?.heroMode),
    cinematicMode: Boolean(project?.productStudio?.cinematicMode),
    effects: Array.isArray(project?.productStudio?.effects) ? project.productStudio.effects : []
  };
}

function addDomDecor(stageNode, project) {
  const profile = visualProfile(project);
  const studio = studioSettings(project);
  const decor = document.createElement("div");
  decor.className = `dom-stage-decor${profile.isRestaurant ? " is-restaurant" : ""}${profile.isSaas ? " is-saas" : ""}${profile.isLuxury ? " is-luxury" : ""}${profile.isEcommerce ? " is-ecommerce" : ""}${studio.effects.includes("food-heat") ? " has-food-heat" : ""}${studio.effects.includes("luxury-glow") ? " has-luxury-glow" : ""}${studio.effects.includes("sale-energy") ? " has-sale-energy" : ""}${studio.effects.includes("cinematic-lighting") ? " has-cinematic-lighting" : ""}`;
  decor.innerHTML = `
    <div class="dom-decor-orb orb-a"></div>
    <div class="dom-decor-orb orb-b"></div>
    <div class="dom-decor-card card-a"></div>
    <div class="dom-decor-card card-b"></div>
    <div class="dom-decor-line line-a"></div>
    <div class="dom-decor-line line-b"></div>
    <div class="dom-decor-steam steam-a"></div>
    <div class="dom-decor-steam steam-b"></div>
    <div class="dom-decor-dash"><span></span><span></span><span></span></div>
  `;
  stageNode.appendChild(decor);
}

function addCanvasDecor(layer, project, scene, stageWidth, stageHeight) {
  const profile = visualProfile(project);
  const studio = studioSettings(project);
  const accent = project.brandKit.accent || "#56f0c3";
  const secondary = project.brandKit.secondary || "#ff9157";
  const primary = project.brandKit.primary || "#6ba3ff";

  const lightOrb = new Konva.Circle({
    x: stageWidth * 0.8,
    y: stageHeight * 0.2,
    radius: Math.max(80, stageWidth * 0.14),
    fill: accent,
    opacity: profile.isRestaurant ? 0.16 : profile.isLuxury ? 0.1 : 0.14,
    shadowColor: accent,
    shadowBlur: 50,
    shadowOpacity: 0.26
  });
  const glowOrb = new Konva.Circle({
    x: stageWidth * 0.2,
    y: stageHeight * 0.78,
    radius: Math.max(90, stageWidth * 0.18),
    fill: secondary,
    opacity: profile.isRestaurant ? 0.14 : 0.1,
    shadowColor: secondary,
    shadowBlur: 60,
    shadowOpacity: 0.24
  });
  layer.add(lightOrb, glowOrb);

  const frameCard = new Konva.Rect({
    x: stageWidth * 0.6,
    y: stageHeight * 0.14,
    width: stageWidth * 0.25,
    height: stageHeight * 0.24,
    cornerRadius: 24,
    fill: "rgba(255,255,255,0.04)",
    stroke: "rgba(255,255,255,0.08)",
    strokeWidth: 1,
    rotation: profile.isLuxury ? 0 : 4
  });
  const supportCard = new Konva.Rect({
    x: stageWidth * 0.08,
    y: stageHeight * 0.72,
    width: stageWidth * 0.24,
    height: stageHeight * 0.15,
    cornerRadius: 22,
    fill: "rgba(255,255,255,0.03)",
    stroke: "rgba(255,255,255,0.06)",
    strokeWidth: 1
  });
  layer.add(frameCard, supportCard);

  const lineA = new Konva.Line({
    points: [stageWidth * 0.08, stageHeight * 0.24, stageWidth * 0.45, stageHeight * 0.24],
    stroke: "rgba(255,255,255,0.18)",
    strokeWidth: 1
  });
  const lineB = new Konva.Line({
    points: [stageWidth * 0.48, stageHeight * 0.78, stageWidth * 0.88, stageHeight * 0.78],
    stroke: "rgba(255,255,255,0.16)",
    strokeWidth: 1
  });
  layer.add(lineA, lineB);

  if (profile.isRestaurant) {
    const counter = new Konva.Rect({
      x: 0,
      y: stageHeight * 0.8,
      width: stageWidth,
      height: stageHeight * 0.2,
      fill: "rgba(31,15,9,0.38)"
    });
    const plate = new Konva.Circle({
      x: stageWidth * 0.72,
      y: stageHeight * 0.74,
      radius: stageWidth * 0.12,
      fill: "rgba(255,236,216,0.08)",
      stroke: "rgba(255,232,187,0.12)",
      strokeWidth: 2
    });
    const steamA = new Konva.Line({
      points: [stageWidth * 0.66, stageHeight * 0.62, stageWidth * 0.67, stageHeight * 0.54, stageWidth * 0.65, stageHeight * 0.46],
      stroke: "rgba(255,255,255,0.18)",
      strokeWidth: 3,
      tension: 0.6,
      lineCap: "round"
    });
    const steamB = new Konva.Line({
      points: [stageWidth * 0.72, stageHeight * 0.6, stageWidth * 0.73, stageHeight * 0.51, stageWidth * 0.71, stageHeight * 0.43],
      stroke: "rgba(255,255,255,0.16)",
      strokeWidth: 3,
      tension: 0.6,
      lineCap: "round"
    });
    layer.add(counter, plate, steamA, steamB);
  }

  if (profile.isSaas) {
    const gridPanel = new Konva.Rect({
      x: stageWidth * 0.56,
      y: stageHeight * 0.12,
      width: stageWidth * 0.28,
      height: stageHeight * 0.2,
      cornerRadius: 26,
      fill: "rgba(8,22,38,0.42)",
      stroke: "rgba(96,165,250,0.18)",
      strokeWidth: 1
    });
    const bar1 = new Konva.Rect({ x: stageWidth * 0.6, y: stageHeight * 0.24, width: 16, height: 26, cornerRadius: 8, fill: accent, opacity: 0.82 });
    const bar2 = new Konva.Rect({ x: stageWidth * 0.63, y: stageHeight * 0.2, width: 16, height: 52, cornerRadius: 8, fill: primary, opacity: 0.86 });
    const bar3 = new Konva.Rect({ x: stageWidth * 0.66, y: stageHeight * 0.22, width: 16, height: 38, cornerRadius: 8, fill: secondary, opacity: 0.8 });
    const metricText = new Konva.Text({
      x: stageWidth * 0.6,
      y: stageHeight * 0.15,
      text: "Live metrics",
      fontSize: 13,
      fontStyle: "bold",
      fontFamily: project.brandKit?.fontFamily || "Arial",
      fill: "#cde1fb"
    });
    layer.add(gridPanel, bar1, bar2, bar3, metricText);
  }

  if (profile.isLuxury) {
    const spotlight = new Konva.Circle({
      x: stageWidth * 0.5,
      y: stageHeight * 0.38,
      radius: stageWidth * 0.24,
      fill: "rgba(255,224,168,0.06)",
      stroke: "rgba(255,225,166,0.12)",
      strokeWidth: 1
    });
    const frame = new Konva.Rect({
      x: stageWidth * 0.57,
      y: stageHeight * 0.12,
      width: stageWidth * 0.24,
      height: stageHeight * 0.56,
      cornerRadius: 32,
      stroke: "rgba(255,225,166,0.16)",
      strokeWidth: 2
    });
    layer.add(spotlight, frame);
  }

  const sceneLabel = new Konva.Text({
    x: stageWidth * 0.08,
    y: stageHeight * 0.1,
    text: `${project.platform} • ${scene.name}`,
    fontSize: 13,
    fontStyle: "bold",
    fontFamily: project.brandKit?.fontFamily || "Arial",
    fill: "rgba(220,232,248,0.9)",
    letterSpacing: 1.8
  });
  layer.add(sceneLabel);

  if (studio.heroMode || studio.effects.includes("cinematic-lighting")) {
    const spotlight = new Konva.Circle({
      x: stageWidth * 0.64,
      y: stageHeight * 0.42,
      radius: stageWidth * 0.18,
      fill: "rgba(255,255,255,0.04)",
      shadowColor: accent,
      shadowBlur: Math.max(18, studio.glowIntensity),
      shadowOpacity: 0.18
    });
    layer.add(spotlight);
  }
}

function createDomFallbackEditor(mount, callbacks) {
  let currentProject = null;
  let currentScene = null;
  let selectedElementId = null;
  let stageNode = null;

  function buildStage(project) {
    const preset = sizePresets[project.sizePreset];
    const maxWidth = Math.max(320, mount.clientWidth || 720);
    const width = Math.min(maxWidth, 720);
    const height = Math.max(420, Math.round(width * (preset.height / preset.width)));
    mount.innerHTML = "";
    stageNode = document.createElement("div");
    stageNode.className = "dom-stage";
    stageNode.style.width = `${width}px`;
    stageNode.style.height = `${height}px`;
    mount.appendChild(stageNode);
    return { width, height };
  }

  function createElementNode(element, width, height) {
    const studio = studioSettings(currentProject);
    const node = document.createElement("button");
    node.type = "button";
    node.className = `dom-layer dom-layer-${element.type}${element.id === selectedElementId ? " active" : ""}`;
    node.dataset.elementId = element.id;
    node.style.left = `${element.x * width}px`;
    node.style.top = `${element.y * height}px`;
    node.style.width = `${element.width * width}px`;
    node.style.height = `${(element.height || 0.12) * height}px`;
    node.style.transform = `rotate(${element.rotation || 0}deg)`;
    node.style.opacity = String(element.opacity ?? 1);
    if (element.type === "text") {
      node.textContent = element.text;
      node.style.color = element.fill || "#ffffff";
      node.style.fontSize = `${element.fontSize || 24}px`;
      node.style.fontFamily = currentProject?.brandKit?.fontFamily || "Arial";
      node.style.fontWeight = element.fontWeight || "700";
      node.style.textAlign = element.align || "left";
      node.style.background = "transparent";
      node.style.border = "0";
      node.style.padding = "0";
    } else if (element.type === "image" && element.dataUrl) {
      node.style.backgroundImage = `url(${element.dataUrl})`;
      node.style.backgroundSize = "cover";
      node.style.backgroundPosition = "center";
      node.style.borderRadius = "18px";
      node.style.border = element.id === selectedElementId ? "2px solid #56f0c3" : "0";
      node.style.transform = `translate(${studio.x}px, ${studio.y}px) rotate(${(element.rotation || 0) + studio.rotation}deg) scale(${studio.zoom})`;
      node.style.filter = `brightness(${studio.brightness}%) contrast(${studio.contrast}%) saturate(${studio.saturation}%)`;
      node.style.boxShadow = `0 24px 54px rgba(2,10,18,${Math.min(0.7, studio.shadowIntensity / 100)}), 0 0 ${Math.max(18, studio.glowIntensity)}px rgba(255,255,255,${Math.min(0.35, studio.glowIntensity / 220)})`;
      node.textContent = "";
    } else {
      node.style.background = element.fill || "#56f0c3";
      node.style.borderRadius = element.shapeKind === "circle" ? "999px" : "24px";
      node.style.border = element.id === selectedElementId ? "2px solid #56f0c3" : "0";
      node.textContent = "";
    }
    node.addEventListener("click", () => {
      selectedElementId = element.id;
      callbacks.onSelectElement?.(selectedElementId);
      render(currentProject, currentScene, selectedElementId);
    });
    return node;
  }

  function render(project, scene, selectedId) {
    currentProject = project;
    currentScene = scene;
    selectedElementId = selectedId || null;
    const { width, height } = buildStage(project);
    stageNode.style.background = `linear-gradient(135deg, ${project.brandKit.background || "#08131f"}, ${scene.background || "#12263c"})`;
    const backdrop = document.createElement("div");
    backdrop.className = "dom-stage-backdrop";
    backdrop.style.opacity = String(project.productStudio?.heroMode ? 0.85 : 1);
    stageNode.appendChild(backdrop);
    addDomDecor(stageNode, project);
    scene.elements.forEach((element) => {
      stageNode.appendChild(createElementNode(element, width, height));
    });
    stageNode.addEventListener("click", (event) => {
      if (event.target === stageNode || event.target === backdrop) {
        selectedElementId = null;
        callbacks.onSelectElement?.(null);
        render(currentProject, currentScene, null);
      }
    }, { once: true });
  }

  function playScene() {
    if (!stageNode) return;
    stageNode.classList.remove("is-playing");
    requestAnimationFrame(() => stageNode.classList.add("is-playing"));
  }

  window.addEventListener("resize", () => {
    if (currentProject && currentScene) render(currentProject, currentScene, selectedElementId);
  });

  return {
    render,
    playScene,
    stage: {
      toDataURL() {
        return null;
      }
    }
  };
}

function createCanvasEditor(mount, callbacks) {
  if (!mount) {
    throw new Error("Canvas mount element is missing.");
  }
  if (!Konva) {
    return createDomFallbackEditor(mount, callbacks);
  }
  const stage = new Konva.Stage({ container: mount, width: mount.clientWidth || 720, height: Math.max(420, Math.round((mount.clientWidth || 720) * 0.7)) });
  const layer = new Konva.Layer();
  const guidesLayer = new Konva.Layer();
  stage.add(layer);
  stage.add(guidesLayer);
  const transformer = new Konva.Transformer({
    rotateEnabled: true,
    borderStroke: "#56f0c3",
    borderStrokeWidth: 2,
    borderDash: [6, 4],
    anchorStroke: "#56f0c3",
    anchorFill: "#071623",
    anchorCornerRadius: 999,
    anchorSize: 12,
    rotateAnchorOffset: 28,
    rotateAnchorCursor: "grab",
    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"]
  });
  layer.add(transformer);

  let currentScene = null;
  let currentProject = null;
  let selectedElementId = null;
  const imageCache = new Map();
  let guideTimeout = null;

  function clearGuides() {
    guidesLayer.destroyChildren();
    guidesLayer.draw();
  }

  function showGuides(node) {
    clearTimeout(guideTimeout);
    clearGuides();
    const vertical = new Konva.Line({
      points: [stage.width() / 2, 0, stage.width() / 2, stage.height()],
      stroke: "rgba(86,240,195,0.65)",
      strokeWidth: 1,
      dash: [8, 8]
    });
    const horizontal = new Konva.Line({
      points: [0, stage.height() / 2, stage.width(), stage.height() / 2],
      stroke: "rgba(86,240,195,0.45)",
      strokeWidth: 1,
      dash: [8, 8]
    });
    const outline = new Konva.Rect({
      x: node.x() - 6,
      y: node.y() - 6,
      width: Math.max(18, node.width() * node.scaleX() + 12),
      height: Math.max(18, node.height() * node.scaleY() + 12),
      stroke: "rgba(107,163,255,0.55)",
      strokeWidth: 1,
      dash: [6, 4],
      cornerRadius: 10
    });
    guidesLayer.add(vertical, horizontal, outline);
    guidesLayer.draw();
    guideTimeout = setTimeout(() => clearGuides(), 700);
  }

  function snapValue(value, stageSize, threshold = 14) {
    const candidates = [0, stageSize / 2, stageSize];
    const match = candidates.find((candidate) => Math.abs(value - candidate) <= threshold);
    return match ?? value;
  }

  function fitSceneSize(project) {
    const preset = sizePresets[project.sizePreset];
    const maxWidth = mount.clientWidth || 720;
    const ratio = preset.height / preset.width;
    stage.width(maxWidth);
    stage.height(Math.min(700, Math.round(maxWidth * ratio)));
  }

  function toNodeConfig(element) {
    const width = stage.width();
    const height = stage.height();
    const studio = studioSettings(currentProject);
    const common = { x: element.x * width, y: element.y * height, id: element.id, draggable: !element.locked, rotation: element.rotation || 0, opacity: element.opacity ?? 1, visible: !element.hidden };
    if (element.type === "text") {
      return new Konva.Text({ ...common, text: element.text, fontSize: element.fontSize || 24, fontFamily: currentProject.brandKit.fontFamily || "Arial", fill: element.fill || "#ffffff", width: element.width * width, lineHeight: element.lineHeight || 1.08, letterSpacing: element.letterSpacing || 0, shadowColor: element.glow ? element.fill || "#ffffff" : "#020a12", shadowBlur: Math.max(element.shadow || 0, element.glow || 0), shadowOpacity: element.glow ? 0.55 : 0.28, shadowOffsetY: element.shadow ? 8 : 0 });
    }
    if (element.type === "image") {
      const cached = imageCache.get(element.id);
      return new Konva.Image({
        ...common,
        x: element.x * width + studio.x * 2,
        y: element.y * height + studio.y * 2,
        rotation: (element.rotation || 0) + studio.rotation,
        image: cached || null,
        width: element.width * width * studio.zoom,
        height: element.height * height * studio.zoom,
        shadowColor: "rgba(0,0,0,0.75)",
        shadowBlur: Math.max(12, studio.shadowIntensity * 0.7),
        shadowOpacity: Math.min(0.75, studio.shadowIntensity / 100),
          shadowOffsetY: 10
        });
    }
    if (element.shapeKind === "circle") {
      return new Konva.Circle({ ...common, radius: (element.width * width) / 2, fill: element.fill || "#6ba3ff" });
    }
    return new Konva.Rect({ ...common, width: element.width * width, height: element.height * height, cornerRadius: 24, fill: element.fill || "#56f0c3" });
  }

  function bindNode(node) {
    node.on("click tap", () => {
      selectedElementId = node.id();
      transformer.nodes([node]);
      stage.container().style.cursor = node.className === "Image" ? "grab" : "move";
      callbacks.onSelectElement?.(selectedElementId);
      showGuides(node);
      layer.draw();
    });
    node.on("dblclick dbltap", () => {
      if (node.className !== "Text") return;
      const nextText = window.prompt("Edit stage text", node.text());
      if (typeof nextText === "string") callbacks.onEditText?.(node.id(), nextText);
    });
    node.on("dragmove", () => {
      stage.container().style.cursor = "grabbing";
      const centerX = snapValue(node.x() + ((node.width?.() || 0) * node.scaleX()) / 2, stage.width());
      const centerY = snapValue(node.y() + ((node.height?.() || 0) * node.scaleY()) / 2, stage.height());
      const width = (node.width?.() || 0) * node.scaleX();
      const height = (node.height?.() || 0) * node.scaleY();
      node.x(centerX - width / 2);
      node.y(centerY - height / 2);
      showGuides(node);
    });
    node.on("transform", () => showGuides(node));
    node.on("dragend transformend", () => {
      stage.container().style.cursor = node.className === "Image" ? "grab" : "default";
      if (node.className === "Image") {
        const element = currentScene?.elements.find((item) => item.id === node.id());
        if (element) {
          callbacks.onUpdateStudio?.({
            x: Math.round(((node.x() - element.x * stage.width()) / 2)),
            y: Math.round(((node.y() - element.y * stage.height()) / 2)),
            rotation: Number(node.rotation().toFixed(2)),
            zoom: Number(Math.min(1.95, Math.max(0.7, (node.width() * node.scaleX()) / (element.width * stage.width()))).toFixed(2))
          });
        }
        clearGuides();
        return;
      }
      const payload = { x: Number((node.x() / stage.width()).toFixed(4)), y: Number((node.y() / stage.height()).toFixed(4)), rotation: Number(node.rotation().toFixed(2)) };
      if (node.className === "Text") {
        payload.width = Number((node.width() / stage.width()).toFixed(4));
        payload.fontSize = Math.max(14, Math.round(node.fontSize() * node.scaleY()));
        payload.lineHeight = Number(node.lineHeight().toFixed(2));
        payload.letterSpacing = Number((node.letterSpacing?.() || 0).toFixed(2));
        node.scaleX(1);
        node.scaleY(1);
      }
      if (node.className === "Rect") {
        payload.width = Number((node.width() * node.scaleX() / stage.width()).toFixed(4));
        payload.height = Number((node.height() * node.scaleY() / stage.height()).toFixed(4));
        node.scaleX(1);
        node.scaleY(1);
      }
      if (node.className === "Image") {
        payload.width = Number((node.width() * node.scaleX() / stage.width()).toFixed(4));
        payload.height = Number((node.height() * node.scaleY() / stage.height()).toFixed(4));
        node.scaleX(1);
        node.scaleY(1);
      }
      if (node.className === "Circle") {
        payload.width = Number(((node.radius() * 2 * node.scaleX()) / stage.width()).toFixed(4));
        payload.height = payload.width;
        node.scaleX(1);
        node.scaleY(1);
      }
      callbacks.onUpdateElement?.(node.id(), payload);
      clearGuides();
    });
    node.on("mouseenter", () => {
      stage.container().style.cursor = node.className === "Image" ? "grab" : "move";
    });
    node.on("mouseleave", () => {
      if (selectedElementId !== node.id()) stage.container().style.cursor = "default";
    });
  }

  function render(project, scene, selectedId) {
    currentProject = project;
    currentScene = scene;
    selectedElementId = selectedId || null;
    fitSceneSize(project);
    layer.destroyChildren();
    clearGuides();
    const background = new Konva.Rect({
      x: 0, y: 0, width: stage.width(), height: stage.height(),
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: stage.width(), y: stage.height() },
      fillLinearGradientColorStops: [0, project.brandKit.background || "#08131f", 1, scene.background || "#12263c"]
    });
    layer.add(background);
    addCanvasDecor(layer, project, scene, stage.width(), stage.height());
    scene.elements.forEach((element) => {
      if (element.hidden) return;
      if (element.type === "image" && element.dataUrl && !imageCache.has(element.id)) {
        const image = new Image();
        image.onload = () => {
          imageCache.set(element.id, image);
          render(project, scene, selectedId);
        };
        image.src = element.dataUrl;
      }
      const node = toNodeConfig(element);
      if (element.type === "image" && node.image()) {
        node.cache();
        if (Konva.Filters?.Brighten) {
          node.filters([Konva.Filters.Brighten, Konva.Filters.Contrast]);
          node.brightness((studioSettings(project).brightness - 100) / 100);
          node.contrast(studioSettings(project).contrast - 100);
        }
      }
      bindNode(node);
      layer.add(node);
      if (selectedElementId === element.id) transformer.nodes([node]);
    });
    layer.add(transformer);
    layer.draw();
  }

  function playScene(scene) {
    const nodes = layer.getChildren((node) => node !== transformer);
    gsap.killTweensOf(nodes);
    nodes.forEach((node, index) => {
      if (node.className === "Rect" && index === 0) return;
      const element = scene.elements.find((item) => item.id === node.id());
      if (!element) return;
      const animation = element.animation || scene.animationType || "rise";
      const base = { duration: node.className === "Image" ? 1.05 : node.className === "Text" ? 0.86 : 0.74, ease: "power3.out", delay: index * 0.09 };
      if (animation === "fade") {
        gsap.fromTo(node, { opacity: 0 }, { opacity: node.opacity(), ...base });
      } else if (animation === "float") {
        gsap.fromTo(node, { y: node.y() + 18, opacity: 0 }, { y: node.y() - 8, opacity: node.opacity(), yoyo: true, repeat: 1, ...base });
      } else if (animation === "zoom") {
        gsap.fromTo(node, { scaleX: node.className === "Image" ? 0.72 : 0.78, scaleY: node.className === "Image" ? 0.72 : 0.78, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: node.opacity(), ...base });
      } else if (animation === "flash") {
        gsap.fromTo(node, { opacity: 0, scaleX: 1.12, scaleY: 1.12 }, { opacity: node.opacity(), scaleX: 1, scaleY: 1, ...base });
      } else if (animation === "pulse") {
        gsap.fromTo(node, { scaleX: 0.88, scaleY: 0.88, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: node.opacity(), ...base });
      } else {
        gsap.fromTo(node, { y: node.y() + 34, opacity: 0 }, { y: node.y(), opacity: node.opacity(), ...base });
      }
      if (node.className === "Image") {
        gsap.fromTo(node, { x: node.x() + 14 }, { x: node.x() - 8, duration: 1.6, ease: "power2.out", yoyo: true, repeat: 1, delay: index * 0.06 });
      }
      if (node.className === "Text") {
        gsap.fromTo(node, { x: node.x() - 10 }, { x: node.x(), duration: 0.92, ease: "power3.out", delay: index * 0.05 });
      }
    });
  }

  stage.on("click", (event) => {
    if (event.target === stage) {
      transformer.nodes([]);
      selectedElementId = null;
      callbacks.onSelectElement?.(null);
      layer.draw();
    }
  });

  window.addEventListener("resize", () => {
    if (currentProject && currentScene) render(currentProject, currentScene, selectedElementId);
  });

  return { render, playScene, stage };
}

window.CorelyticCanvas = { createCanvasEditor };
