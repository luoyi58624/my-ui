/** 示例代码支持的语言，来自 Highlight.js 的常用语法集合。 */
export type CodeLanguage = 'vue' | 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'rust' | 'toml' | 'kotlin' | 'shellscript' | 'text'

/** 可直接展示的代码或按需读取的示例源文件。 */
export interface CodeFile {
  /** 文件名，用于切换文件和复制提示。 */
  name: string
  /** 高亮语法。 */
  language: CodeLanguage
  /** 字符串原样展示，函数在用户查看时读取源码。 */
  source: string | (() => Promise<string>)
}
