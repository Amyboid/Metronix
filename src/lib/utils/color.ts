/** Parse hex color to RGB values (0-255). Returns null on invalid input. */
export function hexToRgb(hex: string): [number, number, number] | null {
	if (!hex || typeof hex !== 'string') return null;
	const h = hex.replace('#', '');
	if (!/^[0-9a-fA-F]{3,8}$/.test(h)) return null;
	// Expand shorthand (#FFF → #FFFFFF)
	const full = h.length <= 4
		? h.split('').map((c) => c + c).join('')
		: h;
	return [
		parseInt(full.substring(0, 2), 16),
		parseInt(full.substring(2, 4), 16),
		parseInt(full.substring(4, 6), 16),
	];
}

/** Euclidean distance between two RGB colors. Returns Infinity on invalid input. */
export function colorDistance(hex1: string, hex2: string): number {
	const a = hexToRgb(hex1);
	const b = hexToRgb(hex2);
	if (!a || !b) return Infinity;
	return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/** Find the closest color from a list to a target hex color. */
export function findClosestColor(
	target: string,
	colors: { hex: string; name: string }[]
): { hex: string; name: string; distance: number } | null {
	if (!colors.length || !hexToRgb(target)) return null;
	let best = colors[0];
	let bestDist = colorDistance(target, best.hex);
	for (let i = 1; i < colors.length; i++) {
		const dist = colorDistance(target, colors[i].hex);
		if (dist < bestDist) {
			bestDist = dist;
			best = colors[i];
		}
	}
	return { hex: best.hex, name: best.name, distance: bestDist };
}

/** Sort colors by distance to a target, closest first. */
export function sortByClosest(
	target: string,
	colors: { hex: string; name: string; count?: number }[]
): { hex: string; name: string; count?: number; distance: number }[] {
	if (!colors.length || !hexToRgb(target)) return [];
	return colors
		.map((c) => ({ ...c, distance: colorDistance(target, c.hex) }))
		.sort((a, b) => a.distance - b.distance);
}
