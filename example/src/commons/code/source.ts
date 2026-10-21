import type { CodeFile } from './types'

const sources = import.meta.glob<string>('../../pages/**/*.vue', {
  query: '?raw',
  import: 'default'
})

const share: CodeFile = {
  name: 'components/SharePanel.vue',
  language: 'vue',
  source: () => import('../../components/SharePanel.vue?raw').then((module) => module.default)
}
const portrait: CodeFile = {
  name: 'commons/assets/avatar-lan.svg',
  language: 'html',
  source: () => import('../assets/avatar-lan.svg?raw').then((module) => module.default)
}
const companions: Record<string, readonly CodeFile[]> = {
  'button-icons': [share],
  sheet: [share],
  avatar: [portrait],
  'identity-profile': [portrait],
  drawer: [
    {
      name: 'DrawerExample.vue',
      language: 'vue',
      source: () =>
        import('../../components/DrawerExample.vue?raw').then((module) => module.default)
    }
  ],
  'selection-sheet': [
    {
      name: 'SelectionPanel.vue',
      language: 'vue',
      source: () =>
        import('../../components/SelectionPanel.vue?raw').then((module) => module.default)
    }
  ],
  'profile-form': [
    {
      name: 'profile.ts',
      language: 'typescript',
      source: () =>
        import('../../pages/home/scenarios/profile.ts?raw').then((module) => module.default)
    }
  ],
  'shared-state': [
    {
      name: 'commons/navigation.ts',
      language: 'typescript',
      source: () => import('../navigation.ts?raw').then((module) => module.default)
    },
    {
      name: 'commons/native-context.ts',
      language: 'typescript',
      source: () => import('../native-context.ts?raw').then((module) => module.default)
    },
    {
      name: 'commons/state/shared.ts',
      language: 'typescript',
      source: () => import('../state/shared.ts?raw').then((module) => module.default)
    },
    {
      name: 'commons/state/storage.ts',
      language: 'typescript',
      source: () => import('../state/storage.ts?raw').then((module) => module.default)
    }
  ]
}

const pages: Record<string, { file: string }[]> = {
  button: [{ file: 'pages/home/button/index.vue' }],
  tag: [{ file: 'pages/home/tag/index.vue' }],
  navigation: [{ file: 'pages/home/navigation/index.vue' }],
  list: [{ file: 'pages/home/list/index.vue' }],
  input: [{ file: 'pages/home/input/index.vue' }],
  switch: [{ file: 'pages/home/switch/index.vue' }],
  slider: [{ file: 'pages/home/slider/index.vue' }],
  selection: [{ file: 'pages/home/selection/index.vue' }],
  feedback: [{ file: 'pages/home/feedback/index.vue' }],
  'native-html': [{ file: 'pages/home/native-html/index.vue' }],
  card: [{ file: 'pages/home/card/index.vue' }],
  identity: [{ file: 'pages/home/identity/index.vue' }],
  image: [{ file: 'pages/home/image/index.vue' }],
  shadows: [{ file: 'pages/home/shadows/index.vue' }],
  'app-bar': [{ file: 'pages/home/app-bar/index.vue' }],
  'selection-collapse': [{ file: 'pages/home/selection-collapse/index.vue' }],
  combobox: [{ file: 'pages/home/combobox/index.vue' }],
  picker: [{ file: 'pages/home/picker/index.vue' }],
  'date-time-picker': [{ file: 'pages/home/date-time-picker/index.vue' }],
  upload: [{ file: 'pages/home/upload/index.vue' }],
  primitives: [
    { file: 'pages/home/primitives/index.vue' },
    { file: 'pages/home/primitives/PlaybackProgress.vue' },
    { file: 'pages/home/primitives/SliderExample.vue' }
  ],
  'notice-steps': [{ file: 'pages/home/notice-steps/index.vue' }],
  popup: [{ file: 'pages/home/popup/index.vue' }],
  menu: [{ file: 'pages/home/menu/index.vue' }],
  'touch-gestures': [{ file: 'pages/home/touch-gestures/index.vue' }],
  'pull-refresh': [{ file: 'pages/home/pull-refresh/index.vue' }],
  scenarios: [
    { file: 'pages/home/scenarios/ProfileFormExample.vue' },
    { file: 'pages/home/scenarios/index.vue' }
  ],
  tabbar: [{ file: 'pages/home/tabbar/index.vue' }],
  'native-navigation': [{ file: 'pages/native/navigation/index.vue' }]
}

