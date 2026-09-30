async function getUsers() {
	const message = document.getElementById("message");

	message.className = "";
	message.textContent = "Loading...";

	try {
		const response = await fetch("/api/users");

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const users = await response.json();

		displayUsers(users);

		message.textContent = "";
	} catch (error) {
		console.error(error);

		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

async function searchUsers() {
	const searchInput = document.getElementById("searchInput");
	const message = document.getElementById("message");

	const searchText = searchInput.value.trim();

	if (!searchText) {
		message.className = "error";
		message.textContent = "Please enter a name to search.";
		return;
	}

	message.className = "";
	message.textContent = "Searching...";

	try {
		const response = await fetch(
			`/api/users/search?q=${encodeURIComponent(searchText)}`,
		);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const users = await response.json();

		displayUsers(users);

		if (users.length === 0) {
			message.textContent = "No users found.";
		} else {
			message.textContent = "";
		}
	} catch (error) {
		console.error(error);

		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

function displayUsers(users) {
	const usersGrid = document.getElementById("usersGrid");

	usersGrid.innerHTML = "";

	users.forEach((user) => {
		const userCard = document.createElement("article");

		userCard.className = "user-card";

		userCard.innerHTML = `
			<div class="user-field">
				<span class="user-label">ID</span>
				<span class="user-value">${user.id}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Name</span>
				<span class="user-value">${user.name}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Role</span>
				<span class="user-value">${user.role}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Email</span>
				<span class="user-value">${user.email}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Phone</span>
				<span class="user-value">${user.phone}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Created</span>
				<span class="user-value">${formatDate(user.createdAt)}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Updated</span>
				<span class="user-value">${formatDate(user.updatedAt)}</span>
			</div>
		`;

		usersGrid.appendChild(userCard);
	});
}

function formatDate(dateString) {
	const date = new Date(dateString);

	return date.toLocaleString();
}

getUsers();