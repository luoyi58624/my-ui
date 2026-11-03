const paths = {
  plane: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'],
  wifi: ['M2 8.8a16 16 0 0 1 20 0', 'M5 12a11 11 0 0 1 14 0', 'M8.5 15.5a5.5 5.5 0 0 1 7 0', 'M12 19h.01'],
  bluetooth: ['m7 7 10 10-5 5V2l5 5L7 17'],
  phone: ['M7 2h10v20H7Z', 'M11 18h2'],
  connect: ['M4 5h10v14H4Z', 'M17 9h4v12h-4Z', 'M7 2h4'],
  palette: ['M12 3a9 9 0 0 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-4h2a4 4 0 0 0 4-4 8 8 0 0 0-9-6Z', 'M7 9h.01M10 6h.01M15 6h.01'],
  sun: ['M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8', 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'],
  sound: ['m11 3-6 5H2v8h3l6 5Z', 'M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  lock: ['M5 10h14v12H5Z', 'M8 10V6a4 4 0 0 1 8 0v4'],
  shield: ['m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z', 'm8 12 3 3 5-6'],
  location: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z', 'M12 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6'],
  grid: ['M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z'],
  battery: ['M2 6h17v12H2Z', 'M22 10v4M6 10v4M10 10v4M14 10v4'],
  accessibility: ['M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4', 'M3 8l9 3 9-3M12 11v5m0 0-5 6m5-6 5 6'],
  cloud: ['M6 18a5 5 0 1 1 0-10 7 7 0 0 1 13 1 4.5 4.5 0 0 1-1 9Z'],
  update: ['M20 7a9 9 0 1 0 1 9', 'M20 2v5h-5M12 7v5l3 2'],
  user: ['M20 21v-2a7 7 0 0 0-14 0v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
  help: ['M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20', 'M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3M12 18h.01'],
}

function item(id: string, title: string, icon: keyof typeof paths, color: string, summary = '', toggle = false) {
  return { id, title, paths: paths[icon], color, summary, toggle }
}

/** 设置首页的静态展示数据，Web 与原生读取同一份内容，不连接系统功能。 */
export const settingsGroups = [
  [
    item('airplane', '飞行模式', 'plane', '#ffb600', '', true),
    item('wifi', 'WLAN', 'wifi', '#13b82c', '未连接'),
    item('bluetooth', '蓝牙', 'bluetooth', '#13b82c', '未连接'),
    item('mobile', '移动网络', 'phone', '#4144f2'),
    item('connect', '设备互联', 'connect', '#7778ef'),
  ],
  [
    item('personalize', '桌面、锁屏与个性化', 'palette', '#ff7247'),
    item('display', '显示与亮度', 'sun', '#ffb600'),
    item('sound', '声音与振动', 'sound', '#4144f2'),
    item('notifications', '通知与控制中心', 'bell', '#13b82c'),
  ],
  [
    item('password', '指纹、面部与密码', 'lock', '#13b82c'),
    item('privacy', '隐私与安全', 'shield', '#13b82c'),
    item('location', '位置信息', 'location', '#4144f2'),
  ],
  [
    item('apps', '应用', 'grid', '#4144f2'),
    item('battery', '电池', 'battery', '#4144f2'),
    item('accessibility', '辅助功能', 'accessibility', '#ff7247'),
  ],
  [
    item('cloud', '云服务', 'cloud', '#13b82c'),
    item('system', '系统与更新', 'update', '#4144f2'),
    item('about', '关于本机', 'phone', '#4144f2'),
    item('account', '账号与备份', 'user', '#13b82c'),
    item('help', '帮助与反馈', 'help', '#ff7247'),
  ],
]

/** 账号卡片只展示示例文案，不读取手机账号信息。 */
export const settingsAccount = { title: '小蓝同学', summary: '管理账号、云服务与偏好', paths: paths.user }
