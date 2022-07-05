
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
        this.setAncestorViewer()
        this.updateStoryNodeLists()
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
    setAncestorViewer() {
        forEachInClass("ancestor-node", (element)=>{
            element.remove()
        })
        let currentAncestors = this.story.ancestralAdjacencies(this.story.currentNode)
        console.log(currentAncestors)
        console.log(this.story.ancestralAdjacencyMap)
        console.log(this.story.adjacencyMap)
        console.log(this.story.titles)
        currentAncestors.forEach((storyNode)=>{
            this.placeAncestorNode(storyNode)
        })
    }
    setChildViewer() {
        forEachInClass("child-bundle", (element)=>{
            element.remove()
        })
        let currentOptions = this.story.options(this.story.currentNode)
        console.log(currentOptions)
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
        this.story.addOption(this.story.currentNode, option)
        renderer.placeChildNode(option)
    }
    placeChildNode(option: StoryOption): void {
        let viewer = <HTMLDivElement>document.getElementById("children")
        let title = this.story.title(option.destination) 
        let content = option.destination.content
        content = content.slice(0,50) + "..."
        let childNode = this.createChildNodeDOMNode(title, option.text)
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
    createChildNodeDOMNode(title, optionText): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateChildNodeInnerHTML(title, optionText)
        return wrapper.firstChild
    }
    generateChildNodeInnerHTML(title: string, optionText: string): string {
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
    placeAncestorNode(ancestor: StoryNode) {
        let viewer = <HTMLDivElement>document.getElementById("ancestors")
        let title = this.story.title(ancestor)
        let content = ancestor.content
        content = content.slice(0,50) + "..."
        let ancestorNode = this.createAncestorDOMNode(title)
        viewer.appendChild(ancestorNode)
        document.getElementById(`parent-${title}-content-preview`).innerText = content
        document.getElementById(`parent-${title}`).addEventListener("click",()=>{
            this.traverseTo(ancestor)
        })
    }
    createAncestorDOMNode(title: string): Node {
        let wrapper = document.createElement("div")
        wrapper.innerHTML = this.generateAncestorNodeInnerHTML(title)
        return wrapper.firstElementChild
    }
    generateAncestorNodeInnerHTML(title: string): string {
        return `
        <button id="parent-${title}" class="story-node ancestor-node">
            <h2 id="parent-${title}-title">${title}</h2>
            <p id="parent-${title}-content-preview"></p>
        </button>
        `
    }
    updateStoryNodeLists() {
        //TEMP iterating through all nodes every time may cause performance issues.
        let nodeTitles = this.generateNodeTitlesList()
        let longestSize = getLastElement(nodeTitles)?.length
        nodeTitles.sort()
        forEachInClass("story-node-selector", (element)=>{
            element.innerHTML = ''
            this.appendNodeTitleList(element, nodeTitles, longestSize)
        })
    }
    appendNodeTitleList(select, nodeTitles, longestSize) {
        for (let i=0; i < nodeTitles.length; i++) {
            let title = nodeTitles[i]
            let opt = document.createElement("option")
            select.appendChild(opt).id=`story-node-selector-${select.id}-${title}`
            let optionReference = <HTMLOptionElement>document.getElementById(`story-node-selector-${select.id}-${title}`)
            optionReference.value = title;
            let previewText = this.generateNodeSelectPreviewText(title, longestSize)
            optionReference.innerText = `${title}: ${previewText}` 
        }
    }
    generateNodeTitlesList() {
        let nodeTitles = []
        this.story.forEachNode((node, title, )=>{
            let lastElement = nodeTitles[nodeTitles.length - 1]
            if (lastElement != undefined) {
                if (title.length >= lastElement.length) {
                    nodeTitles.push(title)
                } else {
                    nodeTitles.unshift(title)
                }
            } else {
                nodeTitles.push(title)
            }
        }, nodeTitles)
        return nodeTitles
    }
    generateNodeSelectPreviewText(title, longestTitleLength) {
        let defaultLength = 5
        let previewLength;
        if (longestTitleLength < 30) {
            previewLength = (30 - title.length) + defaultLength
        } else {
            previewLength = (longestTitleLength - title.length) + defaultLength
        }
        let previewText = this.story.node(title).content.slice(0,previewLength)
        return previewText
    }
    traverseOption(option) {
        this.story.traverse(option)
        this.render()
    }
    traverseTo(node: StoryNode) {
        this.story.currentNode = node
        this.render()
    }
}

function getLastElement(a: Array<any>): any {
    return a[a.length - 1]
}