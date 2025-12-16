window.addEventListener("DOMContentLoaded", () => {
    let hamburger = document.getElementById("hamburger");
    let icon = hamburger.querySelector(".icon");
    let content = hamburger.querySelector(".content");
    let contentOpened = false;

    icon.addEventListener("click", () => {
        contentOpened = !contentOpened;
        animateContent(content, contentOpened);
    });
});

function animateContent(content, open) {
    let timing = {
        iterations: 1,
        duration: 350,
        fill: "forwards"
    };
    timing.easing = (open) ? "ease-out" : "ease-in";

    let animation = (open) ? [
        { transform: "translateX(100%)" },
        { transform: "translateX(0%)" }
    ] : [
        { transform: "translateX(0%)" },
        { transform: "translateX(100%)" }
    ];

    content.animate(animation, timing);
}