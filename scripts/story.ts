import { readlink } from "fs"
import { workerData } from "worker_threads"

const fs = require("fs")

export interface MusicEffectsObject {
    fadeIn: boolean,
    fadeInTime: number,
    fadeOut: boolean,
    fadeOutTime: number
    //etc etc tbd
}

export interface StoryNodeTraversalEffectsObject {
    image: boolean,
    imageURL: string,
    persistentImage: boolean,
    music: boolean,
    musicURL: string,
    musicEffects: MusicEffectsObject,
    scoreChanges: Array<[string, number]>
}

function unsetTraversalEffects() {
    return {
        image: false,
        imageURL: "",
        persistentImage: false,
        music: false,
        musicURL: "",
        musicEffects: { fadeIn: false, fadeInTime: 0, fadeOut: false, fadeOutTime: 0 },
        scoreChanges: []
    }
}

export class StoryNode {
    content: string
    hasTraversalEffects: boolean
    traversalEffects: StoryNodeTraversalEffectsObject
    constructor(content?: string, traversalEffects?: StoryNodeTraversalEffectsObject) {
        this.content = content ? content : ''
        traversalEffects = traversalEffects ?  traversalEffects : unsetTraversalEffects()
    }
}

export class StoryOption {
    disabled: boolean = false
    text: string = ''
    destination: StoryNode
    optionID: string
    isConditional: boolean
    conditions: {
        isVisitedNodesDependant: boolean,
        isScoreThresholdDependant: boolean
        nodeDependencies: Set<NodeDependencySet>
        scoreDependencies: Set<ScoreDependencySet>
    }
    constructor(text: string, destination: StoryNode, 
        isConditional?: boolean, 
        nodeDependencies?: Array<NodeDependencyData>, 
        scoreDependencies?: Array<ScoreDependencyData>) {
        this.text = text
        this.destination = destination
        this.isConditional = isConditional ? false : isConditional;
        if (this.isConditional) {
            if (nodeDependencies) {
                this.conditions.isVisitedNodesDependant = true;
                this.conditions.nodeDependencies = new Set();
                nodeDependencies.forEach((dependencySetData)=>{
                    this.conditions.nodeDependencies.add(new NodeDependencySet(dependencySetData))
                })
            }
            if (scoreDependencies) {
                this.conditions.isScoreThresholdDependant = true;
                this.conditions.scoreDependencies = new Set();
                scoreDependencies.forEach((dependencySetData)=>{
                    this.conditions.scoreDependencies.add(new ScoreDependencySet(dependencySetData))
                }) 
            }
        }
        this.optionID = "OPT-" + (Math.floor(Math.random() * 10) + Date.now())
    }
    computeDisabledValue(visitedNodes): boolean {
        //determine whether the given option should be "disabled" or not, considering the logic given by the user.
        if (this.isConditional) {
            if (this.conditions.isScoreThresholdDependant) {
                if (this.conditions.isVisitedNodesDependant) {
                    return this.fulfillsNodeDependencies(visitedNodes) && this.fulfillsScoreThresholds(visitedNodes);
                } else {
                    return this.fulfillsScoreThresholds(visitedNodes);
                }
            } else if (this.conditions.isVisitedNodesDependant) {
                return this.fulfillsNodeDependencies(visitedNodes);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    fulfillsNodeDependencies(visitedNodes: Set<StoryNode>): boolean {
        return this.isFulfilled("nodeDependencies", visitedNodes)
    }
    fulfillsScoreThresholds(visitedNodes: Set<StoryNode>): boolean {
        return this.isFulfilled("scoreDependencies", visitedNodes)
    }
    isFulfilled(dependencyType: string, visitedNodes: Set<StoryNode>): boolean {
        let fulfilled = true;
        fulfilled = this.conditions[dependencyType].forEach((dependencySet) => {
            return fulfilled && dependencySet.isFulfilled(visitedNodes);
        })
        return fulfilled
    }
}

type ScoreDependencyData = {
    scores: Array<string>,
    comparators: Array<"eq" | "gt" | "lt" | "geq" | "leq">
    values: Array<number>
    connectives: Array<"and" | "or">
}
interface PlayerScoresList {
    [scoreName: string]: number
}
class ScoreDependencySet {
    isFulfilled: (playerScores: PlayerScoresList) => boolean
    dependencyData: ScoreDependencyData
    constructor(dependencyData: ScoreDependencyData)  {
        this.dependencyData = dependencyData
        this.isFulfilled = this.generateFulfillmentChecker(dependencyData)
    }
    generateFulfillmentChecker(dependencyData: ScoreDependencyData): (list: PlayerScoresList)=> boolean {
        let { scores, comparators, values, connectives } = dependencyData
        let fulfillmentChecker = this.generateScoreComparator( scores[0], comparators[0], values[0] )
        for (let i=1; i < scores.length; i++) {
            let last = fulfillmentChecker;
            let connective = connectives[i];
            let next = this.generateScoreComparator( scores[i], comparators[i], values[i] )
            fulfillmentChecker = this.logicalConnect(last, connective, next)
        }
        return fulfillmentChecker;
    }
    generateScoreComparator(score, comparator, number) {
        switch (comparator) {
            case "eq": return (list: PlayerScoresList) => { return list[score] == number }
            case "gt": return (list: PlayerScoresList) => { return list[score] > number }
            case "lt": return (list: PlayerScoresList) => { return list[score] < number }
            case "geq": return (list: PlayerScoresList) => { return list[score] >= number }
            case "leq": return (list: PlayerScoresList) => { return list[score] <= number }
        }
    }
    /**
     * Creates a function representing the joining of two boolean-returning functions with a logical connective.
    */
    logicalConnect(last, connective, next) {
        switch (connective) {
            case "and": return (list: PlayerScoresList) => { return last(list) && next(list) }
            case "or": return (list: PlayerScoresList) => { return last(list) || next(list) }
        }
    }
}


type NodeDependencyData = {
    has: boolean,
    nodes: Array<string>,
    connectives: Array<"and" | "or">
}
class NodeDependencySet {
    isFulfilled: (visitedNodes: Set<string>) => boolean
    dependencyData: NodeDependencyData
    constructor(dependencyData: NodeDependencyData) {
        this.dependencyData = dependencyData
        this.isFulfilled = this.generateFulfillmentChecker(dependencyData)
    }
    /**
     * Generates a function to determine whether the StoryNode dependencies are fulfilled 
     * based on the player's array of previously visited node titles. This function is created dynamically depending
     * on what logic the writer has set in the node dependency data.
    */
    generateFulfillmentChecker(dependencyData: NodeDependencyData): (v: Set<string>) => boolean {
        let fulfillmentChecker = (v: Set<string>) => { return v.has(dependencyData.nodes[0]) }
        for (let i=1; i < dependencyData.nodes.length; i++) {
            let last = fulfillmentChecker;
            let next = (v: Set<string>) => { return v.has(dependencyData.nodes[i]) }
            let connective = dependencyData.connectives[i]
            fulfillmentChecker = this.logicalConnect(last, connective, next)
        }
        return (visited) => { return dependencyData.has && fulfillmentChecker(visited) }
    }
    /**
     * Creates a function representing the joining of two boolean-returning functions with a logical connective.
    */
    logicalConnect(last, connective, next) {
        switch (connective) {
            case "and": return (v: Set<string>) => { return last(v) && next(v) }
            case "or": return (v: Set<string>) => { return last(v) || next(v) }
        }
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
    removeNode(node: StoryNode) {
        if (this.has(node)) {
            let title = this.title(node)
            this.adjacencies(node).forEach((childNode)=>{
                this.ancestralAdjacencies(childNode).delete(node)
            })
            this.ancestralAdjacencies(node).forEach((parentNode)=>{
                this.adjacencies(parentNode).delete(node)
                this.options(parentNode).forEach((option: StoryOption, same, set)=>{
                    if (option.destination == node) {
                        set.delete(option)
                    }
                })
            })
        }
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
        this.ancestralAdjacencies(option.destination).add(node)
        this.options(node).add(option)
    }
    removeOption(node: StoryNode, option: StoryOption) {
        console.log(`removed ${this.title(option.destination)} from ${this.title(node)}`)
        this.adjacencies(node).delete(option.destination)
        this.ancestralAdjacencies(option.destination).delete(node)
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
        if (this.has(node)) {
            this.currentNode = node
        }
    }
    /**
     * Callback recieves (node, title, nodeMap)
    */
    forEachNode(callback, returnVariable?): any {
        return this.nodes.forEach(callback, returnVariable)
    }
    get emptyNodes() {
        let emptyNodes = []
        this.forEachNode((node: StoryNode)=>{
            if (node.content == '') {
                emptyNodes.push(this.title(node))
            }
        }, emptyNodes)
        return emptyNodes 
    }
    get disconnectedNodes() {
        let disconnectedNodes = []
        this.forEachNode((node: StoryNode)=>{
            if (this.adjacencies(node).size == 0) {
                if (this.ancestralAdjacencies(node).size == 0) {
                    disconnectedNodes.push(this.title(node))
                }
            }
        }, disconnectedNodes)
        return disconnectedNodes
    }
}

interface StoryNodeData {
    "content": string,
    "options": StoryOptionData[]
}
interface StoryOptionData {
    "text": string,
    "destination": string,
    "conditions"?: {
        storyNodeDependencies: NodeDependencyData[],
        scoreDependencies: ScoreDependencyData[]
    }
}

export function readStoryData(filename: string): Story {
    let story = new Story()
    let storyData = JSON.parse(fs.readFileSync("./data/" + filename + ".json"))
    let nodes = Object.keys(storyData)

    for (let i=0; i < nodes.length; i++) {
        createStoryNodeFromRead(story, storyData, nodes[i]) 
    }
    return story
}

function createStoryNodeFromRead(story, storyData, title: string): void {
    let currentNodeData = storyData[title]
    let { content, options }  = <StoryNodeData>currentNodeData
    let node = new StoryNode(content)

    story.addNode(title, node)
    for (let j = 0; j < options.length; j++) {
        let option = createOptionFromRead(story, options[j])
        story.addOption(node, option)
    }
}

function createOptionFromRead(story: Story, optionData: StoryOptionData): StoryOption {
    let {text, destination, conditions} = optionData;
    let destinationNode = story.node(destination)
    if (destinationNode == undefined) {
        destinationNode = new StoryNode()
        story.addNode(destination, destinationNode)
    }
    let isConditional = conditions ? false : true;
    return new StoryOption(text, destinationNode, isConditional, conditions.storyNodeDependencies, conditions.scoreDependencies)
}

export function writeStoryData(story: Story, sessionID: string) {
    let save = {}
    let backup = "./data/" + sessionID + ".json"
    let filename = "./data/" + sessionID.split('-')[0] + ".json"
    story.forEachNode((node: StoryNode, title: string)=>{
        save[title] = {
            "content": node.content,
            "options": []
        }
        story.options(node).forEach((option: StoryOption)=>{
            save[title].options.push({
                "text": option.text,
                "destination": story.title(option.destination)
            })
        })
    })
    fs.writeFileSync(backup, fs.readFileSync(filename))
    fs.writeFileSync(filename, JSON.stringify(save))
}

//document to make it clearer on what happens when a node doesn't exist in the story, but is referenced anyway. desired behaviour is that that node should be created empty with the given title under the assumption that is should exist if it's being called, and since it's at that title, it will be given content later. since Maps and Sets can only store unique entries, adding a node with the same name later will overwrite the empty one.