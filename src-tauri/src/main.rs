// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Read;
use std::{convert::*, fs::File, fs};
use tauri::utils::assets::EmbeddedAssets;
use tauri::{Context, Env, Manager, SystemTrayMenuItemHandle};

use tauri::api::path::BaseDirectory;

use tauri::AppHandle;
use tauri::SystemTray;
use tauri::{CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

use tauri_plugin_autostart::MacosLauncher;

fn main() {
    let og_data: String = r#"[["LaunchOnStartup",true],["StartMinimized",true],["MinimizeOnClose", true],["DarkMode",true],["SelectedAthan","Athan1.mp3"],["Volume",1]]"#.to_string();
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
            tauri::WindowEvent::CloseRequested { api, .. } => {
                match fetch_data(&tauri::generate_context!(), og_data.clone(), 2) {
                    serde_json::Value::Bool(is_enabled) => {
                        println!("{}", is_enabled);
                        if is_enabled {
                            event.window().hide().unwrap();
                            event.window().app_handle().tray_handle().get_item("hide").set_title("Show").unwrap();
                            api.prevent_close();
                        } else {
                            event.window().close().unwrap();
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .run(context)
        .expect("error while running tauri application");
}

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

fn fetch_data(
    context: &Context<EmbeddedAssets>,
    og_data: String,
    key_index: usize,
) -> serde_json::Value {
    let path = tauri::api::path::resolve_path(
        context.config(),
        context.package_info(),
        &Env::default(),
        "data\\data.json",
        Some(BaseDirectory::AppLocalData),
    )
    .expect("failed to resolve path");

    match File::open(&path) {
        Ok(mut f) => {
            // let &f = file.clone();
            let mut json_str = "".into();
            let _ = f.read_to_string(&mut json_str);
            print!("{}", json_str);
            let json_val: serde_json::Value =
                serde_json::from_str(&json_str).expect("failed to fetcg data");
            json_val[key_index][1].clone()
        }
        Err(e) => {
            File::create(&path).unwrap();
            fs::write(path, og_data).expect("failed to write data");
            println!("error: {}", e);
            serde_json::Value::Bool(false)
        }
    }
}