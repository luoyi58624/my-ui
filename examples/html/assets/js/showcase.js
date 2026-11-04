/*
 * 「完整交互示例」长页的页面脚本（本页自用，不依赖 shell.js）。
 *
 * 职责：
 *   1. 明暗切换与 Toast 入口
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

  /** 创建一个图标元素（不挂到宿主上）。 */
  function iconEl(name) {
    return window.MyUI.create('Icon', { name: name }).element
  }

  /** 创建元素，可选设置 class。 */
  function el(tag, className) {
    var node = document.createElement(tag)
    if (className) node.className = className
    return node
  }

  /** 创建静态文本节点。 */
  function textNode(text) {
    return document.createTextNode(text)
  }

  /** 取某个示例卡片里预埋的内容宿主（data-demo 与 Vue DemoExample 的 name 一一对应）。 */
  function demo(name) {
    return document.querySelector('[data-demo="' + name + '"]')
  }

  /** 创建一个按钮元素。 */
  function buttonEl(label, properties) {
    return window.MyUI.create(
      'Button',
      Object.assign({ label: label }, properties || {})
    ).element
  }

  // ── 外壳 ──
  /** masthead 右侧的明暗切换按钮。 */
  function mountThemeToggle() {
    var button = document.getElementById('showcase-theme')
    var glyph = window.MyUI.create('Icon', { name: 'moon' })
    button.append(glyph.element)
    function sync() {
      var dark = resolvedTheme().mode === 'dark'
      glyph.update({ name: dark ? 'sun' : 'moon' })
      button.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到暗黑模式')
    }
    button.addEventListener('click', function () {
      if (setThemeMode(resolvedTheme().mode === 'dark' ? 'light' : 'dark')) sync()
    })
    media?.addEventListener('change', sync)
    sync()
  }

  // ── 滚动交互 ──
  var layout = null
  var masthead = null
  var chapterMenu = null
  var chapterLabel = null
  var links = []
  var frame = 0

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  /** 当分区标题靠近固定导航时更新章节高亮。 */
  function syncHeader() {
    if (!layout || !masthead) return
    masthead.classList.toggle('scrolled', layout.scrollTop > 24)
    var threshold = masthead.getBoundingClientRect().bottom + 48
    var current = ''
    for (var i = 0; i < SECTIONS.length; i += 1) {
      var section = document.getElementById('showcase-' + SECTIONS[i])
      if (!section) continue
      if (section.getBoundingClientRect().top <= threshold) {
        current = SECTIONS[i]
      }
    }
    var activeLink = links.find(function (link) { return link.dataset.section === current })
    var label = activeLink ? activeLink.textContent : '章节目录'
    if (chapterLabel.textContent !== label) chapterLabel.textContent = label
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
  function scrollToSection(id, behavior) {
    if (!layout || !masthead) return
    var target = id === 'top' ? null : document.getElementById('showcase-' + id)
    if (id !== 'top' && !target) return
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
      behavior: prefersReducedMotion() ? 'instant' : behavior || 'smooth'
    })
  }

  function mountScrollBehaviour() {
    layout = document.getElementById('showcase-layout')
    masthead = document.querySelector('.masthead')
    if (!layout || !masthead) return
    chapterMenu = masthead.querySelector('.chapter-menu')
    chapterLabel = chapterMenu.querySelector('[data-current-chapter]')
    links = Array.from(masthead.querySelectorAll('[data-section]'))

    function closeChapterMenu(restoreFocus) {
      if (!chapterMenu.open) return
      chapterMenu.open = false
      if (restoreFocus) chapterMenu.querySelector('summary').focus({ preventScroll: true })
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault()
        closeChapterMenu(true)
        scrollToSection(link.dataset.section)
      })
    })
    chapterMenu.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !chapterMenu.open) return
      event.stopPropagation()
      closeChapterMenu(true)
    })
    layout.addEventListener('click', function (event) {
      if (!chapterMenu.contains(event.target)) closeChapterMenu(false)
      var link = event.target.closest('[data-jump]')
      if (!link) return
      event.preventDefault()
      scrollToSection(link.dataset.jump)
    })

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

  /** 01 基础组件：按 Vue pages/home/{button,tag} 的示例逐块还原。 */
  function buildActions() {
    buildButtonExamples()
    buildTagExamples()
  }

  /** 一次性读写的本地标记，和 Vue 版共用同一批 localStorage 键。 */
  function readSaved(key) {
    try {
      return (
        (localStorage.getItem('my-ui:' + key) ?? localStorage.getItem('chenglan:' + key)) === 'true'
      )
    } catch (error) {
      return false
    }
  }

  function saveFlag(key, value) {
    try {
      localStorage.setItem('my-ui:' + key, String(value))
    } catch (error) {
      /* 存储不可用时仍保留本页交互。 */
    }
  }

  /** 把 Menu 的 trigger 绑定贴到自定义触发按钮上（对应 Vue 的 v-bind="trigger"）。 */
  function applyMenuTrigger(element, trigger) {
    var events = { onClick: 'click', onPointerdown: 'pointerdown', onContextmenu: 'contextmenu' }
    Object.keys(trigger).forEach(function (key) {
      var value = trigger[key]
      if (value === undefined || value === null) return
      if (events[key]) element.addEventListener(events[key], value)
      else element.setAttribute(key, value === true ? '' : String(value))
    })
  }

  /** 分享面板：CellGroup + item 插槽里的 ListRow（对照 SharePanel.vue）。 */
  function sharePanel(actions, close) {
    var group = window.MyUI.create(
      'CellGroup',
      {
        label: '分享操作',
        options: actions,
        onSelect: function (item) {
          close(item)
        }
      },
      {
        slots: {
          item: function (context) {
            var row = window.MyUI.create(
              'ListRow',
              {
                title: context.item.label,
                disabled: context.row.disabled,
                onClick: context.row.onClick
              },
              { slots: context.item.icon ? { leading: iconEl(context.item.icon) } : {} }
            )
            var element = row.element
            if (context.row.onKeydown) element.addEventListener('keydown', context.row.onKeydown)
            if (context.row.role) element.setAttribute('role', context.row.role)
            if (context.row.tabindex !== undefined)
              element.setAttribute('tabindex', String(context.row.tabindex))
            element.setAttribute(
              'data-cell-value',
              String(context.row['data-cell-value'] ?? context.item.value)
            )
            return element
          }
        }
      }
    )
    // 与 SharePanel.vue 的 .share-panel 一致：只调整列表边框与圆角变量。
    group.element.classList.add('share-panel')
    return group.element
  }

  /** pages/home/button：基础用法、图标按钮、图标与禁用状态。 */
  function buildButtonExamples() {
    var basic = demo('button-basic')
    basic.append(
      buttonEl('主要按钮', {
        onClick: function () {
          notify('主要操作已执行')
        }
      }),
      buttonEl('镂空按钮', {
        variant: 'outline',
        onClick: function () {
          notify('镂空按钮已点击')
        }
      }),
      window.MyUI.create(
        'Button',
        {
          variant: 'text',
          onClick: function () {
            notify('已打开详情')
          }
        },
        { slots: { default: [textNode('文本按钮'), iconEl('chevron-right')] } }
      ).element
    )

    // 图标按钮：收藏（本地保存）、分享（底部面板）、添加，以及更多操作菜单。
    var liked = readSaved('liked')
    var laterSaved = readSaved('later')
    var likeButton = window.MyUI.create(
      'Button',
      {
        variant: 'icon',
        icon: 'heart',
        selected: liked,
        onClick: function () {
          liked = !liked
          saveFlag('liked', liked)
          likeButton.update({ selected: liked })
          likeButton.element.style.color = liked ? 'var(--danger)' : ''
          notify(liked ? '已加入收藏' : '已取消收藏')
        }
      },
      { attributes: { 'aria-label': '收藏' } }
    )
    if (liked) likeButton.element.style.color = 'var(--danger)'

    var shareActions = [
      { value: 'copy', label: '复制链接', icon: 'copy' },
      { value: 'favorite', label: '收藏到本地', icon: 'heart' },
      { value: 'later', label: '稍后查看', icon: 'clock' }
    ]
    var selectAction = function (action) {
      if (action.value === 'copy') {
        if (!navigator.clipboard?.writeText) {
          notify('浏览器未允许复制，请从地址栏复制链接')
          return
        }
        navigator.clipboard.writeText(window.location.href).then(
          function () {
            notify('链接已复制')
          },
          function () {
            notify('浏览器未允许复制，请从地址栏复制链接')
          }
        )
      } else if (action.value === 'favorite') {
        liked = true
        saveFlag('liked', true)
        likeButton.update({ selected: true })
        likeButton.element.style.color = 'var(--danger)'
        notify('已收藏到本地')
      } else {
        laterSaved = true
        saveFlag('later', true)
        notify('已加入稍后查看')
      }
    }
    var openShare = function () {
      var panel = window.MyUI.popup.showSheet({
        title: '分享这份灵感',
        content: function (context) {
          return sharePanel(shareActions, function (action) {
            context.close(action)
          })
        }
      })
      panel.closed.then(function (action) {
        if (action) selectAction(action)
      })
    }

    var shareButton = window.MyUI.create(
      'Button',
      { variant: 'icon', icon: 'share', onClick: openShare },
      { attributes: { 'aria-label': '分享' } }
    )
    var addButton = window.MyUI.create(
      'Button',
      {
        variant: 'icon',
        icon: 'add',
        onClick: function () {
          notify('已添加新项目（原型示例）')
        }
      },
      { attributes: { 'aria-label': '添加' } }
    )
    var moreButton = window.MyUI.create(
      'Button',
      { variant: 'bare', icon: 'grid' },
      { attributes: { 'aria-label': '更多' } }
    )
    var moreMenu = window.MyUI.create(
      'Menu',
      { options: shareActions, label: '更多操作', onSelect: selectAction },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(moreButton.element, context.trigger)
            return moreButton.element
          }
        }
      }
    )
    demo('button-icons').append(
      likeButton.element,
      shareButton.element,
      addButton.element,
      moreMenu.element
    )

    var states = demo('button-states')
    states.append(
      window.MyUI.create('Button', {
        label: '带图标按钮',
        icon: 'check',
        onClick: function () {
          notify('已保存')
        }
      }).element,
      window.MyUI.create('Button', { label: '禁用按钮', disabled: true }).element
    )
  }

  /** pages/home/tag：状态标签、单选组、多选组、独立选择标签。 */
  function buildTagExamples() {
    ;[
      { text: '推荐' },
      { text: '已完成', tone: 'green' },
      { text: '处理中', tone: 'orange' },
      { text: '需留意', tone: 'red' },
      { text: '草稿', tone: 'gray' }
    ].forEach(function (item) {
      demo('tag-tones').append(
        window.MyUI.create('Tag', { tone: item.tone }, { slots: { default: item.text } }).element
      )
    })

    var directions = [
      { value: '灵感', label: '灵感' },
      { value: '云端', label: '云端' },
      { value: '发现', label: '发现' },
      { value: '音乐', label: '音乐' }
    ]
    var singleNote = pick('[data-tag-single-note]')
    window.MyUI.mount(demo('tag-single'), 'TagGroup', {
      label: '探索方向',
      value: '灵感',
      options: directions,
      onChange: function (value) {
        singleNote.textContent = '当前偏好：' + value
      }
    })

    var multiNote = pick('[data-tag-multiple-note]')
    var multiValue = ['灵感']
    window.MyUI.mount(demo('tag-multiple'), 'TagGroup', {
      label: '多选方向',
      value: multiValue,
      options: directions.concat([{ value: '未开放', label: '未开放', disabled: true }]),
      onChange: function (value) {
        multiValue = value
        multiNote.textContent = '已选：' + (value.join('、') || '暂无')
      }
    })

    var toggleNote = pick('[data-tag-toggle-note]')
    var later = window.MyUI.create(
      'Tag',
      {
        value: false,
        onChange: function (selected) {
          toggleNote.textContent = selected ? '已加入稍后阅读' : '未选择稍后阅读'
        }
      },
      { slots: { default: '稍后阅读' } }
    )
    var locked = window.MyUI.create(
      'Tag',
      { value: false, disabled: true },
      { slots: { default: '暂不可选' } }
    )
    demo('tag-toggle').append(later.element, locked.element)
  }

  /*
   * 02 交互控制：严格按 Vue pages/home/{input,switch,slider,selection,
   * selection-collapse,combobox,picker,date-time-picker,upload} 里每个
   * <DemoExample> 插槽的内容还原。一个示例 = 一张已经写在 HTML 里的 .my-card，
   * 这里只负责往 data-demo 宿主里装配控件，保证文案与数量跟 Vue 一致。
   */
  function buildControls() {
    buildInputExamples()
    buildSwitchExample()
    buildSliderExamples()
    buildSelectionExamples()
    buildSelectionCollapseExamples()
    buildComboboxExamples()
    buildPickerExamples()
    buildDateTimeExamples()
    buildUploadExamples()
  }

  /** pages/home/input：搜索输入、辅助信息、下拉选择。 */
  function buildInputExamples() {
    window.MyUI.mount(demo('input-search'), 'Input', {
      label: '搜索',
      value: '',
      icon: 'search',
      clearable: true,
      placeholder: '寻找你感兴趣的内容…'
    })

    var nickname = '小蓝同学'
    var hintCopy = el('span')
    hintCopy.textContent = '为自己取个喜欢的名字'
    var hintState = el('span')
    var hintCheck = iconEl('check')
    var paintHint = function () {
      var filled = nickname.trim().length > 0
      hintState.classList.toggle('valid', filled)
      hintState.replaceChildren()
      if (filled) hintState.append(hintCheck)
      hintState.append(textNode(filled ? '已填写' : '待填写'))
    }
    paintHint()
    // hint 用属性传节点：内层 FormField 每次重绘都会重写 hint 容器，
    // 而 content() 对同一批节点是幂等的，插槽缓存反而会被这次重写清空。
    window.MyUI.mount(demo('input-hint'), 'Input', {
      label: '昵称',
      value: nickname,
      maxlength: 24,
      hint: [hintCopy, hintState],
      onChange: function (value) {
        nickname = value
        paintHint()
      }
    })

    var categoryState = el('span')
    var categoryNote = el('span')
    categoryNote.textContent = '下拉展开简洁柔和'
    var paintCategory = function (value) {
      categoryState.textContent = '已选择：' + value
    }
    paintCategory('视觉灵感')
    window.MyUI.mount(
      demo('select'),
      'Select',
      {
        label: '内容分类',
        value: '视觉灵感',
        options: ['视觉灵感', '效率优先', '轻度探索'].map(function (value) {
          return { value: value, label: value }
        }),
        onChange: paintCategory
      },
      { slots: { hint: [categoryState, categoryNote] } }
    )
  }

  /** pages/home/switch：三行 ListRow 开关 + 底部实时统计条。 */
  function buildSwitchExample() {
    var preferences = [
      { title: '消息提醒', description: '重要通知，及时送达', icon: 'bell', on: true },
      { title: '静音模式', description: '享受一段安静时光', icon: 'moon', on: false },
      { title: '隐私保护', description: '为每一份安心加分', icon: 'shield', on: true }
    ]
    var count = pick('[data-switch-count]')
    var paintCount = function () {
      var enabled = preferences.filter(function (item) {
        return item.on
      }).length
      count.textContent = enabled + ' 项开启'
    }
    preferences.forEach(function (item, index) {
      var row = window.MyUI.create(
        'ListRow',
        {
          title: item.title,
          description: item.description,
          toggle: true,
          value: item.on,
          onChange: function (value) {
            preferences[index].on = value
            paintCount()
          }
        },
        { slots: { leading: iconEl(item.icon) } }
      )
      demo('switches').append(row.element)
    })
    paintCount()
  }

  /** pages/home/slider：分段选择（含说明卡）、基础滑块、自定义滑块。 */
  function buildSliderExamples() {
    var modes = [
      { value: 'comfort', label: '舒适', description: '让每一次浏览都更轻松', icon: 'spark' },
      { value: 'balance', label: '均衡', description: '美感与效率，刚刚好', icon: 'sliders' },
      { value: 'focus', label: '专注', description: '聚焦眼前的重要内容', icon: 'briefcase' }
    ]
    var activeMode = modes[0]
    var modeSymbol = pick('[data-mode-symbol]')
    var modeIcon = window.MyUI.create('Icon', { name: activeMode.icon })
    var modeTitle = pick('[data-mode-title]')
    var modeDescription = pick('[data-mode-description]')
    var paintMode = function () {
      modeIcon.update({ name: activeMode.icon })
      modeSymbol.replaceChildren(modeIcon.element)
      modeTitle.textContent = activeMode.label + '模式'
      modeDescription.textContent = activeMode.description
    }
    paintMode()
    window.MyUI.mount(demo('segmented'), 'Segmented', {
      label: '浏览方式',
      value: 'comfort',
      options: modes,
      onChange: function (value) {
        activeMode =
          modes.filter(function (item) {
            return item.value === value
          })[0] || modes[0]
        paintMode()
      }
    })

    window.MyUI.mount(demo('slider'), 'Slider', {
      label: '显示强度',
      value: 68
    })

    window.MyUI.mount(demo('custom-slider'), 'Slider', {
      label: '自定义滑块',
      value: 36,
      unit: '%'
    }).element.classList.add('custom-slider')
  }

  /** pages/home/selection：单选、复选与步进器。 */
  function buildSelectionExamples() {
    window.MyUI.mount(demo('choices-radio'), 'Choices', {
      label: '单选',
      type: 'radio',
      value: 'standard',
      options: [
        { value: 'standard', label: '标准体验' },
        { value: 'advanced', label: '进阶体验' },
        { value: 'professional', label: '专业体验' }
      ]
    })
    window.MyUI.mount(demo('choices-checkbox'), 'Choices', {
      label: '复选',
      type: 'checkbox',
      value: ['cloud'],
      options: [
        { value: 'cloud', label: '云端同步' },
        { value: 'updates', label: '自动更新' },
        { value: 'notifications', label: '消息提醒' }
      ]
    })
    window.MyUI.mount(demo('stepper'), 'Stepper', {
      label: '数量',
      value: 1
    })
  }

  /** pages/home/selection-collapse：独立单选/复选、单选组、复选组与半选、折叠面板。 */
  function buildSelectionCollapseExamples() {
    // 独立单选框：同组共用 name，三个 Radio 共享同一个当前值。
    var delivery = 'door'
    var deliveryNote = pick('[data-radio-note]')
    var radios = []
    var paintDelivery = function () {
      deliveryNote.textContent = '当前选择：' + (delivery === 'door' ? '送货上门' : '到店自取')
      radios.forEach(function (radio) {
        radio.control.update({ value: delivery })
      })
    }
    ;[
      { value: 'door', label: '送货上门' },
      { value: 'pickup', label: '到店自取' },
      { value: 'express', label: '加急配送', disabled: true }
    ].forEach(function (item) {
      var control = window.MyUI.create(
        'Radio',
        {
          name: 'delivery',
          value: delivery,
          optionValue: item.value,
          disabled: item.disabled,
          onChange: function (value) {
            delivery = value
            paintDelivery()
          }
        },
        { slots: { default: item.label } }
      )
      radios.push({ item: item, control: control })
      demo('radio').append(control.element)
    })
    paintDelivery()

    // 独立复选框：每个都是独立布尔值。
    var autosave = true
    var notifications = false
    demo('checkbox').append(
      window.MyUI.create(
        'Checkbox',
        {
          value: autosave,
          description: '编辑内容会在本页保留',
          onChange: function (value) {
            autosave = value
          }
        },
        { slots: { default: '自动保存草稿' } }
      ).element,
      window.MyUI.create(
        'Checkbox',
        {
          value: notifications,
          onChange: function (value) {
            notifications = value
          }
        },
        { slots: { default: '接收内容更新' } }
      ).element,
      window.MyUI.create('Checkbox', { disabled: true, value: false }, {
        slots: { default: '订阅专属提醒' }
      }).element
    )

    // 单选组。
    window.MyUI.mount(demo('radio-group'), 'RadioGroup', {
      label: '内容布局',
      value: 'comfortable',
      inline: true,
      options: [
        { value: 'compact', label: '紧凑' },
        { value: 'comfortable', label: '舒适' },
        { value: 'wide', label: '宽松' }
      ]
    })

    // 复选组与半选：全选控件跟随组内选择呈现全选 / 半选 / 未选。
    var sync = ['documents', 'images']
    var syncNote = pick('[data-checkbox-group-note]')
    var syncOptions = [
      { value: 'documents', label: '文档' },
      { value: 'images', label: '图片' },
      { value: 'favorites', label: '收藏' },
      { value: 'archive', label: '归档', disabled: true }
    ]
    var enabledOptions = syncOptions.filter(function (item) {
      return !item.disabled
    })
    var selectAllBox = window.MyUI.create(
      'Checkbox',
      {
        value: true,
        indeterminate: false,
        onChange: function (value) {
          sync = value
            ? enabledOptions.map(function (item) {
                return item.value
              })
            : []
          syncGroup.update({ value: sync })
          paintSync()
        }
      },
      { slots: { default: '全选可同步内容' } }
    )
    var syncGroup = window.MyUI.create('CheckboxGroup', {
      label: '同步内容',
      value: sync,
      inline: true,
      options: syncOptions,
      onChange: function (value) {
        sync = value
        paintSync()
      }
    })
    var paintSync = function () {
      var all = enabledOptions.every(function (item) {
        return sync.indexOf(item.value) >= 0
      })
      var partial = !all && sync.length > 0
      selectAllBox.update({ value: all, indeterminate: partial })
      syncNote.textContent =
        '已选 ' +
        sync.length +
        ' 项 · ' +
        (partial ? '半选状态' : all ? '已全选' : '尚未选择')
    }
    paintSync()
    demo('checkbox-group').append(selectAllBox.element, syncGroup.element)

    // 折叠面板：左侧数组值多项展开，右侧字符串值手风琴。
    var note = '周末整理灵感'
    var backgroundSync = true
    var noteInput = window.MyUI.create('Input', {
      label: '收集备注',
      value: note,
      placeholder: '写下下一步计划',
      onChange: function (value) {
        note = value
      }
    })
    var syncCheckbox = window.MyUI.create(
      'Checkbox',
      {
        value: backgroundSync,
        description: '离开当前页面前，请确认内容已经保存',
        onChange: function (value) {
          backgroundSync = value
        }
      },
      { slots: { default: '允许后台同步' } }
    )
    var textParagraph = function (text) {
      var paragraph = el('p')
      paragraph.textContent = text
      return paragraph
    }
    var workspaceCollapse = window.MyUI.create(
      'Collapse',
      { label: '灵感工作区', value: ['collection'] },
      {
        slots: {
          default: [
            window.MyUI.create(
              'CollapseItem',
              { value: 'collection', title: '灵感收集' },
              {
                slots: {
                  default: [
                    textParagraph('随手记录值得保留的想法，收起后仍会保留填写的内容。'),
                    noteInput.element
                  ]
                }
              }
            ).element,
            window.MyUI.create(
              'CollapseItem',
              { value: 'sync', title: '同步偏好' },
              {
                slots: {
                  default: [syncCheckbox.element]
                }
              }
            ).element,
            window.MyUI.create(
              'CollapseItem',
              { value: 'archive', title: '归档策略 · 暂未开放', disabled: true },
              {
                slots: {
                  default: [textParagraph('稍后开放更多归档方式。')]
                }
              }
            ).element
          ]
        }
      }
    )
    var guideCollapse = window.MyUI.create(
      'Collapse',
      { label: '使用说明', value: 'privacy' },
      {
        slots: {
          default: [
            window.MyUI.create(
              'CollapseItem',
              { value: 'privacy', title: '隐私与内容安全' },
              {
                slots: {
                  default: [
                    textParagraph(
                      '示例数据只在当前页面内保存。你可以自由尝试各项控件，重载后恢复初始内容。'
                    )
                  ]
                }
              }
            ).element,
            window.MyUI.create(
              'CollapseItem',
              { value: 'keyboard', title: '键盘操作' },
              {
                slots: {
                  default: [
                    textParagraph(
                      'Tab 按顺序进入标题与已展开的内容；Enter、空格切换展开状态。上下方向键切换标题，Home、End 跳到首尾。'
                    )
                  ]
                }
              }
            ).element,
            window.MyUI.create(
              'CollapseItem',
              { value: 'custom' },
              {
                slots: {
                  // 标题插槽：面板状态跟随展开与否。
                  title: function (context) {
                    var wrap = el('span', 'custom-title')
                    var label = el('span')
                    label.textContent = '查看面板状态'
                    var state = el('span')
                    state.textContent = context.open ? '已展开' : '已收起'
                    wrap.append(label, state)
                    return wrap
                  },
                  default: [
                    textParagraph('标题插槽可以补充状态，面板的布局与焦点行为保持统一。')
                  ]
                }
              }
            ).element
          ]
        }
      }
    )
    demo('collapse').append(workspaceCollapse.element)
    demo('collapse-guide').append(guideCollapse.element)
    demo('collapse-reset').append(
      buttonEl('重置折叠示例', {
        variant: 'text',
        onClick: function () {
          note = '周末整理灵感'
          backgroundSync = true
          noteInput.update({ value: note })
          syncCheckbox.update({ value: backgroundSync })
          workspaceCollapse.update({ value: ['collection'] })
          guideCollapse.update({ value: 'privacy' })
        }
      })
    )
  }

  /** pages/home/combobox：本地搜索、自定义选项、异步搜索 + 底部已选状态条。 */
  function buildComboboxExamples() {
    var cities = [
      { value: 'hangzhou', label: '杭州', description: '西湖与山间，城市与自然' },
      { value: 'shanghai', label: '上海', description: '沿着街角，发现新的灵感' },
      { value: 'chengdu', label: '成都', description: '慢一点，享受日常的松弛' },
      { value: 'shenzhen', label: '深圳', description: '在海边，遇见新的可能' },
      { value: 'xiamen', label: '厦门', description: '海风里的一段悠闲时光' },
      { value: 'beijing', label: '北京', description: '暂不可选择', disabled: true }
    ]
    var summary = pick('[data-combobox-summary]')
    var city = 'hangzhou'
    var member = 'lan'
    var remote = ''
    var cityControl = window.MyUI.mount(demo('combobox-basic'), 'Combobox', {
      label: '目的地',
      value: city,
      options: cities,
      clearable: true,
      hint: '可搜索中文名称或城市英文名',
      onChange: function (value) {
        city = value
        paintSummary()
      }
    })
    demo('combobox-basic').append(
      window.MyUI.create('Combobox', {
        label: '已停用的选择',
        value: 'hangzhou',
        options: cities,
        disabled: true
      }).element
    )
    var paintSummary = function () {
      var hit = cities.filter(function (option) {
        return option.value === city
      })[0]
      summary.textContent = '已选目的地：' + (hit ? hit.label : '未选择')
    }
    paintSummary()

    // 自定义选项：option-leading 插槽补头像与在线状态。
    var members = [
      { value: 'lan', label: '小蓝同学', description: '产品设计 · 在线' },
      { value: 'qing', label: '小青', description: '前端开发 · 在线' },
      { value: 'yun', label: '云间', description: '内容编辑 · 暂离' }
    ]
    window.MyUI.mount(
      demo('combobox-option'),
      'Combobox',
      {
        label: '协作成员',
        value: member,
        options: members,
        clearable: true,
        onChange: function (value) {
          member = value
        }
      },
      {
        slots: {
          'option-leading': function (context) {
            var badge = window.MyUI.create(
              'Badge',
              {
                dot: true,
                hidden: context.option.value === 'yun',
                label: context.option.label + '在线'
              },
              {
                slots: {
                  default: window.MyUI.create('Avatar', {
                    text: context.option.label.slice(0, 1),
                    alt: context.option.label,
                    size: 30
                  }).element
                }
              }
            )
            badge.element.classList.add('member-status')
            badge.element.setAttribute('aria-hidden', 'true')
            return badge.element
          }
        }
      }
    )

    // 异步搜索：关闭本地 filter，550ms 后回填结果。
    var catalog = [
      { value: 'design', label: 'my-ui 设计系统', description: '组件、交互与视觉规范' },
      { value: 'notes', label: '日常灵感笔记', description: '把值得留下的瞬间收好' },
      { value: 'travel', label: '周末旅行计划', description: '安排下一次轻松的出发' }
    ]
    var projects = []
    var timer = 0
    var remoteControl = window.MyUI.mount(demo('combobox-remote'), 'Combobox', {
      label: '查找项目',
      value: remote,
      options: projects,
      filter: false,
      loading: false,
      clearable: true,
      placeholder: '输入项目关键词…',
      hint: '模拟异步搜索，等待结束后展示匹配结果',
      onChange: function (value) {
        remote = value
      },
      onSearch: function (query) {
        clearTimeout(timer)
        remoteControl.update({ loading: true })
        timer = setTimeout(function () {
          projects = catalog.filter(function (option) {
            return (option.label + option.description).includes(String(query).trim())
          })
          remoteControl.update({ options: projects, loading: false })
        }, 550)
      }
    })

    pick('[data-combobox-reset]').append(
      buttonEl('重置选择', {
        variant: 'text',
        onClick: function () {
          city = 'hangzhou'
          member = 'lan'
          remote = ''
          cityControl.update({ value: city })
          remoteControl.update({ value: remote })
          paintSummary()
        }
      })
    )
  }

  /** pages/home/picker：单列、独立多列、级联与底部面板。 */
  function buildPickerExamples() {
    var drinks = [
      { value: 'water', label: '矿泉水' },
      { value: 'tea', label: '茉莉花茶' },
      { value: 'latte', label: '燕麦拿铁' },
      { value: 'espresso', label: '浓缩咖啡 · 售罄', disabled: true },
      { value: 'juice', label: '鲜榨橙汁' },
      { value: 'milk', label: '热牛奶' }
    ]
    var drinkLabel = pick('[data-picker-drink]')
    var drink = 'tea'
    window.MyUI.mount(demo('picker-single'), 'Picker', {
      label: '选择饮品',
      value: drink,
      columnLabels: ['饮品'],
      options: drinks,
      onChange: function (value) {
        drink = value
        var hit = drinks.filter(function (item) {
          return item.value === drink
        })[0]
        drinkLabel.textContent = hit ? hit.label : ''
      }
    })

    // 独立多列：每列各自一组选项，值是数组。
    var timeColumns = [
      Array.from({ length: 14 }, function (_unused, index) {
        var value = String(index + 7).padStart(2, '0')
        return { value: value, label: value + ' 时' }
      }),
      ['00', '15', '30', '45'].map(function (value) {
        return { value: value, label: value + ' 分' }
      })
    ]
    var timeLabel = pick('[data-picker-time]')
    var timeValue = ['09', '30']
    window.MyUI.mount(demo('picker-columns'), 'Picker', {
      label: '预约时间',
      value: timeValue,
      columns: timeColumns,
      columnLabels: ['小时', '分钟'],
      onChange: function (value) {
        timeValue = value
        timeLabel.textContent = value.join(':')
      }
    })

    // 级联：children 定义联动列，面板里改草稿，确认后写回。
    var areas = [
      {
        value: 'zhejiang',
        label: '浙江省',
        children: [
          {
            value: 'hangzhou',
            label: '杭州市',
            children: [
              { value: 'xihu', label: '西湖区' },
              { value: 'gongshu', label: '拱墅区' },
              { value: 'binjiang', label: '滨江区' }
            ]
          },
          {
            value: 'ningbo',
            label: '宁波市',
            children: [
              { value: 'haishu', label: '海曙区' },
              { value: 'yinzhou', label: '鄞州区' }
            ]
          }
        ]
      },
      {
        value: 'jiangsu',
        label: '江苏省',
        children: [
          {
            value: 'nanjing',
            label: '南京市',
            children: [
              { value: 'xuanwu', label: '玄武区' },
              { value: 'gulou', label: '鼓楼区' }
            ]
          },
          {
            value: 'suzhou',
            label: '苏州市',
            children: [
              { value: 'gusu', label: '姑苏区' },
              { value: 'wuzhong', label: '吴中区' }
            ]
          }
        ]
      },
      {
        value: 'shanghai',
        label: '上海市',
        children: [
          {
            value: 'shanghai-city',
            label: '上海市',
            children: [
              { value: 'huangpu', label: '黄浦区' },
              { value: 'xuhui', label: '徐汇区' },
              { value: 'jingan', label: '静安区' }
            ]
          }
        ]
      }
    ]
    var area = ['zhejiang', 'hangzhou', 'xihu']
    var draft = []
    var areaLabel = pick('[data-picker-area]')
    var paintArea = function () {
      var items = areas
      var labels = []
      area.forEach(function (value) {
        var hit = items.filter(function (item) {
          return item.value === value
        })[0]
        labels.push(hit ? hit.label : '')
        items = (hit && hit.children) || []
      })
      areaLabel.textContent = labels.join(' / ')
    }
    paintArea()
    var draftPicker = window.MyUI.create('Picker', {
      label: '配送地区',
      value: draft,
      options: areas,
      columnLabels: ['省份', '城市', '区县'],
      onChange: function (value) {
        draft = value
      }
    })
    var sheetContent = el('div', 'picker-sheet-content')
    sheetContent.append(draftPicker.element)
    var areaSheet = window.MyUI.create(
      'Sheet',
      {
        value: false,
        title: '选择配送地区',
        confirmText: '确定',
        onConfirm: function () {
          area = draft.slice()
          paintArea()
        }
      },
      { slots: { default: sheetContent } }
    )
    demo('picker-cascade').append(
      buttonEl('选择地区', {
        variant: 'outline',
        onClick: function () {
          draft = area.slice()
          draftPicker.update({ value: draft })
          areaSheet.update({ value: true })
        }
      }),
      areaSheet.element
    )
  }

  /** pages/home/date-time-picker：日期、时间、秒、日历与范围禁选。 */
  function buildDateTimeExamples() {
    var now = new Date()
    var year = now.getFullYear()
    var dateKey = function (date) {
      return (
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0')
      )
    }
    var today = dateKey(now)
    var min = String(year - 1) + '-01-01'
    var max = String(year + 2) + '-12-31'
    var reserved = function (value) {
      return value.endsWith('-13') || value.endsWith('-23')
    }

    // 日期选择：主控件 + 底部面板里的草稿控件。
    var dateLabel = pick('[data-date-value]')
    var dateValue = today
    dateLabel.textContent = dateValue
    var dateControl = window.MyUI.mount(demo('date-picker'), 'DatePicker', {
      label: '出发日期',
      value: dateValue,
      min: min,
      max: max,
      onChange: function (value) {
        dateValue = value
        dateLabel.textContent = value
      }
    })
    var draft = dateValue
    var draftControl = window.MyUI.create('DatePicker', {
      label: '出发日期草稿',
      value: draft,
      min: min,
      max: max,
      onChange: function (value) {
        draft = value
      }
    })
    var draftHost = el('div', 'date-picker-sheet')
    draftHost.append(draftControl.element)
    var dateSheet = window.MyUI.create(
      'Sheet',
      {
        value: false,
        title: '选择出发日期',
        confirmText: '确定',
        onConfirm: function () {
          dateValue = draft
          dateControl.update({ value: dateValue })
          dateLabel.textContent = dateValue
        }
      },
      { slots: { default: draftHost } }
    )
    demo('date-picker-sheet').append(
      buttonEl('修改出发日期', {
        variant: 'outline',
        onClick: function () {
          draft = dateValue
          draftControl.update({ value: draft })
          dateSheet.update({ value: true })
        }
      }),
      dateSheet.element
    )

    var timeLabel = pick('[data-time-value]')
    window.MyUI.mount(demo('time-picker'), 'TimePicker', {
      label: '预约时间',
      value: '09:30',
      min: '09:00',
      max: '18:30',
      minuteStep: 15,
      onChange: function (value) {
        timeLabel.textContent = value
      }
    })

    var preciseLabel = pick('[data-precise-value]')
    window.MyUI.mount(demo('time-seconds'), 'TimePicker', {
      label: '精确时间',
      value: '01:20:30',
      showSeconds: true,
      secondStep: 5,
      onChange: function (value) {
        preciseLabel.textContent = value
      }
    })

    window.MyUI.mount(demo('calendar-single'), 'Calendar', {
      label: '行程日历',
      value: today,
      min: min,
      max: max
    })
    window.MyUI.mount(demo('calendar-range'), 'Calendar', {
      label: '日期范围',
      value: [],
      range: true,
      min: min,
      max: max,
      disabledDate: reserved
    })
  }

  // 上传示例共用的模拟进度：文件不出本页，失败一次后点击重试可继续。
  var uploadFailOnce = new WeakSet()
  var uploadNext = 0
  function simulateUpload(file, options) {
    return new Promise(function (resolve, reject) {
      var percentage = 0
      var timer = 0
      var cleanup = function () {
        clearInterval(timer)
        options.signal.removeEventListener('abort', abort)
      }
      var abort = function () {
        cleanup()
        reject(new DOMException('已取消', 'AbortError'))
      }
      timer = setInterval(function () {
        percentage += 10
        options.onProgress(percentage)
        if (percentage >= 100) {
          cleanup()
          if (uploadFailOnce.delete(file)) reject(new Error('连接中断，点击重试继续上传'))
          else resolve({ name: file.name })
        }
      }, 160)
      options.signal.addEventListener('abort', abort, { once: true })
      if (options.signal.aborted) abort()
    })
  }

  /** pages/home/upload：拖放自动上传与手动上传。 */
  function buildUploadExamples() {
    var files = [
      {
        id: 'cover',
        name: '旅行封面.svg',
        type: 'image/svg+xml',
        size: 896,
        url: 'assets/images/lake.svg',
        status: 'success'
      }
    ]
    var autoActions = el('div', 'upload-example-actions')
    var clearButton = window.MyUI.create('Button', {
      label: '清空',
      variant: 'text',
      disabled: true,
      onClick: function () {
        files = []
        autoUpload.update({ value: files })
      }
    })
    var autoUpload = window.MyUI.mount(demo('upload-auto'), 'Upload', {
      label: '上传附件',
      value: files,
      multiple: true,
      drag: true,
      maxCount: 3,
      maxSize: 5 * 1024 * 1024,
      accept: 'image/*,.pdf,.txt',
      request: simulateUpload,
      hint: '图片、PDF 或文本 · 每个最多 5 MB · 最多 3 个',
      onChange: function (value) {
        files = value
        clearButton.update({ disabled: !value.length })
      }
    })
    var addExampleFile = function (failed) {
      var file = new File(
        ['把日常的灵感记下来。'],
        (failed ? '等待重试的笔记' : '周末的灵感') + '-' + ++uploadNext + '.txt',
        { type: 'text/plain' }
      )
      if (failed) uploadFailOnce.add(file)
      autoUpload.exposed.addFiles([file])
    }
    autoActions.append(
      buttonEl('添加示例文件', {
        variant: 'text',
        onClick: function () {
          addExampleFile(false)
        }
      }),
      buttonEl('体验失败重试', {
        variant: 'text',
        onClick: function () {
          addExampleFile(true)
        }
      }),
      clearButton.element
    )
    demo('upload-auto').append(autoActions)

    var manualFiles = []
    var manualActions = el('div', 'upload-example-actions')
    var startButton = window.MyUI.create('Button', {
      label: '开始上传',
      disabled: true,
      onClick: function () {
        manual.exposed.submit()
      }
    })
    var cancelButton = window.MyUI.create('Button', {
      label: '取消上传',
      variant: 'text',
      onClick: function () {
        manual.exposed.abort()
      }
    })
    var paintManualActions = function () {
      var ready = manualFiles.some(function (file) {
        return ['ready', 'error', 'canceled'].indexOf(file.status || 'ready') >= 0
      })
      var uploading = manualFiles.some(function (file) {
        return file.status === 'uploading'
      })
      startButton.update({ disabled: !ready })
      cancelButton.element.hidden = !uploading
    }
    var manual = window.MyUI.mount(demo('upload-manual'), 'Upload', {
      label: '待上传文本',
      value: [],
      multiple: true,
      maxCount: 3,
      autoUpload: false,
      request: simulateUpload,
      accept: '.txt',
      hint: '支持文本文件，选择后可手动开始',
      onChange: function (value) {
        manualFiles = value
        paintManualActions()
      }
    })
    cancelButton.element.hidden = true
    manualActions.append(
      buttonEl('添加文本示例', {
        variant: 'outline',
        onClick: function () {
          manual.exposed.addFiles([
            new File(['稍后再上传。'], '待上传的笔记-' + ++uploadNext + '.txt', {
              type: 'text/plain'
            })
          ])
        }
      }),
      startButton.element,
      cancelButton.element
    )
    demo('upload-manual').append(manualActions)
    paintManualActions()
  }


  /** 03 内容容器：按 Vue pages/home/{card,shadows,identity,image,app-bar,navigation,list} 逐块还原。 */
  function buildSurfaces() {
    buildCardExamples()
    buildShadowExample()
    buildIdentityExamples()
    buildImageExamples()
    buildAppBarExample()
    buildNavigationExample()
    buildListExamples()
  }

  /** pages/home/card：两个 bare 示例（快捷卡片、图文内容卡片）。 */
  function buildCardExamples() {
    var shortcuts = [
      { title: '清理存储', description: '36.8 GB / 128 GB', icon: 'inbox' },
      { title: '安全检查', description: '设备状态良好', icon: 'shield' },
      { title: '运行状态', description: '让日常使用更轻快', icon: 'spark' },
      { title: '应用管理', description: '查看全部应用', icon: 'grid' }
    ]
    shortcuts.forEach(function (item) {
      var iconNode = iconEl(item.icon)
      iconNode.classList.add('shortcut-icon')
      var copy = el('div', 'shortcut-copy')
      var title = el('h3')
      title.textContent = item.title
      var description = el('p')
      description.textContent = item.description
      copy.append(title, description)
      var card = window.MyUI.create(
        'Card',
        {
          title: item.title,
          interactive: true,
          onActivate: function () {
            notify(item.title + '（交互示例）')
          }
        },
        { slots: { default: [iconNode, copy] } }
      )
      card.element.classList.add('shortcut-card')
      demo('card-shortcuts').append(card.element)
    })

    // 云端同步大卡片
    var cloudTop = el('div', 'large-card-top')
    var cloudIcon = el('span', 'large-card-icon')
    cloudIcon.append(iconEl('cloud'))
    var cloudStatus = el('span', 'card-status')
    cloudStatus.append(el('i'), textNode('同步正常'))
    cloudTop.append(cloudIcon, cloudStatus)

    var cloudCopy = el('div', 'large-card-copy')
    var cloudEyebrow = el('span', 'card-eyebrow')
    cloudEyebrow.textContent = '随时随地，保持连接'
    var cloudTitle = el('h3')
    cloudTitle.append(textNode('重要的内容，'), document.createElement('br'), textNode('始终在你身边。'))
    var cloudText = el('p')
    cloudText.textContent = '照片、文档与收藏，在每一台设备上保持同步。'
    cloudCopy.append(cloudEyebrow, cloudTitle, cloudText)

    var cloudBottom = el('div', 'large-card-bottom')
    var cloudCaption = el('span')
    cloudCaption.textContent = '最近同步于 2 分钟前'
    cloudBottom.append(cloudCaption, iconEl('arrow-right'))

    var cloudCard = window.MyUI.create(
      'Card',
      {
        title: '云端同步',
        interactive: true,
        onActivate: function () {
          notify('已打开云端同步示例')
        }
      },
      { slots: { default: [cloudTop, cloudCopy, cloudBottom] } }
    )
    cloudCard.element.classList.add('large-card', 'cloud-card')

    // 周末湖边照片卡片
    var cover = document.createElement('img')
    cover.className = 'card-cover'
    cover.src = 'assets/images/lake.svg'
    cover.alt = '平静的湖面与远山'
    cover.loading = 'lazy'
    cover.draggable = false

    var photoContent = el('div', 'photo-card-content')
    var photoCopy = el('div', 'large-card-copy')
    var photoEyebrow = el('span', 'card-eyebrow')
    photoEyebrow.textContent = '周末灵感'
    var photoTitle = el('h3')
    photoTitle.textContent = '去湖边走走'
    var photoText = el('p')
    photoText.textContent = '放慢一点，把时间留给风景。'
    photoCopy.append(photoEyebrow, photoTitle, photoText)
    var photoBottom = el('div', 'large-card-bottom')
    var photoCaption = el('span')
    photoCaption.textContent = '一份轻松出发的小计划'
    photoBottom.append(photoCaption, iconEl('arrow-right'))
    photoContent.append(photoCopy, photoBottom)

    var photoCard = window.MyUI.create(
      'Card',
      {
        title: '周末，去湖边走走',
        interactive: true,
        onActivate: function () {
          notify('已打开周末旅行示例')
        }
      },
      { slots: { default: [cover, photoContent] } }
    )
    photoCard.element.classList.add('large-card', 'photo-card')

    demo('card-content').append(cloudCard.element, photoCard.element)
  }

  /** pages/home/shadows：阴影层级、放进真实组件（菜单 + 模态弹窗）。 */
  function buildShadowExample() {
    var levels = [
      { name: '无阴影', usage: '嵌入内容、平铺列表', value: 'none', icon: 'grid' },
      { name: '轻浮起', usage: '小型工具栏、浮起控件', value: 'var(--small-shadow)', icon: 'sliders' },
      { name: '卡片', usage: '内容卡片、页面分组', value: 'var(--shadow)', icon: 'layer' },
      {
        name: '浮层',
        usage: '菜单、搜索选项、轻提示',
        value: 'var(--popup-shadow)',
        icon: 'message'
      },
      { name: '模态', usage: '对话框、抽屉、底部面板', value: 'var(--modal-shadow)', icon: 'copy' }
    ]
    levels.forEach(function (level, index) {
      var figure = el('figure', 'shadow-level')
      var stage = el('div', 'shadow-stage')
      var sample = el('div', 'shadow-sample')
      sample.style.boxShadow = level.value
      sample.setAttribute('aria-hidden', 'true')
      sample.append(iconEl(level.icon))
      var order = el('span')
      order.textContent = '0' + index
      sample.append(order)
      stage.append(sample)
      var caption = document.createElement('figcaption')
      var name = el('strong')
      name.textContent = level.name
      var usage = el('span')
      usage.textContent = level.usage
      var value = document.createElement('code')
      value.textContent = level.value
      caption.append(name, usage, value)
      figure.append(stage, caption)
      demo('shadows').append(figure)
    })

    var contextContent = el('div', 'context-content')
    var contextIcon = el('span', 'context-icon')
    contextIcon.append(iconEl('inbox'))
    var contextCopy = document.createElement('div')
    var contextTitle = el('strong')
    contextTitle.textContent = '我的工作空间'
    var contextText = el('p')
    contextText.textContent = '整理内容，让层次保持清晰'
    contextCopy.append(contextTitle, contextText)
    contextContent.append(contextIcon, contextCopy)

    var menuButton = window.MyUI.create(
      'Button',
      { variant: 'text' },
      { slots: { default: [textNode('浮层菜单'), iconEl('chevrons-up-down')] } }
    )
    var contextMenu = window.MyUI.create(
      'Menu',
      {
        options: [
          { value: 'copy', label: '复制链接', icon: 'copy' },
          { value: 'save', label: '加入收藏', icon: 'heart' },
          { value: 'share', label: '分享内容', icon: 'share' }
        ],
        label: '阴影示例菜单',
        anchor: 'element',
        placement: 'bottom-end',
        onSelect: function (item) {
          notify(item.label + '（阴影示例）')
        }
      },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(menuButton.element, context.trigger)
            return menuButton.element
          }
        }
      }
    )

    var dialog = window.MyUI.create('Dialog', {
      value: false,
      title: '保留这份灵感？',
      description: '模态窗口使用更宽的投影，菜单使用中等投影，内容卡片保持轻盈。',
      icon: false,
      confirmText: '保留',
      onConfirm: function () {
        notify('已保留这份灵感（阴影示例）')
      }
    })
    var dialogButton = buttonEl('模态弹窗', {
      variant: 'outline',
      onClick: function () {
        dialog.update({ value: true })
      }
    })

    var contextActions = el('div', 'context-actions')
    contextActions.append(contextMenu.element, dialogButton)
    var contextCard = window.MyUI.create('Card', {}, {
      slots: { default: [contextContent, contextActions] }
    })
    contextCard.element.classList.add('context-card')
    demo('shadows-context').append(contextCard.element)
    demo('shadows-dialog').append(dialog.element)
  }

  /** pages/home/identity：头像与状态组合、头像、徽标。 */
  function buildIdentityExamples() {
    var portrait = 'assets/avatar-lan.svg'
    var unread = 12
    var quiet = false

    var profileAvatar = window.MyUI.create('Avatar', {
      src: portrait,
      alt: '小蓝同学',
      size: 56
    })
    var profileBadge = window.MyUI.create(
      'Badge',
      { dot: true, hidden: quiet, label: '小蓝在线' },
      { slots: { default: profileAvatar.element } }
    )
    profileBadge.element.classList.add('online-badge')
    var profileCopy = document.createElement('div')
    var profileName = el('strong')
    profileName.textContent = '小蓝同学'
    var profileText = el('p')
    profileCopy.append(profileName, profileText)
    var creatorBadge = window.MyUI.create('Badge', { value: '创作者' })
    creatorBadge.element.classList.add('creator-badge')
    demo('identity-profile').append(profileBadge.element, profileCopy, creatorBadge.element)

    var avatarExamples = demo('avatar')
    ;[
      { props: { src: portrait, alt: '小蓝同学' }, label: '图片' },
      { props: { text: '青', alt: '小青' }, label: '文字', className: 'green-avatar' },
      { props: { alt: 'Alex Morgan', shape: 'square' }, label: '方形' },
      { props: { size: 32, alt: '访客' }, label: '小尺寸', text: '访' },
      { props: {}, label: '默认' }
    ].forEach(function (item) {
      var cell = document.createElement('div')
      var avatar = window.MyUI.create(
        'Avatar',
        item.props,
        item.text ? { slots: { default: el('span', '', item.text) } } : {}
      )
      if (item.className) avatar.element.classList.add(item.className)
      var caption = el('span')
      caption.textContent = item.label
      cell.append(avatar.element, caption)
      avatarExamples.append(cell)
    })

    var bellButton = window.MyUI.create(
      'Button',
      {
        variant: 'bare',
        icon: 'bell',
        onClick: function () {
          unread = 0
          paintBadges()
        }
      },
      { attributes: { 'aria-label': '查看通知' } }
    )
    var bellBadge = window.MyUI.create('Badge', { value: unread, hidden: quiet }, {
      slots: { default: bellButton.element }
    })
    var messageBadge = window.MyUI.create(
      'Badge',
      { value: 128, hidden: quiet },
      {
        slots: {
          default: window.MyUI.create(
            'Button',
            { variant: 'bare', icon: 'message' },
            { attributes: { 'aria-label': '查看消息' } }
          ).element
        }
      }
    )
    var heartBadge = window.MyUI.create(
      'Badge',
      { dot: true, hidden: quiet },
      {
        slots: {
          default: window.MyUI.create(
            'Button',
            { variant: 'bare', icon: 'heart' },
            { attributes: { 'aria-label': '查看关注' } }
          ).element
        }
      }
    )
    var inboxBadge = window.MyUI.create(
      'Badge',
      { value: 0, showZero: true, hidden: quiet },
      {
        slots: {
          default: window.MyUI.create(
            'Button',
            { variant: 'bare', icon: 'inbox' },
            { attributes: { 'aria-label': '查看收件箱' } }
          ).element
        }
      }
    )
    ;[
      { badge: bellBadge, label: '未读数字' },
      { badge: messageBadge, label: '超出上限' },
      { badge: heartBadge, label: '圆点提醒' },
      { badge: inboxBadge, label: '保留零值' }
    ].forEach(function (item) {
      var cell = document.createElement('div')
      var caption = el('span')
      caption.textContent = item.label
      cell.append(item.badge.element, caption)
      demo('badge').append(cell)
    })

    var unreadToggle = window.MyUI.create('Button', {
      label: '清空未读',
      variant: 'text',
      onClick: function () {
        unread = unread ? 0 : 12
        paintBadges()
      }
    })
    var quietToggle = window.MyUI.create('Button', {
      label: '暂时隐藏',
      variant: 'text',
      onClick: function () {
        quiet = !quiet
        paintBadges()
      }
    })
    var paintBadges = function () {
      bellBadge.update({ value: unread, hidden: quiet })
      messageBadge.update({ hidden: quiet })
      heartBadge.update({ hidden: quiet })
      inboxBadge.update({ hidden: quiet })
      profileBadge.update({ hidden: quiet })
      profileText.textContent = quiet ? '安静一会儿，稍后再看' : '今天也有值得收藏的新发现'
      unreadToggle.update({ label: unread ? '清空未读' : '恢复未读' })
      quietToggle.update({ label: quiet ? '显示提醒' : '暂时隐藏' })
    }
    paintBadges()
    demo('badge-actions').append(unreadToggle.element, quietToggle.element)
  }

  /** pages/home/image：图片裁剪、自定义占位、失败与恢复。 */
  function buildImageExamples() {
    var lake = 'assets/images/lake.svg'

    var fitImage = window.MyUI.create('Image', {
      src: lake,
      alt: '山间湖泊，远山与一叶小舟',
      ratio: 16 / 9,
      fit: 'cover'
    })
    var figure = demo('image-fit')
    figure.append(fitImage.element)
    var figureCaption = document.createElement('figcaption')
    var figureTitle = el('strong')
    figureTitle.textContent = '山间的一点安静'
    var figureText = el('span')
    figureText.textContent = '相同比例，三种呈现方式'
    figureCaption.append(figureTitle, figureText)
    figure.append(figureCaption)
    figure.append(
      window.MyUI.create('Segmented', {
        label: '图片裁剪方式',
        value: 'cover',
        options: [
          { value: 'cover', label: '裁剪填满' },
          { value: 'contain', label: '完整显示' },
          { value: 'fill', label: '拉伸填满' }
        ],
        onChange: function (value) {
          fitImage.update({ fit: value })
        }
      }).element
    )

    // 自定义占位：placeholder 插槽内容由本地节点提供。
    var ready = false
    var customPlaceholder = el('div', 'custom-placeholder')
    var placeholderLabel = el('span')
    placeholderLabel.textContent = '给内容留好位置'
    var placeholderHint = el('small')
    placeholderHint.textContent = '占位内容可以自由组合'
    customPlaceholder.append(iconEl('image'), placeholderLabel, placeholderHint)
    var placeholderImage = window.MyUI.create(
      'Image',
      { src: '', alt: '准备展示的山间湖泊', ratio: 3 / 2 },
      { slots: { placeholder: customPlaceholder } }
    )
    placeholderImage.element.classList.add('image-custom')
    var placeholderCaption = el('div', 'image-state-caption')
    var placeholderText = el('span')
    placeholderText.textContent = '自定义占位'
    var placeholderToggle = window.MyUI.create('Button', {
      variant: 'text',
      onClick: function () {
        ready = !ready
        paintPlaceholder()
      }
    })
    var paintPlaceholder = function () {
      placeholderImage.update({ src: ready ? lake : '' })
      placeholderToggle.update({ label: ready ? '清空图片' : '载入图片' })
    }
    paintPlaceholder()
    placeholderCaption.append(placeholderText, placeholderToggle.element)
    demo('image-placeholder').append(placeholderImage.element, placeholderCaption)

    // 失败与恢复：地址不可用时展示失败状态。
    var failed = 'data:image/png;base64,AA=='
    var restored = false
    var errorImage = window.MyUI.create('Image', {
      src: failed,
      alt: '示例图片',
      ratio: 3 / 2
    })
    var errorCaption = el('div', 'image-state-caption')
    var errorText = el('span')
    var errorToggle = window.MyUI.create('Button', {
      variant: 'text',
      onClick: function () {
        restored = !restored
        paintError()
      }
    })
    var paintError = function () {
      errorImage.update({ src: restored ? lake : failed })
      errorText.textContent = restored ? '已恢复显示' : '失败后可以重试'
      errorToggle.update({ label: restored ? '模拟失败' : '恢复图片' })
    }
    paintError()
    errorCaption.append(errorText, errorToggle.element)
    demo('image-error').append(errorImage.element, errorCaption)
  }

  /** pages/home/app-bar：标题与操作区 + 可滚动内容预览。 */
  function buildAppBarExample() {
    var centered = true
    var searchButton = window.MyUI.create(
      'Button',
      {
        variant: 'bare',
        icon: 'search',
        onClick: function () {
          notify('搜索收藏')
        }
      },
      { attributes: { 'aria-label': '搜索收藏' } }
    )
    var moreButton = window.MyUI.create(
      'Button',
      { variant: 'bare', icon: 'grid' },
      { attributes: { 'aria-label': '收藏操作' } }
    )
    var appBarMenu = window.MyUI.create(
      'Menu',
      {
        options: [
          { value: 'sort', label: '整理收藏', icon: 'layer' },
          { value: 'share', label: '分享空间', icon: 'share' }
        ],
        onSelect: function (item) {
          notify(item.label)
        }
      },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(moreButton.element, context.trigger)
            return moreButton.element
          }
        }
      }
    )
    var appBar = window.MyUI.create(
      'AppBar',
      {
        title: '我的收藏',
        subtitle: '把喜欢的，留在这里',
        back: true,
        sticky: true,
        center: centered,
        onBack: function () {
          notify('已点击返回')
        }
      },
      { slots: { actions: [searchButton.element, appBarMenu.element] } }
    )

    var content = el('div', 'app-bar-content')
    content.append(iconEl('heart'))
    var contentTitle = el('strong')
    contentTitle.textContent = '一点日常的好风景'
    var contentText = el('p')
    contentText.textContent = '顶栏与页面内容各有自己的位置。滚动这块区域，顶栏会留在顶部。'
    content.append(contentTitle, contentText)
    ;['周末的散步', '随手记下的灵感', '旅途中的照片', '等待完成的计划'].forEach(function (
      label,
      index
    ) {
      var row = el('div', 'app-bar-placeholder')
      var caption = el('span')
      caption.textContent = label
      row.append(iconEl(index % 2 === 0 ? 'image' : 'inbox'), caption)
      content.append(row)
    })

    var windowHost = demo('app-bar')
    windowHost.append(appBar.element, content)

    var noteToggle = window.MyUI.create('Button', {
      label: '标题靠左',
      variant: 'text',
      onClick: function () {
        centered = !centered
        appBar.update({ center: centered })
        noteToggle.update({ label: centered ? '标题靠左' : '标题居中' })
      }
    })
    demo('app-bar-note').append(noteToggle.element)
  }

  /** pages/home/navigation：底部导航。 */
  function buildNavigationExample() {
    window.MyUI.mount(demo('navigation'), 'Navigation', {
      value: 'home',
      options: [
        { value: 'home', label: '首页', icon: 'home' },
        { value: 'discover', label: '发现', icon: 'grid' },
        { value: 'messages', label: '消息', icon: 'message' },
        { value: 'profile', label: '我的', icon: 'user' }
      ]
    })
  }

  /** pages/home/list：选择列表、导航与设置列表。 */
  function buildListExamples() {
    window.MyUI.mount(demo('list-choices'), 'Choices', {
      list: true,
      label: '阅读偏好',
      value: 'system',
      options: [
        { value: 'system', label: '跟随系统', description: '自动匹配系统设置' },
        { value: 'light', label: '浅色模式', description: '明亮柔和的显示效果' },
        { value: 'dark', label: '深色模式', description: '适合夜间使用' }
      ]
    })
    window.MyUI.mount(demo('list-choices-sync'), 'Choices', {
      list: true,
      type: 'checkbox',
      label: '同步内容',
      value: ['documents', 'images'],
      options: [
        { value: 'documents', label: '同步文档', description: '多设备持续更新' },
        { value: 'images', label: '同步图片', description: '保留珍贵的视觉记录' },
        { value: 'favorites', label: '同步收藏', description: '随时找回喜欢的内容' }
      ]
    })

    var autoUpdate = true
    var sortValue = '最近更新'
    var sortOptions = ['最近更新', '最近创建', '名称排序'].map(function (value) {
      return { value: value, label: value }
    })
    var sortRow = window.MyUI.create('ListRow', {
      title: '排序方式',
      description: '选择内容的排列顺序',
      valueText: sortValue
    })
    var sortPopover = window.MyUI.create(
      'Popover',
      {
        value: sortValue,
        label: '排序方式',
        options: sortOptions,
        onSelect: function (item) {
          sortValue = item.value
          sortRow.update({ valueText: sortValue })
        }
      },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(sortRow.element, context.trigger)
            return sortRow.element
          }
        }
      }
    )

    var rows = [
      window.MyUI.create('ListRow', {
        title: '个人资料',
        description: '查看与编辑账号信息',
        onClick: function () {
          notify('个人资料页面（原型示例）')
        }
      }).element,
      window.MyUI.create('ListRow', {
        title: '隐私与安全',
        description: '权限、账号保护',
        onClick: function () {
          notify('隐私设置页面（原型示例）')
        }
      }).element,
      window.MyUI.create('ListRow', {
        title: '内存',
        description: '查看内存的使用情况、当前运行的应用与最近的资源占用统计。',
        onClick: function () {
          notify('内存页面（原型示例）')
        }
      }).element,
      window.MyUI.create('ListRow', {
        title: 'WebView 实现',
        valueText: 'Android System WebView',
        onClick: function () {
          notify('WebView 设置（原型示例）')
        }
      }).element,
      window.MyUI.create('ListRow', {
        title: '自动更新',
        description: '在后台保持内容最新',
        toggle: true,
        value: autoUpdate,
        onChange: function (value) {
          autoUpdate = value
        }
      }).element,
      sortPopover.element
    ]
    demo('list-navigation').append(
      window.MyUI.create(
        'CellGroup',
        { title: '设置与操作', label: '设置与操作' },
        { slots: { default: rows } }
      ).element
    )
  }

  /*
   * 04 状态反馈：按 Vue pages/{native/navigation, home/feedback, primitives, notice-steps,
   * popup, touch-gestures, menu} 里每个 <DemoExample> 的插槽内容还原。
   * primitives 页里的 PlaybackProgress / SliderExample 也是 DemoExample，同样在这里装配。
   */
  function buildFeedback() {
    buildSharedStateExample()
    buildFeedbackExamples()
    buildPrimitivesExamples()
    buildNoticeStepsExamples()
    buildPopupExamples()
    buildTouchExample()
    buildMenuExamples()
  }

  // 分享面板的三个动作，button 页与 feedback 页共用同一组文案。
  var SHARE_ACTIONS = [
    { value: 'copy', label: '复制链接', icon: 'copy' },
    { value: 'favorite', label: '收藏到本地', icon: 'heart' },
    { value: 'later', label: '稍后查看', icon: 'clock' }
  ]

  /** 打开分享面板，把用户选择的结果返回给调用方。 */
  function openShareSheet() {
    var panel = window.MyUI.popup.showSheet({
      title: '分享这份灵感',
      content: function (context) {
        return sharePanel(SHARE_ACTIONS, function (action) {
          context.close(action)
        })
      }
    })
    return panel.closed
  }

  /** 执行分享动作：复制链接 / 收藏到本地 / 稍后查看。 */
  function runShareAction(action, onFavorite) {
    if (!action) return
    if (action.value === 'copy') {
      if (!navigator.clipboard?.writeText) {
        notify('浏览器未允许复制，请从地址栏复制链接')
        return
      }
      navigator.clipboard.writeText(window.location.href).then(
        function () {
          notify('链接已复制')
        },
        function () {
          notify('浏览器未允许复制，请从地址栏复制链接')
        }
      )
    } else if (action.value === 'favorite') {
      saveFlag('liked', true)
      if (onFavorite) onFavorite()
      else notify('已收藏到本地')
    } else {
      saveFlag('later', true)
      notify('已加入稍后查看')
    }
  }

  /** 带尾随箭头的链接按钮。 */
  function linkButton(label, onClick) {
    return window.MyUI.create(
      'Button',
      { variant: 'link', onClick: onClick },
      { slots: { default: [textNode(label), iconEl('arrow-right')] } }
    ).element
  }

  /** pages/native/navigation：跨页共享状态（纯 HTML 版用 localStorage 模拟共用缓存）。 */
  function buildSharedStateExample() {
    var storageKey = 'myui:showcase-shared'
    var readShared = function () {
      try {
        var raw = localStorage.getItem(storageKey)
        return raw ? JSON.parse(raw) : null
      } catch (error) {
        return null
      }
    }
    var persist = function () {
      try {
        localStorage.setItem(storageKey, JSON.stringify(shared))
      } catch (error) {
        /* 存储不可用时仍保留本页交互。 */
      }
    }
    var saved = readShared() || {}
    var shared = { note: saved.note || '记下这一刻的海风', count: saved.count || 0 }

    var countButton = window.MyUI.create('Button', {
      label: '共享计数 ' + shared.count,
      variant: 'outline',
      onClick: function () {
        shared.count += 1
        persist()
        countButton.update({ label: '共享计数 ' + shared.count })
      }
    })
    var noteInput = window.MyUI.mount(demo('shared-state'), 'Input', {
      label: '共享备注',
      value: shared.note,
      clearable: true,
      onChange: function (value) {
        shared.note = value
        persist()
      }
    })
    var openButton = window.MyUI.create(
      'Button',
      {
        onClick: function () {
          notify('原型示例里没有独立窗口，状态已经写入本地缓存')
        }
      },
      { slots: { default: [textNode('打开另一页'), iconEl('arrow-right')] } }
    )
    var cacheButton = buttonEl('从本地更新', {
      variant: 'text',
      onClick: function () {
        var next = readShared()
        if (!next) return
        shared.note = next.note || ''
        shared.count = next.count || 0
        noteInput.update({ value: shared.note })
        countButton.update({ label: '共享计数 ' + shared.count })
        notify('已从本地更新')
      }
    })
    var resetButton = buttonEl('重置数据', {
      variant: 'text',
      onClick: function () {
        shared.note = ''
        shared.count = 0
        persist()
        noteInput.update({ value: '' })
        countButton.update({ label: '共享计数 0' })
      }
    })
    demo('shared-state-actions').append(
      countButton.element,
      openButton.element,
      cacheButton,
      resetButton
    )
  }

  /** pages/home/feedback：轻提示、确认弹窗、底部操作面板。 */
  function buildFeedbackExamples() {
    demo('toast-icon').append(iconEl('check'))
    demo('toast').append(
      linkButton('体验轻提示', function () {
        notify('你的更改已经同步')
      })
    )

    demo('dialog-icon').append(iconEl('shield'))
    demo('dialog').append(
      linkButton('打开确认弹窗', function () {
        window.MyUI.popup
          .showAlert({
            title: '确认保存更改？',
            message: '保存后将同步更新你的设置。你也可以稍后再进行调整。',
            confirmText: '确认保存'
          })
          .then(function (confirmed) {
            if (confirmed) notify('设置已保存')
          })
      })
    )

    var liked = readSaved('liked')
    var likeFake = {
      onFavorite: function () {
        liked = true
        notify('已收藏到本地')
      }
    }
    demo('sheet').append(
      linkButton('展开操作面板', function () {
        openShareSheet().then(function (action) {
          runShareAction(action, likeFake.onFavorite)
        })
      })
    )
  }

  /** pages/home/primitives + PlaybackProgress + SliderExample。 */
  function buildPrimitivesExamples() {
    // 文字提示
    ;[
      { content: '优先在上方显示，靠近边缘时自动避让', label: '上方提示' },
      { content: '提示会跟随触发元素，不占据页面空间', label: '下方提示', placement: 'bottom' },
      { content: '左侧空间不足时自动翻到另一侧', label: '左侧提示', placement: 'left' },
      {
        content: '参考编号：CL-2026-1017，可以选中文字并复制。',
        label: '右侧提示 · 可复制',
        placement: 'right',
        copyable: true,
        delay: 300,
        hideDelay: 200
      }
    ].forEach(function (spec) {
      var trigger = buttonEl(spec.label, { variant: 'outline' })
      demo('tooltip').append(
        window.MyUI.create(
          'Tooltip',
          {
            content: spec.content,
            placement: spec.placement || 'top',
            copyable: spec.copyable || false,
            delay: spec.delay ?? 200,
            hideDelay: spec.hideDelay ?? 100
          },
          { slots: { default: trigger } }
        ).element
      )
    })
    demo('tooltip-divider').append(window.MyUI.create('Divider').element)
    ;[
      { content: '收藏这份灵感', icon: 'heart', label: '收藏灵感', action: '已收藏这份灵感' },
      { content: '分享给朋友', icon: 'share', label: '分享灵感', action: '分享操作已触发' },
      { content: '归档后才可删除', icon: 'trash', label: '删除灵感', disabled: true }
    ].forEach(function (spec) {
      var trigger = window.MyUI.create(
        'Button',
        {
          variant: 'bare',
          icon: spec.icon,
          disabled: spec.disabled,
          onClick: spec.disabled
            ? undefined
            : function () {
                notify(spec.action)
              }
        },
        { attributes: { 'aria-label': spec.label } }
      )
      demo('tooltip-tools').append(
        window.MyUI.create('Tooltip', { content: spec.content }, { slots: { default: trigger.element } })
          .element
      )
    })

    // 内容分隔
    var dividerHost = demo('divider')
    var dividerHeading = el('div', 'divider-heading')
    var unreadTag = window.MyUI.create('Tag', {}, { slots: { default: '3 条未读' } }).element
    dividerHeading.append(iconEl('inbox'), textNode('我的收件箱'), unreadTag)
    dividerHost.append(dividerHeading)
    dividerHost.append(
      window.MyUI.create('Divider', { align: 'start' }, { slots: { default: '今天' } }).element
    )
    ;[
      { text: '设计稿已更新', time: '刚刚' },
      { text: '与团队同步下一步', time: '10:24' }
    ].forEach(function (item, index) {
      var row = el('div', 'divider-message')
      var main = el('span')
      main.textContent = item.text
      var time = document.createElement('small')
      time.textContent = item.time
      row.append(main, time)
      dividerHost.append(row)
      if (index === 0) dividerHost.append(window.MyUI.create('Divider').element)
    })
    dividerHost.append(
      window.MyUI.create('Divider', { dashed: true, align: 'end' }, {
        slots: { default: '更早的消息' }
      }).element
    )
    var dividerLinks = el('div', 'divider-links')
    dividerLinks.append(
      buttonEl('全部已读', {
        variant: 'text',
        onClick: function () {
          notify('全部消息已标为已读')
        }
      }),
      window.MyUI.create('Divider', { vertical: true }).element,
      buttonEl('通知设置', {
        variant: 'text',
        onClick: function () {
          notify('消息通知设置')
        }
      })
    )
    dividerHost.append(dividerLinks)

    // 任务进度
    demo('progress-file-icon').append(iconEl('image'))
    var value = 64
    var running = false
    var timer
    var complete = function () {
      return value === 100
    }
    var statusText = function () {
      return complete()
        ? '上传完成'
        : running
          ? '正在上传'
          : value
            ? '准备继续上传'
            : '等待开始'
    }
    var statusLabel = demo('progress-status')
    var mainProgress = window.MyUI.create('Progress', {
      value: value,
      label: '旅行相册上传进度'
    })
    var ringProgress = window.MyUI.create('Progress', {
      type: 'circle',
      value: value,
      label: '相册整体进度'
    })
    var actionButton = window.MyUI.create('Button', {
      label: '继续上传',
      onClick: function () {
        toggle()
      }
    })
    var stop = function () {
      clearInterval(timer)
      timer = undefined
      running = false
    }
    var paintProgress = function () {
      mainProgress.update({ value: value, status: complete() ? 'success' : 'normal' })
      ringProgress.update({ value: value, status: complete() ? 'success' : 'normal' })
      statusLabel.textContent =
        statusText() + ' · ' + Math.round(value * 2.56) + ' / 256 MB'
      actionButton.update({
        label: running ? '暂停上传' : complete() ? '再次上传' : value ? '继续上传' : '开始上传'
      })
    }
    var toggle = function () {
      if (running) {
        stop()
        paintProgress()
        return
      }
      if (complete()) value = 0
      running = true
      timer = setInterval(function () {
        value = Math.min(100, value + 4)
        paintProgress()
        if (complete()) stop()
      }, 280)
      paintProgress()
    }
    paintProgress()
    demo('progress').append(mainProgress.element)
    demo('progress-actions').append(
      actionButton.element,
      buttonEl('重置进度', {
        variant: 'text',
        onClick: function () {
          stop()
          value = 0
          paintProgress()
        }
      })
    )
    demo('progress-divider').append(window.MyUI.create('Divider').element)
    ;[
      { label: '同步完成', value: 100, status: 'success' },
      { label: '等待重试', value: 46, status: 'warning' },
      { label: '上传失败', value: 38, status: 'error' }
    ].forEach(function (item) {
      var row = document.createElement('div')
      var caption = el('span')
      caption.textContent = item.label
      row.append(caption)
      row.append(
        window.MyUI.create('Progress', {
          value: item.value,
          status: item.status,
          label: item.label
        }).element
      )
      demo('progress-statuses').append(row)
    })
    demo('progress-ring').append(ringProgress.element)
    var pendingRing = window.MyUI.create('Progress', { type: 'circle', showText: false, label: '正在连接服务器' })
    pendingRing.element.classList.add('compact-ring')
    demo('progress-ring-pending').append(pendingRing.element)
    demo('progress-preparing').append(
      window.MyUI.create('Progress', { showText: false, label: '正在准备文件' }).element
    )
    var custom = window.MyUI.create(
      'Progress',
      { value: 6, max: 12, label: '已处理文件数' },
      {
        slots: {
          default: function (context) {
            return document.createTextNode(context.value + ' / ' + context.max)
          }
        }
      }
    )
    custom.element.classList.add('custom-progress')
    demo('progress-custom').append(custom.element)

    buildPlaybackExample()
    buildSliderOptionExamples()
  }

  /** PlaybackProgress.vue：播放与缓冲。 */
  function buildPlaybackExample() {
    var position = 36
    var buffer = 72
    var playing = false
    var timer
    var formatTime = function (seconds) {
      return (
        Math.floor(seconds / 60) + ':' + String(Math.round(seconds % 60)).padStart(2, '0')
      )
    }
    var timeLabel = demo('playback-time')
    var bufferLabel = demo('playback-buffer-label')
    var slider = window.MyUI.create('Slider', {
      label: '播放进度',
      value: position,
      buffer: buffer,
      startLabel: '1:48',
      endLabel: '5:00',
      onChange: function (value) {
        position = value
        buffer = Math.max(buffer, value)
        paint()
      }
    })
    var readProgress = window.MyUI.create('Progress', {
      value: position,
      buffer: buffer,
      showText: false,
      label: '影片播放与缓冲进度'
    })
    var playButton = window.MyUI.create('Button', {
      label: '播放',
      onClick: function () {
        toggle()
      }
    })
    var bufferButton = window.MyUI.create('Button', {
      label: '继续缓冲',
      variant: 'outline',
      onClick: function () {
        buffer = Math.min(100, buffer + 12)
        paint()
      }
    })
    var stop = function () {
      clearInterval(timer)
      timer = undefined
      playing = false
    }
    var paint = function () {
      var elapsed = formatTime(position * 3)
      timeLabel.textContent = elapsed + ' / 5:00'
      bufferLabel.textContent = '已缓冲 ' + buffer + '%'
      slider.update({ value: position, buffer: buffer, startLabel: elapsed, endLabel: '5:00' })
      readProgress.update({ value: position, buffer: buffer })
      playButton.update({ label: playing ? '暂停播放' : '播放' })
      bufferButton.update({ disabled: buffer === 100 })
    }
    var toggle = function () {
      if (playing) {
        stop()
        paint()
        return
      }
      if (position === 100) {
        position = 36
        buffer = 72
      }
      playing = true
      timer = setInterval(function () {
        buffer = Math.min(100, buffer + 2)
        position = Math.min(100, position + 1)
        paint()
        if (position === 100) stop()
      }, 500)
      paint()
    }
    paint()
    demo('playback').append(slider.element)
    demo('playback-actions').append(
      playButton.element,
      bufferButton.element,
      buttonEl('重置', {
        variant: 'text',
        onClick: function () {
          stop()
          position = 36
          buffer = 72
          paint()
        }
      })
    )
    demo('playback-divider').append(
      window.MyUI.create('Divider', { vertical: true }).element
    )
    demo('playback-progress').append(readProgress.element)
  }

  /** SliderExample.vue：四类滑块示例 + 提示箭头。 */
  function buildSliderOptionExamples() {
    window.MyUI.mount(demo('slider-step'), 'Slider', {
      label: '显示强度',
      value: 50,
      step: 10,
      marks: true
    })
    window.MyUI.mount(demo('slider-marks'), 'Slider', {
      label: '适宜温度',
      value: 20,
      step: null,
      unit: '°C',
      marks: [
        { value: 0, label: '0°C' },
        { value: 20, label: '20°C' },
        { value: 37, label: '37°C' },
        { value: 100, label: '100°C' }
      ]
    })
    window.MyUI.mount(demo('slider-range'), 'Slider', {
      label: '筛选范围',
      value: [20, 70],
      step: 5,
      marks: true,
      startLabel: '0%',
      endLabel: '100%'
    })
    window.MyUI.mount(demo('slider-value'), 'Slider', {
      label: '预设音量',
      value: 36,
      valueLabelDisplay: 'on'
    })

    demo('tooltip-arrow').append(
      buttonEl('重置示例', {
        variant: 'text',
        onClick: function () {
          notify('示例已重置（原型示例）')
        }
      }),
      window.MyUI.create(
        'Tooltip',
        { content: '4px 圆角、反色文字，不显示箭头', arrow: false },
        { slots: { default: buttonEl('无箭头提示', { variant: 'outline' }) } }
      ).element,
      window.MyUI.create(
        'Tooltip',
        { content: '箭头会随展示方向自动调整' },
        { slots: { default: buttonEl('带箭头提示', { variant: 'outline' }) } }
      ).element
    )
  }

  /** pages/home/notice-steps：通知条与步骤进度。 */
  function buildNoticeStepsExamples() {
    var visible = true
    var notices = demo('notice')
    var closableNotice = window.MyUI.create('Notice', {
      value: visible,
      title: '新的灵感已经到达',
      message: '你关注的内容有了更新，随时可以继续浏览。',
      closable: true,
      onChange: function (value) {
        visible = value
        paintRestore()
      }
    })
    notices.append(
      closableNotice.element,
      window.MyUI.create('Notice', {
        type: 'success',
        message: '修改已保存，所有内容已同步。'
      }).element
    )
    var warningNotice = window.MyUI.create(
      'Notice',
      {
        type: 'warning',
        title: '可用空间不足',
        message: '清理一些暂时不需要的文件，让新的内容有地方安放。'
      },
      {
        slots: {
          actions: buttonEl('管理', {
            variant: 'text',
            onClick: function () {
              notify('已打开空间管理')
            }
          })
        }
      }
    )
    notices.append(
      warningNotice.element,
      window.MyUI.create('Notice', {
        type: 'error',
        title: '暂时无法连接',
        message: '请检查网络，稍后再试。'
      }).element
    )
    var restoreHost = demo('notice-restore')
    var paintRestore = function () {
      restoreHost.replaceChildren()
      if (visible) return
      var button = buttonEl('重新显示通知', {
        variant: 'text',
        onClick: function () {
          visible = true
          closableNotice.update({ value: true })
          paintRestore()
        }
      })
      button.classList.add('restore-notice')
      restoreHost.append(button)
    }
    paintRestore()

    var flow = [{ label: '填写资料' }, { label: '确认内容' }, { label: '提交申请' }, { label: '完成' }]
    var step = 1
    var error = false
    var steps = window.MyUI.create('Steps', {
      value: step,
      options: flow,
      status: error ? 'error' : 'process',
      interactive: true,
      label: '申请进度',
      onChange: function (value) {
        step = value
        error = false
        paintSteps()
      }
    })
    var stepsLabel = demo('steps-label')
    var nextButton = window.MyUI.create('Button', {
      label: '下一步',
      onClick: function () {
        step = Math.max(0, Math.min(flow.length, step + 1))
        error = false
        paintSteps()
      }
    })
    var prevButton = window.MyUI.create('Button', {
      label: '上一步',
      variant: 'outline',
      onClick: function () {
        step = Math.max(0, Math.min(flow.length, step - 1))
        error = false
        paintSteps()
      }
    })
    var errorButton = window.MyUI.create('Button', {
      label: '查看错误状态',
      variant: 'text',
      onClick: function () {
        error = !error
        paintSteps()
      }
    })
    var paintSteps = function () {
      steps.update({ value: step, status: error ? 'error' : 'process' })
      stepsLabel.textContent =
        step === flow.length ? '全部步骤已完成' : '第 ' + (step + 1) + ' 步 · ' + (flow[step] ? flow[step].label : '')
      prevButton.update({ disabled: step === 0 })
      nextButton.update({
        disabled: step === flow.length,
        label: step === flow.length - 1 ? '完成' : '下一步'
      })
      errorButton.update({
        disabled: step === flow.length,
        label: error ? '恢复进行状态' : '查看错误状态'
      })
    }
    demo('steps').append(steps.element)
    demo('steps-buttons').append(prevButton.element, nextButton.element)
    demo('steps-vertical').append(
      window.MyUI.create('Steps', {
        value: 1,
        vertical: true,
        label: '办理过程',
        options: [
          { label: '资料已收到', description: '我们已经为你保存本次填写的内容。' },
          { label: '正在审核', description: '处理完成后，会第一时间通知你。' },
          { label: '开始使用', description: '一切准备就绪，继续探索。' }
        ]
      }).element
    )
    demo('steps-error').append(errorButton.element)
    paintSteps()
  }

  /** pages/home/popup：侧边抽屉、自定义选择面板、提示与危险确认。 */
  function buildPopupExamples() {
    var placement = 'right'
    demo('drawer').append(
      window.MyUI.create('Segmented', {
        label: '抽屉方向',
        value: placement,
        options: [
          { value: 'left', label: '左侧' },
          { value: 'right', label: '右侧' },
          { value: 'top', label: '顶部' },
          { value: 'bottom', label: '底部' }
        ],
        onChange: function (value) {
          placement = value
        }
      }).element
    )
    demo('drawer-button').append(
      window.MyUI.create(
        'Button',
        {
          variant: 'outline',
          onClick: function () {
            openDrawer(placement)
          }
        },
        { slots: { default: [textNode('打开抽屉'), iconEl('arrow-right')] } }
      ).element
    )

    // 自定义选择面板
    var position = 'trailing'
    var selectedClock = 'both'
    var selectedMany = ['documents', 'images']
    var clockOptions = [
      { value: 'lock', label: '锁屏' },
      { value: 'widget', label: '时钟桌面插件' },
      { value: 'both', label: '锁屏与时钟桌面插件' }
    ]
    var syncOptions = [
      { value: 'documents', label: '同步文档', description: '多设备持续更新' },
      { value: 'images', label: '同步图片', description: '保留珍贵的视觉记录' },
      { value: 'favorites', label: '同步收藏', description: '随时找回喜欢的内容' }
    ]
    var nameLabel = demo('selection-sheet-name')
    var countLabel = demo('selection-sheet-count')
    var paintSelection = function () {
      var hit = clockOptions.filter(function (item) {
        return item.value === selectedClock
      })[0]
      nameLabel.textContent = hit ? hit.label : '请选择'
      countLabel.textContent = String(selectedMany.length)
    }
    paintSelection()
    demo('selection-sheet').append(
      window.MyUI.create('Segmented', {
        label: '选择框位置',
        value: position,
        options: [
          { value: 'leading', label: '前置' },
          { value: 'trailing', label: '后置' }
        ],
        onChange: function (value) {
          position = value
        }
      }).element
    )
    demo('selection-sheet-actions').append(
      buttonEl('单选面板', {
        variant: 'outline',
        onClick: function () {
          var panel = window.MyUI.popup.showSheet({
            title: '在以下位置显示双时钟',
            content: function (context) {
              return selectionPanel({
                mode: 'single',
                position: position,
                options: clockOptions,
                label: '双时钟显示位置',
                value: selectedClock,
                onChange: function (value) {
                  selectedClock = value
                  paintSelection()
                },
                onSelect: function (item) {
                  selectedClock = item.value
                  paintSelection()
                  context.close(item)
                }
              })
            }
          })
          panel.closed.then(function (item) {
            if (item) notify('已选择：' + item.label)
          })
        }
      }),
      buttonEl('多选面板', {
        variant: 'outline',
        onClick: function () {
          window.MyUI.popup.showSheet({
            title: '选择需要同步的内容',
            confirmText: '完成',
            content: function () {
              return selectionPanel({
                mode: 'multiple',
                position: position,
                options: syncOptions,
                label: '同步内容',
                value: selectedMany,
                onChange: function (value) {
                  selectedMany = value
                  paintSelection()
                }
              })
            },
            onConfirm: function () {
              notify('已选择 ' + selectedMany.length + ' 项同步内容')
            }
          })
        }
      })
    )

    demo('popup-alert').append(
      buttonEl('单按钮提示', {
        variant: 'outline',
        onClick: function () {
          void window.MyUI.popup.showAlert({
            title: '同步已完成',
            message: '你的文档和图片都已同步，可以安心继续浏览。',
            cancelText: false,
            confirmText: '知道了'
          })
        }
      }),
      buttonEl('双按钮确认', {
        variant: 'outline',
        onClick: function () {
          window.MyUI.popup
            .showAlert({
              title: '移除本地缓存？',
              message: '这是一项交互示例。确认后只展示操作结果，你的个人数据不会受影响。',
              danger: true,
              confirmText: '移除'
            })
            .then(function (confirmed) {
              if (confirmed) notify('已确认移除（示例）')
            })
        }
      })
    )
  }

  /** 抽屉内容（对照 DrawerExample.vue）。 */
  function openDrawer(placement) {
    var draft = { name: '小蓝同学', notes: '让每个界面都简单一点。', reminders: true }
    var host = el('div', 'drawer-example')
    var intro = el('p')
    intro.textContent = '在抽屉里编辑，返回时仍停留在当前页面。'
    var form = el('form')
    var nameInput = window.MyUI.create('Input', {
      label: '显示名称',
      value: draft.name,
      clearable: true,
      onChange: function (value) {
        draft.name = value
      }
    })
    var notesInput = window.MyUI.create('Textarea', {
      label: '个人简介',
      value: draft.notes,
      rows: 4,
      maxlength: 120,
      onChange: function (value) {
        draft.notes = value
      }
    })
    var reminderSwitch = window.MyUI.create('Switch', {
      label: '接收消息提醒',
      value: draft.reminders,
      onChange: function (value) {
        draft.reminders = value
      }
    })
    var switchField = window.MyUI.create('FormField', { label: '消息提醒' }, {
      slots: { default: reminderSwitch.element }
    })
    var actions = el('div', 'drawer-form-actions')
    var panel
    actions.append(
      window.MyUI.create('Button', {
        label: '保存资料',
        type: 'submit',
        onClick: function (event) {
          event.preventDefault()
          window.MyUI.popup
            .showAlert({
              title: '保存这份资料？',
              message: '确认后关闭抽屉，并保留本次填写的显示名称。',
              center: true,
              confirmText: '保存'
            })
            .then(function (confirmed) {
              if (confirmed && panel) panel.close(draft.name)
            })
        }
      }).element,
      buttonEl('取消编辑', {
        variant: 'text',
        onClick: function () {
          if (panel) panel.close()
        }
      })
    )
    form.append(nameInput.element, notesInput.element, switchField.element, actions)
    host.append(intro, form)
    panel = window.MyUI.popup.showDrawer({
      title: '编辑个人资料',
      placement: placement,
      content: function () {
        return host
      }
    })
    panel.closed.then(function (result) {
      if (result !== undefined) notify('资料已保存：' + result)
    })
  }

  /** 选择面板内容（对照 SelectionPanel.vue）。 */
  function selectionPanel(config) {
    var group = window.MyUI.create(
      'CellGroup',
      {
        label: config.label,
        mode: config.mode,
        options: config.options,
        value: config.value,
        onChange: function (value) {
          config.onChange(value)
        },
        onSelect: function (item) {
          if (config.onSelect) config.onSelect(item)
        }
      },
      {
        slots: {
          item: function (context) {
            var row = window.MyUI.create(
              'ListRow',
              {
                title: context.item.label,
                description: context.item.description,
                disabled: context.row.disabled,
                onClick: context.row.onClick,
                onKeydown: context.row.onKeydown
              },
              {}
            )
            row.element.classList.add('selection-row')
            row.element.classList.toggle('selected', !!context.selected)
            if (context.row.role) row.element.setAttribute('role', context.row.role)
            row.element.setAttribute(
              'data-cell-value',
              String(context.row['data-cell-value'] ?? context.item.value)
            )
            var mark = el('span', 'choice-mark')
            mark.classList.add(config.mode)
            mark.classList.toggle('checked', !!context.selected)
            mark.setAttribute('aria-hidden', 'true')
            if (config.mode === 'multiple' && context.selected) mark.append(iconEl('check'))
            if (config.position === 'leading') {
              var leading = el('span')
              leading.append(mark)
              row.element.prepend(leading)
            } else {
              var trailing = el('span')
              trailing.append(mark)
              row.element.append(trailing)
            }
            return row.element
          }
        }
      }
    )
    group.element.classList.add('selection-panel')
    return group.element
  }

  /** pages/home/touch-gestures：跟手滑动切页 + 滑动抽屉/面板。 */
  function buildTouchExample() {
    var pages = [
      { value: 'overview', label: '概览' },
      { value: 'files', label: '文件' },
      { value: 'activity', label: '动态' }
    ]
    var content = {
      overview: {
        title: '把日常，整理得更轻松',
        description: '在内容区域左右滑动，下一页会跟随手指进入。',
        icon: 'grid',
        items: ['今天的灵感', '最近的收藏']
      },
      files: {
        title: '内容都在手边',
        description: '缓慢拖动再松手，试试切页与回弹的距离感。',
        icon: 'inbox',
        items: ['设计规范', '旅行计划']
      },
      activity: {
        title: '每一步都有回应',
        description: '竖向仍可滚动页面，按钮也可以正常点击。',
        icon: 'clock',
        items: ['小蓝更新了文档', '团队完成了同步']
      }
    }
    var tabs = window.MyUI.create(
      'Tabs',
      {
        value: 'overview',
        options: pages,
        label: '触摸切页示例'
      },
      {
        slots: {
          default: function (context) {
            var page = content[context.value]
            if (!page) return document.createComment('')
            var wrap = el('div', 'touch-page')
            var iconWrap = el('span', 'touch-page-icon')
            iconWrap.append(iconEl(page.icon))
            var copy = document.createElement('div')
            var title = el('h4')
            title.textContent = page.title
            var text = el('p')
            text.textContent = page.description
            copy.append(title, text)
            wrap.append(iconWrap, copy)
            wrap.append(
              window.MyUI.create('CellGroup', {}, {
                slots: {
                  default: page.items.map(function (label) {
                    return window.MyUI.create('ListRow', {
                      title: label,
                      onClick: function () {
                        notify('已打开：' + label)
                      }
                    }).element
                  })
                }
              }).element
            )
            return wrap
          }
        }
      }
    )
    demo('touch').append(tabs.element)
    demo('touch-actions').append(
      window.MyUI.create(
        'Button',
        {
          variant: 'outline',
          onClick: function () {
            openTouchPanel('drawer')
          }
        },
        { slots: { default: [textNode('滑动抽屉'), iconEl('arrow-right')] } }
      ).element,
      buttonEl('下拉面板', {
        variant: 'outline',
        onClick: function () {
          openTouchPanel('sheet')
        }
      })
    )
  }

  /** 触摸示例里的抽屉/面板内容：说明段 + 14 条记录。 */
  function openTouchPanel(kind) {
    var host = el('div')
    var note = el('p', 'touch-panel-note')
    note.textContent = '从标题区域拖动关闭。正文可以正常滚动，到达边缘后再向外拖动。'
    var rows = []
    for (var index = 0; index < 14; index += 1) {
      ;(function (position) {
        rows.push(
          window.MyUI.create('ListRow', {
            title: '灵感记录 ' + String(position).padStart(2, '0'),
            description: '保留值得回看的日常片段',
            onClick: function () {
              if (panel) panel.close('灵感记录 ' + position)
            }
          }).element
        )
      })(index + 1)
    }
    host.append(
      note,
      window.MyUI.create('CellGroup', { label: '工作区内容' }, { slots: { default: rows } }).element
    )
    var panel =
      kind === 'drawer'
        ? window.MyUI.popup.showDrawer({
            title: '我的工作空间',
            content: function () {
              return host
            },
            style: { '--drawer-padding': '16px 0', '--list-padding-inline': '24px' }
          })
        : window.MyUI.popup.showSheet({
            title: '最近的灵感',
            cancelText: '关闭',
            content: function () {
              return host
            }
          })
    panel.closed.then(function (result) {
      if (result) notify('已打开：' + result)
    })
  }

  /** pages/home/menu：基础、右键、单选多选、级联菜单。 */
  function buildMenuExamples() {
    var selected = function (item) {
      notify('已选择：' + item.label)
    }
    var actions = [
      { value: 'open', label: '打开笔记', icon: 'image' },
      { value: 'favorite', label: '加入收藏', icon: 'heart' },
      { value: 'copy', label: '复制到分组', icon: 'copy' },
      { value: 'share', label: '分享笔记', icon: 'share', disabled: true }
    ]

    // 基础菜单：整块按压区域就是触发器。
    var pressArea = document.createElement('button')
    pressArea.type = 'button'
    pressArea.className = 'press-area'
    pressArea.append(iconEl('image'))
    var pressTitle = el('strong')
    pressTitle.textContent = '周末的好风景'
    var pressCaption = el('span')
    pressCaption.textContent = '点击卡片的任意位置'
    pressArea.append(pressTitle, pressCaption)
    var basicMenu = window.MyUI.create(
      'Menu',
      { options: actions, label: '笔记操作', onSelect: selected },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(pressArea, context.trigger)
            return pressArea
          }
        }
      }
    )
    demo('menu-basic').append(basicMenu.element)

    // 右键菜单：右键区域 + 更多按钮共用同一组选项。
    var contextHost = demo('menu-context')
    ;[
      { title: '灵感笔记', caption: '右键打开，或使用更多按钮', icon: 'inbox', list: actions, label: '灵感笔记，右键打开操作菜单', moreLabel: '更多笔记操作', menuLabel: '右键笔记操作' },
      { title: '周末清单', caption: '右键此处，切换当前菜单', icon: 'check', list: [
        { value: 'open', label: '查看清单', icon: 'image' },
        { value: 'done', label: '标记完成', icon: 'check' },
        { value: 'copy', label: '复制清单', icon: 'copy' }
      ], label: '周末清单，右键打开操作菜单', moreLabel: '更多清单操作', menuLabel: '右键清单操作' }
    ].forEach(function (spec) {
      var area = el('div', 'context-area')
      area.setAttribute('aria-label', spec.label)
      var textWrap = document.createElement('div')
      var title = el('strong')
      title.textContent = spec.title
      var caption = el('span')
      caption.textContent = spec.caption
      textWrap.append(title, caption)
      area.append(iconEl(spec.icon), textWrap)
      var moreButton = window.MyUI.create(
        'Button',
        { variant: 'bare', icon: 'grid' },
        { attributes: { 'aria-label': spec.moreLabel } }
      )
      var moreMenu = window.MyUI.create(
        'Menu',
        { options: spec.list, label: spec.moreLabel, onSelect: selected },
        {
          slots: {
            default: function (context) {
              applyMenuTrigger(moreButton.element, context.trigger)
              return moreButton.element
            }
          }
        }
      )
      area.append(moreMenu.element)
      var areaMenu = window.MyUI.create(
        'Menu',
        { options: spec.list, label: spec.menuLabel, trigger: 'contextmenu', onSelect: selected },
        {
          slots: {
            default: function (context) {
              applyMenuTrigger(area, context.trigger)
              return area
            }
          }
        }
      )
      contextHost.append(areaMenu.element)
    })

    // 单选与多选菜单
    var category = '日常灵感'
    var categories = [
      '日常灵感', '城市散步', '旅行计划', '生活记录', '设计收藏', '周末清单',
      '阅读笔记', '想去的地方', '摄影练习', '声音日记', '咖啡时光', '食物与风景',
      '运动打卡', '手作收藏', '今年的愿望', '待整理'
    ].map(function (value) {
      return { value: value, label: value }
    })
    var syncOptions = [
      { value: 'documents', label: '同步文档' },
      { value: 'images', label: '同步图片' },
      { value: 'favorites', label: '同步收藏' }
    ]
    var sync = ['documents']
    // 按钮文字用常驻文本节点更新，避免整体重写按钮内部结构。
    var categoryText = textNode(category)
    var syncText = textNode('同步内容 · 1 项')
    var categoryButton = window.MyUI.create(
      'Button',
      { variant: 'outline' },
      { slots: { default: [categoryText, iconEl('chevrons-up-down')] } }
    )
    var syncButton = window.MyUI.create(
      'Button',
      { variant: 'outline' },
      { slots: { default: [syncText, iconEl('sliders')] } }
    )
    var paintChoiceMenus = function () {
      categoryText.data = category
      syncText.data = '同步内容 · ' + sync.length + ' 项'
    }
    var categoryMenu = window.MyUI.create(
      'Menu',
      {
        options: categories,
        mode: 'single',
        label: '笔记分类',
        value: category,
        onChange: function (value) {
          category = value
          paintChoiceMenus()
        },
        onSelect: selected
      },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(categoryButton.element, context.trigger)
            return categoryButton.element
          }
        }
      }
    )
    var syncMenu = window.MyUI.create(
      'Menu',
      {
        options: syncOptions,
        mode: 'multiple',
        label: '快捷同步',
        value: sync,
        onChange: function (value) {
          sync = value
          paintChoiceMenus()
        }
      },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(syncButton.element, context.trigger)
            return syncButton.element
          }
        }
      }
    )
    demo('menu-selection').append(categoryMenu.element, syncMenu.element)

    // 级联菜单
    var cascadeButton = window.MyUI.create(
      'Button',
      { variant: 'outline' },
      { slots: { default: [iconEl('grid'), textNode('笔记操作'), iconEl('chevrons-up-down')] } }
    )
    var cascadeMenu = window.MyUI.create(
      'Menu',
      {
        label: '级联笔记操作',
        onSelect: selected,
        options: [
          { value: 'view', label: '查看笔记', icon: 'image' },
          {
            value: 'move',
            label: '移动到',
            description: '选择笔记的目标分类',
            icon: 'inbox',
            children: [
              { value: 'inspiration', label: '日常灵感', description: '收集每一个好点子' },
              { value: 'design', label: '设计收藏' },
              { value: 'travel', label: '旅行计划' },
              { value: 'archive', label: '归档', disabled: true }
            ]
          },
          {
            value: 'export',
            label: '导出为',
            icon: 'share',
            children: [
              { value: 'pdf', label: 'PDF 文档' },
              { value: 'markdown', label: 'Markdown' },
              { value: 'text', label: '纯文本' }
            ]
          },
          { value: 'duplicate', label: '创建副本', icon: 'copy' }
        ]
      },
      {
        slots: {
          default: function (context) {
            applyMenuTrigger(cascadeButton.element, context.trigger)
            return cascadeButton.element
          }
        }
      }
    )
    demo('menu-cascade').append(cascadeMenu.element)
  }

  /** native-html 示例：链接文字与尾随箭头。 */
  function renderNativeHtmlLink() {
    var link = demo('native-html')
    link.append(iconEl('arrow-right'))
  }

  /** 05 完整示例：scenarios（含 ProfileFormExample）与 native-html。 */
  function buildScenarios() {
    buildProfileFormExample()
    buildFeedExample()
    buildTabsExample()
    buildInputStatesExample()
    renderNativeHtmlLink()
  }

  /** 把 FormField 提供的 control 绑定贴到目标元素上（对应 Vue 的 v-bind="control"）。 */
  function applyControlAttributes(element, control) {
    if (!control) return
    Object.keys(control).forEach(function (key) {
      var value = control[key]
      if (value === undefined || value === null || value === false) {
        element.removeAttribute(key)
        return
      }
      element.setAttribute(key, value === true ? '' : String(value))
    })
  }

  /** 资料编辑示例的业务校验（与 Vue 版 profile.ts 规则一致）。 */
  function validateProfile(profile) {
    var errors = {}
    var name = String(profile.name || '').trim()
    var email = String(profile.email || '').trim()
    if (!name) errors.name = '请填写显示名称'
    else if (Array.from(name).length < 2) errors.name = '显示名称至少需要 2 个字符'
    if (!email) errors.email = '请填写联系邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '请输入有效的邮箱地址'
    if (!profile.features.length) errors.features = '请至少选择一项内容偏好'
    return errors
  }

  /** ProfileFormExample.vue：资料编辑与校验。 */
  function buildProfileFormExample() {
    var layoutTexts = {
      vertical: '标签在上，逐项填写',
      horizontal: '标签在左，控件整齐对齐',
      inline: '多个表单项同行排列，空间不足时换行'
    }
    var initialValues = function () {
      return {
        name: '小蓝同学',
        email: '',
        bio: '',
        notifications: true,
        plan: 'standard',
        features: ['cloud']
      }
    }
    var profile = initialValues()
    var attempted = false
    var saving = false
    var savedCount = 0
    var layout = 'vertical'
    var layoutNote = pick('[data-demo="profile-form-note"]')
    var message = el('p', 'form-message')
    message.setAttribute('role', 'status')

    var nameInput = window.MyUI.create('Input', {
      label: '显示名称',
      value: profile.name,
      name: 'displayName',
      required: true,
      clearable: true,
      maxlength: 24,
      autocomplete: 'nickname',
      placeholder: '至少 2 个字符',
      onChange: function (value) {
        profile.name = value
      }
    })
    var emailInput = window.MyUI.create('Input', {
      label: '联系邮箱',
      value: profile.email,
      name: 'email',
      type: 'email',
      required: true,
      clearable: true,
      autocomplete: 'email',
      placeholder: 'name@example.com',
      onChange: function (value) {
        profile.email = value
      }
    })
    var switchCaption = el('span')
    var notifications = window.MyUI.create('Switch', {
      label: '接收更新',
      value: profile.notifications,
      onChange: function (value) {
        profile.notifications = value
        paintSwitch()
      }
    })
    var switchSetting = el('div', 'switch-setting')
    switchSetting.append(notifications.element, switchCaption)
    var switchField = window.MyUI.create(
      'FormField',
      { label: '接收更新', hint: '有新内容时通知你' },
      { slots: { default: switchSetting } }
    )
    var planGroup = window.MyUI.create('RadioGroup', {
      label: '体验方案',
      value: profile.plan,
      options: [
        { value: 'standard', label: '标准体验' },
        { value: 'advanced', label: '进阶体验' },
        { value: 'professional', label: '专业体验' }
      ],
      inline: true,
      onChange: function (value) {
        profile.plan = value
      }
    })
    planGroup.element.classList.add('form-options')
    var planField = window.MyUI.create(
      'FormField',
      { label: '体验方案', group: true },
      { slots: { default: planGroup.element } }
    )
    var featureGroup = window.MyUI.create('CheckboxGroup', {
      label: '内容偏好',
      value: profile.features,
      options: [
        { value: 'cloud', label: '云端同步' },
        { value: 'notes', label: '灵感笔记' },
        { value: 'gallery', label: '图片收藏' }
      ],
      inline: true,
      onChange: function (value) {
        profile.features = value
      }
    })
    featureGroup.element.classList.add('form-options')
    var featureField = window.MyUI.create(
      'FormField',
      { label: '内容偏好', group: true, required: true, hint: '可以同时选择多项内容' },
      { slots: { default: featureGroup.element } }
    )
    var bioInput = window.MyUI.create('Textarea', {
      label: '个人简介',
      value: profile.bio,
      name: 'bio',
      maxlength: 120,
      placeholder: '介绍一下你的兴趣与日常…',
      hint: '让别人更容易认识你',
      onChange: function (value) {
        profile.bio = value
      }
    })
    var savingButton = window.MyUI.create('Button', {
      label: '保存资料',
      type: 'submit',
      onClick: function (event) {
        event.preventDefault()
        submitProfile()
      }
    })
    var resetButton = window.MyUI.create('Button', {
      label: '重置表单',
      variant: 'outline',
      type: 'button',
      onClick: function () {
        resetProfile()
      }
    })
    var formActions = el('div', 'form-actions')
    var localNote = el('span')
    localNote.textContent = '仅在本页保存'
    formActions.append(savingButton.element, resetButton.element, localNote)

    var form = window.MyUI.create('Form', { layout: 'vertical' }, {
      attributes: { class: 'profile-form', 'aria-label': '资料编辑示例', novalidate: true },
      slots: {
        default: [
          nameInput.element,
          emailInput.element,
          switchField.element,
          planField.element,
          featureField.element,
          bioInput.element,
          formActions,
          message
        ]
      }
    })
    form.element.addEventListener('submit', function (event) {
      event.preventDefault()
      submitProfile()
    })
    demo('profile-form').append(form.element)

    var paintSwitch = function () {
      switchCaption.textContent = profile.notifications ? '已开启' : '已关闭'
    }
    var paintLayout = function () {
      layoutNote.textContent = layoutTexts[layout]
      form.update({ layout: layout })
    }
    var paintSaving = function () {
      savingButton.update({ loading: saving })
      nameInput.update({ readonly: saving })
      emailInput.update({ readonly: saving })
      bioInput.update({ readonly: saving })
      notifications.update({ disabled: saving })
      planGroup.update({ disabled: saving })
      featureGroup.update({ disabled: saving })
    }
    var paintErrors = function () {
      var errors = attempted ? validateProfile(profile) : {}
      nameInput.update({ error: errors.name })
      emailInput.update({ error: errors.email })
      featureField.update({ error: errors.features })
      return errors
    }
    var submitProfile = function () {
      if (saving) return
      attempted = true
      message.textContent = ''
      if (Object.keys(paintErrors()).length) {
        var invalid = form.element.querySelector('[aria-invalid="true"]')
        if (invalid) {
          invalid.scrollIntoView({ block: 'center' })
          invalid.focus({ preventScroll: true })
        }
        return
      }
      saving = true
      paintSaving()
      savingButton.timer = setTimeout(function () {
        saving = false
        savedCount += 1
        paintSaving()
        message.textContent =
          profile.name.trim() + '，资料与偏好已在本页保存 · 第 ' + savedCount + ' 次'
        notify('资料与偏好已在本页保存')
      }, 900)
    }
    var resetProfile = function () {
      clearTimeout(savingButton.timer)
      profile = initialValues()
      attempted = false
      saving = false
      savedCount = 0
      nameInput.update({ value: profile.name, error: undefined })
      emailInput.update({ value: profile.email, error: undefined })
      bioInput.update({ value: profile.bio })
      notifications.update({ value: profile.notifications })
      planGroup.update({ value: profile.plan })
      featureGroup.update({ value: profile.features })
      featureField.update({ error: undefined })
      paintSaving()
      paintSwitch()
      message.textContent = '已恢复初始值'
    }

    demo('profile-form-layout').append(
      window.MyUI.create('Segmented', {
        label: '表单布局',
        value: layout,
        options: [
          { value: 'vertical', label: '垂直布局' },
          { value: 'horizontal', label: '水平布局' },
          { value: 'inline', label: '行内布局' }
        ],
        onChange: function (value) {
          layout = value
          paintLayout()
        }
      }).element
    )
    paintSwitch()
    paintLayout()
    paintSaving()
  }

  /** pages/home/scenarios：内容加载与失败重试。 */
  function buildFeedExample() {
    var records = [
      { title: '午后灵感', description: '给日常留一点新鲜感', value: '3 条笔记', icon: 'spark' },
      { title: '城市散步', description: '收集沿途的好风景', value: '12 张图片', icon: 'image' },
      { title: '旅行计划', description: '把下一次出发安排好', value: '待整理', icon: 'briefcase' }
    ]
    var loading = false
    var error = false
    var refreshed = 0
    var timer
    var foot = pick('[data-demo="loading-states-foot"]')
    var body = demo('loading-states')

    var readout = el('div', 'load-readout')
    readout.append(
      window.MyUI.create('Loading', { size: 'small' }, { slots: { default: '正在加载最近的内容' } })
        .element
    )
    readout.hidden = true

    var listGroup = window.MyUI.create('CellGroup', { title: '最近更新' }, {
      slots: {
        default: records.map(function (item) {
          return window.MyUI.create(
            'ListRow',
            {
              title: item.title,
              description: item.description,
              valueText: item.value,
              onClick: function () {
                notify('已打开：' + item.title)
              }
            },
            { slots: { leading: iconEl(item.icon) } }
          ).element
        })
      }
    })
    var emptyState = window.MyUI.create(
      'Empty',
      { state: 'error', description: '再试一次，继续查看最近的内容' },
      {
        slots: {
          default: buttonEl('重试加载', {
            onClick: function () {
              reloadFeed()
            }
          })
        }
      }
    )
    emptyState.element.hidden = true
    var skeletonContent = el('div')
    skeletonContent.append(emptyState.element, listGroup.element)
    var skeleton = window.MyUI.create(
      'Skeleton',
      { loading: false, rows: 4, avatar: true, label: '最近内容加载中' },
      { slots: { default: skeletonContent } }
    )

    var reloadButton = window.MyUI.create('Button', {
      label: '重新加载',
      variant: 'outline',
      onClick: function () {
        reloadFeed()
      }
    })
    var errorButton = window.MyUI.create('Button', {
      label: '查看失败状态',
      variant: 'text',
      onClick: function () {
        if (!loading) {
          error = true
          paintFeed()
        }
      }
    })
    demo('loading-states-toolbar').append(reloadButton.element, errorButton.element)
    body.append(readout, skeleton.element)

    var paintFeed = function () {
      readout.hidden = !loading
      skeleton.update({ loading: loading })
      listGroup.element.hidden = error
      emptyState.element.hidden = !error
      reloadButton.update({ loading: loading })
      errorButton.update({ disabled: loading })
      foot.textContent = loading
        ? '请稍等，内容马上回来'
        : error
          ? '重试后可以恢复内容'
          : refreshed
            ? '内容已更新 · 第 ' + refreshed + ' 次'
            : '有内容，也为等待和失败留好位置'
    }
    var reloadFeed = function () {
      if (loading) return
      clearTimeout(timer)
      reloadButton.element.focus({ preventScroll: true })
      loading = true
      error = false
      paintFeed()
      timer = setTimeout(function () {
        loading = false
        refreshed += 1
        paintFeed()
      }, 850)
    }
    paintFeed()
  }

  /** pages/home/scenarios：标签页与内容分组。 */
  function buildTabsExample() {
    var records = [
      { title: '午后灵感', description: '给日常留一点新鲜感', icon: 'spark' },
      { title: '城市散步', description: '收集沿途的好风景', icon: 'image' }
    ]
    var favorite = false
    var updates = true
    var compact = false

    var recentPanel = window.MyUI.create('CellGroup', { title: '最近浏览' }, {
      slots: {
        default: records.map(function (item) {
          return window.MyUI.create(
            'ListRow',
            {
              title: item.title,
              description: item.description,
              onClick: function () {
                notify('继续浏览：' + item.title)
              }
            },
            { slots: { leading: iconEl(item.icon) } }
          ).element
        })
      }
    }).element

    var favoriteEmpty = window.MyUI.create(
      'Empty',
      {
        title: '还没有收藏',
        description: '留下一条喜欢的内容，下次更容易找到。',
        icon: 'heart'
      },
      {
        slots: {
          default: buttonEl('添加一条收藏', {
            variant: 'outline',
            onClick: function () {
              favorite = true
              paintFavorite()
            }
          })
        }
      }
    ).element
    var favoriteList = window.MyUI.create('CellGroup', { title: '我的收藏' }, {
      slots: {
        default: [
          window.MyUI.create(
            'ListRow',
            {
              title: '午后灵感',
              description: '已经为你留在这里',
              onClick: function () {
                notify('查看收藏：午后灵感')
              }
            },
            {
              slots: {
                leading: iconEl('heart'),
                trailing: window.MyUI.create('Tag', { tone: 'green' }, {
                  slots: { default: '已收藏' }
                }).element
              }
            }
          ).element
        ]
      }
    }).element
    var clearFavorite = buttonEl('清空示例收藏', {
      variant: 'text',
      onClick: function () {
        favorite = false
        paintFavorite()
      }
    })
    clearFavorite.classList.add('clear-favorite')
    var favoritePanel = el('div')
    favoritePanel.append(favoriteEmpty, favoriteList, clearFavorite)

    var preferencePanel = window.MyUI.create('CellGroup', { title: '浏览偏好' }, {
      slots: {
        default: [
          window.MyUI.create(
            'ListRow',
            {
              title: '接收更新',
              description: '不错过新内容',
              toggle: true,
              value: updates,
              onChange: function (value) {
                updates = value
              }
            },
            { slots: { leading: iconEl('bell') } }
          ).element,
          window.MyUI.create(
            'ListRow',
            {
              title: '紧凑显示',
              description: '在同一屏里看到更多',
              toggle: true,
              value: compact,
              onChange: function (value) {
                compact = value
              }
            },
            { slots: { leading: iconEl('layer') } }
          ).element
        ]
      }
    }).element

    var paintFavorite = function () {
      favoriteEmpty.hidden = favorite
      favoriteList.hidden = !favorite
      clearFavorite.hidden = !favorite
    }
    paintFavorite()

    var tabs = window.MyUI.create(
      'Tabs',
      {
        value: 'recent',
        label: '内容视图',
        options: [
          { value: 'recent', label: '最近' },
          { value: 'favorites', label: '收藏' },
          { value: 'archive', label: '归档', disabled: true },
          { value: 'preferences', label: '偏好' }
        ]
      },
      {
        slots: {
          default: function (context) {
            var page = el('div', 'tab-content')
            if (context.value === 'recent') page.append(recentPanel)
            else if (context.value === 'favorites') page.append(favoritePanel)
            else if (context.value === 'preferences') page.append(preferencePanel)
            return page
          }
        }
      }
    )
    demo('tabs-content').append(tabs.element)
  }

  /** pages/home/scenarios：输入状态与装饰。 */
  function buildInputStatesExample() {
    var host = demo('input-states')
    host.append(
      window.MyUI.create('Input', {
        label: '账号编号',
        value: 'CL-001024',
        readonly: true,
        clearable: true,
        autocomplete: 'username',
        hint: '可以聚焦与复制，不能修改'
      }).element
    )
    host.append(
      window.MyUI.create('Input', {
        label: '安全输入',
        value: 'blue-demo-2026',
        type: 'password',
        passwordToggle: true,
        autocomplete: 'new-password',
        clearable: true
      }).element
    )
    host.append(
      window.MyUI.create('Input', {
        label: '密码默认隐藏',
        value: 'hidden-demo',
        type: 'password',
        autocomplete: 'new-password',
        hint: '点击输入区域只聚焦，显隐按钮按需开启'
      }).element
    )
    host.append(
      window.MyUI.create('Input', {
        label: '管理设置',
        value: '由团队统一管理',
        disabled: true,
        hint: '当前不可操作'
      }).element
    )
    var outlined = window.MyUI.create('Input', {
      label: '描边输入',
      value: '清晰的边界',
      icon: 'user',
      clearable: true
    })
    outlined.element.classList.add('outlined-input')
    host.append(outlined.element)
    var borderless = window.MyUI.create('Input', {
      label: '无边框输入',
      value: '自由的外观',
      clearable: true
    })
    borderless.element.classList.add('borderless-input')
    host.append(borderless.element)
    var amountSuffix = el('span')
    amountSuffix.textContent = '元'
    host.append(
      window.MyUI.create(
        'Input',
        { label: '金额', value: '120', inputmode: 'decimal' },
        { slots: { suffix: amountSuffix } }
      ).element
    )
  }

  // ── 启动 ──
  function start() {
    // 同一个任务内装配控件，避免浏览器先绘制尚未填充的示例卡片。
    document.getElementById('showcase-layout').removeAttribute('data-loading')
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
    var anchor = location.hash.match(/^#showcase-([\w-]+)$/)
    if (anchor) scrollToSection(anchor[1], 'instant')
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
