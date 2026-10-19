package com.luoyi.systemfontweight

import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.Settings

/**
 * 字重原始参数采集器（移植自 Flutter 插件，采集逻辑保持一致）。
 *
 * 由 [SystemFontWeightPlugin] 在构造期注入 Application Context；
 * [getRawData] 直接返回键值 Map，经 Tauri 的 Jackson 序列化成 JSON，
 * 不再需要 Flutter 版的 U+001E/U+001F 编码压缩。
 */
object SystemFontWeightCollector {
    private var appContext: Context? = null

    /** 插件注册期缓存 Application Context。 */
    @JvmStatic
    fun init(context: Context) {
        appContext = context.applicationContext
    }

    /**
     * 候选键清单（表名 to 键名）。厂商私有键无公开文档，这里放实测确认 +
     * 社区推测 + 通用命名；真机上经 getRawData 定位到新键后补进此表。
     */
    private val candidateKeys = listOf(
        // ColorOS 已实测（OPPO PLJ110 / Android 16）：位打包整数，
        // bit12(0x1000)=已自定义标志，低 12 位=滑杆刻度（注意 framework
        // 应用时另有压缩曲线，实际字重以墨水探针为准）。
        "system" to "font_variation_settings",
        "global" to "font_variation_settings",
        "secure" to "font_weight_adjustment",
        "system" to "system_font_weight",
        // 小米 HyperOS / MIUI（推测）
        "system" to "key_miui_font_weight",
        "system" to "miui_font_weight_scale",
        // OPPO ColorOS 旧形态（推测）
        "system" to "oplus_customize_font_variation_settings",
        "system" to "oplus_font_weight",
        // vivo OriginOS（推测）
        "system" to "vivo_font_weight",
        // 荣耀 / 华为（推测）
        "system" to "hn_font_weight",
    )

