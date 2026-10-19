package com.luoyi.systemfontweight

import kotlin.math.abs
import kotlin.math.max

/** 探针结果及未采用原因，供原始采集 Map 暴露诊断信息。 */
internal data class FontWeightProbeResult(val status: String, val weight: Int? = null)

/** 校验覆盖量曲线后反推字重，绘制由调用方提供以便独立验证退化场景。 */
internal object FontWeightProbe {
    /** null 字重表示系统默认绘制，null 覆盖量表示该次轴设置不生效。 */
    fun measure(coverage: (Int?) -> Double?): FontWeightProbeResult {
        val target = coverage(null)
        if (target == null || !target.isFinite() || target <= 0.0) {
            return FontWeightProbeResult("invalidTarget")
        }
        val samples = mutableMapOf<Int, Double>()
        fun sample(weight: Int): Double? {
            samples[weight]?.let { return it }
            val ink = coverage(weight) ?: return null
            if (!ink.isFinite() || ink <= 0.0) return null
            samples[weight] = ink
            return ink
        }

        val weights = listOf(100, 250, 400, 550, 700, 850, 1000)
        val inks = weights.map { sample(it) ?: return FontWeightProbeResult("unsupported") }
        val minInk = inks.first()
        val maxInk = inks.last()
        // 至少 0.5% 的覆盖量变化，防止将无效轴或栅格噪声反推成极端字重。
        if (maxInk - minInk <= maxInk * 0.005) return FontWeightProbeResult("flat")
        if (inks.zipWithNext().any { (a, b) -> b < a }) {
            return FontWeightProbeResult("nonMonotonic")
        }
        if (target < minInk || target > maxInk) return FontWeightProbeResult("outOfRange")

        var lo = 100
        var hi = 1000
        while (hi - lo > 1) {
            val mid = (lo + hi) / 2
            val ink = sample(mid) ?: return FontWeightProbeResult("unsupported")
            if (ink < samples.getValue(lo) || ink > samples.getValue(hi)) {
                return FontWeightProbeResult("nonMonotonic")
            }
            if (ink < target) lo = mid else hi = mid
        }
        val weight = if (abs(samples.getValue(lo) - target) <
            abs(samples.getValue(hi) - target)
        ) lo else hi
        val actual = samples.getValue(weight)
        if (abs(actual - target) > target * 0.002) return FontWeightProbeResult("noMatch")

        // 解附近仍须可分辨；平台区间没有唯一字重，不能取它的左边界。
        val before = sample((weight - 16).coerceAtLeast(100))
            ?: return FontWeightProbeResult("unsupported")
        val after = sample((weight + 16).coerceAtMost(1000))
            ?: return FontWeightProbeResult("unsupported")
        val tolerance = max(1.0, target * 0.0001)
        if ((weight > 100 && actual - before <= tolerance) ||
            (weight < 1000 && after - actual <= tolerance)
        ) {
            return FontWeightProbeResult("ambiguous")
        }
        return FontWeightProbeResult("valid", weight)
    }
}
