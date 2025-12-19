window.addEventListener("DOMContentLoaded", () => {
    const products = document.querySelectorAll(".product");

    products.forEach(product => {
        const deleteButton = product.querySelector(".delete");
        deleteButton.addEventListener("click", () => {
            product.style.transition = "ease-in 0.25s";
            product.style.transform = "translateX(-100%)";
            setTimeout(() => {
                product.parentElement.removeChild(product);
            }, 250);
        });
    });
});