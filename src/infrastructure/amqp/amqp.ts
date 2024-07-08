import { AmqpConnectionManager, ChannelWrapper, connect } from "amqp-connection-manager"
import * as amqp from "amqplib"
import { ChannelParams, ConnectionParams, PubSubParams } from "./amqp.dto"
import * as AMQPPubSub from "./pubsub";

export class AMQPHelper {
    pubsub: AMQPPubSub.AMQPPubSubHelper[] = [];
}

const amqpHelper = new AMQPHelper()

const connectionPool = new Map<string, AmqpConnectionManager>()
const channelPool = new Map<string, ChannelWrapper>()

export async function getConnection(params: ConnectionParams) {
    const { hostname, password, username, vhost } = params

    try {
        const connection = connectionPool.get(`${username}@${hostname}/${vhost}`)

        if (connection) {
            return connection
        }

        // Create a connection if there is no existing connection with the setup
        const testConnect = await amqp.connect(params, { clientProperties: { connection_name: "resiService" } })
        testConnect.close()
        connectionPool.set(`${username}@${hostname}/${vhost}`, connect([`amqp://${username}:${password}@${hostname}/${vhost}`]))

        return connectionPool.get(`${username}@${hostname}/${vhost}`)
    } catch (error) {
        console.log(`Error trying to connect to amqp`, { error })
        throw error
    }
}

export async function getChannel(params: ChannelParams) {
    try {
        const { username, password, hostname, vhost, channel } = params

        const channelName = channelPool.get(`${username}@${hostname}/${vhost}@${channel}`)

        if (channelName) {
            return channelName
        }

        // Create a connection if there is no existing connection with the setup
        // Create a new channel too
        const connection = await getConnection({ username, password, hostname, vhost });
        channelPool.set(`${username}@${hostname}/${vhost}@${channel}`, connection.createChannel({
            json: true,
            name: channel
        }))
        return channelPool.get(`${username}@${hostname}/${vhost}@${channel}`)

    } catch (error) {
        console.log({ error })
        throw error
    }
}

export async function AddAMQPPubSub(amqpPubSub: AMQPPubSub.AMQPPubSubHelper): Promise<AMQPPubSub.AMQPPubSubHelper> {
    amqpHelper.pubsub.push(amqpPubSub);
    console.info({ event: `infrastructure/amqp/AddAMQPPubSub`, msg: `Exchange ${amqpPubSub.exchange} Added...` });
    return amqpPubSub;
}

export async function CreateAMQPPubSub(params: PubSubParams): Promise<AMQPPubSub.AMQPPubSubHelper> {
    const amqpPubSub = AMQPPubSub.getInstance(params);
    amqpHelper.pubsub.push(amqpPubSub);
    console.info({ event: `infrastructure/amqp/CreateAMQPPubSub`, msg: `Queue ${amqpPubSub.exchange} Added...` });
    return amqpPubSub;
}

export function GetAMQPHelper(): AMQPHelper {
    return amqpHelper;
}