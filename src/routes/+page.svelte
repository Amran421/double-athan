<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { getAthanSounds, getTimes } from '$lib/apiFetcher';
	import { playAthan, stopAthan, handleAthanSwitch } from '$lib/athanHandler';
	import { loadData, saveData } from '$lib/persistentstore';

	import { RangeSlider, ListBox, ListBoxItem } from '@skeletonlabs/skeleton';

	import { playIcon, stopIcon } from '$lib/assetExport';

	import bismillah from '../assets/sounds/bismillah.mp3';

	import moment from 'moment';
	import { get } from 'svelte/store';

	let volumeSlider = 0;
	let selectedAthan = 'Athan1.mp3';
	$: options = {
		LaunchOnStartup: true,
		MinimizeToTray: true,
		MinimizeOnClose: true,
		StartMinimized: true,
		'24HourFormat': true
	};

	let athanList = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

	let currentDate = new Date();
	let athanTimes = {};

	let checkMarkImage = new Image();
	checkMarkImage.src = 'https://www.svgrepo.com/show/169312/check-mark.svg';

	async function optionUpdate(KeyName, NewValue) {
		console.log(`new value: ${NewValue}`)
		await saveData(KeyName, NewValue);
		updateOptions();
	}

	async function updateOptions() {
		let data = await loadData();

		data.forEach((value, key) => {
			console.log(key, value);
			options[key] = value;
		});

		selectedAthan = data.get('SelectedAthan') || 'Athan1.mp3';
		volumeSlider = data.get('Volume') != null ? data.get('Volume') : 1;
		console.log(selectedAthan);
	}

	async function updateTimes() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				console.log(position);
				athanTimes = getTimes(position.coords);
			});
		}
		currentDate = new Date();
		console.log('we up');
	}

	console.log(
		new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate() + 1
		).getTime() - new Date().getTime()
	);

	onMount(async () => {
		await updateOptions();
		await updateTimes();

		let startupAudio = new Audio(bismillah);
		startupAudio.volume = volumeSlider;
		startupAudio.play();

		setTimeout(
			updateTimes,
			new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
				.getTime - new Date().getTime
		);
	});
</script>

<body>
	<div class="flex ml-2 mr-2 h-full grid grid-col-3 gap-2 content-center justify-center">
		<!-- Prayer Time Menu -->
		<div class="card col-start-1 col-span-1">
			<div class="pt-1 text-center text-xl font-bold decoration-1">Prayer Times</div>
			<ul class="list m-3">
				{#each Object.entries(athanList) as [index, prayer]}
					<li class="flex-auto justify-between">
						<span class="text-left text-xl">{prayer.charAt(0).toUpperCase() + prayer.slice(1)}</span
						>
						<div class="text-xl uppercase">
							{moment(athanTimes[prayer]).format(
								options['24HourFormat'] == true ? 'HH:mm' : 'hh:mm A'
							)}
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<!-- Athan Sound Menu -->
		<div class="card col-start-2 row-span-1">
			<div class="pt-1 text-center text-xl font-bold">Athans</div>
			<!-- Sound Selection -->
			<ul class="list mt-4 ml-2 mr-2">
				{#await getAthanSounds()}
					<p>Loading Sounds...</p>
				{:then athanNames}
					{#each athanNames as name}
						<ListBox padding="px-2 pt-1">
							<ListBoxItem
								bind:group={selectedAthan}
								on:click={() => handleAthanSwitch(name)}
								name="medium"
								active="variant-filled-tertiary"
								value={name}
								>{name
									?.replaceAll('.mp3', '')
									.replace(/[^0-9](?=[0-9])/g, '$& ')
									.replace(/([A-Z])/g, ' $1')
									.trim()}</ListBoxItem
							>
						</ListBox>
					{/each}
				{/await}
				<!-- Sound Play Buttons -->
				<li class="justify-center">
					<div class="btn-group btn-group-sm variant-filled-primary h-6">
						<button on:click={playAthan(selectedAthan)} class="btn-icon-md">
							<img class="p-1.5" src={playIcon} alt="Play" />
						</button>
						<button on:click={stopAthan} class="btn-icon-md">
							<img class="p-2" src={stopIcon} alt="Play" />
						</button>
					</div>
				</li>
			</ul>
		</div>

		<!-- Options Menu -->
		<div class="card col-start-3 row-span-1">
			<div class="text-center text-xl font-bold">Options</div>
			<!-- Option Selection -->
			<ul class="ml-1 mr-1 mb-1 pt-4">
				{#each Object.entries(options) as [option]}
					{#if option !== 'Volume' && option !== 'SelectedAthan'}
						<div class="justify-center">
							<li class="launchonstart justify-right">
								<span
									role="button"
									tabindex="0"
									on:click={() => {
										optionUpdate(option, !options[option]);
									}}
									on:keypress
									class="chip {options[option]
										? 'variant-filled-tertiary'
										: 'variant-soft'} text-md m-1"
								>
									{#if options[option] == true}
										<img
											src="https://www.svgrepo.com/show/169312/check-mark.svg"
											alt="checkmark"
											width="15"
											height="15"
											class="pr-2"
										/>{/if}
									{option.replace(/([A-Z])/g, ' $1').trim()}
								</span>
							</li>
						</div>
					{/if}
				{/each}
				<!-- Volume Slider -->
				<div class="flex justify-evenly pt-2">
					<span class="text-center font-bold"> Volume </span>
				</div>
				<li class="flex justify-evenly">
					<div class="btn-group btn-group-sm variant-filled-primary p-1">
						<RangeSlider
							on:change={optionUpdate('Volume', volumeSlider)}
							bind:value={volumeSlider}
							name="slider"
							min="0"
							max="1"
							step="0.1"
						/>
					</div>
				</li>
			</ul>
		</div>
	</div>
</body>
