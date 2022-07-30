
import { Story, StoryNode } from "./Story.js"
import { StoryOption, NodeDependencyData, ScoreDependencyData, NodeDependencyRule, ScoreDependencyRule } from "./StoryOption.js"
const fs = require("fs");

interface StoryNodeData {
    "content": string,
    "options": StoryOptionData[]
}
interface StoryOptionData {
    "text": string,
    "destination": string,
    "disabled": boolean,
    "conditions"?: {
        storyNodeDependencies: NodeDependencyData[],
        scoreDependencies: ScoreDependencyData[]
    }
}

export function readStoryData(filename: string): Story {
    let story = new Story()
    let storyData = JSON.parse(fs.readFileSync("./data/" + filename + ".json"))
    console.log(storyData)
    let nodes = Object.keys(storyData)
    for (let i=0; i < nodes.length; i++) {
        let title = nodes[i]
        let currentNodeData = storyData[title]
        let { content, options }  = <StoryNodeData>currentNodeData
        let node = new StoryNode(content);
        node = story.addNode(title, node)
        for (let j = 0; j < options.length; j++) {
            let option = createOptionFromRead(story, options[j])
            story.addOption(node, option)
        }
    }
    return story
}
function createOptionFromRead(story: Story, optionData: StoryOptionData): StoryOption {
    let { text, destination, disabled, conditions } = optionData;
    let destinationNode = story.node(destination)
    if (destinationNode == undefined) {
        destinationNode = new StoryNode()
        story.addNode(destination, destinationNode)
    }
    let isConditional = conditions ? true : false;
    let isDefaultDisabled = disabled ? true : false;
    return new StoryOption(
        text, 
        destinationNode, 
        isDefaultDisabled,
        isConditional, 
        conditions?.storyNodeDependencies, 
        conditions?.scoreDependencies)
}

export function writeStoryData(story: Story, sessionID: string) {
    let save = {}
    let backup = "./data/" + "auto" + sessionID + ".json"
    let filename = "./data/" + sessionID.split('-')[0] + ".json"
    story.forEachNode((node: StoryNode, title: string) => {
        save[title] = {
            "content": node.content,
            "options": []
        }
        story.options(node).forEach((option: StoryOption) => {
            let optionData = {
                "text": option.text,
                "destination": story.title(option.destination),
                "disabled": option.isDefaultDisabled
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
    option.conditions.nodeDependencies.forEach((dependencyRule: NodeDependencyRule)=>{ 
        optionData["conditions"].nodeDependencies.push( dependencyRule.dependencyData ) 
    })
}
function fillScoreDependencies(option, optionData) {
    option.conditions.scoreDependencies.forEach((dependencyRule: ScoreDependencyRule)=>{ 
        optionData["conditions"].scoreDependencies.push( dependencyRule.dependencyData ) 
    })
}