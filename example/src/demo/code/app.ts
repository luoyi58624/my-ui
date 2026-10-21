import type { CodeFile } from './types'

const file = (name: string, language: CodeFile['language'], source: () => Promise<string>): CodeFile => ({
  name, language,
  source: async () => (await source()).replace(/<style\b[^>]*>[\s\S]*?<\/style>\s*/g, '').trimEnd(),
})
const example = file('Example.vue', 'vue', () => import('../native-app/Example.vue?raw').then(module => module.default))
const tabs = file('tabs.ts', 'typescript', () => import('../native-app/tabs.ts?raw').then(module => module.default))
const pages = file('pages.ts', 'typescript', () => import('../native-app/pages.ts?raw').then(module => module.default))
const routes = file('routes.ts', 'typescript', () => import('../native-app/routes.ts?raw').then(module => module.default))

/** 逐例读取实际用法，只展示配置与交互，不包含样式或文档外壳。 */
export const appExampleFiles: Record<string, readonly CodeFile[]> = {
  'app-container': [example, tabs, file('TabPage.vue', 'vue', () => import('../native-app/TabPage.vue?raw').then(module => module.default))],
  'app-pages': [file('DetailPage.vue', 'vue', () => import('../native-app/DetailPage.vue?raw').then(module => module.default)), pages, routes],
}
