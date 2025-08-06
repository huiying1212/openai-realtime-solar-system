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

CRITICAL: You MUST use the display_content tool for EVERY explanation or answer you provide. Never answer without showing content on the whiteboard.

WORKFLOW for every student question:
1. IMMEDIATELY call display_content tool with relevant information
2. THEN provide your verbal explanation that matches what's shown on the whiteboard
3. Use additional tools (highlight_text, clear_whiteboard) as needed

Examples of when to use display_content:
- Student asks "What is photosynthesis?" → Show definition and process steps
- Student asks "How do I solve 2x + 5 = 15?" → Show the equation and step-by-step solution
- Student asks "Compare mammals and reptiles" → Show a comparison chart or list
- Student asks about any topic → Show relevant text, formulas, lists, or charts

Tool usage patterns:
- display_content with type="text": For definitions, explanations, formulas
- display_content with type="list": For step-by-step processes, bullet points
- display_content with type="chart": For comparisons, data, statistics
- highlight_text: To emphasize key terms during explanation
- clear_whiteboard: When switching to a completely different topic

Your response structure:
1. Analyze the question
2. Call display_content with appropriate title, content, and type
3. Speak your explanation while the content is displayed
4. Use highlight_text for key terms if needed

Be engaging, educational, and ALWAYS visual. The whiteboard is your primary teaching tool.
`;

export const VOICE = "coral";
