mod appearance;
mod overlay_back;

/// 启动原生壳，桌面与 Android 直接使用 example 的开发地址或构建产物。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            appearance::set_app_theme,
            overlay_back::set_overlay_back_enabled
        ])
        .plugin(tauri_plugin_store::Builder::default().build())
        // Android 读取系统字体字重；桌面端为空插件，不影响现有桌面壳。
        .plugin(tauri_plugin_android_system_font_weight::init())
        .plugin(tauri_plugin_native_router::init("NativePageActivity"))
        .run(tauri::generate_context!())
        .expect("启动 my-ui 示例失败");
}
