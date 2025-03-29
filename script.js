var loopsVariables = {};

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

        this.updateLoops();
        this.updateIfs();
        this.updateJS();
    }

    resetIfs() {
        const elements = document.querySelectorAll(
            `js-element[update~="${this.name}"][type="if"]:not([hidden]), js-element[update~="${this.name}"][type="elif"]:not([hidden]), js-element[update~="${this.name}"][type="else"]:not([hidden])`
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
            try {
                const condition = element.attributes.js.value;
                if (eval(condition)) {
                    element.hidden = false;
                } else {
                    element.hidden = true;
                    this.updateIfs(element);
                }
            } catch (error) {}
        });
    }

    updateJS() {
        const elements = Array.from(
            document.querySelectorAll(
                `js-element[update~="${this.name}"]:not([type]):not([hidden]), js-element[update~="${this.name}"][type="js"]:not([hidden])`
            )
        ).filter((element) => {
            let parent = element.parentElement;
            while (parent) {
                const style = window.getComputedStyle(parent);
                if (style.display === "none" || style.visibility === "hidden") {
                    return false; // Exclude elements with hidden parents
                }
                parent = parent.parentElement;
            }
            return true; // Include elements with no hidden parents
        });
        Array.from(elements).forEach((element) => {
            element.innerHTML = eval(element.attributes.js.value);

            // if (
            //     (element.attributes.html ?? { value: "false" }).value == "true"
            // ) {
            //     element.innerHTML = eval(element.attributes.js.value);
            // } else
            //     element.innerHTML = DOMPurify.sanitize(
            //         eval(element.attributes.js.value)
            //     );
        });
    }

    updateLoops() {
        let elements = document.querySelectorAll(
            `js-element[update~="${this.name}"][type="each"]`
        );
        let updated = 0;
        while (updated < elements.length) {
            const element = elements[updated];

            try {
                let uuid = uuidV4();
                element.setAttribute("uuid", uuid);

                while (element.children.length > 1) {
                    element.removeChild(element.lastChild);
                }

                const loopList = eval(element.attributes.js.value);
                loopsVariables[uuid] = loopList;

                const loopElement = element.firstElementChild;
                if (loopElement) {
                    for (let i = 0; i < loopList.length; i++) {
                        const clonedElement = loopElement.cloneNode(true);
                        clonedElement.hidden = false;
                        element.appendChild(clonedElement);

                        const lastElement = element.lastElementChild;
                        const allDescendants =
                            lastElement.querySelectorAll("*");
                        for (let k = 0; k < allDescendants.length; k++) {
                            const descendant = allDescendants[k];
                            if (descendant.attributes.js) {
                                const jsValue = descendant.attributes.js.value;
                                descendant.setAttribute(
                                    "js",
                                    `(function() { const ${element.attributes.element.value} = loopsVariables['${uuid}'][${i}]; return ${jsValue}})()`
                                );
                            }
                        }
                    }
                } else {
                    console.warn(
                        "No child element found to clone in:",
                        element
                    );
                }
            } catch (error) {}
            elements = document.querySelectorAll(
                `js-element[update~="${this.name}"][type="each"]`
            );
            updated++;
        }
        Object.keys(loopsVariables).forEach((uuid) => {
            if (!document.querySelector(`[uuid="${uuid}"]`)) {
                delete loopsVariables[uuid];
            }
        });
    }
}

function uuidV4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

class jsElement extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ["js", "update", "type", "uuid", "element", "html"];
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

    const eachElements = document.querySelectorAll("js-element[type='each']");
    eachElements.forEach((element) => {
        let span = document.createElement("span");
        while (element.firstChild) {
            span.appendChild(element.firstChild);
        }
        span.hidden = true;
        element.appendChild(span);
    });
};
