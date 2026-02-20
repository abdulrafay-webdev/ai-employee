import OpenAI from "openai";
import { logger } from "./logger";
import { prisma } from "./db";

const chatHistories: { [sender: string]: any[] } = {};

const SAIM_PERSONA_TEMPLATE = (busyReason: string) => `
Role: You are Saim, Abdul Rafay's professional Human Assistant.
Goal: Close business deals and manage boundaries.

PRIORITY RULES:
1. WORK & SALES (Website, WordPress, Next.js, Pricing, Portfolio):
   - Handle these IMMEDIATELY and PROFESSIONALLY. 
   - DO NOT tell the client Rafay is busy if they are just asking for work info. 
   - Act as if you have full authority to provide pricing (15k-30k) and take requirements.
   - PUSH FOR THE SALE.

2. RAFAY INQUIRIES (Where is Rafay? Can I talk to him? Is he free?):
   - ONLY mention the busy reason here.
   - Reply naturally: "Ji Rafay abhi thora busy hain, woh [INSERT REASON] mein phansay huay hain. Aap mjhe bata dain, main behtar guide kar sakta hoon ya unhein inform kar doonga."
   - Reason: ${busyReason}

3. CONVERSATION: Roman English. Natural flow. No AI mention.
4. AUTO-SEND: True for work/greetings. False for sensitive personal info.

Return ONLY JSON: { "reply": "string", "shouldAutoSend": boolean }`;

export class AIService {
    private static openai: OpenAI | null = null;

    private static getClient(): OpenAI {
        if (!this.openai) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });
        }
        return this.openai;
    }

    static async getResponse(sender: string, userMessage: string, source: 'whatsapp' | 'gmail'): Promise<{ reply: string, shouldAutoSend: boolean }> {
        if (!chatHistories[sender]) chatHistories[sender] = [];
        chatHistories[sender].push({ role: "user", content: userMessage });

        if (chatHistories[sender].length > 15) chatHistories[sender].shift();

        // Get live busy reason
        const config = await prisma.config.findUnique({ where: { key: 'busy_reason' } });
        const currentReason = config?.value || "important projects";

        try {
            const client = this.getClient();
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: SAIM_PERSONA_TEMPLATE(currentReason) },
                    ...chatHistories[sender]
                ],
                response_format: { type: "json_object" }
            });

            const data = JSON.parse(response.choices[0].message.content || "{}");
            chatHistories[sender].push({ role: "assistant", content: data.reply });
            
            return {
                reply: data.reply,
                shouldAutoSend: data.shouldAutoSend ?? true
            };
        } catch (error: any) {
            return { reply: "Ji Rafay thora busy hain, main unka assistant hoon. Aap kaam bata dain.", shouldAutoSend: true };
        }
    }

    static async generateBriefing(prompt: string): Promise<string> {
        try {
            const client = this.getClient();
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });
            const data = JSON.parse(response.choices[0].message.content || "{}");
            return data.briefing || "No summary available.";
        } catch (error) { return "Failed to generate."; }
    }
}