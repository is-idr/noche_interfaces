const CALENDAR_SELECTORS = {
    CALENDAR: "#custom-calendar"
};

const CALENDAR_CLASSES = {
    CONTAINER: "calendar-container",
    HEADER: "calendar-header",
    CURRENT_DATE: "calendar-current-date",
    NAVIGATION: "calendar-navigation",
    PREVIOUS_MONTH: "calendar-previous-month",
    NEXT_MONTH: "calendar-next-month",
    WEEKDAYS_CONTAINER: "calendar-weekdays",
    WEEKDAY: "calendar-weekday",
    BODY: "calendar-body",
    DATES_CONTAINER: "calendar-dates",
    DATE: "calendar-date",
    CURRENT_DATE: "calendar-current-date",
    DATE_NUMBER: "calendar-date-number",
    DATE_AVAILABLE: "calendar-date-available",
    DATE_OTHER_MONTH: "calendar-date-other-month",
    DATE_SELECTED: "calendar-date-selected",
    DATE_WEEKEND: "calendar-date-weekend",
    DATE_HIGHLIGHTED: "calendar-date-highlighted"
};

const CALENDAR_EVENTS = {
    DATE_CHANGE: "calendar-date-change"
};

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = [
    "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
];

const ARROW_ICON_SRC = "../SVG/arrow_down.svg";
const HEADER_CURRENT_MONTH_TEXT = "{MONTH} {YEAR}"; // Noviembre 2025

let actualCurrentDate;
let currentDate, selectedDate, selectedMonth, selectedYear;
let calendarElement, calendarElementContent, selectedElement;

let periodicity = 1;

window.addEventListener("DOMContentLoaded", () => {
    currentDate = new Date();
    actualCurrentDate = currentDate;

    // Managing elements
    calendarElement = document.querySelector(CALENDAR_SELECTORS["CALENDAR"]);
    calendarElement.classList.add(CALENDAR_CLASSES["CONTAINER"]);
    calendarElementContent = Array.from(calendarElement.children);

    generateElements();
    updateElements();
});

function createChild(parent, name, classes, attributes={}) {
    const element = createCustomElement(name, classes, attributes);
    parent.append(element);
    return element;
}
function createCustomElement(name, classes, attributes={}) {
    const element = document.createElement(name);
    classes.split(" ").forEach(customClass => element.classList.add(customClass));
    Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
    return element;
}

function generateElements() {
    // First level elements
    const header = createChild(calendarElement, "div", CALENDAR_CLASSES["HEADER"]);
    const body = createChild(calendarElement, "div", CALENDAR_CLASSES["BODY"]);

    // Second level elements
    const headerCurrentDate = createChild(header, "div", CALENDAR_CLASSES["CURRENT_DATE"]);
    const headerNavigation = createChild(header, "div", CALENDAR_CLASSES["NAVIGATION"]);

    const calendarWeekdays = createChild(body, "div", CALENDAR_CLASSES["WEEKDAYS_CONTAINER"]);
    const calendarDates = createChild(body, "div", CALENDAR_CLASSES["DATES_CONTAINER"]);
    calendarElementContent.forEach(element => calendarElement.append(element));
    
    // Third level elements
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    if(prevMonthDate - actualCurrentDate > 0) {
        const prevMonth = createChild(headerNavigation, "img", CALENDAR_CLASSES["PREVIOUS_MONTH"], {src: ARROW_ICON_SRC, alt: "Anterior"});
        prevMonth.addEventListener("click", () => updateCurrentMonth(-1));
        prevMonth.setAttribute("draggable", false);
    }

    const nextMonth = createChild(headerNavigation, "img", CALENDAR_CLASSES["NEXT_MONTH"], {src: ARROW_ICON_SRC, alt: "Siguiente"});
    WEEKDAYS.forEach(weekday => createChild(calendarWeekdays, "span", CALENDAR_CLASSES["WEEKDAY"]).innerHTML = weekday);

    nextMonth.setAttribute("draggable", false);
    nextMonth.addEventListener("click", () => updateCurrentMonth(1));
}

function updateElements() {
    let currentMonthText = HEADER_CURRENT_MONTH_TEXT;
    currentMonthText = currentMonthText.replace("{MONTH}", MONTHS[currentDate.getMonth()]);
    currentMonthText = currentMonthText.replace("{YEAR}", currentDate.getFullYear());

    const headerCurrentDate = calendarElement.querySelector("." + CALENDAR_CLASSES["CURRENT_DATE"]);
    headerCurrentDate.innerHTML = currentMonthText;

    const calendarDates = calendarElement.querySelector("." + CALENDAR_CLASSES["DATES_CONTAINER"]);
    const newCalendarDates = calendarDates.cloneNode();
    calendarDates.parentElement.append(newCalendarDates);
    calendarDates.remove();
    generateDays(newCalendarDates);
    highlightPeriodicDates(newCalendarDates);
}

