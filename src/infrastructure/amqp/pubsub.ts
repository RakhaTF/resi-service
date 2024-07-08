import { Channel, ChannelWrapper } from "amqp-connection-manager";
import { getChannel } from "./amqp";
import { ChannelParams, PubSubParams } from "./amqp.dto";
import { ConsumeMessage, Options } from "amqplib";

const instance = new Map<string, AMQPPubSubHelper>()

export class AMQPPubSubHelper {
    options: ChannelParams;
    channel: ChannelWrapper | null;
    exchange: string;
    constructor(params: PubSubParams) {
        const { username, password, hostname, vhost, exchange } = params
        this.options = {
            username,
            password,
            hostname,
            vhost,
            channel: exchange
        };
        this.exchange = exchange;
        this.channel = null;
    }

    async init(): Promise<boolean> {
        if (this.channel != null) {
            return true;
        }
        try {
            this.channel = await getChannel({
                ...this.options,
            });
            await this.channel.addSetup((ch: Channel) => {
                return ch.assertExchange(this.exchange, 'fanout', {
                    durable: false
                });
            });

            await this.channel.waitForConnect();
            return true;
        } catch (x_x) {
            console.log(x_x);
        }

        return false;
    }

    async getChannelWrapper(): Promise<ChannelWrapper | null> {
        return this.channel;
    }

    async publish(data: Buffer | object, option: Options.Publish): Promise<boolean> {
        if (this.channel == null) {
            await this.init();
        }
        if (this.channel != null) {
            return this.channel.publish(this.exchange, '', data, option);
        }

        throw new Error("AMQP Channel not initialized")
    }

    async addSubscriber(fn: (msg: ConsumeMessage | null) => void, option: Options.Consume) {
        if (this.channel == null) {
            await this.init();
        }

        if (this.channel != null) {
            await this.channel.addSetup(async (ch: Channel) => {
                const q = await ch.assertQueue('', { exclusive: true });

                await ch.bindQueue(q.queue, this.exchange, '');

                // must get and forget (noAck)
                const options = { ...option };
                options.noAck = true;

                await ch.consume(q.queue, fn, options);
            });
        }
    }
}

export function getInstance(params: PubSubParams): AMQPPubSubHelper {
    const { username, password, hostname, vhost, exchange } = params;
    if (!username || !password || !hostname || !vhost || !exchange) {
        throw new Error("MISSING_PARAMETER");
    }
    if (!instance.get(`${username}@${hostname}/${vhost}@${exchange}`)) {
        const newInstance = new AMQPPubSubHelper({ username, password, hostname, vhost, exchange })
        instance.set(`${username}@${hostname}/${vhost}@${exchange}`, newInstance)
    }
    return instance.get(`${username}@${hostname}/${vhost}@${exchange}`);
}