function sourcePath(file: string) {
  return '../../' + file
}
function previewTags(source: string) {
  return [...source.matchAll(/<DemoExample\b(?:"[^"]*"|'[^']*'|[^'">])*>/g)]
}

/** 与交互文档共用的示例分组，用于独立代码页。 */
export interface PreviewCodeGroup {
  /** 当前示例的唯一名称。 */
  name: string
  /** 示例标题。 */
  title: string
  /** 示例说明。 */
  description: string
  /** 当前示例及其样式与辅助文件。 */
  files: readonly CodeFile[]
}

/** 按页面读取预览定义，独立代码页也按示例分别展示。 */
export async function previewGroups(id: string): Promise<PreviewCodeGroup[]> {
  const groups = await Promise.all(
    (pages[id] ?? []).map(async ({ file }) => {
      const load = sources[sourcePath(file)]
      if (!load) throw new Error('找不到示例源文件：' + file)
      const source = await load()
      return previewTags(source).flatMap((tag) => {
        const attribute = (key: string) =>
          tag[0].match(new RegExp('(?:^|\\s)' + key + '="([^"]*)"'))?.[1] ?? ''
        const name = attribute('name')
        return [
          {
            name,
            title: attribute('title'),
            description: attribute('description'),
            files: previewFiles(file, name, attribute('setup') || name)
          }
        ]
      })
    })
  )
  return groups.flat()
}

function dedent(value: string) {
  const lines = value
    .replace(/\r\n/g, '\n')
    .replace(/^\n|\n\s*$/g, '')
    .split('\n')
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)![0].length)
  )
  return lines
    .map((line) => line.slice(indent))
    .join('\n')
    .trim()
}

function setupCode(
  source: string,
  regions: string[],
  template: string,
  related: readonly CodeFile[]
) {
  let script = source.match(/<script setup(?:\s[^>]*)?>([\s\S]*?)<\/script>/)?.[1] ?? ''
  // 每个示例显式声明所需状态区，预览与代码始终取自同一份文件。
  script = script.replace(
    /\/\/ #region ([\w-]+)\r?\n([\s\S]*?)\/\/ #endregion(?: [\w-]+)?/g,
    (_, name: string, content: string) => (regions.includes(name) ? content : '')
  )
  // 页面运行时共用提示入口，复制出的独立示例自带 Toast 宿主。
  const standaloneNotify = /\bconst notify = inject\(notifyKey\)!/.test(script)
  if (standaloneNotify)
    script = script.replace(
      /\bconst notify = inject\(notifyKey\)!/,
      'const toast = ref<InstanceType<typeof Toast>>()\nfunction notify(message: string) {\n  toast.value?.show(message)\n}'
    )
  const imports: { bindings: string; quote: string; path: string }[] = []
  script = script
    .replace(
      /import\s+([\s\S]*?)\s+from\s+(['"])([^'"\n]+)\2\s*;?/g,
      (_, bindings: string, quote: string, path: string) => {
        imports.push({ bindings, quote, path })
        return ''
      }
    )
    .trim()
    .replace(/\n{3,}/g, '\n\n')
  const used = script + '\n' + template
  const declarations = imports.flatMap(({ bindings, quote, path }) => {
    // 复制代码以展示的文件名组织目录，不能保留文档页面自身的多级相对路径。
    if (path.startsWith('.')) {
      const basename = path
        .split('/')
        .at(-1)!
        .replace(/\.(?:ts|js)$/, '')
      const companion = related.find(
        (file) =>
          file.name
            .split('/')
            .at(-1)!
            .replace(/\.(?:ts|js)$/, '') === basename
      )
      if (companion)
        path =
          './' +
          (/\.[^/]+$/.test(path) ? companion.name : companion.name.replace(/\.(?:ts|js)$/, ''))
    }
    const matches = (binding: string) => {
      const name = binding
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()!
        .trim()
      return new RegExp('\\b' + name + '\\b').test(used)
    }
    if (bindings.trim().startsWith('{')) {
      const names = bindings
        .replace(/[{}]/g, '')
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name && matches(name))
      return names.length ? [`import { ${names.join(', ')} } from ${quote}${path}${quote}`] : []
    }
    return matches(bindings) ? [`import ${bindings.trim()} from ${quote}${path}${quote}`] : []
  })
  if (standaloneNotify) {
    if (
      !declarations.some((declaration) =>
        /import \{[^}]*\bref\b[^}]*\} from ['"]vue['"]/.test(declaration)
      )
    )
      declarations.unshift("import { ref } from 'vue'")
    declarations.unshift("import { Toast } from '@my-ui/vue'")
  }
  return [...declarations, ...(script ? ['', script] : [])].join('\n').trim()
}

