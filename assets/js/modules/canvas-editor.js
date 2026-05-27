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
    isLuxury: style.includes("luxury") || industry === "hotels" || industry === "fashion"
  };
}

function addDomDecor(stageNode, project) {
  const profile = visualProfile(project);
  const decor = document.createElement("div");
  decor.className = `dom-stage-decor${profile.isRestaurant ? " is-restaurant" : ""}${profile.isSaas ? " is-saas" : ""}${profile.isLuxury ? " is-luxury" : ""}`;
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
      fontFamily: currentProject?.brandKit?.fontFamily || "Arial",
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
  stage.add(layer);
  const transformer = new Konva.Transformer({ rotateEnabled: true, borderStroke: "#56f0c3", anchorStroke: "#56f0c3" });
  layer.add(transformer);

  let currentScene = null;
  let currentProject = null;
  let selectedElementId = null;
  const imageCache = new Map();

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
    const common = { x: element.x * width, y: element.y * height, id: element.id, draggable: true, rotation: element.rotation || 0, opacity: element.opacity ?? 1 };
    if (element.type === "text") {
      return new Konva.Text({ ...common, text: element.text, fontSize: element.fontSize || 24, fontFamily: currentProject.brandKit.fontFamily || "Arial", fill: element.fill || "#ffffff", width: element.width * width, lineHeight: 1.15 });
    }
    if (element.type === "image") {
      const cached = imageCache.get(element.id);
      return new Konva.Image({
        ...common,
        image: cached || null,
        width: element.width * width,
        height: element.height * height
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
      callbacks.onSelectElement?.(selectedElementId);
      layer.draw();
    });
    node.on("dragend transformend", () => {
      const payload = { x: Number((node.x() / stage.width()).toFixed(4)), y: Number((node.y() / stage.height()).toFixed(4)), rotation: Number(node.rotation().toFixed(2)) };
      if (node.className === "Text") {
        payload.width = Number((node.width() / stage.width()).toFixed(4));
        payload.fontSize = Math.max(14, Math.round(node.fontSize() * node.scaleY()));
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
    });
  }

  function render(project, scene, selectedId) {
    currentProject = project;
    currentScene = scene;
    selectedElementId = selectedId || null;
    fitSceneSize(project);
    layer.destroyChildren();
    const background = new Konva.Rect({
      x: 0, y: 0, width: stage.width(), height: stage.height(),
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: stage.width(), y: stage.height() },
      fillLinearGradientColorStops: [0, project.brandKit.background || "#08131f", 1, scene.background || "#12263c"]
    });
    layer.add(background);
    addCanvasDecor(layer, project, scene, stage.width(), stage.height());
    scene.elements.forEach((element) => {
      if (element.type === "image" && element.dataUrl && !imageCache.has(element.id)) {
        const image = new Image();
        image.onload = () => {
          imageCache.set(element.id, image);
          render(project, scene, selectedId);
        };
        image.src = element.dataUrl;
      }
      const node = toNodeConfig(element);
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
      const base = { duration: 0.7, ease: "power2.out", delay: index * 0.08 };
      if (animation === "fade") {
        gsap.fromTo(node, { opacity: 0 }, { opacity: node.opacity(), ...base });
      } else if (animation === "float") {
        gsap.fromTo(node, { y: node.y() + 18, opacity: 0 }, { y: node.y() - 6, opacity: node.opacity(), yoyo: true, repeat: 1, ...base });
      } else if (animation === "zoom") {
        gsap.fromTo(node, { scaleX: 0.78, scaleY: 0.78, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: node.opacity(), ...base });
      } else if (animation === "flash") {
        gsap.fromTo(node, { opacity: 0, scaleX: 1.06, scaleY: 1.06 }, { opacity: node.opacity(), scaleX: 1, scaleY: 1, ...base });
      } else if (animation === "pulse") {
        gsap.fromTo(node, { scaleX: 0.9, scaleY: 0.9, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: node.opacity(), ...base });
      } else {
        gsap.fromTo(node, { y: node.y() + 30, opacity: 0 }, { y: node.y(), opacity: node.opacity(), ...base });
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
