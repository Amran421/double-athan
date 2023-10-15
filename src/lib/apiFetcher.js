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

// export async function getIp() {
//     let ipGrabLink = 'https://api.ipify.org?format=json';

//     let response

//     try {
//         response = await fetch(ipGrabLink, { method: 'GET', timeout: 30 });
//     } catch (e) {
//         console.log(e)
//     }

//     console.log(response?.data.ip)

//     return response?.data.ip
// }

export function getTimes(coords) {
    console.log(coords)
    const coordinates = new Coordinates(coords.latitude, coords.longitude);
    const params = CalculationMethod.NorthAmerica();
    const date = new Date();
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    return prayerTimes;
}

// export async function getTimes() {
//     let userIp = await getIp();
//     let prayerTimesLink = `https://www.islamicfinder.us/index.php/api/prayer_times?user_ip=${userIp}`;

//     let response
//     try {
//         response = await fetch(prayerTimesLink, { method: 'GET', timeout: 30 });
//     } catch (e) {
//         response = undefined
//         console.log(e)
//     }

//     if (response === undefined) return undefined


//     let results = response?.data.results

//     for (const key in results) {
//         athanTime(results[key])
//     }
//     console.log(results)

//     return results
// }