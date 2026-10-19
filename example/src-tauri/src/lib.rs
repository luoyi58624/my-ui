/// 启动桌面壳，界面直接使用 example 的开发地址或构建产物。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("启动 my-ui 示例失败");
}
