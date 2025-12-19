const CNI_DEFAULT_VALUES = {
    CUSTOM_TAG: "custom-number",
    INPUT_VALUE: 1,
    MULTIPLIER: 1,
    SUBTRACT_BUTTON_TEXT: "-",
    ADD_BUTTON_TEXT: "+"
}

const CNI_CLASSES = {
    CUSTOM_NUMBER_CONTAINER: "custom-number-container",
    CUSTOM_NUMBER_INPUT: "custom-number",
    CUSTOM_NUMBER_SUBTRACT: "custom-number-subtract",
    CUSTOM_NUMBER_ADD: "custom-number-add"
}

const CNI_COLORS = {
    BACKGROUND_COLOR: "var(--color-light-blue)",
    BACKGROUND_COLOR_INVALID: "var(--color-light-red)"
}

const CNI_ANIMATION = {
    SCALE_INCREASE_PERCENT: 10
}

const CNI_EVENTS = {
    CUSTOM_INPUT_CHANGE: "custom-number-change"
}

window.addEventListener("DOMContentLoaded", () => {
    const customInputs = document.querySelectorAll("input[type=\"" + CNI_DEFAULT_VALUES["CUSTOM_TAG"] + "\"]");

    customInputs.forEach(customInput => {
        customInput.value = (customInput.hasAttribute("value")) ? customInput.getAttribute("value") : CNI_DEFAULT_VALUES["INPUT_VALUE"];
        
        const customInputContainer = document.createElement("div");
        const subtractButton = document.createElement("button");
        const addButton = document.createElement("button");
        const customInputCopy = customInput.cloneNode(true);

        subtractButton.innerHTML = CNI_DEFAULT_VALUES["SUBTRACT_BUTTON_TEXT"];
        addButton.innerHTML = CNI_DEFAULT_VALUES["ADD_BUTTON_TEXT"];
        customInputCopy.setAttribute("type", "number");
        customInputContainer.classList.add(CNI_CLASSES["CUSTOM_NUMBER_CONTAINER"]);
        subtractButton.classList.add(CNI_CLASSES["CUSTOM_NUMBER_SUBTRACT"]);
        addButton.classList.add(CNI_CLASSES["CUSTOM_NUMBER_ADD"]);
        customInputCopy.classList.add(CNI_CLASSES["CUSTOM_NUMBER_INPUT"]);

        customInput.replaceWith(customInputContainer);
        customInputContainer.append(subtractButton);
        customInputContainer.append(customInputCopy);
        customInputContainer.append(addButton);

        subtractButton.addEventListener("click", () => subtractValue(customInputCopy));
        addButton.addEventListener("click", () => addValue(customInputCopy));
        customInputCopy.addEventListener("focusout", () => checkNumber(customInputCopy));
        customInputCopy.addEventListener("change", () => animateInputValue(customInputCopy));
    });
});

function animateInputValue(input, invalid=false) {
    const validKeyframes = [
        { transform: "scale(" + (1 + Math.round(CNI_ANIMATION["SCALE_INCREASE_PERCENT"]) / 100).toString() + ")" },
        { transform: "scale(1)" }
    ];
    const validTiming = {
        duration: 100,
        easing: "ease-out",
        iterations: 1,
    };
    const invalidKeyframes = [
        { backgroundColor: CNI_COLORS["BACKGROUND_COLOR_INVALID"] },
        { backgroundColor: CNI_COLORS["BACKGROUND_COLOR"] }
    ]
    const invalidTiming = {
        duration: 250,
        easing: "ease-out",
        iterations: 1,
    };
    const keyframes = (invalid) ? invalidKeyframes : validKeyframes;
    const timing = (invalid) ? invalidTiming : validTiming;
    input.animate(keyframes, timing);
    if(!invalid) dispatchCustomEvent(CNI_EVENTS["CUSTOM_INPUT_CHANGE"], input)
}

function isValueWithinMin(input, inclusive=true) {
    if(!inclusive) return (!input.hasAttribute("min") || Number(input.value) > input.getAttribute("min"));
    return (!input.hasAttribute("min") || Number(input.value) >= input.getAttribute("min"));
}
function isValueWithinMax(input, inclusive=true) {
    if(!inclusive) return (!input.hasAttribute("max") || Number(input.value) < input.getAttribute("max"));
    return (!input.hasAttribute("max") || Number(input.value) <= input.getAttribute("max"));
}

function checkNumber(input) {
    const text = input.value;
    const isUndefined = (text === undefined);
    const isBlank = (text.toString().trim() === "");
    const isNotANumber = (isNaN(Number(text)));
    const isWithinRange = (isValueWithinMin(input) && isValueWithinMax(input));

    if(isUndefined || isBlank || isNotANumber || !isWithinRange) {
        input.value = input.getAttribute("value") || CNI_DEFAULT_VALUES["INPUT_VALUE"];
        animateInputValue(input, true);
    }
}

function subtractValue(input) {
    if(isValueWithinMin(input, false)) {
        input.value = Number(input.value) - CNI_DEFAULT_VALUES["MULTIPLIER"];
        animateInputValue(input);
    } else {
        animateInputValue(input, true);
    }
}

function addValue(input) {
    if(isValueWithinMax(input, false)) {
        input.value = Number(input.value) + CNI_DEFAULT_VALUES["MULTIPLIER"];
        animateInputValue(input);
    } else {
        animateInputValue(input, true);
    }
}

function dispatchCustomEvent(name, inputElement) {
    let event = new CustomEvent(name, {
        detail: {
            element: inputElement,
            value: inputElement.value
        }
    });
    document.dispatchEvent(event);
}