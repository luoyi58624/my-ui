/** 资料示例中需要校验的输入值。 */
export interface ProfileDraft {
  /** 显示名称。 */
  name: string
  /** 联系邮箱。 */
  email: string
}

/** 校验错误按表单项返回，空对象表示可以提交。 */
export type ProfileErrors = Partial<Record<keyof ProfileDraft, string>>

/** 示例页面负责业务校验，表单组件只接收并展示错误。 */
export function validateProfile(draft: ProfileDraft): ProfileErrors {
  const errors: ProfileErrors = {}
  const name = draft.name.trim(),
    email = draft.email.trim()
  if (!name) errors.name = '请填写显示名称'
  else if (Array.from(name).length < 2) errors.name = '显示名称至少需要 2 个字符'
  if (!email) errors.email = '请填写联系邮箱'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '请输入有效的邮箱地址'
  return errors
}
