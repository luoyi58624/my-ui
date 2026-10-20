// 在样式和主脚本加载前恢复主题；此文件保持普通脚本，不能改为延后执行的 module。
(() => {
  const root = document.documentElement;
  const inherited = window.__NATIVE_ROUTER_APPEARANCE__;
  let settings, cached;
  try { settings = JSON.parse(localStorage.getItem('my-ui:theme') || localStorage.getItem('chenglan:theme') || 'null'); } catch {}
  try { cached = JSON.parse(localStorage.getItem('my-ui:theme-render') || 'null'); } catch {}
  const preference = settings?.mode || 'light';
  const mode = inherited ? (inherited.dark ? 'dark' : 'light')
    : preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  if (cached?.mode === mode && cached.variables) {
    for (const [name, value] of Object.entries(cached.variables)) {
      if (name.startsWith('--') && typeof value === 'string') root.style.setProperty(name, value);
    }
  }
  const background = inherited?.background || root.style.getPropertyValue('--background') || (mode === 'dark' ? '#121419' : '#f2f3f5');
  root.dataset.theme = mode;
  root.dataset.themePreference = preference;
  root.style.setProperty('--background', background);
  root.style.backgroundColor = 'var(--background)';
})();
