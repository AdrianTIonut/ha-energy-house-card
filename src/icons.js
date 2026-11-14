// src/icons.js — iconițe SVG (viewBox 32×32, doar căi, stroke) folosite de card și de diagrama de flux.
// Fără biblioteci. Culoarea o dă cel care desenează (stroke).
export const ICON_SOLAR =
  '<circle cx="12" cy="8" r="3.5"/>' +
  '<path d="M12 1.5v2M12 12.5v2M5.5 8h2M16.5 8h2M7.4 3.4l1.4 1.4M16.6 3.4l-1.4 1.4M7.4 12.6l1.4-1.4M16.6 12.6l-1.4-1.4"/>' +
  '<path d="M5 29l4-11h20l-4 11z"/>' +
  '<path d="M7 23.5h20M15 18l-2 11M22 18l-2 11"/>';
export const ICON_RETEA =
  '<path d="M16 2v3M13 5h6"/>' +
  '<path d="M14 5 9.5 30M18 5l4.5 25"/>' +
  '<path d="M6 11h20M8.5 18h15"/>' +
  '<path d="M11.2 18l9.6-7M20.8 18l-9.6-7M10.2 25l11.6-7M21.8 25 10.2 18"/>';
export const ICON_BATERIE =
  '<rect x="8" y="6" width="16" height="23" rx="2.5"/>' +
  '<path d="M13 6V3h6v3"/>' +
  '<path d="M12 12h8M12 17h8M12 22h8"/>';
export const ICON_CASA =
  '<path d="M3 16 16 5l13 11"/>' +
  '<path d="M7 14v15h18V14"/>' +
  '<path d="M13 29v-9h6v9"/>';
export const ICON_PISCINA =
  '<path d="M10 4v13M20 4v13M10 8h10M10 13h10"/>' +
  '<path d="M3 21c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>' +
  '<path d="M3 27c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>';
export const ICON_HALA =
  '<path d="M3 28V13l8 5v-5l8 5V8h5v20z"/>' +
  '<path d="M8 23h3M15 23h3M22 23h2"/>';
export const ICON_PRIZA =
  '<path d="M11 3v6M21 3v6"/>' +
  '<path d="M7 9h18v4a9 9 0 0 1-18 0z"/>' +
  '<path d="M16 22v7"/>';
export const ICON_MASINA =
  '<path d="M4 19l2.5-7h19L28 19"/>' +
  '<rect x="3" y="19" width="26" height="6" rx="2"/>' +
  '<path d="M8 25v3M24 25v3M8 22h.01M24 22h.01"/>';
export const ICON_SPALAT =
  '<rect x="6" y="3" width="20" height="26" rx="2.5"/>' +
  '<circle cx="16" cy="18" r="6"/>' +
  '<path d="M6 9h20M10 6h.01M14 6h.01"/>';
export const ICON_AER =
  '<path d="M16 3v26M5 9.5l22 13M5 22.5l22-13"/>' +
  '<path d="M12 5l4 3 4-3M12 27l4-3 4 3"/>';
export const ICON_FRUNZA =
  '<path d="M6 26C6 12 14 6 27 5c0 13-6 21-19 21z"/>' +
  '<path d="M6 26 18 14"/>';
export const ICON_MONEDE =
  '<ellipse cx="16" cy="8" rx="9" ry="4"/>' +
  '<path d="M7 8v6c0 2.2 4 4 9 4s9-1.8 9-4V8M7 14v6c0 2.2 4 4 9 4s9-1.8 9-4v-6"/>';
export const ICON_SOARE =
  '<circle cx="16" cy="16" r="5"/>' +
  '<path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8"/>';

/** Iconiță potrivită după numele unei surse/destinații (fără diacritice, litere mici). */
export function iconForName(name) {
  const n = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.startsWith('solar')) return ICON_SOLAR;
  if (n.startsWith('retea') || n.includes('grid')) return ICON_RETEA;
  if (n.startsWith('baterie') || n.includes('batt')) return ICON_BATERIE;
  if (n.startsWith('casa')) return ICON_CASA;
  if (n.includes('pisc')) return ICON_PISCINA;
  if (n.includes('hal')) return ICON_HALA;
  if (n.includes('spal') || n.includes('masina de s')) return ICON_SPALAT;
  if (n.includes('masina') || n.includes('auto') || /\bev\b/.test(n) || n.includes('incarc')) return ICON_MASINA;
  if (n.includes('aer') || n.includes('clima') || /\bac\b/.test(n)) return ICON_AER;
  return ICON_PRIZA;
}

