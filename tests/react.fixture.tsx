import React, { StrictMode, act, createContext, createRef, useContext, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import * as UI from '../packages/react'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
const fixture = document.querySelector('#fixture')!
const result = document.querySelector('#result')!
const reports: { name: string; passed: boolean; error?: string }[] = []
const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
const tick = async () => { await Promise.resolve(); await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame) }
const assert = (value: unknown, message: string) => { if (!value) throw Error(message) }
const visible = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)].find(node => node.getClientRects().length && !node.closest('[inert]'))
let root: Root | null = null
async function mount(content: React.ReactNode) {
  if (!root) root = createRoot(fixture)
  await act(async () => { root!.render(<StrictMode>{content}</StrictMode>) })
  await tick()
}
async function event(run: () => void) { await act(async () => { run(); await Promise.resolve() }); await tick() }
async function until(check: () => unknown) {
  for (let index = 0; index < 100; index++) { if (check()) return; await pause(20) }
  throw Error('等待组件更新超时')
}
async function cleanup() {
  await act(async () => { root?.unmount(); root = null; UI.popup.closeAll(); await Promise.resolve() })
  fixture.replaceChildren()
  await tick()
}
async function check(name: string, run: () => Promise<void>) {
  try { await cleanup(); await run(); reports.push({ name, passed: true }) }
  catch (error) { reports.push({ name, passed: false, error: error instanceof Error ? error.stack : String(error) }) }
  finally { await cleanup() }
}

