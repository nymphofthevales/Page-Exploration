import { StoryRenderer } from "./scripts/StoryRenderer.js" 
import {readStoryData } from "./scripts/story.js"
import { listen } from "./scripts/dom_helpers.js"
import { 
    currentEditorForm,
    newChildForm,
    currentSelectForm,
    removeCurrentForm
} from "./scripts/application_forms.js"
import {
    addChild,
    useEnterToSubmit,
    shiftCurrent,
    removeCurrent
} from "./scripts/application_actions.js"
import { DynamicElement } from "./scripts/dynamicElement.js"

//TODO for changing node titles, use recursive backpropogation 
//algorithm double link list graph aliasing over the ancestral nodes set

/*TEMP eventually add a setup form to initialize a new story, but current purpose is to edit labyrinth.*/
let labyrinth = readStoryData("labyrinth")
labyrinth.current = labyrinth.node("intro")
let renderer = new StoryRenderer(labyrinth)

useEnterToSubmit()

newChildForm.onSubmit = () => { addChild(renderer, newChildForm) }
listen("add-child", "mouseup", () => { newChildForm.show() })

currentEditorForm.onSubmit = () => { renderer.setCurrentData(currentEditorForm) }
currentSelectForm.onSubmit = () => { shiftCurrent(renderer, currentSelectForm) }

removeCurrentForm.onSubmit = () => { removeCurrent(renderer, removeCurrentForm) }
listen("remove-current", "mouseup", () => { removeCurrentForm.show() })
