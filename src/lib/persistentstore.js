// @ts-nocheck
import { BaseDirectory, createDir, writeFile, readTextFile } from "@tauri-apps/api/fs";
import { enable, disable } from "tauri-plugin-autostart-api"

let options = new Map([
    ["LaunchOnStartup", true],
    ["StartMinimized", true],
    ["MinimizeOnClose", true],
    ["SelectedAthan", "Athan1.mp3"],
    ["Volume", 1]
])

const createDataFolder = async () => {
    try {
        await createDir("data", {
            dir: BaseDirectory.AppLocalData,
            recursive: true,
        });
    } catch (e) {
        console.error(e);
    }
};

const createDataFile = async () => {
    try {
        await writeFile(
            {
                contents: JSON.stringify(Array.from(options.entries())),
                path: `./data/data.json`,
            },
            {
                dir: BaseDirectory.AppLocalData,
            },
        );
    } catch (e) {
        console.log(e);
    }
};

export const loadData = async () => {
    let data

    try {
        data = await readTextFile(
            `data\\data.json`,
            {
                dir: BaseDirectory.AppLocalData,
            },
        );
    } catch (e) {
        createDataFile()
        return await loadData()

        console.log(e);
    }

    options = new Map(JSON.parse(data))

    return options
}

export const saveData = async (KeyName, newValue) => {
    options.set(KeyName, newValue)

    if (KeyName == "LaunchOnStartup" && newValue == true) {
        await enable();
    } else if (KeyName == "LaunchOnStartup" && newValue == false) {
        await disable();
    }

    let contents = JSON.stringify(Array.from(options.entries()))

    try {
        await writeFile(
            {
                contents: contents,
                path: `./data/data.json`,
            },
            {
                dir: BaseDirectory.AppLocalData,
            },
        );
    } catch (e) {
        console.log(e);
    }
}


const patchData = async (data) => {
    console.log(data)
    if (data.size === 0) return

    options.forEach((value, key) => {
        console.log(key)
        if (!data.has(key)) {
            saveData(key, value)
        }
    })
}
createDataFolder()
// check if json parse if empty and if yes then save for first time users

const data = await loadData()

if (data.get("LaunchOnStartup") == true) {
    await enable();
} else {
    await disable();
}

patchData(data)