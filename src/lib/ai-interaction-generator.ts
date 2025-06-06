// AI-Powered Interactive Learning Tool Generator
// Generates custom interactive elements based on topic and content

import { OpenAI } from 'openai'

export interface InteractiveElement {
  id: string
  type: string
  title: string
  description: string
  component: string // AI-generated component specification
  config: any // AI-generated configuration
  code?: string // Optional: AI-generated custom code
}

export interface GeneratedLearningTool {
  id: string
  topic: string
  subject: string
  interactiveElements: InteractiveElement[]
  customComponents: string[] // AI-generated component code
  styling: string // AI-generated CSS
  logic: string // AI-generated interaction logic
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateInteractiveLearningTool(
  title: string,
  content: string,
  researchData: any
): Promise<GeneratedLearningTool> {
  
  console.log('🤖 AI: Generating custom interactive learning tool for:', title)
  
  // Step 1: AI analyzes the topic and determines the best interaction types
  const interactionAnalysis = await analyzeTopicForInteractions(title, content, researchData)
  
  // Step 2: AI generates specific interactive elements
  const interactiveElements = await generateCustomInteractiveElements(interactionAnalysis)
  
  // Step 3: AI creates custom component code
  const customComponents = await generateComponentCode(interactiveElements, title)
  
  // Step 4: AI generates topic-specific styling
  const styling = await generateTopicSpecificStyling(title, interactionAnalysis.subject)
  
  // Step 5: AI creates interaction logic
  const logic = await generateInteractionLogic(interactiveElements, title)
  
  return {
    id: `tool_${Date.now()}`,
    topic: title,
    subject: interactionAnalysis.subject,
    interactiveElements,
    customComponents,
    styling,
    logic
  }
}

async function analyzeTopicForInteractions(title: string, content: string, researchData: any) {
  const prompt = `
Analyze this educational topic and determine the best interactive learning approaches:

TOPIC: "${title}"
CONTENT: "${content}"
RESEARCH: ${JSON.stringify(researchData, null, 2)}

Based on this topic, determine:
1. Subject area (Math, Science, History, Literature, etc.)
2. Best interaction types for this specific topic
3. Unique learning activities that would help students understand this topic
4. Creative interactive elements specific to this subject

Respond with JSON:
{
  "subject": "detected subject area",
  "topicComplexity": "beginner|intermediate|advanced",
  "bestInteractionTypes": [
    {
      "type": "specific interaction name",
      "reason": "why this is perfect for this topic",
      "uniqueElements": ["what makes this special for this topic"]
    }
  ],
  "creativeApproaches": [
    {
      "approach": "unique learning activity",
      "implementation": "how to implement this",
      "engagement": "why students will love this"
    }
  ]
}
`

  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8
  })

  try {
    return JSON.parse(response.choices[0].message.content || '{}')
  } catch (error) {
    console.error('Error parsing interaction analysis:', error)
    return { subject: 'General', topicComplexity: 'intermediate', bestInteractionTypes: [], creativeApproaches: [] }
  }
}

async function generateCustomInteractiveElements(analysis: any): Promise<InteractiveElement[]> {
  const elements: InteractiveElement[] = []
  
  for (const interactionType of analysis.bestInteractionTypes) {
    const element = await generateSpecificInteractiveElement(interactionType, analysis.subject)
    elements.push(element)
  }
  
  return elements
}

