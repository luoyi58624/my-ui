/** 子窗口使用独立层级原点，仅按视口边界修正，不重新按根触发点翻转。 */
export interface FloatingPin {
  left: number; top: number; bottom: number; side: 'top' | 'bottom' | 'left' | 'right'
  /** 叠放父层的原位置与祖先留白，整体避让后仍保留返回区域。 */
  parent?: { top: number; bottom: number; reserve?: number }
  /** 将整体位移传回父层，各级同步避让而不提前压缩子菜单。 */
  onStack?: (shift: number, reserve: number) => void
  /** 原条目的几何用于衔接子菜单标题，进入和返回共用同一条路径。 */
  source?: { left: number; top: number; height: number }
}

