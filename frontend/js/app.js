import { getUsers, searchUsers } from "./users.js";
import { getProducts, searchProducts } from "./products.js";

const searchForm = document.getElementById("searchForm");
const showAllButton = document.getElementById("showAllButton");

searchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	searchUsers();
});

showAllButton.addEventListener("click", () => {
	getUsers();
	getProducts();
})

getUsers();
getProducts();