<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	import { getAthanSounds, getTimes } from '$lib/apiFetcher';
	import { playAthan, stopAthan, handleAthanSwitch, updateAthanVolume } from '$lib/athanHandler';
	import { loadData, saveData } from '$lib/persistentstore';
	import { CalculationMethod, CalculationParameters } from 'adhan';

	import { RangeSlider, ListBox, ListBoxItem } from '@skeletonlabs/skeleton';

	import { playIcon, stopIcon } from '$lib/assetExport';

	import bismillah from '../assets/sounds/bismillah.mp3';

	import moment from 'moment';
	import { get } from 'svelte/store';
	import { space } from 'postcss/lib/list';

	let volumeSlider = 0;
	let selectedAthan = 'Athan1.mp3';
	let calcMethod = 'NorthAmerica';
	let locationError = false;

	$: options = {
		LaunchOnStartup: true,
		MinimizeToTray: true,
		MinimizeOnClose: true,
		StartMinimized: true,
		'24HourFormat': true
	};

	let athanList = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

	let currentDate = new Date();
	$: athanTimes = {};

	let checkMarkImage = new Image();
	checkMarkImage.src = 'https://www.svgrepo.com/show/169312/check-mark.svg';

	function isAthanTimesLoaded() {
		if (athanTimes == {}) return false;
		else return true;
	}

	async function optionUpdate(KeyName, NewValue) {
		console.log(`new value: ${NewValue}`);
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

		if (data.get('CalcMethod') !== calcMethod) {
			console.log(data.get('CalcMethod'));
			calcMethod = data.get('CalcMethod') != null ? data.get('CalcMethod') : 'North America';
			updateTimes();
		}

		console.log(selectedAthan);
	}

	async function updateTimes() {
		console.log(navigator.geolocation);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					console.log('navigator.geolocation');
					athanTimes = await getTimes(position.coords);
					currentDate = new Date();
					console.log('we up');
				},
				(e) => {
					if (e) {
						locationError = true;
					}
				}
			);
		}
	}

	onMount(async () => {
		await updateOptions();
		await updateTimes();

		let startupAudio = new Audio(bismillah);
		startupAudio.volume = volumeSlider;
		startupAudio.play();

		setTimeout(
			updateTimes,
			new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				currentDate.getDate() + 1
			).getTime() - new Date().getTime()
		);
	});
</script>

<body class="container mx-auto my-auto h-full content-center">
	{#if locationError == true}
		<div class="flex justify-center w-full">
			<div role="alert" class="flex alert alert-error w-auto absolute z-10">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="">Error getting location! Check if location is enabled then REFRESH.</span>
			</div>
		</div>
	{/if}
	<!-- Grid Menu -->

	<div class="flex m-2 grow h-[4/6] w-full items-center justify-center">
		<div class="top-10 grid grid-cols-[200px_175px_250px] gap-2">
			<!-- Prayer Time Menu -->
			<div class="flex card shadow-xl rounded bg-secondary col-start-1 col-span-1">
				<div class="pt-1 join justify-evenly">
					<div class="text-xl font-bold decoration-1">Prayer Times</div>
					<label class="btn btn-square btn-sm swap float-left">
						<input
							on:change={optionUpdate('24HourFormat', !options['24HourFormat'])}
							type="checkbox"
						/>
						<div class="swap-off">12H</div>
						<div class="swap-on">24H</div>
					</label>
				</div>
				<ul class="list m-1">
					{#each Object.entries(athanList) as [index, prayer]}
						<li class="flex-auto justify-between">
							<div class="divider m-3 text-left text-xl">
								{prayer.charAt(0).toUpperCase() + prayer.slice(1)}
							</div>
							<div class="text-center font-bold text-xl uppercase">
								{moment(athanTimes[prayer]).format(
									options['24HourFormat'] == true ? 'HH:mm' : 'hh:mm A'
								)}
							</div>
							<!-- <div class="divider -m-1" /> -->
						</li>
					{/each}
				</ul>
			</div>
			<!-- Athan Sound Menu -->
			<div class="flex card shadow-xl rounded bg-secondary col-start-2 row-span-1">
				<div class="pt-1 text-center text-xl font-bold">Athans</div>
				<!-- Sound Selection -->
				<ul class="list mt-4 ml-2 mr-2">
					{#await getAthanSounds()}
						<p>Loading Sounds...</p>
					{:then athanNames}
						{#each athanNames as name}
							<li class="flex p-1 items-center">
								<input
									type="radio"
									bind:group={selectedAthan}
									on:click={() => handleAthanSwitch(name)}
									value={name}
									name="medium"
									class="radio radio-sm"
								/>
								<span class="pl-2"
									>{name
										?.replaceAll('.mp3', '')
										.replace(/[^0-9](?=[0-9])/g, '$& ')
										.replace(/([A-Z])/g, ' $1')
										.trim()}</span
								>
							</li>
						{/each}
					{/await}
					<!-- Sound Play Buttons -->
					<li class="flex join justify-center">
						<button class="btn join-item" on:click={playAthan(selectedAthan)}>
							<img class="" src={playIcon} alt="Play" />
						</button>
						<button class="btn join-item" on:click={stopAthan}>
							<img class="" src={stopIcon} alt="Stop" />
						</button>
					</li>
				</ul>
			</div>

			<!-- Options Menu -->
			<div class="card shadow-xl rounded bg-secondary col-start-3 row-span-1">
				<div class="text-center text-xl font-bold">Options</div>
				<!-- Option Selection -->
				<ul class="ml-1 mr-1 mb-1 pt-4">
					{#each Object.entries(options) as [option]}
						{#if option !== 'Volume' && option !== 'SelectedAthan' && option !== 'CalcMethod' && option !== '24HourFormat'}
							<li class="flex p-1 items-center">
								<input
									type="checkbox"
									on:change={optionUpdate(option, !options[option])}
									checked={options[option]}
									class="checkbox checkbox-sm"
								/>
								<span class="pl-2">
									{option.replace(/([A-Z])/g, ' $1').trim()}
								</span>
							</li>
						{/if}
					{/each}

					<!-- Calculation Method Dropdown -->
					<div class="flex dropdown justify-center">
						<div tabindex="0" role="button" class="btn m-1 text-center">
							{calcMethod.replace(/([A-Z])/g, ' $1').trim()}
						</div>
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<ul
							tabindex="0"
							class="block dropdown-content z-[1] menu p-2 overflow-y-auto shadow bg-base-100 rounded-box w-52 max-h-32"
						>
							{#each Object.entries(CalculationMethod) as [method]}
								{#if method !== 'Other'}
									<li>
										<div
											tabindex="0"
											role="button"
											on:click={() => optionUpdate('CalcMethod', method.toString())}
											on:keydown
										>
											{method.replace(/([A-Z])/g, ' $1').trim()}
										</div>
									</li>
								{/if}
							{/each}
						</ul>
					</div>

					<!-- Volume Slider -->
					<div class="flex divider justify-evenly pt-2">
						<span class="text-center font-bold"> Volume </span>
					</div>
					<li class="flex justify-evenly">
						<input
							type="range"
							on:change={() => {
								optionUpdate('Volume', volumeSlider);
								updateAthanVolume(volumeSlider);
							}}
							bind:value={volumeSlider}
							name="slider"
							min="0"
							max="1"
							step="0.01"
							class="range range-sm variant-filled-primary p-3"
						/>
					</li>
				</ul>
			</div>
		</div>
	</div>
</body>
