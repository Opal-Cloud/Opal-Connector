import CRON from "./events/CRON"

export default class Node {
    static async Manage(ws: any, message: any): Promise<any> {
        try {
            const parsedMessage = JSON.parse(message);
            const { type } = parsedMessage;

            if (!type) {
                return { error: "Type is required." };
            }

            if (type === "CRON") {
                const id = parsedMessage.id || null;
                const event = parsedMessage.event || null;
                const cmd = parsedMessage.cmd || null;

                if (event === "create" && id && cmd) {
                    const result = await CRON.create(id, cmd);
                    return { success: true, message: `Successfully created CRON job: ${result}` };
                } else if (event === "delete" && id) {
                    const result = await CRON.delete(id);
                    return { success: true, message: `Successfully deleted CRON job: ${result}` };
                } else {
                    return { error: "Invalid event type for CRON or insufficient data." };
                }
            } else {
                return { error: "Invalid type." };
            }

        } catch (error) {
            return { error: `Error managing the message: ${error}` };
        }
    }
}  