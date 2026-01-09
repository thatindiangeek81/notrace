
//copied this from->https://upstash.com/docs/realtime/overall/quickstart modify bhi kiya according to our needs
import { Realtime, InferRealtimeEvents } from "@upstash/realtime"
import { redis } from "./redis"
import z from "zod/v4"


const message=z.object({//jo bhi message hoga usme yeh sab propertises hogi
        id:z.string(),
        sender:z.string(),
        text:z.string(),
        timestamp:z.number(),
        roomId:z.string(),
        token:z.string().optional(),
    })

//message and destroy yeh do events ho sakte yah message bhejo yah room destroy hoga
const schema = {//here we are defining jo bhi events ho sakte
  chat: {
    message,
    destroy:z.object({
        isDestroyed:z.literal(true),
    })
  },
}

export const realtime = new Realtime({ schema, redis })
//we can use this realtime instance to send messages

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>//z.infer and InferRealtimeEvents automatically generate TypeScript types from your validation rules/schemas, so you don't have to write the same thing twice.
export type Message=z.infer<typeof message>

//idhar tak copy kiya ^