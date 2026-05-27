function createRouter(onRouteChange) {
  const getRoute = () => (location.hash.replace("#", "") || "dashboard");
  const handle = () => onRouteChange(getRoute());
  window.addEventListener("hashchange", handle);
  handle();
  return { current: getRoute, dispose() { window.removeEventListener("hashchange", handle); } };
}

window.CorelyticRouter = { createRouter };
