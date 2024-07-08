import { MessageAMQPJSON } from "@infrastructure/amqp/amqp.dto";

export async function CheckHealth(_msg: MessageAMQPJSON<any>) {
    console.info({ event: `CheckHealth`, msg: 1 });
}