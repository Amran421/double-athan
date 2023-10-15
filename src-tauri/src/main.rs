// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Read;
use std::path::PathBuf;
use std::{convert::*, fs, fs::File};
use tauri::utils::assets::EmbeddedAssets;
use tauri::{CloseRequestApi, Context, Env, GlobalWindowEvent, Manager, SystemTrayMenuItemHandle, RunEvent};

use tauri::api::path::BaseDirectory;

use tauri::AppHandle;
use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

use tauri_plugin_autostart::MacosLauncher;

fn main() {
    let context: Context<EmbeddedAssets> = tauri::generate_context!();
    // fetch_data(&context, &og_data, 0);

    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit.clone())
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide.clone());

    let tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => handle_tray_item(app.clone(), id.clone()),
            _ => {}
        })
        .on_window_event(move |event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => 
                handle_minimize_close(api, &event),
            tauri::WindowEvent::Moved(_) => 
                handle_minimize_tray(event),
            _ => {}
        })
        .setup(|app| {
            handle_start_minimized(app);
            Ok(())
        })
        .build(context)
        .expect("error while running tauri application")
        .run(|_app_handle, event| 
            handle_backend_tray(event)
        )
}


//handles tray menu items (i.e. quit, hide)
fn handle_tray_item(app: AppHandle, id: String) {
    let item_handle: SystemTrayMenuItemHandle = app.tray_handle().get_item(&id);

    match id.as_str() {
        "hide" => {
            let window = app.get_window("main").unwrap();

            match window.is_visible().unwrap() {
                true => {
                    window.hide().unwrap();
                    item_handle.set_title("Show").unwrap();
                }
                false => {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                    window.unminimize().unwrap();
                    item_handle.set_title("Hide").unwrap();
                }
            }
        }

        "quit" => {
            let window = app.get_window("main").unwrap();
            window.close().unwrap();
        }

        _ => {}
    }
}

//handles starting app minimized to tray
fn handle_start_minimized(app: &mut tauri::App) {
    match fetch_data(&tauri::generate_context!(), 1) {
        serde_json::Value::Bool(start_minimized) => {
            if start_minimized {
                let window = app.get_window("main").unwrap();
                window
                    .app_handle()
                    .tray_handle()
                    .get_item("hide")
                    .set_title("Show")
                    .unwrap();
                window.hide().unwrap();
            }
        }

        _ => {}
    }
}

//handles closing to tray
fn handle_minimize_close(api: &CloseRequestApi, event: &GlobalWindowEvent) {
    match fetch_data(&tauri::generate_context!(), 2) {
        serde_json::Value::Bool(is_enabled) => {
            println!("{}", is_enabled);
            if is_enabled {
                event.window().hide().unwrap();
                event
                    .window()
                    .app_handle()
                    .tray_handle()
                    .get_item("hide")
                    .set_title("Show")
                    .unwrap();
                api.prevent_close();
            } else {
                event.window().close().unwrap();
            }
        }
        _ => {}
    }
}

//handles minimizing to tray
fn handle_minimize_tray(event: GlobalWindowEvent) {
    match event.window().is_minimized() {
        Ok(is_minimized) => match fetch_data(&tauri::generate_context!(), 3) {
            serde_json::Value::Bool(to_tray_enabled) => {
                if !to_tray_enabled {
                    return;
                }
                if !is_minimized {
                    event.window().show().unwrap();
                    return;
                }
                event.window().hide().unwrap();
                event
                    .window()
                    .app_handle()
                    .tray_handle()
                    .get_item("hide")
                    .set_title("Show")
                    .unwrap();
            }

            _ => {}
        },
        Err(e) => {
            println!("{}", e);
        }
    }
}

//handles backend when minimmizing to tray
fn handle_backend_tray(event: RunEvent) {
    match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            match fetch_data(&tauri::generate_context!(), 2) {
                serde_json::Value::Bool(minimize_on_close) => {
                    if minimize_on_close {
                        api.prevent_exit();
                    }
                }

                _ => {}
            }
        }

        _ => {}
    }
}

fn fetch_data(context: &Context<EmbeddedAssets>, key_index: usize) -> serde_json::Value {
    let og_data: String = r#"[
        ["LaunchOnStartup", true],
        ["StartMinimized", true],
        ["MinimizeOnClose", true],
        ["MinimizeToTray", true],
        ["24HourFormat", true],
        ["SelectedAthan", "Athan1.mp3"],
        ["Volume", 1]
    ]"#
    .to_string();

    let data_path = tauri::api::path::resolve_path(
        context.config(),
        context.package_info(),
        &Env::default(),
        "data",
        Some(BaseDirectory::AppLocalData),
    )
    .expect("failed to resolve path");

    let json_path = &data_path.join("data.json");

    // add match here to check for origin path and if not there then create
    fs::create_dir_all(&data_path).unwrap();

    open_data_file(json_path, og_data, key_index)
}

fn open_data_file(json_path: &PathBuf, og_data: String, key_index: usize) -> serde_json::Value {
    match File::open(&json_path) {
        Ok(mut f) => {
            let mut json_str = "".into();
            let _ = f.read_to_string(&mut json_str);
            print!("{}", json_str);
            let json_val: serde_json::Value =
                serde_json::from_str(&json_str).expect("failed to fetcg data");
            json_val[key_index][1].clone()
        }
        Err(_e) => {
            println!("path: {}", json_path.display());
            File::create(json_path).unwrap();
            fs::write(json_path, og_data).expect("failed to write data");
            serde_json::Value::Bool(false)
        }
    }
}
