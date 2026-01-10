// okay this is very important thing,why we made [[...slugs]]?

//so hamare iss app mein jo bhi request aayegi jooo bhii woh usko [[...slugs]] catch karega

//basically jo bhi request aayegi it will go through [[..slug]] and uske baad

//elysia wale uske piche ka logic backend wagera handle 
//elysia has built in middleware,built in type safety,and is extremely fast

import { redis } from '@/lib/redis';
import { Elysia, t } from 'elysia'
import { nanoid } from 'nanoid';
import { authMiddleWare } from './auth';
import z from 'zod';
import { Message, realtime } from '@/lib/realtime';



const ROOM_TTL_SECONDS = 60 * 10 // 10 minutes

//now we will create new route that will create room when user click create new room button
// jo hamara /room hai that is like container or prefix in hard term,
//post jo hai that is route part it is specific end point and is sort of stored in container room
const rooms = new Elysia({ prefix: "/room" }).post(  // <- Add () here
    "/create", 
    async () => {
        const roomId = nanoid()

        //connecting to redis,we will call redis to create room in database
        //hset->stores data as key-value pairs in redis
        //meta is key
        //roomId is value
        /*
    Redis Database:
    ├──meta:RoomId  //meta is just variable it is like metadata of room is room id,sort of kuch,dont try to understand itna deep mein tbh
         ├── connected: []
         └── createdAt: 1767031737030
        */ 
        await redis.hset(`meta:${roomId}`, {
            connected: [],
            createdAt: Date.now(),
            //this will help us to decide when will room expire
        })

        await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS)

        return { roomId }
        //now whenever we click create new room,meta will be stored in redis database
    }
).use(authMiddleWare).get("/ttl",async ({auth})=>{
    const ttl = await redis.ttl(`meta:${auth.roomId}`)
    return {ttl: ttl > 0 ? ttl : 0}
},{query:z.object({roomId:z.string()})})
.delete(
  "/",
  async ({ auth }) => {
    console.log('🗑️ DELETE ROOM CALLED:', auth.roomId)
    
    try {
      await realtime.channel(auth.roomId).emit("chat.destroy", { isDestroyed: true })
      console.log('✅ Realtime emit successful')
      
      await Promise.all([
        redis.del(`messages:${auth.roomId}`),
        redis.del(`meta:${auth.roomId}`)
      ])
      console.log('✅ Redis cleanup complete')
      
      return { success: true }  // ← THIS LINE IS THE FIX!
      
    } catch (error) {
      console.error('❌ DELETE ERROR:', error)
      return { success: false, error: String(error) }  // ← THIS TOO!
    }
  },
  { query: z.object({ roomId: z.string() }) }
)

//BEFORE EXECUTING LOGIC WE PASS IT THORW AUTH-MIDDLEWARE
const messages=new Elysia({prefix:"/messages"}).use(authMiddleWare)//<-this will ALWAYS RUN before the post request so we know job bhi auth middleware se return ho raha hai
.post("/",async ({ body,auth })=>{
const { sender,text }=body

const{roomId}=auth//auth mein se we are fetching roomId that we are using to check if room exists

const roomExists= await redis.exists(`meta:${roomId}`)

if(!roomExists){
    throw new Error("Room does not exist")
}
const message :Message={
    id:nanoid(),
    sender,
    text,
    timestamp:Date.now(),
    roomId,

}
//add message to history


/***Kya kar raha hai:**
- Redis mein ek **list** bana raha hai jiska naam hai `messages:roomId` (jaise `messages:room123`)
- Us list ke **end mein** (right side) message push kar raha hai
- **Kyun?** Taaki baad mein saare messages ko **order mein** access kar sako (oldest to newest)

**Example:**
```
Room: "room123"
Redis list "messages:room123" looks like:
[message1, message2, message3, message4] ← newest message yahan add hoga*/

await redis.rpush(`messages:${roomId}`,{...message,token:auth.token})//explanation upar diya hai

//niche jo likha uska explanation

/*.channel(roomId)->Sirf apne-apne room wale log message sunenge */
/*
emit(eventName, data) - Kya hai ye?
Simple explanation:

Broadcast karna - sabko signal bhejana
"chat.message" naam ka event trigger kar raha hai
Jo bhi us channel mein listening kar rahe hain, unhe ye data mil jayega

// Server side - message bhej raha hai
realtime.channel("room123").emit("chat.message", {
  text: "Hello!",
  sender: "John"
})

// Client side - message sun raha hai
realtime.channel("room123").on("chat.message", (data) => {
  console.log(data.text)  // "Hello!" print hoga
})

.emit() = broadcast karna
.on() = sunna

*/
await realtime.channel(roomId).emit("chat.message",message)

//expiration of room
//ttl->time to live,built in,you can see in redis ka database
const remaining=await redis.ttl(`meta:${roomId}`)

await redis.expire(`messages:${roomId}`,remaining)
await redis.expire(`history:${roomId}`,remaining)
await redis.expire(roomId,remaining)
return { success: true, message }  // ← ADD THIS LINE!

},{

    query:z.object({roomId:z.string()}),
    //validating message using ZOD
    body:z.object({
        sender:z.string().max(100),//sender ki jo id hai that should be less than 1000
        text:z.string().max(1000),//text to be sent should be less than 1000
    }),
}).get("/",async({auth})=>{
    const messages=await redis.lrange<Message>(`messages:${auth.roomId}`,0,-1)
    return {messages:messages.map((m)=>({
        ...m,
        token:m.token===auth.token ?auth.token : undefined,//if token hamara toh return karo warna agar dusre memeber ka toh undefined
    }) )}
},{query:z.object({roomId:z.string()})})//jab bhi get call hoga middleware ko hume roomId dena hoga wahi hai yeh

//using this get we are extracting messages from our redis database,0 aur -1 is like start to end poora mesaage chayie aur jab return kar rahe toh hum jo like hum log hai,basically message left right jaise whatsapp par hota hai waisa aaye isleiye usko set karne ke liye apna token return kar rahe dusre memeber ka nahi




//THIS IS OUR MAIN ROUTE OR MAIN BACKEND USKE BAAD HUM ISME NAYE ROUTE "." LAGAKE ADD KARTE RAHEGE
const app = new Elysia({ prefix: '/api' }) //<-MAIN ROUTE
    .use(rooms) //pehle route that we add
    .use(messages)//second route or end point that we add to main route

export const GET = app.fetch 
export const POST = app.fetch 
export const DELETE = app.fetch 
export type App = typeof app