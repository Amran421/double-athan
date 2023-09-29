// @ts-nocheck
import Athan1 from '../assets/sounds/Athan1.mp3';
import Athan2 from '../assets/sounds/Athan2.mp3';
import Athan3 from '../assets/sounds/Athan3.mp3';
import Athan4 from '../assets/sounds/Athan4.mp3';
import ShortAthan from '../assets/sounds/ShortAthan.mp3';

import { loadData, saveData } from './persistentstore';

let athanRefereshed = true;

let athanAudio;
let AthanMap = {
    'Athan1.mp3': Athan1,
    'Athan2.mp3': Athan2,
    'Athan3.mp3': Athan3,
    'Athan4.mp3': Athan4,
    'ShortAthan.mp3': ShortAthan
};


export function handleAthanSwitch(name) {
    // if (name === selectedAthan) return;
    saveData("SelectedAthan", name)
}

export async function playAthan(name) {
    let data = await loadData()

    if (!athanAudio) {
        athanAudio = new Audio(AthanMap[name]);
    }

    athanAudio.volume = data.get("Volume") || 1;

    athanAudio.setAttribute('src', AthanMap[name]);

    if (athanAudio.duration > 0 && !athanAudio.paused) {
        athanAudio.currentTime = 0;
    }

    athanAudio.play();
}

export function stopAthan() {
    // athanAudio = new Audio(AthanMap[selectedAthan]);
    athanAudio.pause();
    athanAudio.currentTime = 0;
}

export async function athanTime(athanTime) {
    let prayer = athanTime.split(" ")
    let time = prayer[0]
    let timeSuffix = prayer[1].replaceAll("%", "").trim()

    console.log(timeSuffix)

    let timeSplit = time.split(":")
    let timeHours = timeSuffix === "am" ? Number(timeSplit[0]) : Number(timeSplit[0]) + 12
    let timeSeconds = Number(timeSplit[1])


    let currentDate = new Date()
    let prayerTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), timeHours, timeSeconds)
    // console.log(prayerTime)

    /* 
     Create a global var named athanRefereshed
     create timout set to go off at the start of next day
     will update all athans and set refereshed var to true
     check if true before setting timeout to prevent dupes 
     [COMPLETED BUT NEEDS TESTING: +page.svelte:47]
     */

    let data = await loadData()
    let soundName = data.get("SelectedAthan")

    if ((prayerTime.getTime() - currentDate.getTime()) < 0) return

    // console.log(prayerTime.getTime() - currentDate.getTime())
    setTimeout(playAthan, prayerTime.getTime() - currentDate.getTime(), soundName)

    if (!athanRefereshed) {
        setTimeout()
    }

}
