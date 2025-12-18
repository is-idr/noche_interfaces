const POPUP_DEFAULT_VALUES = {
    TRIGGER_ON: "click" // Por defecto, se ejecutará al darle click al trigger
}

const POPUP_SELECTORS = {
    POPUP: ".popup",
    POPUP_TRIGGER: ".popup-trigger",
    POPUP_CONTAINER: ".popup-container",
    POPUP_CLOSE: ".popup-close",
    POPUP_BACKGROUND: "#popup-background"
}

const POPUP_ATTRIBUTES = {
    POPUP_ID: "popup-id",
    TRIGGER_ON: "trigger-on"
}

const POPUP_ANIMATION_TIMING = {
    iterations: 1,
    duration: 250, // milliseconds
    easing: "cubic-bezier(.17,.91,.59,1)",
    fill: "forwards"
}

const POPUP_CLOSE_IMAGE_META = "popup-close"; // <meta name="popup-close" value="./PathTo/Icons/close.png"/>
const POPUP_CLOSE_KEYS = ["Escape"];
const POPUP_BACKGROUND_OPACITY = "20%";

let activePopup = null;
let popups = new Map();
let popupBackground, popupBackgroundOpacity;

window.addEventListener("DOMContentLoaded", () => {
    const popupElements = document.querySelectorAll(POPUP_SELECTORS["POPUP"]);
    const popupTriggers = document.querySelectorAll(POPUP_SELECTORS["POPUP_TRIGGER"]);
    const closeImagePath = getCloseImagePath();

    popupBackground = createElement("div", {id: POPUP_SELECTORS["POPUP_BACKGROUND"].substring(1)});
    popupBackground.hidden = true;
    popupBackground.style.opacity = POPUP_BACKGROUND_OPACITY;
    popupBackground.addEventListener("click", () => closePopups());
    document.body.prepend(popupBackground);

    popupElements.forEach(popupElement => {
        if(!popupElement.hasAttribute(POPUP_ATTRIBUTES["POPUP_ID"])) {
            console.error("A popup is missing and ID. Add the attribute \"" + POPUP_ATTRIBUTES["POPUP_ID"] + "\" for it to work.");
            return;
        }
        const popupID = popupElement.getAttribute(POPUP_ATTRIBUTES["POPUP_ID"]);
        const popup = new Popup(popupElement, closeImagePath);
        popups.set(popupID, popup);
    });

    popupTriggers.forEach(popupTrigger => {
        if(!popupTrigger.hasAttribute(POPUP_ATTRIBUTES["POPUP_ID"])) {
            console.error("A popup trigger is missing and ID. Add the attribute \"" + POPUP_ATTRIBUTES["POPUP_ID"] + "\" for it to work.");
            return;
        }

        const popupID = popupTrigger.getAttribute(POPUP_ATTRIBUTES["POPUP_ID"]);
        if(!popups.has(popupID)) {
            console.warn("A popup trigger has an ID that isn't linked to any popup");
            return;
        }

        const hasCustomTrigger = popupTrigger.hasAttribute(POPUP_ATTRIBUTES["TRIGGER_ON"]);
        const triggerOn = (hasCustomTrigger) ? popupTrigger.getAttribute(POPUP_ATTRIBUTES["TRIGGER_ON"]) : POPUP_DEFAULT_VALUES["TRIGGER_ON"];
        popupTrigger.addEventListener(triggerOn, () => {
            openPopup(popupID);
        });
    });
});

function getCloseImagePath() {
    const metaElement = document.querySelector("meta[name=\"" + POPUP_CLOSE_IMAGE_META + "\"]");
    if(!metaElement) console.warn("There is no meta element with the name \"" + POPUP_CLOSE_IMAGE_META + "\", so the close image won't load correctly");
    return metaElement ? metaElement.getAttribute("value") : "";
}

window.addEventListener("keyup", (event) => {
    if(POPUP_CLOSE_KEYS.includes(event.key)) closePopups();
});

function openPopup(ID) {
    if(popups.has(ID.toString())) {
        if(activePopup) activePopup.close();
        popups.get(ID.toString()).open();
        animateBackground();
    } else {
        console.warn(`There is no Popup with ID: "${ID}"`);
    }
}

function closePopups() {
    if(activePopup) activePopup.close();
    activePopup = null;
    animateBackground(false);
}

function animateBackground(open=true) {
    const openKeyframes = [
        { opacity: "0%" },
        { opacity: POPUP_BACKGROUND_OPACITY }
    ];
    const closeKeyframes = [
        { opacity: popupBackground.style.opacity },
        { opacity: "0%" }
    ];

    if(open) {
        popupBackground.animate(openKeyframes, POPUP_ANIMATION_TIMING);
        popupBackground.hidden = false;
    } else {
        popupBackground.animate(closeKeyframes, POPUP_ANIMATION_TIMING);
        setTimeout(() => {
            popupBackground.hidden = true;
        }, POPUP_ANIMATION_TIMING["duration"]);
    }
    
}

function createElement(name, attributes={}) {
    const element = document.createElement(name);
    Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
    return element;
}

class Popup {
    constructor(element, imagePath) {
        this.initialize(element, imagePath);
    }

    initialize(element, imagePath) {
        this.container = createElement("div", {class: POPUP_SELECTORS["POPUP_CONTAINER"].substring(1)});
        
        this.closeImage = createElement("img", {src: imagePath, class: POPUP_SELECTORS["POPUP_CLOSE"].substring(1), alt: "Cerrar"});
        this.closeImage.addEventListener("click", () => closePopups());
        
        this.content = element.cloneNode(true);
        
        this.container.append(this.closeImage);
        this.container.append(this.content);
        this.container.style.display = "none";

        element.replaceWith(this.container);
    }

    open() {
        if(activePopup === this) return;
        activePopup = this;

        this.openAnimation();
    }

    close() {
        if(activePopup !== this) return;
        activePopup = null;

        this.closeAnimation();
    }

    openAnimation() {
        const keyframes = [
            { transform: "translate(-50%, -50%) scale(0%)" },
            { transform: "translate(-50%, -50%) scale(100%)" }
        ];
        //this.container.hidden = false;
        this.container.style.display = "table";
        this.container.animate(keyframes, POPUP_ANIMATION_TIMING);
    }

    closeAnimation() {
        const keyframes = [
            { transform: "translate(-50%, -50%) scale(100%)" },
            { transform: "translate(-50%, -50%) scale(0%)" }
        ];
        this.container.animate(keyframes, POPUP_ANIMATION_TIMING);
        setTimeout(() => {
            this.container.style.display = "none";
        }, POPUP_ANIMATION_TIMING["duration"]);
    }
}