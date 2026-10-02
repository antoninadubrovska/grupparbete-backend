import { getUsers, searchUsers } from "./users.js";
import { getProducts, searchProducts } from "./products.js";

const searchForm = document.getElementById("searchForm");
const showAllButton = document.getElementById("showAllButton");
const productSearchForm = document.getElementById("productSearchForm");
const showAllProductsButton = document.getElementById("showAllProductsButton");

searchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	searchUsers();
});

showAllButton.addEventListener("click", getUsers);

productSearchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	searchProducts();
});

showAllProductsButton.addEventListener("click", getProducts);
getUsers();
getProducts();