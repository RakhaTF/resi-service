import SubscriberMessageHandler from "@adapters/inbound/amqp/subscriber";
import { AMQPHelper, GetAMQPHelper } from "@infrastructure/amqp/amqp";
import * as SubscriberClient from "@infrastructure/amqp/pubsub"

declare module "@infrastructure/amqp/amqp" {
    interface AMQPHelper {
        tokoDeliverySubscriber?: SubscriberClient.AMQPPubSubHelper;
        GetTokoDeliverySubscriber(): Promise<SubscriberClient.AMQPPubSubHelper>;
        tokoDeliveryProducer?: SubscriberClient.AMQPPubSubHelper;
        GetTokoDeliveryProducer(): Promise<SubscriberClient.AMQPPubSubHelper>;
    }
}

AMQPHelper.prototype.GetTokoDeliverySubscriber = async function (): Promise<SubscriberClient.AMQPPubSubHelper> {
    if (this.tokoDeliverySubscriber) {
        return this.tokoDeliverySubscriber;
    }

    if (this.pubsub.length <= 0) {
        throw new Error("Subscriber Client is empty");
    }

    for (const ps of this.pubsub) {
        const tokosubs_host: string = process.env.AMQP_HOSTNAME;
        const tokosubs_vhost: string = process.env.AMQP_VHOST;
        const tokosubs_exchange: string = "pubsub-toko-delivery"
        if (ps.options.hostname == tokosubs_host && ps.options.vhost == tokosubs_vhost
            && ps.exchange == tokosubs_exchange) {
            this.tokoDeliverySubscriber = ps;
            return this.tokoDeliverySubscriber;
        }
    }

    throw new Error("AMQP Subscriber Client not found");
}

AMQPHelper.prototype.GetTokoDeliveryProducer = async function (): Promise<SubscriberClient.AMQPPubSubHelper> {
    if (this.tokoDeliveryProducer) {
        return this.tokoDeliveryProducer;
    }

    if (this.pubsub.length <= 0) {
        const amqp = GetAMQPHelper()
        if (amqp.pubsub.length <= 0) {
            throw new Error("Producer Client is empty");
        }

        this.pubsub = amqp.pubsub
    }
    for (const ps of this.pubsub) {
        const tokosubs_host: string = process.env.AMQP_HOSTNAME
        const tokosubs_vhost: string = process.env.AMQP_VHOST
        const tokosubs_exchange: string = "pubsub-toko-delivery"
        if (ps.options.hostname == tokosubs_host && ps.options.vhost == tokosubs_vhost
            && ps.exchange == tokosubs_exchange) {
            this.tokoDeliveryProducer = ps;
            return this.tokoDeliveryProducer;
        }
    }

    throw new Error("AMQP Producer Client not found");
}

export default async function BootAMQP() {
    const amqp = GetAMQPHelper();
    const tokoDelivSubsClient = await amqp.GetTokoDeliverySubscriber();
    tokoDelivSubsClient.addSubscriber(SubscriberMessageHandler, { noAck: true });

    const publisherInstances = await amqp.GetTokoDeliveryProducer();
    if (!(await publisherInstances.init())) {
        throw new Error("Tokopaedi publisher was not initialized properly")
    }

    console.info({ event: `application/boot/amqp`, msg: "Done..." });
}