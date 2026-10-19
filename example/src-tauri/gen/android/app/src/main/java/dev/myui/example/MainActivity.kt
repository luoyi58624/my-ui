package dev.myui.example

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : OverlayActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}