document.querySelector<HTMLButtonElement>('#run')!.onclick = async () => {
  reports.length = 0
  result.textContent = '运行中'
  await check('StrictMode 重放后只保留一个按钮和一次事件，JSX 内容跟随状态更新', async () => {
    let clicks = 0
    function App() {
      const [count, setCount] = useState(0)
      return <UI.Button onClick={() => { clicks++; setCount(value => value + 1) }}>点击 {count}</UI.Button>
    }
    await mount(<App />)
    assert(fixture.querySelectorAll('button').length === 1, 'StrictMode 创建重复宿主')
    assert(fixture.querySelectorAll('.my-button-label').length === 1, 'StrictMode 遗留内部结构')
    await event(() => fixture.querySelector('button')!.click())
    assert(clicks === 1 && fixture.textContent!.includes('点击 1'), '回调重复或 JSX 未更新')
  })
  await check('受控输入保留原生节点、焦点和光标，拒绝的值恢复为 props', async () => {
    let rejected = ''
    function App() {
      const [value, setValue] = useState('蓝')
      return <><UI.Input label="姓名" value={value} onChange={setValue} /><UI.Input label="固定" value="固定值" onChange={value => { rejected = value }} /></>
    }
    await mount(<App />)
    const [input, fixed] = [...fixture.querySelectorAll<HTMLInputElement>('input')]
    input.focus()
    await event(() => { input.value = '小蓝'; input.setSelectionRange(1, 1); input.dispatchEvent(new InputEvent('input', { bubbles: true })) })
    assert(fixture.querySelector('input') === input && document.activeElement === input && input.value === '小蓝' && input.selectionStart === 1, '受控回写重建了输入或丢失光标')
    await event(() => { fixed.value = '不接受'; fixed.dispatchEvent(new InputEvent('input', { bubbles: true })) })
    assert(rejected === '不接受' && fixed.value === '固定值', '受控组件未恢复被拒绝的值')
  })
  await check('defaultValue 只读取一次，原生属性命名和 ref 操作正常', async () => {
    const ref = createRef<UI.InputHandle>()
    let focused = false
    await mount(<UI.Input ref={ref} label="文本" defaultValue="初始" clearable maxLength={8} autoComplete="name" onFocus={event => { focused = event instanceof FocusEvent }} />)
    const input = fixture.querySelector('input')!
    ref.current!.focus()
    assert(focused && document.activeElement === input && input.maxLength === 8 && input.autocomplete === 'name', '原生属性或 ref 未适配')
    await event(() => { input.value = '用户输入'; input.dispatchEvent(new InputEvent('input', { bubbles: true })) })
    await mount(<UI.Input ref={ref} label="文本" defaultValue="不能覆盖" clearable readOnly />)
    assert(fixture.querySelector('input') === input && input.value === '用户输入' && input.readOnly, 'defaultValue 覆盖了内部值')
    assert(!visible('.my-clear-input'), '只读输入仍有清空按钮')
    ref.current!.select()
    assert(input.selectionStart === 0 && input.selectionEnd === input.value.length, 'ref.select 失效')
  })
  await check('回调、className、CSS 变量和普通属性更新不遗留旧值', async () => {
    let first = 0, second = 0
    await mount(<UI.Button className="first" style={{ '--primary': '#123456' }} title="旧提示" onClick={() => first++}>原文</UI.Button>)
    const button = fixture.querySelector('button')!
    await mount(<UI.Button className="second" onClick={() => second++}>新文</UI.Button>)
    await event(() => button.click())
    assert(!button.classList.contains('first') && button.classList.contains('second') && !button.style.getPropertyValue('--primary') && !button.hasAttribute('title'), '旧属性未移除')
    assert(first === 0 && second === 1 && button.textContent!.includes('新文'), '回调或内容过期')
  })
  await check('默认插槽保留 React Context 和子组件状态，原生父组件更新不重建内容', async () => {
    const Context = createContext('默认')
    function Counter() {
      const [count, setCount] = useState(0)
      return <button onClick={() => setCount(value => value + 1)}>{useContext(Context)} {count}</button>
    }
    await mount(<Context.Provider value="上下文"><UI.Card title="旧标题"><Counter /></UI.Card></Context.Provider>)
    const button = fixture.querySelector('button')!
    await event(() => button.click())
    await mount(<Context.Provider value="新上下文"><UI.Card title="新标题"><Counter /></UI.Card></Context.Provider>)
    assert(fixture.querySelector('button') === button && button.textContent === '新上下文 1', 'Portal 丢失 Context 或子组件状态')
  })
  await check('单选、多选和开关统一 value 绑定，JSX 子项读取原生组上下文', async () => {
    function App() {
      const [radio, setRadio] = useState('a'), [checks, setChecks] = useState<string[]>([]), [enabled, setEnabled] = useState(false)
      return <><UI.RadioGroup label="单选" value={radio} onChange={setRadio}><UI.Radio optionValue="a" label="甲" /><UI.Radio optionValue="b" label="乙" /></UI.RadioGroup>
        <UI.CheckboxGroup label="多选" value={checks} onChange={setChecks}><UI.Checkbox optionValue="x" label="选择 X" /></UI.CheckboxGroup>
        <UI.Switch label="开关" value={enabled} onChange={setEnabled} /><output>{radio}:{checks.join(',')}:{String(enabled)}</output></>
    }
    await mount(<App />)
    const radios = [...fixture.querySelectorAll<HTMLInputElement>('input[type=radio]')]
    await event(() => radios[1].click())
    await event(() => fixture.querySelector<HTMLInputElement>('input[type=checkbox]:not(.my-switch)')!.click())
    await event(() => fixture.querySelector<HTMLInputElement>('.my-switch')!.click())
    assert(!radios[0].checked && radios[1].checked && fixture.querySelector('output')!.textContent === 'b:x:true', '原生组或统一值回调失效：' + JSON.stringify({ checked: radios.map(input => input.checked), output: fixture.querySelector('output')!.textContent }))
  })
  await check('Tabs 作用域内容跟随选项更新，替换出口后 React 正常卸载', async () => {
    const options = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
    function App() {
      const [value, setValue] = useState('a')
      return <UI.Tabs label="页签" value={value} options={options} onChange={setValue}>{({ value }) => <strong>当前 {value}</strong>}</UI.Tabs>
    }
    await mount(<App />)
    await event(() => fixture.querySelectorAll<HTMLButtonElement>('[role=tab]')[1].click())
    assert(visible('[role=tabpanel]')!.textContent === '当前 b', '作用域值未更新')
    await mount(<UI.Tabs label="页签" value="c" options={[{ value: 'c', label: '丙' }]}>{({ value }) => <em>替换 {value}</em>}</UI.Tabs>)
    assert(visible('[role=tabpanel]')!.textContent === '替换 c', '替换 options 后 Portal 未迁移')
  })
  await check('Select 和 Combobox 复用原生选项交互并同步 React 值', async () => {
    const options = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
    function App() {
      const [select, setSelect] = useState('a'), [combo, setCombo] = useState('a')
      return <><UI.Select label="选择" value={select} options={options} onChange={setSelect} /><UI.Combobox label="搜索" value={combo} options={options} onChange={setCombo} /><output>{select}:{combo}</output></>
    }
    await mount(<App />)
    await event(() => fixture.querySelector<HTMLButtonElement>('.my-select-trigger')!.click())
    await tick()
    const menu = visible('.my-floating-position[aria-hidden="false"]')!
    await event(() => [...menu.querySelectorAll<HTMLElement>('[role=option],button')].find(node => node.textContent === '乙')!.click())
    await act(async () => { await until(() => fixture.querySelector('output')!.textContent!.startsWith('b:')) })
    const input = fixture.querySelector<HTMLInputElement>('.my-combobox input')!
    await event(() => { input.focus(); input.value = '乙'; input.dispatchEvent(new InputEvent('input', { bubbles: true })) })
    await tick()
    const filtered = visible('.my-floating-position[aria-hidden="false"]')!
    await event(() => [...filtered.querySelectorAll<HTMLElement>('[role=option],button')].find(node => node.textContent === '乙')!.click())
    await act(async () => { await until(() => fixture.querySelector('output')!.textContent === 'b:b') })
  })
  await check('受控 Menu 和命名触发内容同步展开状态，卸载移除窗口', async () => {
    const ref = createRef<UI.MenuHandle>()
    const options = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
    function App() {
      const [open, setOpen] = useState(false)
      return <UI.Menu ref={ref} options={options} open={open} onOpenChange={setOpen} anchor="element"><button>打开菜单</button></UI.Menu>
    }
    await mount(<App />)
    await event(() => fixture.querySelector('button')!.click())
    assert(!!visible('.my-floating-position[aria-hidden="false"]'), '菜单未打开')
    await event(() => ref.current!.close())
    await act(async () => { await until(() => !visible('.my-floating-position[aria-hidden="false"]')) })
    await event(() => fixture.querySelector('button')!.click())
    await cleanup()
    assert(!document.querySelector('.my-floating-position'), '卸载遗留菜单窗口')
  })
  await check('FormField 作用域关联原生输入，命名插槽增删不破坏 React 节点', async () => {
    const render = (hint: boolean, error?: string) => <UI.FormField label="邮箱" error={error} slots={hint ? { hint: <span>说明文字</span> } : {}}>
      {({ control }) => <input {...control} />}
    </UI.FormField>
    await mount(render(true))
    const input = fixture.querySelector('input')!, label = fixture.querySelector('label')!
    assert(input.getAttribute('aria-labelledby') === label.id && !!input.getAttribute('aria-describedby'), '表单关联未传递')
    await mount(render(false, '格式错误'))
    assert(fixture.querySelector('input') === input && input.getAttribute('aria-invalid') === 'true' && fixture.textContent!.includes('格式错误'), '说明出口移除后破坏了输入')
    await mount(render(true))
    assert(fixture.textContent!.includes('说明文字') && !input.hasAttribute('aria-invalid'), '命名插槽未恢复')
  })
  await check('父级拒绝 Menu 展开时恢复受控状态', async () => {
    await mount(<UI.Menu open={false} onOpenChange={() => {}} options={[{ value: 'a', label: '甲' }]} anchor="element"><button>拒绝展开</button></UI.Menu>)
    await event(() => fixture.querySelector('button')!.click())
    assert(!visible('.my-floating-position[aria-hidden="false"]'), '被父级拒绝后菜单仍展开')
  })
  await check('Tooltip 支持受控初始展开、关闭及原生焦点触发', async () => {
    const content = (value: boolean | undefined) => <UI.Tooltip value={value} content="React 提示" delay={0}><button>提示目标</button></UI.Tooltip>
    await mount(content(true))
    assert(!!visible('[role=tooltip]'), '受控初始值没有展开提示')
    await mount(content(false))
    assert(!visible('[role=tooltip]'), '受控关闭未生效')
    await mount(content(undefined))
    await event(() => fixture.querySelector('button')!.focus())
    assert(!!visible('[role=tooltip]'), '非受控焦点提示未生效')
  })
  await check('Badge 的 JSX 头像保持圆角位置，插槽容器不增加布局尺寸', async () => {
    await mount(<UI.Badge value={8}><UI.Avatar text="蓝" /></UI.Badge>)
    const badge = fixture.querySelector<HTMLElement>('.my-badge')!, indicator = fixture.querySelector<HTMLElement>('.my-badge-indicator')!
    assert(Math.abs(badge.getBoundingClientRect().width - 40) < 1 && Math.abs(parseFloat(getComputedStyle(indicator).top) - 40 * .1465) < 1, '插槽占位改变徽标几何')
  })
  await check('JSX 列表和折叠项保留首尾间距、分割线及受控选择', async () => {
    const options = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
    function App() {
      const [value, setValue] = useState('a')
      return <>
        <UI.CellGroup><UI.ListRow title="第一行" /><UI.ListRow title="第二行" /></UI.CellGroup>
        <UI.CellGroup options={options} mode="single" value={value} onChange={setValue} slots={{ item: ({ item, row }) => <UI.ListRow {...row} title={item.label} /> }} />
        <UI.Collapse value={value} onChange={setValue}><UI.CollapseItem value="a" title="甲内容">甲</UI.CollapseItem><UI.CollapseItem value="b" title="乙内容">乙</UI.CollapseItem></UI.Collapse>
      </>
    }
    await mount(<App />)
    const groups = [...fixture.querySelectorAll('.my-group-body')]
    for (const group of groups) {
      const [first, last] = [...group.querySelectorAll('.my-list-row')]
      assert(parseFloat(getComputedStyle(first).paddingTop) === 16 && parseFloat(getComputedStyle(last).paddingBottom) === 16, '插槽改变列表首尾间距')
      assert(getComputedStyle(last, '::before').borderTopWidth === '1px', '插槽导致列表分割线缺失')
    }
    const triggers = [...fixture.querySelectorAll<HTMLButtonElement>('.my-collapse-trigger')]
    assert(getComputedStyle(triggers[1].parentElement!).borderTopWidth === '1px', '折叠项分割线缺失')
    await event(() => triggers[1].click())
    assert(triggers[0].getAttribute('aria-expanded') === 'false' && triggers[1].getAttribute('aria-expanded') === 'true', '折叠项没有读取父级值')
    assert(groups[1].querySelector('[data-cell-value="b"]')!.getAttribute('aria-checked') === 'true', '自定义列表项选择未同步')
  })
  await check('受控 Dialog 支持动态 React 内容并在退出后释放窗口', async () => {
    function App() {
      const [open, setOpen] = useState(true), [count, setCount] = useState(0)
      return <UI.Dialog title="React 弹窗" value={open} onChange={setOpen}><button onClick={() => setCount(value => value + 1)}>内容 {count}</button></UI.Dialog>
    }
    await mount(<App />)
    await event(() => visible('.my-overlay')!.querySelector<HTMLButtonElement>('.my-dialog-body button')!.click())
    assert(visible('.my-overlay')!.textContent!.includes('内容 1'), '弹层 JSX 未更新')
    await event(() => visible('.my-overlay')!.querySelector<HTMLButtonElement>('.my-popup-actions button:last-child')!.click())
    await act(async () => { await until(() => !document.querySelector('.my-overlay')) })
  })
  await check('命令式面板通过 Popup 保留 Context，选择后返回结果并卸载 JSX', async () => {
    const Context = createContext('默认')
    const ContextText = () => <strong>{useContext(Context)}</strong>
    await mount(<Context.Provider value="弹层上下文"><UI.Popup /></Context.Provider>)
    let handle: UI.PopupHandle<string>
    await act(async () => { handle = UI.popup.showSheet<string>({ title: 'React 面板', content: ({ close }) => <><ContextText /><button onClick={() => close('done')}>选择</button></> }) })
    await tick()
    const overlay = visible('.my-sheet-overlay')!
    assert(overlay.textContent!.includes('弹层上下文'), '命令式内容丢失 Context')
    await event(() => [...overlay.querySelectorAll('button')].find(button => button.textContent === '选择')!.click())
    assert(await handle!.closed === 'done', '业务结果错误')
    await act(async () => { await until(() => !document.querySelector('.my-sheet-overlay')) })
  })
  await check('无 Popup 宿主也能渲染 JSX，closeAll 和卸载不遗留独立根', async () => {
    let removed = 0
    function Content() {
      React.useEffect(() => () => { removed++ }, [])
      return <strong>独立内容</strong>
    }
    await act(async () => { UI.popup.showDrawer({ title: '独立抽屉', content: () => <Content /> }) })
    await tick()
    assert(visible('.my-drawer-overlay')!.textContent!.includes('独立内容'), '无宿主内容未渲染')
    await act(async () => { UI.popup.closeAll(); await Promise.resolve() })
    assert(removed === 1 && !document.querySelector('.my-drawer-overlay'), '独立根未卸载')
  })
  await check('Upload 复用核心请求和受控文件列表，进度及成功状态同步 React', async () => {
    const ref = createRef<UI.UploadHandle>()
    let uploaded = 0
    function App() {
      const [files, setFiles] = useState<UI.UploadFile[]>([])
      return <><UI.Upload ref={ref} value={files} onChange={setFiles} request={async (_file, { onProgress }) => { uploaded++; onProgress(50); await pause(10); return { ok: true } }} /><output>{files[0]?.status ?? 'empty'}</output></>
    }
    await mount(<App />)
    await act(async () => { ref.current!.addFiles([new File(['hello'], 'hello.txt', { type: 'text/plain' })]); await pause(80) })
    assert(uploaded === 1 && fixture.querySelector('output')!.textContent === 'success' && fixture.textContent!.includes('hello.txt'), '受控文件列表与请求不同步')
  })
  await check('ref 轻提示操作和卸载清理保持幂等', async () => {
    const ref = createRef<UI.ToastHandle>()
    await mount(<UI.Toast ref={ref} />)
    ref.current!.show('React 提示')
    assert(document.querySelectorAll('.my-toast').length === 1 && document.querySelector('.my-toast')!.textContent!.includes('React 提示'), '重复挂载或 ref 操作失败')
    await cleanup()
    assert(ref.current === null && !document.querySelector('.my-toast'), '卸载遗留提示或 ref')
  })
  await check('全部 React 组件入口都可创建和卸载，不依赖 Vue', async () => {
    const names = Object.keys(UI).filter(name => /^[A-Z]/.test(name))
    assert(names.length === 54, '组件入口数量未与现有 Vue 对齐')
    const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/%3E'
    for (const name of names) {
      const Component = (UI as unknown as Record<string, React.ComponentType<Record<string, unknown>>>)[name]
      const value = ['Switch', 'Checkbox', 'Dialog', 'Drawer', 'Sheet', 'Floating', 'ImagePreview', 'PullRefresh', 'Notice'].includes(name) ? false
        : ['CheckboxGroup', 'Upload'].includes(name) ? [] : name === 'Slider' || name === 'Stepper' || name === 'Steps' || name === 'Progress' ? 20 : 'a'
      await mount(<Component label={name} title={name} name="home" value={value} optionValue="a" options={[]} images={[]} src={image} />)
      await cleanup()
    }
  })
  result.textContent = JSON.stringify({ passed: reports.every(report => report.passed), total: reports.length, reports }, null, 2)
}
document.querySelector<HTMLButtonElement>('#run')!.disabled = false
