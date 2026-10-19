use std::sync::atomic::{AtomicU64, Ordering};
use tauri::Manager;

const PAGE_PREFIX: &str = "native-page-";
static NEXT_PAGE: AtomicU64 = AtomicU64::new(1);

fn page_path(path: &str) -> Result<String, String> {
    let base = tauri::Url::parse("https://my-ui.invalid/").unwrap();
    let mut target = base.join(path).map_err(|_| "页面地址无效".to_string())?;
    if target.origin() != base.origin()
        || !target.username().is_empty()
        || target.password().is_some()
    {
        return Err("页面跳转只接受应用内地址".into());
    }
    if target.path() == "/" {
        target.set_path("/index.html");
    }
    let query: Vec<_> = target
        .query_pairs()
        .filter(|(key, _)| key != "pageWindow")
        .map(|(key, value)| (key.into_owned(), value.into_owned()))
        .collect();
    target
        .query_pairs_mut()
        .clear()
        .extend_pairs(query)
        .append_pair("pageWindow", "1");
    // 交给 Tauri 拼接当前开发或资源协议，避免把开发服务器地址写死到原生代码。
    Ok(format!(
        "{}?{}{}",
        target.path().trim_start_matches('/'),
        target.query().unwrap(),
        target
            .fragment()
            .map(|hash| format!("#{hash}"))
            .unwrap_or_default()
    ))
}

fn owns_page(label: &str) -> bool {
    label == "main" || label.starts_with(PAGE_PREFIX)
}

/// 打开应用内地址：Android 创建 Activity，桌面端创建独立窗口。
#[tauri::command]
pub async fn open_page(
    window: tauri::WebviewWindow,
    path: String,
    title: Option<String>,
) -> Result<(), String> {
    if !owns_page(window.label()) {
        return Err("当前窗口不能打开应用页面".into());
    }
    let path = page_path(&path)?;
    #[cfg(target_os = "android")]
    if !window.app_handle().supports_multiple_windows() {
        return Err("原生页面跳转需要 Android 12L 或更高版本".into());
    }

    let label = format!("{PAGE_PREFIX}{}", NEXT_PAGE.fetch_add(1, Ordering::Relaxed));
    // 从当前窗口创建，Android 保留所属任务，桌面端保留父页的原有状态。
    let builder =
        tauri::WebviewWindowBuilder::new(&window, label, tauri::WebviewUrl::App(path.into()))
            .title(
                title
                    .filter(|value| !value.trim().is_empty())
                    .unwrap_or_else(|| "my-ui".into()),
            );
    #[cfg(target_os = "android")]
    let builder = builder.activity_name("NativePageActivity");
    #[cfg(not(target_os = "android"))]
    let builder = builder
        .inner_size(960.0, 760.0)
        .min_inner_size(360.0, 480.0)
        .center()
        .drag_and_drop(false);
    let child = builder
        .build()
        .map_err(|error| format!("打开新页面失败：{error}"))?;

    #[cfg(not(target_os = "android"))]
    {
        let app = window.app_handle().clone();
        let parent = window.label().to_string();
        child.on_window_event(move |event| {
            if matches!(event, tauri::WindowEvent::Destroyed) {
                if let Some(previous) = app.get_webview_window(&parent) {
                    let _ = previous.set_focus();
                }
            }
        });
    }
    #[cfg(target_os = "android")]
    let _ = child;
    Ok(())
}

/// 结束当前子页：Android 调用 Activity.finish，桌面端关闭当前窗口；禁止关闭首页。
#[tauri::command]
pub async fn close_page(window: tauri::WebviewWindow) -> Result<(), String> {
    if !window.label().starts_with(PAGE_PREFIX) {
        return Err("当前窗口不是应用子页".into());
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
        window
            .close()
            .map_err(|error| format!("关闭子窗口失败：{error}"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_route_query_and_child_marker() {
        assert_eq!(
            page_path("index.html#example/button").unwrap(),
            "index.html?pageWindow=1#example/button"
        );
        assert_eq!(
            page_path("native-page.html?source=demo&pageWindow=0#note").unwrap(),
            "native-page.html?source=demo&pageWindow=1#note"
        );
        assert_eq!(
            page_path("#example/image").unwrap(),
            "index.html?pageWindow=1#example/image"
        );
    }

    #[test]
    fn rejects_external_documents() {
        for path in [
            "https://example.com/index.html",
            "//example.com/",
            "javascript:alert(1)",
            "file:///test.html",
            "data:text/html,hello",
        ] {
            assert!(page_path(path).is_err(), "{path}");
        }
    }

    #[test]
    fn allows_nested_pages_but_rejects_unrelated_windows() {
        assert!(owns_page("main"));
        assert!(owns_page("native-page-2"));
        assert!(!owns_page("settings"));
        assert!(!"main".starts_with(PAGE_PREFIX));
    }
}
