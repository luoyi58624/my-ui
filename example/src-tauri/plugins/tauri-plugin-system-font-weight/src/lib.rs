//! 读取 Android 系统字体字重（CSS `wght` 轴，取值 100–1000）。
//!
//! 真正的采集与字重反推在 Kotlin 侧（`mobile/android`）：
//! 国产 ROM 私有设置采集 + Paint 墨水覆盖探针，由 Flutter 版插件移植而来。
//! Rust 侧只负责在 Android 上挂载对应 Kotlin 插件；其它平台为空壳。

use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

/// Kotlin 插件所在包名，需与 mobile/android 的 namespace、类包路径一致。
#[cfg(target_os = "android")]
const ANDROID_PACKAGE: &str = "com.luoyi.systemfontweight";
/// Kotlin 插件类名（单 Activity 参数构造，由 Tauri 反射实例化）。
#[cfg(target_os = "android")]
const ANDROID_CLASS: &str = "SystemFontWeightPlugin";

/// 注册系统字重插件。前端命令：`plugin:system-font-weight|getRawData`、`getWght`。
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("system-font-weight")
        .setup(|_app, api| {
            #[cfg(target_os = "android")]
            {
                api.register_android_plugin(ANDROID_PACKAGE, ANDROID_CLASS)?;
            }
            // 桌面端无对应原生插件，保留空 setup。
            #[cfg(not(target_os = "android"))]
            {
                let _ = api;
            }
            Ok(())
        })
        .build()
}
