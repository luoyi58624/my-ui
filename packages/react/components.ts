import type { ReactElement } from 'react'
import type { PickerValue } from '../../lib/my-ui'
import { createComponent } from './adapter'
import type * as Types from './types'

/** AppBar 薄封装，共用原生样式与行为。 */
export const AppBar = createComponent<Types.AppBarProps>({"name":"AppBar","properties":["title","subtitle","back","backLabel","center","sticky"],"events":["onBack"]})

/** Avatar 薄封装，共用原生样式与行为。 */
export const Avatar = createComponent<Types.AvatarProps>({"name":"Avatar","properties":["src","alt","text","size","shape"],"events":["onLoad","onError"]})

/** Badge 薄封装，共用原生样式与行为。 */
export const Badge = createComponent<Types.BadgeProps>({"name":"Badge","properties":["value","max","dot","showZero","hidden","label"],"events":[]})

/** Button 薄封装，共用原生样式与行为。 */
export const Button = createComponent<Types.ButtonProps>({"name":"Button","properties":["variant","icon","disabled","loading","selected","delayTouchDown","delayTouchUp","type","label"],"events":["onClick"]})

/** Calendar 薄封装，共用原生样式与行为。 */
export const Calendar = createComponent<Types.CalendarProps<any>>({"name":"Calendar","properties":["value","range","month","min","max","disabledDate","firstDayOfWeek","label","disabled"],"events":["onChange","onSelect","onMonthChange"],"model":true}) as <T extends string | readonly string[] | null = string | string[] | null>(props: Types.CalendarProps<T>) => ReactElement

/** Card 薄封装，共用原生样式与行为。 */
export const Card = createComponent<Types.CardProps>({"name":"Card","properties":["title","description","sample","interactive","delayTouchDown","delayTouchUp"],"events":["onActivate"]})

/** CellGroup 薄封装，共用原生样式与行为。 */
export const CellGroup = createComponent<Types.CellGroupProps<any>>({"name":"CellGroup","properties":["title","description","mode","value","options","label","disabled"],"events":["onChange","onSelect"],"model":true}) as <T extends string | string[] = string | string[]>(props: Types.CellGroupProps<T>) => ReactElement

/** Checkbox 薄封装，共用原生样式与行为。 */
export const Checkbox = createComponent<Types.CheckboxProps>({"name":"Checkbox","properties":["value","optionValue","label","description","indeterminate","disabled","name"],"events":["onChange","onIndeterminateChange"],"model":true})

/** CheckboxGroup 薄封装，共用原生样式与行为。 */
export const CheckboxGroup = createComponent<Types.CheckboxGroupProps>({"name":"CheckboxGroup","properties":["value","label","options","disabled","inline","name"],"events":["onChange"],"model":true})

/** Choices 薄封装，共用原生样式与行为。 */
export const Choices = createComponent<Types.ChoicesProps>({"name":"Choices","properties":["value","label","options","type","list","disabled"],"events":["onChange"],"model":true})

/** Collapse 薄封装，共用原生样式与行为。 */
export const Collapse = createComponent<Types.CollapseProps<any>>({"name":"Collapse","properties":["value","disabled","label"],"events":["onChange"],"model":true}) as <T extends string | string[]>(props: Types.CollapseProps<T>) => ReactElement

/** CollapseItem 薄封装，共用原生样式与行为。 */
export const CollapseItem = createComponent<Types.CollapseItemProps>({"name":"CollapseItem","properties":["value","title","disabled"],"events":[]})

/** Combobox 薄封装，共用原生样式与行为。 */
export const Combobox = createComponent<Types.ComboboxProps>({"name":"Combobox","properties":["value","options","label","id","name","placeholder","clearable","disabled","loading","filter","emptyText","required","error","hint"],"events":["onChange","onSearch","onSelect"],"model":true})

/** DatePicker 薄封装，共用原生样式与行为。 */
export const DatePicker = createComponent<Types.DatePickerProps>({"name":"DatePicker","properties":["value","min","max","label","disabled"],"events":["onChange"],"model":true})

/** Dialog 薄封装，共用原生样式与行为。 */
export const Dialog = createComponent<Types.DialogProps>({"name":"Dialog","properties":["value","title","description","icon","cancelText","confirmText","center","danger","closeOnBackdrop","closeOnEscape"],"events":["onChange","onConfirm","onCancel","onAfterLeave"],"model":true})

/** Divider 薄封装，共用原生样式与行为。 */
export const Divider = createComponent<Types.DividerProps>({"name":"Divider","properties":["vertical","align","dashed"],"events":[]})

