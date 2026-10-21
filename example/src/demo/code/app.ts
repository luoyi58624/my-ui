import type { CodeFile } from './types'

const file = (name: string, language: CodeFile['language'], source: () => Promise<string>): CodeFile => ({ name, language, source })
const example = file('Example.vue', 'vue', () => import('../native-app/Example.vue?raw').then(module => module.default))
const tabs = file('tabs.ts', 'typescript', () => import('../native-app/tabs.ts?raw').then(module => module.default))
const pages = file('pages.ts', 'typescript', () => import('../native-app/pages.ts?raw').then(module => module.default))
const routes = file('routes.ts', 'typescript', () => import('../native-app/routes.ts?raw').then(module => module.default))
const root = file('Root.vue', 'vue', () => import('../native-app/Root.vue?raw').then(module => module.default))

/** App 的预览使用完整运行文件，代码不会包含文档的 iframe 或展示外壳。 */
export const appExampleFiles: Record<string, readonly CodeFile[]> = {
  'app-container': [example, tabs, file('TabPage.vue', 'vue', () => import('../native-app/TabPage.vue?raw').then(module => module.default))],
  'app-pages': [file('DetailPage.vue', 'vue', () => import('../native-app/DetailPage.vue?raw').then(module => module.default)), pages, routes, root],
}
