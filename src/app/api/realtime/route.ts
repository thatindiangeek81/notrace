import { handle } from "@upstash/realtime"
import { realtime } from "@/lib/realtime"

export const GET = handle({ realtime })

//completely copied from->https://upstash.com/docs/realtime/overall/quickstart