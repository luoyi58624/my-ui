buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:9.3.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.10")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// 示例采用原生 Activity 返回栈，按窗口状态接管弹层返回。
apply(from = "native-back.gradle.kts")
apply(from = "dev-install.gradle.kts")

tasks.register("clean").configure {
    delete("build")
}
