import { defineAsyncComponent, type Component } from 'vue'

/** 组件文档按目录标识加载，独立文档与完整示例共用。 */
export const homeDocs: Record<string, Component> = {
  button: defineAsyncComponent(() => import('./button/index.vue')),
  tag: defineAsyncComponent(() => import('./tag/index.vue')),
  navigation: defineAsyncComponent(() => import('./navigation/index.vue')),
  list: defineAsyncComponent(() => import('./list/index.vue')),
  input: defineAsyncComponent(() => import('./input/index.vue')),
  switch: defineAsyncComponent(() => import('./switch/index.vue')),
  slider: defineAsyncComponent(() => import('./slider/index.vue')),
  selection: defineAsyncComponent(() => import('./selection/index.vue')),
  feedback: defineAsyncComponent(() => import('./feedback/index.vue')),
  'native-html': defineAsyncComponent(() => import('./native-html/index.vue')),
  card: defineAsyncComponent(() => import('./card/index.vue')),
  identity: defineAsyncComponent(() => import('./identity/index.vue')),
  image: defineAsyncComponent(() => import('./image/index.vue')),
  shadows: defineAsyncComponent(() => import('./shadows/index.vue')),
  'app-bar': defineAsyncComponent(() => import('./app-bar/index.vue')),
  'selection-collapse': defineAsyncComponent(() => import('./selection-collapse/index.vue')),
  combobox: defineAsyncComponent(() => import('./combobox/index.vue')),
  picker: defineAsyncComponent(() => import('./picker/index.vue')),
  'date-time-picker': defineAsyncComponent(() => import('./date-time-picker/index.vue')),
  upload: defineAsyncComponent(() => import('./upload/index.vue')),
  primitives: defineAsyncComponent(() => import('./primitives/index.vue')),
  'notice-steps': defineAsyncComponent(() => import('./notice-steps/index.vue')),
  popup: defineAsyncComponent(() => import('./popup/index.vue')),
  menu: defineAsyncComponent(() => import('./menu/index.vue')),
  'touch-gestures': defineAsyncComponent(() => import('./touch-gestures/index.vue')),
  'pull-refresh': defineAsyncComponent(() => import('./pull-refresh/index.vue')),
  scenarios: defineAsyncComponent(() => import('./scenarios/index.vue'))
}
