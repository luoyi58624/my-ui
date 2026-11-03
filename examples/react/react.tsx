import React, { StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Card, Input, Switch, CheckboxGroup, Select, Slider, Tabs, Tag, Toast, Popup, popup, type ToastHandle } from '@my-ui/react'

const cities = [{ value: 'hangzhou', label: '杭州' }, { value: 'shanghai', label: '上海' }]
const topics = [{ value: 'news', label: '产品更新' }, { value: 'tips', label: '使用技巧' }]
const tabs = [{ value: 'profile', label: '资料' }, { value: 'settings', label: '偏好' }]

function App() {
  const [name, setName] = useState('小蓝')
  const [city, setCity] = useState('hangzhou')
  const [enabled, setEnabled] = useState(true)
  const [selectedTopics, setTopics] = useState(['news'])
  const [volume, setVolume] = useState(60)
  const [tab, setTab] = useState('profile')
  const toast = useRef<ToastHandle>(null)
  async function save() {
    if (await popup.showAlert({ title: '保存资料', message: `保存 ${name} 的设置？`, center: true }))
      toast.current?.show('已保存')
  }
  return <main className="react-demo">
    <header><p className="react-eyebrow">MY UI / REACT</p><h1>React 组件示例</h1><p>共享同一套 CSS，用 value 和 onChange 管理动态状态。</p></header>
    <Card title="个人资料" description="修改输入后，预览同步更新。">
      <div className="react-form">
        <Input label="姓名" value={name} onChange={setName} clearable />
        <Select label="所在城市" value={city} options={cities} onChange={setCity} />
        <div className="react-row"><Switch label="接收通知" value={enabled} onChange={setEnabled} /><span>接收通知</span></div>
        <CheckboxGroup label="订阅内容" value={selectedTopics} options={topics} onChange={setTopics} />
        <Slider label="音量" value={volume} onChange={setVolume} />
        <div className="react-row"><Button onClick={save}>保存资料</Button><Tag tone="green">{enabled ? '通知已开启' : '通知已关闭'}</Tag></div>
      </div>
    </Card>
    <Card title="动态内容" description="页签内容可以直接读取 React 状态。">
      <Tabs label="预览" value={tab} options={tabs} onChange={setTab}>
        {({ value }) => <p className="react-preview">{value === 'profile' ? `${name || '新朋友'} · ${cities.find(item => item.value === city)?.label}` : `音量 ${volume}，已选择 ${selectedTopics.length} 项订阅。`}</p>}
      </Tabs>
    </Card>
    <Toast ref={toast} />
    <Popup />
  </main>
}

createRoot(document.querySelector('#app')!).render(<StrictMode><App /></StrictMode>)
