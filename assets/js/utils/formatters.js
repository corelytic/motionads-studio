function formatSeconds(value) {
  return `${value.toFixed(1)}s`;
}

function friendlyDate(value) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleString();
}

function titleize(value) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

window.CorelyticFormatters = { formatSeconds, friendlyDate, titleize };
