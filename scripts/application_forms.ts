
import { Form } from "./form.js"; 

export const currentEditorForm = new Form("current-editor-form")
currentEditorForm.addInput('content','current-content-editor')
currentEditorForm.submitInput = "current-content-editor"

export const newChildForm = new Form("add-child-menu")
newChildForm.addInput('optionText','add-child-option-text')
newChildForm.addInput('destinationTitle','add-child-node-select')
newChildForm.submitInput = "add-child-node-select"

export const removeCurrentForm = new Form("remove-current-form")
removeCurrentForm.submitInput = "remove-current-confirm"
removeCurrentForm.closeInput = "remove-current-cancel"

export const currentSelectForm = new Form("current-select-form")
currentSelectForm.addInput("selection","current-node-select")
currentSelectForm.submitInput = "current-node-select"