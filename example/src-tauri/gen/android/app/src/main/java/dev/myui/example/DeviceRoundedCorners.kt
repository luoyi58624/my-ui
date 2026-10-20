package dev.myui.example

import android.graphics.Outline
import android.graphics.Path
import android.graphics.PixelFormat
import android.os.Build
import android.view.RoundedCorner
import android.view.View
import android.view.ViewOutlineProvider
import android.view.Window

/** 按当前窗口的设备圆角裁剪整个 DecorView，转场中的网页和原生控件使用同一轮廓。 */
internal object DeviceRoundedCorners {
    fun applyTo(window: Window) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return

        val decor = window.decorView
        val originalProvider = decor.outlineProvider
        val originalClip = decor.clipToOutline
        val originalFormat = window.attributes.format
        var appliedRadii = floatArrayOf()
        val path = Path()
        val provider = object : ViewOutlineProvider() {
            override fun getOutline(view: View, outline: Outline) {
                if (appliedRadii.distinct().size == 1) {
                    outline.setRoundRect(0, 0, view.width, view.height, appliedRadii[0])
                } else {
                    path.rewind()
                    path.addRoundRect(0f, 0f, view.width.toFloat(), view.height.toFloat(),
                        appliedRadii, Path.Direction.CW)
                    outline.setPath(path)
                }
            }
        }

        fun update() {
            val insets = decor.rootWindowInsets ?: return
            val location = IntArray(2)
            decor.getLocationInWindow(location)
            val radii = intArrayOf(RoundedCorner.POSITION_TOP_LEFT, RoundedCorner.POSITION_TOP_RIGHT,
                RoundedCorner.POSITION_BOTTOM_RIGHT, RoundedCorner.POSITION_BOTTOM_LEFT)
                .flatMap { position ->
                    val corner = insets.getRoundedCorner(position)
                    // 输入法缩小 DecorView 后，屏幕底角不能误用到输入法上方的新边缘。
                    val radius = if (corner != null &&
                        corner.center.x in location[0]..(location[0] + decor.width) &&
                        corner.center.y in location[1]..(location[1] + decor.height)) corner.radius.toFloat() else 0f
                    listOf(radius, radius)
                }.toFloatArray()
            // Android 12 的 Outline 只支持等半径圆角；不以猜测值替代不对称的设备轮廓。
            val canClip = radii.any { it > 0 } &&
                (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU || radii.distinct().size == 1)
            if (radii.contentEquals(appliedRadii)) return
            appliedRadii = radii
            decor.outlineProvider = if (canClip) provider else originalProvider
            decor.clipToOutline = if (canClip) true else originalClip
            // 仅允许裁剪出的角落透明；Activity 仍为不透明页面，不改变返回栈或可见生命周期。
            window.setFormat(if (canClip) PixelFormat.TRANSLUCENT else originalFormat)
            decor.invalidateOutline()
        }

        // 布局前系统已分发 Insets；旋转、窗口尺寸变化后重新读取，不截断原有 Insets 分发。
        decor.addOnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
            update()
            decor.invalidateOutline()
        }
        update()
    }
}
