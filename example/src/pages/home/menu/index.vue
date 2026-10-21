<script setup lang="ts">
import { inject, ref } from 'vue'
import { notifyKey } from '../../../commons/notify'
import DemoExample from '../../../components/DemoExample.vue'
import { Button, Card, Icon, Menu, type Option, type MenuOption } from '@my-ui/vue'

const notify = inject(notifyKey)!
// #region menu-basic
const actions: Option[] = [
  { value: 'open', label: '打开笔记', icon: 'image' },
  { value: 'favorite', label: '加入收藏', icon: 'heart' },
  { value: 'copy', label: '复制到分组', icon: 'copy' },
  { value: 'share', label: '分享笔记', icon: 'share', disabled: true }
]
// #endregion
// #region menu-selection
const category = ref<string | string[]>('日常灵感')
const categories: Option[] = [
  '日常灵感',
  '城市散步',
  '旅行计划',
  '生活记录',
  '设计收藏',
  '周末清单',
  '阅读笔记',
  '想去的地方',
  '摄影练习',
  '声音日记',
  '咖啡时光',
  '食物与风景',
  '运动打卡',
  '手作收藏',
  '今年的愿望',
  '待整理'
].map((value) => ({ value, label: value }))
const sync = ref<string | string[]>(['documents'])
const syncOptions: Option[] = [
  { value: 'documents', label: '同步文档' },
  { value: 'images', label: '同步图片' },
  { value: 'favorites', label: '同步收藏' }
]
// #endregion
// #region menu-context
const checklistActions: Option[] = [
  { value: 'open', label: '查看清单', icon: 'image' },
  { value: 'done', label: '标记完成', icon: 'check' },
  { value: 'copy', label: '复制清单', icon: 'copy' }
]
// #endregion
function selected(item: Option) {
  notify('已选择：' + item.label)
}
// #region menu-cascade
const cascadeActions: MenuOption[] = [
  { value: 'view', label: '查看笔记', icon: 'image' },
  {
    value: 'move',
    label: '移动到',
    description: '选择笔记的目标分类',
    icon: 'inbox',
    children: [
      { value: 'inspiration', label: '日常灵感', description: '收集每一个好点子' },
      { value: 'design', label: '设计收藏' },
      { value: 'travel', label: '旅行计划' },
      { value: 'archive', label: '归档', disabled: true }
    ]
  },
  {
    value: 'export',
    label: '导出为',
    icon: 'share',
    children: [
      { value: 'pdf', label: 'PDF 文档' },
      { value: 'markdown', label: 'Markdown' },
      { value: 'text', label: '纯文本' }
    ]
  },
  { value: 'duplicate', label: '创建副本', icon: 'copy' }
]
// #endregion
</script>

