/** 自定义刻度的位置和可选文字；位置使用 min / max 相同单位。 */
export interface SliderMark {
  /** 刻度对应的数值。 */
  value: number
  /** 刻度下方的文字，省略时仅显示圆点。 */
  label?: string | number
}
