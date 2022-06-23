import { StoryRenderer } from "./scripts/StoryRenderer.js" 
import {readStoryData } from "./scripts/story.js"
import { listen } from "./scripts/dom_helpers.js"
import { 
    currentEditorForm,
    newChildForm
} from "./scripts/application_forms.js"
import {
    addChild,
    useEnterToSubmit,
    checkDuplicateNodes
} from "./scripts/application_actions.js"
import { DynamicElement } from "./scripts/dynamicElement.js"

//TODO for changing node titles, use recursive backpropogation 
//algorithm double link list graph aliasing over the ancestral nodes set

/*TEMP eventually add a setup form to initialize a new story, but current purpose is to edit labyrinth.*/
let labyrinth = readStoryData("labyrinth")
labyrinth.current = labyrinth.node("intro0")
let renderer = new StoryRenderer(labyrinth)
checkDuplicateNodes(labyrinth)
let empty = labyrinth.emptyNodes
let disconnected = labyrinth.disconnectedNodes
console.log(`empty:`)
console.log(empty)
console.log(`disconnected:`)
console.log(disconnected)


useEnterToSubmit()


newChildForm.onSubmit = () => { addChild(renderer, newChildForm) }
listen("add-child", "mouseup", () => { newChildForm.show() })

currentEditorForm.onSubmit = () => { renderer.setCurrentData(currentEditorForm) }