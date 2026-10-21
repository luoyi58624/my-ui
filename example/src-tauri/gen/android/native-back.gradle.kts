import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import java.security.MessageDigest
import java.util.HexFormat

/** 生成只移除常驻返回注册的框架编译副本，输入变化时重新校验。 */
abstract class PrepareNativeBack : DefaultTask() {
    @get:InputFile
    @get:PathSensitive(PathSensitivity.NONE)
    abstract val upstreamSource: RegularFileProperty

    @get:OutputFile
    abstract val patchedSource: RegularFileProperty

    @TaskAction
    fun generate() {
        val source = upstreamSource.get().asFile.readText().replace("\r\n", "\n")
        val digest = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(source.toByteArray(Charsets.UTF_8)))
        check(digest == "087ae5fb739031d886365aeed1c27bde043c5f7d00f892050662bc602e7451b4") {
            "Tauri AppPlugin 已不再是核对过的 2.12.4 实现，请复核 native-back.gradle.kts 后再构建。"
        }
        val legacyRegistration = Regex(
            """(?s)\n  init \{\n    val callback = object : OnBackPressedCallback\(true\) \{.*?\n    \(activity as AppCompatActivity\)\.onBackPressedDispatcher\.addCallback\(activity, callback\)\n  }\n"""
        )
        check(legacyRegistration.findAll(source).count() == 1) {
            "Tauri AppPlugin 的返回实现已变化，请复核 native-back.gradle.kts，不能继续沿用旧补丁。"
        }
        val output = patchedSource.get().asFile
        output.parentFile.mkdirs()
        output.writeText(legacyRegistration.replace(source, "\n"))
    }
}

// Tauri 2.12.4 的 AppPlugin 常驻返回回调会阻断系统预测性返回；本壳只保留 NativeWindow 的按需弹层回调。
// 只生成本工程的编译输入，不修改 Cargo 缓存；升级后无法匹配旧实现时要求重新核对。
val tauriAndroid = project(":tauri-android")
val upstream = tauriAndroid.layout.projectDirectory.file("src/main/java/app/tauri/AppPlugin.kt")
val generated = layout.buildDirectory.file("generated/native-back/app/tauri/NativeBackAppPlugin.kt")
val prepareNativeBack = tasks.register<PrepareNativeBack>("prepareNativeBack") {
    upstreamSource.set(upstream)
    patchedSource.set(generated)
}
tauriAndroid.pluginManager.withPlugin("org.jetbrains.kotlin.android") {
    tauriAndroid.tasks.withType<KotlinCompile>().configureEach {
        if (!name.contains("Test")) {
            dependsOn(prepareNativeBack)
            exclude("**/AppPlugin.kt")
            source(prepareNativeBack.flatMap { it.patchedSource })
        }
    }
}
