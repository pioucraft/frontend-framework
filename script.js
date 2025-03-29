class dynamicVariable {
    constructor(name, value) {
        this.name = name;
        this.value = value;
        this.UUID = uuidv4();
        window.onload = () => {
            const variables = document.getElementsByTagName("var");
            Array.from(variables).forEach((variable) => {
                variable.outerHTML = `<span js="${variable.innerHTML}" class="${
                    this.UUID
                } var">${eval(variable.innerHTML)}</span>`;
            });

            this.updateIfs();
        };
    }

    set(newValue) {
        this.value = newValue;
        this.updateDisplay();
    }

    updateDisplay() {
        const displayElement = document.getElementsByClassName("var");
        if (displayElement.length > 0) {
            Array.from(displayElement).forEach((element) => {
                element.innerHTML = this.value;
            });
        } else {
            console.error(
                "Display elements not found for dynamic variable " + this.name
            );
        }
        this.updateIfs();
    }

    updateIfs() {
        const datas = document.querySelectorAll("data[type=if]");
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            this.updateIf(data);
        }
    }

    updateIf(elements) {
        const existingIfSpans = document.querySelectorAll(`.if-${this.UUID}`);
        existingIfSpans.forEach((span) => span.remove());

        for (let i = 0; i < elements.children.length; i++) {
            const element = elements.children[i];
            if (
                eval((element.attributes.condition ?? { value: "true" }).value)
            ) {
                elements.parentElement.insertAdjacentHTML(
                    "beforeend",
                    `<span class="if-${this.UUID}">${element.innerHTML}</span>`
                );
                break;
            }
        }
    }
}

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (
            +c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
        ).toString(16)
    );
}
