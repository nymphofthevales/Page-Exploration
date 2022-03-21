
import { DiGraph, GraphNode } from "./Graph"

/**
 * A collection of all the pages in a story.
*/
class StoryManager extends DiGraph {
    constructor () {
        super()
    }
}

/**
 * Holds text and options for a page in a branching story.
*/
class PageBranch extends GraphNode {
    title: string
    constructor (title: string) {
        super()
        this.title = title;
    }
}

/**
 * A single text-option set.
*/
class Leaf {
    constructor(passage: string, options: Array<string>) {

    }
}

/**
 * A series of ordered passages of text, each only being connected to the next without branching.
*/
class Sequence extends PageBranch {
    leaves: Array<Leaf> = []
    constructor (title: string) {
        super(title)
    }
    get length() {
        return this.leaves.length
    }
    addPage(passage: string, option: string) {
        this.leaves.push(new Leaf(passage, [option]))
    }
    addBatchPage(passages: Array<string>, option: string) {
        for (let i=0; i < passages.length; i++) {
            this.leaves.push(new Leaf(passages[i], [option]))
        }
    }
}

/**
 * A single page with multiple options; which connects to multiple branches.
*/
class StoryNode extends PageBranch {
    constructor () {
        super()
    }
}