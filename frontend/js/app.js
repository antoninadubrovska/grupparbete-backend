import { getUsers, searchUsers } from "./users.js";

const searchForm = document.getElementById("searchForm");
const showAllButton = document.getElementById("showAllButton");

searchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	searchUsers();
});

showAllButton.addEventListener("click", getUsers);

getUsers();