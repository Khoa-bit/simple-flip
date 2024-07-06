<script lang="ts">
	import { Flip, type Options } from '$lib/flip';

	let clickHandler = () => {
		const group = Flip.getState(['.group2', '.box2']);

		const groupEl = document.querySelector('.group2')!;
		groupEl.classList.toggle('reorder');

		group.flip({ duration: 1000, stagger: 100 });
	};
</script>

<button
	id="my-flip"
	class="rounded bg-sky-100 p-2 hover:bg-sky-200 active:bg-sky-300"
	on:click={clickHandler}>Change</button
>
<div class="group2 reorder">
	<div class="box2">
		Common "FLIP" techniques employed by other tools won't work with flex elements because of the
		way browsers handle width/height.
	</div>
	<div class="box2">
		Simply set <code>absolute: true</code> to have GSAP's Flip plugin make the elements position: absolute
		during the flip to work around challenges with flex and grid layouts.
	</div>
	<div class="box2">
		When the flip animation is done, elements get reverted back to their normal positioning and
		everything appears seamless.
	</div>
	<div class="box2">Happy flipping!</div>
</div>

<style>
	:root {
		--color-shockingly-green: #0ae448;
		--color-just-black: #0e100f;
		--color-surface-white: #fffce1;
		--color-pink: #fec5fb;
		--color-shockingly-pink: #f100cb;
		--color-orangey: #ff8709;
		--color-lilac: #9d95ff;
		--color-lt-green: #abff84;
		--color-blue: #00bae2;
		--color-grey: gray;
		--color-surface75: #bbbaa6;
		--color-surface50: #7c7c6f;
		--color-surface25: #42433d;
	}

	.group2.reorder {
		flex-direction: row;
	}

	.group2 {
		width: 740px;
		height: auto;
		margin: 1rem auto;
		padding: 4px;
		border: solid 2px black;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		color: var(--color-just-black);
		border-radius: 10px;
	}

	.box2 {
		margin: 4px;
		padding: 8px;
		line-height: 28px;
		border-radius: 10px;
	}

	.box2:nth-child(1) {
		background-color: var(--color-lilac);
	}

	.box2:nth-child(2) {
		background-color: var(--color-blue);
	}

	.box2:nth-child(3) {
		background-color: var(--color-orangey);
	}

	.box2:nth-child(4) {
		background-color: var(--color-lt-green);
	}
</style>
