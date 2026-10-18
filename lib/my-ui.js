/* my-ui · 可直接修改的原生组件核心
 * 目录：主题数据 → 选择/定位纯函数 → DOM 生命周期 → 基础与表单
 *       → 列表/导航 → 浮层/菜单 → Tooltip/进度/滑块 → 触摸/Popup → HTML 入口。
 * 样式统一在 my-ui.css；Vue 适配层不包含组件交互。
 */
(function () {
  "use strict";
  // 同页混用原生与 Vue 时只初始化一次。
  if (globalThis.MyUI) return;

  // ── palette.ts ──
  /** 实际渲染的明暗主题。 */
  /** 参考常见色系挑选的主色，浅色用深色值，暗色用明亮且柔和的色值。 */
  const themeColors = [
    { id: "blue", label: "蓝色", light: "#2454c6", dark: "#aac8ff" },
    { id: "indigo", label: "靛蓝", light: "#4b46b3", dark: "#bec3ff" },
    { id: "purple", label: "紫色", light: "#7040b3", dark: "#d6b6ff" },
    { id: "pink", label: "莓粉", light: "#a52461", dark: "#ffb0d0" },
    { id: "red", label: "红色", light: "#ad2939", dark: "#ffacae" },
    { id: "teal", label: "青绿", light: "#006458", dark: "#96e1d4" },
    { id: "green", label: "绿色", light: "#176737", dark: "#a4dfb4" },
    { id: "cyan", label: "湖蓝", light: "#00647f", dark: "#a0e0f1" },
    { id: "brown", label: "暖棕", light: "#795241", dark: "#e4c0ab" },
    { id: "slate", label: "蓝灰", light: "#465c73", dark: "#bfd0e5" },
    { id: "yellow", label: "暖黄", dark: "#f3db82" },
    { id: "amber", label: "琥珀", dark: "#f6ca82" },
    { id: "orange", label: "杏橙", dark: "#ffbc8c" },
    { id: "lime", label: "青柠", dark: "#cddd9b" },
  ];
  const lightLayers = {
    background: "#f2f3f5",
    cardBackground: "#ffffff",
    fill: "#f1f2f4",
    border: "#dde0e5",
    text: "#17191e",
    textSecondary: "#626874",
    gray: "#bac2ce",
    hover: "#e9ecf0",
    press: "#e0e4ea",
    selectedBackground: "#ffffff",
    selectedShadow:
      "0 1px 4px rgb(18 25 37 / .10), 0 0 0 1px rgb(18 25 37 / .05)",
    smallShadow: "0 1px 2px rgb(18 25 37 / .10)",
    shadow: "0 1px 3px rgb(18 25 37 / .045), 0 4px 12px rgb(18 25 37 / .025)",
    popupShadow:
      "0 0 0 1px rgb(18 25 37 / .07), 0 4px 12px rgb(18 25 37 / .12), 0 18px 44px -8px rgb(18 25 37 / .24)",
    modalShadow:
      "0 0 0 1px rgb(18 25 37 / .08), 0 8px 24px rgb(18 25 37 / .14), 0 32px 80px -12px rgb(18 25 37 / .30)",
    overlay: "rgb(12 18 28 / .34)",
    success: "#176b3c",
    warning: "#805500",
    danger: "#b5283c",
  };
  const darkLayers = {
    background: "#121419",
    cardBackground: "#252931",
    fill: "#333944",
    border: "#596576",
    text: "#f4f6fa",
    textSecondary: "#c4cbd6",
    gray: "#7c899c",
    hover: "#3c4350",
    press: "#464e5b",
    selectedBackground: "#414956",
    selectedShadow: "0 1px 5px rgb(0 0 0 / .28), 0 0 0 1px #68778c",
    smallShadow: "0 1px 2px rgb(0 0 0 / .32)",
    shadow: "0 1px 3px rgb(0 0 0 / .16), 0 4px 12px rgb(0 0 0 / .12)",
    popupShadow:
      "0 0 0 1px rgb(255 255 255 / .20), 0 4px 12px rgb(0 0 0 / .36), 0 20px 48px -8px rgb(0 0 0 / .70)",
    modalShadow:
      "0 0 0 1px rgb(255 255 255 / .22), 0 8px 24px rgb(0 0 0 / .44), 0 32px 80px -12px rgb(0 0 0 / .82)",
    overlay: "rgb(0 0 0 / .62)",
    success: "#a4dfb4",
    warning: "#f3db82",
    danger: "#ffacae",
  };
  /** 每组风格都提供两份独立数据，主色与界面灰阶互不影响。 */
  const themeStyles = [
    {
      id: "soft",
      label: "柔和",
      description: "自然留白，平衡层次",
      light: lightLayers,
      dark: darkLayers,
    },
    {
      id: "clear",
      label: "清晰",
      description: "更明确的边界与层次",
      light: {
        ...lightLayers,
        background: "#edf0f4",
        fill: "#edf0f5",
        border: "#ccd4df",
        text: "#101722",
        textSecondary: "#515d6e",
        gray: "#aab7c9",
        hover: "#e1e7ef",
        press: "#d4dde9",
        smallShadow: "0 1px 2px rgb(18 25 37 / .13)",
        shadow: "0 1px 2px rgb(18 25 37 / .06), 0 3px 8px rgb(18 25 37 / .035)",
        popupShadow:
          "0 0 0 1px rgb(18 25 37 / .12), 0 3px 8px rgb(18 25 37 / .14), 0 14px 32px -6px rgb(18 25 37 / .26)",
        modalShadow:
          "0 0 0 1px rgb(18 25 37 / .13), 0 6px 16px rgb(18 25 37 / .18), 0 24px 56px -8px rgb(18 25 37 / .34)",
      },
      dark: {
        ...darkLayers,
        background: "#0d1015",
        cardBackground: "#1d232d",
        fill: "#2c3543",
        border: "#64748b",
        text: "#ffffff",
        textSecondary: "#d0d8e4",
        gray: "#8192aa",
        hover: "#394454",
        press: "#434f60",
        selectedBackground: "#424f62",
        selectedShadow: "0 0 0 1px #8293ac, 0 2px 6px rgb(0 0 0 / .35)",
        smallShadow: "0 1px 2px rgb(0 0 0 / .40)",
        shadow: "0 1px 3px rgb(0 0 0 / .24), 0 3px 8px rgb(0 0 0 / .12)",
        popupShadow:
          "0 0 0 1px rgb(255 255 255 / .24), 0 3px 10px rgb(0 0 0 / .44), 0 16px 36px -6px rgb(0 0 0 / .78)",
        modalShadow:
          "0 0 0 1px rgb(255 255 255 / .26), 0 6px 18px rgb(0 0 0 / .50), 0 28px 64px -8px rgb(0 0 0 / .88)",
      },
    },
    {
      id: "warm",
      label: "暖灰",
      description: "轻柔温润的中性色",
      light: {
        ...lightLayers,
        background: "#f4f2ef",
        cardBackground: "#fffdfa",
        fill: "#f0ece6",
        border: "#ddd5cc",
        text: "#27231f",
        textSecondary: "#6e655c",
        gray: "#c4b8ab",
        hover: "#e9e2d9",
        press: "#dfd4c8",
        selectedBackground: "#fffcf8",
        smallShadow: "0 1px 3px rgb(46 35 23 / .10)",
        shadow:
          "0 1px 4px rgb(46 35 23 / .05), 0 5px 14px rgb(46 35 23 / .025)",
        popupShadow:
          "0 0 0 1px rgb(46 35 23 / .08), 0 4px 14px rgb(46 35 23 / .12), 0 20px 48px -8px rgb(46 35 23 / .23)",
        modalShadow:
          "0 0 0 1px rgb(46 35 23 / .09), 0 8px 26px rgb(46 35 23 / .14), 0 34px 84px -12px rgb(46 35 23 / .29)",
      },
      dark: {
        ...darkLayers,
        background: "#171512",
        cardBackground: "#2b2824",
        fill: "#38332d",
        border: "#70675b",
        text: "#faf5ed",
        textSecondary: "#d2c8bc",
        gray: "#968777",
        hover: "#433d35",
        press: "#504b45",
        selectedBackground: "#48443f",
        selectedShadow: "0 1px 5px rgb(0 0 0 / .30), 0 0 0 1px #85796b",
        smallShadow: "0 1px 3px rgb(0 0 0 / .32)",
        shadow: "0 1px 4px rgb(0 0 0 / .18), 0 5px 14px rgb(0 0 0 / .12)",
        popupShadow:
          "0 0 0 1px rgb(255 242 222 / .20), 0 4px 14px rgb(0 0 0 / .36), 0 22px 52px -8px rgb(0 0 0 / .72)",
        modalShadow:
          "0 0 0 1px rgb(255 242 222 / .22), 0 8px 26px rgb(0 0 0 / .44), 0 34px 84px -12px rgb(0 0 0 / .82)",
      },
    },
  ];
  /** 默认外观，两套主题分别选择适合自身背景的蓝色。 */
  const defaultThemeOptions = {
    mode: "light",
    backdropBlur: true,
    fontWeight: 400,
    light: { color: "blue", style: "soft" },
    dark: { color: "blue", style: "soft" },
  };
  function normalizeHex(value) {
    if (typeof value !== "string")
      throw new TypeError("主题颜色必须使用 #RGB 或 #RRGGBB 格式");
    const match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim());
    if (!match) throw new TypeError("主题颜色必须使用 #RGB 或 #RRGGBB 格式");
    return (
      "#" +
      (match[1].length === 3
        ? [...match[1]].map((char) => char + char).join("")
        : match[1]
      ).toLowerCase()
    );
  }
  function luminance(value) {
    const hex = normalizeHex(value);
    const [r, g, b] = [1, 3, 5].map((index) => {
      const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
      return channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  /** 计算两种 HEX 颜色的文字对比度，用于提示自定义配色的可读性。 */
  function contrastRatio(first, second) {
    const a = luminance(first),
      b = luminance(second);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  const colorFields = [
    "background",
    "cardBackground",
    "fill",
    "border",
    "text",
    "textSecondary",
    "gray",
    "hover",
    "press",
    "selectedBackground",
    "success",
    "warning",
    "danger",
  ];
  const effectFields = [
    "selectedShadow",
    "smallShadow",
    "shadow",
    "popupShadow",
    "modalShadow",
    "overlay",
  ];
  function resolveData(mode, data, primaryOverride) {
    const style = themeStyles.find(
      (item) => item.id === (data.style ?? "soft"),
    );
    const color = themeColors.find(
      (item) => item.id === (data.color ?? "blue"),
    );
    if (!style) throw new TypeError("未知的主题风格");
    if (!color || !color[mode]) throw new TypeError("当前主题不可使用该主色");
    const layers = { ...style[mode] };
    for (const field of colorFields)
      if (data[field] !== undefined) layers[field] = normalizeHex(data[field]);
    for (const field of effectFields) {
      if (data[field] === undefined) continue;
      if (typeof data[field] !== "string" || !data[field].trim())
        throw new TypeError("主题效果必须使用非空 CSS 值");
      layers[field] = data[field];
    }
    const primary = normalizeHex(
      data.primary ?? primaryOverride ?? color[mode],
    );
    const primaryText =
      contrastRatio(primary, "#ffffff") >= contrastRatio(primary, "#000000")
        ? "#ffffff"
        : "#000000";
    return {
      mode,
      style: style.id,
      color: color.id,
      colors: { ...layers, primary, primaryText },
      primary,
      "primary-text": primaryText,
    };
  }
  /** 解析所选主题；systemDark 为系统外观，纯函数不依赖浏览器或修改配置。 */
  function createTheme(options = {}, systemDark = false) {
    const preference = options.mode ?? "light";
    if (!["light", "dark", "system"].includes(preference))
      throw new TypeError("主题模式必须是 light、dark 或 system");
    const backdropBlur =
      options.backdropBlur === undefined
        ? defaultThemeOptions.backdropBlur
        : options.backdropBlur;
    if (typeof backdropBlur !== "boolean")
      throw new TypeError("背景模糊必须使用布尔值");
    const fontWeight =
      options.fontWeight === undefined
        ? defaultThemeOptions.fontWeight
        : options.fontWeight;
    if (
      typeof fontWeight !== "number" ||
      !Number.isFinite(fontWeight) ||
      fontWeight < 100 ||
      fontWeight > 1000
    )
      throw new TypeError("字重必须是 100～1000 之间的有限数值");
    // 两份数据同时校验，避免跟随系统时才暴露另一份配置的错误。
    const light = resolveData("light", options.light ?? {}, options.primary);
    const dark = resolveData("dark", options.dark ?? {}, options.primary);
    const theme =
      preference === "dark" || (preference === "system" && systemDark)
        ? dark
        : light;
    return { ...theme, backdropBlur, fontWeight };
  }

  // ── index.ts ──
  const properties = {
    primary: "--primary",
    primaryText: "--primary-text",
    background: "--background",
    cardBackground: "--card-background",
    fill: "--fill",
    border: "--border",
    text: "--text",
    textSecondary: "--text-secondary",
    gray: "--gray",
    hover: "--hover",
    press: "--press",
    selectedBackground: "--selected-background",
    selectedShadow: "--selected-shadow",
    smallShadow: "--small-shadow",
    shadow: "--shadow",
    popupShadow: "--popup-shadow",
    modalShadow: "--modal-shadow",
    overlay: "--overlay-background",
    success: "--success",
    warning: "--warning",
    danger: "--danger",
  };
  let stopPrevious;
  /** 应用独立的明暗数据并同步系统模式；返回函数可停止本次系统监听。 */
  function applyTheme(options = {}) {
    const snapshot = {
      ...options,
      light: { ...options.light },
      dark: { ...options.dark },
    };
    const media =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : undefined;
    const initial = createTheme(snapshot, media?.matches ?? false);
    // 配置先完整校验，再替换当前主题与监听，非法配置不会破坏已应用的主题。
    stopPrevious?.();
    const render = (theme) => {
      const root = document.documentElement;
      for (const field of Object.keys(properties))
        root.style.setProperty(properties[field], theme.colors[field]);
      root.style.setProperty(
        "--overlay-backdrop-filter",
        theme.backdropBlur ? "blur(4px)" : "none",
      );
      root.style.setProperty("--font-weight", String(theme.fontWeight));
      // 变细时四档同步平移，增粗时保留原本更粗的标题，不增加用户配置项。
      for (const [role, base] of [
        ["action", 500],
        ["subtitle", 600],
        ["title", 700],
      ]) {
        const weight =
          theme.fontWeight < 400
            ? base + theme.fontWeight - 400
            : Math.max(base, theme.fontWeight);
        root.style.setProperty(
          "--font-weight-" + role,
          String(Math.min(1000, Math.max(100, weight))),
        );
      }
      root.dataset.theme = theme.mode;
      root.dataset.themeStyle = theme.style;
    };
    render(initial);
    const update = () => render(createTheme(snapshot, media?.matches ?? false));
    if (snapshot.mode === "system") media?.addEventListener("change", update);
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      media?.removeEventListener("change", update);
      if (stopPrevious === stop) stopPrevious = undefined;
    };
    stopPrevious = stop;
    return stop;
  }

  // ── icons.ts ──
  /** 原稿内置的线性 SVG 图标，只使用本地静态内容。 */
  const icons = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off":
      '<path d="m3 3 18 18M10.6 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.1 6.1A19 19 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.9-1.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    "arrow-right": '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    "chevron-right": '<path d="m9 5 7 7-7 7"/>',
    "chevrons-up-down": '<path d="m8 8 4-4 4 4m-8 8 4 4 4-4"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
    cloud:
      '<path d="M7 17a5 5 0 1 1 1.3-9.8A7 7 0 0 1 21 11.5 4 4 0 0 1 19 19H7a4 4 0 0 1 0-8"/><path d="m9 14 3 3 4-5"/>',
    spark:
      '<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
    search: '<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
    x: '<path d="M6 6 18 18M18 6 6 18"/>',
    heart:
      '<path d="M20.8 8.5c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z"/>',
    share:
      '<path d="M12 16V3m-5 5 5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',
    add: '<path d="M12 5v14M5 12h14"/>',
    moon: '<path d="M20 15.5A8.4 8.4 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
    shield:
      '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    wifi: '<path d="M2 8c6-5 14-5 20 0M5 12c4-3 10-3 14 0M9 16a5 5 0 0 1 6 0M12 20h.01"/>',
    sliders:
      '<path d="M4 7h9m4 0h3M4 17h3m4 0h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    briefcase:
      '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    message:
      '<path d="M20 16a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z"/><path d="M8 10h8m-8 4h5"/>',
    layer: '<path d="m12 3 10 6-10 6L2 9l10-6Zm-9 11 9 5 9-5M3 18l9 5 9-5"/>',
    inbox:
      '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m3 13 5 0 2 3h4l2-3h5"/>',
    image:
      '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    trash: '<path d="M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v6m4-6v6"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  };
  /** 可用的内置图标名称。 */

  // ── selection.ts ──
  /** 单选保留一个值，多选按勾选状态增删项目且不产生重复值。 */
  function updateSelection(current, value, checked) {
    if (!Array.isArray(current)) return value;
    return checked
      ? [...current.filter((item) => item !== value), value]
      : current.filter((item) => item !== value);
  }
  /** 列表组三种模式，普通列表不维护选中态。 */
  /** 读取列表项选中态，避免模式切换时把错误的数据类型当作选中值。 */
  function isListSelected(mode, current, value) {
    return mode === "single"
      ? current === value
      : mode === "multiple" &&
          Array.isArray(current) &&
          current.includes(value);
  }
  /** 单选不允许取消，多选按状态切换，普通模式保持原有值。 */
  function selectListValue(mode, current, value) {
    if (mode === "normal") return current;
    if (mode === "single") return value;
    const values = Array.isArray(current) ? current : [];
    return updateSelection(values, value, !values.includes(value));
  }

  // ── tabNavigation.ts ──
  /** 当前值失效或被禁用时，使用首个可用页签。 */
  function resolveTab(options, value) {
    return (
      options.find((item) => item.value === value && !item.disabled) ??
      options.find((item) => !item.disabled)
    );
  }
  /** 按左右方向键及 Home、End 导航，跳过禁用项并支持首尾循环。 */
  function navigateTab(options, value, key) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
    const enabled = options.filter((item) => !item.disabled);
    if (!enabled.length) return;
    const current = Math.max(
      0,
      enabled.findIndex((item) => item.value === value),
    );
    const next =
      key === "Home"
        ? 0
        : key === "End"
          ? enabled.length - 1
          : (current + (key === "ArrowRight" ? 1 : -1) + enabled.length) %
            enabled.length;
    return enabled[next];
  }

  // ── sliderValue.ts ──
  /** 统一原生输入、指针与刻度的合法值，避免三种操作各自取整。 */
  function sliderScale(min, max, step, marks) {
    const lower = Number.isFinite(min) ? min : 0;
    const upper = Number.isFinite(max)
      ? Math.max(lower, max)
      : Math.max(lower, 100);
    const increment =
      step === null ? null : Number.isFinite(step) && step > 0 ? step : 1;
    const clean = (value) => Number(value.toPrecision(15));
    const clamp = (value) =>
      Math.min(upper, Math.max(lower, Number.isFinite(value) ? value : lower));
    let points = [];
    if (Array.isArray(marks)) {
      const unique = new Map();
      for (const point of marks)
        if (
          Number.isFinite(point.value) &&
          point.value >= lower &&
          point.value <= upper
        )
          unique.set(point.value, point);
      points = [...unique.values()].sort((a, b) => a.value - b.value);
    } else if (
      marks &&
      increment &&
      upper > lower &&
      Number.isFinite((upper - lower) / increment)
    ) {
      const count = Math.floor((upper - lower) / increment + 1e-9);
      // 极小步长不能创建数百万个 DOM 点，抽稀只影响绘制，不改变可选值。
      const stride = Math.max(1, Math.ceil(count / 1000));
      for (let index = 0; index <= count; index += stride)
        points.push({ value: clean(lower + index * increment) });
      const end = clean(lower + count * increment);
      if (points.at(-1)?.value !== end) points.push({ value: end });
    }
    function normalize(raw) {
      if (!Number.isFinite(upper - lower)) return lower;
      const value = clamp(raw);
      if (increment === null)
        return points.reduce(
          (nearest, point) =>
            Math.abs(point.value - value) < Math.abs(nearest - value)
              ? point.value
              : nearest,
          points[0]?.value ?? lower,
        );
      if (!Number.isFinite((value - lower) / increment)) return value;
      const last = Math.floor((upper - lower) / increment + 1e-9);
      return clamp(
        clean(
          lower +
            Math.min(last, Math.round((value - lower) / increment)) * increment,
        ),
      );
    }
    return {
      min: lower,
      max: upper,
      step: increment,
      marks: points,
      normalize,
      disabled:
        upper <= lower ||
        !Number.isFinite(upper - lower) ||
        (increment === null && points.length === 0),
    };
  }

  // ── floatingPosition.ts ──
  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), Math.max(min, max));
  const opposite = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  /** 统一处理翻转、边缘避让、尺寸限制和与按压位置对应的动画原点。 */
  function resolveFloatingPosition(input) {
    const { anchor, viewport } = input;
    const margin = Math.max(
      0,
      Math.min(
        input.margin,
        (viewport.right - viewport.left) / 2,
        (viewport.bottom - viewport.top) / 2,
      ),
    );
    const bounds = {
      left: viewport.left + margin,
      top: viewport.top + margin,
      right: viewport.right - margin,
      bottom: viewport.bottom - margin,
    };
    const availableWidth = Math.max(0, bounds.right - bounds.left);
    const availableHeight = Math.max(0, bounds.bottom - bounds.top);
    // 负间距让级联窗口轻微压住父层，翻转方向时仍使用同样的重叠量。
    const gap = Number.isFinite(input.gap) ? input.gap : 0;
    if (input.pin) {
      const { pin } = input;
      if (pin.parent) {
        // 先保留完整高度并整体上移；仅整组超出视口时才限制高度。
        const ancestors = clamp(pin.parent.reserve ?? 0, 0, availableHeight);
        const peek = Math.min(
          36,
          Math.max(0, pin.parent.bottom - pin.parent.top) * 0.6,
          (availableHeight - ancestors) / 2,
        );
        const reserve = ancestors + peek,
          maxHeight = availableHeight - reserve;
        const width = Math.min(Math.max(0, input.width), availableWidth),
          height = Math.min(Math.max(0, input.height), maxHeight);
        const left = clamp(pin.left, bounds.left, bounds.right - width);
        const preferredTop = pin.parent.top + peek;
        const top = clamp(
          preferredTop,
          bounds.top + reserve,
          bounds.bottom - height,
        );
        return {
          left,
          top,
          width,
          height,
          maxHeight,
          side: "bottom",
          alignment: "start",
          originX: clamp((input.pointer?.x ?? anchor.left) - left, 0, width),
          originY: 0,
          stack: { shift: top - preferredTop, reserve },
        };
      }
      const width = Math.min(Math.max(0, input.width), availableWidth),
        height = Math.min(Math.max(0, input.height), availableHeight);
      const left = clamp(pin.left, bounds.left, bounds.right - width);
      const top = clamp(
        pin.side === "top" ? pin.bottom - height : pin.top,
        bounds.top,
        bounds.bottom - height,
      );
      return {
        left,
        top,
        width,
        height,
        maxHeight: availableHeight,
        side: pin.side,
        alignment: "start",
        originX: clamp((input.pointer?.x ?? anchor.left) - left, 0, width),
        originY: pin.side === "top" ? height : 0,
      };
    }
    const spaces = {
      top: Math.max(0, anchor.top - bounds.top - gap),
      bottom: Math.max(0, bounds.bottom - anchor.bottom - gap),
      left: Math.max(0, anchor.left - bounds.left - gap),
      right: Math.max(0, bounds.right - anchor.right - gap),
    };
    const [preferred, alignment = "center"] = input.placement.split("-");
    let side = preferred;
    const desired =
      side === "top" || side === "bottom" ? input.height : input.width;
    if (spaces[side] < desired && spaces[opposite[side]] > spaces[side])
      side = opposite[side];
    const vertical = side === "top" || side === "bottom";
    // 单侧不足时先调整位置，不能把单侧空白误当成整个窗口的尺寸上限。
    const widthLimit = availableWidth;
    const maxHeight = availableHeight;
    const width = Math.min(Math.max(0, input.width), widthLimit);
    const height = Math.min(Math.max(0, input.height), maxHeight);
    let align = alignment;
    function alignCross(start, end, size, lower, upper) {
      let position =
        align === "start"
          ? start
          : align === "end"
            ? end - size
            : (start + end - size) / 2;
      if (align !== "center" && (position < lower || position + size > upper)) {
        const flipped = align === "start" ? end - size : start;
        if (flipped >= lower && flipped + size <= upper) {
          align = align === "start" ? "end" : "start";
          position = flipped;
        }
      }
      return clamp(position, lower, upper - size);
    }
    const left = vertical
      ? alignCross(anchor.left, anchor.right, width, bounds.left, bounds.right)
      : clamp(
          side === "right" ? anchor.right + gap : anchor.left - gap - width,
          bounds.left,
          bounds.right - width,
        );
    const top = vertical
      ? clamp(
          side === "bottom" ? anchor.bottom + gap : anchor.top - gap - height,
          bounds.top,
          bounds.bottom - height,
        )
      : alignCross(
          anchor.top,
          anchor.bottom,
          height,
          bounds.top,
          bounds.bottom,
        );
    const crossX =
      input.pointer?.x ??
      (align === "start"
        ? anchor.left
        : align === "end"
          ? anchor.right
          : (anchor.left + anchor.right) / 2);
    const crossY =
      input.pointer?.y ??
      (align === "start"
        ? anchor.top
        : align === "end"
          ? anchor.bottom
          : (anchor.top + anchor.bottom) / 2);
    return {
      left,
      top,
      width,
      height,
      maxHeight,
      side,
      alignment: align,
      originX:
        input.pointer || vertical
          ? clamp(crossX - left, 0, width)
          : side === "right"
            ? 0
            : width,
      originY: input.pointer
        ? clamp(crossY - top, 0, height)
        : vertical
          ? side === "bottom"
            ? 0
            : height
          : clamp(crossY - top, 0, height),
    };
  }
  /** 触发元素完全离开可见裁剪区域时关闭窗口。 */
  function floatingRectVisible(rect, clip) {
    return (
      rect.right > clip.left &&
      rect.left < clip.right &&
      rect.bottom > clip.top &&
      rect.top < clip.bottom
    );
  }

  // ── touchGesture.ts ──
  /** 距离足够或短促甩动时吸附到下一状态，反向甩动则回弹。 */
  function completesSwipe(distance, velocity, extent) {
    if (extent <= 0 || distance < 12 || velocity < -0.3) return false;
    return distance >= Math.min(88, extent * 0.28) || velocity >= 0.55;
  }
  /** 内部可滚动内容优先消费手势，只有到达当前方向的边缘才交给外层。 */
  function canScrollGesture(target, boundary, axis, delta) {
    for (
      let node = target;
      node && boundary.contains(node);
      node = node.parentElement
    ) {
      if (node instanceof HTMLElement) {
        const style = getComputedStyle(node);
        const overflow = axis === "x" ? style.overflowX : style.overflowY;
        const position = axis === "x" ? node.scrollLeft : node.scrollTop;
        const size = axis === "x" ? node.clientWidth : node.clientHeight;
        const total = axis === "x" ? node.scrollWidth : node.scrollHeight;
        if (
          /(auto|scroll)/.test(overflow) &&
          total > size + 1 &&
          (delta > 0 ? position > 1 : position + size < total - 1)
        )
          return true;
      }
      if (node === boundary) break;
    }
    return false;
  }

  // ── Popup 结果与关闭队列 ──
  /** 管理弹层结果与退出清理，渲染由唯一的 Popup 宿主完成。 */
  function createPopupStore(flush, exitDelay = 280) {
    let sequence = 0;
    let entries = [];
    let listener;
    const timers = new Map();
    const completions = new Map();
    function publish() {
      listener?.([...entries]);
    }
    function remove(id) {
      clearTimeout(timers.get(id));
      entries = entries.filter((entry) => entry.id !== id);
      timers.delete(id);
      publish();
    }
    function attach(callback) {
      if (listener) throw new Error("每个应用只需要一个 <Popup /> 宿主。");
      listener = callback;
      publish();
      return () => {
        listener = undefined;
        // 应用卸载不能留下未结束的 Promise 或退出动画计时器。
        for (const timer of timers.values()) clearTimeout(timer);
        timers.clear();
        for (const complete of completions.values()) complete();
        completions.clear();
        entries = [];
      };
    }
    function show(spec) {
      if (!listener) throw new Error("请先在应用根部渲染一次 <Popup />。");
      const id = ++sequence;
      let done = false;
      let resolve;
      const closed = new Promise((complete) => {
        resolve = complete;
      });
      completions.set(id, (value) => {
        done = true;
        resolve(value);
      });
      function close(value) {
        if (done) return false;
        done = true;
        entries = entries.map((entry) =>
          entry.id === id ? { ...entry, open: false } : entry,
        );
        publish();
        // 先提交关闭状态、释放焦点和滚动锁，再通知业务，避免回调阻塞窗口收起。
        void flush().then(() => {
          completions.get(id)?.(value);
          completions.delete(id);
        });
        if (exitDelay !== null)
          timers.set(
            id,
            setTimeout(() => remove(id), exitDelay),
          );
        return true;
      }
      entries.push({ ...spec, id, open: true, context: { close }, close });
      publish();
      return { close, closed };
    }
    // 实际弹层由 CSS 过渡结束通知移除；纯状态使用者仍可选择计时清理。
    const finish = (id) => {
      if (entries.some((entry) => entry.id === id && !entry.open)) remove(id);
    };
    return { attach, show, finish };
  }
  /* my-ui · 原生 DOM 组件核心
   * 目录：DOM 与生命周期 → 基础/表单 → 选择/列表 → 浮层/菜单 → 滑块/触摸 → 声明式入口。
   * 不依赖 Vue；同一份控制器同时服务原生 HTML 与 Vue 适配层。
   */

  const definitions = Object.create(null);
  const controllers = new WeakMap();
  let nextId = 0;
  const kebab = (value) =>
    value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  const className = (value) => "my-" + value;
  const names = (value) =>
    String(value || "")
      .split(/\s+/)
      .filter(Boolean)
      .map(className)
      .join(" ");
  const reduced = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
  const focusable = (root) =>
    [
      ...root.querySelectorAll(
        "button,[href],input,textarea,select,[tabindex],[contenteditable]",
      ),
    ].filter(
      (node) =>
        node.tabIndex >= 0 &&
        !node.matches(':disabled,[aria-disabled="true"]') &&
        !node.closest('[inert],[hidden],[aria-hidden="true"]') &&
        node.getClientRects().length &&
        getComputedStyle(node).visibility !== "hidden",
    );

  function attr(node, key, value) {
    if (
      value === undefined ||
      value === null ||
      (value === false && !key.startsWith("aria-"))
    )
      node.removeAttribute(key);
    else
      node.setAttribute(
        key,
        value === true && !key.startsWith("aria-") ? "" : String(value),
      );
  }
  function attrs(node, values) {
    for (const [key, value] of Object.entries(values)) attr(node, key, value);
    return node;
  }
  function scope(node, component) {
    const key = "data-my-" + kebab(component);
    node.setAttribute(key, "");
    for (const child of node.querySelectorAll("*")) child.setAttribute(key, "");
    return node;
  }
  function el(tag = "div", classes = "", text) {
    const node = document.createElement(tag);
    node.className = names(classes);
    if (text !== undefined) node.textContent = String(text ?? "");
    return node;
  }
  function svgIcon(name = "sun") {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    attrs(node, {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 1.8,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": true,
    });
    node.innerHTML = icons[name] ?? icons.sun;
    node.classList.add("my-icon");
    return scope(node, "Icon");
  }
  function text(node, value) {
    const next = String(value ?? "");
    if (node.textContent !== next) node.textContent = next;
  }
  function state(node, states) {
    for (const [key, value] of Object.entries(states))
      node.classList.toggle(className(key), !!value);
  }
  function nativeValue(node, value) {
    const next = String(value ?? "");
    if (node.value !== next) node.value = next;
  }
  function content(target, value) {
    if (value?.element instanceof Node) value = value.element;
    if (
      value instanceof Node &&
      target.childNodes.length === 1 &&
      target.firstChild === value
    )
      return;
    const expected = [];
    const collect = (item) => {
      if (item === undefined || item === null || item === false) return;
      if (Array.isArray(item)) item.forEach(collect);
      else expected.push(item?.element instanceof Node ? item.element : item);
    };
    collect(value);
    // 内容不变时保留节点，避免重复更新标题等组合内容造成原生焦点丢失。
    if (
      target.childNodes.length === expected.length &&
      expected.every((item, index) =>
        item instanceof Node
          ? target.childNodes[index] === item
          : target.childNodes[index].nodeType === Node.TEXT_NODE &&
            target.childNodes[index].textContent === String(item),
      )
    )
      return;
    target.replaceChildren();
    const append = (value) => {
      if (value === undefined || value === null || value === false) return;
      if (Array.isArray(value)) {
        value.forEach(append);
        return;
      }
      if (value?.element instanceof Node) target.append(value.element);
      else
        target.append(
          value instanceof Node
            ? value
            : document.createTextNode(String(value)),
        );
    };
    append(value);
  }
  function styles(node, value) {
    if (Array.isArray(value)) {
      value.forEach((item) => styles(node, item));
      return;
    }
    if (typeof value === "string") {
      node.style.cssText += ";" + value;
      return;
    }
    for (const [key, item] of Object.entries(value ?? {})) {
      const property = key.startsWith("--")
        ? key
        : key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
      if (item === undefined || item === null)
        node.style.removeProperty(property);
      else
        node.style.setProperty(
          property,
          typeof item === "number" &&
            !property.startsWith("--") &&
            ![
              "opacity",
              "z-index",
              "font-weight",
              "flex",
              "order",
              "line-height",
              "scale",
            ].includes(property)
            ? item + "px"
            : String(item),
        );
    }
  }
  function parentController(node, types) {
    for (
      let parent = node.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      const c = controllers.get(parent);
      if (c && types.includes(c.name)) return c;
    }
  }
  function register(name, definition) {
    definitions[name] = definition;
  }

  /** 创建组件；value/onChange 为原生值接口，slots 接受 DOM 节点、文本或构建函数。 */
  function create(name, properties = {}, options = {}) {
    name =
      Object.keys(definitions).find(
        (key) =>
          key.toLowerCase() ===
          String(name).replace(/^my-/, "").replace(/-/g, "").toLowerCase(),
      ) ?? name;
    const definition = definitions[name];
    if (!definition) throw new TypeError("未知组件：" + name);
    const c = {
      name,
      id: "my-" + ++nextId,
      p: {
        ...definition.defaults,
        ...Object.fromEntries(
          Object.entries(properties).filter(([, value]) => value !== undefined),
        ),
      },
      element:
        options.element ??
        (definition.tag === "svg"
          ? document.createElementNS("http://www.w3.org/2000/svg", "svg")
          : document.createElement(
              name === "ListRow" && properties.toggle
                ? "label"
                : name === "Tag" &&
                    typeof (properties.modelValue ?? properties.value) ===
                      "boolean"
                  ? "button"
                  : (definition.tag ?? "div"),
            )),
      outlets: new Map(),
      nativeSlots: new Map(),
      children: new Set(),
      cleanups: new Set(),
      disposed: false,
      owned: !options.element,
      externalSlots: !!options.externalSlots,
      slotNames: new Set(options.slotNames ?? Object.keys(options.slots ?? {})),
      slots: options.slots ?? {},
      attributes: options.attributes ?? {},
      exposed: {},
    };
    if ("modelValue" in properties) c.p.value = properties.modelValue;
    delete c.p.modelValue;
    controllers.set(c.element, c);
    c.element.dataset.myComponent = name;
    c.on = (target, type, handler, settings) => {
      target.addEventListener(type, handler, settings);
      const stop = () => {
        target.removeEventListener(type, handler, settings);
        c.cleanups.delete(stop);
      };
      c.cleanups.add(stop);
      return stop;
    };
    c.emit = (event, ...args) => {
      if (c.disposed) return;
      options.emit?.(event, ...args);
      const callback =
        c.p["on" + event.charAt(0).toUpperCase() + event.slice(1)];
      if (typeof callback === "function") callback(...args);
      c.element.dispatchEvent(
        new CustomEvent("my:" + event, {
          detail: args.length === 1 ? args[0] : args,
          bubbles: true,
        }),
      );
    };
    c.changed = () => {
      if (!c.disposed) options.invalidate?.();
    };
    c.set = (value) => {
      c.p.value = value;
      c.paint();
      c.emit("change", value);
    };
    c.slot = (name, target, context = {}, fallback) => {
      if (c.slotNames.has(name)) {
        c.outlets.set(target, { name, target, scope: context });
        if (!c.externalSlots) {
          const previous = c.nativeSlots.get(target);
          const keys = Object.keys(context);
          if (
            previous?.content === c.slots[name] &&
            keys.length === Object.keys(previous.context).length &&
            keys.every((key) => context[key] === previous.context[key])
          )
            return;
          c.nativeSlots.set(target, { content: c.slots[name], context });
          const value =
            typeof c.slots[name] === "function"
              ? c.slots[name](context)
              : c.slots[name];
          const roots = [];
          const collect = (value) => {
            if (Array.isArray(value)) value.forEach(collect);
            else if (value?.element instanceof Node) roots.push(value.element);
            else if (value instanceof Node) roots.push(value);
          };
          collect(value);
          for (const child of [...c.children])
            if (
              target.contains(child.element) &&
              !roots.some(
                (node) =>
                  node === child.element || node.contains?.(child.element),
              )
            ) {
              child.destroy();
              c.children.delete(child);
            }
          content(target, value);
          // 只接管最外层组件，子组件继续由其原来的父组件释放。
          const adopt = (node) => {
            const child = controllers.get(node);
            if (child && child !== c) {
              child.parent?.children.delete(child);
              child.parent = c;
              c.children.add(child);
              return;
            }
            for (const nested of node.childNodes ?? []) adopt(nested);
          };
          roots.forEach(adopt);
        }
      } else {
        c.outlets.delete(target);
        c.nativeSlots.delete(target);
        if (fallback !== undefined)
          content(
            target,
            typeof fallback === "function" ? fallback() : fallback,
          );
      }
    };
    c.clear = (node) => {
      for (const target of c.outlets.keys())
        if (node === target || node.contains(target)) {
          c.outlets.delete(target);
          c.nativeSlots.delete(target);
        }
      for (const child of [...c.children])
        if (node.contains(child.element)) {
          child.destroy();
          c.children.delete(child);
        }
      node.replaceChildren();
    };
    c.child = (name, properties = {}, slots = {}, element) => {
      const child = create(name, properties, {
        element,
        slots,
        emit: (event, ...args) => properties["_" + event]?.(...args),
      });
      child.parent = c;
      c.children.add(child);
      return child;
    };
    c.applyAttrs = (target = c.element) => {
      c.builtinClasses ??= new Set((c.classTarget ?? c.element).classList);
      for (const cleanup of c.attributeCleanups ?? []) cleanup();
      c.attributeCleanups = [];
      for (const [key, value] of Object.entries(c.attributes)) {
        if (key === "class") {
          for (const cls of String(value ?? "")
            .split(/\s+/)
            .filter(Boolean))
            (c.classTarget ?? c.element).classList.add(cls);
        } else if (key === "style") styles(c.styleTarget ?? c.element, value);
        else if (/^on[A-Z]/.test(key)) {
          const event = key.slice(2).toLowerCase();
          const listener = (event) => {
            for (const handler of Array.isArray(value) ? value : [value])
              if (typeof handler === "function") handler(event);
          };
          target.addEventListener(event, listener);
          c.attributeCleanups.push(() =>
            target.removeEventListener(event, listener),
          );
        } else attr(target, key, value);
      }
    };
    definition.init?.(c);
    for (const [key, callback] of Object.entries(c.exposed)) {
      c.exposed[key] = (...args) => {
        if (!c.disposed) return callback(...args);
      };
    }
    c.paint = () => {
      if (c.disposed) return;
      definition.paint?.(c);
      scope(c.element, name);
      c.applyAttrs(c.attributeTarget);
      c.changed();
    };
    /** 更新属性而不重建组件，原生输入光标、焦点和插槽节点保持不变。 */
    c.update = (patch = {}, attributes, slotNames) => {
      for (const [key, value] of Object.entries(patch))
        c.p[key] = value === undefined ? definition.defaults?.[key] : value;
      if ("modelValue" in patch) c.p.value = patch.modelValue;
      delete c.p.modelValue;
      if (attributes) {
        const nextClasses = new Set(
          String(attributes.class ?? "").split(/\s+/),
        );
        for (const name of String(c.attributes.class ?? "").split(/\s+/)) {
          if (name && !nextClasses.has(name) && !c.builtinClasses?.has(name))
            (c.classTarget ?? c.element).classList.remove(name);
        }
        const oldStyle = document.createElement("span"),
          nextStyle = document.createElement("span");
        styles(oldStyle, c.attributes.style);
        styles(nextStyle, attributes.style);
        for (const key of oldStyle.style)
          if (!nextStyle.style.getPropertyValue(key))
            (c.styleTarget ?? c.element).style.removeProperty(key);
        for (const key of Object.keys(c.attributes)) {
          if (
            key !== "class" &&
            key !== "style" &&
            !/^on[A-Z]/.test(key) &&
            !(key in attributes)
          )
            (c.attributeTarget ?? c.element).removeAttribute(key);
        }
        c.attributes = attributes;
      }
      if (slotNames) c.slotNames = new Set(slotNames);
      c.paint();
    };
    /** 清理监听、动画和浮层；不会销毁传入 element 的宿主。 */
    c.destroy = () => {
      if (c.disposed) return;
      c.disposed = true;
      definition.destroy?.(c);
      c.cleanups.forEach((stop) => stop());
      c.attributeCleanups?.forEach((stop) => stop());
      for (const child of [...c.children]) child.destroy();
      c.outlets.clear();
      c.nativeSlots.clear();
      controllers.delete(c.element);
      c.parent?.children.delete(c);
      if (c.owned) c.element.remove();
    };
    c.paint();
    queueMicrotask(() => {
      if (!c.disposed) {
        definition.connected?.(c);
        c.paint();
      }
    });
    return c;
  }

  // ── 基础组件 ────────────────────────────────────────────────────────
  register("Icon", {
    tag: "svg",
    init(c) {
      c.element.innerHTML = svgIcon(c.p.name).innerHTML;
    },
    paint(c) {
      attrs(c.element, {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.8,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "aria-hidden": true,
      });
      c.element.classList.add("my-icon");
      c.element.innerHTML = icons[c.p.name] ?? icons.sun;
    },
  });
  register("Button", {
    tag: "button",
    defaults: { variant: "primary", type: "button" },
    init(c) {
      c.element.classList.add("my-button");
      c.body = el("span", "button-content");
      c.loading = el("span", "button-loading");
      c.element.append(c.body, c.loading);
      c.on(c.element, "click", (event) => {
        if (c.p.disabled || c.p.loading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        c.emit("click", event);
      });
    },
    paint(c) {
      const variants = {
        primary: "primary",
        outline: "outline",
        text: "text-only",
        icon: "icon-button",
        bare: "bare-icon",
        link: "underlink",
        round: "round-arrow",
      };
      const base = ["icon", "bare"].includes(c.p.variant)
        ? "icon-button"
        : c.p.variant === "link"
          ? "underlink"
          : c.p.variant === "round"
            ? "round-arrow"
            : "button";
      c.element.className = names(base + " " + variants[c.p.variant]);
      c.element.classList.add("my-button");
      state(c.element, {
        "is-loading": c.p.loading,
        inactive: c.p.disabled,
        selected: c.p.selected,
      });
      attrs(c.element, {
        type: c.p.loading ? "button" : c.p.type,
        disabled: c.p.disabled,
        "aria-disabled": c.p.loading || c.p.disabled || undefined,
        "aria-busy": c.p.loading || undefined,
        "aria-pressed": c.p.selected,
      });
      if (c.iconName !== c.p.icon) {
        c.iconNode?.remove();
        c.iconName = c.p.icon;
        if (c.p.icon) {
          c.iconNode = svgIcon(c.p.icon);
          c.body.prepend(c.iconNode);
        }
      }
      if (!c.label) {
        c.label = el("span", "button-label");
        c.body.append(c.label);
      }
      c.slot("default", c.label, {}, c.p.label ?? "");
      c.loading.hidden = !c.p.loading;
      if (c.p.loading && !c.loading.firstChild) {
        c.spinner = c.child("Loading", { size: "small" });
        c.loading.append(c.spinner.element);
      }
    },
  });
  register("Tag", {
    tag: "span",
    defaults: { tone: "blue" },
    init(c) {
      c.body = el("span", "tag-content");
      c.element.append(c.body);
      c.on(c.element, "click", (event) => {
        if (c.p.disabled) return;
        if (typeof c.p.value === "boolean") c.set(!c.p.value);
        c.emit("click", event);
      });
      c.on(c.element, "keydown", (event) => {
        if (
          c.element.tagName !== "BUTTON" &&
          typeof c.p.value === "boolean" &&
          ["Enter", " "].includes(event.key)
        ) {
          event.preventDefault();
          c.element.click();
        }
      });
    },
    paint(c) {
      c.element.className = names("tag " + c.p.tone);
      const selectable = typeof c.p.value === "boolean";
      state(c.element, {
        "is-selectable": selectable,
        "is-selected": c.p.value,
        "is-disabled": c.p.disabled,
      });
      attrs(c.element, {
        role:
          selectable && c.element.tagName !== "BUTTON" ? "button" : undefined,
        tabindex: selectable ? (c.p.disabled ? -1 : 0) : undefined,
        "aria-pressed": selectable ? c.p.value : undefined,
        "aria-disabled": c.p.disabled || undefined,
        disabled: c.element.tagName === "BUTTON" && c.p.disabled,
      });
      c.slot("default", c.body, {}, c.p.label ?? "");
    },
  });
  register("Switch", {
    tag: "input",
    init(c) {
      c.element.classList.add("my-switch");
      attrs(c.element, { type: "checkbox", role: "switch" });
      c.on(c.element, "change", () => {
        if (!c.p.disabled) c.set(c.element.checked);
      });
    },
    paint(c) {
      c.element.checked = !!c.p.value;
      c.element.disabled = !!c.p.disabled;
      attrs(c.element, {
        "aria-checked": !!c.p.value,
        "aria-label": c.p.label,
        name: c.p.name,
      });
    },
  });
  register("Loading", {
    tag: "span",
    defaults: { size: "medium", label: "加载中" },
    init(c) {
      c.element.classList.add("my-loading");
      c.element.innerHTML =
        '<svg class="my-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg>';
      c.body = el("span", "loading-text");
      c.element.append(c.body);
    },
    paint(c) {
      c.element.className = names("loading " + c.p.size);
      attr(c.element, "role", "status");
      c.body.className = names(
        c.slotNames.has("default") ? "loading-text" : "sr-only",
      );
      c.slot("default", c.body, {}, c.p.label);
    },
  });
  register("Avatar", {
    tag: "span",
    defaults: { size: 40, shape: "circle", alt: "" },
    init(c) {
      c.fallback = el("span", "avatar-fallback");
      attr(c.fallback, "aria-hidden", true);
      c.element.append(c.fallback);
    },
    paint(c) {
      c.element.className = names("avatar " + c.p.shape);
      styles(c.element, {
        "--avatar-size":
          typeof c.p.size === "number" ? c.p.size + "px" : c.p.size,
      });
      attrs(c.element, {
        role: "img",
        "aria-label": c.p.alt?.trim() || c.p.text?.trim() || "头像",
      });
      let words = (c.p.alt ?? "").trim().split(/\s+/).filter(Boolean);
      const chars = (value) =>
        [
          ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
            value,
          ),
        ].map((item) => item.segment);
      const fallback =
        c.p.text?.trim() ||
        (words.length > 1
          ? (chars(words[0])[0] + chars(words.at(-1))[0]).toLocaleUpperCase()
          : chars(words[0] ?? "")
              .slice(0, 2)
              .join(""));
      c.slot("default", c.fallback, {}, () =>
        fallback ? el("span", "", fallback) : svgIcon("user"),
      );
      if (c.source !== c.p.src) {
        c.image?.remove();
        c.image = undefined;
        c.source = c.p.src;
        if (c.p.src) {
          const img = (c.image = document.createElement("img"));
          attrs(img, { src: c.p.src, alt: "", draggable: false });
          img.onload = (event) => {
            if (c.image === img) c.emit("load", event);
          };
          img.onerror = (event) => {
            if (c.image === img) {
              img.remove();
              c.emit("error", event);
            }
          };
          c.element.append(img);
        }
      }
    },
  });
  register("Badge", {
    tag: "span",
    defaults: { max: 99 },
    init(c) {
      c.element.classList.add("my-badge");
      c.body = el("span");
      c.body.style.display = "contents";
      c.indicator = el("span", "badge-indicator");
      c.element.append(c.body, c.indicator);
    },
    paint(c) {
      state(c.element, { standalone: !c.slotNames.has("default") });
      c.slot("default", c.body);
      const number =
        typeof c.p.value === "number" && Number.isFinite(c.p.value)
          ? Math.max(0, Math.floor(c.p.value))
          : undefined;
      const max =
        Number.isFinite(c.p.max) && c.p.max >= 1 ? Math.floor(c.p.max) : 99;
      const value =
        number === undefined
          ? String(c.p.value ?? "").trim()
          : number > max
            ? max + "+"
            : String(number);
      c.indicator.hidden =
        !!c.p.hidden ||
        !(c.p.dot || (value && (c.p.showZero || value !== "0")));
      state(c.indicator, { dot: c.p.dot });
      attrs(c.indicator, {
        role: "img",
        "aria-label":
          c.p.label ??
          (c.p.dot
            ? "有新消息"
            : number === undefined
              ? value
              : number + " 条未读消息"),
      });
      text(c.indicator, c.p.dot ? "" : value);
    },
  });
  register("Card", {
    tag: "article",
    init(c) {
      c.element.classList.add("my-card");
      c.head = el("div", "surface-head");
      c.heading = el("div");
      c.title = el("h3");
      c.description = el("p");
      c.sample = el("span", "sample-id");
      c.heading.append(c.title, c.description);
      c.head.append(c.heading, c.sample);
      c.body = el("div");
      c.body.style.display = "contents";
      c.element.append(c.head, c.body);
      c.on(c.element, "click", (event) => {
        if (c.p.interactive) c.emit("activate", event);
      });
      c.on(c.element, "keydown", (event) => {
        if (
          c.p.interactive &&
          event.target === c.element &&
          ["Enter", " "].includes(event.key)
        ) {
          event.preventDefault();
          c.emit("activate", event);
        }
      });
    },
    paint(c) {
      state(c.element, { "tappable-card": c.p.interactive });
      attrs(c.element, {
        role: c.p.interactive ? "button" : undefined,
        tabindex: c.p.interactive ? 0 : undefined,
        "aria-label": c.p.interactive ? c.p.title : undefined,
      });
      c.head.hidden = !c.p.title || !!c.p.interactive;
      text(c.title, c.p.title);
      text(c.description, c.p.description);
      c.description.hidden = !c.p.description;
      text(c.sample, c.p.sample);
      c.sample.hidden = !c.p.sample;
      c.slot("default", c.body);
    },
  });
  register("Divider", {
    defaults: { align: "center" },
    init(c) {
      c.element.classList.add("my-divider");
      c.body = el("span", "divider-label");
      c.element.append(c.body);
    },
    paint(c) {
      c.element.className = names("divider " + c.p.align);
      state(c.element, {
        vertical: c.p.vertical,
        dashed: c.p.dashed,
        labeled: c.slotNames.has("default") && !c.p.vertical,
      });
      attrs(c.element, {
        role: "separator",
        "aria-orientation": c.p.vertical ? "vertical" : "horizontal",
      });
      c.body.hidden = !!c.p.vertical || !c.slotNames.has("default");
      c.slot("default", c.body);
    },
  });
  register("Empty", {
    defaults: { state: "empty" },
    init(c) {
      c.element.classList.add("my-empty");
      c.mark = el("span", "empty-mark");
      c.heading = el("strong");
      c.description = el("p");
      c.body = el("div", "empty-actions");
      c.element.append(c.mark, c.heading, c.description, c.body);
    },
    paint(c) {
      c.element.className = names("empty " + c.p.state);
      attr(c.element, "role", "status");
      content(
        c.mark,
        svgIcon(c.p.icon ?? (c.p.state === "error" ? "wifi" : "inbox")),
      );
      text(
        c.heading,
        c.p.title ??
          (c.p.state === "error" ? "暂时无法加载" : "这里还没有内容"),
      );
      text(c.description, c.p.description);
      c.description.hidden = !c.p.description;
      c.body.hidden = !c.slotNames.has("default");
      c.slot("default", c.body);
    },
  });
  register("Skeleton", {
    defaults: { loading: true, rows: 3, label: "内容加载中" },
    init(c) {
      c.element.classList.add("my-skeleton");
      c.visual = el("div", "skeleton-visual");
      c.body = el("div");
      c.element.append(c.visual, c.body);
    },
    paint(c) {
      attr(c.element, "aria-busy", c.p.loading);
      c.visual.hidden = !c.p.loading;
      c.body.hidden = !!c.p.loading;
      if (c.p.loading) {
        c.visual.replaceChildren();
        attrs(c.visual, { role: "status", "aria-label": c.p.label });
        if (c.p.avatar) c.visual.append(el("div", "avatar"));
        const copy = el("div", "skeleton-copy");
        copy.append(el("div", "title"));
        for (
          let index = 0;
          index < clamp(Math.floor(c.p.rows) || 3, 1, 10);
          index++
        )
          copy.append(el("div", "line"));
        c.visual.append(copy);
      }
      c.slot("default", c.body);
    },
  });

  // ── 表单与输入：原生 input 保持浏览器的输入法、光标和提交行为 ─────────────
  register("Form", {
    tag: "form",
    defaults: { layout: "vertical" },
    init(c) {
      c.element.classList.add("my-form");
    },
    paint(c) {
      c.element.className = names("form form-" + c.p.layout);
      c.element.dataset.layout = c.p.layout;
      c.slot("default", c.element);
      for (const child of c.element.querySelectorAll(
        '[data-my-component="FormField"]',
      ))
        controllers.get(child)?.paint();
    },
  });
  register("FormField", {
    init(c) {
      c.element.classList.add("my-form-field");
      c.label = el(c.p.group ? "span" : "label", "field-label");
      c.required = el("span", "required", "*");
      attr(c.required, "aria-hidden", true);
      c.labelText = document.createTextNode("");
      c.label.append(c.labelText, c.required);
      c.body = el("div", "field-body");
      c.control = el("div", "field-control");
      c.error = el("p", "field-error");
      c.hint = el("div", "field-foot");
      c.body.append(c.control, c.hint);
      c.element.append(c.label, c.body);
    },
    paint(c) {
      const id = c.p.id || c.id,
        hasError = !!c.p.error?.trim();
      const layout =
        parentController(c.element, ["Form"])?.p.layout ?? "vertical";
      c.element.className = names("form-field " + layout);
      state(c.element, { "has-error": hasError, "is-group": c.p.group });
      attrs(c.label, { id: id + "-label", for: c.p.group ? undefined : id });
      c.labelText.data = c.p.label ?? "";
      c.label.hidden = !c.p.label;
      c.required.hidden = !c.p.required;
      c.controlAttributes = {
        id,
        required: !!c.p.required,
        "aria-labelledby": c.p.label ? id + "-label" : undefined,
        "aria-invalid": hasError || undefined,
        "aria-describedby": hasError
          ? id + "-error"
          : c.p.hint || c.slotNames.has("hint")
            ? id + "-hint"
            : undefined,
      };
      c.slot("default", c.control, { control: c.controlAttributes });
      if (hasError) {
        text(c.error, c.p.error);
        attrs(c.error, { id: id + "-error", role: "alert", title: c.p.error });
        c.control.append(c.error);
      } else c.error.remove();
      c.hint.hidden = !c.p.hint && !c.slotNames.has("hint");
      attrs(c.hint, { id: id + "-hint", "aria-hidden": hasError || undefined });
      c.slot("hint", c.hint, {}, c.p.hint ?? "");
    },
  });
  function initTextInput(c, textarea = false) {
    c.field = c.child("FormField", c.p);
    c.element.classList.add(textarea ? "my-textarea-field" : "my-input");
    c.element.append(c.field.element);
    c.box = el("div", "input-box");
    c.input = textarea
      ? el("textarea", "textarea")
      : document.createElement("input");
    c.prefix = el("span", "input-prefix");
    c.actions = el("div", "input-actions");
    c.clear = el("button", "input-action clear-input");
    c.eye = el("button", "input-action password-toggle");
    c.suffix = el("span", "input-suffix");
    for (const [button, icon] of [
      [c.clear, "x"],
      [c.eye, "eye"],
    ]) {
      button.type = "button";
      const visual = el("span", "input-action-visual");
      visual.append(svgIcon(icon));
      button.append(visual);
      c.on(button, "pointerdown", (event) => event.preventDefault());
    }
    c.actions.append(c.clear, c.eye, c.suffix);
    c.box.append(c.prefix, c.input, c.actions);
    c.field.control.append(textarea ? c.input : c.box);
    c.attributeTarget = c.input;
    c.on(c.input, "input", () => {
      if (!c.p.disabled && !c.p.readonly) c.set(c.input.value);
    });
    c.on(c.clear, "click", (event) => {
      event.stopPropagation();
      if (!c.p.disabled && !c.p.readonly) {
        c.set("");
        c.input.focus({ preventScroll: true });
      }
    });
    c.on(c.eye, "click", (event) => {
      event.stopPropagation();
      if (c.p.disabled) return;
      const active = document.activeElement === c.input,
        start = c.input.selectionStart,
        end = c.input.selectionEnd;
      c.visible = !c.visible;
      c.paint();
      if (active) {
        c.input.focus({ preventScroll: true });
        if (start !== null && end !== null)
          c.input.setSelectionRange(start, end);
      }
    });
    c.on(c.box, "click", (event) => {
      // 只忽略框内的独立控件，外层可聚焦容器不能阻止图标和留白激活输入。
      const interactive = event.target.closest(
        'input,button,a[href],select,textarea,[tabindex],[contenteditable],[role="button"]',
      );
      if (
        c.p.disabled ||
        (interactive && c.box.contains(interactive))
      )
        return;
      event.stopPropagation();
      c.input.focus({ preventScroll: true });
      c.input.click();
    });
    c.exposed.focus = () => c.input.focus();
    c.exposed.select = () => c.input.select();
    if (textarea) {
      c.counter = el("span", "counter");
      attr(c.counter, "aria-hidden", true);
    }
  }
  function paintTextInput(c, textarea = false) {
    if (c.p.type !== "password" || !c.p.passwordToggle || c.p.disabled)
      c.visible = false;
    c.field.update({ ...c.p, id: c.p.id || c.id });
    attrs(c.input, {
      ...c.field.controlAttributes,
      type: textarea ? undefined : c.visible ? "text" : (c.p.type ?? "text"),
      name: c.p.name,
      inputmode: c.p.inputmode,
      pattern: c.p.pattern,
      placeholder: c.p.placeholder ?? "",
      maxlength: c.p.maxlength,
      disabled: c.p.disabled,
      readonly: c.p.readonly,
      autocomplete: c.p.autocomplete ?? "off",
      rows: textarea ? clamp(Math.floor(c.p.rows) || 3, 1, 12) : undefined,
    });
    nativeValue(c.input, c.p.value);
    state(textarea ? c.input : c.box, {
      "is-disabled": c.p.disabled,
      "is-readonly": c.p.readonly,
      "is-invalid": !!c.p.error?.trim(),
    });
    c.prefix.hidden = !c.p.icon && !c.slotNames.has("prefix");
    c.slot("prefix", c.prefix, {}, () => (c.p.icon ? svgIcon(c.p.icon) : null));
    c.clear.hidden =
      !c.p.clearable || !c.p.value || !!c.p.disabled || !!c.p.readonly;
    attr(c.clear, "aria-label", "清空" + (c.p.label ?? ""));
    c.eye.hidden = c.p.type !== "password" || !c.p.passwordToggle;
    attrs(c.eye, {
      disabled: c.p.disabled,
      "aria-label": (c.visible ? "隐藏" : "显示") + (c.p.label ?? "密码"),
      "aria-pressed": !!c.visible,
    });
    content(c.eye.firstChild, svgIcon(c.visible ? "eye-off" : "eye"));
    c.suffix.hidden = !c.slotNames.has("suffix");
    c.slot("suffix", c.suffix);
    // 只保留可见操作，使末项接管尾部内边距，同时保留现有按钮与插槽的焦点。
    const actions = [c.clear, c.eye, c.suffix];
    for (const action of actions) if (action.hidden) action.remove();
    for (const [index, action] of actions.filter((node) => !node.hidden).entries())
      if (c.actions.children[index] !== action)
        c.actions.insertBefore(action, c.actions.children[index] ?? null);
    c.actions.hidden = c.clear.hidden && c.eye.hidden && c.suffix.hidden;
    if (c.slotNames.has("hint")) c.slot("hint", c.field.hint);
    if (textarea && c.p.maxlength !== undefined) {
      text(c.counter, String(c.p.value ?? "").length + " / " + c.p.maxlength);
      c.field.hint.hidden = false;
      c.field.hint.append(c.counter);
    }
    scope(textarea ? c.input : c.box, c.name);
    scope(c.field.element, "FormField");
  }
  register("Input", {
    defaults: { type: "text", placeholder: "", autocomplete: "off" },
    init: (c) => initTextInput(c),
    paint: (c) => paintTextInput(c),
  });
  register("Textarea", {
    defaults: { rows: 3, placeholder: "" },
    init: (c) => initTextInput(c, true),
    paint: (c) => paintTextInput(c, true),
  });

  // ── 原生单选、多选与分组上下文 ───────────────────────────────────────────
  function choiceInit(c) {
    c.element.classList.add("my-choice-control");
    c.input = document.createElement("input");
    c.copy = el("span", "choice-copy");
    c.label = el("span", "choice-label");
    c.description = el("span", "choice-description");
    c.copy.append(c.label, c.description);
    c.element.append(c.input, c.copy);
    c.attributeTarget = c.input;
    c.on(c.input, "change", () => {
      if (c.input.disabled) return;
      if (c.name === "ChoiceControl") {
        c.p.checked = c.input.checked;
        c.paint();
        c.emit("checked", c.p.checked);
        return;
      }
      const group = parentController(c.element, [
        c.name === "Radio" ? "RadioGroup" : "CheckboxGroup",
      ]);
      if (c.p.indeterminate) {
        c.p.indeterminate = false;
        c.emit("indeterminate", false);
      }
      if (group) {
        group.set(
          c.name === "Radio"
            ? c.p.optionValue
            : updateSelection(
                group.p.value ?? [],
                c.p.optionValue,
                c.input.checked,
              ),
        );
        group.syncChildren?.();
      } else c.set(c.name === "Radio" ? c.p.optionValue : c.input.checked);
    });
  }
  function choicePaint(c) {
    const radio = c.name === "Radio" || c.p.type === "radio";
    const group = parentController(c.element, [
      radio ? "RadioGroup" : "CheckboxGroup",
    ]);
    const checked = group
      ? radio
        ? group.p.value === c.p.optionValue
        : (group.p.value ?? []).includes(c.p.optionValue)
      : c.name === "ChoiceControl"
        ? c.p.checked
        : radio
          ? c.p.value === c.p.optionValue
          : !!c.p.value;
    attrs(c.input, {
      type: radio ? "radio" : "checkbox",
      name: group
        ? (group.p.name ?? group.id)
        : (c.p.name ?? (radio ? c.id : undefined)),
      value: c.p.optionValue ?? c.p.value,
      disabled:
        c.p.disabled ||
        group?.p.disabled ||
        (group && c.p.optionValue === undefined),
      "aria-checked": c.p.indeterminate ? "mixed" : undefined,
    });
    c.input.checked = !!checked;
    c.input.indeterminate = !!c.p.indeterminate;
    state(c.element, { "is-list": c.p.list });
    c.copy.hidden = !c.p.label && !c.slotNames.has("default");
    c.slot("default", c.label, {}, c.p.label ?? "");
    text(c.description, c.p.description);
    c.description.hidden = !c.p.description;
    scope(c.element, "ChoiceControl");
  }
  for (const name of ["Radio", "Checkbox", "ChoiceControl"])
    register(name, { tag: "label", init: choiceInit, paint: choicePaint });
  function groupInit(c) {
    c.element.classList.add("my-choice-group");
    c.legend = el("legend");
    c.body = el("div", "choice-items");
    c.element.append(c.legend, c.body);
    c.syncChildren = () => {
      for (const node of c.body.querySelectorAll(
        '[data-my-component="Radio"],[data-my-component="Checkbox"]',
      ))
        controllers.get(node)?.paint();
    };
  }
  function groupPaint(c) {
    c.element.disabled = !!c.p.disabled;
    attrs(c.element, {
      role: c.name === "RadioGroup" ? "radiogroup" : undefined,
    });
    text(c.legend, c.p.label);
    c.legend.hidden = !c.p.label || !!c.attributes["aria-labelledby"];
    state(c.body, { inline: c.p.inline });
    if (c.slotNames.has("default")) c.slot("default", c.body);
    else {
      const signature = JSON.stringify(c.p.options ?? []);
      if (signature !== c.signature) {
        c.signature = signature;
        c.clear(c.body);
        c.items = (c.p.options ?? []).map((option) => {
          const child = c.child(
            c.name === "RadioGroup" ? "Radio" : "Checkbox",
            { ...option, label: option.label, optionValue: option.value },
          );
          c.body.append(child.element);
          return child;
        });
      }
    }
    c.syncChildren();
    scope(c.element, "ChoiceGroup");
  }
  for (const name of ["RadioGroup", "CheckboxGroup", "ChoiceGroup"])
    register(name, { tag: "fieldset", init: groupInit, paint: groupPaint });
  register("Choices", {
    tag: "fieldset",
    defaults: { type: "radio" },
    init(c) {
      groupInit(c);
    },
    paint(c) {
      const signature = JSON.stringify([c.p.options, c.p.type, c.p.list]);
      if (signature !== c.signature) {
        c.signature = signature;
        c.clear(c.body);
        c.items = (c.p.options ?? []).map((option) => {
          const child = c.child("ChoiceControl", {
            type: c.p.type,
            label: option.label,
            description: option.description,
            list: c.p.list,
            optionValue: option.value,
            name: c.id,
          });
          child.on(child.input, "change", () => {
            if (c.p.disabled || option.disabled) return;
            c.set(
              c.p.type === "checkbox"
                ? updateSelection(
                    c.p.value ?? [],
                    option.value,
                    child.input.checked,
                  )
                : option.value,
            );
          });
          c.body.append(child.element);
          return { option, child };
        });
      }
      text(c.legend, c.p.label);
      c.legend.hidden = !!c.p.list || !c.p.label;
      c.body.style.display = c.p.list ? "contents" : "";
      attrs(c.element, {
        role: c.p.type === "radio" ? "radiogroup" : "group",
        "aria-label": c.p.label,
      });
      c.element.className = names(c.p.list ? "list-stack" : "choice-group");
      c.element.disabled = !!c.p.disabled;
      for (const { option, child } of c.items ?? [])
        child.update({
          checked:
            c.p.type === "checkbox"
              ? (c.p.value ?? []).includes(option.value)
              : c.p.value === option.value,
          disabled: c.p.disabled || option.disabled,
        });
      scope(c.element, "ChoiceGroup");
    },
  });
  register("TagGroup", {
    init(c) {
      c.element.classList.add("my-tag-group");
    },
    paint(c) {
      attrs(c.element, { role: "group", "aria-label": c.p.label });
      const signature = JSON.stringify(c.p.options ?? []);
      if (signature !== c.signature) {
        c.signature = signature;
        c.clear(c.element);
        c.items = (c.p.options ?? []).map((option) => {
          const child = c.child("Tag", {
            label: option.label,
            value: false,
            _change: (checked) => {
              if (!c.p.disabled && !option.disabled)
                c.set(updateSelection(c.p.value ?? "", option.value, checked));
            },
          });
          c.element.append(child.element);
          return { option, child };
        });
      }
      for (const { option, child } of c.items ?? [])
        child.update({
          value: Array.isArray(c.p.value)
            ? c.p.value.includes(option.value)
            : c.p.value === option.value,
          disabled: c.p.disabled || option.disabled,
        });
    },
  });

  // ── 列表、分段和导航 ────────────────────────────────────────────────────
  register("ListRow", {
    tag: "button",
    init(c) {
      c.element.classList.add("my-list-row");
      c.leading = el("span", "leading-content");
      c.copy = el("span", "list-row-copy");
      c.title = el("strong");
      c.description = el("small");
      c.copy.append(c.title, c.description);
      c.trailing = el("span", "trailing-content");
      c.value = el("span", "list-selected-value");
      c.arrow = svgIcon("chevron-right");
      c.arrow.classList.add("my-trailing-icon");
      c.element.append(c.leading, c.copy, c.trailing, c.value, c.arrow);
      c.on(c.element, "click", (event) => {
        if (c.p.disabled) return;
        if (c.p.toggle) {
          if (c.element.tagName !== "LABEL") c.set(!c.p.value);
        } else c.emit("click", event);
      });
    },
    paint(c) {
      state(c.element, {
        "list-toggle": c.p.toggle,
        "list-action": !c.p.toggle,
        "is-disabled": c.p.disabled,
      });
      attrs(c.element, {
        type: c.element.tagName === "BUTTON" ? "button" : undefined,
        disabled: c.element.tagName === "BUTTON" && c.p.disabled,
        "aria-disabled": c.p.disabled || undefined,
      });
      text(c.title, c.p.title);
      text(c.description, c.p.description);
      c.description.hidden = !c.p.description;
      c.leading.hidden = !c.slotNames.has("leading");
      c.slot("leading", c.leading);
      c.slot("trailing", c.trailing);
      c.trailing.hidden = !c.slotNames.has("trailing") && !c.p.toggle;
      text(c.value, c.p.valueText ?? (!c.p.toggle ? c.p.value : ""));
      c.value.hidden =
        !!c.p.toggle || !!c.slotNames.has("trailing") || !c.value.textContent;
      // SVG 不反射 HTMLElement.hidden，必须写入属性才能真正隐藏默认箭头。
      attr(c.arrow, "hidden", !!c.p.toggle || c.slotNames.has("trailing"));
      const name = ["menu", "listbox"].includes(c.attributes["aria-haspopup"])
        ? "chevrons-up-down"
        : "chevron-right";
      if (c.arrowName !== name) {
        c.arrowName = name;
        c.arrow.innerHTML = icons[name];
      }
      if (c.p.toggle) {
        if (!c.switch) {
          c.switch = c.child("Switch", {
            label: c.p.title,
            _change: (value) => c.set(value),
          });
          c.switch.on(c.switch.element, "click", (event) =>
            event.stopPropagation(),
          );
          c.trailing.append(c.switch.element);
        }
        c.switch.update({
          value: !!c.p.value,
          disabled: c.p.disabled,
          label: c.p.title,
        });
      }
    },
  });
  register("CellGroup", {
    defaults: { mode: "normal" },
    init(c) {
      c.element.classList.add("my-cell-group");
      c.head = el("div", "group-heading");
      c.title = el("strong");
      c.description = el("p");
      c.head.append(c.title, c.description);
      c.body = el("div", "group-body");
      c.element.append(c.head, c.body);
    },
    paint(c) {
      text(c.title, c.p.title);
      text(c.description, c.p.description);
      c.title.hidden = !c.p.title;
      c.description.hidden = !c.p.description;
      c.head.hidden = !c.p.title && !c.p.description;
      attrs(c.body, {
        role: c.p.mode === "single" ? "radiogroup" : "group",
        "aria-label": c.p.label,
      });
      if (!c.p.options) {
        c.slot("default", c.body);
        return;
      }
      const signature = JSON.stringify(c.p.options);
      if (c.signature !== signature) {
        c.signature = signature;
        c.clear(c.body);
        c.items = c.p.options.map((item) => {
          const container = el("div", "row-slot");
          container.style.display = "contents";
          c.body.append(container);
          return { item, container };
        });
      }
      const select = (item) => {
        if (c.p.disabled || item.disabled) return;
        const value = selectListValue(c.p.mode, c.p.value, item.value);
        if (c.p.mode !== "normal") c.set(value);
        c.emit("select", item);
      };
      for (const entry of c.items) {
        const { item, container } = entry;
        const checked = isListSelected(c.p.mode, c.p.value, item.value);
        const row = {
          role:
            c.p.mode === "single"
              ? "radio"
              : c.p.mode === "multiple"
                ? "checkbox"
                : undefined,
          "aria-checked": c.p.mode === "normal" ? undefined : checked,
          tabindex: 0,
          disabled: !!(c.p.disabled || item.disabled),
          "data-cell-value": item.value,
          onClick: () => select(item),
          onKeydown: (event) => {
            const list = c.p.options.filter((item) => !item.disabled);
            if (
              ![
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "Home",
                "End",
              ].includes(event.key) ||
              !list.length
            )
              return;
            event.preventDefault();
            const index = list.indexOf(item);
            const next =
              list[
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? list.length - 1
                    : (index +
                        (["ArrowUp", "ArrowLeft"].includes(event.key)
                          ? -1
                          : 1) +
                        list.length) %
                      list.length
              ];
            c.body
              .querySelector(
                '[data-cell-value="' + CSS.escape(next.value) + '"]',
              )
              ?.focus();
            if (c.p.mode === "single") select(next);
          },
        };
        if (c.slotNames.has("item"))
          c.slot("item", container, { item, selected: checked, row });
        else {
          if (!entry.child) {
            entry.child = c.child("ListRow", {
              title: item.label,
              description: item.description,
            });
            container.append(entry.child.element);
          }
          entry.child.update({ disabled: row.disabled }, row);
        }
      }
    },
  });
  function optionsInit(c, kind) {
    c.element.classList.add(className(kind));
    c.buttons = el("div");
    c.buttons.style.display = "contents";
    c.element.append(c.buttons);
    c.on(c.element, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      const options = (c.p.options ?? []).filter((option) => !option.disabled);
      if (!options.length) return;
      event.preventDefault();
      const index = options.findIndex((option) => option.value === c.p.value);
      const item =
        options[
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : (index +
                  (event.key === "ArrowLeft" ? -1 : 1) +
                  options.length) %
                options.length
        ];
      c.set(item.value);
      c.items?.find((entry) => entry.item.value === item.value)?.button.focus();
    });
  }
  function optionsPaint(c, kind) {
    attrs(c.element, {
      "aria-label": c.p.label,
      role: kind === "segmented" ? "group" : undefined,
    });
    const signature = JSON.stringify(c.p.options ?? []);
    if (c.signature !== signature) {
      c.signature = signature;
      c.buttons.replaceChildren();
      c.items = (c.p.options ?? []).map((item) => {
        const button = el("button");
        button.type = "button";
        if (item.icon) button.append(svgIcon(item.icon));
        button.append(document.createTextNode(item.label));
        button.onclick = () => {
          if (!item.disabled) c.set(item.value);
        };
        c.buttons.append(button);
        return { item, button };
      });
    }
    c.element.style.setProperty("--segment-count", c.items.length || 1);
    c.element.style.setProperty(
      "--segment-shift",
      Math.max(
        0,
        c.items.findIndex((entry) => entry.item.value === c.p.value),
      ) *
        100 +
        "%",
    );
    c.element.style.setProperty(
      "--segment-index",
      Math.max(
        0,
        c.items.findIndex((entry) => entry.item.value === c.p.value),
      ),
    );
    for (const { item, button } of c.items) {
      const selected = item.value === c.p.value;
      state(button, { active: selected });
      attrs(button, {
        disabled: item.disabled,
        "aria-pressed": selected,
        "aria-current": kind === "navigation" && selected ? "page" : undefined,
      });
    }
    if (c.indicator)
      c.indicator.style.transform =
        "translateX(" +
        Math.max(
          0,
          c.items.findIndex((entry) => entry.item.value === c.p.value),
        ) *
          100 +
        "%)";
  }
  register("Segmented", {
    init: (c) => optionsInit(c, "segmented"),
    paint: (c) => optionsPaint(c, "segmented"),
  });
  register("Navigation", {
    tag: "nav",
    init: (c) => optionsInit(c, "navigation"),
    paint: (c) => optionsPaint(c, "navigation"),
  });
  register("Stepper", {
    defaults: { min: 0, max: 99, step: 1, label: "数量" },
    init(c) {
      c.element.classList.add("my-stepper");
      c.minus = el("button", "", "−");
      c.input = document.createElement("input");
      c.plus = el("button", "", "+");
      c.minus.type = c.plus.type = "button";
      attrs(c.input, { type: "number", inputmode: "numeric" });
      c.element.append(c.minus, c.input, c.plus);
      c.commit = (offset) => {
        const n = Number(c.input.value);
        c.set(
          clamp(
            (c.input.value.trim() && Number.isFinite(n)
              ? Math.trunc(n)
              : c.p.value) + (offset || 0),
            c.p.min,
            c.p.max,
          ),
        );
      };
      c.on(c.minus, "click", () => c.commit(-c.p.step));
      c.on(c.plus, "click", () => c.commit(c.p.step));
      c.on(c.input, "blur", () => c.commit());
      c.on(c.input, "keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          c.input.blur();
        }
      });
    },
    paint(c) {
      attrs(c.element, { role: "group", "aria-label": c.p.label });
      attrs(c.input, {
        min: c.p.min,
        max: c.p.max,
        step: c.p.step,
        "aria-label": c.p.label,
      });
      nativeValue(c.input, c.p.value);
      attrs(c.minus, {
        disabled: c.p.value <= c.p.min,
        "aria-label": "减少" + c.p.label,
      });
      attrs(c.plus, {
        disabled: c.p.value >= c.p.max,
        "aria-label": "增加" + c.p.label,
      });
    },
  });

  // ── 浮动窗口：布局只调整位置，视口确实放不下时才限制尺寸 ─────────────────
  function viewportRect() {
    const v = window.visualViewport;
    return {
      left: v?.offsetLeft ?? 0,
      top: v?.offsetTop ?? 0,
      right: (v?.offsetLeft ?? 0) + (v?.width ?? innerWidth),
      bottom: (v?.offsetTop ?? 0) + (v?.height ?? innerHeight),
    };
  }
  function anchorContext(anchor) {
    return anchor instanceof HTMLElement ? anchor : anchor?.contextElement;
  }

  // CSS 是进入/退出外观与时长的唯一来源；JS 只负责阶段和清理。
  function cssMotion(node, name, entering, done) {
    let frame = 0,
      timer = 0,
      stopped = false;
    const prefix = "my-" + name + (entering ? "-enter-" : "-leave-");
    const classes = ["active", "from", "to"].map((part) => prefix + part);
    const cleanup = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      node.classList.remove(...classes);
    };
    const finish = () => {
      if (stopped) return;
      stopped = true;
      cleanup();
      done?.();
    };
    let duration = 0;
    const transition = node.style.transitionProperty;
    node.style.transitionProperty = "none";
    node.classList.add(classes[0], classes[1]);
    void node.offsetWidth;
    node.style.transitionProperty = transition;
    void node.offsetWidth;
    if (reduced()) {
      node.classList.remove(...classes);
      queueMicrotask(finish);
    } else
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (stopped) return;
        node.classList.remove(classes[1]);
        node.classList.add(classes[2]);
        const style = getComputedStyle(node),
          seconds = (value) =>
            value
              .split(",")
              .map(
                (part) =>
                  parseFloat(part) * (part.trim().endsWith("ms") ? 1 : 1000),
              );
        const times = seconds(style.transitionDuration),
          delays = seconds(style.transitionDelay);
        duration = Math.max(
          0,
          ...times.map(
            (time, index) => time + (delays[index % delays.length] || 0),
          ),
        );
        // 同时等待遮罩和内部面板，不能让外层计时提前截断子元素过渡。
        const transitions = node
          .getAnimations({ subtree: true })
          .filter(
            (animation) => typeof animation.transitionProperty === "string",
          );
        if (transitions.length)
          Promise.allSettled(
            transitions.map((animation) => animation.finished),
          ).then(() => {
            if (!stopped) timer = setTimeout(finish, 0);
          });
        else timer = setTimeout(finish, duration);
      });
    return {
      cancel() {
        stopped = true;
        cleanup();
      },
    };
  }

  function makeFloating(owner, config) {
    const host = el("div", "floating-position"),
      panel = el("div", "floating-panel");
    host.append(panel);
    scope(host, "Floating");
    let visible = false,
      animation,
      resize,
      mutation,
      frame = 0,
      generation = 0,
      copied = new Set();
    const api = { host, panel, visible: () => visible };
    const inherit = (source) => {
      if (!source) return;
      const computed = getComputedStyle(source),
        baseline = getComputedStyle(document.body),
        next = new Set();
      // 全局明暗模式继续继承，不能把打开时的模式冻结在浮层上。
      host.style.colorScheme =
        computed.colorScheme === baseline.colorScheme
          ? ""
          : computed.colorScheme;
      for (let index = 0; index < computed.length; index++) {
        const key = computed[index];
        if (
          key.startsWith("--") &&
          computed.getPropertyValue(key) !== baseline.getPropertyValue(key)
        ) {
          host.style.setProperty(key, computed.getPropertyValue(key));
          next.add(key);
        }
      }
      for (const key of copied)
        if (!next.has(key)) host.style.removeProperty(key);
      copied = next;
    };
    api.place = () => {
      if (!visible) return;
      const anchor = config.anchor(),
        context = anchorContext(anchor),
        bounds = viewportRect();
      if (
        !anchor ||
        (context && (!context.isConnected || context.closest("[inert]")))
      ) {
        config.close?.();
        return;
      }
      const container =
        context?.closest('[aria-modal="true"]')?.parentElement ??
        config.container?.() ??
        document.body;
      if (host.parentElement !== container) container.append(host);
      inherit(context);
      const css = getComputedStyle(panel),
        number = (key, fallback) => {
          const value = parseFloat(css.getPropertyValue(key));
          return Number.isFinite(value) ? value : fallback;
        };
      const margin = Math.max(0, number("--floating-margin", 8)),
        heightLimit = Math.max(0, number("--floating-max-height", Infinity));
      const rect =
        anchor instanceof HTMLElement
          ? anchor.getBoundingClientRect()
          : {
              left: anchor.x,
              right: anchor.x,
              top: anchor.y,
              bottom: anchor.y,
            };
      const parentMoving = context
        ?.closest(".my-floating-panel")
        ?.getAnimations()
        .some((item) => item.playState === "running");
      const clip = { ...bounds };
      for (
        let parent = context?.parentElement;
        parent && parent !== document.body;
        parent = parent.parentElement
      ) {
        const style = getComputedStyle(parent),
          rect = parent.getBoundingClientRect();
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
          clip.left = Math.max(clip.left, rect.left);
          clip.right = Math.min(clip.right, rect.right);
        }
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
          clip.top = Math.max(clip.top, rect.top);
          clip.bottom = Math.min(clip.bottom, rect.bottom);
        }
      }
      if (
        context &&
        !floatingRectVisible(context.getBoundingClientRect(), clip) &&
        !parentMoving
      ) {
        config.close?.();
        return;
      }
      const previousScroll = panel.scrollTop;
      styles(host, {
        left: bounds.left + margin,
        top: bounds.top + margin,
        width: Math.max(0, bounds.right - bounds.left - 2 * margin),
      });
      panel.style.maxHeight =
        Math.min(heightLimit, bounds.bottom - bounds.top - 2 * margin) + "px";
      panel.style.width =
        config.matchWidth?.() && context
          ? context.getBoundingClientRect().width + "px"
          : "var(--floating-width,236px)";
      const desiredWidth = Math.min(
        Math.ceil(
          parseFloat(getComputedStyle(panel).width) || panel.offsetWidth,
        ),
        bounds.right - bounds.left - 2 * margin,
      );
      const result = resolveFloatingPosition({
        anchor: rect,
        viewport: bounds,
        width: desiredWidth,
        height: Math.min(panel.scrollHeight, heightLimit),
        placement: config.placement?.() ?? "bottom-start",
        gap: number("--floating-gap", anchor instanceof HTMLElement ? 8 : 4),
        margin,
        pointer: anchor instanceof HTMLElement ? undefined : anchor,
        pin: config.pin?.(),
      });
      styles(host, { left: result.left, top: result.top, width: result.width });
      panel.style.width = "100%";
      panel.style.maxHeight = Math.min(heightLimit, result.maxHeight) + "px";
      panel.scrollTop = previousScroll;
      panel.style.transformOrigin =
        result.originX + "px " + result.originY + "px";
      host.style.setProperty(
        "--floating-anchor-x",
        (rect.left + rect.right) / 2 - result.left + "px",
      );
      host.style.setProperty(
        "--floating-anchor-y",
        (rect.top + rect.bottom) / 2 - result.top + "px",
      );
      const source = config.pin?.()?.source;
      if (source) {
        host.style.setProperty(
          "--floating-source-x",
          source.left - result.left + "px",
        );
        host.style.setProperty(
          "--floating-source-y",
          source.top - result.top + "px",
        );
        host.style.setProperty(
          "--floating-source-height",
          source.height + "px",
        );
      }
      host.dataset.side = result.side;
      host.dataset.motion = config.motion?.() ?? "expand";
      host.classList.add("my-ready");
      api.position = result;
      config.placed?.(result);
      if (parentMoving) schedule();
    };
    const schedule = () => {
      if (visible && !frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          api.place();
        });
    };
    const scroll = (event) => {
      if (panel.contains(event.target) || event.target === panel) return;
      if (config.contains?.(event.target)) {
        if (event.target.contains?.(anchorContext(config.anchor()))) schedule();
        return;
      }
      if (config.anchor() instanceof HTMLElement) schedule();
      else config.close?.();
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      resize?.disconnect();
      mutation?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", scroll, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
    api.open = () => {
      if (visible) {
        api.place();
        return;
      }
      visible = true;
      generation++;
      animation?.cancel();
      host.inert = false;
      panel.inert = false;
      host.setAttribute("aria-hidden", "false");
      (config.container?.() ?? document.body).append(host);
      api.place();
      if (!visible) return;
      if (api.frozen) {
        for (const [key, value] of Object.entries(api.frozen))
          panel.style[key] = value;
        api.frozen = undefined;
      }
      panel.removeAttribute("data-dismissing");
      if (config.pin?.()?.source) panel.dataset.cascade = "";
      else panel.removeAttribute("data-cascade");
      animation = cssMotion(panel, "floating-motion", true);
      resize = new ResizeObserver(schedule);
      resize.observe(panel);
      const context = anchorContext(config.anchor());
      if (context) resize.observe(context);
      mutation = new MutationObserver(schedule);
      mutation.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["inert"],
      });
      window.addEventListener("resize", schedule, { passive: true });
      window.addEventListener("scroll", scroll, {
        capture: true,
        passive: true,
      });
      window.visualViewport?.addEventListener("resize", schedule, {
        passive: true,
      });
      window.visualViewport?.addEventListener("scroll", schedule, {
        passive: true,
      });
      const version = generation;
      requestAnimationFrame(() => {
        if (visible && version === generation) config.positioned?.();
      });
    };
    api.close = (options = {}) => {
      if (!visible) return;
      visible = false;
      const version = ++generation;
      stop();
      host.inert = true;
      host.setAttribute("aria-hidden", "true");
      const computed = getComputedStyle(panel);
      const opacity = computed.opacity;
      const snapshot = {
        transform: computed.transform,
        scale: computed.scale,
        translate: computed.translate,
        clipPath: computed.clipPath,
      };
      animation?.cancel();
      if (!options.return) {
        api.frozen = Object.fromEntries(
          Object.keys(snapshot).map((key) => [key, panel.style[key]]),
        );
        Object.assign(panel.style, snapshot);
        panel.style.setProperty("--floating-dismiss-opacity", opacity);
        panel.dataset.dismissing = "";
      } else panel.removeAttribute("data-dismissing");
      animation = cssMotion(panel, "floating-motion", false, () => {
        if (visible || version !== generation) return;
        host.remove();
        config.closed?.();
      });
    };
    api.destroy = () => {
      visible = false;
      generation++;
      animation?.cancel();
      stop();
      host.remove();
      config.destroyed?.();
      owner.cleanups.delete(api.destroy);
    };
    owner.cleanups.add(api.destroy);
    return api;
  }
  register("Floating", {
    defaults: { placement: "bottom-start", motion: "expand" },
    init(c) {
      c.element.style.display = "contents";
      c.floating = makeFloating(c, {
        anchor: () => c.p.anchor,
        placement: () => c.p.placement,
        matchWidth: () => c.p.matchWidth,
        motion: () => c.p.motion,
        close: () => c.set(false),
        positioned: () => c.emit("positioned"),
        closed: () => c.emit("after-leave"),
      });
      c.classTarget = c.attributeTarget = c.styleTarget = c.floating.panel;
      c.exposed.updatePosition = c.floating.place;
    },
    paint(c) {
      c.slot("default", c.floating.panel);
      c.applyAttrs(c.floating.panel);
      if (c.p.value) c.floating.open();
      else c.floating.close();
    },
  });

  // ── 共享模态栈：背景隔离、嵌套窗口、Tab 循环与返回焦点 ───────────────────
  const modalLayers = [],
    initialInert = new Map();
  let initialOverflow = "";
  function refreshModals() {
    const top = modalLayers.at(-1);
    modalLayers.forEach(
      (layer, index) => (layer.root.style.zIndex = String(100 + index)),
    );
    if (top) {
      for (const node of document.body.children) {
        if (
          !(node instanceof HTMLElement) ||
          ["SCRIPT", "STYLE"].includes(node.tagName)
        )
          continue;
        if (!initialInert.has(node)) initialInert.set(node, node.inert);
        node.inert = node !== top.root && !node.contains(top.root);
      }
    } else {
      for (const [node, inert] of initialInert) node.inert = inert;
      initialInert.clear();
      document.documentElement.style.overflow = initialOverflow;
    }
  }
  function acquireModal(root, close) {
    const previous = document.activeElement;
    const layer = { root, previous };
    if (!modalLayers.length) {
      initialOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
    }
    modalLayers.push(layer);
    refreshModals();
    const focus = () => {
      if (modalLayers.at(-1) === layer)
        (focusable(root)[0] ?? root.querySelector('[role="dialog"]'))?.focus({
          preventScroll: true,
        });
    };
    queueMicrotask(focus);
    const key = (event) => {
      if (modalLayers.at(-1) !== layer || event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "Tab") {
        const items = focusable(root),
          current = items.indexOf(document.activeElement);
        if (!items.length) {
          event.preventDefault();
          focus();
        } else if (event.shiftKey && current <= 0) {
          event.preventDefault();
          items.at(-1).focus();
        } else if (
          !event.shiftKey &&
          (current < 0 || current === items.length - 1)
        ) {
          event.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      const index = modalLayers.indexOf(layer),
        top = index === modalLayers.length - 1;
      for (const upper of modalLayers.slice(index + 1))
        if (root.contains(upper.previous)) upper.previous = previous;
      if (index >= 0) modalLayers.splice(index, 1);
      refreshModals();
      root.inert = true;
      if (top && previous?.isConnected && !previous.closest("[inert]"))
        previous.focus({ preventScroll: true });
    };
  }
  function overlayInit(c, kind) {
    c.kind = kind;
    c.element.style.display = "contents";
    c.overlay = el("div", kind === "dialog" ? "overlay" : kind + "-overlay");
    c.panel = el("div", kind === "sheet" ? "sheet-dialog" : kind);
    c.scrim = kind === "dialog" ? null : el("div", kind + "-scrim");
    if (c.scrim) c.overlay.append(c.scrim);
    c.overlay.append(c.panel);
    c.header = el(kind === "drawer" ? "header" : "div", kind + "-header");
    c.heading = el("h3");
    c.body = el("div", kind + "-body");
    c.actions = el("div", kind + "-actions");
    c.panel.append(c.header, c.body, c.actions);
    c.classTarget = c.attributeTarget = c.panel;
    c.styleTarget = c.overlay;
    attrs(c.panel, {
      tabindex: -1,
      role: "dialog",
      "aria-modal": true,
      "aria-labelledby": c.id + "-title",
    });
    attr(c.heading, "id", c.id + "-title");
    c.close = (reason) => {
      if (!c.opened) return;
      c.p.value = false;
      c.paint();
      c.emit("change", false);
      c.emit(reason ?? (kind === "drawer" ? "close" : "cancel"));
    };
    c.exposed.close = () => c.close();
    c.on(c.overlay, "click", (event) => {
      if (event.target === c.overlay && c.p.closeOnBackdrop !== false)
        c.close();
    });
    c.actionBar = c.child("PopupActions", {
      cancelText: c.p.cancelText,
      confirmText: c.p.confirmText,
      _cancel: () => c.close(),
      _confirm: () => c.close("confirm"),
    });
    c.actions.append(c.actionBar.element);
    if (kind === "drawer") {
      c.closeButton = el("button", "drawer-close");
      c.closeButton.type = "button";
      c.closeButton.append(svgIcon("x"));
      c.on(c.closeButton, "click", () => c.close());
    }
    c.swipe =
      kind === "dialog"
        ? null
        : swipeDismiss(
            c,
            c.panel,
            c.overlay,
            c.scrim,
            () => c.p.swipeable !== false,
            () => (kind === "sheet" ? "bottom" : (c.p.placement ?? "right")),
            () => c.close(),
          );
  }
  function overlayPaint(c) {
    const kind = c.kind;
    scope(c.overlay, c.name);
    text(c.heading, c.p.title);
    attrs(c.panel, { "aria-labelledby": c.id + "-title" });
    c.slot(
      "header",
      c.header,
      { titleId: c.id + "-title", close: () => c.close() },
      () => {
        const children = [];
        if (kind === "dialog" && c.p.icon !== false) {
          const icon = el("div", "dialog-icon");
          icon.append(svgIcon(c.p.icon ?? "shield"));
          children.push(icon);
        }
        children.push(c.heading);
        if (kind === "drawer") children.push(c.closeButton);
        return children;
      },
    );
    if (c.closeButton)
      attr(c.closeButton, "aria-label", "关闭" + (c.p.title ?? ""));
    if (!c.description) {
      c.description = el("p");
      attr(c.description, "id", c.id + "-description");
    }
    if (c.p.description) {
      text(c.description, c.p.description);
      if (c.body.firstChild !== c.description) c.body.prepend(c.description);
    } else c.description.remove();
    if (!c.content) {
      c.content = el("div");
      c.content.style.display = "contents";
      c.body.append(c.content);
    }
    if (c.slotNames.has("default")) c.slot("default", c.content);
    else if (kind === "sheet" && c.p.actions) {
      const signature = JSON.stringify(c.p.actions);
      if (c.signature !== signature) {
        c.signature = signature;
        c.clear(c.content);
        for (const item of c.p.actions) {
          const row = c.child(
            "ListRow",
            {
              title: item.label,
              description: item.description,
              disabled: item.disabled,
              _click: () => {
                c.close("select");
                c.emit("select", item);
              },
            },
            item.icon ? { leading: () => svgIcon(item.icon) } : {},
          );
          c.content.append(row.element);
        }
      }
    }
    c.body.hidden =
      kind === "dialog" && !c.p.description && !c.slotNames.has("default");
    attrs(c.panel, {
      "aria-describedby": c.p.description ? c.id + "-description" : undefined,
      "data-swipeable":
        kind !== "dialog" && c.p.swipeable !== false ? true : undefined,
    });
    c.actions.hidden = kind === "drawer" && !c.slotNames.has("actions");
    state(c.actions, { "custom-actions": c.slotNames.has("actions") });
    if (c.slotNames.has("actions"))
      c.slot("actions", c.actions, { close: () => c.close() });
    else {
      if (!c.actions.contains(c.actionBar.element))
        c.actions.append(c.actionBar.element);
      c.actionBar.update({
        cancelText: c.p.cancelText,
        confirmText: c.p.confirmText,
        danger: c.p.danger,
      });
    }
    state(c.overlay, {
      "at-bottom": kind === "dialog" && c.p.center === false,
    });
    if (kind === "drawer") {
      if (c.swipePlacement !== undefined && c.swipePlacement !== c.p.placement)
        c.swipe?.reset();
      c.swipePlacement = c.p.placement;
      for (const side of ["top", "bottom", "left", "right"])
        c.overlay.classList.toggle(className(side), side === c.p.placement);
    }
    c.applyAttrs(c.panel);
    scope(c.overlay, c.name);
    if (
      c.swipe &&
      (!c.p.value || c.p.swipeable === false) &&
      !c.overlay.hasAttribute("data-swipe-dismissed")
    )
      c.swipe.reset();
    if (!!c.p.value === !!c.opened) return;
    c.opened = !!c.p.value;
    c.motion?.cancel();
    if (c.opened) {
      document.body.append(c.overlay);
      c.overlay.inert = false;
      attr(c.overlay, "aria-hidden", false);
      c.overlay.classList.add("my-show");
      c.release = acquireModal(c.overlay, () => {
        if (c.p.closeOnEscape !== false) c.close();
      });
      c.motion = cssMotion(c.overlay, kind + "-motion", true);
    } else {
      c.release?.();
      c.release = undefined;
      c.overlay.inert = true;
      attr(c.overlay, "aria-hidden", true);
      c.overlay.classList.remove("my-show");
      c.motion = cssMotion(c.overlay, kind + "-motion", false, () => {
        if (c.opened) return;
        c.overlay.remove();
        c.swipe?.reset();
        c.emit("after-leave");
      });
    }
  }
  function overlayDestroy(c) {
    c.release?.();
    c.motion?.cancel();
    c.overlay.remove();
  }
  register("PopupActions", {
    defaults: { cancelText: "取消" },
    init(c) {
      c.element.classList.add("my-popup-actions");
      c.cancel = el("button");
      c.confirm = el("button");
      c.cancel.type = c.confirm.type = "button";
      c.element.append(c.cancel, c.confirm);
      c.on(c.cancel, "click", () => c.emit("cancel"));
      c.on(c.confirm, "click", () => c.emit("confirm"));
    },
    paint(c) {
      c.cancel.hidden = c.p.cancelText === false;
      c.confirm.hidden = !c.p.confirmText;
      text(c.cancel, c.p.cancelText ?? "取消");
      text(c.confirm, c.p.confirmText);
      state(c.element, { paired: !c.cancel.hidden && !c.confirm.hidden });
      state(c.confirm, { danger: c.p.danger });
      c.element.hidden = c.cancel.hidden && c.confirm.hidden;
    },
  });
  register("Dialog", {
    defaults: {
      icon: "shield",
      center: true,
      cancelText: "取消",
      confirmText: "确认保存",
      closeOnBackdrop: true,
      closeOnEscape: true,
    },
    init: (c) => overlayInit(c, "dialog"),
    paint: overlayPaint,
    destroy: overlayDestroy,
  });
  register("Sheet", {
    defaults: {
      cancelText: "取消",
      swipeable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
    },
    init: (c) => overlayInit(c, "sheet"),
    paint: overlayPaint,
    destroy: overlayDestroy,
  });
  register("Drawer", {
    defaults: {
      placement: "right",
      swipeable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
    },
    init: (c) => overlayInit(c, "drawer"),
    paint: overlayPaint,
    destroy: overlayDestroy,
  });

  // ── 菜单：同一控制器处理点击、右键、触屏长按与任意级联 ───────────────────
  const menuControllers = new Set();
  function menuInit(c) {
    c.element.classList.add("my-menu-host");
    c.levels = [];
    c.retiringLevels = new Set();
    c.isOpen = false;
    c.lastOpenProp = Symbol("initial");
    const handled = new WeakSet();
    let press,
      hold,
      suppress = false,
      touchClickSource,
      search = "",
      searchTimer,
      hoverTimer;
    const contains = (target) =>
      target instanceof Node &&
      c.levels.some((level) => level.floating.host.contains(target));
    const source = (event) => {
      const target =
        event?.currentTarget instanceof HTMLElement &&
        event.currentTarget !== c.element
          ? event.currentTarget
          : event?.target instanceof Element
            ? event.target.closest("button,[tabindex]")
            : null;
      return target && c.element.contains(target)
        ? target
        : (c.element.querySelector("button,[tabindex]") ?? c.element);
    };
    const focusRow = (level, item) => {
      if (!level || !item) return;
      level.active = item.value;
      for (const entry of level.entries) {
        const node =
          entry.child?.element ??
          entry.container.querySelector("[data-menu-item]");
        if (node) node.tabIndex = entry.item.value === item.value ? 0 : -1;
      }
      const node = level.entries.find(
        (entry) => entry.item.value === item.value,
      );
      const element =
        node?.child?.element ??
        node?.container.querySelector("[data-menu-item]");
      element?.focus({ preventScroll: true });
      if (element) {
        const panel = level.floating.panel;
        let top = 0;
        for (
          let node = element;
          node && node !== panel;
          node = node.offsetParent
        )
          top += node.offsetTop;
        if (top < panel.scrollTop) panel.scrollTop = top;
        else if (
          top + element.offsetHeight >
          panel.scrollTop + panel.clientHeight
        )
          panel.scrollTop = top + element.offsetHeight - panel.clientHeight;
      }
    };
    c.focus = (intent) => {
      const level = c.levels.at(-1);
      if (!level) return;
      if (!level.positioned) {
        level.pendingFocus = intent ?? "selected";
        return;
      }
      const items = level.options.filter((item) => !item.disabled);
      if (!items.length) {
        level.list.focus({ preventScroll: true });
        return;
      }
      focusRow(
        level,
        intent === "last"
          ? items.at(-1)
          : intent === "first"
            ? items[0]
            : (items.find((item) => selected(item)) ?? items[0]),
      );
    };
    const selected = (item) =>
      item.children?.length
        ? item.children.some(selected)
        : isListSelected(c.p.mode, c.p.value, item.value);
    const cancelPress = () => {
      if (press?.kind === "click") suppress = true;
      clearTimeout(hold);
      press = undefined;
    };
    c.close = (restore = false) => {
      cancelPress();
      if (!c.isOpen) return;
      c.isOpen = false;
      clearTimeout(hoverTimer);
      clearTimeout(searchTimer);
      if (restore && c.source?.isConnected && !c.source.closest("[inert]"))
        c.source.focus({ preventScroll: true });
      const previous = c.levels.splice(0);
      for (const level of previous) {
        c.retiringLevels.add(level);
        level.content.inert = true;
        level.floating.close();
      }
      c.emit("open", false);
      c.paint();
      c.changed();
    };
    const shiftAncestors = (level) => {
      let shift = (level.ownShift ?? 0) + (level.childShift ?? 0);
      for (let parent = level.parent; parent; parent = parent.parent) {
        parent.childShift = shift;
        parent.floating.panel.style.translate = "0px " + shift + "px";
        shift += parent.ownShift ?? 0;
      }
    };
    const returnTo = (index, restoreFocus = true) => {
      if (index < 0) return;
      c.levels.splice(index + 1).forEach((level) => {
        c.retiringLevels.add(level);
        level.content.inert = true;
        level.floating.close({ return: true });
      });
      const level = c.levels[index];
      level.content.inert = false;
      level.content.removeAttribute("aria-hidden");
      level.floating.panel.style.scale = "1";
      level.floating.panel.style.translate = "0px 0px";
      level.childShift = 0;
      shiftAncestors(level);
      level.returnButton?.remove();
      level.returnButton = undefined;
      const branch = level.branch;
      level.branch = undefined;
      paintRows(level);
      if (!restoreFocus) level.list.focus({ preventScroll: true });
      else
        focusRow(
          level,
          level.options.find((item) => item.value === branch) ??
            level.options.find((item) => !item.disabled),
        );
    };
    const choose = (item) => {
      if (item.disabled || !c.isOpen) return;
      const next = selectListValue(c.p.mode, c.p.value, item.value);
      if (c.p.closeOnSelect ?? c.p.mode !== "multiple") c.close(true);
      queueMicrotask(() => {
        if (c.disposed) return;
        if (c.p.mode !== "normal") {
          c.p.value = next;
          c.emit("change", next);
          for (const level of c.levels) paintRows(level);
        }
        c.emit("select", item);
      });
    };
    const fitsBeside = (level) => {
      if (innerWidth <= 760 || level.stacked) return false;
      const rect = level.floating.host.getBoundingClientRect(),
        v = viewportRect();
      return (
        Math.max(rect.left - v.left - 8, v.right - rect.right - 8) >=
        level.floating.panel.offsetWidth - 4
      );
    };
    const branch = (level, item, moveFocus = true) => {
      if (item.disabled || !item.children?.length || !c.isOpen) return;
      clearTimeout(hoverTimer);
      const index = c.levels.indexOf(level);
      if (index < 0) return;
      if (level.branch === item.value && c.levels[index + 1]) {
        if (moveFocus) c.focus();
        return;
      }
      if (c.levels.length > index + 1) returnTo(index);
      const row = level.entries.find(
        (entry) => entry.item.value === item.value,
      );
      const element =
        row.child?.element ?? row.container.querySelector("[data-menu-item]");
      if (!element) return;
      const stacked = !fitsBeside(level);
      let pin,
        anchor = element;
      if (stacked) {
        const rect = level.floating.host.getBoundingClientRect(),
          rowRect = element.getBoundingClientRect();
        pin = {
          left: rect.left,
          top: rowRect.top,
          bottom: rowRect.bottom,
          side: "bottom",
          parent: {
            top: rect.top,
            bottom: rect.top + level.floating.panel.clientHeight,
            reserve: level.reserve ?? 0,
          },
          source: {
            left: rowRect.left,
            top: rowRect.top,
            height: element.offsetHeight,
          },
        };
        anchor = {
          x: rect.left + level.floating.panel.offsetWidth / 2,
          y: rowRect.top,
          contextElement: c.source,
        };
        level.content.inert = true;
        attr(level.content, "aria-hidden", true);
        level.floating.panel.style.transformOrigin = "top left";
        level.floating.panel.style.scale = ".94";
        element.dataset.menuSource = "";
        const back = (level.returnButton = el("button", "menu-parent-return"));
        attrs(back, {
          type: "button",
          tabindex: -1,
          "aria-label": "返回：" + level.label,
          "data-menu-parent-return": true,
        });
        back.style.top = level.floating.panel.scrollTop + "px";
        back.style.height = level.floating.panel.clientHeight + "px";
        back.onclick = () => returnTo(index);
        back.onwheel = (event) => event.preventDefault();
        scope(back, "MenuPanel");
        level.floating.panel.append(back);
      }
      level.branch = item.value;
      paintRows(level);
      const child = buildLevel(item.children, item.label, anchor, {
        stacked,
        pin,
        parent: level,
        returnItem: item,
      });
      c.levels.push(child);
      paintRows(level);
      child.floating.open();
      if (moveFocus) c.focus();
    };
    const paintRows = (level) => {
      for (const entry of level.entries) {
        const { item, container } = entry;
        const expanded =
          level.branch === item.value &&
          c.levels.some((child) => child.parent === level);
        const checked = selected(item);
        const row = {
          role: c.p.mode === "normal" ? "menuitem" : "option",
          "aria-selected": c.p.mode === "normal" ? undefined : checked,
          "aria-haspopup": item.children?.length
            ? c.p.mode === "normal"
              ? "menu"
              : "listbox"
            : undefined,
          "aria-expanded": item.children?.length ? expanded : undefined,
          "aria-disabled": item.disabled || undefined,
          disabled: !!item.disabled,
          tabindex: level.active === item.value ? 0 : -1,
          "data-menu-item": item.value,
          onClick: (event) => {
            if (item.children?.length) branch(level, item);
            else choose(item);
          },
          onPointerenter: (event) => {
            if (
              event.pointerType !== "mouse" ||
              innerWidth <= 760 ||
              level.stacked ||
              !fitsBeside(level)
            )
              return;
            clearTimeout(hoverTimer);
            if (level.branch && level.branch !== item.value)
              returnTo(c.levels.indexOf(level));
            if (!item.disabled && item.children?.length)
              hoverTimer = setTimeout(
                () => {
                  if (c.isOpen) branch(level, item, false);
                },
                Number.isFinite(c.p.hoverDelay)
                  ? Math.max(0, c.p.hoverDelay)
                  : 200,
              );
          },
          onPointerleave: () => clearTimeout(hoverTimer),
          onFocus: () => {
            level.active = item.value;
            for (const entry of level.entries) {
              const node =
                entry.child?.element ??
                entry.container.querySelector("[data-menu-item]");
              if (node)
                node.tabIndex = entry.item.value === item.value ? 0 : -1;
            }
          },
        };
        if (c.slotNames.has("item")) {
          c.slot("item", container, { item, selected: checked, expanded, row });
          level.outlets.add(container);
        } else {
          entry.child.update(
            {
              title: item.label,
              description: item.description,
              disabled: item.disabled,
            },
            row,
          );
          state(entry.child.element, { "menu-option": true });
          scope(entry.child.element, "MenuPanel");
          if (entry.check) state(entry.check, { selected: checked });
        }
      }
      c.changed();
    };
    const buildLevel = (options, label, anchor, settings = {}) => {
      const level = {
        options,
        label,
        anchor,
        ...settings,
        rows: [],
        entries: [],
        outlets: new Set(),
        active: options.find((item) => !item.disabled)?.value,
      };
      level.floating = makeFloating(c, {
        anchor: () => level.anchor,
        placement: () => (level.parent ? "right-start" : c.p.placement),
        matchWidth: () => c.p.matchWidth,
        motion: () => c.p.motion,
        pin: () => level.pin,
        contains,
        container: () => level.parent?.floating.host.parentElement,
        destroyed: () => {
          c.retiringLevels.delete(level);
          level.stopKeydown?.();
          level.rows.forEach((row) => row.destroy());
          level.outlets.forEach((target) => {
            c.outlets.delete(target);
            c.nativeSlots.delete(target);
          });
          if (
            level.parent &&
            !c.levels.some(
              (child) =>
                child.parent === level.parent &&
                child.returnItem?.value === level.returnItem?.value,
            )
          ) {
            const row = level.parent.entries.find(
              (entry) => entry.item.value === level.returnItem?.value,
            );
            (
              row?.child?.element ??
              row?.container.querySelector("[data-menu-item]")
            )?.removeAttribute("data-menu-source");
          }
          c.changed();
        },
        closed: () => level.floating.destroy(),
        close: () =>
          level.parent
            ? returnTo(c.levels.indexOf(level) - 1, false)
            : c.close(),
        placed: (result) => {
          if (c.levels.some((child) => child.parent === level && child.stacked))
            level.floating.panel.style.transformOrigin = "top left";
          level.reserve = result.stack?.reserve ?? 0;
          if (result.stack && level.parent) {
            level.ownShift = result.stack.shift;
            shiftAncestors(level);
          }
        },
        positioned: () => {
          level.positioned = true;
          if (level === c.levels.at(-1)) {
            if (level.pendingFocus) c.focus(level.pendingFocus);
            else if (!contains(document.activeElement)) c.focus();
            level.pendingFocus = undefined;
          }
        },
      });
      if (level.parent && !level.stacked)
        level.floating.panel.style.setProperty("--floating-gap", "-4px");
      if (c.attributes.style) styles(level.floating.panel, c.attributes.style);
      level.content = el("div", "menu-panel-content");
      level.list = el("div", "menu-list");
      state(level.list, { selectable: c.p.mode !== "normal" });
      attrs(level.list, {
        id: level.parent ? c.id + "-sub-" + c.levels.length : c.id + "-menu",
        role: c.p.mode === "normal" ? "menu" : "listbox",
        "aria-label": label,
        "aria-multiselectable": c.p.mode === "multiple" ? true : undefined,
        tabindex: -1,
      });
      level.floating.panel.append(level.content);
      if (level.stacked) {
        const back = c.child(
          "ListRow",
          {
            title: label,
            description: settings.returnItem?.description,
            _click: () => returnTo(c.levels.indexOf(level) - 1),
          },
          { trailing: () => svgIcon("chevrons-up-down") },
        );
        back.element.classList.add("my-menu-back");
        attrs(back.element, {
          "aria-label": "返回：" + label,
          "data-menu-back": true,
        });
        level.rows.push(back);
        level.content.append(back.element);
      }
      level.content.append(level.list);
      for (const item of options) {
        const container = el("div", "row-slot");
        container.style.display = "contents";
        level.list.append(container);
        const entry = { item, container };
        level.entries.push(entry);
        if (!c.slotNames.has("item")) {
          const trailing = () => {
            const box = el("span");
            box.style.display = "contents";
            if (item.children?.length) {
              const desktop = svgIcon("chevron-right"),
                mobile = svgIcon("chevrons-up-down");
              desktop.classList.add(
                "my-menu-chevron",
                "my-menu-chevron-desktop",
              );
              mobile.classList.add("my-menu-chevron", "my-menu-chevron-mobile");
              box.append(desktop, mobile);
            } else if (c.p.mode !== "normal") {
              entry.check = svgIcon("check");
              entry.check.classList.add("my-menu-check");
              box.append(entry.check);
            }
            return box;
          };
          entry.child = c.child(
            "ListRow",
            { title: item.label, description: item.description },
            {
              ...(item.icon ? { leading: () => svgIcon(item.icon) } : {}),
              trailing,
            },
          );
          level.rows.push(entry.child);
          container.append(entry.child.element);
        }
      }
      level.stopKeydown = c.on(level.content, "keydown", (event) => {
        if (
          event.target.closest("[data-menu-back]") &&
          ["Enter", " "].includes(event.key)
        ) {
          event.preventDefault();
          event.stopPropagation();
          returnTo(c.levels.indexOf(level) - 1);
          return;
        }
        if (["Escape", "ArrowLeft"].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          if (level.parent) returnTo(c.levels.indexOf(level) - 1);
          else c.close(true);
          return;
        }
        if (
          event.target.matches("input,textarea,select") ||
          event.target.isContentEditable
        )
          return;
        const items = level.options.filter((item) => !item.disabled),
          index = items.findIndex((item) => item.value === level.active);
        if (["ArrowRight", "Enter", " "].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          const item = items[index];
          if (item?.children?.length) branch(level, item);
          else if (item && event.key !== "ArrowRight") choose(item);
        } else if (
          ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) &&
          items.length
        ) {
          event.preventDefault();
          event.stopPropagation();
          if (level.branch) returnTo(c.levels.indexOf(level));
          const next =
            items[
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? items.length - 1
                  : (index +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      items.length) %
                    items.length
            ];
          focusRow(level, next);
        } else if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          clearTimeout(searchTimer);
          search =
            search === event.key.toLowerCase()
              ? search
              : search + event.key.toLowerCase();
          const ordered = [
            ...items.slice(index + 1),
            ...items.slice(0, index + 1),
          ];
          const item = ordered.find((item) =>
            item.label.toLowerCase().startsWith(search),
          );
          if (item) {
            event.preventDefault();
            focusRow(level, item);
          }
          searchTimer = setTimeout(() => (search = ""), 500);
        }
      });
      paintRows(level);
      scope(level.floating.panel, "MenuPanel");
      return level;
    };
    c.show = (anchor, intent = "selected") => {
      cancelPress();
      if (c.p.disabled || !(c.p.options ?? []).length) return;
      if (c.isOpen) c.close();
      // 新窗口接管时立即清理旧树，避免退出中的窗口与新窗口重叠。
      for (const level of [...c.retiringLevels]) level.floating.destroy();
      if (anchor instanceof MouseEvent || anchor instanceof PointerEvent) {
        c.source = source(anchor);
        c.anchorValue =
          c.p.anchor === "element" ||
          (anchor.detail === 0 && anchor.type !== "contextmenu")
            ? c.source
            : {
                x: anchor.clientX,
                y: anchor.clientY,
                contextElement: c.source,
              };
      } else if (anchor instanceof HTMLElement) {
        c.source = anchor;
        c.anchorValue = anchor;
      } else if (anchor) {
        c.source = anchor.contextElement ?? source();
        c.anchorValue = { ...anchor, contextElement: c.source };
      } else {
        c.source = source();
        c.anchorValue = c.source;
      }
      if (c.source?.matches(':disabled,[aria-disabled="true"]')) return;
      for (const other of menuControllers) if (other !== c) other.close();
      c.isOpen = true;
      const level = buildLevel(c.p.options, c.p.label, c.anchorValue);
      c.levels.push(level);
      level.floating.open();
      c.focus(intent);
      c.emit("open", true);
      c.paint();
      c.changed();
    };
    c.toggle = (event) => {
      event?.stopPropagation();
      if (event?.detail && suppress) {
        suppress = false;
        return;
      }
      if (c.isOpen) c.close(true);
      else c.show(event);
    };
    const valid = (pending, x, y) => {
      if (pending.kind !== c.p.trigger || c.p.disabled || !c.p.options?.length)
        return false;
      if (
        pending.cancelled ||
        !pending.element.isConnected ||
        pending.element.closest("[inert]")
      )
        return false;
      const rect = pending.element.getBoundingClientRect(),
        hit = document.elementFromPoint(x, y);
      return (
        x >= rect.left &&
        x < rect.right &&
        y >= rect.top &&
        y < rect.bottom &&
        !!hit &&
        pending.element.contains(hit)
      );
    };
    const showPress = (pending) =>
      c.show(
        c.p.anchor === "element"
          ? pending.element
          : { x: pending.x, y: pending.y, contextElement: pending.element },
      );
    const held = () => {
      const pending = press;
      if (pending?.touch && valid(pending, pending.cx, pending.cy)) {
        showPress(pending);
        touchClickSource = pending.element;
      }
    };
    c.pointerdown = (event) => {
      if (handled.has(event)) return;
      handled.add(event);
      const touch = event.pointerType === "touch";
      if (
        c.p.disabled ||
        !c.p.options?.length ||
        event.isPrimary === false ||
        (c.p.trigger === "contextmenu"
          ? event.button !== 2 && !touch
          : event.button !== 0)
      )
        return;
      const element = source(event);
      press = {
        kind: c.p.trigger,
        id: event.pointerId,
        button: event.button,
        touch,
        x: event.clientX,
        y: event.clientY,
        cx: event.clientX,
        cy: event.clientY,
        element,
        cancelled: false,
      };
      if (touch && c.p.trigger === "contextmenu") hold = setTimeout(held, 500);
      event.stopPropagation();
    };
    c.contextmenu = (event) => {
      if (c.p.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      if (press?.touch) held();
    };
    c.bindings = () => ({
      "aria-haspopup": c.p.mode === "normal" ? "menu" : "listbox",
      "aria-expanded": c.isOpen,
      "aria-controls": c.id + "-menu",
      "aria-disabled": c.p.disabled || undefined,
      tabindex: c.p.disabled ? -1 : 0,
      onClick: c.p.trigger === "click" ? c.toggle : undefined,
      onPointerdown: c.pointerdown,
      onContextmenu: c.p.trigger === "contextmenu" ? c.contextmenu : undefined,
    });
    c.on(c.element, "pointerdown", c.pointerdown);
    c.on(c.element, "click", (event) => {
      if (!event.cancelBubble && c.p.trigger === "click") c.toggle(event);
    });
    c.on(c.element, "contextmenu", (event) => {
      if (c.p.trigger === "contextmenu") c.contextmenu(event);
    });
    c.on(c.element, "keydown", (event) => {
      const context =
        event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
      if (
        context ||
        ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)
      ) {
        if (c.p.trigger === "contextmenu" && !context) return;
        event.preventDefault();
        event.stopPropagation();
        c.show(source(event), event.key === "ArrowUp" ? "last" : "selected");
      }
    });
    c.on(
      document,
      "pointerdown",
      (event) => {
        cancelPress();
        clearTimeout(hoverTimer);
        suppress = false;
        touchClickSource = undefined;
        if (!c.isOpen) return;
        if (event.button === 0 && contains(event.target)) return;
        c.close();
      },
      true,
    );
    c.on(
      document,
      "pointermove",
      (event) => {
        if (!press || event.pointerId !== press.id) return;
        for (const point of [...(event.getCoalescedEvents?.() ?? []), event])
          if (
            Math.hypot(point.clientX - press.x, point.clientY - press.y) > 20
          ) {
            press.cancelled = true;
            clearTimeout(hold);
          }
        press.cx = event.clientX;
        press.cy = event.clientY;
      },
      { capture: true, passive: true },
    );
    c.on(
      document,
      "pointerup",
      (event) => {
        if (!press || event.pointerId !== press.id) return;
        const pending = press;
        press = undefined;
        clearTimeout(hold);
        if (c.p.trigger === "click") suppress = true;
        if (
          (c.p.trigger === "contextmenu" && pending.touch) ||
          pending.button !== event.button ||
          !valid(pending, event.clientX, event.clientY)
        )
          return;
        showPress(pending);
      },
      true,
    );
    c.on(document, "pointercancel", cancelPress, true);
    c.on(window, "blur", cancelPress);
    c.on(window, "scroll", cancelPress, { capture: true, passive: true });
    c.on(
      document,
      "click",
      (event) => {
        if (!touchClickSource || !event.detail) return;
        const block =
          touchClickSource.contains(event.target) || contains(event.target);
        touchClickSource = undefined;
        if (block) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    c.on(
      document,
      "keydown",
      (event) => {
        if (
          !c.isOpen ||
          event.key !== "Tab" ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey
        )
          return;
        const level = c.levels.at(-1);
        if (!level || level.floating.host.closest("[inert]")) return;
        event.preventDefault();
        event.stopPropagation();
        if (!level.positioned) {
          level.pendingFocus = event.shiftKey ? "last" : "first";
          return;
        }
        const items = [
          ...level.content.querySelectorAll(
            "[data-menu-item],button,[href],input,textarea,select,[tabindex],[contenteditable]",
          ),
        ].filter(
          (node) =>
            !node.matches(':disabled,[aria-disabled="true"]') &&
            !node.closest(
              '[inert],[hidden],[aria-hidden="true"],[aria-disabled="true"]',
            ) &&
            node.getClientRects().length &&
            getComputedStyle(node).visibility !== "hidden" &&
            (node.hasAttribute("data-menu-item") ||
              node.tabIndex >= 0 ||
              node.isContentEditable),
        );
        const index = items.indexOf(document.activeElement),
          next =
            items[
              index < 0
                ? event.shiftKey
                  ? items.length - 1
                  : 0
                : (index + (event.shiftKey ? -1 : 1) + items.length) %
                  items.length
            ];
        const target = next ?? level.list;
        target.focus({ preventScroll: true });
        const rect = target.getBoundingClientRect(),
          bounds = level.floating.panel.getBoundingClientRect();
        if (rect.top < bounds.top)
          level.floating.panel.scrollTop -= bounds.top - rect.top;
        else if (rect.bottom > bounds.bottom)
          level.floating.panel.scrollTop += rect.bottom - bounds.bottom;
      },
      true,
    );
    c.refresh = () => {
      if (c.isOpen && c.levels[0]?.options !== c.p.options) {
        const root = c.levels[0];
        if (
          root.entries.length === c.p.options?.length &&
          root.entries.every(
            (entry, index) => entry.item.value === c.p.options[index].value,
          )
        ) {
          root.options = c.p.options;
          root.entries.forEach(
            (entry, index) => (entry.item = c.p.options[index]),
          );
        } else {
          c.show(c.anchorValue);
          return;
        }
      }
      for (const level of c.levels) paintRows(level);
    };
    c.exposed = { show: c.show, close: () => c.close(true), toggle: c.toggle };
    menuControllers.add(c);
    c.cleanups.add(() => {
      cancelPress();
      clearTimeout(hoverTimer);
      clearTimeout(searchTimer);
      menuControllers.delete(c);
    });
  }
  register("Menu", {
    defaults: {
      label: "菜单",
      mode: "normal",
      trigger: "click",
      anchor: "pointer",
      placement: "bottom-start",
      motion: "expand",
      hoverDelay: 200,
    },
    init: menuInit,
    paint(c) {
      c.slot("default", c.element, {
        trigger: c.bindings(),
        toggle: c.toggle,
        open: c.isOpen,
        controls: c.id + "-menu",
      });
      if (c.p.disabled) c.close();
      if (c.p.open !== c.lastOpenProp) {
        c.lastOpenProp = c.p.open;
        if (c.p.open && !c.isOpen) queueMicrotask(() => c.show());
        else if (!c.p.open && c.isOpen) c.close();
      }
      c.refresh();
    },
    destroy(c) {
      c.close();
    },
  });
  register("Popover", {
    defaults: {
      label: "菜单",
      mode: "single",
      trigger: "click",
      anchor: "pointer",
      placement: "bottom-start",
      motion: "expand",
      hoverDelay: 200,
    },
    init: menuInit,
    paint: definitions.Menu.paint,
    destroy: definitions.Menu.destroy,
  });
  register("Select", {
    init(c) {
      c.element.classList.add("my-select");
      c.label = el("label", "field-label");
      c.button = el("button", "input-box select-trigger");
      c.button.type = "button";
      c.value = el("span", "select-value");
      c.arrow = svgIcon("chevrons-up-down");
      c.arrow.classList.add("my-select-chevron");
      c.button.append(c.value, c.arrow);
      c.menu = c.child(
        "Menu",
        {
          options: [],
          mode: "single",
          anchor: "element",
          motion: "slide",
          matchWidth: true,
          _change: (value) => c.set(value),
        },
        { default: c.button },
      );
      c.element.append(c.label, c.menu.element);
      c.hint = el("div", "field-foot");
      c.element.append(c.hint);
    },
    paint(c) {
      text(c.label, c.p.label);
      attr(c.label, "for", c.id);
      attr(c.button, "id", c.id);
      text(
        c.value,
        (c.p.options ?? []).find((item) => item.value === c.p.value)?.label ??
          "请选择",
      );
      c.button.disabled = !!c.p.disabled;
      c.menu.update({
        options: c.p.options ?? [],
        value: c.p.value,
        label: c.p.label,
        disabled: c.p.disabled,
      });
      Object.assign(c.button, c.menu.bindings());
      for (const [key, value] of Object.entries(c.menu.bindings()))
        if (!key.startsWith("on")) attr(c.button, key, value);
      c.slot("hint", c.hint);
      c.hint.hidden = !c.slotNames.has("hint");
      scope(c.element, "Select");
    },
  });

  register("Combobox", {
    defaults: {
      placeholder: "搜索或选择…",
      clearable: false,
      emptyText: "没有匹配的选项",
    },
    init(c) {
      c.element.classList.add("my-combobox");
      c.query = "";
      c.searching = false;
      c.opened = false;
      c.active = undefined;
      c.input = c.child(
        "Input",
        {
          label: c.p.label,
          value: "",
          clearable: c.p.clearable,
          _change: (value) => {
            c.open();
            c.query = value;
            if (!c.composing) c.search();
          },
        },
        { suffix: () => svgIcon("chevrons-up-down") },
      );
      c.element.append(c.input.element);
      c.attributeTarget = c.input.input;
      c.hiddenInput = document.createElement("input");
      c.hiddenInput.type = "hidden";
      c.element.append(c.hiddenInput);
      c.floating = makeFloating(c, {
        anchor: () => c.input.box,
        placement: () => "bottom-start",
        matchWidth: () => true,
        motion: () => "fade",
        close: () => c.close(),
      });
      c.floating.panel.classList.add("my-combobox-panel");
      c.list = el("div", "combobox-list");
      c.status = el("p", "combobox-status");
      c.floating.panel.append(c.list, c.status);
      c.list.id = c.id + "-options";
      c.open = () => {
        if (c.opened || c.p.disabled || c.input.input.readOnly) return;
        for (const menu of menuControllers) menu.close();
        c.opened = true;
        c.query = c.current?.label ?? "";
        c.searching = false;
        c.active = c.p.value;
        c.paint();
        c.floating.open();
        c.emit("search", "");
      };
      c.close = () => {
        if (!c.opened) return;
        c.opened = false;
        c.floating.close();
        c.paint();
      };
      c.search = () => {
        c.searching = true;
        c.active = undefined;
        if (!c.query && c.p.value) {
          c.p.value = "";
          c.emit("change", "");
        }
        c.paint();
        c.emit("search", c.query);
      };
      c.choose = (option) => {
        if (c.p.disabled || c.p.loading || option.disabled || !c.opened) return;
        c.cached = option;
        c.close();
        queueMicrotask(() => {
          c.set(option.value);
          c.emit("select", option);
        });
      };
      c.on(c.input.input, "focus", c.open);
      c.on(c.input.input, "click", c.open);
      c.on(c.input.input, "compositionstart", () => (c.composing = true));
      c.on(c.input.input, "compositionend", () => {
        c.composing = false;
        c.query = c.input.input.value;
        c.search();
      });
      c.on(c.input.input, "blur", () =>
        queueMicrotask(() => {
          if (
            !c.element.contains(document.activeElement) &&
            !c.floating.host.contains(document.activeElement)
          )
            c.close();
        }),
      );
      c.on(c.input.input, "keydown", (event) => {
        if (event.isComposing || c.composing || event.keyCode === 229) return;
        if (event.key === "Tab") {
          c.close();
          return;
        }
        if (event.key === "Escape" && c.opened) {
          event.preventDefault();
          event.stopPropagation();
          c.close();
          return;
        }
        if (event.key === "Enter" && c.opened) {
          event.preventDefault();
          const option = c.matches.find(
            (item) => !item.disabled && item.value === c.active,
          );
          if (option) c.choose(option);
          return;
        }
        if (!["ArrowDown", "ArrowUp"].includes(event.key) || c.p.disabled)
          return;
        event.preventDefault();
        const before = c.opened;
        c.open();
        const enabled = c.p.loading
          ? []
          : c.matches.filter((item) => !item.disabled);
        const index = enabled.findIndex((item) => item.value === c.active);
        c.active = !before
          ? event.key === "ArrowUp"
            ? enabled.at(-1)?.value
            : c.active
          : enabled[
              (index + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) %
                enabled.length
            ]?.value;
        c.keyboardActive = true;
        c.paint();
        const node = c.rows?.find((entry) => entry.option.value === c.active)
          ?.child.element;
        if (node) {
          const rect = node.getBoundingClientRect(),
            bounds = c.floating.panel.getBoundingClientRect();
          if (rect.top < bounds.top)
            c.floating.panel.scrollTop -= bounds.top - rect.top;
          else if (rect.bottom > bounds.bottom)
            c.floating.panel.scrollTop += rect.bottom - bounds.bottom;
        }
      });
      c.on(
        document,
        "pointerdown",
        (event) => {
          if (
            c.opened &&
            !event.composedPath().includes(c.element) &&
            !event.composedPath().includes(c.floating.panel)
          )
            c.close();
        },
        true,
      );
      c.exposed.focus = () => c.input.input.focus();
    },
    paint(c) {
      const option = (c.p.options ?? []).find(
        (item) => item.value === c.p.value,
      );
      if (option) c.cached = option;
      else if (c.cached?.value !== c.p.value) c.cached = undefined;
      c.current = option ?? (c.p.filter === false ? c.cached : undefined);
      const normalize = (value) =>
        String(value).normalize("NFKC").toLocaleLowerCase();
      const query = c.query.trim();
      c.matches = (c.p.options ?? []).filter((option) =>
        !c.searching ||
        !query ||
        c.p.filter === false ||
        typeof c.p.filter === "function"
          ? !c.searching ||
            !query ||
            c.p.filter === false ||
            c.p.filter(query, option)
          : normalize(
              [option.label, option.description, option.value].join(" "),
            ).includes(normalize(query)),
      );
      if (!c.matches.some((item) => !item.disabled && item.value === c.active))
        c.active =
          c.matches.find((item) => !item.disabled && item.value === c.p.value)
            ?.value ?? c.matches.find((item) => !item.disabled)?.value;
      c.input.update(
        {
          ...c.p,
          id: c.p.id ?? c.id,
          name: undefined,
          value: c.opened ? c.query : (c.current?.label ?? ""),
          type: "text",
        },
        {
          role: "combobox",
          "aria-autocomplete": "list",
          "aria-haspopup": "listbox",
          "aria-expanded": c.opened,
          "aria-controls": c.list.id,
          "aria-activedescendant":
            c.opened && !c.p.loading && c.active
              ? c.id + "-option-" + encodeURIComponent(c.active)
              : undefined,
          "aria-busy": c.p.loading || undefined,
        },
      );
      c.input.input.setCustomValidity(
        c.p.required && !c.current ? "请从列表中选择" + c.p.label : "",
      );
      attrs(c.hiddenInput, {
        name: c.p.name,
        value: c.p.value ?? "",
        disabled: c.p.disabled,
      });
      const signature = JSON.stringify([c.matches, c.p.loading]);
      if (signature !== c.signature) {
        c.signature = signature;
        c.clear(c.list);
        c.rows = (c.p.loading ? [] : c.matches).map((option) => {
          const leading = el("span");
          const check = svgIcon("check");
          check.classList.add("my-combobox-check");
          const child = c.child(
            "ListRow",
            {
              title: option.label,
              description: option.description,
              disabled: option.disabled,
              _click: () => c.choose(option),
            },
            {
              ...(c.slotNames.has("option-leading") || option.icon
                ? { leading }
                : {}),
              trailing: check,
            },
          );
          child.element.classList.add("my-combobox-option");
          c.list.append(child.element);
          child.on(child.element, "mousedown", (event) =>
            event.preventDefault(),
          );
          child.on(child.element, "pointermove", () => {
            if (!option.disabled) {
              c.active = option.value;
              c.keyboardActive = false;
              c.paint();
            }
          });
          return { option, child, leading, check };
        });
      }
      attrs(c.list, {
        role: "listbox",
        "aria-label": c.p.label,
        "aria-busy": c.p.loading || undefined,
      });
      for (const entry of c.rows ?? []) {
        const selected = c.p.value === entry.option.value;
        entry.child.update(
          {},
          {
            id: c.id + "-option-" + encodeURIComponent(entry.option.value),
            role: "option",
            "aria-selected": selected,
            "aria-disabled": entry.option.disabled || undefined,
            tabindex: -1,
          },
        );
        state(entry.child.element, {
          "is-active": c.keyboardActive && c.active === entry.option.value,
        });
        state(entry.check, { selected });
        if (c.slotNames.has("option-leading"))
          c.slot("option-leading", entry.leading, {
            option: entry.option,
            selected,
          });
        else if (entry.option.icon)
          content(entry.leading, svgIcon(entry.option.icon));
        scope(entry.child.element, "Combobox");
      }
      c.status.hidden = !c.p.loading && c.matches.length > 0;
      if (c.p.loading) text(c.status, "正在搜索…");
      else c.slot("empty", c.status, {}, c.p.emptyText);
      scope(c.floating.panel, "Combobox");
      if (c.p.disabled) c.close();
      if (c.opened) {
        const rect = c.input.box.getBoundingClientRect(),
          bounds = viewportRect();
        c.floating.panel.style.setProperty(
          "--floating-max-height",
          Math.max(
            0,
            Math.min(
              288,
              Math.max(
                rect.top - bounds.top - 16,
                bounds.bottom - rect.bottom - 16,
              ),
            ),
          ) + "px",
        );
        c.floating.place();
      }
    },
  });

  // ── Tooltip：只淡入淡出；根据指针类型区分悬停与长按 ────────────────────────
  function tooltipPanel(owner, anchor, properties = {}) {
    const floating = makeFloating(owner, {
      anchor,
      placement: () => properties.placement ?? "top",
      motion: () => "fade",
      close: () => properties.close?.(),
    });
    floating.panel.classList.add("my-tooltip-panel");
    floating.panel.style.setProperty("--floating-width", "max-content");
    floating.panel.style.setProperty("--floating-gap", "0px");
    const body = el("div", "tooltip-content");
    attrs(body, {
      id: properties.id ?? owner.id + "-tooltip",
      role: "tooltip",
    });
    floating.panel.append(body);
    const arrow = el("span", "tooltip-arrow");
    attr(arrow, "aria-hidden", true);
    floating.panel.append(arrow);
    floating.configure = (options) => {
      Object.assign(properties, options);
      state(floating.panel, {
        "tooltip-with-arrow": properties.arrow !== false,
        "tooltip-copyable": !!properties.copyable,
      });
      scope(floating.panel, "TooltipPopup");
    };
    floating.configure(properties);
    floating.body = body;
    return floating;
  }
  let activeTooltip;
  register("Tooltip", {
    tag: "span",
    defaults: {
      placement: "top",
      delay: 200,
      hideDelay: 100,
      longPressDelay: 500,
      arrow: true,
      copyable: false,
    },
    init(c) {
      c.element.classList.add("my-tooltip-trigger");
      c.floating = tooltipPanel(c, () => c.anchor ?? c.element, {
        id: c.id,
        close: () => c.hide(),
      });
      let showTimer,
        hideTimer,
        hold,
        pointerTimer,
        press,
        suppress = false,
        pointerFocus = false,
        over = false,
        inside = false;
      const available = () =>
        !c.p.disabled && (c.p.content || c.slotNames.has("content"));
      c.show = () => {
        clearTimeout(hideTimer);
        if (!available()) return;
        activeTooltip?.();
        activeTooltip = c.hide;
        c.opened = true;
        const context = c.element.querySelector(
          "button,input,textarea,select,[href],[tabindex]",
        );
        c.anchor =
          context && !context.matches(":disabled") ? context : c.element;
        const described = new Set(
          (c.anchor.getAttribute("aria-describedby") ?? "")
            .split(/\s+/)
            .filter(Boolean),
        );
        described.add(c.id);
        attr(c.anchor, "aria-describedby", [...described].join(" "));
        c.paint();
        c.floating.open();
      };
      c.hide = () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        c.opened = false;
        c.floating.close();
        if (c.anchor) {
          const ids = (c.anchor.getAttribute("aria-describedby") ?? "")
            .split(/\s+/)
            .filter((id) => id !== c.id);
          attr(c.anchor, "aria-describedby", ids.join(" ") || undefined);
        }
        if (activeTooltip === c.hide) activeTooltip = undefined;
      };
      const hide = () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(
          () => {
            if (!over && !inside) c.hide();
          },
          Math.max(0, c.p.hideDelay),
        );
      };
      c.on(c.element, "pointerenter", (event) => {
        if (!["mouse", "pen"].includes(event.pointerType)) return;
        over = true;
        clearTimeout(hideTimer);
        clearTimeout(showTimer);
        showTimer = setTimeout(
          () => {
            if (over) c.show();
          },
          Math.max(0, c.p.delay),
        );
      });
      c.on(c.element, "pointerleave", (event) => {
        if (!["mouse", "pen"].includes(event.pointerType)) return;
        over = false;
        if (c.p.copyable && c.floating.host.contains(event.relatedTarget)) {
          inside = true;
          return;
        }
        hide();
      });
      c.on(c.floating.panel, "pointerenter", (event) => {
        if (c.p.copyable && ["mouse", "pen"].includes(event.pointerType)) {
          inside = true;
          clearTimeout(hideTimer);
        }
      });
      c.on(c.floating.panel, "pointerleave", (event) => {
        inside = false;
        if (!c.element.contains(event.relatedTarget)) hide();
      });
      c.on(
        c.element,
        "pointerdown",
        (event) => {
          clearTimeout(hold);
          suppress = false;
          pointerFocus = true;
          clearTimeout(pointerTimer);
          pointerTimer = setTimeout(
            () => (pointerFocus = false),
            event.pointerType === "touch" ? 750 : 0,
          );
          c.hide();
          if (
            event.pointerType !== "touch" ||
            event.button !== 0 ||
            event.isPrimary === false
          )
            return;
          press = { id: event.pointerId, x: event.clientX, y: event.clientY };
          hold = setTimeout(
            () => {
              if (press) {
                suppress = true;
                c.show();
              }
            },
            Math.max(0, c.p.longPressDelay),
          );
        },
        true,
      );
      c.on(
        document,
        "pointermove",
        (event) => {
          if (!press || event.pointerId !== press.id) return;
          const rect = c.element.getBoundingClientRect();
          if (
            Math.hypot(event.clientX - press.x, event.clientY - press.y) > 20 ||
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            clearTimeout(hold);
            press = undefined;
            c.hide();
          }
        },
        { capture: true, passive: true },
      );
      c.on(
        document,
        "pointerup",
        (event) => {
          if (event.pointerId === press?.id) {
            clearTimeout(hold);
            press = undefined;
          }
        },
        true,
      );
      c.on(
        document,
        "pointercancel",
        () => {
          clearTimeout(hold);
          press = undefined;
          c.hide();
        },
        true,
      );
      c.on(
        c.element,
        "click",
        (event) => {
          if (suppress && event.detail) {
            suppress = false;
            event.preventDefault();
            event.stopImmediatePropagation();
          } else c.hide();
        },
        true,
      );
      c.on(c.element, "contextmenu", (event) => {
        if (press || suppress) {
          event.preventDefault();
          if (press) {
            clearTimeout(hold);
            suppress = true;
            c.show();
          }
        }
      });
      c.on(c.element, "focusin", () => {
        if (!pointerFocus) c.show();
      });
      c.on(c.element, "focusout", (event) => {
        if (
          !c.element.contains(event.relatedTarget) &&
          !c.floating.host.contains(event.relatedTarget) &&
          !inside &&
          !over
        )
          c.hide();
      });
      c.on(
        document,
        "pointerdown",
        (event) => {
          if (
            !c.element.contains(event.target) &&
            !(c.p.copyable && c.floating.host.contains(event.target))
          )
            c.hide();
        },
        true,
      );
      c.on(
        document,
        "keydown",
        (event) => {
          if (
            c.opened &&
            event.key === "Escape" &&
            !c.element.closest("[inert]")
          ) {
            event.preventDefault();
            event.stopPropagation();
            c.hide();
          }
        },
        true,
      );
      c.on(
        window,
        "scroll",
        (event) => {
          if (!c.floating.host.contains(event.target)) c.hide();
        },
        { capture: true, passive: true },
      );
      c.cleanups.add(() => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(hold);
        clearTimeout(pointerTimer);
        c.hide();
      });
    },
    paint(c) {
      c.slot("default", c.element);
      c.slot("content", c.floating.body, {}, c.p.content ?? "");
      c.floating.configure(c.p);
      const target = [
        ...c.element.querySelectorAll(
          "button,input,textarea,select,[href],[tabindex]",
        ),
      ].find(
        (node) =>
          !node.matches(":disabled,[aria-disabled=true]") && node.tabIndex >= 0,
      );
      attr(c.element, "tabindex", target || c.p.disabled ? undefined : 0);
      if (c.p.disabled) c.hide();
    },
  });
  register("TooltipPopup", {
    defaults: { arrow: true },
    init(c) {
      c.element.style.display = "contents";
      c.floating = tooltipPanel(c, () => c.p.anchor, {
        close: () => c.set(false),
      });
    },
    paint(c) {
      c.floating.configure(c.p);
      c.slot("default", c.floating.body);
      if (c.p.value) c.floating.open();
      else c.floating.close();
    },
  });

  // ── 进度与滑块：共用同一条轨道，刻度/缓冲/范围均在原生层实现 ───────────────
  register("ProgressTrack", {
    init(c) {
      c.element.classList.add("my-progress-track");
      c.buffer = el("span", "progress-buffer");
      c.fill = el("span", "progress-fill");
      c.element.append(c.buffer, c.fill);
      attr(c.element, "aria-hidden", true);
    },
    paint(c) {
      state(c.element, {
        "is-indeterminate": c.p.indeterminate,
        "is-instant": c.p.instant,
      });
      styles(c.element, {
        "--progress-ratio": c.p.value ?? 0,
        "--progress-start-ratio": c.p.start ?? 0,
        "--progress-buffer-ratio": c.p.buffer,
      });
      c.buffer.hidden = c.p.buffer === undefined || !!c.p.indeterminate;
    },
  });
  register("Progress", {
    defaults: {
      max: 100,
      type: "line",
      status: "normal",
      label: "进度",
      showText: true,
    },
    init(c) {
      c.element.classList.add("my-progress");
      c.track = c.child("ProgressTrack");
      c.ring = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      c.ring.classList.add("my-progress-ring");
      attrs(c.ring, { viewBox: "0 0 100 100", "aria-hidden": true });
      c.ring.innerHTML =
        '<circle class="my-ring-track" cx="50" cy="50" r="44"/><circle class="my-ring-buffer" cx="50" cy="50" r="44" pathLength="100"/><g class="my-ring-value"><circle class="my-ring-fill" cx="50" cy="50" r="44" pathLength="100"/></g>';
      c.body = el("span", "progress-text");
      attr(c.body, "aria-hidden", true);
      c.element.append(c.track.element, c.ring, c.body);
    },
    paint(c) {
      const max = Number.isFinite(c.p.max) && c.p.max > 0 ? c.p.max : 100,
        value = Number.isFinite(c.p.value)
          ? clamp(c.p.value, 0, max)
          : undefined,
        percentage = ((value ?? 0) / max) * 100,
        buffer =
          value !== undefined && Number.isFinite(c.p.buffer)
            ? clamp(c.p.buffer, value, max) / max
            : undefined;
      const indeterminate = value === undefined;
      c.element.className = names("progress " + c.p.type + " " + c.p.status);
      state(c.element, { indeterminate });
      attrs(c.element, {
        role: "progressbar",
        "aria-label": c.attributes["aria-labelledby"] ? undefined : c.p.label,
        "aria-valuemin": 0,
        "aria-valuemax": max,
        "aria-valuenow": value,
        "aria-valuetext": indeterminate
          ? "进行中"
          : Math.round(percentage) +
            "%" +
            (buffer === undefined
              ? ""
              : "，已缓冲 " + Math.round(buffer * 100) + "%"),
      });
      c.track.element.hidden = c.p.type === "circle";
      attr(c.ring, "hidden", c.p.type !== "circle");
      c.track.update({ value: percentage / 100, buffer, indeterminate });
      const fill = c.ring.querySelector(".my-ring-fill"),
        bufferNode = c.ring.querySelector(".my-ring-buffer");
      attrs(fill, {
        "stroke-dasharray": (indeterminate ? 28 : percentage) + " 100",
        opacity: !indeterminate && percentage === 0 ? 0 : 1,
      });
      attrs(bufferNode, {
        "stroke-dasharray": (buffer ?? 0) * 100 + " 100",
        opacity: buffer === undefined || buffer === 0 ? 0 : 1,
      });
      c.body.hidden = !c.p.showText;
      c.slot("default", c.body, { value, max, percentage }, () =>
        ["success", "error"].includes(c.p.status)
          ? svgIcon(c.p.status === "success" ? "check" : "x")
          : Math.round(percentage) + "%",
      );
    },
  });
  register("Slider", {
    defaults: {
      min: 0,
      max: 100,
      step: 1,
      marks: false,
      valueLabelDisplay: "auto",
      unit: "%",
      startLabel: "柔和",
      endLabel: "鲜明",
    },
    init(c) {
      c.element.classList.add("my-slider");
      c.heading = el("div", "range-heading");
      c.label = el("label");
      c.readout = el("strong");
      c.heading.append(c.label, c.readout);
      c.control = el("div", "slider-control");
      c.track = c.child("ProgressTrack", { instant: true });
      c.track.element.classList.add("my-slider-track");
      c.marks = el("div", "slider-marks");
      c.control.append(c.track.element, c.marks);
      c.labels = el("div", "slider-mark-labels");
      c.scaleLabels = el("div", "range-scale");
      c.start = el("span");
      c.end = el("span");
      c.scaleLabels.append(c.start, c.end);
      c.element.append(c.heading, c.control, c.labels, c.scaleLabels);
      c.inputs = [];
      c.anchors = [];
      c.tooltips = [];
      const geometry = () => {
        const rect = c.track.element.getBoundingClientRect(),
          control = c.control.getBoundingClientRect();
        return {
          left: rect.left,
          width: Math.max(1, rect.width),
          thumb: Math.max(0, control.width - rect.width),
        };
      };
      const point = (x) => {
        const rect = geometry();
        return (
          c.scale.min +
          ((x - rect.left) / rect.width) * (c.scale.max - c.scale.min)
        );
      };
      const nearest = (x) => {
        if (c.values.length === 1) return 0;
        const n = point(x),
          [a, b] = c.values;
        return Math.abs(n - a) < Math.abs(n - b)
          ? 0
          : Math.abs(n - a) > Math.abs(n - b)
            ? 1
            : n < a
              ? 0
              : 1;
      };
      const change = (raw, index) => {
        if (c.p.disabled || c.scale.disabled) return;
        let value = c.scale.normalize(raw);
        if (c.values.length > 1)
          value =
            index === 0
              ? Math.min(value, c.values[1])
              : Math.max(value, c.values[0]);
        if (value === c.values[index]) return;
        const next = [...c.values];
        next[index] = value;
        c.dismissed = undefined;
        c.set(Array.isArray(c.p.value) ? next : value);
      };
      const enter = (event) => {
        if (!c.p.disabled && ["mouse", "pen"].includes(event.pointerType)) {
          c.hovered = nearest(event.clientX);
          c.dismissed = undefined;
          c.paint();
        }
      };
      const cancel = () => {
        c.drag = undefined;
        c.active = undefined;
      };
      c.on(c.control, "pointerenter", enter);
      c.on(c.control, "pointermove", (event) => {
        if (!c.drag) enter(event);
      });
      c.on(c.control, "pointerleave", () => {
        c.hovered = undefined;
        c.paint();
      });
      c.on(c.control, "pointerdown", (event) => {
        if (
          c.p.disabled ||
          c.scale.disabled ||
          c.drag ||
          event.button !== 0 ||
          event.isPrimary === false
        )
          return;
        const index = nearest(event.clientX),
          rect = geometry(),
          center = rect.left + c.ratio(c.values[index]) * rect.width;
        c.drag = {
          id: event.pointerId,
          index,
          manual: c.values.length > 1,
          offset:
            Math.abs(event.clientX - center) <= rect.thumb / 2
              ? event.clientX - center
              : 0,
          pointerType: event.pointerType,
        };
        c.active = index;
        c.focused = undefined;
        c.dismissed = undefined;
        if (c.drag.manual) {
          event.preventDefault();
          c.inputs[index].focus({ preventScroll: true });
          change(point(event.clientX - c.drag.offset), index);
        }
        c.paint();
      });
      c.on(
        document,
        "pointermove",
        (event) => {
          if (c.drag?.id === event.pointerId && c.drag.manual)
            change(point(event.clientX - c.drag.offset), c.drag.index);
        },
        { capture: true, passive: true },
      );
      c.on(
        document,
        "pointerup",
        (event) => {
          if (event.pointerId !== c.drag?.id) return;
          if (c.drag.manual)
            change(point(event.clientX - c.drag.offset), c.drag.index);
          if (!["mouse", "pen"].includes(c.drag.pointerType))
            c.hovered = undefined;
          cancel();
          c.paint();
        },
        true,
      );
      c.on(
        document,
        "pointercancel",
        () => {
          cancel();
          c.paint();
        },
        true,
      );
      c.on(window, "blur", () => {
        cancel();
        c.paint();
      });
      c.buildInputs = () => {
        for (const stop of c.inputCleanups ?? []) stop();
        c.inputCleanups = [];
        const on = (...args) => c.inputCleanups.push(c.on(...args));
        for (const input of c.inputs) input.remove();
        for (const anchor of c.anchors) anchor.remove();
        for (const tooltip of c.tooltips) tooltip.destroy();
        c.inputs = [];
        c.anchors = [];
        c.tooltips = [];
        c.values.forEach((_, index) => {
          const input = document.createElement("input");
          input.type = "range";
          input.id = c.id + "-" + index;
          c.inputs.push(input);
          c.control.append(input);
          const anchor = el("span", "slider-thumb-anchor");
          anchor.append(el("span", "slider-halo"));
          attr(anchor, "aria-hidden", true);
          c.anchors.push(anchor);
          c.control.append(anchor);
          const tooltip = tooltipPanel(c, () => anchor, {
            id: c.id + "-value-" + index,
            arrow: true,
            close: () => {
              c.dismissed = index;
              c.paint();
            },
          });
          c.tooltips.push(tooltip);
          on(input, "input", () => change(Number(input.value), index));
          on(input, "focus", () => {
            if (!c.drag && input.matches(":focus-visible")) {
              c.focused = index;
              c.dismissed = undefined;
              c.paint();
            }
          });
          on(input, "blur", () => {
            if (c.focused === index) {
              c.focused = undefined;
              c.paint();
            }
          });
          on(input, "keydown", (event) => {
            if (event.key === "Escape") {
              c.dismissed = index;
              c.paint();
              event.stopPropagation();
              return;
            }
            if (
              ![
                "ArrowRight",
                "ArrowUp",
                "ArrowLeft",
                "ArrowDown",
                "Home",
                "End",
                "PageUp",
                "PageDown",
              ].includes(event.key) ||
              c.p.disabled
            )
              return;
            c.focused = index;
            c.dismissed = undefined;
            if (c.scale.step !== null) {
              c.paint();
              return;
            }
            event.preventDefault();
            const points = c.scale.marks
              .map((mark) => mark.value)
              .filter(
                (value) =>
                  c.values.length === 1 ||
                  (index === 0 ? value <= c.values[1] : value >= c.values[0]),
              );
            const value =
              event.key === "Home"
                ? points[0]
                : event.key === "End"
                  ? points.at(-1)
                  : ["ArrowRight", "ArrowUp", "PageUp"].includes(event.key)
                    ? points.find((value) => value > c.values[index])
                    : [...points]
                        .reverse()
                        .find((value) => value < c.values[index]);
            if (value !== undefined) change(value, index);
          });
        });
      };
      c.intersection = new IntersectionObserver(
        ([entry]) => {
          c.intersecting =
            entry?.isIntersecting && entry.intersectionRatio >= 0.5;
          c.paint();
        },
        { threshold: [0, 0.5, 1] },
      );
      c.intersection.observe(c.control);
      c.cleanups.add(() => c.intersection.disconnect());
      c.inertObserver = new MutationObserver((records) => {
        if (
          records.some(
            (record) =>
              record.target instanceof Element &&
              record.target.contains(c.element),
          )
        )
          c.paint();
      });
      c.inertObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["inert"],
      });
      c.cleanups.add(() => c.inertObserver.disconnect());
    },
    paint(c) {
      const config = JSON.stringify([
        c.p.disabled,
        c.p.min,
        c.p.max,
        c.p.step,
        c.p.marks,
        Array.isArray(c.p.value),
      ]);
      if (config !== c.config) {
        c.config = config;
        c.drag = undefined;
        c.active = undefined;
        c.hovered = undefined;
        c.focused = undefined;
        c.dismissed = undefined;
      }
      c.scale = sliderScale(c.p.min, c.p.max, c.p.step, c.p.marks);
      c.values = (
        Array.isArray(c.p.value)
          ? [c.p.value[0], c.p.value[1]]
          : [c.p.value ?? c.p.min]
      )
        .map((value) => c.scale.normalize(value))
        .sort((a, b) => a - b);
      if (c.inputs.length !== c.values.length) c.buildInputs();
      c.ratio = (value) =>
        c.scale.max === c.scale.min
          ? 0
          : (value - c.scale.min) / (c.scale.max - c.scale.min);
      const format = (value, index) =>
        c.p.valueLabelFormat?.(value, index) ?? `${value}${c.p.unit}`;
      const end = c.ratio(c.values.at(-1));
      state(c.element, {
        "is-range": c.values.length > 1,
        "is-disabled": c.p.disabled || c.scale.disabled,
      });
      text(c.label, c.p.label);
      attr(c.label, "for", c.id + "-0");
      text(c.readout, c.values.map(format).join(" – "));
      const buffer = Number.isFinite(c.p.buffer)
        ? clamp(c.ratio(c.p.buffer), end, 1)
        : undefined;
      c.track.update({
        value: end,
        start: c.values.length > 1 ? c.ratio(c.values[0]) : 0,
        buffer,
        instant: true,
      });
      const disabled = c.p.disabled || c.scale.disabled;
      c.values.forEach((value, index) => {
        const input = c.inputs[index];
        attrs(input, {
          min: c.scale.min,
          max: c.scale.max,
          step: c.scale.step ?? "any",
          disabled,
          "aria-label":
            c.values.length > 1
              ? c.p.label + " · " + (index === 0 ? "起始值" : "结束值")
              : c.p.label,
          "aria-valuemin": index === 1 ? c.values[0] : c.scale.min,
          "aria-valuemax":
            c.values.length > 1 && index === 0 ? c.values[1] : c.scale.max,
          "aria-valuetext":
            c.p.getAriaValueText?.(value, index) ?? format(value, index),
        });
        nativeValue(input, value);
        state(input, {
          "is-hovered": c.hovered === index,
          "is-active": c.active === index,
          "is-current": (c.active ?? c.focused ?? c.hovered) === index,
        });
        const anchor = c.anchors[index];
        anchor.style.setProperty("--slider-position", c.ratio(value));
        state(anchor, {
          "is-hovered": !disabled && c.hovered === index,
          "is-active": !disabled && c.active === index,
        });
        const tooltip = c.tooltips[index];
        text(tooltip.body, format(value, index));
        const visible =
          !disabled &&
          c.p.valueLabelDisplay !== "off" &&
          c.dismissed !== index &&
          !c.element.closest("[inert]") &&
          (c.p.valueLabelDisplay === "on"
            ? c.intersecting
            : (c.active ?? c.focused ?? c.hovered) === index);
        if (visible) {
          tooltip.open();
          tooltip.place();
        } else tooltip.close();
      });
      c.marks.replaceChildren();
      c.labels.replaceChildren();
      let hasLabels = false;
      for (const mark of c.scale.marks) {
        const selected =
          mark.value >= (c.values.length > 1 ? c.values[0] : c.scale.min) &&
          mark.value <= c.values.at(-1);
        const point = el("span");
        point.style.left = c.ratio(mark.value) * 100 + "%";
        state(point, { selected });
        c.marks.append(point);
        if (mark.label !== undefined) {
          hasLabels = true;
          const label = el("span", "", mark.label);
          label.style.left = point.style.left;
          state(label, {
            selected,
            start: mark.value === c.scale.min,
            end: mark.value === c.scale.max,
          });
          c.labels.append(label);
        }
      }
      c.labels.hidden = !hasLabels;
      c.scaleLabels.hidden = hasLabels;
      text(c.start, c.p.startLabel);
      text(c.end, c.p.endLabel);
    },
  });

  // ── Collapse：内容保留，收起时离开可访问树并禁止焦点进入 ───────────────────
  register("Collapse", {
    init(c) {
      c.element.classList.add("my-collapse");
    },
    paint(c) {
      attrs(c.element, {
        role: c.p.label ? "group" : undefined,
        "aria-label": c.p.label,
      });
      c.slot("default", c.element);
      for (const node of c.element.querySelectorAll(
        '[data-my-component="CollapseItem"]',
      ))
        controllers.get(node)?.paint();
    },
  });
  register("CollapseItem", {
    init(c) {
      c.element.classList.add("my-collapse-item");
      c.trigger = el("button", "collapse-trigger");
      c.trigger.type = "button";
      c.title = el("span", "collapse-title");
      c.arrow = svgIcon("chevron-right");
      c.arrow.classList.add("my-collapse-arrow");
      c.trigger.append(c.title, c.arrow);
      c.region = el("div", "collapse-region");
      c.clip = el("div", "collapse-clip");
      c.body = el("div", "collapse-content");
      c.clip.append(c.body);
      c.region.append(c.clip);
      c.element.append(c.trigger, c.region);
      c.on(c.trigger, "click", () => {
        const group = parentController(c.element, ["Collapse"]);
        if (!group || group.p.disabled || c.p.disabled) return;
        group.set(
          Array.isArray(group.p.value)
            ? updateSelection(
                group.p.value,
                c.p.value,
                !group.p.value.includes(c.p.value),
              )
            : group.p.value === c.p.value
              ? ""
              : c.p.value,
        );
      });
      c.on(c.trigger, "keydown", (event) => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
          return;
        const group = parentController(c.element, ["Collapse"]);
        const buttons = [
          ...(group?.element.querySelectorAll(
            ".my-collapse-trigger:not(:disabled)",
          ) ?? []),
        ];
        if (!buttons.length) return;
        event.preventDefault();
        const index = buttons.indexOf(c.trigger);
        buttons[
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : (index +
                  (event.key === "ArrowDown" ? 1 : -1) +
                  buttons.length) %
                buttons.length
        ]?.focus();
      });
    },
    paint(c) {
      const group = parentController(c.element, ["Collapse"]);
      const open =
        !!group &&
        (Array.isArray(group.p.value)
          ? group.p.value.includes(c.p.value)
          : group.p.value === c.p.value);
      if (!open && c.region.contains(document.activeElement))
        c.trigger.focus({ preventScroll: true });
      attrs(c.trigger, {
        id: c.id + "-trigger",
        disabled: c.p.disabled || group?.p.disabled,
        "aria-expanded": open,
        "aria-controls": c.id + "-panel",
      });
      attrs(c.region, {
        id: c.id + "-panel",
        role: "region",
        "aria-labelledby": c.id + "-trigger",
        "aria-hidden": !open,
        inert: !open,
      });
      state(c.region, { open });
      state(c.arrow, { open });
      c.slot("title", c.title, { open }, c.p.title ?? "");
      c.slot("default", c.body, { open });
    },
  });

  // ── 单指跟手：方向锁定、边缘滚动协商、短甩速度与兼容点击 ──────────────────
  function touchDrag(element, options) {
    let session,
      suppressUntil = 0;
    const listeners = [];
    const on = (type, callback, settings) => {
      element.addEventListener(type, callback, settings);
      listeners.push(() =>
        element.removeEventListener(type, callback, settings),
      );
    };
    const cancel = (notify = true) => {
      const previous = session;
      session = undefined;
      if (previous?.active && notify) options.end(previous.delta, 0, true);
    };
    on(
      "touchstart",
      (event) => {
        cancel();
        suppressUntil = 0;
        if (
          !options.enabled() ||
          event.touches.length !== 1 ||
          element.closest("[inert]")
        )
          return;
        const target =
          event.target instanceof Element ? event.target : undefined;
        if (
          !target ||
          target.closest(
            'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="slider"],video,audio,[data-swipe-ignore]',
          )
        )
          return;
        const touch = event.touches[0];
        session = {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          delta: 0,
          active: false,
          target,
          points: [{ value: 0, time: event.timeStamp }],
        };
      },
      { passive: true },
    );
    on(
      "touchmove",
      (event) => {
        const state = session;
        if (!state) return;
        if (
          !options.enabled() ||
          event.touches.length !== 1 ||
          event.defaultPrevented
        ) {
          cancel();
          return;
        }
        const touch = [...event.touches].find(
          (item) => item.identifier === state.id,
        );
        if (!touch) {
          cancel();
          return;
        }
        const x = touch.clientX - state.x,
          y = touch.clientY - state.y,
          delta = options.axis() === "x" ? x : y,
          cross = options.axis() === "x" ? y : x;
        if (!state.active) {
          if (Math.max(Math.abs(delta), Math.abs(cross)) < 6) return;
          if (
            Math.abs(delta) < Math.abs(cross) * 1.15 ||
            !event.cancelable ||
            canScrollGesture(state.target, element, options.axis(), delta) ||
            !options.start(delta)
          ) {
            session = undefined;
            return;
          }
          state.active = true;
        }
        if (!event.cancelable) {
          cancel();
          return;
        }
        event.preventDefault();
        state.delta = delta;
        state.points.push({ value: delta, time: event.timeStamp });
        while (
          state.points.length > 2 &&
          state.points[1].time < event.timeStamp - 90
        )
          state.points.shift();
        options.move(delta);
      },
      { passive: false },
    );
    on(
      "touchend",
      (event) => {
        const state = session;
        if (
          !state ||
          ![...event.changedTouches].some(
            (item) => item.identifier === state.id,
          )
        )
          return;
        session = undefined;
        if (!state.active) return;
        suppressUntil = performance.now() + 450;
        const last = state.points.at(-1),
          first = state.points[0],
          velocity =
            event.timeStamp - last.time > 100
              ? 0
              : (last.value - first.value) /
                Math.max(1, last.time - first.time);
        options.end(state.delta, velocity, false);
      },
      { passive: true },
    );
    on(
      "touchcancel",
      () => {
        if (session?.active) suppressUntil = performance.now() + 450;
        cancel();
      },
      { passive: true },
    );
    on(
      "click",
      (event) => {
        if (event.detail !== 0 && performance.now() < suppressUntil) {
          suppressUntil = 0;
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    return {
      cancel,
      destroy: () => {
        cancel(false);
        listeners.forEach((stop) => stop());
      },
    };
  }
  function swipeDismiss(
    owner,
    panel,
    overlay,
    scrim,
    enabled,
    direction,
    close,
  ) {
    let extent = 0,
      offset = 0,
      frame = 0,
      animations = [],
      generation = 0,
      busy = false;
    const axis = () => (["left", "right"].includes(direction()) ? "x" : "y"),
      sign = () => (["left", "top"].includes(direction()) ? -1 : 1);
    const paint = () => {
      frame = 0;
      panel.style.translate =
        axis() === "x" ? offset + "px 0px" : "0px " + offset + "px";
      if (scrim)
        scrim.style.opacity = String(
          1 - Math.min(1, Math.abs(offset) / Math.max(1, extent)) * 0.65,
        );
    };
    const reset = () => {
      generation++;
      cancelAnimationFrame(frame);
      frame = 0;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      panel.style.removeProperty("translate");
      scrim?.style.removeProperty("opacity");
      panel.removeAttribute("data-swipe-dragging");
      overlay.removeAttribute("data-swipe-dismissed");
      busy = false;
      offset = 0;
      gesture?.cancel(false);
    };
    const gesture = touchDrag(panel, {
      axis,
      enabled: () => owner.opened && enabled() && !busy,
      start(delta) {
        if (delta * sign() <= 0) return false;
        extent = axis() === "x" ? panel.offsetWidth : panel.offsetHeight;
        if (!extent) return false;
        panel.dataset.swipeDragging = "";
        return true;
      },
      move(delta) {
        offset = sign() * Math.max(0, delta * sign());
        if (!frame) frame = requestAnimationFrame(paint);
      },
      async end(delta, velocity, cancelled) {
        cancelAnimationFrame(frame);
        paint();
        busy = true;
        const commit =
            !cancelled &&
            completesSwipe(
              Math.max(0, delta * sign()),
              velocity * sign(),
              extent,
            ),
          next = commit ? sign() * (extent + 32) : 0,
          version = ++generation;
        const from = panel.style.translate,
          to = axis() === "x" ? next + "px 0px" : "0px " + next + "px";
        animations = [
          panel.animate([{ translate: from }, { translate: to }], {
            duration: reduced() ? 0 : 220,
            easing: "cubic-bezier(.2,.8,.2,1)",
            fill: "forwards",
          }),
        ];
        if (scrim)
          animations.push(
            scrim.animate(
              [
                { opacity: scrim.style.opacity || 1 },
                { opacity: commit ? 0 : 1 },
              ],
              { duration: reduced() ? 0 : 220, fill: "forwards" },
            ),
          );
        try {
          await Promise.all(animations.map((animation) => animation.finished));
        } catch {
          return;
        }
        if (version !== generation) return;
        if (commit) {
          overlay.dataset.swipeDismissed = "";
          close();
        } else reset();
      },
    });
    owner.cleanups.add(() => {
      gesture.destroy();
      reset();
    });
    owner.on(window, "resize", reset, { passive: true });
    return { reset };
  }
  register("Tabs", {
    defaults: { swipeable: true },
    init(c) {
      c.element.classList.add("my-tabs");
      c.strip = el("div", "tab-strip");
      c.indicator = el("span", "tab-indicator");
      c.viewport = el("div", "tab-viewport");
      c.track = el("div", "tab-track");
      c.viewport.append(c.track);
      c.element.append(c.strip, c.viewport);
      let width = 0,
        offset = 0,
        frame = 0,
        generation = 0,
        busy = false,
        animations = [];
      const metrics = (value) => {
        const entry = c.items?.find((entry) => entry.item.value === value);
        return {
          left: entry?.button.offsetLeft ?? 0,
          width: entry?.button.offsetWidth ?? 0,
        };
      };
      const paintIndicator = (progress = 0) => {
        const from = metrics(c.selected?.value),
          to = c.preview ? metrics(c.preview.value) : from;
        c.indicator.style.translate =
          from.left + (to.left - from.left) * progress + "px 0px";
        c.indicator.style.width =
          from.width + (to.width - from.width) * progress + "px";
      };
      const reveal = () => {
        const entry = c.items.find(
          (entry) => entry.item.value === c.selected?.value,
        );
        if (!entry) return;
        const button = entry.button,
          left = button.offsetLeft,
          right = left + button.offsetWidth;
        if (left < c.strip.scrollLeft)
          c.strip.scrollTo({ left, behavior: reduced() ? "auto" : "smooth" });
        else if (right > c.strip.scrollLeft + c.strip.clientWidth)
          c.strip.scrollTo({
            left: right - c.strip.clientWidth,
            behavior: reduced() ? "auto" : "smooth",
          });
      };
      const reset = () => {
        generation++;
        gesture?.cancel(false);
        cancelAnimationFrame(frame);
        frame = 0;
        animations.forEach((animation) => animation.cancel());
        animations = [];
        c.track.style.transform = "";
        c.viewport.removeAttribute("data-swiping");
        c.preview = undefined;
        busy = false;
        offset = 0;
        paintIndicator();
      };
      const neighbor = (delta) => {
        const step = delta < 0 ? 1 : -1,
          index = (c.p.options ?? []).findIndex(
            (item) => item.value === c.selected?.value,
          );
        c.preview = undefined;
        for (let i = index + step; i >= 0 && i < c.p.options.length; i += step)
          if (!c.p.options[i].disabled) {
            c.preview = c.p.options[i];
            break;
          }
        c.previewStep = step;
      };
      const paint = () => {
        frame = 0;
        c.track.style.transform = `translate3d(${offset}px,0,0)`;
        paintIndicator(c.preview ? Math.min(1, Math.abs(offset) / width) : 0);
      };
      const gesture = touchDrag(c.viewport, {
        axis: () => "x",
        enabled: () => c.p.swipeable && !busy,
        start(delta) {
          if (!c.selected) return false;
          width = c.viewport.clientWidth;
          if (!width) return false;
          neighbor(delta);
          c.viewport.dataset.swiping = "";
          return true;
        },
        move(delta) {
          neighbor(delta);
          offset = c.preview
            ? clamp(delta, -width, width)
            : (delta * 0.22) / (1 + Math.abs(delta) / width);
          c.paint();
          if (!frame) frame = requestAnimationFrame(paint);
        },
        async end(delta, velocity, cancelled) {
          cancelAnimationFrame(frame);
          paint();
          busy = true;
          const destination = c.preview,
            commit =
              !!destination &&
              !cancelled &&
              completesSwipe(
                Math.abs(delta),
                velocity * (delta < 0 ? -1 : 1),
                width,
              ),
            next = commit ? -c.previewStep * width : 0,
            target = metrics(commit ? destination.value : c.selected?.value),
            version = ++generation;
          animations = [
            c.track.animate(
              [
                { transform: `translate3d(${offset}px,0,0)` },
                { transform: `translate3d(${next}px,0,0)` },
              ],
              {
                duration: reduced() ? 0 : 240,
                easing: "cubic-bezier(.2,.8,.2,1)",
                fill: "forwards",
              },
            ),
            c.indicator.animate(
              [
                {
                  translate: c.indicator.style.translate,
                  width: c.indicator.style.width,
                },
                {
                  translate: target.left + "px 0px",
                  width: target.width + "px",
                },
              ],
              {
                duration: reduced() ? 0 : 240,
                easing: "cubic-bezier(.2,.8,.2,1)",
                fill: "forwards",
              },
            ),
          ];
          try {
            await Promise.all(
              animations.map((animation) => animation.finished),
            );
          } catch {
            return;
          }
          if (version !== generation) return;
          const moveFocus = c.track.contains(document.activeElement);
          if (commit) {
            c.p.value = destination.value;
            c.emit("change", destination.value);
          }
          reset();
          c.paint();
          if (commit) {
            reveal();
            if (moveFocus)
              c.items
                .find((entry) => entry.item.value === destination.value)
                ?.panel.focus({ preventScroll: true });
          }
        },
      });
      c.select = (value) => {
        reset();
        c.set(value);
        reveal();
      };
      c.paintIndicator = paintIndicator;
      c.reset = reset;
      c.resize = new ResizeObserver(() => {
        if (c.viewport.hasAttribute("data-swiping")) {
          reset();
          c.paint();
        } else paintIndicator();
      });
      c.resize.observe(c.strip);
      c.cleanups.add(() => {
        gesture.destroy();
        c.resize.disconnect();
        reset();
      });
      c.on(c.strip, "keydown", (event) => {
        const current =
          event.target instanceof Element
            ? event.target.closest("button")
            : null;
        if (!current || event.altKey || event.ctrlKey || event.metaKey) return;
        const entry = c.items.find((entry) => entry.button === current);
        const next = navigateTab(c.p.options, entry?.item.value, event.key);
        if (next) {
          event.preventDefault();
          c.select(next.value);
          c.items
            .find((entry) => entry.item.value === next.value)
            ?.button.focus({ preventScroll: true });
        }
      });
    },
    paint(c) {
      const selected = resolveTab(c.p.options ?? [], c.p.value);
      if (
        c.previousValue !== selected?.value ||
        (!c.p.swipeable && c.viewport.hasAttribute("data-swiping"))
      ) {
        c.reset();
      }
      c.previousValue = selected?.value;
      c.selected = selected;
      attrs(c.strip, { role: "tablist", "aria-label": c.p.label });
      attr(c.viewport, "data-swipeable", c.p.swipeable || undefined);
      const signature = JSON.stringify(c.p.options ?? []);
      if (signature !== c.signature) {
        c.reset();
        c.signature = signature;
        c.clear(c.strip);
        c.clear(c.track);
        c.items = (c.p.options ?? []).map((item, index) => {
          const button = el("button", "", item.label);
          attrs(button, {
            type: "button",
            role: "tab",
            id: c.id + "-tab-" + index,
            "aria-controls": c.id + "-panel-" + index,
            disabled: item.disabled,
          });
          button.onclick = () => c.select(item.value);
          const panel = el("div", "tab-panel");
          attrs(panel, {
            id: c.id + "-panel-" + index,
            role: "tabpanel",
            "aria-labelledby": button.id,
          });
          c.strip.append(button);
          c.track.append(panel);
          return { item, button, panel };
        });
        c.strip.append(c.indicator);
      }
      for (const entry of c.items) {
        const current = entry.item.value === selected?.value,
          preview = entry.item.value === c.preview?.value && !current;
        attrs(entry.button, {
          "aria-selected": current,
          tabindex: current ? 0 : -1,
          disabled: entry.item.disabled,
        });
        attrs(entry.panel, {
          "aria-hidden": current ? undefined : true,
          inert: !current,
          tabindex: current ? 0 : -1,
          hidden: !current && !preview,
        });
        state(entry.panel, { "is-preview": preview });
        entry.panel.style.left = preview ? c.previewStep * 100 + "%" : "";
        if (current || preview)
          c.slot("default", entry.panel, {
            value: entry.item.value,
            option: entry.item,
          });
        else {
          c.outlets.delete(entry.panel);
          if (!c.externalSlots) entry.panel.replaceChildren();
        }
      }
      c.paintIndicator();
    },
  });

  // ── Popup API：默认原生内容；Vue 仅接管内容的渲染，不接管弹层交互 ────────────
  const popupStore = createPopupStore(() => Promise.resolve(), null),
    popupViews = new Map();
  let stopPopupHost;
  function ensurePopupHost() {
    if (stopPopupHost) return;
    stopPopupHost = popupStore.attach((entries) => {
      const current = new Set(entries.map((entry) => entry.id));
      for (const [id, view] of popupViews)
        if (!current.has(id)) {
          view.dispose?.();
          view.controller.destroy();
          popupViews.delete(id);
        }
      for (const entry of entries) {
        const view = popupViews.get(entry.id);
        if (view) {
          view.controller.update({ value: entry.open });
          continue;
        }
        const kind =
            entry.kind === "alert"
              ? "Dialog"
              : entry.kind === "sheet"
                ? "Sheet"
                : "Drawer",
          options = entry.options;
        const controller = create(
          kind,
          {
            ...options,
            value: entry.open,
            description: options.message ?? options.description,
          },
          {
            emit: (event, ...args) => {
              if (event === "confirm") {
                if (entry.close(kind === "Dialog" ? true : undefined))
                  queueMicrotask(() => options.onConfirm?.());
              } else if (event === "after-leave") popupStore.finish(entry.id);
              else if (event === "cancel" || event === "close")
                entry.close(kind === "Dialog" ? false : undefined);
              else if (event === "select") entry.close(args[0]);
            },
          },
        );
        const record = { controller };
        popupViews.set(entry.id, record);
        if (options.renderContent) {
          controller.slotNames.add("default");
          controller.externalSlots = true;
          controller.paint();
          record.dispose = options.renderContent(
            controller.content ?? controller.body,
            entry.context,
          );
        } else if (options.content) {
          controller.slotNames.add("default");
          controller.slots.default = () => options.content(entry.context);
          controller.paint();
        }
        styles(controller.overlay, options.style);
      }
    });
  }
  function showPopup(kind, options = {}) {
    ensurePopupHost();
    return popupStore.show({
      kind: kind === "Dialog" ? "alert" : kind === "Sheet" ? "sheet" : "drawer",
      options,
    });
  }
  /** API 弹层无需注册宿主；单次调用创建，退出动画结束后释放。 */
  const popup = {
    /** 默认底部提示，center:true 居中；返回用户是否确认。 */
    showAlert(options) {
      return showPopup("Dialog", {
        cancelText: "取消",
        confirmText: "确定",
        icon: false,
        ...options,
        center: options.center ?? false,
      }).closed.then((value) => value === true);
    },
    /** content({close}) 返回节点、文本或组件实例，自由组合列表与选择控件。 */
    showSheet(options) {
      return showPopup("Sheet", options);
    },
    /** placement 支持四个方向，内容与结果接口和底部面板一致。 */
    showDrawer(options) {
      return showPopup("Drawer", options);
    },
    /** 应用卸载时立即释放窗口与未结束的结果。 */
    closeAll() {
      stopPopupHost?.();
      stopPopupHost = undefined;
      const views = [...popupViews.values()];
      popupViews.clear();
      for (const view of views) {
        view.dispose?.();
        view.controller.destroy();
      }
    },
  };
  register("Popup", {
    init(c) {
      c.element.hidden = true;
    },
    destroy() {
      popup.closeAll();
    },
  });
  register("Toast", {
    defaults: { duration: 2600 },
    init(c) {
      c.element.style.display = "contents";
      c.toast = el("div", "toast");
      attrs(c.toast, {
        role: "status",
        "aria-live": "polite",
        "aria-atomic": true,
      });
      c.message = el("span");
      c.toast.append(svgIcon("check"), c.message);
      document.body.append(c.toast);
      scope(c.toast, "Toast");
      c.exposed.show = (value) => {
        clearTimeout(c.timer);
        text(c.message, value);
        c.toast.classList.add("my-show");
        c.timer = setTimeout(
          () => c.toast.classList.remove("my-show"),
          c.p.duration,
        );
      };
      c.cleanups.add(() => {
        clearTimeout(c.timer);
        c.toast.remove();
      });
    },
  });

  /** 挂载到现有元素；原有子节点作为默认内容保留，重复挂载返回同一实例。 */
  function mount(target, name, properties = {}, options = {}) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) throw new TypeError("找不到组件宿主：" + target);
    const previous = controllers.get(element);
    if (previous) {
      previous.update(properties);
      return previous;
    }
    const children = [...element.childNodes];
    element.replaceChildren();
    return create(name, properties, {
      ...options,
      element,
      slots: {
        ...(children.length ? { default: children } : {}),
        ...options.slots,
      },
    });
  }
  /** 增强 data-my="组件名"；复杂数据放 data-options JSON，实例更新使用 mount/create。 */
  function init(root = document) {
    const result = [];
    for (const element of root.querySelectorAll("[data-my]")) {
      if (controllers.has(element)) continue;
      let options = {};
      try {
        options = JSON.parse(element.getAttribute("data-options") || "{}");
      } catch (error) {
        console.error("my-ui: data-options 不是有效 JSON", element, error);
        continue;
      }
      result.push(mount(element, element.getAttribute("data-my"), options));
    }
    // 普通语义按钮只加内部样式标记，点击仍然使用浏览器标准事件。
    for (const button of root.querySelectorAll(
      "button.my-button:not([data-my-component])",
    )) {
      scope(button, "Button");
      if (!button.querySelector(".my-button-content")) {
        const body = el("span", "button-content");
        body.append(...button.childNodes);
        button.append(body);
        scope(button, "Button");
      }
      button.classList.add("my-primary");
    }
    return result;
  }

  const api = {
    create,
    mount,
    init,
    popup,
    applyTheme,
    createTheme,
    contrastRatio,
    themeColors,
    themeStyles,
    defaultThemeOptions,
  };
  // 纯函数单独暴露给适配层和定向回归，不引入运行时依赖。
  Object.defineProperty(api, "utils", {
    value: {
      createPopupStore,
      updateSelection,
      isListSelected,
      selectListValue,
      resolveTab,
      navigateTab,
      sliderScale,
      resolveFloatingPosition,
      floatingRectVisible,
      completesSwipe,
      canScrollGesture,
    },
  });
  globalThis.MyUI = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", () => init(), {
        once: true,
      });
    else queueMicrotask(() => init());
  }
})();
