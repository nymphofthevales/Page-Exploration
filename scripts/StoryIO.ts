
import { Story, StoryNode } from "./Story.js"
import { StoryOption, NodeDependencyData, ScoreDependencyData, NodeDependencySet, ScoreDependencySet } from "./StoryOption.js"
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
        let title = nodes[i]
        let currentNodeData = storyData[title]
        let { content, options }  = <StoryNodeData>currentNodeData
        let node = new StoryNode(content)

        story.addNode(title, node)
        for (let j = 0; j < options.length; j++) {
            let option = createOptionFromRead(story, options[j])
            story.addOption(node, option)
        }
    }
    return story
}
function createOptionFromRead(story: Story, optionData: StoryOptionData): StoryOption {
    let { text, destination, conditions } = optionData;
    let destinationNode = story.node(destination)
    if (destinationNode == undefined) {
        destinationNode = new StoryNode()
        story.addNode(destination, destinationNode)
    }
    let isConditional = conditions ? true : false;
    return new StoryOption(text, destinationNode, isConditional, conditions?.storyNodeDependencies, conditions?.scoreDependencies)
}

export function writeStoryData(story: Story, sessionID: string) {
    let save = {}
    let backup = "./data/" + sessionID + ".json"
    let filename = "./data/" + sessionID.split('-')[0] + ".json"
    story.forEachNode((node: StoryNode, title: string) => {
        save[title] = {
            "content": node.content,
            "options": []
        }
        story.options(node).forEach((option: StoryOption) => {
            let optionData = {
                "text": option.text,
                "destination": story.title(option.destination)
            }
            if (option.isConditional) {
                optionData["conditions"] = {
                    "isScoreThresholdDependant": option.conditions.isScoreThresholdDependant,
                    "isVisitedNodesDependant": option.conditions.isVisitedNodesDependant,
                    "scoreDependencies": [],
                    "nodeDependencies": []
                }
                fillOptionDataDependencies(option, optionData)
            }
            save[title].options.push(optionData)
        })
    })
    fs.access(filename, (error) => {
        if (!error) {
            fs.writeFileSync(backup, fs.readFileSync(filename))
        }
        fs.writeFileSync(filename, JSON.stringify(save))
    })
}

function fillOptionDataDependencies(option, optionData) {
    if (option.conditions.isScoreThresholdDependant) {
        if (option.conditions.isVisitedNodesDependant) {
            fillScoreDependencies(option, optionData)
            fillNodeDependencies(option, optionData)
        } else {
            fillScoreDependencies(option, optionData)
        }
    } else if (option.conditions.isVisitedNodesDependant) {
        fillNodeDependencies(option, optionData)
    }
}
function fillNodeDependencies(option, optionData) {
    option.conditions.nodeDependencies.forEach((dependencySet: NodeDependencySet)=>{ 
        optionData["conditions"].nodeDependencies.push( dependencySet.dependencyData ) 
    })
}
function fillScoreDependencies(option, optionData) {
    option.conditions.scoreDependencies.forEach((dependencySet: ScoreDependencySet)=>{ 
        optionData["conditions"].scoreDependencies.push( dependencySet.dependencyData ) 
    })
}