async function generateSpecificInteractiveElement(interactionType: any, subject: string): Promise<InteractiveElement> {
  const prompt = `
Create a detailed specification for this interactive learning element:

INTERACTION TYPE: ${interactionType.type}
SUBJECT: ${subject}
REASON: ${interactionType.reason}
UNIQUE ELEMENTS: ${interactionType.uniqueElements?.join(', ')}

Generate a complete interactive element specification including:
1. Detailed component configuration
2. User interaction flow
3. Visual elements and styling needs
4. Feedback mechanisms
5. Progress tracking

Respond with JSON:
{
  "id": "unique_element_id",
  "type": "${interactionType.type}",
  "title": "engaging title for this element",
  "description": "what students will do",
  "component": "detailed React component specification",
  "config": {
    "interactionData": "specific data for this interaction",
    "visualElements": ["visual components needed"],
    "userActions": ["what users can do"],
    "feedbackTypes": ["how feedback is provided"],
    "difficultyLevels": ["progression levels"]
  },
  "customLogic": "specific interaction logic for this element"
}
`

  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  })

  try {
    return JSON.parse(response.choices[0].message.content || '{}')
  } catch (error) {
    console.error('Error generating interactive element:', error)
    return {
      id: `element_${Date.now()}`,
      type: interactionType.type,
      title: `Interactive ${interactionType.type}`,
      description: 'Custom interactive learning element',
      component: 'StandardInteractiveComponent',
      config: {}
    }
  }
}

async function generateComponentCode(elements: InteractiveElement[], title: string): Promise<string[]> {
  const componentCodes: string[] = []
  
  for (const element of elements) {
    const code = await generateReactComponentCode(element, title)
    componentCodes.push(code)
  }
  
  return componentCodes
}

async function generateReactComponentCode(element: InteractiveElement, title: string): Promise<string> {
  const prompt = `
Generate a complete React TypeScript component for this interactive learning element:

ELEMENT: ${JSON.stringify(element, null, 2)}
TOPIC: ${title}

Create a fully functional React component that:
1. Implements the specified interaction
2. Includes proper state management
3. Provides engaging visual feedback
4. Tracks user progress
5. Follows modern React patterns
6. Is specifically tailored to this topic

The component should be creative, engaging, and educationally effective.

Return only the React component code (no explanations):
`

  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 2000
  })

  return response.choices[0].message.content || `
// Fallback component for ${element.title}
export function ${element.id}Component() {
  return <div>Interactive element for ${element.title}</div>
}
`
}

async function generateTopicSpecificStyling(title: string, subject: string): Promise<string> {
  const prompt = `
Generate CSS styling that perfectly matches this educational topic:

TOPIC: "${title}"
SUBJECT: "${subject}"

Create CSS that:
1. Reflects the subject area visually
2. Creates appropriate mood/atmosphere
3. Enhances learning experience
4. Uses colors/fonts that match the topic
5. Includes animations that support learning

For example:
- Math: Clean, geometric, logical colors
- Science: Experimental, discovery-oriented styling
- History: Classical, timeline-appropriate themes
- Literature: Creative, expressive, artistic elements

Return only CSS code:
`

  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000
  })

  return response.choices[0].message.content || `
/* Fallback styling for ${title} */
.learning-tool-${subject.toLowerCase()} {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}
`
}

async function generateInteractionLogic(elements: InteractiveElement[], title: string): Promise<string> {
  const prompt = `
Generate JavaScript logic for coordinating these interactive elements:

ELEMENTS: ${JSON.stringify(elements.map(e => ({ id: e.id, type: e.type, title: e.title })), null, 2)}
TOPIC: "${title}"

Create logic that:
1. Coordinates between different interactive elements
2. Tracks overall learning progress
3. Provides intelligent feedback
4. Adapts difficulty based on performance
5. Creates engaging learning flow

Return JavaScript/TypeScript code for the interaction logic:
`

  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1500
  })

  return response.choices[0].message.content || `
// Fallback interaction logic for ${title}
export class InteractionLogic {
  constructor(elements) {
    this.elements = elements;
    this.progress = 0;
  }
  
  updateProgress(elementId, progress) {
    // Update progress logic
  }
}
`
}

// Dynamic component renderer that executes AI-generated components
export function renderAIGeneratedComponent(componentCode: string, props: any) {
  try {
    // In a production environment, you'd want to use a safer code execution method
    // This is a simplified example - consider using a sandboxed execution environment
    const componentFunction = new Function('React', 'useState', 'useEffect', 'props', `
      const { useState, useEffect } = React;
      ${componentCode}
    `)
    
    return componentFunction(React, React.useState, React.useEffect, props)
  } catch (error) {
    console.error('Error rendering AI component:', error)
    return null
  }
}