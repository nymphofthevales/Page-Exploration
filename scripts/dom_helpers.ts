

export function forEachInClass(targetClass: string, callback: Function): void {
    let elements = document.getElementsByClassName(targetClass)
    for (let i=0; i < elements.length; i++) {
        callback(elements[i])
    }
}

export function removeClassFromAllMembers(targetClass: string, className: string): void {
    forEachInClass(targetClass, (elem:HTMLElement)=>{
        elem.classList.remove(className)
    })
}

export function addClassToAllMembers(targetClass: string, className: string): void {
    forEachInClass(targetClass, (elem:HTMLElement)=>{
        elem.classList.add(className)
    })
}

/**
 * Provides compressed syntax for document.getElementById("elementID").addEventListener(event, action).
*/
export function listen(elementID: string, event: keyof HTMLElementEventMap, action: ()=>any) {
    document.getElementById(elementID).addEventListener(event, action)
}