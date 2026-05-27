function metric(label, value, reason, action) {
  return { label, value, reason, action };
}

function scoreCampaign(project) {
  if (!project) {
    return { total: 0, summary: "Create a campaign to unlock analyzer scoring.", metrics: [], suggestions: [] };
  }

  const sceneCount = Math.max(1, project.scenes.length);
  const totalText = project.scenes.reduce((sum, scene) => sum + (scene.headline?.length || 0) + (scene.subheadline?.length || 0) + (scene.body?.length || 0) + (scene.cta?.length || 0), 0);
  const avgDuration = project.totalDuration / sceneCount;
  const hook = project.scenes[0]?.headline || "";
  const ctaScene = project.scenes.find((scene) => scene.type === "cta");
  const productScene = project.scenes.find((scene) => scene.type === "product");
  const studio = project.productStudio || {};
  const hasImage = Boolean(project.assetDataUrl || project.scenes.some((scene) => scene.elements?.some((el) => el.type === "image" && el.dataUrl)));
  const heroBoost = studio.heroMode ? 10 : 0;
  const cinematicBoost = studio.cinematicMode ? 8 : 0;
  const effectBoost = Array.isArray(studio.effects) ? Math.min(12, studio.effects.length * 2) : 0;
  const focusBoost = hasImage ? 8 : 0;
  const platformFitBase = project.platform?.toLowerCase().includes("hero") ? (sceneCount >= 5 ? 92 : 72) : project.platform?.toLowerCase().includes("banner") ? (totalText < 300 ? 88 : 66) : 84;

  const hookStrength = Math.max(48, Math.min(100, 58 + Math.round(hook.length / 1.6)));
  const ctaVisibility = Math.max(52, Math.min(100, (ctaScene?.elements.some((el) => el.layerName === "CTA" && el.y >= 0.68) ? 90 : 68) + (project.motionIntensity > 70 ? 4 : 0)));
  const textDensity = Math.max(38, Math.min(100, 104 - Math.round(totalText / sceneCount / 3.2)));
  const motionBalance = Math.max(45, Math.min(100, 100 - Math.abs((project.motionIntensity || 72) - 68)));
  const platformFit = Math.max(50, Math.min(100, platformFitBase));
  const scenePacing = Math.max(46, Math.min(100, 100 - Math.round(Math.abs(avgDuration - 2.5) * 24)));
  const productFocus = Math.max(54, Math.min(100, (productScene?.elements.some((el) => el.layerName === "Uploaded Asset" || el.layerName === "Product Focus") ? 80 : 62) + focusBoost + heroBoost + cinematicBoost + effectBoost));

  const metrics = [
    metric("Hook Strength", hookStrength, hookStrength >= 84 ? "The opening promise is direct and quick to understand." : "The opening needs a sharper benefit or stronger curiosity angle.", "Improve Hook"),
    metric("CTA Visibility", ctaVisibility, ctaVisibility >= 84 ? "The CTA is visually placed in a strong closing position." : "The CTA needs more contrast or stronger closing emphasis.", "Strengthen CTA"),
    metric("Text Density", textDensity, textDensity >= 80 ? "Text length is balanced for ad consumption." : "Too much copy is competing for attention in the current scenes.", "Reduce Text"),
    metric("Motion Balance", motionBalance, motionBalance >= 82 ? "Motion intensity is balanced for clarity and impact." : "The pace feels either too soft or too aggressive for the message.", "Adjust Motion"),
    metric("Platform Fit", platformFit, platformFit >= 82 ? "The structure fits the chosen placement well." : "Scene structure or copy load could be tuned better for this platform.", "Improve Platform Fit"),
    metric("Scene Pacing", scenePacing, scenePacing >= 82 ? "Scene timing is close to a strong ad cadence." : "Scene durations need rebalancing to keep energy and clarity aligned.", "Balance Scenes"),
    metric("Product Focus", productFocus, productFocus >= 90 ? "The product hero treatment reads clearly and the focal hierarchy is strong." : productFocus >= 84 ? "The product or offer is easy to identify." : "Product focus needs stronger visual anchoring.", "Increase Product Focus")
  ];

  const total = Math.round(metrics.reduce((sum, item) => sum + item.value, 0) / metrics.length);
  const suggestions = [...new Set(metrics.filter((item) => item.value < 84).map((item) => item.action))];
  if (studio.cinematicMode) suggestions.unshift("Product focus improved with cinematic composition.");
  else if (studio.heroMode) suggestions.unshift("Product focus improved with hero composition.");
  return {
    total,
    summary: total >= 90 ? "Commercially strong structure with premium conversion clarity." : total >= 78 ? "Strong base campaign with a few high-impact optimization opportunities." : "Usable campaign, but it needs clearer messaging and pacing before export.",
    metrics,
    suggestions
  };
}

window.CorelyticAnalytics = { scoreCampaign };
