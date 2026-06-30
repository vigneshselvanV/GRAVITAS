import { Type } from "@google/genai";

export const toolsDeclaration = {
  functionDeclarations: [
    {
      name: "extract_task",
      description: "Extract structured task data from natural language input",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          deadline: { type: Type.STRING },
          effort_hours: { type: Type.NUMBER },
          priority_score: { type: Type.NUMBER },
          category: { type: Type.STRING },
          urgency_label: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          conflicts_detected: { type: Type.STRING }
        },
        required: ["title", "description", "priority_score", "urgency_label"]
      }
    },
    {
      name: "generate_plan",
      description: "Break a task into micro-steps and focus blocks",
      parameters: {
        type: Type.OBJECT,
        properties: {
          micro_steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                duration_minutes: { type: Type.NUMBER },
                is_blocker: { type: Type.BOOLEAN },
                order: { type: Type.NUMBER }
              }
            }
          },
          focus_blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                duration_minutes: { type: Type.NUMBER },
                start_offset_minutes: { type: Type.NUMBER }
              }
            }
          },
          total_minutes_required: { type: Type.NUMBER },
          completion_eta: { type: Type.STRING },
          buffer_minutes: { type: Type.NUMBER },
          agent_message: { type: Type.STRING },
          schedule_conflict: { type: Type.BOOLEAN },
          conflict_note: { type: Type.STRING }
        },
        required: ["micro_steps", "total_minutes_required", "schedule_conflict"]
      }
    },
    {
      name: "replan",
      description: "Rebuild schedule when steps are missed or deadlines shift",
      parameters: {
        type: Type.OBJECT,
        properties: {
          task_id: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["task_id", "reasoning"]
      }
    },
    {
      name: "send_nudge",
      description: "Generate escalating reminder when user inactive on a task",
      parameters: {
        type: Type.OBJECT,
        properties: {
          task_id: { type: Type.STRING },
          nudge_level: { type: Type.NUMBER },
          tone: { type: Type.STRING },
          message: { type: Type.STRING },
          action_required: { type: Type.STRING },
          time_remaining_label: { type: Type.STRING }
        },
        required: ["task_id", "nudge_level", "tone", "message", "action_required"]
      }
    },
    {
      name: "draft_extension_email",
      description: "Draft a deadline extension request email",
      parameters: {
        type: Type.OBJECT,
        properties: {
          task_id: { type: Type.STRING },
          recipient_placeholder: { type: Type.STRING },
          subject: { type: Type.STRING },
          body: { type: Type.STRING },
          suggested_new_deadline: { type: Type.STRING }
        },
        required: ["task_id", "recipient_placeholder", "subject", "body"]
      }
    }
  ]
};
