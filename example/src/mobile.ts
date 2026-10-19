import './mobile.css'

// 移动端（Tauri Android/iOS WebView 或移动浏览器）运行时适配：
// 打上标记类供 mobile.css 禁用长按选中，并拦截非编辑区的系统上下文菜单。
// 桌面端 Tauri 与 PC 浏览器不加此类，正文依旧可选中复制。
const isMobileWebView = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

if (isMobileWebView) {
  document.documentElement.classList.add('my-mobile-native')

  // 输入框、文本域、可编辑区域内保留长按菜单（选择/粘贴）；其余位置长按不弹系统菜单。
  window.addEventListener('contextmenu', (event) => {
    const target = event.target
    const editable =
      target instanceof Element &&
      target.closest('input, textarea, [contenteditable=""], [contenteditable="true"]')
    if (!editable) event.preventDefault()
  })
}
