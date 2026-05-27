function download(payload, fileName, type) {
  const blob = new Blob([payload], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function slug(project) {
  return project.name.replace(/\s+/g, "-").toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildStandaloneHtml(project) {
  const payload = {
    name: project.name,
    industry: project.industry,
    goal: project.goal,
    platform: project.platform,
    sizePreset: project.sizePreset,
    variation: project.variation,
    productName: project.productName,
    offer: project.offer,
    cta: project.cta,
    brandKit: project.brandKit,
    totalDuration: project.totalDuration,
    scenes: project.scenes.map((scene) => ({
      name: scene.name,
      type: scene.type,
      headline: scene.headline,
      subheadline: scene.subheadline,
      body: scene.body,
      cta: scene.cta,
      background: scene.background,
      duration: scene.duration,
      animationType: scene.animationType,
      image: scene.elements.find((element) => element.type === "image" && element.dataUrl)?.dataUrl || null
    }))
  };
  const safeProjectName = escapeHtml(project.name);
  const safePlatform = escapeHtml(project.platform);
  const safeSize = escapeHtml(project.sizePreset?.toUpperCase() || "CUSTOM");
  const safeGoal = escapeHtml(project.goal);
  const safeVariation = escapeHtml(project.variation);
  const safeSummary = escapeHtml(project.motionRecipe?.summary || "Generated with Corelytic MotionAds Studio.");
  const safeOffer = escapeHtml(project.offer || "Launch your campaign now");
  const safeCta = escapeHtml(project.cta || "Start now");
  const payloadText = escapeHtml(JSON.stringify(payload, null, 2));
  const industryKey = escapeHtml((project.industry || "general").replace(/\s+/g, "-").toLowerCase());
  const styleKey = escapeHtml((project.style || "standard").replace(/\s+/g, "-").toLowerCase());
  const scenesMarkup = project.scenes.map((scene, index) => `
    <button class="scene-pill${index === 0 ? " active" : ""}" data-scene-index="${index}">
      <span class="scene-glyph">${escapeHtml(scene.animationType)}</span>
      <span>${escapeHtml(scene.name)}</span>
      <small>${escapeHtml(scene.duration.toFixed(1))}s</small>
    </button>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeProjectName}</title>
  <meta name="description" content="Standalone motion campaign export from Corelytic MotionAds Studio with embedded animated preview and offline playback.">
  <link rel="icon" href="data:,">
  <style>
    :root{
      color-scheme:dark;
      --bg:${escapeHtml(project.brandKit.background || "#08131f")};
      --panel:rgba(15,28,45,.82);
      --text:#eef4ff;
      --muted:#adc1db;
      --accent:${escapeHtml(project.brandKit.primary || "#56f0c3")};
      --accent-2:${escapeHtml(project.brandKit.secondary || "#ff9157")};
      --accent-3:${escapeHtml(project.brandKit.accent || "#6ba3ff")};
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      min-height:100vh;
      overflow-x:hidden;
      font-family:"Segoe UI","Aptos",sans-serif;
      color:var(--text);
      background:
        radial-gradient(circle at top left,rgba(86,240,195,.14),transparent 24%),
        radial-gradient(circle at top right,rgba(107,163,255,.14),transparent 24%),
        linear-gradient(160deg,#04111b,var(--bg) 42%,#06111d);
    }
    .shell{max-width:1440px;margin:0 auto;padding:24px;display:grid;gap:22px}
    .hero{
      display:grid;
      grid-template-columns:minmax(280px,380px) minmax(0,1fr);
      gap:20px;
      padding:24px;
      border-radius:28px;
      background:rgba(12,24,38,.78);
      border:1px solid rgba(255,255,255,.08);
      box-shadow:0 28px 56px rgba(1,8,15,.36);
    }
    .eyebrow{
      margin:0 0 8px;
      font-size:.72rem;
      font-weight:800;
      letter-spacing:.14em;
      text-transform:uppercase;
      color:var(--muted);
    }
    h1{margin:0 0 10px;font-size:clamp(2rem,4vw,3.6rem);line-height:1.02}
    .hero-copy{margin:0;line-height:1.7;color:var(--muted)}
    .metric-grid{display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:14px;margin-top:22px}
    .metric{
      padding:18px;
      border-radius:20px;
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.08);
    }
    .metric strong{display:block;font-size:1.45rem;margin-bottom:6px}
    .stage-shell{
      display:grid;
      gap:14px;
      padding:18px;
      border-radius:24px;
      background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
      border:1px solid rgba(255,255,255,.08);
    }
    .stage-topbar,.stage-footer,.meta-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      flex-wrap:wrap;
    }
    .stage-title{margin:0;font-size:1.15rem}
    .progress{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
    .progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent-2));box-shadow:0 0 22px rgba(86,240,195,.35);transition:width .42s ease;position:relative;overflow:hidden}
    .progress span::after{content:"";position:absolute;inset:0 auto 0 -22%;width:24%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent);transform:skewX(-22deg);animation:energySweep 2.8s linear infinite}
    .stage{
      position:relative;
      min-height:min(62vw,520px);
      border-radius:26px;
      overflow:hidden;
      background:linear-gradient(135deg,#102031,#0a1624);
      border:1px solid rgba(255,255,255,.08);
      aspect-ratio:16 / 10;
    }
    .noise,.orb,.particle,.beam,.streak,.stage-flash,.stage-sweep,.stage-grid,.offer-burst,.metric-float,.steam,.heat-layer{position:absolute;pointer-events:none}
    .noise{inset:0;background:linear-gradient(135deg,transparent,rgba(255,255,255,.04) 42%,transparent 62%)}
    .stage-flash{inset:-8%;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.18),transparent 42%);mix-blend-mode:screen;animation:stageFlash 3.8s ease-in-out infinite}
    .beam{width:42%;height:72%;top:-12%;border-radius:999px;filter:blur(42px);opacity:.22;mix-blend-mode:screen;background:radial-gradient(circle,var(--accent-2),transparent 70%);animation:floatOrb 7.4s ease-in-out infinite}
    .beam.a{left:-8%;transform:rotate(-12deg)}
    .beam.b{right:-12%;top:18%;background:radial-gradient(circle,var(--accent),transparent 70%);animation-delay:1s}
    .streak{width:34%;height:1px;opacity:.5;background:linear-gradient(90deg,transparent,rgba(255,255,255,.82),transparent);filter:blur(1px);transform:rotate(-18deg);animation:streakSweep 4.6s ease-in-out infinite}
    .streak.a{left:-10%;top:26%}
    .streak.b{right:-8%;top:66%;animation-delay:1.1s}
    .orb{border-radius:999px;filter:blur(28px);opacity:.48;animation:floatOrb 4.8s ease-in-out infinite}
    .orb.a{width:220px;height:220px;right:-36px;top:-24px;background:var(--accent-3)}
    .orb.b{width:180px;height:180px;left:40%;bottom:-40px;background:var(--accent-2);animation-delay:.9s}
    .particle{border-radius:999px;background:rgba(255,255,255,.28)}
    .particle.a{width:8px;height:8px;left:58%;top:16%;animation:particleDrift 5s linear infinite}
    .particle.b{width:12px;height:12px;left:72%;top:58%;animation:particleDrift 5.8s linear infinite .8s}
    .particle.c{width:6px;height:6px;left:36%;top:34%;animation:particleDrift 4.6s linear infinite 1.1s}
    .stage-grid{inset:0;opacity:.14;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,.95));animation:gridDrift 12s linear infinite}
    .stage-sweep{inset:-10% auto -10% -28%;width:38%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transform:skewX(-20deg);opacity:0;animation:sceneSweep 3.8s ease-in-out infinite}
    .heat-layer{inset:auto 0 -8% 0;height:44%;opacity:0;background:radial-gradient(circle at 50% 100%,rgba(255,171,82,.22),transparent 46%),repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 2px,transparent 2px 18px);filter:blur(12px);animation:heatShimmer 4.4s ease-in-out infinite}
    .offer-burst{top:20px;right:20px;z-index:2;padding:10px 14px;border-radius:999px;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 36px rgba(3,9,18,.22);color:#fef6dc;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;transform-origin:center;animation:offerPulse 2.8s ease-in-out infinite}
    .metric-float{z-index:2;display:grid;gap:2px;padding:10px 12px;border-radius:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.09);box-shadow:0 16px 34px rgba(3,9,18,.18);backdrop-filter:blur(16px);animation:metricFloat 4.2s ease-in-out infinite}
    .metric-float strong{font-size:.94rem}
    .metric-float span{font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;color:#cbd9ee}
    .metric-float.a{top:18%;right:16%;animation-delay:.2s}
    .metric-float.b{bottom:16%;left:16%;animation-delay:1.1s}
    .steam{width:44px;height:110px;border:1px solid rgba(255,255,255,.12);border-color:rgba(255,255,255,.18) transparent transparent transparent;border-radius:999px;opacity:0;filter:blur(1px);animation:steamRise 4.8s ease-in-out infinite}
    .steam.a{bottom:30%;right:19%}
    .steam.b{bottom:34%;right:24%;animation-delay:.8s}
    .scene{
      position:absolute;
      inset:0;
      display:grid;
      grid-template-columns:minmax(0,1.15fr) minmax(180px,.85fr);
      align-items:end;
      gap:24px;
      padding:28px;
      opacity:0;
      transform:scale(.98);
      transition:opacity .42s ease,transform .42s ease;
      background:radial-gradient(circle at 18% 18%,rgba(255,255,255,.1),transparent 24%),linear-gradient(135deg,var(--scene-bg),var(--bg));
    }
    .scene.active{opacity:1;transform:scale(1)}
    .copy,.visual{position:relative;z-index:2}
    .copy{display:grid;gap:14px;align-content:end;animation:copyParallax 3.8s ease-in-out infinite}
    .kicker{font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#d6e3f6}
    .headline{margin:0;max-width:560px;font-size:clamp(2rem,4vw,4rem);line-height:1.02;animation:headlineReveal .9s cubic-bezier(.2,.8,.2,1)}
    .subheadline{margin:0;max-width:520px;font-size:clamp(1rem,2vw,1.18rem);line-height:1.65;color:#d6e3f6;animation:textFade .9s ease}
    .cta-row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .cta{
      border:0;
      border-radius:999px;
      padding:13px 20px;
      background:linear-gradient(135deg,var(--accent),var(--accent-2));
      color:#04111b;
      font-weight:800;
      box-shadow:0 18px 36px rgba(4,10,20,.28);
      position:relative;
      overflow:hidden;
      animation:ctaPulse 1.8s ease-in-out infinite;
    }
    .cta::after{content:"";position:absolute;inset:-40% auto -40% -24%;width:42%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.56),transparent);transform:skewX(-22deg);opacity:.7;animation:ctaSweep 2.8s ease-in-out infinite}
    .tags{display:flex;gap:8px;flex-wrap:wrap}
    .tag{
      display:inline-flex;
      padding:7px 10px;
      border-radius:999px;
      background:rgba(255,255,255,.08);
      color:var(--muted);
      font-size:.78rem;
    }
    .visual{display:grid;place-items:center}
    .asset-card,.asset-fallback{
      animation:floatCard 3.8s ease-in-out infinite;
      box-shadow:0 20px 46px rgba(4,10,20,.28);
    }
    .asset-card{
      padding:12px;
      border-radius:30px;
      background:rgba(255,255,255,.08);
      backdrop-filter:blur(18px);
    }
    .asset-card img{display:block;max-width:min(240px,32vw);max-height:min(240px,32vw);border-radius:24px;object-fit:cover}
    .asset-fallback{
      width:min(240px,32vw);
      aspect-ratio:1;
      display:grid;
      place-items:center;
      border-radius:36px;
      background:linear-gradient(135deg,var(--accent),var(--accent-2));
      color:#07111b;
      font-size:clamp(2.2rem,6vw,4rem);
      font-weight:900;
      letter-spacing:.06em;
    }
    .scene-tabs{display:flex;gap:10px;flex-wrap:wrap;max-width:100%}
    .scene-pill{
      border:1px solid rgba(255,255,255,.08);
      background:rgba(255,255,255,.04);
      color:var(--text);
      border-radius:999px;
      padding:10px 14px;
      display:inline-flex;
      align-items:center;
      gap:8px;
      cursor:pointer;
      max-width:100%;
      transition:all .22s ease;
    }
    .scene-pill.active{background:rgba(86,240,195,.1);border-color:rgba(86,240,195,.58);box-shadow:0 0 0 1px rgba(86,240,195,.14)}
    .scene-pill small{color:var(--muted)}
    .scene-glyph{
      width:24px;height:24px;border-radius:999px;
      display:grid;place-items:center;background:rgba(255,255,255,.08);font-size:.72rem;text-transform:uppercase;
    }
    .report{
      display:grid;
      grid-template-columns:1fr minmax(300px,420px);
      gap:18px;
    }
    .card{
      padding:20px;
      border-radius:22px;
      background:rgba(12,24,38,.74);
      border:1px solid rgba(255,255,255,.08);
    }
    .scene-list{display:grid;gap:12px}
    .scene-row{
      padding:14px 16px;
      border-radius:18px;
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.06);
    }
    .scene-row strong{display:block;margin-bottom:6px}
    pre{
      margin:0;
      white-space:pre-wrap;
      word-break:break-word;
      font-size:.84rem;
      line-height:1.55;
      color:#d8e5f5;
    }
    .scene[data-animation="zoom"] .headline{animation:zoomHeadline .72s ease}
    .scene[data-animation="pulse"] .cta{animation:ctaPulse 1.4s ease-in-out infinite}
    .scene[data-animation="fade"] .copy{animation:textFade 1s ease}
    .stage.industry-restaurants{background:linear-gradient(135deg,#24110d,#432218)}
    .stage.industry-restaurants .heat-layer{opacity:.9}
    .stage.industry-restaurants .offer-burst{background:linear-gradient(135deg,rgba(255,187,120,.24),rgba(255,118,58,.18));color:#fff1cf}
    .stage.industry-saas,.stage.industry-ai-tools{background:linear-gradient(135deg,#071422,#0f2338)}
    .stage.industry-saas .stage-grid,.stage.industry-ai-tools .stage-grid{opacity:.28}
    .stage.industry-saas .beam,.stage.industry-ai-tools .beam{opacity:.28}
    .stage.style-luxury,.stage.industry-hotels,.stage.industry-fashion{background:linear-gradient(135deg,#0b1118,#171109)}
    .stage.style-luxury .stage-grid,.stage.industry-hotels .stage-grid,.stage.industry-fashion .stage-grid{opacity:.08}
    .stage.style-luxury .beam,.stage.industry-hotels .beam,.stage.industry-fashion .beam{opacity:.28;animation-duration:9.6s}
    .stage.industry-ecommerce .offer-burst{background:linear-gradient(135deg,rgba(255,104,104,.2),rgba(255,183,77,.22))}
    @keyframes floatOrb{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-18px) translateX(10px)}}
    @keyframes particleDrift{0%{transform:translateY(18px);opacity:0}18%{opacity:.8}100%{transform:translateY(-42px);opacity:0}}
    @keyframes textRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes textFade{from{opacity:0}to{opacity:1}}
    @keyframes ctaPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
    @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes zoomHeadline{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
    @keyframes energySweep{0%{transform:translateX(-12%)}100%{transform:translateX(12%)}}
    @keyframes streakSweep{0%,100%{transform:translateX(0) rotate(-18deg);opacity:.14}45%{opacity:.72}50%{transform:translateX(42px) rotate(-18deg);opacity:.3}}
    @keyframes stageFlash{0%,76%,100%{opacity:0}10%{opacity:.22}18%{opacity:0}}
    @keyframes sceneSweep{0%,100%{transform:translateX(0) skewX(-20deg);opacity:0}18%{opacity:.42}34%{transform:translateX(240%) skewX(-20deg);opacity:0}}
    @keyframes heatShimmer{0%,100%{transform:translateY(0) scaleY(1);opacity:.24}50%{transform:translateY(-6px) scaleY(1.08);opacity:.52}}
    @keyframes metricFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes ctaSweep{0%,100%{transform:translateX(0) skewX(-22deg);opacity:0}24%{opacity:.7}50%{transform:translateX(240%) skewX(-22deg);opacity:0}}
    @keyframes copyParallax{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes headlineReveal{0%{opacity:0;transform:translateY(20px) scale(.97);letter-spacing:-.08em}100%{opacity:1;transform:translateY(0) scale(1);letter-spacing:0}}
    @keyframes gridDrift{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-28px,28px,0)}}
    @keyframes offerPulse{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.05) rotate(-1deg)}}
    @keyframes steamRise{0%{transform:translateY(18px) scale(.86);opacity:0}40%{opacity:.42}100%{transform:translateY(-42px) scale(1.08);opacity:0}}
    @media (max-width:980px){
      .hero,.report,.scene{grid-template-columns:1fr}
      .shell{padding:16px}
      .stage{min-height:420px}
    }
    @media (max-width:720px){
      .metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .scene{padding:20px}
      .asset-card img,.asset-fallback{max-width:100%;width:min(220px,58vw)}
      .scene-pill{flex:1 1 calc(50% - 10px);justify-content:space-between}
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <section aria-label="Campaign summary">
        <p class="eyebrow">Corelytic MotionAds Studio Export</p>
        <h1>${safeProjectName}</h1>
        <p class="hero-copy">${safeSummary}</p>
        <div class="metric-grid">
          <div class="metric"><strong>${safeSize}</strong><span>Platform Size</span></div>
          <div class="metric"><strong>${escapeHtml(project.scenes.length)}</strong><span>Scenes</span></div>
          <div class="metric"><strong>${escapeHtml(project.totalDuration.toFixed(1))}s</strong><span>Total Duration</span></div>
          <div class="metric"><strong>${safeVariation}</strong><span>Variation</span></div>
        </div>
        <section class="card" style="margin-top:18px;padding:18px 20px">
          <p class="eyebrow">Primary Call To Action</p>
          <h2 style="margin:0 0 8px;font-size:1.2rem">${safeCta}</h2>
          <p class="hero-copy" style="margin:0">${safeOffer}</p>
        </section>
      </section>
      <section class="stage-shell" aria-label="Animated campaign preview">
        <div class="stage-topbar">
          <div>
            <p class="eyebrow">Branded Animated Preview</p>
            <h2 class="stage-title" id="stageTitle">Loading scene...</h2>
          </div>
          <div class="meta-row">
            <span class="tag">${safeGoal}</span>
            <span class="tag">${safePlatform}</span>
          </div>
        </div>
        <div class="progress"><span id="progressBar"></span></div>
        <section class="stage industry-${industryKey} style-${styleKey}" id="stage">
          <div class="noise"></div>
          <div class="stage-flash"></div>
          <div class="beam a"></div>
          <div class="beam b"></div>
          <div class="streak a"></div>
          <div class="streak b"></div>
          <div class="orb a"></div>
          <div class="orb b"></div>
          <div class="particle a"></div>
          <div class="particle b"></div>
          <div class="particle c"></div>
          <div class="stage-grid"></div>
          <div class="heat-layer"></div>
          <div class="stage-sweep"></div>
          <div class="offer-burst">${safeOffer}</div>
          <div class="metric-float a"><strong>+24%</strong><span>CTR lift</span></div>
          <div class="metric-float b"><strong>${escapeHtml(project.scenes.length)}</strong><span>scene flow</span></div>
        </section>
        <div class="stage-footer">
          <div class="scene-tabs" id="sceneTabs">${scenesMarkup}</div>
          <span class="tag" id="statusTag">Auto-playing</span>
        </div>
      </section>
    </section>
    <section class="report">
      <article class="card" aria-label="Scene structure">
        <p class="eyebrow">Scenes</p>
        <div class="scene-list">
          ${project.scenes.map((scene, index) => `
            <div class="scene-row">
              <strong>${index + 1}. ${escapeHtml(scene.name)}</strong>
              <div class="meta-row">
                <span class="tag">${escapeHtml(scene.animationType)}</span>
                <span class="tag">${escapeHtml(scene.duration.toFixed(1))}s</span>
                <span class="tag">${escapeHtml(scene.type)}</span>
              </div>
            </div>`).join("")}
        </div>
      </article>
      <article class="card" aria-label="Embedded campaign data">
        <p class="eyebrow">Campaign Data</p>
        <pre>${payloadText}</pre>
      </article>
    </section>
  </main>
  <script>
    const project = ${JSON.stringify(payload)};
    const stage = document.getElementById("stage");
    const stageTitle = document.getElementById("stageTitle");
    const progressBar = document.getElementById("progressBar");
    const statusTag = document.getElementById("statusTag");
    const sceneTabs = Array.from(document.querySelectorAll(".scene-pill"));
    let activeIndex = 0;
    let timer = null;

    function animationGlyph(name) {
      return ({ rise:"Rise", zoom:"Zoom", pulse:"Pulse", flash:"Flash", fade:"Fade" })[name] || "Motion";
    }

    function buildScene(scene, index) {
      const wrapper = document.createElement("section");
      wrapper.className = "scene" + (index === 0 ? " active" : "");
      wrapper.dataset.index = String(index);
      wrapper.dataset.animation = scene.animationType || "rise";
      wrapper.style.setProperty("--scene-bg", scene.background || "#12263c");
      const imageMarkup = scene.image
        ? '<div class="asset-card"><img alt="Campaign asset" src="' + scene.image + '"></div>'
        : '<div class="asset-fallback">' + (project.brandKit.logoText || project.brandKit.brandName.slice(0, 2) || "CM") + '</div>';
      wrapper.innerHTML = '<div class="copy">' +
        '<span class="kicker">' + ${JSON.stringify((project.industry || "").toUpperCase())} + ' • ' + project.platform + '</span>' +
        '<h3 class="headline">' + scene.headline + '</h3>' +
        '<p class="subheadline">' + (scene.subheadline || scene.body || "Motion scene") + '</p>' +
        '<div class="cta-row"><button class="cta">' + scene.cta + '</button><div class="tags"><span class="tag">' + animationGlyph(scene.animationType) + '</span><span class="tag">' + scene.duration.toFixed(1) + 's</span></div></div>' +
      '</div><div class="visual"><div class="steam a"></div><div class="steam b"></div>' + imageMarkup + '</div>';
      return wrapper;
    }

    project.scenes.forEach((scene, index) => stage.appendChild(buildScene(scene, index)));
    const sceneNodes = Array.from(stage.querySelectorAll(".scene"));

    function setScene(index) {
      activeIndex = index;
      const scene = project.scenes[index];
      stageTitle.textContent = scene.name + " • " + animationGlyph(scene.animationType);
      progressBar.style.width = ((index + 1) / project.scenes.length) * 100 + "%";
      sceneNodes.forEach((node, nodeIndex) => node.classList.toggle("active", nodeIndex === index));
      sceneTabs.forEach((tab, tabIndex) => tab.classList.toggle("active", tabIndex === index));
    }

    function startAuto() {
      clearInterval(timer);
      statusTag.textContent = "Auto-playing";
      timer = setInterval(() => {
        setScene((activeIndex + 1) % project.scenes.length);
      }, 2600);
    }

    sceneTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const index = Number(tab.dataset.sceneIndex || 0);
        setScene(index);
        startAuto();
      });
    });

    setScene(0);
    startAuto();
  ${"</scr" + "ipt>"}
</body>
</html>`;
}

function buildCampaignReport(project, analytics) {
  const recommendedNextAction = project.recommendedNextAction || "Review the animated preview and export when the pacing feels right.";
  const hookLine = project.headline || project.scenes?.[0]?.headline || "Generated hook available in the scene stack.";
  return [
    `Corelytic MotionAds Studio Campaign Report`,
    ``,
    `Export Date: ${new Date().toLocaleString()}`,
    ``,
    `Campaign: ${project.name}`,
    `Industry: ${project.industry}`,
    `Goal: ${project.goal}`,
    `Platform: ${project.platform}`,
    `Variation: ${project.variation}`,
    `Scenes: ${project.scenes.length}`,
    `Total Duration: ${project.totalDuration.toFixed(1)}s`,
    `Conversion Score: ${analytics.total}/100`,
    `Summary: ${analytics.summary}`,
    ``,
    `Recommended Next Action: ${recommendedNextAction}`,
    `Offer: ${project.offer}`,
    `Primary CTA: ${project.cta}`,
    `Hook: ${hookLine}`,
    ``,
    `Motion Recipe: ${project.motionRecipe.summary}`,
    `Transitions: ${project.motionRecipe.transitions.join(", ")}`,
    `Overlays: ${project.motionRecipe.overlays.join(", ")}`,
    ``,
    `Scene Breakdown:`,
    ...project.scenes.map((scene, index) => `${index + 1}. ${scene.name} | ${scene.duration.toFixed(1)}s | ${scene.animationType} | ${scene.headline}`),
    ``,
    `Analyzer Scores:`,
    ...analytics.metrics.map((item) => `- ${item.label}: ${item.value}/100 | ${item.reason}`),
    ``,
    `Improvement Suggestions:`,
    ...(analytics.suggestions.length ? analytics.suggestions.map((item) => `- ${item}`) : ["- None at the moment"]),
    ``,
    `Variation Notes:`,
    `- Current variation: ${project.variation}`,
    `- Available engine variations: Aggressive, Luxury, Emotional, Minimal, High Energy`
  ].join("\n");
}

function exportStandaloneHtml(project) {
  download(buildStandaloneHtml(project), `${slug(project)}-animated-export.html`, "text/html");
  return "HTML animated export downloaded";
}

function exportProjectJson(project) {
  download(JSON.stringify(project, null, 2), `${slug(project)}.json`, "application/json");
  return "JSON backup exported";
}

function exportCampaignReport(project, analytics) {
  download(buildCampaignReport(project, analytics), `${slug(project)}-campaign-report.txt`, "text/plain");
  return "Campaign report downloaded";
}

function exportPreviewPng(project, renderScene, stage) {
  const heroScene = project.scenes[0];
  renderScene?.(heroScene);
  const canvasData = stage?.toDataURL({ pixelRatio: 1.5 });
  if (!canvasData) return "Preview export unavailable";
  const link = document.createElement("a");
  link.href = canvasData;
  link.download = `${slug(project)}-frame-preview.png`;
  link.click();
  return "Frame preview PNG downloaded";
}

window.CorelyticExporter = {
  buildStandaloneHtml,
  buildCampaignReport,
  exportStandaloneHtml,
  exportProjectJson,
  exportCampaignReport,
  exportPreviewPng
};
