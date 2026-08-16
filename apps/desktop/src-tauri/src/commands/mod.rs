pub mod window;

pub fn get_handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        window::minimize_window,
        window::close_window,
        window::close_splashscreen,
        window::toggle_fullscreen,
    ]
}
