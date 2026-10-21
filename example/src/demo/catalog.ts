import type { IconName } from '@my-ui/vue'

/** 目录和独立示例共用标题及地址，用法说明留在示例内。 */
export interface DemoExample {
  id: string
  title: string
  icon: IconName
  anchors?: string[]
  /** 独立全屏示例使用自己的路由，其余示例由目录插槽承载。 */
  path?: string
}

/** 组件目录按用途分组，旧链接仍可定位到相应示例。 */
export const demoGroups: { title: string; items: DemoExample[] }[] = [
  {
    title: '开始使用',
    items: [
      { id: 'quick-start', title: '快速开始', icon: 'spark', path: '/guide/quick-start' },
      { id: 'native-integration', title: '集成原生', icon: 'layer', path: '/guide/native' }
    ]
  },
  {
    title: '基础展示',
    items: [
      { id: 'button', title: 'Button 按钮', icon: 'check' },
      { id: 'tag', title: 'Tag 标签', icon: 'heart' },
      { id: 'card', title: 'Card 卡片', icon: 'layer', anchors: ['surfaces'] },
      { id: 'identity', title: 'Avatar / Badge', icon: 'user', anchors: ['avatar-badge'] },
      { id: 'image', title: 'Image 图片', icon: 'image' },
      { id: 'shadows', title: 'Shadow 阴影', icon: 'layer' }
    ]
  },
  {
    title: '输入与选择',
    items: [
      { id: 'input', title: 'Input / Select', icon: 'search', anchors: ['controls'] },
      { id: 'switch', title: 'Switch 开关', icon: 'sliders' },
      { id: 'slider', title: 'Segmented / Slider', icon: 'sliders' },
      { id: 'selection', title: 'Choices / Stepper', icon: 'check' },
      { id: 'combobox', title: 'Combobox 搜索选择', icon: 'search' },
      { id: 'picker', title: 'Picker 滚轮选择', icon: 'chevrons-up-down' },
      {
        id: 'date-time-picker',
        title: 'Date / Time / Calendar',
        icon: 'clock',
        anchors: ['calendar']
      },
      { id: 'upload', title: 'Upload 上传', icon: 'share' }
    ]
  },
  {
    title: '导航与容器',
    items: [
      { id: 'app-bar', title: 'AppBar 顶部导航', icon: 'arrow-right' },
      { id: 'navigation', title: 'Navigation 底部导航', icon: 'home' },
      { id: 'list', title: 'List 列表', icon: 'inbox' },
      { id: 'selection-collapse', title: 'Radio / Checkbox / Collapse', icon: 'grid' }
    ]
  },
  {
    title: '反馈与交互',
    items: [
      { id: 'feedback', title: 'Toast / Dialog / Sheet', icon: 'message' },
      {
        id: 'primitives',
        title: 'Tooltip / Divider / Progress',
        icon: 'spark',
        anchors: ['playback-progress', 'slider-options']
      },
      { id: 'notice-steps', title: 'Notice / Steps', icon: 'bell', anchors: ['notice', 'steps'] },
      { id: 'popup', title: 'Popup / Drawer', icon: 'layer' },
      { id: 'menu', title: 'Menu 菜单', icon: 'grid' },
      { id: 'touch-gestures', title: 'Touch 触摸滑动', icon: 'sliders' }
    ]
  },
  {
    title: '完整示例',
    items: [
      { id: 'showcase', title: '完整交互示例', icon: 'layer', path: '/showcase' },
      { id: 'scenarios', title: '表单与内容场景', icon: 'briefcase' },
      { id: 'native-html', title: '原生 HTML 示例', icon: 'grid' }
    ]
  }
]

/** 原生组件及页面能力统一放在第二个导航目录。 */
export const nativeDemoGroups: { title: string; items: DemoExample[] }[] = [
  {
    title: '原生组件',
    items: [
      { id: 'native-app', title: 'App 应用容器', icon: 'layer' },
      {
        id: 'native-app-bar',
        title: 'AppBar 顶部导航',
        icon: 'arrow-right',
        path: '/native/app-bar'
      },
      {
        id: 'native-tabbar',
        title: 'Tabbar 底部导航',
        icon: 'home',
        path: '/native/tabbar'
      },
      { id: 'native-tabs', title: 'Tabs 页面切换', icon: 'grid', path: '/native/tabs' },
      { id: 'page-refresh', title: 'Page 页面与下拉刷新', icon: 'sliders', path: '/page-refresh' }
    ]
  },
  {
    title: '页面与共享',
    items: [{ id: 'native-navigation', title: '原生页面与共享状态', icon: 'layer' }]
  }
]

/** 路由和返回入口共用目录归属，旧示例链接继续可用。 */
export const demoExamples = [
  ...demoGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, catalog: 'home' as const }))
  ),
  ...nativeDemoGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, catalog: 'native' as const }))
  )
]
