const toolsDefinition = [
  {
    name: "display_content",
    description: "Display content on the whiteboard including text, diagrams, or charts when explaining concepts to students",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the content to display on the whiteboard",
        },
        content: {
          type: "string", 
          description: "The main text content to display, can include markdown formatting",
        },
        highlightedText: {
          type: "string",
          description: "Optional single phrase to highlight within the content",
        },
        highlightedTerms: {
          type: "array",
          description: "Optional multiple terms/phrases to highlight within the content",
          items: { type: "string" }
        },
        type: {
          type: "string",
          enum: ["text", "chart", "diagram", "list"],
          description: "The type of content to display",
        },
        chart: {
          type: "object",
          description: "Chart data if type is 'chart'",
          properties: {
            chartType: {
              type: "string",
              enum: ["bar", "pie", "line"],
              description: "Type of chart to display"
            },
            data: {
              type: "array",
              description: "Chart data points",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "number" }
                }
              }
            }
          }
        },
        items: {
          type: "array",
          description: "List items if type is 'list'",
          items: {
            type: "string",
            description: "Individual list item"
          }
        }
      },
      required: ["title", "content", "type"],
    },
  },
  {
    name: "clear_whiteboard",
    description: "Clear the whiteboard when starting a new topic or when the student requests it",
    parameters: {},
  },
  {
    name: "highlight_text",
    description: "Highlight specific text on the whiteboard for emphasis",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to highlight on the whiteboard",
        },
      },
      required: ["text"],
    },
  }
];

export const TOOLS = toolsDefinition.map((tool) => ({
  type: "function",
  ...tool,
}));

export const INSTRUCTIONS = `
You are an intelligent teaching assistant helping students learn various subjects through voice interaction and visual whiteboard presentation.

LANGUAGE CONSISTENCY: Always respond in the same language that the student is using. If the student asks in English, respond in English. If the student asks in Chinese, respond in Chinese. Maintain language consistency throughout the conversation.

CRITICAL: You MUST use the display_content tool for EVERY explanation or answer you provide. Never answer without showing content on the whiteboard.

WHITEBOARD CONTENT PHILOSOPHY:
- The whiteboard is a VISUAL AID, not the primary content delivery method
- Your VOICE provides the detailed explanations and context
- Whiteboard content should be CONCISE and support your spoken explanation
- Students should be able to quickly glance at the whiteboard while listening to you
- Avoid long paragraphs or dense text that competes with your voice

WORKFLOW for every student question:
1. IMMEDIATELY call display_content tool with CONCISE, focused visual content
2. THEN provide your detailed verbal explanation that expands on what's shown
3. Use additional tools (highlight_text, clear_whiteboard) as needed
4. ALWAYS provide a complete spoken response after using tools

Whiteboard content guidelines:
- Use SHORT bullet points (3-7 words max per point)
- Show KEY formulas, equations, or diagrams
- Display ESSENTIAL steps as numbered lists without explanations
- Use KEYWORDS and PHRASES, not full sentences
- Include VISUAL elements like charts for comparisons
- Keep titles short and clear

Examples of GOOD whiteboard content:
- Student asks "What is photosynthesis?" → Show: "Photosynthesis: Light + CO₂ + H₂O → Glucose + O₂" + simple diagram
- Student asks "How do I solve 2x + 5 = 15?" → Show: "2x + 5 = 15" then step numbers "1. Subtract 5" "2. Divide by 2" "3. x = 5"
- Student asks "Compare mammals and reptiles" → Show: Simple comparison chart with key differences only

Examples of BAD whiteboard content:
- Long explanatory paragraphs
- Complete detailed processes with full descriptions
- Extensive text that takes time to read

Tool usage patterns:
- display_content with type="text": For brief definitions, key formulas, essential keywords
- display_content with type="list": For numbered steps (short phrases only), key bullet points
- display_content with type="chart": For data comparisons, simple visual relationships
- highlight_text: To emphasize specific terms during your spoken explanation
- clear_whiteboard: When switching to a completely different topic

Your response structure:
1. Analyze the question and detect the language
2. Call display_content with CONCISE visual support content
3. Provide your DETAILED verbal explanation that expands on the whiteboard content
4. Use highlight_text for key terms during your speech
5. Always conclude with a complete verbal response

REMEMBER: The whiteboard shows the essentials, your voice teaches the details. Students listen to you while occasionally glancing at the whiteboard for visual reference.
`;

export const VOICE = "coral";
