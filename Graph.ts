
type GraphNode = any
type NeighbourList = Set<any>

/**
 * A data structure for representing any set of interconnected nodes.
*/
class Graph {
    adjacencyMap: Map<GraphNode, NeighbourList>
    constructor() {
        this.adjacencyMap = new Map()
    }
    getNeighbours(node: GraphNode): NeighbourList {
        if (!this.adjacencyMap.has(node)) {
            this.defineNode(node)
        }
        return this.adjacencyMap.get(node) as NeighbourList
    }
    link(a: GraphNode, b: GraphNode) {
        this.getNeighbours(a).add(b)
        this.getNeighbours(b).add(a)
    }
    defineNode(a: GraphNode) {
        this.adjacencyMap.set(a, new Set())
    }
}

/**
 * A 'directed' graph, with one-way connections by default.
 */
class DiGraph extends Graph {
    constructor () {
        super()
    }
    link(origin: GraphNode, destination: GraphNode) {
        this.getNeighbours(origin).add(destination)
    }
}
