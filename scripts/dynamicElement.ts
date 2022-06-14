export class DynamicElement {
    reference: HTMLElement
    constructor(element: HTMLElement | string) {
        if (typeof element == "string") {
            this.reference = document.getElementById(element)
        } else {
            this.reference = element
        }
    }
    hide() {
        this.reference.classList.add('hidden')
    }
    show() {
        console.log(this.reference.classList)
        this.reference.classList.remove("hidden")
        console.log(this.reference.classList)
    }
    clear() {
        this.reference.innerHTML = ""
    }
    blur() {
        this.reference.blur()
    }
    /**
     * Sets the background of an element. Automatically includes css url() wrapper.
    */
    set background(imageUrl: string) {
        this.reference.style.backgroundImage = `url(\'${imageUrl}\')`
    }
}