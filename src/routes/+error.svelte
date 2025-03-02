<script lang="ts">
	import { page } from '$app/state';
</script>

<h1 class="mt-52">{page.status}:{page.error?.message}</h1>
<a href="/" class="underline">return to home</a>