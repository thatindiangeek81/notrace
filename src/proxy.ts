//MIDDLEWARE FILE

import { NextRequest, NextResponse } from "next/server"
import { redis } from "./lib/redis"
import { nanoid } from "nanoid"

export const proxy = async (req:NextRequest) =>{
//OVERVIEW:CHECK IF USER IS ALLOWED TO JOIN ROOM
//IF ALLOWED LET THEM PASS
//IF NOT ALLLOWED SEND THEM BACK TO LOBBY


const pathname=req.nextUrl.pathname
//localhost:3000/room/""joshroom"" AISA KUCH HOGA

const roomMatch=pathname.match(/^\/room\/([^/]+)$/)


if(!roomMatch) return NextResponse.redirect(new URL("/",req.url))

    const roomId=roomMatch[1]//this will give roomId ehich is here joshroom


    const meta=await redis.hgetall<{connected:string[],createdAt:number}>(`meta:${roomId}`)//fetching data from redis

    if(!meta){
        return NextResponse.redirect(new URL("/? error=room-not-found",req.url))
    }

    const existingToken=req.cookies.get("x-auth-token")?.value
    //this will prevent multiple cookie generation for one user

    //THE MAIN THING PLS READ !!=jab hum refresh kar rahe page,har baar ek naya nano id generate hoke connected mein store ho jate hai,usko hi prevent kar rahe

//USER IS ALLOWED TO JOIN ROOM BECAUSE WAS PRESENT IN ROOM ALREADY EVEN AFTER REFRESH
if(existingToken&&meta.connected.includes(existingToken)){
    return NextResponse.next()//allow connection
}

//USER NOT ALLOWED ROOM IS FULL OR USER NOT IN CONNECTED

if(meta.connected.length>=2){
    return NextResponse.redirect(new URL("/?error=room-full",req.url))//sending back to home page with error room full
}



//authenticating users based on arbitary tokens
const response=NextResponse.next()
//yeh line sirf proxy.ts mein ho sakti hai,it is like proxy bol raha meine sab check karliya all good all well,ab return hojao
/*
“I checked the request. Nothing to block. Let it go through.”
If you don’t write it (or don’t return it), the request stops. 
*/

//attaching cookie to response

const token=nanoid()
response.cookies.set("x-auth-token",token,{

    path:"/",
    httpOnly:true,//security practices hackers se chupayega
    secure:process.env.NODE_ENV==="production",//local host ke waqt false no seucrity needed,production mein true tab securitty chayie,The secure attribute in cookies is a security flag that determines whether the cookie should only be sent over HTTPS connections.
    sameSite:"strict",//only use cookie for this website not for other

})

//connected array mein user ki entry kar rahe 
await redis.hset(`meta:${roomId}`,{
connected:[...meta.connected,token],//adding new value in array,not using push because it creates new array
//...<-spread operator
})

return response

}
export const config ={
    matcher:"/room/:path*",//any room uske baad koi bhi path
}