/** 从实际预览文件读取指定示例，避免维护一份与界面脱节的用法代码。 */
export function previewFiles(
  file: string,
  name: string,
  setup = name,
  related: readonly CodeFile[] = []
): readonly CodeFile[] {
  const path = sourcePath(file)
  const read = async () => {
    const load = sources[path]
    if (!load) throw new Error('找不到示例源文件：' + file)
    return load()
  }
  const dependencies = related.length ? related : (companions[name] ?? [])
  let filename =
    name
      .split('-')
      .map((word) => word[0]!.toUpperCase() + word.slice(1))
      .join('') + 'Example'
  if (dependencies.some((file) => file.name === filename + '.vue'))
    filename = filename.replace(/Example$/, 'Usage')
  return [
    {
      name: filename + '.vue',
      language: 'vue',
      source: async () => {
        const source = await read()
        const start = previewTags(source).find((match) => match[0].includes('name="' + name + '"'))
        if (!start) throw new Error('找不到对应预览：' + name)
        const offset = start.index + start[0].length
        const closing = /<\/DemoExample\s*>/.exec(source.slice(offset))
        if (!closing) throw new Error('示例预览没有结束标记：' + name)
        const end = offset + closing.index
        let template = dedent(source.slice(offset, end))
        let script = setupCode(source, setup.split(/\s+/), template, dependencies)
        // 页面级反馈宿主不属于预览框，复制独立示例时补齐必要挂载点。
        if (/\bconst toast\b/.test(script) && !/<Toast\b/.test(template))
          template += '\n<Toast ref="toast" />'
        if (/\bpopup\./.test(script) && !/<Popup\b/.test(template)) {
          template += '\n<!-- 实际应用在根组件挂载一次即可。 -->\n<Popup />'
          script = "import { Popup } from '@my-ui/vue'\n" + script
        }
        const styles = /<style(?:\s[^>]*)?>/.test(source)
        return `${script ? '<script setup lang="ts">\n' + script + '\n</script>\n\n' : ''}<template>\n${template
          .split('\n')
          .map((line) => '  ' + line)
          .join(
            '\n'
          )}\n</template>${styles ? '\n\n<style scoped src="./' + filename + '.css" />' : ''}`
      }
    },
    {
      name: filename + '.css',
      language: 'css',
      source: async () => {
        const source = await read()
        return (
          [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)]
            .map((match) => match[1]!.trim())
            .join('\n\n') || '/* 此示例使用组件的默认样式，无需额外 CSS。 */'
        )
      }
    },
    ...dependencies
  ]
}
