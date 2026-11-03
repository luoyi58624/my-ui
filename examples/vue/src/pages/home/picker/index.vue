<script setup lang="ts">
import DemoExample from '../../../components/DemoExample.vue'
import { computed, ref } from 'vue'
import { Button, Card, Picker, Sheet, type PickerOption, type PickerValue } from '@my-ui/vue'

// #region picker-single
const drink = ref('tea')
const drinks: PickerOption[] = [
  { value: 'water', label: '矿泉水' },
  { value: 'tea', label: '茉莉花茶' },
  { value: 'latte', label: '燕麦拿铁' },
  { value: 'espresso', label: '浓缩咖啡 · 售罄', disabled: true },
  { value: 'juice', label: '鲜榨橙汁' },
  { value: 'milk', label: '热牛奶' }
]
// #endregion
// #region picker-columns
const time = ref<PickerValue[]>(['09', '30'])
const timeColumns: PickerOption[][] = [
  Array.from({ length: 14 }, (_, index) => {
    const value = String(index + 7).padStart(2, '0')
    return { value, label: value + ' 时' }
  }),
  ['00', '15', '30', '45'].map((value) => ({ value, label: value + ' 分' }))
]
// #endregion
// #region picker-cascade
const areas: PickerOption[] = [
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'gongshu', label: '拱墅区' },
          { value: 'binjiang', label: '滨江区' }
        ]
      },
      {
        value: 'ningbo',
        label: '宁波市',
        children: [
          { value: 'haishu', label: '海曙区' },
          { value: 'yinzhou', label: '鄞州区' }
        ]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          { value: 'xuanwu', label: '玄武区' },
          { value: 'gulou', label: '鼓楼区' }
        ]
      },
      {
        value: 'suzhou',
        label: '苏州市',
        children: [
          { value: 'gusu', label: '姑苏区' },
          { value: 'wuzhong', label: '吴中区' }
        ]
      }
    ]
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      {
        value: 'shanghai-city',
        label: '上海市',
        children: [
          { value: 'huangpu', label: '黄浦区' },
          { value: 'xuhui', label: '徐汇区' },
          { value: 'jingan', label: '静安区' }
        ]
      }
    ]
  }
]
const area = ref<PickerValue[]>(['zhejiang', 'hangzhou', 'xihu']),
  draft = ref<PickerValue[]>([]),
  open = ref(false)
const areaName = computed(() => {
  let items: readonly PickerOption[] = areas
  return area.value
    .map((value) => {
      const item = items.find((item) => item.value === value)
      items = item?.children ?? []
      return item?.label ?? ''
    })
    .join(' / ')
})
function chooseArea() {
  draft.value = [...area.value]
  open.value = true
}
function confirmArea() {
  area.value = [...draft.value]
}
// #endregion
</script>

<template>
  <section id="picker" class="picker-showcase">
    <div class="picker-examples">
      <DemoExample
        name="picker-single"
        source="pages/home/picker/index.vue"
        title="单列选择"
        description="传入 options 创建单列滚轮，禁用的选项会自动跳过。"
      >
        <Picker v-model="drink" :options="drinks" :column-labels="['饮品']" label="选择饮品" />
        <p>
          已选
          <strong>{{ drinks.find((item) => item.value === drink)?.label }}</strong>
        </p>
      </DemoExample>
      <DemoExample
        name="picker-columns"
        source="pages/home/picker/index.vue"
        title="独立多列"
        description="columns 为各列提供独立选项，v-model 使用数组保存各列值。"
      >
        <Picker
          v-model="time"
          :columns="timeColumns"
          label="预约时间"
          :column-labels="['小时', '分钟']"
        />
        <p>
          到店时间
          <strong>{{ time.join(':') }}</strong>
        </p>
      </DemoExample>
    </div>
    <DemoExample
      name="picker-cascade"
      source="pages/home/picker/index.vue"
      title="级联与底部面板"
      description="选项通过 children 定义联动列，先在面板里修改草稿，确认后保存。"
    >
      <div class="picker-area">
        <div>
          <h4>配送地区</h4>
          <p>{{ areaName }}</p>
        </div>
        <Button variant="outline" @click="chooseArea">选择地区</Button>
      </div>
      <Sheet v-model="open" title="选择配送地区" confirm-text="确定" @confirm="confirmArea">
        <div class="picker-sheet-content">
          <Picker
            v-model="draft"
            :options="areas"
            :column-labels="['省份', '城市', '区县']"
            label="配送地区"
          />
        </div>
      </Sheet>
    </DemoExample>
  </section>
</template>

<style scoped>
.picker-showcase {
  scroll-margin-top: 110px;
}
.picker-examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 48px;
}
.picker-examples section {
  min-width: 0;
}
.picker-example-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}
.picker-example-heading h4,
.picker-area h4 {
  margin: 0;
  font-size: 14px;
  font-weight: var(--font-weight-subtitle, 600);
}
.picker-example-heading span,
.picker-help {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.7;
}
.picker-examples section > p {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}
.picker-examples strong {
  color: var(--primary);
  font-weight: var(--font-weight-subtitle, 600);
}
.picker-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  margin-top: 28px;
  border-top: 1px solid var(--border);
}
.picker-area p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.7;
}
.picker-help {
  margin: 20px 0 0;
}
.picker-sheet-content {
  padding: 8px 20px 20px;
}
@media (max-width: 760px) {
  .picker-examples {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
