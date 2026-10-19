// 命令名需与 Kotlin 侧 @Command 方法名一致（Tauri 移动插件按此反射分发）。
const COMMANDS: &[&str] = &["getRawData", "getWght"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        // Kotlin 库位于 mobile/android（tauri-plugin 据此导出 cargo:android_library_path）。
        .android_path("mobile/android")
        .build();
}
