import { GetProvinces } from "@application/services/ongkir";
import { MessageAMQPJSON } from "@infrastructure/amqp/amqp.dto";

export async function GetProvince(msg: MessageAMQPJSON<any>) {
    await GetProvinces(msg.message.id)
}