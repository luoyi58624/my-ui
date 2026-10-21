package dev.myui.example

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.os.SystemClock
import androidx.lifecycle.Lifecycle
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.Espresso.pressBackUnconditionally
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.action.ViewActions.scrollTo
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isChecked
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.hamcrest.Matchers.not
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/** 在真实 Android 控件上检查资料提交、取消和重建，不用网页模拟代替原生验证。 */
@RunWith(AndroidJUnit4::class)
class NativeProfileActivityTest {
    private val preferences = NativeProfileStore.preferences(ApplicationProvider.getApplicationContext())
    private var original: Map<String, *> = emptyMap<String, Any?>()
    private var scenario: ActivityScenario<NativeProfileActivity>? = null

    @Before fun rememberProfile() { original = preferences.all.toMap() }

    @After fun restoreProfile() {
        scenario?.close()
        preferences.edit().clear().apply {
            original.forEach { (key, value) ->
                when (value) {
                    is String -> putString(key, value)
                    is Boolean -> putBoolean(key, value)
                }
            }
        }.commit()
    }

    @Test fun nativeControlsValidateAndPersistTogether() {
        val initial = NativeProfileStore.read(preferences)
        scenario = ActivityScenario.launch(NativeProfileActivity::class.java)
        scenario!!.onActivity { assertFalse(containsWebView(it.window.decorView)) }
        onView(withId(R.id.profile_name)).perform(replaceText(" "), closeSoftKeyboard())
        onView(withId(R.id.profile_save)).perform(click())
        onView(withText("请填写昵称")).check(matches(isDisplayed()))
        assertEquals(initial, NativeProfileStore.read(preferences))
        onView(withId(R.id.profile_name)).perform(replaceText("Native Profile"), closeSoftKeyboard())
        onView(withId(R.id.profile_signature)).perform(scrollTo(), replaceText("Saved on Android"), closeSoftKeyboard())
        onView(withId(R.id.profile_show_signature)).perform(scrollTo(), click())
        onView(withId(R.id.profile_save)).perform(click())
        assertEquals(NativeProfileStore.Profile("Native Profile", "Saved on Android", !initial.showSignature), NativeProfileStore.read(preferences))
        awaitDestroyed()
    }

    @Test fun recreationRetainsUnsavedFieldsAndSwitch() {
        val initial = NativeProfileStore.read(preferences)
        scenario = ActivityScenario.launch(NativeProfileActivity::class.java)
        onView(withId(R.id.profile_name)).perform(replaceText("Unsaved draft"), closeSoftKeyboard())
        onView(withId(R.id.profile_signature)).perform(scrollTo(), replaceText("Keep this draft"), closeSoftKeyboard())
        onView(withId(R.id.profile_show_signature)).perform(scrollTo(), click())
        scenario!!.recreate()
        onView(withId(R.id.profile_name)).check(matches(withText("Unsaved draft")))
        onView(withId(R.id.profile_signature)).check(matches(withText("Keep this draft")))
        onView(withId(R.id.profile_show_signature)).check(matches(if (initial.showSignature) not(isChecked()) else isChecked()))
        assertEquals(initial, NativeProfileStore.read(preferences))
    }

    @Test fun systemBackDiscardsDraft() {
        val initial = NativeProfileStore.read(preferences)
        scenario = ActivityScenario.launch(NativeProfileActivity::class.java)
        onView(withId(R.id.profile_name)).perform(replaceText("Discard this draft"), closeSoftKeyboard())
        pressBackUnconditionally()
        awaitDestroyed()
        assertEquals(initial, NativeProfileStore.read(preferences))
    }

    private fun containsWebView(view: View): Boolean = view is WebView ||
        (view is ViewGroup && (0 until view.childCount).any { containsWebView(view.getChildAt(it)) })

    // 系统退出动画期间 Activity 会先停在 STARTED，等待真实销毁而不是主动关闭它。
    private fun awaitDestroyed() {
        val deadline = SystemClock.uptimeMillis() + 5_000
        while (scenario!!.state != Lifecycle.State.DESTROYED && SystemClock.uptimeMillis() < deadline) SystemClock.sleep(25)
        assertEquals(Lifecycle.State.DESTROYED, scenario!!.state)
    }
}
