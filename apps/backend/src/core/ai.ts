import OpenAI from "openai";
import { logger } from "./logger";

const chatHistories: { [sender: string]: any[] } = {};

const SAIM_PERSONA = `
Role: You are Saim, Abdul Rafay's human assistant.
Context: Rafay is a Web Developer (15k-30k range).
RULES: Talk naturally in Roman English. NO AI mention.`;

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

        try {
            const client = this.getClient();
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: SAIM_PERSONA }, ...chatHistories[sender]],
                response_format: { type: "json_object" }
            });
            const data = JSON.parse(response.choices[0].message.content || "{}");
            chatHistories[sender].push({ role: "assistant", content: data.reply });
            return { reply: data.reply, shouldAutoSend: data.shouldAutoSend ?? true };
        } catch (error: any) {
            return { reply: "Rafay busy hain.", shouldAutoSend: true };
        }
    }

    // NEW: Briefing Generator
    static async generateBriefing(prompt: string): Promise<string> {
        try {
            const client = this.getClient();
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });
            const data = JSON.parse(response.choices[0].message.content || "{}");
            return data.briefing || "Aaj ki report tayyar nahi ho saki.";
        } catch (error) {
            return "Report generation failed.";
        }
    }
}
