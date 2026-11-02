

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {

    menuToggle.addEventListener("click", () => {

        navigation.classList.toggle("open");

        const isOpen =
            navigation.classList.contains("open");

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Cerrar menú"
                : "Abrir menú"
        );

        menuToggle.textContent =
            isOpen ? "✕" : "☰";
    });

    const navLinks =
        navigation.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            navigation.classList.remove("open");

            menuToggle.textContent = "☰";

            menuToggle.setAttribute(
                "aria-label",
                "Abrir menú"
            );
        });

    });

}

const currentYear = new Date().getFullYear();

const yearElements =
    document.querySelectorAll("[data-year]");

yearElements.forEach(element => {

    element.textContent = currentYear;

});

console.log(
    "🐾 Fundación Huellitas cargada correctamente."
);