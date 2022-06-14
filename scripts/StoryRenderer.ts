
import {Story, StoryNode, StoryOption, readStoryData } from "./story.js"
import { Form } from "./form.js"; 
import { forEachInClass } from "./dom_helpers.js";

export class StoryRenderer {
    story: Story
    constructor (story: Story) {
        this.story = story
        this.render()
    }
    render() {
        this.setContentViewer()
        this.setChildViewer()
    }
    setCurrentData(currentEditorForm) {
        let { content } = currentEditorForm.read()
        this.story.currentNode.content = content
    }
    setContentViewer() {
        let contentViewer = document.getElementById("current-content-editor")
        let titleViewer = document.getElementById("current-title")
        let current = this.story.currentNode
        contentViewer.innerText = current.content
        titleViewer.innerText = this.story.title(current)
    }
    setChildViewer() {
        forEachInClass("child-bundle", (element)=>{
            element.remove()
        })
        let currentOptions = this.story.options(this.story.currentNode)
        currentOptions.forEach((option)=>{
            this.placeChildNode(option)
        })

    }
    /**
     * Using the user-provided data in the newChild form, adds an option to the currently selected node. 
     * If the destination node specified does not exist in the current story, makes a new empty node with the provided title.
     */
    linkNewChild(renderer, newChildForm) {
        let { optionText, destinationTitle } = newChildForm.read()
        let destinationNode;
        if (this.story.has(destinationTitle)) {
            destinationNode = this.story.node(destinationTitle)
            console.log("had node")
        } else {
            destinationNode = this.story.addNode(destinationTitle, new StoryNode())
            console.log("didnt")
        }
        let option = new StoryOption( optionText, destinationNode )
        renderer.placeChildNode(option)
    }
    placeChildNode(option: StoryOption): void {
        let viewer = <HTMLDivElement>document.getElementById("children")
        let title = this.story.title(option.destination) 
        let content = option.destination.content
        content = content.slice(0,50) + "..."
        let childNode = this.createChildNodeDOMNode(title, content, option.text)
        viewer.appendChild(childNode)
        document.getElementById(`child-${title}-content-preview`).innerText = content
        document.getElementById(`remove-child-${title}`).addEventListener('mouseup',(e)=>{
            this.removeChild(title, option)
        })
        let childOptionForm = new Form(`child-${title}-option-form`)
        childOptionForm.submitInput = `child-${title}-option-text`
        document.getElementById(`child-${title}-traversal`).addEventListener("click",()=>{
            this.traverseOption(option)
        })
    }
    createChildNodeDOMNode(title, content, optionText): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateChildNodeInnerHTML(title, content, optionText)
        return wrapper.firstChild
    }
    generateChildNodeInnerHTML(title: string, content: string, optionText: string): string {
        return `<div id="child-${title}-bundle" class="child-bundle">
                <form action="javascript:void(0);" id="child-${title}-option-form" class="option-form">
                <label for="child-${title}-option-text">Story option:</label>
                <input type="text" id="child-${title}-option-text" value="${optionText}">
            </form>
            <button id="child-${title}-traversal" class="story-node child-node">
                <h2 id="child-${title}-title">${title}</h2>
                <p id="child-${title}-content-preview"></p>
            </button>
            <button id="remove-child-${title}" class="remove-child">—</button>
        </div>`
    }
    removeChild(title, option) {
        let node = this.story.node(title)
        this.story.removeOption(node, option)
        document.getElementById(`child-${title}-bundle`).remove();
        this.updateStoryNodeLists()
    }
    updateStoryNodeLists() {

    }
    traverseOption(option) {
        this.story.traverse(option)
        this.render()
    }
}