// ---- iconițe suplimentare (fluxul compact, fără nume: iconița spune ce este) ----
export const ICON_SERVER =
  '<rect x="5" y="5" width="22" height="9" rx="1.5"/><rect x="5" y="18" width="22" height="9" rx="1.5"/>' +
  '<path d="M9 9.5h.01M9 22.5h.01M14 9.5h9M14 22.5h9"/>';
export const ICON_CALDURA =
  '<rect x="4" y="5" width="24" height="22" rx="2"/><circle cx="16" cy="16" r="6"/>' +
  '<path d="M16 10v12M10 16h12"/>';
export const ICON_BEC =
  '<path d="M16 3a8 8 0 0 0-5 14.2V21h10v-3.8A8 8 0 0 0 16 3z"/><path d="M12 25h8M13.5 29h5"/>';
export const ICON_TV =
  '<rect x="4" y="6" width="24" height="17" rx="2"/><path d="M11 27h10M16 23v4"/>';
export const ICON_FRIGIDER =
  '<rect x="8" y="3" width="16" height="26" rx="2"/><path d="M8 14h16M12 8v3M12 18v5"/>';
export const ICON_BOILER =
  '<rect x="9" y="4" width="14" height="24" rx="3"/><path d="M9 9h14M13 15h6M13 20h6"/>';
export const ICON_VENTILATOR =
  '<circle cx="16" cy="16" r="2"/>' +
  '<path d="M16 14c-1-6 3-9 5-7s0 6-5 7M18 16c6-1 9 3 7 5s-6 0-7-5M16 18c1 6-3 9-5 7s0-6 5-7M14 16c-6 1-9-3-7-5s6 0 7 5"/>';
export const ICON_FULGER = '<path d="M18 3 7 18h8l-2 11 12-16h-8z"/>';
export const ICON_ALTELE = '<circle cx="7" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="25" cy="16" r="2"/>';

const MDI_ICONS = {
  'mdi:pool': ICON_PISCINA, 'mdi:ev-station': ICON_MASINA, 'mdi:car-electric': ICON_MASINA, 'mdi:car': ICON_MASINA,
  'mdi:washing-machine': ICON_SPALAT, 'mdi:tumble-dryer': ICON_SPALAT,
  'mdi:air-conditioner': ICON_AER, 'mdi:snowflake': ICON_AER,
  'mdi:server': ICON_SERVER, 'mdi:server-network': ICON_SERVER, 'mdi:desktop-tower': ICON_SERVER,
  'mdi:heat-pump': ICON_CALDURA, 'mdi:radiator': ICON_CALDURA,
  'mdi:factory': ICON_HALA, 'mdi:warehouse': ICON_HALA,
  'mdi:lightbulb': ICON_BEC, 'mdi:lightbulb-outline': ICON_BEC, 'mdi:lamp': ICON_BEC,
  'mdi:television': ICON_TV, 'mdi:fridge': ICON_FRIGIDER, 'mdi:fridge-outline': ICON_FRIGIDER,
  'mdi:water-boiler': ICON_BOILER, 'mdi:water-heater': ICON_BOILER,
  'mdi:fan': ICON_VENTILATOR, 'mdi:home': ICON_CASA, 'mdi:home-outline': ICON_CASA, 'mdi:flash': ICON_FULGER,
};
/** Iconița SVG potrivită unui nume `mdi:...` din config; null dacă nu o avem. */
export function iconForMdi(mdi) {
  return MDI_ICONS[String(mdi || '').toLowerCase()] || null;
}
// producția pe zi: panou solar cu fulger
export const ICON_PROD =
  '<path d="M3 29l4-10h22l-4 10z"/><path d="M5.5 24h21M13 19l-2 10M20 19l-2 10"/>' +
  '<path d="M11 2 5 12h5l-1.5 7 7-10h-5z"/>';
