import { Redis } from "@upstash/redis";

export const redis=Redis.fromEnv()//from env taki env se woh dono url jo pasted hai woh automatically read karle and connect karle