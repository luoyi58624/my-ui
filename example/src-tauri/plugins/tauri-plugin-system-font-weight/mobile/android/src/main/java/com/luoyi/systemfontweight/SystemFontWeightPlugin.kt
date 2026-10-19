package com.luoyi.systemfontweight

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import kotlin.concurrent.thread

/**
 * Tauri 移动插件入口：暴露两个命令给 WebView。
 *
 * - `getRawData`：全量原始采集 Map（诊断/自定义策略用）；
 * - `getWght`：按厂商策略解析出的 wght（100–1000），无法确定时为 null。
 *
 * 由 Tauri 经 JNI 以单 [Activity] 参数反射构造，构造期即注入 Application Context。
 */
@TauriPlugin
class SystemFontWeightPlugin(activity: Activity) : Plugin(activity) {
    init {
        SystemFontWeightCollector.init(activity.applicationContext)
    }

    /** 诊断时读取完整原始数据，不参与页面启动时的正常读取。 */
    @Command
    fun getRawData(invoke: Invoke) {
        collect(invoke) { it }
    }

    /** 后台采集一次并返回有效的绝对字重，无法判断时返回 null。 */
    @Command
    fun getWght(invoke: Invoke) {
        collect(invoke) { FontWeightPolicy.resolveWght(it) }
    }

    // Tauri 命令入口在主线程；绘图探针和系统查询必须离开主线程执行。
    private fun collect(invoke: Invoke, select: (Map<String, String>) -> Any?) {
        thread(name = "my-ui-font-weight", isDaemon = true) {
            try {
                val value = select(SystemFontWeightCollector.getRawData())
                if (value == null) invoke.resolve() else invoke.resolveObject(value)
            } catch (error: Exception) {
                invoke.reject("读取系统字重失败：${error.message}")
            }
        }
    }
}
