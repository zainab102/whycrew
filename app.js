// Bump version when defaults change materially (prevents stale UI state like Extras toggles).
const STORAGE_KEY = "whycrew_certificate_v2";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function setText(el, value) {
  el.textContent = value ?? "";
}

function normalizeMultiline(text) {
  return (text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function readEditable(el) {
  return normalizeMultiline(el.textContent);
}

function setEditable(el, value) {
  setText(el, value);
}

function setLogoDataUrl(dataUrl) {
  const logo = $("logoImg");
  if (!dataUrl) {
    logo.removeAttribute("src");
    logo.style.display = "none";
    return;
  }
  logo.src = dataUrl;
  logo.style.display = "block";
}

function applyTheme(theme) {
  const page = $("page");
  page.classList.remove(
    "theme--dark-gold",
    "theme--white",
    "theme--ivory",
    "theme--blush",
    "theme--mint",
    "theme--slate",
    "theme--midnight",
    "theme--emerald",
    "theme--plum",
  );
  page.classList.add(`theme--${theme}`);

  const logo = $("logoImg");
  const lightThemes = new Set(["white", "ivory", "blush", "mint", "slate"]);
  if (lightThemes.has(theme)) logo.classList.add("logo--invert");
  else logo.classList.remove("logo--invert");
}

function applyTemplateSize(size) {
  const page = $("page");
  page.classList.remove(
    "size--original",
    "size--framed-sm",
    "size--framed-md",
    "size--framed-lg",
    "size--full",
  );
  if (size === "full") page.classList.add("size--full");
  else if (size === "original") page.classList.add("size--original");
  else if (size === "framed-sm") page.classList.add("size--framed-sm");
  else if (size === "framed-lg") page.classList.add("size--framed-lg");
  else page.classList.add("size--framed-md");
}

function applyDensity(density) {
  const page = $("page");
  page.classList.remove("density--compact", "density--balanced", "density--airy");
  page.classList.add(`density--${density}`);
}

function applyOrientation(orientation) {
  const page = $("page");
  page.classList.toggle("orient--portrait", orientation !== "landscape");
  page.classList.toggle("orient--landscape", orientation === "landscape");
  syncPrintPageStyle(orientation);
}

function syncPrintPageStyle(orientation) {
  let styleEl = document.getElementById("printPageStyle");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "printPageStyle";
    document.head.appendChild(styleEl);
  }
  // @page rules can't be reliably scoped by class, so we set it dynamically.
  styleEl.textContent =
    orientation === "landscape"
      ? "@media print { @page { size: A4 landscape; margin: 0; } }"
      : "@media print { @page { size: A4 portrait; margin: 0; } }";
}

function applyExtras(enabled, placement) {
  const extras = $("extrasView");
  extras.classList.toggle("is-visible", Boolean(enabled));
  extras.classList.remove("extras--below-body", "extras--above-footer", "extras--top-right");
  extras.classList.add(`extras--${placement}`);
  extras.setAttribute("contenteditable", enabled ? "true" : "false");
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function getLayoutKey(state) {
  // Keep layout independent for portrait/landscape + template size.
  // Density/theme should not affect layout coordinates.
  return `${state.orientation || "portrait"}:${state.templateSize || "original"}`;
}

function boot() {
  const defaults = {
    theme: "dark-gold",
    templateSize: "original",
    density: "balanced",
    orientation: "portrait",
    extrasEnabled: false,
    extrasPlacement: "below-body",
    extrasText: "",
    layoutMode: false,
    layoutPositions: {},
    companyName: "WHYCREW",
    titleLine: "Employee\nof the Month",
    recipientName: "Haider Abbas",
    subline: "TOP KPI PERFORMER ● MARCH 2026",
    bodyText:
      "In recognition of outstanding performance, exceptional dedication,\n" +
      "and remarkable contributions to the growth and success of WhyCrew.\n" +
      "Your results this month stand as a benchmark of excellence.",
    monthPill: "MARCH 2026",
    badgeText: "KPI\nAWARD",
    signatureName: "YASIR ABBAS",
    issueDate: "23 APR 2026",
    logoDataUrl: "",
  };

  const state = { ...defaults, ...(loadState() ?? {}) };
  if (!String(state.theme || "").trim()) state.theme = defaults.theme;
  if (!String(state.templateSize || "").trim()) state.templateSize = defaults.templateSize;
  if (!String(state.density || "").trim()) state.density = defaults.density;
  if (!String(state.orientation || "").trim()) state.orientation = defaults.orientation;
  if (!String(state.extrasPlacement || "").trim()) state.extrasPlacement = defaults.extrasPlacement;

  const theme = $("theme");
  const templateSize = $("templateSize");
  const density = $("density");
  const orientation = $("orientation");
  const layoutMode = $("layoutMode");
  const resetLayout = $("resetLayout");
  const logoFile = $("logoFile");
  const clearLogo = $("clearLogo");
  const exportPdf = $("exportPdf");
  const reset = $("reset");

  const companyName = $("companyName");
  const titleLine = $("titleLine");
  const recipientName = $("recipientName");
  const subline = $("subline");
  const bodyText = $("bodyText");
  const badgeText = $("badgeText");
  const signatureName = $("signatureName");
  const issueDate = $("issueDate");
  const extrasEnabled = $("extrasEnabled");
  const extrasPlacement = $("extrasPlacement");
  const extrasText = $("extrasText");

  const companyNameView = $("companyNameView");
  const titleLineView = $("titleLineView");
  const recipientNameView = $("recipientNameView");
  const sublineView = $("sublineView");
  const bodyTextView = $("bodyTextView");
  const monthPill = $("monthPill");
  const badgeTextView = $("badgeTextView");
  const extrasView = $("extrasView");
  const signatureNameView = $("signatureNameView");
  const issueDateView = $("issueDateView");
  const paper = document.querySelector("#page .paper");
  if (!paper) throw new Error("Missing .paper");

  // Reconcile extras from persisted textarea + the preview DOM (contenteditable can drift).
  const extrasFromView = normalizeMultiline(readEditable(extrasView));
  const extrasFromInput = normalizeMultiline(state.extrasText || "");
  if (state.extrasEnabled) {
    state.extrasText = extrasFromInput || extrasFromView;
  } else {
    state.extrasText = extrasFromInput;
  }

  // Prevent "ghost enabled" extras (enabled but no meaningful text) which can break layout.
  if (state.extrasEnabled && !normalizeMultiline(state.extrasText || "")) {
    state.extrasEnabled = false;
    state.extrasText = "";
    state.extrasPlacement = defaults.extrasPlacement;
  }

  function getLayoutPositionsMap() {
    const key = getLayoutKey(state);
    const root = (state.layoutPositions && typeof state.layoutPositions === "object") ? state.layoutPositions : {};
    const map = root[key];
    if (map && typeof map === "object") return map;
    return {};
  }

  function setLayoutPositionsMap(nextMap) {
    const key = getLayoutKey(state);
    if (!state.layoutPositions || typeof state.layoutPositions !== "object") state.layoutPositions = {};
    state.layoutPositions[key] = nextMap;
  }

  function applyLayoutMode(enabled) {
    const page = $("page");
    page.classList.toggle("layout--on", Boolean(enabled));

    // Dragging and inline text editing fight each other; in layout mode we temporarily
    // disable contenteditable so dragging is predictable. Edits still work via the sidebar.
    const editables = page.querySelectorAll("[contenteditable]");
    editables.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const cur = el.getAttribute("contenteditable");
      if (enabled) {
        if (cur === "true") {
          el.setAttribute("data-was-editable", "true");
          el.setAttribute("contenteditable", "false");
        }
      } else {
        if (el.getAttribute("data-was-editable") === "true") {
          el.removeAttribute("data-was-editable");
          // Extras is only editable when enabled.
          if (el.id === "extrasView") el.setAttribute("contenteditable", state.extrasEnabled ? "true" : "false");
          else el.setAttribute("contenteditable", "true");
        }
      }
    });
  }

  function applyPositionsToDom() {
    const map = getLayoutPositionsMap();
    const nodes = document.querySelectorAll("#page [data-move]");
    nodes.forEach((el) => {
      const k = el.getAttribute("data-move");
      const pos = map?.[k];
      const x = pos?.x ?? 0;
      const y = pos?.y ?? 0;
      el.style.setProperty("--move-x", `${x}%`);
      el.style.setProperty("--move-y", `${y}%`);
    });
  }

  function resetAllPositions() {
    setLayoutPositionsMap({});
    applyPositionsToDom();
    persist();
  }

  function syncToView() {
    theme.value = state.theme;
    applyTheme(state.theme);
    templateSize.value = state.templateSize;
    applyTemplateSize(state.templateSize);
    density.value = state.density;
    applyDensity(state.density);
    orientation.value = state.orientation;
    applyOrientation(state.orientation);

    layoutMode.checked = Boolean(state.layoutMode);
    applyLayoutMode(state.layoutMode);
    applyPositionsToDom();

    extrasEnabled.checked = Boolean(state.extrasEnabled);
    extrasPlacement.value = state.extrasPlacement;
    extrasText.value = state.extrasText;
    setEditable(extrasView, state.extrasText);
    applyExtras(state.extrasEnabled, state.extrasPlacement);
    extrasPlacement.disabled = !state.extrasEnabled;
    extrasText.disabled = !state.extrasEnabled;

    companyName.value = state.companyName;
    titleLine.value = state.titleLine;
    recipientName.value = state.recipientName;
    subline.value = state.subline;
    bodyText.value = state.bodyText;
    badgeText.value = state.badgeText;
    signatureName.value = state.signatureName;
    issueDate.value = state.issueDate;

    setEditable(companyNameView, state.companyName);
    setEditable(titleLineView, state.titleLine);
    setEditable(recipientNameView, state.recipientName);
    setEditable(sublineView, state.subline);
    setEditable(bodyTextView, state.bodyText);
    setEditable(monthPill, state.monthPill);
    setEditable(badgeTextView, state.badgeText);
    setEditable(signatureNameView, state.signatureName);
    setEditable(issueDateView, state.issueDate);

    setLogoDataUrl(state.logoDataUrl);
  }

  function persist() {
    saveState(state);
  }

  // Drag behavior for [data-move] elements (percent-based).
  let drag = null;
  function onPointerDown(e) {
    if (!state.layoutMode) return;
    const target = e.target?.closest?.("#page [data-move]");
    if (!target) return;
    if (!(target instanceof HTMLElement)) return;

    // Don't start drag when selecting text inside editable fields.
    const isEditable = target.getAttribute("contenteditable") === "true";
    if (isEditable) {
      const sel = window.getSelection?.();
      if (sel && !sel.isCollapsed) return;
    }

    const moveKey = target.getAttribute("data-move");
    if (!moveKey) return;

    const paperRect = paper.getBoundingClientRect();
    const elRect = target.getBoundingClientRect();
    const map = getLayoutPositionsMap();
    const start = map?.[moveKey] ?? { x: 0, y: 0 };

    drag = {
      el: target,
      key: moveKey,
      paperRect,
      startX: start.x ?? 0,
      startY: start.y ?? 0,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      elW: elRect.width,
      elH: elRect.height,
    };

    target.classList.add("is-dragging");
    target.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!drag) return;
    const dxPx = e.clientX - drag.pointerStartX;
    const dyPx = e.clientY - drag.pointerStartY;
    const dxPct = (dxPx / drag.paperRect.width) * 100;
    const dyPct = (dyPx / drag.paperRect.height) * 100;

    // Clamp so the element doesn't fully exit the page.
    const maxXPct = ((drag.paperRect.width - drag.elW) / drag.paperRect.width) * 100;
    const maxYPct = ((drag.paperRect.height - drag.elH) / drag.paperRect.height) * 100;

    const nextX = clamp(drag.startX + dxPct, -2, maxXPct + 2);
    const nextY = clamp(drag.startY + dyPct, -2, maxYPct + 2);

    drag.el.style.setProperty("--move-x", `${nextX}%`);
    drag.el.style.setProperty("--move-y", `${nextY}%`);
  }

  function onPointerUp() {
    if (!drag) return;
    const el = drag.el;
    const key = drag.key;
    const map = { ...getLayoutPositionsMap() };
    const x = parseFloat(getComputedStyle(el).getPropertyValue("--move-x")) || 0;
    const y = parseFloat(getComputedStyle(el).getPropertyValue("--move-y")) || 0;
    map[key] = { x, y };
    setLayoutPositionsMap(map);
    el.classList.remove("is-dragging");
    drag = null;
    persist();
  }

  function resetOnePosition(el) {
    const key = el.getAttribute("data-move");
    if (!key) return;
    const map = { ...getLayoutPositionsMap() };
    delete map[key];
    setLayoutPositionsMap(map);
    el.style.setProperty("--move-x", "0%");
    el.style.setProperty("--move-y", "0%");
    persist();
  }

  function wireInputText(inputEl, key, viewEl) {
    inputEl.addEventListener("input", () => {
      state[key] = normalizeMultiline(inputEl.value);
      setEditable(viewEl, state[key]);
      persist();
    });
  }

  function wireEditable(viewEl, key, inputEl) {
    const handler = () => {
      state[key] = readEditable(viewEl);
      if (inputEl) inputEl.value = state[key];
      persist();
    };
    viewEl.addEventListener("input", handler);
    viewEl.addEventListener("blur", handler);
  }

  theme.addEventListener("change", () => {
    state.theme = theme.value;
    applyTheme(state.theme);
    persist();
  });

  templateSize.addEventListener("change", () => {
    state.templateSize = templateSize.value;
    applyTemplateSize(state.templateSize);
    applyPositionsToDom();
    persist();
  });

  density.addEventListener("change", () => {
    state.density = density.value;
    applyDensity(state.density);
    persist();
  });

  orientation.addEventListener("change", () => {
    state.orientation = orientation.value;
    applyOrientation(state.orientation);
    applyPositionsToDom();
    persist();
  });

  layoutMode.addEventListener("change", () => {
    state.layoutMode = layoutMode.checked;
    applyLayoutMode(state.layoutMode);
    persist();
  });

  resetLayout.addEventListener("click", () => {
    resetAllPositions();
  });

  extrasEnabled.addEventListener("change", () => {
    state.extrasEnabled = extrasEnabled.checked;
    applyExtras(state.extrasEnabled, state.extrasPlacement);
    extrasPlacement.disabled = !state.extrasEnabled;
    extrasText.disabled = !state.extrasEnabled;
    persist();
  });

  extrasPlacement.addEventListener("change", () => {
    state.extrasPlacement = extrasPlacement.value;
    applyExtras(state.extrasEnabled, state.extrasPlacement);
    persist();
  });

  extrasText.addEventListener("input", () => {
    state.extrasText = normalizeMultiline(extrasText.value);
    setEditable(extrasView, state.extrasText);
    persist();
  });

  wireInputText(companyName, "companyName", companyNameView);
  wireInputText(titleLine, "titleLine", titleLineView);
  wireInputText(recipientName, "recipientName", recipientNameView);
  wireInputText(subline, "subline", sublineView);
  wireInputText(bodyText, "bodyText", bodyTextView);
  wireInputText(badgeText, "badgeText", badgeTextView);
  wireInputText(signatureName, "signatureName", signatureNameView);
  wireInputText(issueDate, "issueDate", issueDateView);

  wireEditable(companyNameView, "companyName", companyName);
  wireEditable(titleLineView, "titleLine", titleLine);
  wireEditable(recipientNameView, "recipientName", recipientName);
  wireEditable(sublineView, "subline", subline);
  wireEditable(bodyTextView, "bodyText", bodyText);
  wireEditable(monthPill, "monthPill", null);
  wireEditable(badgeTextView, "badgeText", badgeText);
  wireEditable(extrasView, "extrasText", extrasText);
  wireEditable(signatureNameView, "signatureName", signatureName);
  wireEditable(issueDateView, "issueDate", issueDate);

  logoFile.addEventListener("change", async () => {
    const file = logoFile.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    state.logoDataUrl = dataUrl;
    setLogoDataUrl(dataUrl);
    persist();
  });

  clearLogo.addEventListener("click", () => {
    state.logoDataUrl = "";
    logoFile.value = "";
    setLogoDataUrl("");
    persist();
  });

  exportPdf.addEventListener("click", () => {
    window.print();
  });

  reset.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, defaults);
    logoFile.value = "";
    syncToView();
    persist();
  });

  // Pointer events for dragging in layout mode.
  paper.addEventListener("pointerdown", onPointerDown);
  paper.addEventListener("pointermove", onPointerMove);
  paper.addEventListener("pointerup", onPointerUp);
  paper.addEventListener("pointercancel", onPointerUp);

  paper.addEventListener("dblclick", (e) => {
    if (!state.layoutMode) return;
    const target = e.target?.closest?.("#page [data-move]");
    if (target && target instanceof HTMLElement) resetOnePosition(target);
  });

  syncToView();
  persist();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

document.addEventListener("DOMContentLoaded", boot);

