const menuButton = document.getElementById("menuButton");
const nav = document.querySelector(".nav");

menuButton.addEventListener("click", () => {
    nav.classList.toggle("active");
});