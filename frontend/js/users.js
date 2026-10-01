import { fetchUsers, searchUsersApi } from "./api.js";



export async function getUsers() {
	const message = document.getElementById("message");

	message.className = "";
	message.textContent = "Loading...";

	try {

		const users = await fetchUsers();

		displayUsers(users);

		message.textContent = "";
	} catch (error) {
		console.error(error);

		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

export async function searchUsers() {
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


		const users = await searchUsersApi(searchText);

		displayUsers(users);

		message.textContent = users.length === 0 ? "No users found." : "";

	} catch (error) {
		console.error(error);

		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

// users are dynamically created
function displayUsers(users) {
	const usersGrid = document.getElementById("usersGrid");

	usersGrid.innerHTML = "";

	users.forEach((user) => {
		const userCard = document.createElement("article");

		userCard.className = "user-card";

		userCard.innerHTML = `
			<div class="user-id">
				<span>ID:</span>
				<span title="${user.id}">
					${user.id.replace("USER#", "").slice(0, 16)}...
				</span>
			</div>

			<div class="user-main">
				<h3>${user.name}</h3>
				<span class="user-role">${user.role}</span>
			</div>

			<div class="user-contact">
				<p>${user.email}</p>
				<p>${user.phone}</p>
			</div>

			<button class="see-more-btn" type="button">
				See more
			</button>

			<div class="user-details hidden">
				<div class="user-field">
					<span class="user-label">Created</span>
					<span class="user-value">${formatDate(user.createdAt)}</span>
				</div>

				<div class="user-field">
					<span class="user-label">Updated</span>
					<span class="user-value">${formatDate(user.updatedAt)}</span>
				</div>
			</div>
		`;

		usersGrid.appendChild(userCard);
	});
}

// See more / See less
const usersGrid = document.getElementById("usersGrid");

usersGrid.addEventListener("click", (event) => {
	if (!event.target.classList.contains("see-more-btn")) {
		return;
	}

	const button = event.target;
	const details = button.nextElementSibling;

	details.classList.toggle("hidden");

	if (details.classList.contains("hidden")) {
		button.textContent = "See more";
	} else {
		button.textContent = "See less";
	}
});

function formatDate(dateString) {
	const date = new Date(dateString);

	return date.toLocaleString();
}
