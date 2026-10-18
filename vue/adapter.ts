import {
  h,
  onBeforeUnmount,
  onUpdated,
  shallowRef,
  Teleport,
  useAttrs,
  useSlots,
  watch,
  type Component,
  type VNode,
} from "vue";
import "../lib/my-ui.js";
import type { NativeController } from "../lib/my-ui";

const api = globalThis.MyUI;
const tags: Record<string, string> = {
  Icon: "svg",
  Button: "button",
  Tag: "span",
  Avatar: "span",
  Badge: "span",
  Loading: "span",
  Tooltip: "span",
  Switch: "input",
  Radio: "label",
  Checkbox: "label",
  RadioGroup: "fieldset",
  CheckboxGroup: "fieldset",
  Choices: "fieldset",
  Form: "form",
  Card: "article",
  ListRow: "button",
  Navigation: "nav",
};

/** Vue 只处理 props、v-model、事件、插槽和卸载，组件行为统一交给原生核心。 */
export function useNative(name: string, props: object, emit: unknown) {
  const attributes = useAttrs(),
    slots = useSlots(),
    revision = shallowRef(0);
  let controller: NativeController | undefined;
  let lastAttributes: Record<string, unknown> = {};
  let lastSlots = "";
  const outletKeys = new WeakMap<Element, number>();
  let nextOutletKey = 0;
  const nativeProps = () => {
    const result: Record<string, any> = { ...props };
    if (name === "Radio" || name === "Checkbox")
      result.optionValue = result.value;
    if (name === "ListRow") result.valueText = result.value;
    if ("modelValue" in result && (name !== "ListRow" || result.toggle))
      result.value = result.modelValue;
    delete result.modelValue;
    return result;
  };
  function events(event: string, ...args: any[]) {
    if (typeof emit !== "function") return;
    if (event === "change") emit("update:modelValue", ...args);
    else if (event === "open") emit("update:open", ...args);
    else if (event === "indeterminate") emit("update:indeterminate", ...args);
    else emit(event, ...args);
  }
  function sync() {
    if (!controller) return;
    lastAttributes = { ...attributes };
    lastSlots = Object.keys(slots).join("|");
    controller.update(nativeProps(), lastAttributes, Object.keys(slots));
  }
  watch(props, sync, { deep: true, flush: "post" });
  onUpdated(() => {
    const keys = Object.keys(attributes);
    if (
      Object.keys(slots).join("|") !== lastSlots ||
      keys.length !== Object.keys(lastAttributes).length ||
      keys.some((key) => attributes[key] !== lastAttributes[key])
    )
      sync();
  });
  function attach(element: Element | null) {
    if (!element || controller?.element === element) return;
    controller?.destroy();
    controller = api.create(name, nativeProps(), {
      element,
      externalSlots: true,
      slotNames: Object.keys(slots),
      emit: events,
      invalidate: () => revision.value++,
    });
    sync();
  }
  onBeforeUnmount(() => {
    controller?.destroy();
    controller = undefined;
  });
  const exposed = {
    /** 显示浮层或轻提示，参数沿用对应组件。 */
    show: (...args: any[]) => controller?.exposed.show?.(...args),
    /** 关闭浮层。 */
    close: () => controller?.exposed.close?.(),
    /** 切换菜单。 */
    toggle: (...args: any[]) => controller?.exposed.toggle?.(...args),
    /** 聚焦原生控件。 */
    focus: () => controller?.exposed.focus?.(),
    /** 选择输入文字。 */
    select: () => controller?.exposed.select?.(),
    /** 重新计算浮层位置。 */
    updatePosition: () => controller?.exposed.updatePosition?.(),
  };
  const render: Component = () => {
    revision.value;
    const children: VNode[] = [];
    for (const outlet of controller?.outlets.values() ?? []) {
      const slot = slots[outlet.name];
      if (slot) {
        if (!outletKeys.has(outlet.target))
          outletKeys.set(outlet.target, ++nextOutletKey);
        children.push(
          h(
            Teleport,
            { to: outlet.target, key: outletKeys.get(outlet.target) },
            slot(outlet.scope),
          ),
        );
      }
    }
    const p = props as Record<string, any>;
    const tag =
      name === "Tag" && typeof p.modelValue === "boolean"
        ? "button"
        : name === "ListRow" && p.toggle
          ? "label"
          : (tags[name] ?? "div");
    return h(tag, { ref: (element: any) => attach(element) }, children);
  };
  return { render, exposed };
}
