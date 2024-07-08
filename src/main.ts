import DotenvFlow from "dotenv-flow";
import fastify from "fastify";
import cors from '@fastify/cors'
import FastifyBaseAddon from "./application/boot/fastify/base"
import path from "path";
import BootAMQP from "@application/boot/amqp";
import { CreateAMQPPubSub } from "@infrastructure/amqp/amqp";

DotenvFlow.config({
    path: path.resolve(__dirname, "../")
})

async function main() {
    const server = fastify({
        logger: {
            transport: {
                target: "pino-pretty",
            },
        },
    })

    server.register(cors, {
        methods: ["PUT", "GET", "POST"],
        allowedHeaders: ['Content-Type', 'Authorization']
    })

    server.register(FastifyBaseAddon)

    const config = {
        PORT: process.env.PORT,
        HOST: process.env.HOST
    }

    try {
        const port = Number(config.PORT)
        server.listen({ port, host: config.HOST }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Server listening at ${address}`)
        })

        await CreateAMQPPubSub({
            hostname: process.env.AMQP_HOSTNAME || "",
            vhost: process.env.AMQP_VHOST || "",
            username: process.env.AMQP_USERNAME || "",
            password: process.env.AMQP_PASSWORD || "",
            exchange: "pubsub-toko-delivery"
        });

        await BootAMQP()

    } catch (e) {
        console.error(e)
        process.exit(1)
    }

}

main()