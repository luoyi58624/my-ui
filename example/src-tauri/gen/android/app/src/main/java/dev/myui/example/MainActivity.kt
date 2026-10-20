package dev.myui.example

import android.os.Bundle

class MainActivity : AppActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    DemoNativeTabs.register()
    super.onCreate(savedInstanceState)
  }
}