/** Drawer 薄封装，共用原生样式与行为。 */
export const Drawer = createComponent<Types.DrawerProps>({"name":"Drawer","properties":["value","title","placement","swipeable","closeOnBackdrop","closeOnEscape"],"events":["onChange","onClose","onAfterLeave"],"model":true})

/** Empty 薄封装，共用原生样式与行为。 */
export const Empty = createComponent<Types.EmptyProps>({"name":"Empty","properties":["state","title","description","icon"],"events":[]})

/** Floating 薄封装，共用原生样式与行为。 */
export const Floating = createComponent<Types.FloatingProps>({"name":"Floating","properties":["value","anchor","placement","matchWidth","motion"],"events":["onChange","onPositioned","onAfterLeave"],"model":true})

/** Form 薄封装，共用原生样式与行为。 */
export const Form = createComponent<Types.FormProps>({"name":"Form","properties":["layout"],"events":[]})

/** FormField 薄封装，共用原生样式与行为。 */
export const FormField = createComponent<Types.FormFieldProps>({"name":"FormField","properties":["label","id","required","error","hint","group"],"events":[]})

/** Icon 薄封装，共用原生样式与行为。 */
export const Icon = createComponent<Types.IconProps>({"name":"Icon","properties":["name"],"events":[]})

/** Image 薄封装，共用原生样式与行为。 */
export const Image = createComponent<Types.ImageProps>({"name":"Image","properties":["src","alt","width","height","ratio","fit","loading"],"events":["onLoad","onError"]})

/** ImagePreview 薄封装，共用原生样式与行为。 */
export const ImagePreview = createComponent<Types.ImagePreviewProps>({"name":"ImagePreview","properties":["value","images","startIndex","title","maxZoom","closeOnEscape"],"events":["onChange","onIndexChange","onClose","onAfterLeave"],"model":true})

/** Input 薄封装，共用原生样式与行为。 */
export const Input = createComponent<Types.InputProps>({"name":"Input","properties":["value","label","id","type","passwordToggle","placeholder","icon","clearable","maxlength","disabled","readonly","required","error","hint","autocomplete"],"events":["onChange"],"model":true})

/** ListRow 薄封装，共用原生样式与行为。 */
export const ListRow = createComponent<Types.ListRowProps>({"name":"ListRow","properties":["title","description","valueText","toggle","value","disabled","delayTouchDown","delayTouchUp"],"events":["onClick","onChange"],"model":true})

/** Loading 薄封装，共用原生样式与行为。 */
export const Loading = createComponent<Types.LoadingProps>({"name":"Loading","properties":["size","label"],"events":[]})

/** Menu 薄封装，共用原生样式与行为。 */
export const Menu = createComponent<Types.MenuProps<any>>({"name":"Menu","properties":["options","label","value","mode","open","trigger","anchor","placement","matchWidth","motion","disabled","closeOnSelect","hoverDelay"],"events":["onChange","onOpenChange","onSelect"],"model":true}) as <T extends string | string[] = string | string[]>(props: Types.MenuProps<T>) => ReactElement

/** Navigation 薄封装，共用原生样式与行为。 */
export const Navigation = createComponent<Types.NavigationProps>({"name":"Navigation","properties":["value","options","label"],"events":["onChange"],"model":true})

/** Notice 薄封装，共用原生样式与行为。 */
export const Notice = createComponent<Types.NoticeProps>({"name":"Notice","properties":["value","type","title","message","closable","icon"],"events":["onChange","onClose"],"model":true})

/** Picker 薄封装，共用原生样式与行为。 */
export const Picker = createComponent<Types.PickerProps<any>>({"name":"Picker","properties":["value","options","columns","label","columnLabels","disabled"],"events":["onChange"],"model":true}) as <T extends PickerValue | readonly PickerValue[] = PickerValue | PickerValue[]>(props: Types.PickerProps<T>) => ReactElement

/** Popover 薄封装，共用原生样式与行为。 */
export const Popover = createComponent<Types.PopoverProps>({"name":"Popover","properties":["value","label","options"],"events":["onChange"],"model":true})

/** Progress 薄封装，共用原生样式与行为。 */
export const Progress = createComponent<Types.ProgressProps>({"name":"Progress","properties":["value","buffer","max","type","status","label","showText"],"events":[]})

/** PullRefresh 薄封装，共用原生样式与行为。 */
export const PullRefresh = createComponent<Types.PullRefreshProps>({"name":"PullRefresh","properties":["value","disabled","label"],"events":["onChange","onRefresh"],"model":true})

/** Radio 薄封装，共用原生样式与行为。 */
export const Radio = createComponent<Types.RadioProps>({"name":"Radio","properties":["value","optionValue","label","description","disabled","name"],"events":["onChange"],"model":true})

