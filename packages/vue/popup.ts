import {
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  render,
  type AppContext,
} from "vue";
import "../../lib/my-ui.js";
import type { NativePopupOptions } from "../../lib/my-ui";
import type {
  AlertOptions,
  DrawerOptions,
  PopupContent,
  PopupHandle,
  SheetOptions,
} from "./components/popupTypes";

let appContext: AppContext | null = null;

/** 可选的 Popup 宿主只提供 Vue 应用上下文，原生弹层无需宿主也能使用。 */
export function installPopupContext() {
  const current = getCurrentInstance()?.appContext ?? null;
  appContext = current;
  onBeforeUnmount(() => {
    if (appContext === current) appContext = null;
  });
}

function vueContent<T>(builder: PopupContent<T>) {
  const context = appContext;
  return (target: Element, controls: { close(value?: T): void }) => {
    const Content = defineComponent({ setup: () => () => builder(controls) });
    const vnode = h(Content);
    vnode.appContext = context;
    render(vnode, target);
    return () => render(null, target);
  };
}

/** Vue 内容适配；窗口、焦点、手势和动画均由 my-ui.js 负责。 */
export const popup = {
  /** 默认底部确认提示，center:true 改为居中。 */
  showAlert(options: AlertOptions): Promise<boolean> {
    return globalThis.MyUI.popup.showAlert(options as NativePopupOptions);
  },
  /** 使用 h() 构建任意 Vue 内容，关闭后的结果由 closed 返回。 */
  showSheet<T = unknown>(options: SheetOptions<T>): PopupHandle<T> {
    const { content, ...rest } = options;
    return globalThis.MyUI.popup.showSheet<T>({
      ...rest,
      renderContent: vueContent(content),
    } as NativePopupOptions<T>);
  },
  /** 四向抽屉与底部面板复用同一内容适配。 */
  showDrawer<T = unknown>(options: DrawerOptions<T>): PopupHandle<T> {
    const { content, ...rest } = options;
    return globalThis.MyUI.popup.showDrawer<T>({
      ...rest,
      renderContent: vueContent(content),
    } as NativePopupOptions<T>);
  },
};
