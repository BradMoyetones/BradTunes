pub mod window;
pub mod binaries;
pub mod downloader;

pub fn get_handlers() -> impl Fn(tauri::ipc::Invoke) -> bool {
    tauri::generate_handler![
        window::minimize_window,
        window::close_window,
        window::close_splashscreen,
        window::toggle_fullscreen,
        binaries::check_dependencies,
        binaries::install_binary,
        downloader::execute_download,
        downloader::execute_console_command,
    ]
}
