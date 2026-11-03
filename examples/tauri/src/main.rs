// Windows 正式版本只显示应用窗口，不额外弹出控制台。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    my_ui_example_lib::run();
}