<template>
  <div class="menu-showcase">
    <DemoExample
      name="menu-basic"
      source="pages/home/menu/index.vue"
      title="基础菜单"
      description="通过 trigger 插槽绑定触发器，菜单在按压位置展开。"
    >
      <Menu :options="actions" label="笔记操作" @select="selected">
        <template #default="{ trigger }">
          <button v-bind="trigger" type="button" class="press-area">
            <Icon name="image" />
            <strong>周末的好风景</strong>
            <span>点击卡片的任意位置</span>
          </button>
        </template>
      </Menu>
    </DemoExample>
    <DemoExample
      name="menu-context"
      setup="menu-basic menu-context"
      source="pages/home/menu/index.vue"
      title="右键菜单"
      description="trigger 设置为 contextmenu，右键区域与更多按钮可共用同一组选项。"
    >
      <div class="context-notes">
        <Menu trigger="contextmenu" :options="actions" label="右键笔记操作" @select="selected">
          <template #default="{ trigger }">
            <div v-bind="trigger" class="context-area" aria-label="灵感笔记，右键打开操作菜单">
              <Icon name="inbox" />
              <div>
                <strong>灵感笔记</strong>
                <span>右键打开，或使用更多按钮</span>
              </div>
              <Menu :options="actions" label="更多笔记操作" @select="selected">
                <template #default="{ trigger: more }">
                  <Button v-bind="more" variant="bare" icon="grid" aria-label="更多笔记操作" />
                </template>
              </Menu>
            </div>
          </template>
        </Menu>
        <Menu
          trigger="contextmenu"
          :options="checklistActions"
          label="右键清单操作"
          @select="selected"
        >
          <template #default="{ trigger }">
            <div v-bind="trigger" class="context-area" aria-label="周末清单，右键打开操作菜单">
              <Icon name="check" />
              <div>
                <strong>周末清单</strong>
                <span>右键此处，切换当前菜单</span>
              </div>
              <Menu :options="checklistActions" label="更多清单操作" @select="selected">
                <template #default="{ trigger: more }">
                  <Button v-bind="more" variant="bare" icon="grid" aria-label="更多清单操作" />
                </template>
              </Menu>
            </div>
          </template>
        </Menu>
      </div>
      <p class="menu-note">右键松开打开；触屏长按打开；键盘支持 Shift + F10。</p>
    </DemoExample>
    <DemoExample
      name="menu-selection"
      source="pages/home/menu/index.vue"
      title="单选与多选菜单"
      description="mode 控制选择模式，v-model 同步当前选择。"
    >
      <div class="choice-menus">
        <Menu
          v-model="category"
          :options="categories"
          mode="single"
          label="笔记分类"
          @select="selected"
        >
          <template #default="{ trigger }">
            <Button v-bind="trigger" variant="outline">
              {{ category }}
              <Icon name="chevrons-up-down" />
            </Button>
          </template>
        </Menu>
        <Menu v-model="sync" :options="syncOptions" mode="multiple" label="快捷同步">
          <template #default="{ trigger }">
            <Button v-bind="trigger" variant="outline">
              同步内容 · {{ Array.isArray(sync) ? sync.length : 0 }} 项
              <Icon name="sliders" />
            </Button>
          </template>
        </Menu>
      </div>
    </DemoExample>
    <DemoExample
      name="menu-cascade"
      source="pages/home/menu/index.vue"
      title="级联菜单"
      description="选项的 children 定义子菜单，适合有层级的操作。"
    >
      <Menu :options="cascadeActions" label="级联笔记操作" @select="selected">
        <template #default="{ trigger }">
          <Button v-bind="trigger" variant="outline">
            <Icon name="grid" />
            笔记操作
            <Icon name="chevrons-up-down" />
          </Button>
        </template>
      </Menu>
      <p class="menu-note">
        桌面悬停
        200ms，移动端点击展开。触发行衔接为子菜单标题，父层缩小并露出；点击父层或标题返回，外部按下关闭。
      </p>
    </DemoExample>
  </div>
</template>

<style scoped>
.menu-showcase {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.press-area {
  width: 100%;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  padding: 22px;
  border: 0;
  border-radius: 18px;
  background: var(--fill);
  color: var(--text);
  text-align: left;
}
.press-area > svg {
  width: 24px;
  height: 24px;
  color: var(--primary);
}
.press-area strong,
.context-area strong {
  font-size: 15px;
  font-weight: var(--font-weight-action, 500);
}
.press-area span,
.context-area span,
.menu-note {
  font-size: 13px;
  font-weight: var(--font-weight, 400);
  color: var(--text-secondary);
  line-height: 1.6;
}
.context-notes {
  display: grid;
  gap: 12px;
}
.context-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  min-width: 0;
  user-select: none;
}
.context-area > svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--primary);
}
.context-area > div {
  min-width: 0;
}
.context-area > div:not(.my-menu-host) {
  flex: 1;
}
.context-area strong,
.context-area span {
  display: block;
}
.context-area span {
  margin-top: 4px;
}
.menu-note {
  margin: 16px 0 0;
}
.choice-menus {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
@media (hover: hover) and (pointer: fine) {
  .press-area:hover {
    background: var(--hover);
  }
}
.press-area:active {
  background: var(--press);
}
@media (max-width: 680px) {
  .menu-showcase {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
