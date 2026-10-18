/** 实际渲染的明暗主题。 */
export type ThemeMode = "light" | "dark";

/** 外观偏好，系统模式随 prefers-color-scheme 更新。 */
export type ThemePreference = ThemeMode | "system";

/** 三组人工设计的界面层级风格。 */
export type ThemeStyleId = "soft" | "clear" | "warm";

/** 精选主色名称，其中四种亮色仅供暗色主题使用。 */
export type ThemeColorId =
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "red"
  | "teal"
  | "green"
  | "cyan"
  | "brown"
  | "slate"
  | "yellow"
  | "amber"
  | "orange"
  | "lime";

/** 主色分别为浅色界面与暗色界面选值，不从单个种子自动生成。 */
export interface ThemeColorPreset {
  /** 配置时使用的主色名称。 */
  id: ThemeColorId;
  /** 显示名称。 */
  label: string;
  /** 浅色主题的主色，缺省表示仅供暗色主题使用。 */
  light?: string;
  /** 暗色主题的主色。 */
  dark: string;
}

/** 组件共用的背景、文本和反馈约定，布局继续由组件自身维护。 */
export interface ThemeLayers {
  /** 页面背景。 */
  background: string;
  /** 卡片与弹层背景。 */
  cardBackground: string;
  /** 输入框、分段轨道与次要按钮的填充背景。 */
  fill: string;
  /** 描边与分割线。 */
  border: string;
  /** 正文。 */
  text: string;
  /** 补充说明。 */
  textSecondary: string;
  /** 未开启的开关与中性图形。 */
  gray: string;
  /** 桌面悬停背景。 */
  hover: string;
  /** 按压背景。 */
  press: string;
  /** 分段选择的选中滑块背景，不用于菜单选中行。 */
  selectedBackground: string;
  /** 选中滑块的边界与阴影。 */
  selectedShadow: string;
  /** 轻浮起的控件与小型工具栏使用的短阴影。 */
  smallShadow: string;
  /** 卡片贴近页面的短距轻阴影。 */
  shadow: string;
  /** 菜单等非模态浮层的边缘阴影与下方投影。 */
  popupShadow: string;
  /** 对话框、抽屉与底部面板使用的较宽投影。 */
  modalShadow: string;
  /** 模态遮罩。 */
  overlay: string;
  /** 成功状态。 */
  success: string;
  /** 提醒状态。 */
  warning: string;
  /** 错误状态。 */
  danger: string;
}

/** 一份主题选择；通常只需 color 与 style，个别颜色和阴影可按需覆写。 */
export interface ThemeData extends Partial<ThemeLayers> {
  /** 精选主色名称，默认蓝色。 */
  color?: ThemeColorId;
  /** 整体层级风格，默认柔和。 */
  style?: ThemeStyleId;
  /** 自定义主色，接受 #RGB 或 #RRGGBB，优先于预设主色。 */
  primary?: string;
}

/** 浅色与暗色主题独立配置，切换模式不会覆盖另一份配置。 */
export interface ThemeOptions {
  /** 浅色、暗色或跟随系统，默认浅色。 */
  mode?: ThemePreference;
  /** 模态弹层是否模糊背景，默认开启，明暗主题共用此偏好。 */
  backdropBlur?: boolean;
  /** 全局基础字重，100～1000，默认 400；明暗模式共用。 */
  fontWeight?: number;
  /** 浅色主题数据。 */
  light?: ThemeData;
  /** 暗色主题数据。 */
  dark?: ThemeData;
  /** 兼容原单主色配置；新配置建议分别写入 light.primary 和 dark.primary。 */
  primary?: string;
}

/** 解析完成的实际主题数据。 */
export interface ResolvedTheme {
  mode: ThemeMode;
  style: ThemeStyleId;
  color: ThemeColorId;
  colors: ThemeLayers & { primary: string; primaryText: string };
  primary: string;
  "primary-text": string;
  backdropBlur: boolean;
  fontWeight: number;
}
/** 解析并验证两套独立主题。 */
export declare function createTheme(
  options?: ThemeOptions,
  systemDark?: boolean,
): ResolvedTheme;
/** 应用主题，返回取消系统外观监听的方法。 */
export declare function applyTheme(options?: ThemeOptions): () => void;
/** 精选主色。 */
export declare const themeColors: readonly ThemeColorPreset[];
/** 明暗层级风格。 */
export declare const themeStyles: readonly {
  id: ThemeStyleId;
  label: string;
  description: string;
  light: ThemeLayers;
  dark: ThemeLayers;
}[];
/** 默认主题配置。 */
export declare const defaultThemeOptions: {
  mode: "light";
  backdropBlur: true;
  fontWeight: 400;
  light: { color: "blue"; style: "soft" };
  dark: { color: "blue"; style: "soft" };
};
