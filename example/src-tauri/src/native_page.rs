const PAGE_PREFIX: &str = "native-page-";

/// 从示例首页打开一个独立的 Android Activity，返回栈与转场由系统管理。
#[tauri::command]
pub async fn open_native_page(window: tauri::WebviewWindow) -> Result<(), String> {
    if window.label() != "main" {
        return Err("请从示例首页打开新页面".into());
    }

    #[cfg(target_os = "android")]
    {
        use std::sync::atomic::{AtomicU64, Ordering};
        use tauri::Manager;

        if !window.app_handle().supports_multiple_windows() {
            return Err("原生页面示例需要 Android 12L 或更高版本".into());
        }
        static NEXT_PAGE: AtomicU64 = AtomicU64::new(1);
        let label = format!("{PAGE_PREFIX}{}", NEXT_PAGE.fetch_add(1, Ordering::Relaxed));

        // 从当前窗口创建，保留 Activity 所属任务；不另开 Android task。
        tauri::WebviewWindowBuilder::new(
            &window,
            label,
            tauri::WebviewUrl::App("native-page.html".into()),
        )
        .activity_name("NativePageActivity")
        .title("my-ui · 原生新页面")
        .build()
        .map(|_| ())
        .map_err(|error| format!("打开新页面失败：{error}"))
    }
    #[cfg(not(target_os = "android"))]
    {
        Err("请在 Android App 中体验原生页面跳转".into())
    }
}

/// 结束当前子页 Activity，交给系统恢复上一页与执行返回转场。
#[tauri::command]
pub async fn close_native_page(window: tauri::WebviewWindow) -> Result<(), String> {
    if !window.label().starts_with(PAGE_PREFIX) {
        return Err("当前窗口不是原生示例子页".into());
    }

    #[cfg(target_os = "android")]
    {
        let (tx, mut rx) = tauri::async_runtime::channel(1);
        window
            .with_webview(move |webview| {
                // Android 的窗口 close 不会 finish Activity，必须定位到发起请求的子页。
                webview.jni_handle().exec(move |env, activity, _| {
                    let result = env
                        .call_method(activity, "finish", "()V", &[])
                        .map(|_| ())
                        .map_err(|error| format!("返回上一页失败：{error}"));
                    let _ = tx.try_send(result);
                });
            })
            .map_err(|error| error.to_string())?;
        rx.recv().await.ok_or("子页已销毁".to_string())?
    }
    #[cfg(not(target_os = "android"))]
    {
        Err("请在 Android App 中体验原生页面返回".into())
    }
}
