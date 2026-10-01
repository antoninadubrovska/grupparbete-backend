export async function getProducts() {
	const message = document.getElementById("productsMessage");

	message.className = "";
	message.textContent = "Loading...";

	try {
		const response = await fetch("/api/products");

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const products = await response.json();

		displayProducts(products);

		message.textContent = "";
	} catch (error) {
		console.error(error);

		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

export async function searchProducts() {
	const searchInput = document.getElementById("productSearchInput");
	const message = document.getElementById("productsMessage");

	const searchText = searchInput.value.trim();

	if (!searchText) {
		message.className = "error";
		message.textContent = "Please enter a product name to search.";
		return;
	}

	message.className = "";
	message.textContent = "Searching...";

	try {
		const response = await fetch(
			`/api/products/search?q=${encodeURIComponent(searchText)}`,
		);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const products = await response.json();

		displayProducts(products);

		if (products.length === 0) {
			message.textContent = "No products found.";
		} else {
			message.textContent = "";
		}
	} catch (error) {
		console.error(error);

		message.className = "error";
		message.textContent = "Error: " + error.message;
	}
}

function displayProducts(products) {
	const productsGrid = document.getElementById("productsGrid");

	productsGrid.innerHTML = "";

	products.forEach((product) => {
		const productCard = document.createElement("article");

		productCard.className = "user-card";

		productCard.innerHTML = `
			<img src="${product.image}" alt="${product.name}" class="product-image" />

			<div class="user-field">
				<span class="user-label">Name</span>
				<span class="user-value">${product.name}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Price</span>
				<span class="user-value">${product.price} kr</span>
			</div>

			<div class="user-field">
				<span class="user-label">Category</span>
				<span class="user-value">${product.category}</span>
			</div>

			<div class="user-field">
				<span class="user-label">In stock</span>
				<span class="user-value">${product.amountInStock}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Description</span>
				<span class="user-value">${product.description}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Created</span>
				<span class="user-value">${formatDate(product.createdAt)}</span>
			</div>

			<div class="user-field">
				<span class="user-label">Updated</span>
				<span class="user-value">${formatDate(product.updatedAt)}</span>
			</div>
		`;

		productsGrid.appendChild(productCard);
	});
}

function formatDate(dateString) {
	const date = new Date(dateString);

	return date.toLocaleString();
}