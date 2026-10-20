import { inject, ref, type InjectionKey, type Ref } from 'vue'

/** 弹层覆盖页面时，切换为能被同一遮罩覆盖的 Web 导航。 */
export const nativeBarsSuspendedKey: InjectionKey<Ref<boolean>> = Symbol('native-bars-suspended')

/** 获取当前页面的导航遮罩状态。 */
export function useNativeBarsSuspended() {
  return inject(nativeBarsSuspendedKey, ref(false))
}
