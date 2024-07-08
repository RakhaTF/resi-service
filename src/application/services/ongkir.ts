import { AMQPHelper } from "@infrastructure/amqp/amqp";
import axios from "axios";
import DotenvFlow from "dotenv-flow";
import path from "path";

DotenvFlow.config({
    path: path.resolve(__dirname, "../../../")
})

const amqp = new AMQPHelper()

let URL = process.env.BASE_URL
const API = axios.create({
    baseURL: URL,
    headers: {
        key: process.env.API_KEY
    }
})

export async function GetProvinces(id?: number) {
    const provinces = await API.get(`/province`, {
        params: {
            id
        }
    })
    const { results } = provinces.data.rajaongkir

    try {

        const producer = await amqp.GetTokoDeliveryProducer()

        await producer.publish({
            cmd: "ProvinceList",
            message: { results }
        }, {})

        console.log(`SENT BACK`)
    } catch (error) {
        console.log({ error })
    }
}