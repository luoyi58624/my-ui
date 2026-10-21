import type { CodeFile } from './types'
import { appExampleFiles } from './app'

const sources = import.meta.glob<string>('../../**/*.vue', { query: '?raw', import: 'default' })

const share: CodeFile = {
  name: 'demo/SharePanel.vue',
  language: 'vue',
  source: () => import('../../components/SharePanel.vue?raw').then((module) => module.default)
}
const portrait: CodeFile = {
  name: 'assets/avatar-lan.svg',
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
      source: () => import('../../components/DrawerExample.vue?raw').then((module) => module.default)
    }
  ],
  'selection-sheet': [
    {
      name: 'SelectionPanel.vue',
      language: 'vue',
      source: () => import('../../components/SelectionPanel.vue?raw').then((module) => module.default)
    }
  ],
  'profile-form': [
    {
      name: 'profile.ts',
      language: 'typescript',
      source: () => import('../../demo/profile.ts?raw').then((module) => module.default)
    }
  ],
  'shared-state': [
    {
      name: '../navigation.ts',
      language: 'typescript',
      source: () => import('../navigation.ts?raw').then((module) => module.default)
    },
    {
      name: '../native-context.ts',
      language: 'typescript',
      source: () => import('../native-context.ts?raw').then((module) => module.default)
    },
    {
      name: '../stores/shared.ts',
      language: 'typescript',
      source: () => import('../state/shared.ts?raw').then((module) => module.default)
    },
    {
      name: '../stores/storage.ts',
      language: 'typescript',
      source: () => import('../state/storage.ts?raw').then((module) => module.default)
    }
  ]
}

const app = (names: string[]) => [{ file: 'App.vue', names }]
const pages: Record<string, { file: string; names?: string[] }[]> = {
  button: app(['button-basic', 'button-icons', 'button-states']),
  tag: app(['tag-tones', 'tag-single', 'tag-multiple', 'tag-toggle']),
  input: app(['input-search', 'input-hint', 'select']),
  switch: app(['switches']),
  slider: app(['segmented', 'slider', 'custom-slider']),
  selection: app(['choices-radio', 'choices-checkbox', 'stepper']),
  navigation: app(['navigation']),
  list: app(['list-choices', 'list-navigation']),
  feedback: app(['toast', 'dialog', 'sheet']),
  card: [{ file: 'CardShowcase.vue' }],
  identity: [{ file: 'IdentityShowcase.vue' }],
  image: [{ file: 'ImageShowcase.vue' }],
  shadows: [{ file: 'ShadowShowcase.vue' }],
  'app-bar': [{ file: 'AppBarShowcase.vue' }],
  'selection-collapse': [{ file: 'SelectionCollapseShowcase.vue' }],
  combobox: [{ file: 'ComboboxShowcase.vue' }],
  picker: [{ file: 'PickerShowcase.vue' }],
  'date-time-picker': [{ file: 'DateTimeShowcase.vue' }],
  upload: [{ file: 'UploadShowcase.vue' }],
  primitives: [
    { file: 'FeedbackPrimitives.vue' },
    { file: 'PlaybackProgress.vue' },
    { file: 'SliderShowcase.vue' }
  ],
  'notice-steps': [{ file: 'NoticeStepsShowcase.vue' }],
  popup: [{ file: 'PopupShowcase.vue' }],
  menu: [{ file: 'MenuShowcase.vue' }],
  'touch-gestures': [{ file: 'TouchShowcase.vue' }],
  scenarios: [{ file: 'ProfileFormExample.vue' }, { file: 'EssentialsShowcase.vue' }],
  'native-navigation': [{ file: 'NativeNavigationShowcase.vue' }],
  'native-app': [{ file: 'NativeAppShowcase.vue' }]
}

function sourcePath(file: string) {
  return file === 'App.vue' ? '../../App.vue' : '../../demo/' + file
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
    (pages[id] ?? []).map(async ({ file, names }) => {
      const load = sources[sourcePath(file)]
      if (!load) throw new Error('找不到示例源文件：' + file)
      const source = await load()
      return previewTags(source).flatMap((tag) => {
        const attribute = (key: string) =>
          tag[0].match(new RegExp('(?:^|\\s)' + key + '="([^"]*)"'))?.[1] ?? ''
        const name = attribute('name')
        if (names && !names.includes(name)) return []
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

function setupCode(source: string, regions: string[], template: string) {
  let script = source.match(/<script setup(?:\s[^>]*)?>([\s\S]*?)<\/script>/)?.[1] ?? ''
  // 每个示例显式声明所需状态区，预览与代码始终取自同一份文件。
  script = script.replace(
    /\/\/ #region ([\w-]+)\r?\n([\s\S]*?)\/\/ #endregion(?: [\w-]+)?/g,
    (_, name: string, content: string) => (regions.includes(name) ? content : '')
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
  return [...declarations, ...(script ? ['', script] : [])].join('\n').trim()
}

/** 从实际预览文件读取指定示例，避免维护一份与界面脱节的用法代码。 */
export function previewFiles(
  file: string,
  name: string,
  setup = name,
  related: readonly CodeFile[] = []
): readonly CodeFile[] {
  if (appExampleFiles[name]) return appExampleFiles[name]
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
        let script = setupCode(source, setup.split(/\s+/), template)
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
        return [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)]
          .map((match) => match[1]!.trim())
          .join('\n\n')
      }
    },
    ...dependencies
  ]
}
