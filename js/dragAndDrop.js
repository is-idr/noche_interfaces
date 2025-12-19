const DD_SELECTORS = {
    DD_MAIN_CONTAINER: "#drag-and-drop", // Contenedor principal que contiene al resto de contenedores
    DD_CONTAINER: ".drag-container", // Contenedor que contiene los elementos a mover
    DD_ELEMENT: ".drag-element", // Elemento a mover. No es necesario pero aclara mucho el HTML
    DD_ELEMENT_BODY: ".drag-element-body", // Lugar en el que puedes agarrar el elemento
    DD_NON_DRAGGABLE_ELEMENT: ".non-draggable", // Clase que no permite agarrar al elemento
    DD_DRAGGED_ELEMENT: ".dragged-element", // Elemento que se está moviendo
    DD_CONTAINER_ON_DRAG: ".container-on-drag", // Estilo de todos los contenedores al agarrar un elemento
    DD_DRAGGED_ELEMENT_PLACEHOLDER: "dragged-element-placeholder" // Estilo de la silueta del elemento
}

const DD_EVENTS = {
    DRAG_ELEMENT_START: "drag-start", // Evento lanzado al agarrar un elemento
    DRAG_ELEMENT_STOP: "drag-stop" // Evento lanzado al soltar un elemento
}

// Número de iteraciones para buscar un elemento que no se pueda agarrar
const MAX_PARENT_NON_DRAG_ITERATIONS = 5;
const CONTAINER_HOVER_DARKNESS_PERCENT = 5; // 0-100%, cuánto se va a oscurecer el contenedor al pasar el ratón por encima

let dragAndDropElement, dragContainers;
let draggedElementOriginal = null;
let draggedElementCopy = null;
let hoveredContainer = null;
let onDropEvent;

window.addEventListener("DOMContentLoaded", () => {
    dragAndDropElement = document.getElementById(DD_SELECTORS["DD_MAIN_CONTAINER"].substring(1));
    dragContainers = document.querySelectorAll(DD_SELECTORS["DD_CONTAINER"]);
    dragElements = document.querySelectorAll(DD_SELECTORS["DD_ELEMENT_BODY"]);

    dragElements.forEach(dragElement => {
        dragElement.addEventListener("mousedown", (event) => startDrag(event, dragElement));
    });
});

window.addEventListener("mouseup", () => stopDrag());
window.addEventListener("mousemove", (event) => updateDrag(event));

function checkDrag(event) { // Check if either the element or its parents has "non-drag"
    const element = document.elementFromPoint(event.clientX, event.clientY);
    let currentElement = element;
    for (let i = 0; i < MAX_PARENT_NON_DRAG_ITERATIONS; i++) {
        if(currentElement === null) continue;
        if(currentElement.classList.contains(DD_SELECTORS["DD_NON_DRAGGABLE_ELEMENT"].substring(1))) return false;
        currentElement = currentElement.parentElement;
    }
    return true;
}

function startDrag(event, element) {
    if(!checkDrag(event)) return;

    draggedElementOriginal = element.parentElement;
    hoveredContainer = draggedElementOriginal.parentElement;

    dispatchCustomEvent(DD_EVENTS["DRAG_ELEMENT_START"], draggedElementOriginal);
    
    draggedElementCopy = draggedElementOriginal.cloneNode(true);
    draggedElementOriginal.classList.add(DD_SELECTORS["DD_DRAGGED_ELEMENT_PLACEHOLDER"]);
    draggedElementCopy.classList.add(DD_SELECTORS["DD_DRAGGED_ELEMENT"].substring(1));
    dragAndDropElement.append(draggedElementCopy);

    updateDraggedElementPosition(event);
    updateHoveredContainer(event);
    updateContainerVisuals(true);
}

function updateDrag(event) {
    if(!draggedElementCopy) return;
    updateHoveredContainer(event);
    updateDraggedElementPosition(event);
}

function stopDrag() {
    if(!draggedElementCopy) return;
    hoveredContainer.append(draggedElementOriginal);
    draggedElementOriginal.classList.remove(DD_SELECTORS["DD_DRAGGED_ELEMENT_PLACEHOLDER"]);
    draggedElementCopy.remove();
    dispatchCustomEvent(DD_EVENTS["DRAG_ELEMENT_STOP"], draggedElementOriginal);
    draggedElementOriginal = null;
    draggedElementCopy = null;
    updateContainerVisuals(false);
}


function updateDraggedElementPosition(event) {
    let x = event.clientX - draggedElementCopy.offsetWidth / 2;
    let y = event.clientY - draggedElementCopy.offsetHeight / 2 - 50;

    draggedElementCopy.style.left = `${x}px`;
    draggedElementCopy.style.top = `${y}px`;
}

function updateHoveredContainer(event) {
    let x = event.clientX;
    let y = event.clientY;

    dragContainers.forEach(container => {
        let containerX = container.getBoundingClientRect().left;
        let containerY = container.getBoundingClientRect().top;
        let withinX = (x >= containerX && x <= containerX + container.offsetWidth);
        let withinY = (y >= containerY && y <= containerY + container.offsetHeight);
        if(withinX && withinY) {
            hoveredContainer = container;
            container.style.filter = "brightness(" + (100 - CONTAINER_HOVER_DARKNESS_PERCENT).toString() + "%)";
        } else {
            container.style.filter = "brightness(100%)";
        }
    });
}

function updateContainerVisuals(dragging) {
    if(dragging) {
        dragContainers.forEach(container => {
            container.classList.add(DD_SELECTORS["DD_CONTAINER_ON_DRAG"].substring(1));
        });
    } else {
        dragContainers.forEach(container => {
            container.classList.remove(DD_SELECTORS["DD_CONTAINER_ON_DRAG"].substring(1));
            container.style.filter = "brightness(100%)";
        });
    }
}

function dispatchCustomEvent(name, draggedElement) {
    let event = new CustomEvent(name, {
        detail: {
            element: draggedElement,
            container: hoveredContainer
        }
    });
    document.dispatchEvent(event);
}
/*
document.addEventListener("dropevent", (event) => {
    console.log(event.detail);
});
*/