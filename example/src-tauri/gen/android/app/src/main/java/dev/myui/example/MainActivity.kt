package dev.myui.example

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : OverlayActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    DemoNativeTabs.register()
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}
