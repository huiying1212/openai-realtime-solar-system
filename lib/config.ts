const toolsDefinition = [
  {
    name: "add_content",
    description: "Add text content to the whiteboard when the user is explaining something or giving a lecture",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title or heading for this content section",
        },
        content: {
          type: "string", 
          description: "The main content text to display on the whiteboard",
        },
        type: {
          type: "string",
          enum: ["title", "subtitle", "bullet", "paragraph", "highlight"],
          description: "The type of content formatting to apply",
        },
      },
      required: ["content", "type"],
    },
  },
  {
    name: "display_data",
    description:
      "Display a chart to visualize data points during the lecture. Use this when presenting numerical information, comparisons, or statistical data.",
    parameters: {
      type: "object",
      properties: {
        chart: {
          type: "string",
          enum: ["bar", "pie"],
          description: "The most appropriate chart type for the data",
        },
        title: {
          type: "string",
          description:
            "The title of the chart that will be displayed",
        },
        text: {
          type: "string",
          description:
            "Optional explanatory text to display with the chart",
        },
        data: {
          type: "array",
          description: "data to display in the chart",
          items: {
            type: "object",
            properties: {
              label: {
                type: "string",
                description: "Data item label",
              },
              value: {
                type: "string",
                description: "Data item value",
              },
            },
            required: ["label", "value"],
            additionalProperties: false,
          },
        },
      },
    },
  },
  {
    name: "clear_whiteboard",
    description:
      "Clear the whiteboard when starting a new topic, section, or when the user explicitly asks to clear the board",
    parameters: {},
  },
  {
    name: "create_section",
    description: "Create a new section or topic on the whiteboard to organize the lecture content",
    parameters: {
      type: "object",
      properties: {
        section_title: {
          type: "string",
          description: "The title of the new section",
        },
      },
      required: ["section_title"],
    },
  },
];

export const TOOLS = toolsDefinition.map((tool) => ({
  type: "function",
  ...tool,
}));

export const INSTRUCTIONS = `
You are an AI teaching assistant that helps create dynamic presentations on a digital whiteboard based on spoken content.

Your role is to listen to the lecturer and automatically organize their spoken content into a well-structured whiteboard presentation. You should:

1. **Content Organization**: When the user speaks about teaching content, use the add_content tool to display their main points on the whiteboard with appropriate formatting:
   - Use "title" for main topics or lesson titles
   - Use "subtitle" for sub-topics or section headings  
   - Use "bullet" for key points, lists, or important facts
   - Use "paragraph" for longer explanations or descriptions
   - Use "highlight" for emphasizing critical information

2. **Data Visualization**: When the user mentions numerical data, statistics, comparisons, or any information that would benefit from visual representation, automatically create charts using the display_data tool:
   - Use bar charts for comparisons, rankings, or categorical data
   - Use pie charts for proportions, percentages, or parts of a whole

3. **Section Management**: 
   - Use create_section when the user moves to a new major topic or lesson section
   - Use clear_whiteboard when starting a completely new lesson or when explicitly requested

4. **Responsive Formatting**: Organize content logically and maintain good visual hierarchy. Don't wait for explicit instructions - proactively format and display content as the user speaks.

5. **Lecture Flow**: Follow the natural flow of the lecture, adding content in real-time as the user explains concepts. Be concise but capture the essential information.

Be proactive in organizing content and creating visual aids. Your goal is to create a clear, well-structured presentation that enhances the learning experience.

Keep your verbal responses brief and natural, as if you're a helpful teaching assistant. Focus more on organizing the content than on lengthy explanations.
`;

export const VOICE = "coral";
