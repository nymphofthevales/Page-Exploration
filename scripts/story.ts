
const fs = require("fs")

export class StoryNode {
    content: string
    constructor(content?: string) {
        this.content = content? content : ''
    }
}

export class StoryOption {
    disabled: boolean = false
    text: string = ''
    destination: StoryNode
    constructor(text: string, destination: StoryNode) {
        this.text = text
        this.destination = destination
    }
}

export class Story {
    nodes: Map<string, StoryNode> = new Map();
    titles: Map<StoryNode, string> = new Map();

    ancestralEdgeMap: Map<StoryNode, Set<StoryNode>> = new Map();
    ancestralAdjacencyMap: Map<StoryNode, Set<StoryNode>> = new Map();

    adjacencyMap: Map<StoryNode, Set<StoryNode>> = new Map();
    edgeMap: Map<StoryNode, Set<StoryOption>> = new Map();

    currentNode: StoryNode
    constructor () {
        this.addNode('root', new StoryNode())
        this.currentNode = this.nodes.get('root') as StoryNode
    }
    /**
     * Checks whether the specified node or node title exists in the story.
    */
    has(node: StoryNode | string): boolean {
        if (node instanceof StoryNode) {
            return this.adjacencyMap.get(node) != undefined
        } else {
            return this.nodes.get(node) != undefined
        }
        
    }
    node(nodeTitle: string): StoryNode {
        return this.nodes.get(nodeTitle);
    }
    title(node: StoryNode): string {
        return this.titles.get(node);
    }
    adjacencies(node: StoryNode): Set<StoryNode> {
        return this.adjacencyMap.get(node);
    }
    ancestralAdjacencies(node: StoryNode): Set<StoryNode> {
        return this.ancestralAdjacencyMap.get(node);
    }
    options(node: StoryNode): Set<StoryOption> {
        return this.edgeMap.get(node);
    }
    addNode(title: string, node: StoryNode, options?: Set<StoryOption>): StoryNode {
        if (!this.has(title)) {
            this.nodes.set(title, node)
            this.titles.set(node, title)
            this.adjacencyMap.set(node, new Set())
            this.ancestralAdjacencyMap.set(node, new Set())
        } else if (this.has(title)) {
            this.node(title).content = node.content
        }
        if (options) {
            this.setupOptions(node, options)
        } else {
            this.edgeMap.set(node, new Set())
        }
        return this.node(title)
    }
    setupOptions(node: StoryNode, options: Set<StoryOption>) {
        this.edgeMap.set(node, options)
        options.forEach((option)=>{ 
            this.adjacencies(node).add(option.destination)
            this.ancestralAdjacencies(option.destination).add(node)
        })
    }
    link(origin: StoryNode, destination: StoryNode): void {
        this.adjacencies(origin).add(destination)
        this.options(origin).add(new StoryOption('',destination))
    }
    addOption(node: StoryNode, option: StoryOption) {
        this.adjacencies(node).add(option.destination)
        this.options(node).add(option)
    }
    removeOption(node: StoryNode, option: StoryOption) {
        this.adjacencies(node).delete(option.destination)
        this.options(node).delete(option)
    }
    traverse(option: StoryOption): StoryNode {
        let optionMap = this.options(this.currentNode)
        if (optionMap.has(option)) {
            this.currentNode = option.destination
        }
        return this.currentNode
    }
    set current (node: StoryNode) {
        if (this.adjacencyMap.has(node)) {
            this.currentNode = node
        }
    }
}

interface NodeData {
    "content": string,
    "options": StoryNodeOption[]
}
interface StoryNodeOption {
    "text": string,
    "destination": string
}

export function readStoryData(filename: string): Story {
    let story = new Story()
    let data = JSON.parse(fs.readFileSync("./data/" + filename + ".json"))
    let nodes = Object.keys(data)
    console.log(nodes.length)
    for (let i=0; i < nodes.length; i++) {
        let title = nodes[i]
        let currentNodeData = data[title]
        let {content, options}  = <NodeData>currentNodeData
        let currentNode = new StoryNode(content)
        currentNode = story.addNode(title, currentNode)
        for (let j = 0; j < options.length; j++) {
            let { text, destination } = options[j]
            let destinationNode = story.node(destination)
            if (destinationNode == undefined) {
                destinationNode = new StoryNode()
                story.addNode(destination, destinationNode)
            }
            let option = new StoryOption(text, destinationNode)
            story.addOption(currentNode, option)
        }
    }
    return story
}

//document to make it clearer on what happens when a node doesn't exist in the story, but is referenced anyway. desired behaviour is that that node should be created empty with the given title under the assumption that is should exist if it's being called, and since it's at that title, it will be given content later. since Maps and Sets can only store unique entries, adding a node with the same name later will overwrite the empty one.