function generateDays(parentElement) {

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const lastDateLastMonth = new Date(currentYear, currentMonth, 0).getDate();
    const lastDateThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayLastMonth = new Date(currentYear, currentMonth, 0).getDay();
    const lastDayThisMonth = new Date(currentYear, currentMonth + 1, 0).getDay();
    
    if(!selectedDate) {
        selectedDate = currentDate.getDate();
        selectedMonth = currentMonth;
        selectedYear = currentYear;
    }

    // Last month's last dates
    generateDates(parentElement, {
        from: lastDateLastMonth - lastDayLastMonth + 1,
        to: lastDateLastMonth,
        month: (currentMonth <= 0) ? 11 : currentMonth - 1, // month - 1
        year: (currentMonth <= 0) ? currentYear - 1 : currentYear // year - 1
    }, CALENDAR_CLASSES["DATE_OTHER_MONTH"]);

    // This month's dates
    generateDates(parentElement, {
        from: 1,
        to: lastDateThisMonth,
        checkWeekend: true,
        month: currentMonth,
        year: currentYear
    });

    // The next month's first dates
    generateDates(parentElement, {
        from: 1,
        to: lastDayThisMonth > 0 ? 7 - lastDayThisMonth : 0,
        month: (currentMonth >= 11) ? 0 : currentMonth + 1, // month + 1
        year: (currentMonth >= 11) ? currentYear + 1 : currentYear // year + 1
    }, CALENDAR_CLASSES["DATE_OTHER_MONTH"]);
}

function generateDates(parentElement, dateData, customClasses="") {
    for(let i = dateData.from; i <= dateData.to; i++) {
        let current = i;
        const customClass = CALENDAR_CLASSES["DATE"] + (customClasses ? " " + customClasses : "");
        const dateElement = createChild(parentElement, "div", customClass);
        const dateElementSpan = createChild(dateElement, "span", CALENDAR_CLASSES["DATE_NUMBER"]);
        dateElementSpan.innerHTML = current;

        if(dateData.year === selectedYear && dateData.month === selectedMonth && current === selectedDate) {
            if(selectedElement) selectedElement.classList.remove(CALENDAR_CLASSES["DATE_SELECTED"]);
            dateElement.classList.add(CALENDAR_CLASSES["DATE_SELECTED"]);
            selectedElement = dateElement;
        }

        const thisDay = new Date(dateData.year, dateData.month, current + 1);
        const isPastDay = (actualCurrentDate - thisDay >= 0);
        if(!isPastDay) {
            dateElement.classList.add(CALENDAR_CLASSES["DATE_AVAILABLE"]);
            
            dateElement.addEventListener("click", () => {
                selectedDate = current;
                selectedMonth = dateData.month;
                selectedYear = dateData.year;
                currentDate = new Date(selectedYear, selectedMonth, selectedDate);

                updateElements();
                dispatchDateUpdateEvent();
            });
        } else {
            dateElement.classList.remove(CALENDAR_CLASSES["DATE_OTHER_MONTH"]);
        }

        if(!isPastDay && dateData["checkWeekend"] && selectedElement !== dateElement) {
            const firstDayThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() - 1;
            const currentDayOfWeek = (firstDayThisMonth + i - 1) % 7;
            if(currentDayOfWeek >= 5) dateElement.classList.add(CALENDAR_CLASSES["DATE_WEEKEND"]);
        }
    }
}

function updateCurrentMonth(offset) {
    Array.from(calendarElement.children).forEach(child => child.remove());
    const newMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    currentDate = newMonthDate;
    generateElements();
    updateElements();
}

function dispatchDateUpdateEvent() {
    document.dispatchEvent(new CustomEvent(CALENDAR_EVENTS["DATE_CHANGE"], {
        detail: {
            date: selectedDate,
            month: selectedMonth + 1,
            year: selectedYear
        }
    }))
}

function highlightPeriodicDates(parentElement) {
    let currentElement, index = 0;
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if(currentMonth === selectedMonth && currentYear === selectedYear) {
        currentElement = selectedElement.nextSibling;
    } else if(currentMonth <= selectedMonth && currentYear === selectedYear || currentYear < selectedYear) {
        currentElement = selectedElement.nextSibling;
    } else {
        //index = -1; // We offset the days by 1
        const offset = calculateFirstDateHighlight();
        currentElement = parentElement.children[offset % periodicity];
        currentElement.classList.add(CALENDAR_CLASSES["DATE_HIGHLIGHTED"]);
        currentElement = currentElement.nextSibling;
    }

    //if(currentElement) currentElement.style.border = "lime 2px dashed"; // Reference date

    while(currentElement) {
        index++;
        if(Array.from(currentElement.classList).includes(CALENDAR_CLASSES["DATE_AVAILABLE"])) {
            if(index % periodicity === 0) {
                currentElement.classList.add(CALENDAR_CLASSES["DATE_HIGHLIGHTED"]);
            }
        }
        currentElement = currentElement.nextSibling;
    }
}

function calculateFirstDateHighlight() {
    const firstDateThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // We shift the dates by 1 so the Sun-Sat format matches the Mon-Sun format
    const numLastDaysLastMonth = firstDateThisMonth.getDay() <= 0 ? 6 : firstDateThisMonth.getDay() - 1;
    const selectedDateObj = new Date(selectedYear, selectedMonth, selectedDate);
    
    const firstDateThisMonthUTC = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const selectedDateObjUTC = Date.UTC(selectedYear, selectedMonth, selectedDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDifference = Math.floor((firstDateThisMonthUTC - selectedDateObjUTC) / msPerDay);

    let offset = (periodicity - (daysDifference % periodicity)) % periodicity;
    offset = offset + numLastDaysLastMonth;
    return offset;
}

function setCalendarPeriodicity(number) {
    periodicity = number;
    updateElements();
}