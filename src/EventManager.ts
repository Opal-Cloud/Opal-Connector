import CRON from "./events/CRON"

export default class Node {
    static async Manage(ws: any, message: any): Promise<any> {
        try {
            const parsedMessage = JSON.parse(message);
            const { type } = parsedMessage;
            
            if (!type) {
                ws.send("Type is required.");
                return;
            }

            if (type === "CRON") {
                const id = parsedMessage.id || null;
                const event = parsedMessage.event || null;
                const cmd = parsedMessage.cmd || null;
                
                if (event === "create" && id && cmd) {
                    const result = await CRON.create(id, cmd);
                    ws.send(`Successfully created CRON job: ${result}`);
                } else if (event === "delete" && id) {
                    const result = await CRON.delete(id);
                    ws.send(`Successfully deleted CRON job: ${result}`);
                } else {
                    ws.send("Invalid event type for CRON or insufficient data.");
                }
            } else {
                ws.send("Invalid type.");
            }

        } catch (error) {
            ws.send(`Error managing the message: ${error}`);
        }
    }
}