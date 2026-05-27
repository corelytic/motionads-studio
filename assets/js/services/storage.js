const STORAGE_KEY = "corelytic-motionads-studio:v1";

const defaultState = {
  projects: [],
  activeProjectId: null,
  theme: "dark",
  lastExport: null,
  recoveryNotes: []
};

const FALLBACK_PREFIX = "__corelytic-motionads-studio__=";

function readFallbackStore() {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.name || "";
    return raw.startsWith(FALLBACK_PREFIX) ? raw.slice(FALLBACK_PREFIX.length) : null;
  } catch {
    return null;
  }
}

function writeFallbackStore(value) {
  try {
    if (typeof window === "undefined") return false;
    window.name = `${FALLBACK_PREFIX}${value}`;
    return true;
  } catch {
    return false;
  }
}

function clearFallbackStore() {
  try {
    if (typeof window === "undefined") return false;
    if ((window.name || "").startsWith(FALLBACK_PREFIX)) window.name = "";
    return true;
  } catch {
    return false;
  }
}

function readStorageValue() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return readFallbackStore();
  }
}

function writeStorageValue(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    return { ok: true, mode: "localStorage" };
  } catch {
    return writeFallbackStore(value) ? { ok: true, mode: "window.name" } : { ok: false, mode: "memory" };
  }
}

function removeStorageValue() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return clearFallbackStore();
  }
}

function sanitizeProject(project) {
  if (!project || typeof project !== "object" || !Array.isArray(project.scenes)) return null;
  const cleanedScenes = project.scenes
    .filter((scene) => scene && typeof scene === "object")
    .map((scene, index) => {
      const duration = Number(scene.duration);
      return {
        ...scene,
        id: scene.id || `recovered-scene-${index + 1}`,
        name: scene.name || `Recovered Scene ${index + 1}`,
        type: scene.type || "custom",
        duration: Number.isFinite(duration) ? Math.min(12, Math.max(0.8, duration)) : 2.4,
        animationType: scene.animationType || "rise",
        elements: Array.isArray(scene.elements) ? scene.elements.filter(Boolean) : []
      };
    });
  if (!cleanedScenes.length) return null;
  return {
    ...project,
    id: project.id || `recovered-project-${Date.now()}`,
    name: project.name || "Recovered Campaign",
    scenes: cleanedScenes,
    sizePreset: project.sizePreset || "reel",
    motionIntensity: Number.isFinite(Number(project.motionIntensity)) ? Math.min(100, Math.max(20, Number(project.motionIntensity))) : 72,
    brandKit: {
      brandName: project.brandKit?.brandName || "Recovered Brand",
      primary: project.brandKit?.primary || "#56f0c3",
      secondary: project.brandKit?.secondary || "#ff9157",
      accent: project.brandKit?.accent || "#6ba3ff",
      background: project.brandKit?.background || "#08131f",
      fontFamily: project.brandKit?.fontFamily || "Manrope",
      logoText: project.brandKit?.logoText || "RB"
    }
  };
}

function loadState() {
  try {
    const raw = readStorageValue();
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    const recovered = Array.isArray(parsed.projects) ? parsed.projects.map(sanitizeProject).filter(Boolean) : [];
    const notes = [];
    if (Array.isArray(parsed.projects) && recovered.length !== parsed.projects.length) {
      notes.push("Some corrupted campaigns were skipped during recovery.");
    }
    return {
      ...structuredClone(defaultState),
      ...parsed,
      theme: parsed.theme === "light" ? "light" : "dark",
      activeProjectId: recovered.some((project) => project.id === parsed.activeProjectId) ? parsed.activeProjectId : recovered[0]?.id || null,
      projects: recovered,
      recoveryNotes: notes
    };
  } catch (error) {
    console.warn("Failed to load state, falling back to defaults.", error);
    return { ...structuredClone(defaultState), recoveryNotes: ["Local data was corrupted and has been reset safely."] };
  }
}

function saveState(state) {
  const payload = {
    projects: Array.isArray(state.projects) ? state.projects : [],
    activeProjectId: state.activeProjectId || null,
    theme: state.theme === "light" ? "light" : "dark",
    lastExport: state.lastExport || null
  };
  return writeStorageValue(JSON.stringify(payload));
}

function resetState() {
  removeStorageValue();
  return structuredClone(defaultState);
}

window.CorelyticStorage = { loadState, saveState, resetState };
