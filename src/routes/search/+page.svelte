<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	let param = page.url.searchParams.get('q');
	console.log(param);
</script>

<div>
	<input value={param} />
</div>
