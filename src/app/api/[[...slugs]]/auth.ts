import { redis } from "@/lib/redis"
import Elysia from "elysia"

 class AuthError extends Error{
    constructor (message:string){
        super(message)
        this.name="AuthError"
    }
 }//creates custom error type AuthError that extends javascript built in error class

 export const authMiddleWare =new Elysia({
    name:"auth"})
    .error({AuthError})//it is saying like elysia,i have this custom error type that i might throw in my  routes and i want you to recoginize it.
    .onError(({code,set})=>{//elysia when catches error,checks is it autherror?->YES,sets code="AuthError" and then extracts error.message ="User not logged in"
        if(code==="AuthError"){//eleysia calls onError handler and checks is code ===AuthError <-YES
            set.status=401//change status code from 200 to 401
            return{error:"Unauthorized"}//this becomes the response body
        }
    })//main MIDDLEWARE LOGIC STARTS BELOW THIS,
    .derive({as:"scoped"},async ({query,cookie})=>{//<-elysia automatically extracts query and cookie
        const roomId=query.roomId//<-extracts roomId
        const token =cookie["x-auth-token"].value as string | undefined//looks for cookie named "x-auth-token"
    if(!roomId || !token){
        throw new AuthError("Missing roomId or token.")
    }
    const connected=await redis.hget<string[]>(`meta:${roomId}`,"connected")//connected=fieldname,meta${roomId} is KEY NAME

    if(!connected?.includes(token)){//IN CONNECTED ARRAY CHECKS IF USER KA TOKEN IS present or not
        throw new AuthError("Invalid token")

        
    }
return {auth:{roomId,token,connected}}//now it returns derived data
/*
auth: {              // ← aisa return hoga to context body AB TO UNDERSTAND WHAT IS CONTEXT BODY GO TO NOTEBOOK USME ACHE SE LIKHA HAI IMPORTANT HAI BASICS HAI
    roomId: "room_123",
    token: "token_abc",
    connected: ["token_abc", "token_xyz"]
  }
*/
    })
   //.derive is like before route handler or like chef starts cooking
   //it take required data like cookies,headers,processes them
   //like validate token,fetches user data
   //prepare ready to use items (user object,roomID)
   //handles them to the chef on a clean plate (context object)

   //in my code we are first extracting roomId from url query
   //extract auth token from cookie
   //and then 
 