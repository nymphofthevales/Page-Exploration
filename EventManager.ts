

export class LocalEventManager {
    events: { [event: string]: LocalEvent}
    constructor() {
        this.events = {}
    }
    addEvent(event: string, eventOpts: { [key:string]:any }) {
        this.events[event] = new LocalEvent(eventOpts)
    }
    onEvent(eventName: string, callback: Function) {
        let event = this.events[eventName]
        if (!event) {
            this.events[eventName] = new LocalEvent()
        }
        event.addListener(callback)
    }
    emit(event: string) {
        this.events[event]?.emit()
    }
    get(event: string): LocalEvent | undefined {
        return this.events[event]
    }
}

interface ObjectOfAny { [key:string]:any }

export class LocalEvent {
    options: ObjectOfAny
    listeners: Array<Function>
    constructor(options?: ObjectOfAny) {
        this.options = options? options : {}
        this.listeners = []
    }
    emit() {
        this.listeners.forEach((listener, index)=>{
            listener(this.options)
        })
    }
    addListener(callback: Function) {
        if (!this.listeners.includes(callback)) {
            this.listeners.push(callback)
        }
    }
    setOption(key: string, value: any): void {
        this.options[key] = value;
    }
}