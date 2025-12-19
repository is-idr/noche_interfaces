const DROPDOWN_DEFAULT_VALUES = {
    DROPDOWN_WIDTH: "300px",
    DROPDOWN_HEIGHT: "200px",
    DROPDOWN_HEIGHT_COLLAPSED: "100px",
    DROPDOWN_ARROW_SIZE: "70px",
};

const DROPDOWN_SELECTORS = {
    DROPDOWN_CONTAINER: "#dropdown-container",
    DROPDOWN: ".dropdown",
    DROPDOWN_CONTENT: ".dropdown-content",
    DROPDOWN_ARROW: ".dropdown-arrow"
};

const DROPDOWN_ATTRIBUTES = {
    ARROW_PATH: "arrow-path",
    ARROW_SIZE: "arrow-size",
    WIDTH: "width",
    HEIGHT: "height",
    COLLAPSED_HEIGHT: "collapsed-height"
}

const DROPDOWN_ANIMATION = {
    DURATION: 300, // milliseconds
    TIMING_FUNCTION: "ease-in-out"
}

const DROPDOWN_EVENTS = {
    DROPDOWN_OPEN: "dropdown-open",
    DROPDOWN_CLOSE: "dropdown-close"
}

let activeDropdown;
let dropdowns = new Array();

window.addEventListener("DOMContentLoaded", () => {
    const dropdownContainer = document.querySelector(DROPDOWN_SELECTORS["DROPDOWN_CONTAINER"]);

    if(!dropdownContainer.hasAttribute(DROPDOWN_ATTRIBUTES["ARROW_PATH"])) {
        console.error(`The dropdown container has no attribute "${DROPDOWN_ATTRIBUTES["ARROW_PATH"]}", which specifies the path to the image.`);
    }
    const arrowPath = dropdownContainer.getAttribute(DROPDOWN_ATTRIBUTES["ARROW_PATH"]);
    const dropdownElements = dropdownContainer.querySelectorAll(DROPDOWN_SELECTORS["DROPDOWN"]);

    dropdownElements.forEach(dropdownElement => {
        const dropdown = new Dropdown(dropdownElement, arrowPath);
        dropdowns.push(dropdown);
    });
});

function createElement(name, attributes={}) {
    const element = document.createElement(name);
    Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
    return element;
}

class Dropdown {
    constructor(element, arrowPath) {
        this.element = element;
        this.expanded = true;
        this.initialize(arrowPath);
    }

    initialize(arrowPath) {
        // Establecemos estilos del dropdown a partir de sus atributos
        this.element.style.width = this.getAttr(DROPDOWN_ATTRIBUTES["WIDTH"], DROPDOWN_DEFAULT_VALUES["DROPDOWN_WIDTH"]);
        this.expandedHeight = this.getAttr(DROPDOWN_ATTRIBUTES["HEIGHT"], DROPDOWN_DEFAULT_VALUES["DROPDOWN_HEIGHT"]);
        this.collapsedHeight = this.getAttr(DROPDOWN_ATTRIBUTES["COLLAPSED_HEIGHT"], DROPDOWN_DEFAULT_VALUES["DROPDOWN_HEIGHT_COLLAPSED"]);
        //this.element.style.transition = TRANSITION;
        this.element.style.height = this.expandedHeight;
        this.element.style.userSelect = "none";
        this.element.addEventListener("dragstart", (event) => event.preventDefault());

        // Creación de elementos
        const arrowClass = DROPDOWN_SELECTORS["DROPDOWN_ARROW"].substring(1);
        this.arrow = createElement("img", {src: arrowPath, class: arrowClass, alt: "flecha"});
        this.arrow.style.width = this.getAttr(DROPDOWN_ATTRIBUTES["ARROW_SIZE"], DROPDOWN_DEFAULT_VALUES["DROPDOWN_ARROW_SIZE"]);
        this.arrow.style.transform = "rotateZ(180deg)";

        this.content = createElement("div", {class: DROPDOWN_SELECTORS["DROPDOWN_CONTENT"]});
        Array.from(this.element.children).forEach(child => this.content.append(child));

        // Establecemos los elementos
        this.element.append(this.arrow);
        this.element.append(this.content);

        // Creamos eventos de click
        this.element.addEventListener("click", (event) => this.processClick(event));
        this.element.addEventListener("mouseover", () => {
            this.element.style.cursor = (this.expanded) ? "auto" : "pointer";
        });
    }

    getAttr(attributeName, defaultValue) {
        return (this.element.hasAttribute(attributeName)) ? this.element.getAttribute(attributeName) : defaultValue;
    }

    getElementAttr(element, attributeName, defaultValue) {
        return (element.hasAttribute(attributeName)) ? element.getAttribute(attributeName) : defaultValue;
    }

    processClick(event) {
        let currentElement = document.elementFromPoint(event.clientX, event.clientY);;
        for (let i = 0; i < 10; i++) {
            if(currentElement === null) continue;
            if(Array.from(currentElement.classList).includes(DROPDOWN_SELECTORS["DROPDOWN_ARROW"].substring(1))) {
                this.expanded ? this.close() : this.open();
                break;
            }
            if(Array.from(currentElement.classList).includes(DROPDOWN_SELECTORS["DROPDOWN"].substring(1))) {
                this.open();
                break;
            }
            currentElement = currentElement.parentElement;
        }
    }

    open() {
        if(activeDropdown === this || this.expanded) return;
        activeDropdown = this;
        this.expanded = true;
        this.element.style.userSelect = "auto";
        this.element.style.cursor = "auto";
        /*dropdowns.forEach(dropdown => {
            if(dropdown !== this) dropdown.close();
        });*/

        this.openAnimation();

        this.dispatchEvent(DROPDOWN_EVENTS["DROPDOWN_OPEN"]);
    }

    close() {
        if(activeDropdown === this) activeDropdown = null;
        this.element.style.height = this.collapsedHeight;
        this.element.style.userSelect = "none";

        if(!this.expanded) return;
        this.expanded = false;

        this.closeAnimation();

        this.dispatchEvent(DROPDOWN_EVENTS["DROPDOWN_CLOSE"]);
    }

    animateArrow(animation) {
        const timing = {
            iterations: 1,
            duration: DROPDOWN_ANIMATION["DURATION"],
            easing: DROPDOWN_ANIMATION["TIMING_FUNCTION"],
            fill: "forwards"
        };
        this.arrow.animate(animation, timing);
    }

    animateElement(animation) {
        const timing = {
            iterations: 1,
            duration: DROPDOWN_ANIMATION["DURATION"],
            easing: DROPDOWN_ANIMATION["TIMING_FUNCTION"],
            fill: "forwards"
        };
        this.element.animate(animation, timing);
    }

    dispatchEvent(name) {
        document.dispatchEvent(new CustomEvent(name, {
            detail: { element: this }
        }));
    }

    openAnimation() {
        this.animateElement([
            { minHeight: this.collapsedHeight },
            { minHeight: this.expandedHeight }
        ]);

        this.animateArrow([
            { transform: "rotateZ(0deg)" },
            { transform: "rotateZ(180deg)" }
        ]);
    }

    closeAnimation() {
        this.animateElement([
            { minHeight: this.expandedHeight },
            { minHeight: this.collapsedHeight }
        ]);

        this.animateArrow([
            { transform: "rotateZ(180deg)" },
            { transform: "rotateZ(0deg)" }
        ]);
    }
}