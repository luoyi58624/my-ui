import type { IconName } from './icons'

/** 表单项提供的原生控件属性，直接通过 v-bind 关联标签与说明。 */
export interface FieldControl {
  /** 与可见标签关联的控件标识。 */
  id: string
  /** 控件是否必填。 */
  required: boolean
  /** 原生控件或分组使用的可见标签标识。 */
  'aria-labelledby': string
  /** 当前是否存在校验错误。 */
  'aria-invalid': true | undefined
  /** 错误或说明元素的标识。 */
  'aria-describedby': string | undefined
}

/** 选择、分段与导航组件共用的选项。 */
export interface Option {
  /** 选项的唯一值。 */
  value: string
  /** 面向用户的选项名称。 */
  label: string
  /** 选项的补充说明。 */
  description?: string
  /** 可选的内置图标。 */
  icon?: IconName
  /** 禁止选择此项。 */
  disabled?: boolean
}

/** 菜单选项；添加 children 即为子菜单，只有叶子项触发选择。 */
export interface MenuOption extends Option {
  /** 子菜单选项；同一菜单树中的 value 应保持唯一。 */
  children?: MenuOption[]
}
