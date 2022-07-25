
import { Story, StoryNode } from "./Story.js"
import { StoryOption, NodeDependencyData, ScoreDependencyData } from "./StoryOption.js"
const fs = require("fs");

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
    let { text, destination, conditions } = optionData;
    let destinationNode = story.node(destination)
    if (destinationNode == undefined) {
        destinationNode = new StoryNode()
        story.addNode(destination, destinationNode)
    }
    let isConditional = conditions ? false : true;
    return new StoryOption(text, destinationNode, isConditional, conditions?.storyNodeDependencies, conditions?.scoreDependencies)
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