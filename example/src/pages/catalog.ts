import type { IconName } from '@my-ui/vue'

/** 目录和独立示例共用标题及地址，用法说明留在示例内。 */
export interface DemoExample {
  id: string
  title: string
  icon: IconName
  anchors?: string[]
  /** 独立全屏示例使用自己的路由，其余示例由文档注册表承载。 */
  path?: string
}

/** 组件目录按用途分组，旧链接仍可定位到相应示例。 */
export const demoGroups: { title: string; items: DemoExample[] }[] = [
  {
    title: '开始使用',
    items: [
      { id: 'quick-start', title: '快速开始', icon: 'spark', path: '/guide/quick-start' },
      { id: 'native-integration', title: '应用与平台', icon: 'layer', path: '/guide/native' }
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
      { id: 'tabbar', title: 'Tabbar 底部导航', icon: 'home' },
      { id: 'navigation', title: 'Navigation 导航选项', icon: 'grid' },
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
      { id: 'touch-gestures', title: 'Touch 触摸滑动', icon: 'sliders' },
      { id: 'pull-refresh', title: 'PullRefresh 下拉刷新', icon: 'cloud' }
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

/** 应用布局与持久化入口，组件用法直接复用首页文档。 */
export const nativeDemoGroups: { title: string; items: DemoExample[] }[] = [
  { title: '应用布局', items: [
    { id: 'application-appbar', title: 'AppBar 顶部导航', icon: 'arrow-right', path: '/example/app-bar' },
    { id: 'application-tabbar', title: 'Tabbar 底部导航', icon: 'home', path: '/example/tabbar' },
    { id: 'application-refresh', title: 'PullRefresh 下拉刷新', icon: 'cloud', path: '/example/pull-refresh' },
    { id: 'application-guide', title: '应用与平台指南', icon: 'layer', path: '/guide/native' }
  ] },
  { title: '状态与平台', items: [
    { id: 'native-navigation', title: '跨页状态与本地持久化', icon: 'layer' },
    { id: 'application-html', title: '纯 HTML 示例', icon: 'grid', path: '/html' }
  ] }
]

/** 路由和返回入口共用目录归属。 */
export const demoExamples = [
  ...demoGroups.flatMap(group => group.items.map(item => ({ ...item, catalog: 'home' as const }))),
  ...nativeDemoGroups.flatMap(group => group.items.map(item => ({ ...item, catalog: 'native' as const })))
]
