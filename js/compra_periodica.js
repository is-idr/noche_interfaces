window.addEventListener("DOMContentLoaded", () => {
    const products = document.querySelectorAll(".product");

    products.forEach(product => {
        const deleteButton = product.querySelector(".delete");

        deleteButton.addEventListener("click", () => {
            product.style.transition = "ease-in 0.25s";
            product.style.transform = "translateX(-100%)";
            setTimeout(() => { product.parentElement.removeChild(product); }, 250);
        });
    });

    const input = document.getElementById("periodicity");
    const daysLabel = document.getElementById("periodicity-days-text");

    let periodicity = input.value;

    updateCalendarAndLabel(periodicity, daysLabel);

    document.addEventListener("custom-number-change", () => {
        periodicity = event.detail.value;

        updateCalendarAndLabel(periodicity, daysLabel);
    });
});

function updateCalendarAndLabel(periodicity, label) {
    setCalendarPeriodicity(periodicity);
    label.innerHTML = (periodicity == 1) ? "día&nbsp;" : "días";
}