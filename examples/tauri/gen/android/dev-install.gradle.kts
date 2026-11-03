import org.gradle.process.ExecOperations
import javax.inject.Inject

/** APK 成功组装后结束目标设备上的旧实例，安装与启动交给同一次 Tauri 开发流程。 */
abstract class PrepareDevInstall @Inject constructor(private val script: String) : Action<Task> {
    @get:Inject
    abstract val execOperations: ExecOperations

    override fun execute(task: Task) {
        execOperations.exec { commandLine("node", script) }.assertNormalExitValue()
    }
}

if (providers.environmentVariable("MY_UI_ANDROID_DEV").orNull == "1") {
    val script = file("../../../../scripts/prepare-android-install.mjs").absolutePath
    project(":app").tasks.matching { it.name.startsWith("assemble") && it.name.endsWith("Debug") }.configureEach {
        doLast(objects.newInstance(PrepareDevInstall::class.java, script))
    }
}
