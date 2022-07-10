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
    fadeOut(ms: number) {
        setTimeout(()=>{
            this.hide()
            this.reference.style.animation = ``
        }, ms)
        this.reference.style.animation = `dynamicElementFadeOut ${ms/1000}s`
    }
    fadeIn(ms: number) {
        setTimeout(()=>{
            this.show()
            this.reference.style.animation = ``
        }, ms)
        this.reference.style.animation = `dynamicElementFadeIn ${ms/1000}s`
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