export function extractIdFromPk(pk: string): string {
	return pk.split("#")[1] ?? "";
}