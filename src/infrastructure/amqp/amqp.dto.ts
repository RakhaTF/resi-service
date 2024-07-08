export type ConnectionParams = {
    username: string;
    password: string;
    hostname: string;
    vhost: string;
}

export type ChannelParams = ConnectionParams & {
    channel: string
}

export type PubSubParams = ConnectionParams & {
    exchange: string;
}

export enum MessageAMQPType {
    JSON_COMMON,
    JSON_SIGNAL = 10
}

export type MessageAMQP = {
    type: MessageAMQPType;
    cmd: string;
}

export interface MessageAMQPJSON<T> extends MessageAMQP {
    message: T;
}