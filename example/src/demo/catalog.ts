import type { IconName } from '@my-ui/vue'

/** 目录导航项与独立示例共用的页面定义。 */
export interface DemoExample {
  id: string
  title: string
  description: string
  icon: IconName
  anchors?: string[]
  /** 独立全屏示例使用自己的路由，其余示例由目录插槽承载。 */
  path?: string
}

/** 组件目录按用途分组，旧链接仍可定位到相应示例。 */
export const demoGroups: { title: string; items: DemoExample[] }[] = [
  { title: '基础展示', items: [
    { id: 'button', title: 'Button 按钮', description: '操作层级、图标与按压反馈', icon: 'check' },
    { id: 'tag', title: 'Tag 标签', description: '状态展示与单选、多选标签', icon: 'heart' },
    { id: 'card', title: 'Card 卡片', description: '内容容器与可交互卡片', icon: 'layer', anchors: ['surfaces'] },
    { id: 'identity', title: 'Avatar / Badge', description: '头像、数字与状态标记', icon: 'user', anchors: ['avatar-badge'] },
    { id: 'image', title: 'Image 图片', description: '加载、失败与图片预览', icon: 'image' },
    { id: 'shadows', title: 'Shadow 阴影', description: '适合不同场景的层级', icon: 'layer' },
  ] },
  { title: '输入与选择', items: [
    { id: 'input', title: 'Input / Select', description: '输入、搜索与下拉选择', icon: 'search', anchors: ['controls'] },
    { id: 'switch', title: 'Switch 开关', description: '偏好设置与即时状态', icon: 'sliders' },
    { id: 'slider', title: 'Segmented / Slider', description: '分段切换与跟手滑块', icon: 'sliders' },
    { id: 'selection', title: 'Choices / Stepper', description: '单选、复选与数量调整', icon: 'check' },
    { id: 'combobox', title: 'Combobox 搜索选择', description: '搜索过滤与异步选项', icon: 'search' },
    { id: 'picker', title: 'Picker 滚轮选择', description: '单列、多列与联动选择', icon: 'chevrons-up-down' },
    { id: 'date-time-picker', title: 'Date / Time / Calendar', description: '日期、时间与日历选择', icon: 'clock', anchors: ['calendar'] },
    { id: 'upload', title: 'Upload 上传', description: '文件选择、预览与上传状态', icon: 'share' },
  ] },
  { title: '导航与容器', items: [
    { id: 'app-bar', title: 'AppBar 顶部导航', description: '页面标题、返回与操作', icon: 'arrow-right' },
    { id: 'navigation', title: 'Navigation 底部导航', description: '图标、文字与页面切换', icon: 'home' },
    { id: 'list', title: 'List 列表', description: '页面跳转、设置与选择列表', icon: 'inbox' },
    { id: 'selection-collapse', title: 'Radio / Checkbox / Collapse', description: '选择控件与折叠面板', icon: 'grid' },
  ] },
  { title: '反馈与交互', items: [
    { id: 'feedback', title: 'Toast / Dialog / Sheet', description: '轻提示、确认与底部操作', icon: 'message' },
    { id: 'primitives', title: 'Tooltip / Divider / Progress', description: '文字提示、分隔与进度反馈', icon: 'spark', anchors: ['playback-progress', 'slider-options'] },
    { id: 'notice-steps', title: 'Notice / Steps', description: '通知、流程与步骤状态', icon: 'bell', anchors: ['notice', 'steps'] },
    { id: 'popup', title: 'Popup / Drawer', description: '抽屉、选择面板与嵌套弹窗', icon: 'layer' },
    { id: 'menu', title: 'Menu 菜单', description: '按压定位、右键与级联菜单', icon: 'grid' },
    { id: 'touch-gestures', title: 'Touch 触摸滑动', description: '跟手切页、拖动与回弹', icon: 'sliders' },
  ] },
  { title: '完整示例', items: [
    { id: 'scenarios', title: '表单与内容场景', description: '组合组件完成实际交互', icon: 'briefcase' },
    { id: 'native-html', title: '原生 HTML 示例', description: '直接使用 CSS 与 JavaScript', icon: 'grid' },
  ] },
]

/** 原生组件及页面能力统一放在第二个导航目录。 */
export const nativeDemoGroups: { title: string; items: DemoExample[] }[] = [
  { title: '原生组件', items: [
    { id: 'native-app-bar', title: 'AppBar 顶部导航', description: '标题、返回与页面操作', icon: 'arrow-right', path: '/native/app-bar' },
    { id: 'native-bottom-navigation', title: 'BottomNavigation 底部导航', description: '标签切换、选中状态与角标', icon: 'home', path: '/native/bottom-navigation' },
    { id: 'native-tabs', title: 'Tabs 页面切换', description: '切换页面，保留各页状态', icon: 'grid', path: '/native/tabs' },
    { id: 'page-refresh', title: 'Page 页面与下拉刷新', description: '固定导航、内容滚动与下拉更新', icon: 'sliders', path: '/page-refresh' },
  ] },
  { title: '页面与共享', items: [
    { id: 'native-navigation', title: '原生页面与共享状态', description: '页面跳转、系统返回与共享数据', icon: 'layer' },
  ] },
]

/** 路由和返回入口共用目录归属，旧示例链接继续可用。 */
export const demoExamples = [
  ...demoGroups.flatMap(group => group.items.map(item => ({ ...item, catalog: 'home' as const }))),
  ...nativeDemoGroups.flatMap(group => group.items.map(item => ({ ...item, catalog: 'native' as const }))),
]
