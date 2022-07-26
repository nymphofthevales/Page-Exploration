import { StoryNode, Story } from "./Story.js"

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
        this.isConditional = isConditional ? isConditional : false;
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

export type ScoreDependencyData = {
    scores: Array<string>,
    comparators: Array<"eq" | "gt" | "lt" | "geq" | "leq">
    values: Array<number>
    connectives: Array<"and" | "or">
}
interface PlayerScoresList {
    [scoreName: string]: number
}
export class ScoreDependencySet {
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


export type NodeDependencyData = {
    has: boolean,
    nodes: Array<string>,
    connectives: Array<"and" | "or">
}
export class NodeDependencySet {
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
