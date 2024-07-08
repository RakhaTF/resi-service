import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import fastifyHelmet from "@fastify/helmet"
import fastifyFormBody from "@fastify/formbody"

export default fp(async (fastify: FastifyInstance) => {
    await fastify.register(fastifyHelmet).register(fastifyFormBody)
})
