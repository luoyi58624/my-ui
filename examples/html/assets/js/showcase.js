/*
 * 「完整交互示例」长页的页面脚本（本页自用，不依赖 shell.js）。
 *
 * 职责：
 *   1. 应用外壳：主页 AppBar、明暗切换、Toast 入口
 *   2. 滚动交互：masthead 分隔线、scrollspy、分区平滑定位、回到顶部
 *   3. 装配五个分区的全部组件演示（MyUI.create / MyUI.mount）
 *
 * 约定：所有宿主用 data-demo-* 标记，装配代码与已验证的 pages/*.html 保持一致。
 */
;(function () {
  'use strict'

  var THEME = window.MyUITheme
  var media =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null
  var SECTIONS = ['actions', 'controls', 'surfaces', 'feedback', 'scenarios']

  // ── 主题 ──
  var themeState = THEME.readThemeSnapshot()
  var stopTheme = THEME.applyTheme(themeState)

  /** 当前解析后的外观（system 会跟随系统）。 */
  function resolvedTheme() {
    return THEME.createTheme(themeState, media ? media.matches : false)
  }

  /** 写入主题：先校验再落盘，非法配置不破坏已应用的外观。 */
  function setThemeMode(mode) {
    var next = Object.assign({}, themeState, { mode: mode })
    try {
      THEME.createTheme(next, false)
    } catch (error) {
      notify(error instanceof Error ? error.message : String(error))
      return false
    }
    themeState = next
    stopTheme = THEME.applyTheme(themeState)
    THEME.saveThemeSnapshot(themeState)
    return true
  }

  // ── Toast ──
  var toast = null
  /** 轻提示入口：全局复用一个 Toast 实例，页面与弹层共用。 */
  function notify(message) {
    if (!toast) {
      toast = window.MyUI.create('Toast', { duration: 2400 })
      document.body.append(toast.element)
    }
    toast.exposed.show(String(message))
  }
  window.notify = notify

  /** 统一的元素查询。 */
  function pick(selector) {
    return document.querySelector(selector)
  }

  /** 把图标塞进已经存在的宿主元素。 */
  function icon(host, name) {
    host.append(window.MyUI.create('Icon', { name: name }).element)
    return host
  }

  // ── 外壳 ──
  /** 顶部 AppBar：单页站点没有返回目标，只保留标题。 */
  function mountAppBar() {
    var host = document.getElementById('showcase-appbar')
    if (!host) return
    host.append(window.MyUI.create('AppBar', { title: '完整交互示例' }).element)
  }

  /** masthead 右侧的明暗切换按钮。 */
  function mountThemeToggle() {
    var host = document.getElementById('showcase-theme')
    if (!host) return
    var dark = resolvedTheme().mode === 'dark'
    var button = window.MyUI.create(
      'Button',
      {
        variant: 'bare',
        icon: dark ? 'sun' : 'moon',
        onClick: function () {
          var next = resolvedTheme().mode === 'dark' ? 'light' : 'dark'
          if (!setThemeMode(next)) return
          var nowDark = resolvedTheme().mode === 'dark'
          button.update(
            { icon: nowDark ? 'sun' : 'moon' },
            { 'aria-label': nowDark ? '切换到浅色模式' : '切换到暗黑模式' }
          )
        }
      },
      { attributes: { 'aria-label': dark ? '切换到浅色模式' : '切换到暗黑模式' } }
    )
    host.append(button.element)
  }

  // ── 滚动交互 ──
  var layout = null
  var masthead = null
  var links = []
  var frame = 0

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  /** 同步 masthead 阴影与当前分区（阈值 clientHeight * 0.35）。 */
  function syncHeader() {
    if (!layout || !masthead) return
    masthead.classList.toggle('scrolled', layout.scrollTop > 24)
    var base = layout.getBoundingClientRect().top
    var current = ''
    for (var i = 0; i < SECTIONS.length; i += 1) {
      var section = document.getElementById('showcase-' + SECTIONS[i])
      if (!section) continue
      if (section.getBoundingClientRect().top - base <= layout.clientHeight * 0.35) {
        current = SECTIONS[i]
      }
    }
    links.forEach(function (link) {
      var on = link.dataset.section === current
      link.classList.toggle('current', on)
      if (on) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  /** rAF 节流，滚动时每帧最多算一次。 */
  function scheduleHeader() {
    if (frame) return
    frame = requestAnimationFrame(function () {
      frame = 0
      syncHeader()
    })
  }

  /** 滚到某个分区，减去 masthead 高度与 20px 呼吸位。 */
  function scrollToSection(id) {
    if (!layout || !masthead) return
    var target = id === 'top' ? null : document.getElementById('showcase-' + id)
    var top = 0
    if (target) {
      top =
        target.getBoundingClientRect().top -
        layout.getBoundingClientRect().top +
        layout.scrollTop -
        masthead.offsetHeight -
        20
    }
    layout.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? 'instant' : 'smooth'
    })
  }

  function mountScrollBehaviour() {
    layout = document.getElementById('showcase-layout')
    masthead = document.querySelector('.masthead')
    if (!layout || !masthead) return
    links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[data-section]'))

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault()
        scrollToSection(link.dataset.section)
      })
    })

    // 「原生 HTML 示例 ↗」在单页站点里退化为定位到示例分区。
    Array.prototype.slice.call(document.querySelectorAll('[data-scroll-scenarios]')).forEach(
      function (node) {
        node.addEventListener('click', function (event) {
          event.preventDefault()
          scrollToSection('scenarios')
        })
      }
    )
    Array.prototype.slice.call(document.querySelectorAll('[data-scroll-actions]')).forEach(
      function (node) {
        node.addEventListener('click', function (event) {
          event.preventDefault()
          scrollToSection('actions')
        })
      }
    )
    Array.prototype.slice.call(document.querySelectorAll('[data-scroll-top]')).forEach(
      function (node) {
        node.addEventListener('click', function (event) {
          event.preventDefault()
          scrollToSection('top')
        })
      }
    )

    layout.addEventListener('scroll', scheduleHeader, { passive: true })
    window.addEventListener('resize', scheduleHeader, { passive: true })
    document.addEventListener('visibilitychange', scheduleHeader)
    syncHeader()
  }

  // ── 演示装配 ──
  /** 头图里的四个图标。 */
  function buildHeroArt() {
    icon(pick('[data-cta-icon]'), 'arrow-right')
    icon(pick('[data-sample-icon]'), 'spark')
    icon(pick('[data-chip-check]'), 'check')
    icon(pick('[data-chip-spark]'), 'spark')
  }

  /** 01 基础组件：Button 与 Tag。 */
  function buildActions() {
    var buttonNote = pick('[data-button-note]')
    var buttonRow = pick('[data-demo-button]')
    ;[
      { label: '主要操作' },
      { label: '次要操作', variant: 'outline' },
      { label: '文字操作', variant: 'text' }
    ].forEach(function (item) {
      buttonRow.append(
        window.MyUI.create('Button', {
          label: item.label,
          variant: item.variant,
          onClick: function () {
            buttonNote.textContent = '已触发：' + item.label
          }
        }).element
      )
    })
    var favorited = false
    var favorite = window.MyUI.create(
      'Button',
      {
        variant: 'icon',
        icon: 'heart',
        selected: false,
        onClick: function () {
          favorited = !favorited
          favorite.update({ selected: favorited })
          buttonNote.textContent = favorited ? '已收藏这条灵感' : '已取消收藏'
        }
      },
      { attributes: { 'aria-label': '收藏' } }
    )
    buttonRow.append(favorite.element)
    buttonRow.append(window.MyUI.create('Button', { label: '不可用', disabled: true }).element)

    // Tag：展示标签 + 独立切换标签 + 单选标签组
    var tagRow = pick('[data-demo-tags]')
    ;[
      { text: '推荐' },
      { text: '已完成', tone: 'green' },
      { text: '处理中', tone: 'orange' },
      { text: '需留意', tone: 'red' },
      { text: '草稿', tone: 'gray' }
    ].forEach(function (item) {
      tagRow.append(
        window.MyUI.create('Tag', { tone: item.tone }, { slots: { default: item.text } }).element
      )
    })
    var later = window.MyUI.create('Tag', {
      value: false,
      label: '稍后阅读',
      onChange: function (selected) {
        buttonNote.textContent = selected ? '已加入稍后阅读' : '已取消稍后阅读'
      }
    })
    tagRow.append(later.element)
    window.MyUI.mount('[data-demo-tag-group]', 'TagGroup', {
      label: '探索方向',
      value: '灵感',
      options: [
        { value: '灵感', label: '✨ 灵感' },
        { value: '云端', label: '☁️ 云端' },
        { value: '发现', label: '✦ 发现' },
        { value: '未开放', label: '未开放', disabled: true }
      ],
      onChange: function (value) {
        buttonNote.textContent = '探索方向：' + value
      }
    })
  }

  /** 02 交互控制：输入、选择、日期与上传。 */
  function buildControls() {
    window.MyUI.mount('[data-demo-input]', 'Input', {
      label: '搜索',
      value: '',
      icon: 'search',
      clearable: true,
      placeholder: '寻找你感兴趣的内容…'
    })
    window.MyUI.mount('[data-demo-select]', 'Select', {
      label: '内容分类',
      value: '视觉灵感',
      options: [
        { value: '视觉灵感', label: '视觉灵感' },
        { value: '效率优先', label: '效率优先' },
        { value: '轻度探索', label: '轻度探索' }
      ]
    })

    var switchNote = pick('[data-switch-note]')
    window.MyUI.mount('[data-demo-switch]', 'CellGroup', { title: '通知', label: '通知' }, {
      slots: {
        default: [
          window.MyUI.create(
            'ListRow',
            {
              title: '接收更新提醒',
              description: '每天汇总一次',
              toggle: true,
              value: true,
              onChange: function (value) {
                switchNote.textContent = value ? '已开启更新提醒' : '已关闭更新提醒'
              }
            },
            { slots: { leading: window.MyUI.create('Icon', { name: 'bell' }).element } }
          ).element,
          window.MyUI.create(
            'ListRow',
            {
              title: '后台自动同步',
              toggle: true,
              value: false,
              onChange: function (value) {
                switchNote.textContent = value ? '已开启自动同步' : '已关闭自动同步'
              }
            },
            { slots: { leading: window.MyUI.create('Icon', { name: 'cloud' }).element } }
          ).element
        ]
      }
    })

    window.MyUI.mount('[data-demo-segmented]', 'Segmented', {
      label: '列表密度',
      value: 'cozy',
      options: [
        { value: 'compact', label: '紧凑' },
        { value: 'cozy', label: '舒适' },
        { value: 'loose', label: '宽松' }
      ]
    })
    window.MyUI.mount('[data-demo-slider]', 'Slider', {
      label: '音量',
      value: 60,
      min: 0,
      max: 100,
      step: 5
    })

    window.MyUI.mount('[data-demo-choices]', 'Choices', {
      type: 'radio',
      label: '使用方案',
      value: 'studio',
      options: [
        { value: 'basic', label: '基础', description: '个人整理与收藏' },
        { value: 'studio', label: '工作室', description: '多人协作与共享' }
      ]
    })
    window.MyUI.mount('[data-demo-stepper]', 'Stepper', {
      label: '协作者',
      value: 2,
      min: 1,
      max: 8
    })

    window.MyUI.mount('[data-demo-radio]', 'RadioGroup', {
      label: '默认视图',
      value: 'grid',
      inline: true,
      options: [
        { value: 'grid', label: '网格' },
        { value: 'list', label: '列表' }
      ]
    })
    window.MyUI.mount('[data-demo-checkbox]', 'CheckboxGroup', {
      label: '订阅内容',
      value: ['灵感'],
      inline: true,
      options: [
        { value: '灵感', label: '灵感' },
        { value: '音乐', label: '音乐' },
        { value: '未开放', label: '未开放', disabled: true }
      ]
    })
    window.MyUI.mount('[data-demo-collapse]', 'Collapse', { label: '使用说明', value: 'motion' }, {
      slots: {
        default: [
          window.MyUI.create(
            'CollapseItem',
            { value: 'motion', title: '动效从哪里来' },
            { slots: { default: '过渡集中在组件内部，页面只需要决定展示与隐藏。' } }
          ).element,
          window.MyUI.create(
            'CollapseItem',
            { value: 'color', title: '配色如何选择' },
            { slots: { default: '浅色与暗色各有一套阴影和层级，切换主题即可对比。' } }
          ).element
        ]
      }
    })

    var comboboxNote = pick('[data-combobox-note]')
    window.MyUI.mount('[data-demo-combobox]', 'Combobox', {
      label: '协作者',
      value: 'lan',
      clearable: true,
      options: [
        { value: 'lan', label: '小蓝', description: '视觉设计' },
        { value: 'qing', label: '小青', description: '前端开发' },
        { value: 'alex', label: 'Alex Morgan', description: '产品经理' },
        { value: 'momo', label: '默默', description: '内容编辑' }
      ],
      onSelect: function (item) {
        comboboxNote.textContent = '已选择：' + item.label + ' · ' + (item.description || '')
      }
    })

    window.MyUI.mount('[data-demo-picker]', 'Picker', {
      label: '外观',
      value: 'light',
      columnLabels: ['外观'],
      options: [
        { value: 'light', label: '浅色' },
        { value: 'dark', label: '深色' },
        { value: 'system', label: '跟随系统' }
      ]
    })

    window.MyUI.mount('[data-demo-date]', 'DatePicker', {
      label: '日期',
      value: '2026-11-04',
      min: '2026-01-01',
      max: '2027-12-31'
    })
    window.MyUI.mount('[data-demo-time]', 'TimePicker', {
      label: '时间',
      value: '09:30',
      minuteStep: 15
    })

    window.MyUI.mount('[data-demo-upload]', 'Upload', {
      label: '封面图',
      value: [
        {
          id: 'cover',
          name: '旅行封面.svg',
          type: 'image/svg+xml',
          size: 24000,
          url: 'assets/images/lake.svg',
          status: 'success'
        }
      ],
      accept: 'image/*',
      multiple: true,
      maxCount: 3,
      hint: '支持 PNG / JPG，单张不超过 5MB'
    })
  }

  /** 03 内容容器：卡片、阴影、身份、图片、导航与列表。 */
  function buildSurfaces() {
    var cardGrid = pick('[data-demo-card]')
    var cardBody = document.createElement('div')
    cardBody.className = 'card-body'
    cardBody.innerHTML = '<strong>十二种组件</strong><p>在同一页里保持一致的间距与节奏。</p>'
    cardGrid.append(
      window.MyUI.create(
        'Card',
        { title: '我的工作空间', description: '整理内容，让层次保持清晰' },
        { slots: { default: cardBody } }
      ).element
    )
    var coverBody = document.createElement('div')
    coverBody.className = 'card-body'
    var cover = document.createElement('img')
    cover.className = 'card-cover'
    cover.src = 'assets/images/dunes.svg'
    cover.alt = '沙丘'
    var coverText = document.createElement('div')
    coverText.className = 'card-copy'
    coverText.innerHTML = '<strong>沙丘</strong><p>图片与文字共用同一张卡片。</p>'
    coverBody.append(cover, coverText)
    cardGrid.append(
      window.MyUI.create(
        'Card',
        {
          interactive: true,
          title: '打开沙丘这张卡片',
          description: '交互卡片保留按压反馈',
          onActivate: function () {
            pick('[data-card-note]').textContent = '卡片被激活：沙丘'
          }
        },
        { slots: { default: coverBody } }
      ).element
    )

    var shadowHost = pick('[data-demo-shadows]')
    ;[
      { name: '无阴影', usage: '嵌入内容、平铺列表', value: 'none', icon: 'grid' },
      {
        name: '轻浮起',
        usage: '小型工具栏、浮起控件',
        value: 'var(--small-shadow)',
        icon: 'sliders'
      },
      { name: '卡片', usage: '内容卡片、页面分组', value: 'var(--shadow)', icon: 'layer' },
      {
        name: '浮层',
        usage: '菜单、搜索选项、轻提示',
        value: 'var(--popup-shadow)',
        icon: 'message'
      },
      {
        name: '模态',
        usage: '对话框、抽屉、底部面板',
        value: 'var(--modal-shadow)',
        icon: 'copy'
      }
    ].forEach(function (level, index) {
      var figure = document.createElement('figure')
      figure.className = 'shadow-level'
      var stage = document.createElement('div')
      stage.className = 'shadow-stage'
      var sample = document.createElement('div')
      sample.className = 'shadow-sample'
      sample.style.boxShadow = level.value
      sample.append(window.MyUI.create('Icon', { name: level.icon }).element)
      var indexText = document.createElement('span')
      indexText.textContent = '0' + index
      sample.append(indexText)
      stage.append(sample)
      var caption = document.createElement('figcaption')
      var strong = document.createElement('strong')
      strong.textContent = level.name
      var usage = document.createElement('span')
      usage.textContent = level.usage
      var code = document.createElement('code')
      code.textContent = level.value
      caption.append(strong, usage, code)
      figure.append(stage, caption)
      shadowHost.append(figure)
    })

    var identityHost = pick('[data-demo-identity]')
    var profile = document.createElement('div')
    profile.className = 'profile-preview'
    var avatar = window.MyUI.create('Avatar', {
      src: 'assets/avatar-lan.svg',
      alt: '小蓝同学',
      size: 56
    })
    profile.append(
      window.MyUI.create(
        'Badge',
        { dot: true, label: '小蓝在线' },
        { attributes: { class: 'online-badge' }, slots: { default: avatar.element } }
      ).element
    )
    var profileCopy = document.createElement('div')
    profileCopy.className = 'profile-copy'
    profileCopy.innerHTML = '<strong>小蓝同学</strong><p>今天也有值得收藏的新发现</p>'
    profile.append(profileCopy)
    identityHost.append(profile)

    var avatarRow = document.createElement('div')
    avatarRow.className = 'avatar-row'
    ;[
      { props: { src: 'assets/avatar-lan.svg', alt: '小蓝同学' }, label: '图片' },
      { props: { text: '青', alt: '小青' }, label: '文字' },
      { props: { alt: 'Alex Morgan', shape: 'square' }, label: '方形' },
      { props: { size: 32, alt: '访客' }, label: '小尺寸' }
    ].forEach(function (item) {
      var cell = document.createElement('div')
      cell.className = 'avatar-cell'
      cell.append(window.MyUI.create('Avatar', item.props).element)
      var text = document.createElement('span')
      text.textContent = item.label
      cell.append(text)
      avatarRow.append(cell)
    })
    identityHost.append(avatarRow)

    var badgeRow = document.createElement('div')
    badgeRow.className = 'badge-row'
    var unread = 12
    var bellButton = window.MyUI.create(
      'Button',
      {
        variant: 'bare',
        icon: 'bell',
        onClick: function () {
          unread = 0
          bellBadge.update({ value: unread })
          pick('[data-card-note]').textContent = '通知已读完'
        }
      },
      { attributes: { 'aria-label': '查看通知' } }
    )
    var bellBadge = window.MyUI.create('Badge', { value: unread }, {
      slots: { default: bellButton.element }
    })
    var heartBadge = window.MyUI.create(
      'Badge',
      { dot: true },
      {
        slots: {
          default: window.MyUI.create('Button', { variant: 'bare', icon: 'heart' }, {
            attributes: { 'aria-label': '查看关注' }
          }).element
        }
      }
    )
    var textBadge = window.MyUI.create(
      'Badge',
      { value: '创作者' },
      { attributes: { class: 'creator-badge' } }
    )
    badgeRow.append(bellBadge.element, heartBadge.element, textBadge.element)
    identityHost.append(badgeRow)

    var imageHost = pick('[data-demo-image]')
    imageHost.append(
      window.MyUI.create('Image', {
        src: 'assets/images/lake.svg',
        alt: '湖面',
        ratio: 16 / 9,
        fit: 'cover'
      }).element,
      window.MyUI.create('Image', {
        src: 'assets/images/coast.svg',
        alt: '海岸线',
        ratio: 16 / 9,
        fit: 'cover'
      }).element
    )

    window.MyUI.mount(
      '[data-demo-appbar]',
      'AppBar',
      {
        title: '自在，从容。',
        subtitle: '清晰而自然的视觉秩序',
        back: true,
        backLabel: '返回',
        onBack: function () {
          pick('[data-navigation-note]').textContent = 'AppBar 只发送返回事件，跳转由页面决定'
        }
      },
      {
        slots: {
          actions: window.MyUI.create(
            'Button',
            { variant: 'bare', icon: 'sliders' },
            { attributes: { 'aria-label': '筛选' } }
          ).element
        }
      }
    )

    var navigationLabels = { home: '首页', discover: '发现', messages: '消息', profile: '我的' }
    window.MyUI.mount('[data-demo-navigation]', 'Navigation', {
      value: 'home',
      label: '主要页面',
      options: [
        { value: 'home', label: '首页', icon: 'home' },
        { value: 'discover', label: '发现', icon: 'grid' },
        { value: 'messages', label: '消息', icon: 'message' },
        { value: 'profile', label: '我的', icon: 'user' }
      ],
      onChange: function (value) {
        pick('[data-navigation-note]').textContent = '当前栏目：' + navigationLabels[value]
      }
    })

    window.MyUI.mount('[data-demo-list]', 'CellGroup', { title: '内容管理', label: '内容管理' }, {
      slots: {
        default: [
          window.MyUI.create(
            'ListRow',
            {
              title: '收藏夹',
              description: '最近收藏的十二条灵感',
              valueText: '12',
              onClick: function () {
                notify('打开收藏夹')
              }
            },
            { slots: { leading: window.MyUI.create('Icon', { name: 'inbox' }).element } }
          ).element,
          window.MyUI.create(
            'ListRow',
            {
              title: '接收提醒',
              description: '每天汇总一次',
              toggle: true,
              value: true,
              onChange: function (value) {
                notify(value ? '已开启提醒' : '已关闭提醒')
              }
            },
            { slots: { leading: window.MyUI.create('Icon', { name: 'bell' }).element } }
          ).element,
          window.MyUI.create(
            'ListRow',
            {
              title: '存储空间',
              description: '已使用 1.2 GB',
              valueText: '详情',
              onClick: function () {
                notify('打开存储设置')
              }
            },
            { slots: { leading: window.MyUI.create('Icon', { name: 'cloud' }).element } }
          ).element
        ]
      }
    })
  }

  /** 04 状态反馈：本地持久化、轻提示、弹层、菜单与手势。 */
  function buildFeedback() {
    var storageKey = 'myui:showcase-note'
    var storedNote = ''
    try {
      storedNote = localStorage.getItem(storageKey) || ''
    } catch (error) {
      storedNote = ''
    }
    var noteValue = storedNote || '记下这一刻的海风'
    var nativeNote = pick('[data-native-note]')
    window.MyUI.mount('[data-demo-native-nav]', 'Input', {
      label: '共享备注',
      value: noteValue,
      clearable: true,
      placeholder: '写一句留给下次的话',
      onChange: function (value) {
        noteValue = value
        nativeNote.textContent = '未保存的修改：' + (value || '（空）')
      }
    })
    var nativeActions = pick('[data-native-actions]')
    nativeActions.append(
      window.MyUI.create('Button', {
        label: '保存到本机',
        icon: 'check',
        onClick: function () {
          try {
            localStorage.setItem(storageKey, noteValue)
            nativeNote.textContent = '已保存：' + (noteValue || '（空）')
          } catch (error) {
            nativeNote.textContent = '当前环境不支持 localStorage'
          }
        }
      }).element,
      window.MyUI.create('Button', {
        label: '读取',
        variant: 'outline',
        onClick: function () {
          var saved = ''
          try {
            saved = localStorage.getItem(storageKey) || ''
          } catch (error) {
            saved = ''
          }
          nativeNote.textContent = saved ? '读取到：' + saved : '还没有保存过内容'
        }
      }).element
    )

    var feedbackHost = pick('[data-demo-feedback]')
    feedbackHost.append(
      window.MyUI.create('Button', {
        label: '轻提示',
        variant: 'outline',
        onClick: function () {
          notify('已保存到收藏夹')
        }
      }).element,
      window.MyUI.create('Button', {
        label: '确认对话框',
        onClick: function () {
          window.MyUI.popup
            .showAlert({
              title: '删除这条灵感？',
              message: '删除后无法恢复。',
              confirmText: '删除',
              cancelText: '取消',
              danger: true
            })
            .then(function (ok) {
              notify(ok ? '已删除' : '已取消')
            })
        }
      }).element,
      window.MyUI.create('Button', {
        label: '操作面板',
        variant: 'text',
        onClick: function () {
          var content = document.createElement('div')
          content.className = 'popup-body'
          var group = window.MyUI.create('CellGroup', { title: '分享到' }, {
            slots: {
              default: [
                window.MyUI.create('ListRow', {
                  title: '发给朋友',
                  description: '通过消息发送',
                  onClick: function () {
                    window.MyUI.popup.closeAll()
                    notify('已打开消息')
                  }
                }).element,
                window.MyUI.create('ListRow', {
                  title: '复制链接',
                  description: '链接 30 天内有效',
                  onClick: function () {
                    window.MyUI.popup.closeAll()
                    notify('链接已复制')
                  }
                }).element
              ]
            }
          })
          content.append(group.element)
          window.MyUI.popup.showSheet({
            title: '分享到',
            content: function () {
              return content
            }
          })
        }
      }).element
    )

    var primitiveHost = pick('[data-demo-primitives]')
    var tooltipButton = window.MyUI.create('Button', { label: '长按查看提示', variant: 'outline' })
    var tooltip = window.MyUI.create(
      'Tooltip',
      { content: '提示浮在触发器上方，可以用键盘触发。', placement: 'top', delay: 200 },
      { slots: { default: tooltipButton.element } }
    )
    var divider = window.MyUI.create('Divider', {}, { slots: { default: '进度分组' } })
    var lineProgress = window.MyUI.create('Progress', { value: 62, label: '上传进度' })
    var ringProgress = window.MyUI.create('Progress', {
      value: 76,
      type: 'circle',
      label: '完成度'
    })
    var ringWrap = document.createElement('div')
    ringWrap.className = 'ring-row'
    ringWrap.append(ringProgress.element, lineProgress.element)
    primitiveHost.append(tooltip.element, divider.element, ringWrap)

    window.MyUI.mount('[data-demo-notice]', 'Notice', {
      title: '已同步到云端',
      message: '所有设备都使用最新内容。',
      type: 'success',
      closable: true
    })
    window.MyUI.mount('[data-demo-steps]', 'Steps', {
      label: '上手步骤',
      value: 1,
      interactive: true,
      options: [
        { label: '选择方案', description: '确认组件范围' },
        { label: '搭建页面', description: '组合原生 HTML' },
        { label: '发布上线', description: '检查深浅色' }
      ]
    })

    var menuNote = pick('[data-menu-note]')
    var menuTrigger = window.MyUI.create('Button', {
      label: '浮层菜单',
      variant: 'outline',
      icon: 'chevrons-up-down'
    })
    var menu = window.MyUI.create(
      'Menu',
      {
        options: [
          { value: 'copy', label: '复制链接', icon: 'copy' },
          { value: 'save', label: '加入收藏', icon: 'heart' },
          { value: 'share', label: '分享内容', icon: 'share' },
          { value: 'delete', label: '删除', icon: 'trash', disabled: true }
        ],
        label: '内容操作',
        anchor: 'element',
        placement: 'bottom-end',
        onSelect: function (item) {
          menuNote.textContent = '已选择：' + item.label
        }
      },
      {
        slots: {
          default: function () {
            return menuTrigger.element
          }
        }
      }
    )
    pick('[data-demo-menu]').append(menu.element)

    var tabLabels = { today: '今天', week: '本周', later: '稍后' }
    var tabPanels = {}
    /** 每个栏目一份面板，避免切回来时重建节点。 */
    var buildTabPanel = function (value) {
      if (tabPanels[value]) return tabPanels[value]
      var panel = document.createElement('div')
      panel.className = 'touch-panel'
      var eyebrow = document.createElement('span')
      eyebrow.className = 'touch-eyebrow'
      eyebrow.textContent = tabLabels[value] || value
      var title = document.createElement('strong')
      title.textContent = '左右滑动切换栏目'
      var text = document.createElement('p')
      text.textContent = '每一栏都是独立的面板，滑动手势由 Tabs 自己处理。'
      panel.append(eyebrow, title, text)
      tabPanels[value] = panel
      return panel
    }
    window.MyUI.mount(
      '[data-demo-touch]',
      'Tabs',
      {
        value: 'today',
        label: '手势示例',
        options: [
          { value: 'today', label: '今天' },
          { value: 'week', label: '本周' },
          { value: 'later', label: '稍后' }
        ]
      },
      {
        slots: {
          default: function (context) {
            return buildTabPanel(context.value)
          }
        }
      }
    )

    var popupHost = pick('[data-demo-popup]')
    popupHost.append(
      window.MyUI.create('Button', {
        label: '右侧抽屉',
        variant: 'outline',
        onClick: function () {
          var content = document.createElement('div')
          content.className = 'popup-body'
          content.innerHTML =
            '<p>抽屉支持左右滑动关闭，内容区可以放任意组件。</p><ul class="drawer-list">' +
            '<li>清晰的层级</li><li>自然的留白</li><li>克制的色彩</li></ul>'
          window.MyUI.popup.showDrawer({
            title: '示例抽屉',
            placement: 'right',
            content: function () {
              return content
            }
          })
        }
      }).element,
      window.MyUI.create('Button', {
        label: '底部确认',
        onClick: function () {
          window.MyUI.popup.showSheet({
            title: '保存这次设置？',
            message: '设置会应用到当前设备。',
            confirmText: '完成',
            cancelText: '关闭',
            onConfirm: function () {
              pick('[data-popup-note]').textContent = '底部面板已确认'
            }
          })
        }
      }).element
    )
  }

  /** 05 完整示例：表单场景、加载状态与原生页面说明。 */
  function buildScenarios() {
    var sceneName = ''
    var scenePlan = 'studio'
    var sceneSwitch = true
    var scenarioStatus = pick('[data-scenario-status]')
    window.MyUI.mount('[data-scenario-name]', 'Input', {
      label: '昵称',
      value: '',
      required: true,
      clearable: true,
      maxlength: 24,
      placeholder: '怎么称呼你',
      onChange: function (value) {
        sceneName = value
        scenarioStatus.textContent = '正在填写：' + (value || '（空）')
      }
    })
    window.MyUI.mount('[data-scenario-intro]', 'Textarea', {
      label: '一句话介绍',
      value: '喜欢安静的海边和清晰的界面。',
      rows: 3,
      maxlength: 60
    })
    window.MyUI.mount('[data-scenario-plan]', 'RadioGroup', {
      label: '使用方案',
      value: 'studio',
      options: [
        { value: 'basic', label: '基础', description: '个人整理与收藏' },
        { value: 'studio', label: '工作室', description: '多人协作与共享' }
      ],
      onChange: function (value) {
        scenePlan = value
      }
    })
    window.MyUI.mount('[data-scenario-switch]', 'Switch', {
      label: '接收更新提醒',
      value: true,
      onChange: function (value) {
        sceneSwitch = value
      }
    })
    var scenarioActions = pick('[data-scenario-actions]')
    scenarioActions.append(
      window.MyUI.create('Button', {
        label: '提交',
        onClick: function () {
          if (!String(sceneName).trim()) {
            scenarioStatus.textContent = '请先填写昵称'
            notify('请先填写昵称')
            return
          }
          scenarioStatus.textContent =
            '已提交：' + sceneName + ' / ' + scenePlan + (sceneSwitch ? ' / 开启提醒' : '')
          notify('已提交表单')
        }
      }).element,
      window.MyUI.create('Button', {
        label: '重置',
        variant: 'text',
        onClick: function () {
          sceneName = ''
          scenarioStatus.textContent = '已重置：填写昵称，选择方案后提交。'
        }
      }).element
    )

    var stateHost = pick('[data-demo-states]')
    var skeleton = window.MyUI.create('Skeleton', { loading: true, rows: 3, avatar: true })
    var loaded = document.createElement('div')
    loaded.className = 'card-body'
    loaded.innerHTML = '<strong>已经准备好</strong><p>内容加载完成后替换骨架屏。</p>'
    loaded.hidden = true
    var stateToggle = window.MyUI.create('Button', {
      label: '重新加载',
      variant: 'text',
      onClick: function () {
        skeleton.update({ loading: true })
        loaded.hidden = true
        setTimeout(function () {
          skeleton.update({ loading: false })
          loaded.hidden = false
        }, 900)
      }
    })
    var emptyState = window.MyUI.create('Empty', {
      state: 'error',
      title: '暂时没有内容',
      description: '连接失败时给出可恢复的下一步。'
    })
    stateHost.append(skeleton.element, loaded, stateToggle.element, emptyState.element)

    // 单页站点没有独立文档页，这里改成纯说明卡片：本页本身就是原生 HTML 示例。
    var nativeHost = pick('[data-demo-native-html]')
    ;[
      { title: 'Button 按钮', text: '三种层级、图标按钮与禁用态' },
      { title: 'Input / Combobox 输入选择', text: '前置图标、清空与搜索选择' },
      { title: 'Tabbar / Navigation 栏目切换', text: '底部栏目与顶部导航的选中态' }
    ].forEach(function (item) {
      var card = document.createElement('div')
      card.className = 'scene-link'
      var strong = document.createElement('strong')
      strong.textContent = item.title
      var span = document.createElement('span')
      span.textContent = item.text
      card.append(strong, span)
      nativeHost.append(card)
    })
    var hint = document.createElement('p')
    hint.className = 'showcase-note'
    hint.textContent = '你正在看的这一页同样只用 HTML + 原生 JS，没有 Vue，也没有构建步骤。'
    nativeHost.append(hint)
  }

  // ── 启动 ──
  function start() {
    mountAppBar()
    mountThemeToggle()
    mountScrollBehaviour()
    buildHeroArt()
    buildActions()
    buildControls()
    buildSurfaces()
    buildFeedback()
    buildScenarios()
    // 静态声明式组件（data-my）统一初始化，与命令式装配互不影响。
    window.MyUI.init(document.body)
    scheduleHeader()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }

  // 系统外观变化时若处于 system 模式，重新应用。
  if (media && media.addEventListener) {
    media.addEventListener('change', function () {
      if (themeState.mode !== 'system') return
      stopTheme = THEME.applyTheme(themeState)
    })
  }
})()
