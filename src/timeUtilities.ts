export function formatTimestamp(date: Date = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, "0");

	const yyyy = date.getFullYear();
	const mm = pad(date.getMonth() + 1);
	const dd = pad(date.getDate());
	const hh = pad(date.getHours());
	const min = pad(date.getMinutes());
	const ss = pad(date.getSeconds());

	return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}