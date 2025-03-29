class dynamicVariable {
    constructor(name, value) {
        this.name = name;
        this.value = value;

        setTimeout(() => {
            this.updateDisplay();
        }, 0);
    }

    set(value) {
        this.value = value;

        this.updateDisplay();
    }

    updateDisplay() {
        this.resetIfs();

        this.updateIfs();
        this.updateJS();
    }

    resetIfs() {
        const elements = document.querySelectorAll(
            `js-element[update~="${this.name}"][type="if"], js-element[update~="${this.name}"][type="elif"], js-element[update~="${this.name}"][type="else"]`
        );
        Array.from(elements).forEach((element) => {
            element.hidden = true;
        });
    }

    updateIfs(from) {
        if (from) {
            const nextElement = from.nextElementSibling;
            if (nextElement && nextElement.attributes.type) {
                const type = nextElement.attributes.type.value;
                if (type === "elif") {
                    const condition = nextElement.attributes.js.value;
                    if (eval(condition)) {
                        nextElement.hidden = false;
                    } else {
                        nextElement.hidden = true;
                        this.updateIfs(nextElement);
                    }
                } else if (type === "else") {
                    nextElement.hidden = false;
                }
            }
            return;
        }

        const elements = document.querySelectorAll(
            `js-element[update~="${this.name}"][type="if"]`
        );
        Array.from(elements).forEach((element) => {
            const condition = element.attributes.js.value;
            if (eval(condition)) {
                element.hidden = false;
            } else {
                element.hidden = true;
                this.updateIfs(element);
            }
        });
    }

    updateJS() {
        const elements = document.querySelectorAll(
            `js-element[update~="${this.name}"]:not([type]), js-element[update~="${this.name}"][type="js"]`
        );
        Array.from(elements).forEach((element) => {
            element.innerHTML = eval(element.attributes.js.value);
        });
    }
}

class jsElement extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ["js", "update", "type"];
    }
}

customElements.define("js-element", jsElement);

window.onload = function () {
    const typeElements = document.querySelectorAll(
        "js-element[type='if'], js-element[type='elif'], js-element[type='else']"
    );
    typeElements.forEach((element) => {
        element.hidden = true;
    });

    // Call updateDisplay for all dynamicVariable instances
    if (window.dynamicVariables) {
        window.dynamicVariables.forEach((variable) => variable.updateDisplay());
    }
};
