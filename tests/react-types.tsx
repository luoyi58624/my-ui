import React, { createRef, useState } from 'react'
import { Input, Switch, Checkbox, Radio, Slider, Picker, Calendar, TagGroup, Menu, Popup, popup, type InputHandle, type UploadFile, Upload } from '../packages/react'

/** 真实 JSX 消费端的类型检查，验证统一值回调和泛型值推导。 */
export function ReactTypes() {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const [range, setRange] = useState([20, 60])
  const [tags, setTags] = useState<string[]>([])
  const [date, setDate] = useState<string | null>(null)
  const [picker, setPicker] = useState<number | null>(1)
  const [files, setFiles] = useState<UploadFile[]>([])
  const input = createRef<InputHandle>()
  return <>
    <Input ref={input} label="姓名" value={text} onChange={setText} readOnly maxLength={20} autoComplete="name" style={{ '--input-height': '48px' }} />
    <Switch label="开关" value={checked} onChange={setChecked} />
    <Checkbox label="勾选" value={checked} optionValue="a" onChange={setChecked} />
    <Radio label="选项" value={text} optionValue="a" onChange={setText} />
    <Slider label="范围" value={range} onChange={setRange} />
    <Picker value={picker} options={[{ value: 1, label: '一' }]} onChange={setPicker} />
    <Calendar value={date} onChange={setDate} />
    <TagGroup label="标签" value={tags} options={[]} onChange={setTags} />
    <Menu value={tags} mode="multiple" options={[]} onChange={setTags} />
    <Upload value={files} onChange={setFiles} />
    <Popup />
  </>
}

// @ts-expect-error 开关值必须为布尔值，不能接受字符串。
const invalidSwitch = <Switch label="开关" value="wrong" />
// @ts-expect-error 输入框的值回调接收字符串，不是 DOM 事件。
const invalidInput = <Input label="姓名" onChange={(event: Event) => event.preventDefault()} />
// @ts-expect-error 泛型值与回调不能分别使用标量和数组。
const invalidSlider = <Slider label="范围" value={[10, 20]} onChange={(value: number) => value.toFixed()} />
void [invalidSwitch, invalidInput, invalidSlider]
const typedSheet = () => popup.showSheet<string>({ title: '选择', content: ({ close }) => <button onClick={() => close('a')}>选择 A</button> })
void typedSheet
