import { ConsumeMessage } from "amqplib";
import * as CommonController from './controller/common';
import * as OngkirController from './controller/ongkir';
import { MessageAMQPJSON } from "@infrastructure/amqp/amqp.dto";

export default async function SubscriberMessageHandler(msg: ConsumeMessage | null) {
    if (msg ?? msg.content) {
        const data = <MessageAMQPJSON<any>>JSON.parse(msg.content.toString());
        console.log({data})


        // cmd harus bernama sesuai dengan fungsi yang ada di CommonController
        if (data.cmd in CommonController) {
            const cmd = data.cmd as keyof typeof CommonController;
            if (typeof CommonController[cmd] !== 'function') {
                throw new Error("UNKNOWN_COMMAND_ERROR");
            }
            CommonController[cmd](data);
        }

        // cmd harus bernama sesuai dengan fungsi yang ada di OngkirController
        if (data.cmd in OngkirController) {
            const cmd = data.cmd as keyof typeof OngkirController;
            if (typeof OngkirController[cmd] !== 'function') {
                throw new Error("UNKNOWN_COMMAND_ERROR");
            }
            OngkirController[cmd](data);
        }
    }
}