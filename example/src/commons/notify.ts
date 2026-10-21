import type { InjectionKey } from 'vue'

/** 将示例中的提示交给应用统一展示。 */
export const notifyKey: InjectionKey<(message: string) => void> = Symbol('demo-notify')
