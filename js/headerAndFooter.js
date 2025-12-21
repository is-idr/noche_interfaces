window.addEventListener("DOMContentLoaded", () => {
    // Primero obtenemos los elementos del header
    const hamburger = document.getElementById("hamburger");
    const icon = hamburger.querySelector(".icon");
    const content = hamburger.querySelector(".content");
    const close = content.querySelector("#close-hamburger-button");
    const background = hamburger.querySelector("#content-background");
    // Ocultamos el fondo y establecemos que no esté abierto por defecto
    background.hidden = true;
    let contentOpened = false;

    // Al darle click al icono, abrir/cerrar el menú (con animación)
    icon.addEventListener("click", () => {
        contentOpened = !contentOpened;
        animateContent(content, background, contentOpened);
    });
    // Al darle a la X, cerrar el menú (con animación)
    close.addEventListener("click", () => {
        contentOpened = false;
        animateContent(content, background, contentOpened);
    });
    // Al darle click al fondo, cerrar el menú (con animación)
    background.addEventListener("click", () => {
        contentOpened = false;
        animateContent(content, background, contentOpened);
    });
});

function animateContent(content, background, open) {
    let timing = {
        iterations: 1,
        duration: 350,
        fill: "forwards"
    };
    timing.easing = (open) ? "ease-out" : "ease-in";

    const contentAnimation = (open) ? [
        { transform: "translateX(100%)" },
        { transform: "translateX(0%)" }
    ] : [
        { transform: "translateX(0%)" },
        { transform: "translateX(100%)" }
    ];

    content.animate(contentAnimation, timing);

    const backgroundAnimation = (open) ? [
        { opacity: "0%" },
        { opacity: "30%" }
    ] : [
        { opacity: "30%" },
        { opacity: "0%" }
    ];

    background.animate(backgroundAnimation, timing);
    if(open) background.hidden = false;
    else setTimeout(() => { background.hidden = true; }, timing.duration);
}