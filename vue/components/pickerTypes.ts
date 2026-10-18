/** 空列以 null 占位，其余值保持原来的字符串或数值类型。 */
export type PickerValue = string | number | null

/** 一项滚轮选项；children 表示下一列的级联内容。 */
export interface PickerOption {
  /** 当前项的唯一值，同列内不重复。 */
  value: string | number
  /** 显示的纯文字。 */
  label: string
  /** 禁止选中，滚动与键盘会自动跳过。 */
  disabled?: boolean
  /** 当前项对应的下一列选项。 */
  children?: readonly PickerOption[]
}
