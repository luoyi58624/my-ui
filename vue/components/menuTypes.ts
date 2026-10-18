import type { MenuOption } from './types'

/** 内部面板的初始焦点意图，鼠标悬停展开不会主动抢焦点。 */
export type MenuFocusIntent = 'selected' | 'first' | 'last'

/** 根菜单统一管理所有面板的内部按压范围、焦点与关闭。 */
export interface MenuPanelHandle {
  /** 返回当前菜单树中尚未卸载的面板内容。 */
  elements: () => HTMLElement[]
  /** 定位完成后聚焦指定的有效项。 */
  focus: (intent?: MenuFocusIntent) => void
  /** 在焦点所在的可交互层内循环，反向时从末项返回。 */
  tab: (reverse?: boolean) => void
}

/** 各级菜单共用的行插槽，row 可直接绑定到 ListRow。 */
export interface MenuItemSlot {
  /** 当前行的菜单数据。 */
  item: MenuOption
  /** 当前项或其后代是否选中。 */
  selected: boolean
  /** 当前行的子菜单是否已打开。 */
  expanded: boolean
  /** 可访问属性与指针交互绑定。 */
  row: Record<string, unknown>
}
