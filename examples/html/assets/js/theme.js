/*
 * 展示站专用的配色预设与主题编辑逻辑。
 * 移植自 example/src/commons/theme/index.js：去掉 ESM 导出，改为普通脚本挂到 window.MyUITheme，
 * 这样双击 file:// 打开页面也能工作，不需要构建或 type="module"。
 */
(function (global) {
  'use strict'

  // ── 示例配色预设 ──
  /** 参考常见色系挑选的主色，浅色用深色值，暗色用明亮且柔和的色值。 */
  var themeColors = [
    { id: 'blue', label: '蓝色', light: '#2454c6', dark: '#aac8ff' },
    { id: 'indigo', label: '靛蓝', light: '#4b46b3', dark: '#bec3ff' },
    { id: 'purple', label: '紫色', light: '#7040b3', dark: '#d6b6ff' },
    { id: 'pink', label: '莓粉', light: '#a52461', dark: '#ffb0d0' },
    { id: 'red', label: '红色', light: '#ad2939', dark: '#ffacae' },
    { id: 'teal', label: '青绿', light: '#006458', dark: '#96e1d4' },
    { id: 'green', label: '绿色', light: '#176737', dark: '#a4dfb4' },
    { id: 'cyan', label: '湖蓝', light: '#00647f', dark: '#a0e0f1' },
    { id: 'brown', label: '暖棕', light: '#795241', dark: '#e4c0ab' },
    { id: 'slate', label: '蓝灰', light: '#465c73', dark: '#bfd0e5' },
    { id: 'yellow', label: '暖黄', dark: '#f3db82' },
    { id: 'amber', label: '琥珀', dark: '#f6ca82' },
    { id: 'orange', label: '杏橙', dark: '#ffbc8c' },
    { id: 'lime', label: '青柠', dark: '#cddd9b' }
  ]

  var lightLayers = {
    background: '#f2f3f5',
    cardBackground: '#ffffff',
    fill: '#f1f2f4',
    border: '#dde0e5',
    text: '#17191e',
    textSecondary: '#626874',
    gray: '#bac2ce',
    hover: '#e9ecf0',
    press: '#e0e4ea',
    selectedBackground: '#ffffff',
    selectedShadow: '0 1px 4px rgb(18 25 37 / .10), 0 0 0 1px rgb(18 25 37 / .05)',
    smallShadow: '0 1px 2px rgb(18 25 37 / .10)',
    shadow: '0 1px 3px rgb(18 25 37 / .045), 0 4px 12px rgb(18 25 37 / .025)',
    popupShadow:
      '0 0 0 1px rgb(18 25 37 / .07), 0 4px 12px rgb(18 25 37 / .12), 0 18px 44px -8px rgb(18 25 37 / .24)',
    modalShadow:
      '0 0 0 1px rgb(18 25 37 / .08), 0 8px 24px rgb(18 25 37 / .14), 0 32px 80px -12px rgb(18 25 37 / .30)',
    overlay: 'rgb(12 18 28 / .34)',
    success: '#176b3c',
    warning: '#805500',
    danger: '#b5283c'
  }

  var darkLayers = {
    background: '#121419',
    cardBackground: '#252931',
    fill: '#333944',
    border: '#596576',
    text: '#f4f6fa',
    textSecondary: '#c4cbd6',
    gray: '#7c899c',
    hover: '#3c4350',
    press: '#464e5b',
    selectedBackground: '#414956',
    selectedShadow: '0 1px 5px rgb(0 0 0 / .28), 0 0 0 1px #68778c',
    smallShadow: '0 1px 2px rgb(0 0 0 / .32)',
    shadow: '0 1px 3px rgb(0 0 0 / .16), 0 4px 12px rgb(0 0 0 / .12)',
    popupShadow:
      '0 0 0 1px rgb(255 255 255 / .20), 0 4px 12px rgb(0 0 0 / .36), 0 20px 48px -8px rgb(0 0 0 / .70)',
    modalShadow:
      '0 0 0 1px rgb(255 255 255 / .22), 0 8px 24px rgb(0 0 0 / .44), 0 32px 80px -12px rgb(0 0 0 / .82)',
    overlay: 'rgb(0 0 0 / .62)',
    success: '#a4dfb4',
    warning: '#f3db82',
    danger: '#ffacae'
  }

  /** 每组风格都提供两份独立数据，主色与界面灰阶互不影响。 */
  var themeStyles = [
    {
      id: 'soft',
      label: '柔和',
      description: '自然留白，平衡层次',
      light: lightLayers,
      dark: darkLayers
    },
    {
      id: 'clear',
      label: '清晰',
      description: '更明确的边界与层次',
      light: Object.assign({}, lightLayers, {
        background: '#edf0f4',
        fill: '#edf0f5',
        border: '#ccd4df',
        text: '#101722',
        textSecondary: '#515d6e',
        gray: '#aab7c9',
        hover: '#e1e7ef',
        press: '#d4dde9',
        smallShadow: '0 1px 2px rgb(18 25 37 / .13)',
        shadow: '0 1px 2px rgb(18 25 37 / .06), 0 3px 8px rgb(18 25 37 / .035)',
        popupShadow:
          '0 0 0 1px rgb(18 25 37 / .12), 0 3px 8px rgb(18 25 37 / .14), 0 14px 32px -6px rgb(18 25 37 / .26)',
        modalShadow:
          '0 0 0 1px rgb(18 25 37 / .13), 0 6px 16px rgb(18 25 37 / .18), 0 24px 56px -8px rgb(18 25 37 / .34)'
      }),
      dark: Object.assign({}, darkLayers, {
        background: '#0d1015',
        cardBackground: '#1d232d',
        fill: '#2c3543',
        border: '#64748b',
        text: '#ffffff',
        textSecondary: '#d0d8e4',
        gray: '#8192aa',
        hover: '#394454',
        press: '#434f60',
        selectedBackground: '#424f62',
        selectedShadow: '0 0 0 1px #8293ac, 0 2px 6px rgb(0 0 0 / .35)',
        smallShadow: '0 1px 2px rgb(0 0 0 / .40)',
        shadow: '0 1px 3px rgb(0 0 0 / .24), 0 3px 8px rgb(0 0 0 / .12)',
        popupShadow:
          '0 0 0 1px rgb(255 255 255 / .24), 0 3px 10px rgb(0 0 0 / .44), 0 16px 36px -6px rgb(0 0 0 / .78)',
        modalShadow:
          '0 0 0 1px rgb(255 255 255 / .26), 0 6px 18px rgb(0 0 0 / .50), 0 28px 64px -8px rgb(0 0 0 / .88)'
      })
    },
    {
      id: 'warm',
      label: '暖灰',
      description: '轻柔温润的中性色',
      light: Object.assign({}, lightLayers, {
        background: '#f4f2ef',
        cardBackground: '#fffdfa',
        fill: '#f0ece6',
        border: '#ddd5cc',
        text: '#27231f',
        textSecondary: '#6e655c',
        gray: '#c4b8ab',
        hover: '#e9e2d9',
        press: '#dfd4c8',
        selectedBackground: '#fffcf8',
        smallShadow: '0 1px 3px rgb(46 35 23 / .10)',
        shadow: '0 1px 4px rgb(46 35 23 / .05), 0 5px 14px rgb(46 35 23 / .025)',
        popupShadow:
          '0 0 0 1px rgb(46 35 23 / .08), 0 4px 14px rgb(46 35 23 / .12), 0 20px 48px -8px rgb(46 35 23 / .23)',
        modalShadow:
          '0 0 0 1px rgb(46 35 23 / .09), 0 8px 26px rgb(46 35 23 / .14), 0 34px 84px -12px rgb(46 35 23 / .29)'
      }),
      dark: Object.assign({}, darkLayers, {
        background: '#171512',
        cardBackground: '#2b2824',
        fill: '#38332d',
        border: '#70675b',
        text: '#faf5ed',
        textSecondary: '#d2c8bc',
        gray: '#968777',
        hover: '#433d35',
        press: '#504b45',
        selectedBackground: '#48443f',
        selectedShadow: '0 1px 5px rgb(0 0 0 / .30), 0 0 0 1px #85796b',
        smallShadow: '0 1px 3px rgb(0 0 0 / .32)',
        shadow: '0 1px 4px rgb(0 0 0 / .18), 0 5px 14px rgb(0 0 0 / .12)',
        popupShadow:
          '0 0 0 1px rgb(255 242 222 / .20), 0 4px 14px rgb(0 0 0 / .36), 0 22px 52px -8px rgb(0 0 0 / .72)',
        modalShadow:
          '0 0 0 1px rgb(255 242 222 / .22), 0 8px 26px rgb(0 0 0 / .44), 0 34px 84px -12px rgb(0 0 0 / .82)'
      })
    }
  ]

  /** 展示页主题面板的初始选择，不属于组件默认配置。 */
  var defaultThemeOptions = {
    mode: 'light',
    backdropBlur: true,
    fontWeight: 400,
    light: { color: 'blue', style: 'soft' },
    dark: { color: 'blue', style: 'soft' }
  }

  /** 创建一份独立的默认配置，避免多个页面或调用方共享嵌套对象。 */
  function defaultThemeState() {
    return Object.assign({}, defaultThemeOptions, {
      light: Object.assign({}, defaultThemeOptions.light),
      dark: Object.assign({}, defaultThemeOptions.dark)
    })
  }

  function normalizeHex(value) {
    if (typeof value !== 'string') throw new TypeError('主题颜色必须使用 #RGB 或 #RRGGBB 格式')
    var match = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim())
    if (!match) throw new TypeError('主题颜色必须使用 #RGB 或 #RRGGBB 格式')
    return (
      '#' +
      (match[1].length === 3
        ? match[1]
            .split('')
            .map(function (char) {
              return char + char
            })
            .join('')
        : match[1]
      ).toLowerCase()
    )
  }

  function luminance(value) {
    var hex = normalizeHex(value)
    var channels = [1, 3, 5].map(function (index) {
      var channel = parseInt(hex.slice(index, index + 2), 16) / 255
      return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  }

  /** 计算两种 HEX 颜色的文字对比度，用于提示自定义配色的可读性。 */
  function contrastRatio(first, second) {
    var a = luminance(first)
    var b = luminance(second)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  }

  var colorFields = [
    'background',
    'cardBackground',
    'fill',
    'border',
    'text',
    'textSecondary',
    'gray',
    'hover',
    'press',
    'selectedBackground',
    'success',
    'warning',
    'danger'
  ]
  var effectFields = ['selectedShadow', 'smallShadow', 'shadow', 'popupShadow', 'modalShadow', 'overlay']

  function resolveData(mode, data, primaryOverride) {
    var style = themeStyles.find(function (item) {
      return item.id === (data.style || 'soft')
    })
    var color = themeColors.find(function (item) {
      return item.id === (data.color || 'blue')
    })
    if (!style) throw new TypeError('未知的主题风格')
    if (!color || !color[mode]) throw new TypeError('当前主题不可使用该主色')
    var layers = Object.assign({}, style[mode])
    colorFields.forEach(function (field) {
      if (data[field] !== undefined) layers[field] = normalizeHex(data[field])
    })
    effectFields.forEach(function (field) {
      if (data[field] === undefined) return
      if (typeof data[field] !== 'string' || !data[field].trim())
        throw new TypeError('主题效果必须使用非空 CSS 值')
      layers[field] = data[field]
    })
    var primary = normalizeHex(data.primary || primaryOverride || color[mode])
    var primaryText =
      contrastRatio(primary, '#ffffff') >= contrastRatio(primary, '#000000') ? '#ffffff' : '#000000'
    return {
      mode: mode,
      style: style.id,
      color: color.id,
      colors: Object.assign({}, layers, { primary: primary, primaryText: primaryText }),
      primary: primary,
      'primary-text': primaryText
    }
  }

  /** 解析所选主题；systemDark 为系统外观，纯函数不依赖浏览器或修改配置。 */
  function createTheme(options, systemDark) {
    options = options || {}
    var preference = options.mode || 'light'
    if (['light', 'dark', 'system'].indexOf(preference) < 0)
      throw new TypeError('主题模式必须是 light、dark 或 system')
    var backdropBlur =
      options.backdropBlur === undefined ? defaultThemeOptions.backdropBlur : options.backdropBlur
    if (typeof backdropBlur !== 'boolean') throw new TypeError('背景模糊必须使用布尔值')
    var fontWeight =
      options.fontWeight === undefined ? defaultThemeOptions.fontWeight : options.fontWeight
    if (
      typeof fontWeight !== 'number' ||
      !isFinite(fontWeight) ||
      fontWeight < 100 ||
      fontWeight > 1000
    )
      throw new TypeError('字重必须是 100～1000 之间的有限数值')
    // 两份数据同时校验，避免跟随系统时才暴露另一份配置的错误。
    var light = resolveData('light', options.light || {}, options.primary)
    var dark = resolveData('dark', options.dark || {}, options.primary)
    var theme =
      preference === 'dark' || (preference === 'system' && systemDark) ? dark : light
    return Object.assign({}, theme, { backdropBlur: backdropBlur, fontWeight: fontWeight })
  }

  // ── 示例主题应用 ──
  var properties = {
    primary: '--primary',
    primaryText: '--primary-text',
    background: '--background',
    cardBackground: '--card-background',
    fill: '--fill',
    border: '--border',
    text: '--text',
    textSecondary: '--text-secondary',
    gray: '--gray',
    hover: '--hover',
    press: '--press',
    selectedBackground: '--selected-background',
    selectedShadow: '--selected-shadow',
    smallShadow: '--small-shadow',
    shadow: '--shadow',
    popupShadow: '--popup-shadow',
    modalShadow: '--modal-shadow',
    overlay: '--overlay-background',
    success: '--success',
    warning: '--warning',
    danger: '--danger'
  }

  var stopPrevious

  /** 应用独立的明暗数据并同步系统模式；返回函数可停止本次系统监听。 */
  function applyTheme(options) {
    options = options || {}
    var snapshot = Object.assign({}, options, {
      light: Object.assign({}, options.light),
      dark: Object.assign({}, options.dark)
    })
    var media =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : undefined
    var initial = createTheme(snapshot, media ? media.matches : false)
    // 配置先完整校验，再替换当前主题与监听，非法配置不会破坏已应用的主题。
    if (stopPrevious) stopPrevious()
    function render(theme) {
      var root = document.documentElement
      var variables = {}
      function set(name, value) {
        root.style.setProperty(name, value)
        variables[name] = value
      }
      Object.keys(properties).forEach(function (field) {
        set(properties[field], theme.colors[field])
      })
      set('--overlay-backdrop-filter', theme.backdropBlur ? 'blur(4px)' : 'none')
      set('--font-weight', String(theme.fontWeight))
      // 变细时四档同步平移，增粗时保留原本更粗的标题，不增加用户配置项。
      ;[
        ['action', 500],
        ['subtitle', 600],
        ['title', 700]
      ].forEach(function (pair) {
        var weight =
          theme.fontWeight < 400 ? pair[1] + theme.fontWeight - 400 : Math.max(pair[1], theme.fontWeight)
        set('--font-weight-' + pair[0], String(Math.min(1000, Math.max(100, weight))))
      })
      root.dataset.theme = theme.mode
      root.dataset.themePreference = snapshot.mode || 'light'
      root.dataset.themeStyle = theme.style
      // 新文档在主脚本执行前复用已解析的变量，不重新实现配色预设。
      try {
        localStorage.setItem(
          'my-ui:theme-render',
          JSON.stringify({ mode: theme.mode, variables: variables })
        )
      } catch (error) {
        /* 隐私模式等存储不可用时，本次仍按内存中的配置渲染。 */
      }
    }
    render(initial)
    function update() {
      render(createTheme(snapshot, media ? media.matches : false))
    }
    if (snapshot.mode === 'system' && media) media.addEventListener('change', update)
    var stopped = false
    function stop() {
      if (stopped) return
      stopped = true
      if (media) media.removeEventListener('change', update)
      if (stopPrevious === stop) stopPrevious = undefined
    }
    stopPrevious = stop
    return stop
  }

  // ── 本地偏好读写 ──
  /** 兼容旧版本的本地主题快照，同时供新页面首帧使用。 */
  function readThemeSnapshot() {
    try {
      var raw = localStorage.getItem('my-ui:theme') || localStorage.getItem('chenglan:theme')
      var saved = JSON.parse(raw || 'null')
      if (!saved) return defaultThemeState()
      var next = Object.assign({}, defaultThemeState(), saved, {
        light: Object.assign({}, defaultThemeOptions.light, saved.light),
        dark: Object.assign({}, defaultThemeOptions.dark, saved.dark)
      })
      createTheme(next)
      return {
        mode: next.mode,
        backdropBlur: next.backdropBlur,
        fontWeight: next.fontWeight,
        light: next.light,
        dark: next.dark
      }
    } catch (error) {
      return defaultThemeState()
    }
  }

  /** 保留首帧快照；跨窗口通知以 localStorage 事件为准。 */
  function saveThemeSnapshot(settings) {
    try {
      localStorage.setItem('my-ui:theme', JSON.stringify(settings))
    } catch (error) {
      /* 存储不可用时仍应用当前外观。 */
    }
  }

  global.MyUITheme = {
    themeColors: themeColors,
    themeStyles: themeStyles,
    defaultThemeOptions: defaultThemeOptions,
    defaultThemeState: defaultThemeState,
    contrastRatio: contrastRatio,
    createTheme: createTheme,
    applyTheme: applyTheme,
    readThemeSnapshot: readThemeSnapshot,
    saveThemeSnapshot: saveThemeSnapshot
  }
})(window)
