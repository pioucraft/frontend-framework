class dynamicVariable {
    constructor(name, value) {
        this.name = name;
        this.value = value;
        this.UUID = uuidv4();

        const variables = document.getElementsByTagName("var");
        for (let i = 0; i < variables.length; i++) {
            if (variables[i].innerHTML === `${this.name}`) {
                variables[
                    i
                ].outerHTML = `<span class="${this.UUID}">${this.value}</span>`;
            }
        }
    }

    set(newValue) {
        this.value = newValue;
        this.updateDisplay();
    }

    updateDisplay() {
        const displayElement = document.getElementsByClassName(this.UUID);
        if (displayElement.length > 0) {
            Array.from(displayElement).forEach((element) => {
                element.innerHTML = this.value;
            });
        } else {
            console.error(
                "Display elements not found for dynamic variable " + this.name
            );
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
