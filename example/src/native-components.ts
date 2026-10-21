import { inject, ref, type InjectionKey, type Ref } from 'vue'

/** 页面需要主动暂停内容原生控件时共用状态，Web 弹层不再切换导航。 */
export const nativeBarsSuspendedKey: InjectionKey<Ref<boolean>> = Symbol('native-bars-suspended')

/** 获取当前页面显式设置的原生内容暂停状态。 */
export function useNativeBarsSuspended() {
  return inject(nativeBarsSuspendedKey, ref(false))
}
