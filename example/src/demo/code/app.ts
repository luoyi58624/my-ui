import type { CodeFile } from './types'

/** App 用法直接读取两份最小源码，不再加工或拆分示例。 */
export const appExampleFiles: Record<string, readonly CodeFile[]> = {
  'app-basic': [
    { name: 'Example.vue', language: 'vue', source: () => import('../native-app/Example.vue?raw').then(module => module.default) },
    { name: 'pages.ts', language: 'typescript', source: () => import('../native-app/pages.ts?raw').then(module => module.default) },
  ],
}
