import { fetchAllCartItems } from "./api.js";

export async function getCart() {
	const userIdInput = document.getElementById("cartUserIdInput");
	const message = document.getElementById("cartMessage");

	const userId = userIdInput.value.trim();

	if (!userId) {
		message.className = "error";
		message.textContent = "Please enter a user ID.";
		return;
	}

	message.className = "";
	message.textContent = "Loading...";

	try {
		const allCartItems = await fetchAllCartItems();

		const userCartItems = allCartItems.filter(
			(item) => item.userId === userId,
		);

		displayCart(userCartItems);

		message.textContent =
			userCartItems.length === 0 ? "This user's cart is empty." : "";
	} catch (error) {
		console.error(error);
		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

function displayCart(cartItems) {
	const cartGrid = document.getElementById("cartGrid");

	cartGrid.innerHTML = "";

	cartItems.forEach((item) => {
		const cartCard = document.createElement("article");
		cartCard.className = "user-card";

		cartCard.innerHTML = `
			<div class="user-field">
				<span class="user-label">Product ID</span>
				<span class="user-value">${item.productId}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Amount</span>
				<span class="user-value">${item.amount}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Added</span>
				<span class="user-value">${formatDate(item.addedAt)}</span>
			</div>
		`;

		cartGrid.appendChild(cartCard);
	});
}

function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleString();
}
