<script>
	import FlipDemo1 from '$lib/sandbox/FlipDemo1.svelte';
	import FlipDemo2 from '$lib/sandbox/FlipDemo2.svelte';
</script>

<h1 class="mx-auto w-fit p-5 text-2xl font-bold">Flip animation demo</h1>
<div class="flex flex-col gap-10 p-10">
	<div class="grid place-items-center rounded border p-2">
		<FlipDemo1 />
	</div>
	<div class="rounded border p-2">
		<FlipDemo2 />
	</div>
	<div class="h-96"></div>
</div>
