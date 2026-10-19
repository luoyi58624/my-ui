/// 只在当前 WebView 有弹层时接管系统返回，避免影响其他 Activity 的原生转场。
#[tauri::command]
pub async fn set_overlay_back_enabled(
    window: tauri::WebviewWindow,
    enabled: bool,
) -> Result<(), String> {
    #[cfg(target_os = "android")]
    {
        let (tx, mut rx) = tauri::async_runtime::channel(1);
        window
            .with_webview(move |webview| {
                webview.jni_handle().exec(move |env, activity, _| {
                    let result = env
                        .call_method(activity, "setOverlayBackEnabled", "(Z)V", &[enabled.into()])
                        .map(|_| ())
                        .map_err(|error| format!("设置弹层返回失败：{error}"));
                    let _ = tx.try_send(result);
                });
            })
            .map_err(|error| error.to_string())?;
        rx.recv().await.ok_or("页面已销毁".to_string())?
    }
    #[cfg(not(target_os = "android"))]
    {
        let _ = (window, enabled);
        Ok(())
    }
}