    /**
     * 全量原始参数：设备信息、墨水探针、Configuration OEM 扩展字段、
     * 候选键、settings 三表扫描、系统属性、系统字体轴清单。
     * 未初始化（理论不可达）返回空 Map。
     */
    @JvmStatic
    fun getRawData(): Map<String, String> {
        val context = appContext ?: return emptyMap()
        val out = linkedMapOf<String, String>()
        out["manufacturer"] = Build.MANUFACTURER
        out["brand"] = Build.BRAND
        out["model"] = Build.MODEL
        out["sdk"] = Build.VERSION.SDK_INT.toString()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            out["fontWeightAdjustment"] =
                context.resources.configuration.fontWeightAdjustment.toString()
        }
        val probe = probeNativeWght()
        out["probeStatus"] = probe.status
        probe.weight?.let { out["probeNativeWght"] = it.toString() }
        for ((label, value) in configExtraEntries(context)) {
            out["configExtra:$label"] = value
        }
        // OEM 扩展载体存在时列出其全部字段名，便于识别改名/混淆后的字重字段。
        for (holderName in listOf("mOplusExtraConfiguration", "mOppoExtraConfiguration")) {
            readInstanceField(context.resources.configuration, holderName)?.let { holder ->
                out["configHolderFields:$holderName"] =
                    holder.javaClass.declaredFields.joinToString(",") { it.name }
            }
        }
        for ((table, key) in candidateKeys) {
            readSetting(context, table, key)?.let { out["candidate:$table/$key"] = it }
        }
        for ((table, name, value) in scanTables(context)) {
            if (isWeightKey(name)) out["scan:$table/$name"] = value
        }
        for ((name, value) in scanProps()) {
            out["prop:$name"] = value
        }
        out.putAll(fontsDump())
        return out
    }

    /** 读取单个 settings 键；键不存在或表不可读返回 null。 */
    private fun readSetting(context: Context, table: String, key: String): String? {
        return try {
            when (table) {
                "system" -> Settings.System.getString(context.contentResolver, key)
                "secure" -> Settings.Secure.getString(context.contentResolver, key)
                "global" -> Settings.Global.getString(context.contentResolver, key)
                else -> null
            }
        } catch (_: Throwable) {
            null
        }
    }

    /** 全量拉取三张 settings 表的 (table, name, value) 行；表不可查询则跳过。 */
    private fun scanTables(context: Context): List<Triple<String, String, String>> {
        val rows = mutableListOf<Triple<String, String, String>>()
        for (table in listOf("system", "secure", "global")) {
            try {
                context.contentResolver.query(
                    Uri.parse("content://settings/$table"),
                    arrayOf("name", "value"), null, null, null,
                )?.use { c ->
                    val ni = c.getColumnIndex("name")
                    val vi = c.getColumnIndex("value")
                    if (ni < 0 || vi < 0) return@use
                    while (c.moveToNext()) {
                        val name = c.getString(ni) ?: continue
                        val value = c.getString(vi) ?: continue
                        rows.add(Triple(table, name, value))
                    }
                }
            } catch (_: Throwable) {
                // 部分 ROM 限制全表查询，忽略。
            }
        }
        return rows
    }

    /** 键名是否疑似"字重"设置。font_scale 是字号缩放，明确排除。 */
    private fun isWeightKey(key: String): Boolean {
        val n = key.lowercase()
        if (n == "font_scale") return false
        if (n.contains("wght")) return true
        return n.contains("font") &&
            (n.contains("weight") || n.contains("bold") || n.contains("variation"))
    }

    /** 反射枚举 Configuration 及其 OEM 扩展载体上疑似字重的字段。 */
    private fun configExtraEntries(context: Context): List<Pair<String, String>> {
        val out = mutableListOf<Pair<String, String>>()
        val config = context.resources.configuration
        collectWeightFields(config, "config", out)
        for (holderName in listOf(
            "mOplusExtraConfiguration", // ColorOS 12+
            "mOppoExtraConfiguration", // 旧版 ColorOS
            "mVivoExtraConfiguration",
            "mExtraConfiguration",
        )) {
            val holder = readInstanceField(config, holderName) ?: continue
            collectWeightFields(holder, holderName, out)
        }
        return out
    }

    /** 反射读实例字段（沿继承链找）；不存在或被限制返回 null。 */
    private fun readInstanceField(target: Any, name: String): Any? = try {
        var cls: Class<*>? = target.javaClass
        var value: Any? = null
        while (cls != null && cls != Any::class.java) {
            val f = cls.declaredFields.firstOrNull { it.name == name }
            if (f != null) {
                f.isAccessible = true
                value = f.get(target)
                break
            }
            cls = cls.superclass
        }
        value
    } catch (_: Throwable) {
        null
    }

    /**
     * 收集对象上名字疑似字重的实例字段值。排除 AOSP fontWeightAdjustment
     * （增量语义，误当绝对值会把 +300 读成 wght 300，已单独输出）。
     */
    private fun collectWeightFields(
        obj: Any,
        label: String,
        out: MutableList<Pair<String, String>>,
    ) {
        try {
            var cls: Class<*>? = obj.javaClass
            while (cls != null && cls != Any::class.java) {
                for (f in cls.declaredFields) {
                    if (java.lang.reflect.Modifier.isStatic(f.modifiers)) continue
                    val n = f.name.lowercase()
                    if (n == "fontweightadjustment") continue
                    val hit = n.contains("wght") ||
                        (n.contains("font") && (n.contains("weight") || n.contains("variation")))
                    if (!hit) continue
                    try {
                        f.isAccessible = true
                        val v = f.get(obj) ?: continue
                        out.add("$label.${f.name}" to v.toString())
                    } catch (_: Throwable) {
                    }
                }
                cls = cls.superclass
            }
        } catch (_: Throwable) {
        }
    }

    /**
     * 使用原有中英混合样张估算 Paint 层字重，轴无效或曲线不可辨识则报告失败。
     * 此结果不保证等于 TextView 层或不同字体的字重，由调用方按设备采用。
     */
    private fun probeNativeWght(): FontWeightProbeResult {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return FontWeightProbeResult("unavailable")
        }
        return try {
            val sample = "永字八法漢語Aagw"
            val size = 64f
            fun coverage(weight: Int?): Double? {
                val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG)
                paint.textSize = size
                if (weight != null && !paint.setFontVariationSettings("'wght' $weight")) {
                    return null
                }
                val w = (paint.measureText(sample) + 8).toInt().coerceAtLeast(1)
                val h = (size * 1.5f).toInt()
                val bmp = android.graphics.Bitmap.createBitmap(
                    w, h, android.graphics.Bitmap.Config.ALPHA_8,
                )
                try {
                    android.graphics.Canvas(bmp).drawText(sample, 4f, size * 1.1f, paint)
                    val buf = java.nio.ByteBuffer.allocate(bmp.byteCount)
                    bmp.copyPixelsToBuffer(buf)
                    var ink = 0L
                    // ALPHA_8 每行可能带有对齐填充，只统计实际像素。
                    val rowBytes = bmp.rowBytes
                    for (y in 0 until h) {
                        val rowStart = y * rowBytes
                        for (x in 0 until w) {
                            ink += buf.get(rowStart + x).toInt() and 0xFF
                        }
                    }
                    return ink.toDouble()
                } finally {
                    bmp.recycle()
                }
            }
            FontWeightProbe.measure(::coverage)
        } catch (_: Throwable) {
            FontWeightProbeResult("error")
        }
    }

    /** getprop 全量拉取，过滤疑似字重的系统属性（persist.sys.* 形态）。 */
    private fun scanProps(): List<Pair<String, String>> = try {
        Runtime.getRuntime().exec("getprop").inputStream.bufferedReader().useLines { lines ->
            lines.mapNotNull { line ->
                Regex("""\[(.+?)]: \[(.*)]""").find(line)
                    ?.let { it.groupValues[1] to it.groupValues[2] }
            }.filter { isWeightKey(it.first) && it.second.isNotEmpty() }.toList()
        }
    } catch (_: Throwable) {
        emptyList()
    }

    /**
     * 系统字体实例清单（API 29+）：文件名#ttc/样式字重 → 可变轴值。
     * 回答"CSS 字重 ↔ 轴值"的映射关系（如 ColorOS fonts_base.xml 把
     * weight N 一比一映射到 OPPO Sans 的 wght N）。只收默认族/中文族/
     * 带轴的条目，控制噪音。
     */
    private fun fontsDump(): Map<String, String> {
        val out = linkedMapOf<String, String>()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return out
        try {
            for (font in android.graphics.fonts.SystemFonts.getAvailableFonts()) {
                val name = font.file?.name ?: continue
                val n = name.lowercase()
                val interesting = n.contains("syssans") || n.contains("oppo") ||
                    n.contains("misans") || n.contains("cjk") || n.startsWith("roboto-regular")
                if (!interesting) continue
                val axes = font.axes
                    ?.joinToString(",") { "${it.tag}=${it.styleValue}" }
                    .orEmpty()
                out["font:$name#${font.ttcIndex}/w${font.style.weight}"] =
                    axes.ifEmpty { "static" }
            }
        } catch (_: Throwable) {
        }
        return out
    }
}