/** RadioGroup 薄封装，共用原生样式与行为。 */
export const RadioGroup = createComponent<Types.RadioGroupProps>({"name":"RadioGroup","properties":["value","label","options","disabled","inline","name"],"events":["onChange"],"model":true})

/** Segmented 薄封装，共用原生样式与行为。 */
export const Segmented = createComponent<Types.SegmentedProps>({"name":"Segmented","properties":["value","options","label"],"events":["onChange"],"model":true})

/** Select 薄封装，共用原生样式与行为。 */
export const Select = createComponent<Types.SelectProps>({"name":"Select","properties":["value","label","options","disabled"],"events":["onChange"],"model":true})

/** Sheet 薄封装，共用原生样式与行为。 */
export const Sheet = createComponent<Types.SheetProps>({"name":"Sheet","properties":["value","title","actions","cancelText","confirmText","danger","swipeable","closeOnBackdrop","closeOnEscape"],"events":["onChange","onSelect","onCancel","onConfirm","onAfterLeave"],"model":true})

/** Skeleton 薄封装，共用原生样式与行为。 */
export const Skeleton = createComponent<Types.SkeletonProps>({"name":"Skeleton","properties":["loading","rows","avatar","label"],"events":[]})

/** Slider 薄封装，共用原生样式与行为。 */
export const Slider = createComponent<Types.SliderProps<any>>({"name":"Slider","properties":["value","buffer","label","min","max","step","marks","valueLabelDisplay","valueLabelFormat","getAriaValueText","disabled","unit","startLabel","endLabel"],"events":["onChange"],"model":true}) as <T extends number | number[]>(props: Types.SliderProps<T>) => ReactElement

/** Stepper 薄封装，共用原生样式与行为。 */
export const Stepper = createComponent<Types.StepperProps>({"name":"Stepper","properties":["value","min","max","step","label"],"events":["onChange"],"model":true})

/** Steps 薄封装，共用原生样式与行为。 */
export const Steps = createComponent<Types.StepsProps>({"name":"Steps","properties":["value","options","status","label","vertical","interactive","disabled"],"events":["onChange"],"model":true})

/** Switch 薄封装，共用原生样式与行为。 */
export const Switch = createComponent<Types.SwitchProps>({"name":"Switch","properties":["value","label","disabled"],"events":["onChange"],"model":true})

/** Tabbar 薄封装，共用原生样式与行为。 */
export const Tabbar = createComponent<Types.TabbarProps>({"name":"Tabbar","properties":["value","options","label"],"events":["onChange"],"model":true})

/** Tabs 薄封装，共用原生样式与行为。 */
export const Tabs = createComponent<Types.TabsProps>({"name":"Tabs","properties":["value","options","label","swipeable"],"events":["onChange"],"model":true})

/** Tag 薄封装，共用原生样式与行为。 */
export const Tag = createComponent<Types.TagProps>({"name":"Tag","properties":["value","tone","disabled","label"],"events":["onChange","onClick"],"model":true})

/** TagGroup 薄封装，共用原生样式与行为。 */
export const TagGroup = createComponent<Types.TagGroupProps<any>>({"name":"TagGroup","properties":["value","options","label","disabled"],"events":["onChange"],"model":true}) as <T extends string | string[]>(props: Types.TagGroupProps<T>) => ReactElement

/** Textarea 薄封装，共用原生样式与行为。 */
export const Textarea = createComponent<Types.TextareaProps>({"name":"Textarea","properties":["value","label","id","placeholder","rows","maxlength","disabled","readonly","required","error","hint"],"events":["onChange"],"model":true})

/** TimePicker 薄封装，共用原生样式与行为。 */
export const TimePicker = createComponent<Types.TimePickerProps>({"name":"TimePicker","properties":["value","min","max","minuteStep","secondStep","showSeconds","label","disabled"],"events":["onChange"],"model":true})

/** Toast 薄封装，共用原生样式与行为。 */
export const Toast = createComponent<Types.ToastProps>({"name":"Toast","properties":["duration"],"events":[]})

/** Tooltip 薄封装，共用原生样式与行为。 */
export const Tooltip = createComponent<Types.TooltipProps>({"name":"Tooltip","properties":["content","placement","arrow","delay","hideDelay","longPressDelay","copyable","disabled","value"],"events":["onChange"],"model":true})

/** Upload 薄封装，共用原生样式与行为。 */
export const Upload = createComponent<Types.UploadProps>({"name":"Upload","properties":["value","label","accept","multiple","maxCount","maxSize","drag","disabled","autoUpload","request","hint"],"events":["onChange","onReject","onSuccess","onError","onCancel","onRemove"],"model":true})
