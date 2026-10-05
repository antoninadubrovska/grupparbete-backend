export async function fetchUsers() {
	const response = await fetch("/api/users");

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function searchUsersApi(searchText) {
	const response = await fetch(
		`/api/users/search?q=${encodeURIComponent(searchText)}`,
	);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function fetchAllCartItems() {
	const response = await fetch("/api/cart");

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}
