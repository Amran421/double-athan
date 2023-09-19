<script>
	// @ts-nocheck

	import { fetch } from '@tauri-apps/api/http';
	import { BaseDirectory, readDir } from '@tauri-apps/api/fs';
	import { join, resolveResource, resourceDir } from '@tauri-apps/api/path';

	import Athan1 from '../assets/sounds/Athan1.mp3';
	import Athan2 from '../assets/sounds/Athan2.mp3';
	import Athan3 from '../assets/sounds/Athan3.mp3';
	import Athan4 from '../assets/sounds/Athan4.mp3';
	import ShortAthan from '../assets/sounds/ShortAthan.mp3';

	let AthanMap = {
		'Athan1.mp3': Athan1,
		'Athan2.mp3': Athan2,
		'Athan3.mp3': Athan3,
		'Athan4.mp3': Athan4,
		'ShortAthan.mp3': ShortAthan
	};

	let ipNotGrabbed = false;
	let errorMessage = 'Unable to get location. Please try restarting the app.';

	var re = /[^0-9](?=[0-9])/g;

	let selectedAthan = 'Athan1.mp3';
	let athanAudio;

	function handleAthanSwitch(name) {
		if (name === selectedAthan) return;
		selectedAthan = name;
	}

	function playAthan() {
		if (!athanAudio) {
			athanAudio = new Audio(AthanMap[selectedAthan]);
		}

		athanAudio.volume = 1;

		athanAudio.setAttribute('src', AthanMap[selectedAthan]);

		if (athanAudio.duration > 0 && !athanAudio.paused) {
			athanAudio.currentTime = 0;
		}

		athanAudio.play();
	}

	function stopAthan() {
		// athanAudio = new Audio(AthanMap[selectedAthan]);
		athanAudio.pause();
		athanAudio.currentTime = 0;
	}

	async function getAthans() {
		let resourcePath = await resourceDir();
		let soundsPath = await join(resourcePath, '_up_', 'src', 'assets', 'sounds');
		let red = await readDir(soundsPath, { recursive: true });

		let athanNames = [];
		let AthanSounds = [];

		for (let i = 0; i < red.length; i++) {
			athanNames.push(red[i].name);
		}

		return athanNames;
	}

	async function getIp() {
		let ipGrabLink = 'https://api.ipify.org?format=json';

		const response = fetch(ipGrabLink, { method: 'GET', timeout: 30 });

		if (response == null) {
			ipNotGrabbed = true;
		}
		return (await response).data.ip;
	}

	async function getTimes() {
		let userIp = await getIp();
		let prayerTimesLink = `https://www.islamicfinder.us/index.php/api/prayer_times?user_ip=${userIp}`;

		const response = fetch(prayerTimesLink, { method: 'GET', timeout: 30 });
		return (await response).data.results;
	}
</script>

<body class="flex w-full h-full grid grid-col-2 gap-2 content-center justify-center">
	<!-- Prayer Time Menu -->
	<div class="card col-start-1 row-span-1">
		<div class="pt-1 text-center text-xl font-bold decoration-1">Prayer Times</div>
		{#await getTimes()}
			<p>Loading Prayer Times...</p>
		{:then prayerTimes}
			<ul class="list m-4">
				{#each Object.entries(prayerTimes) as [prayer, time]}
					<li class="flex-auto justify-between">
						<span class="text-left text-xl">{prayer}</span>
						<div class="text-xl uppercase">{time.replaceAll('%', '')}</div>
					</li>
				{/each}
			</ul>
		{:catch error}
			<p>Something went wrong: {error.message}</p>
		{/await}
	</div>
	<!-- Athan Sound Menu -->
	<div class="card col-start-2 row-span-1">
		<div class="pt-1 text-center text-xl font-bold">Athans</div>
		<!-- Sound Selection -->
		<ul class="list m-4">
			{#await getAthans()}
				<p>Loading Sounds...</p>
			{:then athanNames}
				{#each athanNames as name}
					<li class="justify-between">
						<input
							on:click={() => handleAthanSwitch(name)}
							checked={name === selectedAthan ? true : false}
							type="radio"
						/>
						<span class="text-lg"
							>{name
								?.replaceAll('.mp3', '')
								.replace(re, '$& ')
								.replace(/([A-Z])/g, ' $1')
								.trim()}</span
						>
					</li>
				{/each}
			{/await}
			<!-- Sound Play Buttons -->
			<li class="justify-center">
				<div class="btn-group btn-group-sm variant-filled-primary h-7">
					<button on:click={playAthan} class="btn-icon-md">Play</button>
					<button on:click={stopAthan} class="btn-icon-md">Stop</button>
				</div>
			</li>
		</ul>
	</div>
</body>
