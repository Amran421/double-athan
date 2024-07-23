// @ts-nocheck
import Athan1 from '../assets/sounds/Athan1.mp3';
import Athan2 from '../assets/sounds/Athan2.mp3';
import Athan3 from '../assets/sounds/Athan3.mp3';
import Athan4 from '../assets/sounds/Athan4.mp3';
import ShortAthan from '../assets/sounds/ShortAthan.mp3';

import { loadData, saveData } from './persistentstore';

// let athanRefereshed = true;

let athanAudio;
let AthanMap = {
    'Athan1.mp3': Athan1,
    'Athan2.mp3': Athan2,
    'Athan3.mp3': Athan3,
    'Athan4.mp3': Athan4,
    'ShortAthan.mp3': ShortAthan
};


export function handleAthanSwitch(name) {
    saveData("SelectedAthan", name)
}

export async function playAthan(name) {
    let data = await loadData()

    if (!athanAudio) {
        athanAudio = new Audio(AthanMap[name]);
    }
    console.log(data.get("Volume"))
    if (data.get("Volume") == 0) return;

    athanAudio.volume = data.get("Volume") || 1;

    athanAudio.setAttribute('src', AthanMap[name]);

    if (athanAudio.duration > 0 && !athanAudio.paused) {
        athanAudio.currentTime = 0;
    }

    athanAudio.play();
}

export function stopAthan() {
    athanAudio.pause();
    athanAudio.currentTime = 0;
}

export async function athanTime(athanTime) {
    let currentDate = new Date()
    // console.log(athanTime)

    let data = await loadData()
    let soundName = data.get("SelectedAthan")

    if ((athanTime.getTime() - currentDate.getTime()) < 0) return

    // console.log(prayerTime.getTime() - currentDate.getTime())
    setTimeout(playAthan, athanTime.getTime() - currentDate.getTime(), soundName)
}

export function updateAthanVolume(volume) {
    if (!athanAudio) {
        athanAudio = new Audio(AthanMap[name]);
    }
    console.log(volume);
    athanAudio.volume = volume;
} 