/// 启动原生壳，桌面与 Android 直接使用 example 的开发地址或构建产物。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        // Android 读取系统字体字重；桌面端为空插件，不影响现有桌面壳。
        .plugin(tauri_plugin_android_system_font_weight::init())
        .plugin(tauri_plugin_native_components::Builder::new().activity_name("NativePageActivity").build())
        .run(tauri::generate_context!())
        .expect("启动 my-ui 示例失败");
}
