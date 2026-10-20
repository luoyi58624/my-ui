use tauri::window::Color;

/// 同步当前窗口的系统外观和加载背景，避免新页面出现默认白底。
#[tauri::command]
pub async fn set_app_theme(
    window: tauri::WebviewWindow,
    dark: bool,
    background: Option<Color>,
    follow_system: Option<bool>,
) -> Result<(), String> {
    let follow_system = follow_system.unwrap_or(false);
    let background = background.unwrap_or(if dark {
        Color(18, 20, 25, 255)
    } else {
        Color(242, 243, 245, 255)
    });
    #[cfg(target_os = "android")]
    {
        let Color(red, green, blue, alpha) = background;
        let argb = u32::from_be_bytes([alpha, red, green, blue]) as i32;
        let (tx, mut rx) = tauri::async_runtime::channel(1);
        window
            .with_webview(move |webview| {
                webview.jni_handle().exec(move |env, activity, _| {
                    let result = env
                        .call_method(
                            activity,
                            "setAppDarkMode",
                            "(ZIZ)V",
                            &[dark.into(), argb.into(), follow_system.into()],
                        )
                        .map(|_| ())
                        .map_err(|error| format!("同步系统栏外观失败：{error}"));
                    let _ = tx.try_send(result);
                });
            })
            .map_err(|error| error.to_string())?;
        rx.recv().await.ok_or("页面已销毁".to_string())?
    }
    #[cfg(not(target_os = "android"))]
    {
        window
            .set_background_color(Some(background))
            .map_err(|error| error.to_string())?;
        window
            .set_theme(if follow_system {
                None
            } else {
                Some(if dark {
                    tauri::Theme::Dark
                } else {
                    tauri::Theme::Light
                })
            })
            .map_err(|error| format!("同步窗口外观失败：{error}"))
    }
}
