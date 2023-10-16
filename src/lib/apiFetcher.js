// @ts-nocheck
import { fetch } from '@tauri-apps/api/http'
import { BaseDirectory, readDir } from '@tauri-apps/api/fs'
import { resourceDir, join } from '@tauri-apps/api/path'
import { athanTime } from './athanHandler';
import {
    Coordinates,
    CalculationMethod,
    PrayerTimes,
    SunnahTimes,
    Prayer,
    Qibla,
} from 'adhan'

let athanList = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export async function getAthanSounds() {
    let resourcePath = await resourceDir();
    let soundsPath = await join(resourcePath, '_up_', 'src', 'assets', 'sounds');
    let red = await readDir(soundsPath, { recursive: true });

    let athanNames = [];
    let AthanSounds = [];

    for (let i = 0; i < red.length; i++) {
        if (!red[i].name.match("Athan")) continue;
        athanNames.push(red[i].name);
    }

    return athanNames;
}

export function getTimes(coords) {
    console.log(coords)
    const coordinates = new Coordinates(coords.latitude, coords.longitude);
    const params = CalculationMethod.NorthAmerica();
    const date = new Date();
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    for (let i = 0; i < athanList.length; i++) {
        // console.log(prayerTimes[athanList[i]])
        athanTime(prayerTimes[athanList[i]]);
    }

    return prayerTimes;
}