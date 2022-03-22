
//import { DiGraph, GraphNode } from "./Graph"

/**
 * A collection of all the pages in a story.
*/
class StoryManager extends DiGraph {
    nodes: Map<string, Sequence | StoryNode> = new Map()
    constructor () {
        super()
    }
    newSequence(opts: SequenceOptions) {
        this.add(new Sequence(opts, this))
    }
    newStoryNode(opts: StoryNodeOptions) {
        this.add(new StoryNode(opts, this))
    }
}

/**
 * Holds text and options for a page in a branching story.
*/
class PageBranch extends GraphNode {
    connections: Array<PageBranch> = []
    leaves: Array<Leaf> = []
    story: StoryManager
    constructor (title: string, story: StoryManager) {
        super(title)
        this.story = story
    }
}

/**
 * A single text-option set.
*/
class Leaf {
    passage: string
    choices: Array<string>
    constructor(passage: string, choices: Array<string>) {
        this.passage = passage
        this.choices = choices
    }
}


interface SequenceOptions {
    title: string,
    passages: Array<string>,
    defaultChoice: string
}
/**
 * A series of ordered passages of text, each only being connected to the next without branching.
*/
class Sequence extends PageBranch {
    constructor (opts: SequenceOptions, story: StoryManager) {
        let {title, passages, defaultChoice} = opts
        super(title, story)
        this.addBatchPage(passages, defaultChoice)
    }
    get length() {
        return this.leaves.length
    }
    addPage(passage: string, choice: string) {
        this.leaves.push(new Leaf(passage, [choice]))
    }
    addBatchPage(passages: Array<string>, defaultChoice: string) {
        for (let i=0; i < passages.length; i++) {
            this.leaves.push(new Leaf(passages[i], [defaultChoice]))
        }
    }
    link(branch: PageBranch) {
        this.connections = [branch]
    }
}

type NodeTitle = string

interface StoryNodeOptions {
    title: NodeTitle,
    passage: string,
    choices: Array<[string, NodeTitle]>
}

/**
 * A single page with multiple options; which connects to multiple branches.
*/
class StoryNode extends PageBranch {
    leaf: Leaf
    constructor (opts: StoryNodeOptions, story: StoryManager) {
        let {title, passage, choices} = opts
        super(title, story)
        this.story = story
        this.leaf = new Leaf(passage,[])
        for (let i=0; i < choices.length; i++) {
            let [choice, destination] = choices[i]
            this.addOption(choice, destination)
        }
        
    }
    addOption(choice: string, destination: string) {
        let dest = this.story.node(destination)
        this.leaf.choices.push(choice)
        this.link(dest)
    }
    set text(passage: string) {
        this.leaf.passage = passage
    }
    get options() {
        let opts: Array<[string, PageBranch]> = []
        for (let i=0; i < this.leaf.choices.length; i++) {
            let optionText = this.leaf.choices[i]
            let optionDestination = this.connections[i]
            opts.push( [optionText, optionDestination] )
        }
        return opts
    }
}

let labyrinth = new StoryManager()
labyrinth.newStoryNode({
    title: 'entryways',
    passage: '',
    choices: []
})