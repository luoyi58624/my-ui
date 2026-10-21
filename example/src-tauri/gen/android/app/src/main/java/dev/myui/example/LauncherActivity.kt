package dev.myui.example

import android.app.Activity
import android.content.Intent
import android.os.Bundle

/** 桌面入口只恢复现有页面栈，空任务才创建 Tauri 首页。 */
class LauncherActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 开发工具直接启动首页时，桌面 Intent 不同；此时不能再创建一份 Tauri 根窗口。
        if (isTaskRoot) {
            startActivity(Intent(this, MainActivity::class.java).apply {
                action = Intent.ACTION_MAIN
                addCategory(Intent.CATEGORY_LAUNCHER)
            })
        }
        finish()
    }
}
