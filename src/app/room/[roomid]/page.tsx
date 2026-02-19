"use client";

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime-client";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";



function formatTimeRemaining(seconds:number){
    const mins=Math.floor(seconds/60);
    const secs=seconds%60;
    //jaise 121 seconds hai,mins=2 and secs=1
    return`${mins}:${secs.toString().padStart(2,"0")}`
}



const Page =()=>{
//to get room ki id we use "useParams"
//it is fetching roomId from url of page
const params= useParams();
const roomId=params.roomid as string;
const {username}=useUsername();

const router=useRouter()
//function for copying room-code


//jab user copy karle toh button copy se copied hojaye

const [copyStatus,setCopyStatus]=useState("COPY")


const[input,setInput]=useState("")
const inputRef=useRef<HTMLInputElement>(null)

const [timeRemaining,setTimeRemaining]=useState<number | null>(null)//can be number or null,by deafult null

const {data: ttlData}=useQuery({
    queryKey:["ttl",roomId],
    queryFn:async()=>{
        const res=await client.room.ttl.get({query:{roomId}})
        return res.data
    }
})

useEffect(()=>{
   if(ttlData?.ttl!=undefined) 
    setTimeRemaining(ttlData.ttl)
},[ttlData])

useEffect(()=>{
    if(timeRemaining===null || timeRemaining<0) 
        return
    if(timeRemaining===0) {
         router.push("/?destroyed=true")
         return
    }
    
    const interval =setInterval(()=>{
        setTimeRemaining((prev)=>{
            if(prev===null || prev<=1){
                clearInterval(interval)
                return 0
            }
            return prev-1
        })
       
    },1000)
        return()=>clearInterval(interval)

},[timeRemaining,router])

const {data:messages ,refetch}=useQuery({
    queryKey:["messages",roomId],
    queryFn:async()=>{
        const res=await client.messages.get({//hum log backedn se messages mangwa rahe hai
            query:{roomId}   
        })
         return res.data
    },
})
//

const {mutate:sendMessage,isPending: isSending}=useMutation({
    mutationFn:async ({text}:{text:string})=>{
        await client.messages.post({sender:username,text},{query:{roomId}})
        setInput("")
    }
}
)

useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({event, data}) => {
        console.log("Event received:", event, data); // Add this
        if(event === "chat.message"){
            console.log("Refetching..."); // And this
            refetch()
        }
        if(event === "chat.destroy"){//sending back user to lobby
            router.push("/?destroyed=true")
        }
    },
})


const{mutate:destroyRoom}=useMutation({
    mutationFn:async ()=>{
        await client.room.delete(null,{query :{roomId}})
    }
})

const copyLink = () =>{
    const url= window.location.href//current url de deta hai
    navigator.clipboard.writeText(url)
    setCopyStatus("COPIED!")
    setTimeout(()=>setCopyStatus("COPY"),3000)
}
  
return <main className="flex flex-col h-screen max-h-screen overflow-hidden">
<header className="border-b border-zinc-800 p-3 md:p-4 bg-zinc-900/30">
{/* Mobile Layout */}
<div className="flex flex-col gap-3 md:hidden">
  <div className="flex items-center justify-between gap-2">
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] text-zinc-500 uppercase">ROOM ID</span>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-green-500 text-sm truncate">{roomId}</span>
        <button onClick={copyLink} className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors whitespace-nowrap">
          {copyStatus}
        </button>
      </div>
    </div>
    
    <div className="flex flex-col items-end">
      <span className="text-[10px] text-zinc-500 uppercase">Self-Destruct</span>
      <span className={`text-sm font-bold ${timeRemaining !==null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}`}>
        {/* if time less than 60 sec make it red warna amber color*/}
        {timeRemaining!==null?formatTimeRemaining(timeRemaining):"--:--"}  
      </span>
    </div>
  </div>
  
  <button onClick={()=>destroyRoom()} className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-2 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center justify-center gap-2 disabled:opacity-50 w-full">
    <span className="group-hover:animate-pulse">💣</span>
    DESTROY NOW!
  </button>
</div>

{/* Desktop Layout */}
<div className="hidden md:flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="flex flex-col">
<span className="text-xs text-zinc-500 uppercase">
ROOM ID
</span>
<div className="flex items-center gap-2">
<span className="font-bold text-green-500">
{roomId}
</span>
<button onClick={copyLink}className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors">
{copyStatus}
</button>
</div>
</div>

<div className="h-8 w-px bg-zinc-800"/>
{/* isse bas ek "|" aisi line aayegi */}
<div className="flex flex-col">
<span className="text-xs text-zinc-500 uppercase">
    Self-Destruct
    </span>
    <span className={`text-sm font-bold  flex items-center gap-2 ${timeRemaining !==null && timeRemaining < 60 ? "text-red-500" : "text-amber-500"}`}>
        {/* if time less than 60 sec make it red warna amber color*/}

        {timeRemaining!==null?formatTimeRemaining(timeRemaining):"--:--"}  
</span>

</div>
</div>

<button onClick={()=>destroyRoom()}className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50">
<span className="group-hover:animate-pulse">💣</span>
DESTROY NOW!

</button>
</div>

</header>


{/* idhar messages display karege */}
<div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 scrollbar-thin">
{messages?.messages.length===0 && (
    <div className="flex items-center justify-center h-full">
<p className="text-zinc-600 text-sm font-mono">No messages yet,start the conversation</p>

    </div>
)}

{messages?.messages.map((msg)=>(
<div key={msg.id} className="flex flex-col items-start">
    <div className="max-w-[90%] md:max-w-[80%] group">
        <div className="flex items-baseline gap-2 md:gap-3 mb-1">
            <span className={`text-xs font-bold ${msg.sender===username ?"text-green-500" :"text-blue-500"}`}>
                {msg.sender===username ? "YOU":msg.sender}
            </span>
            <span className="text-[10px] text-zinc-600">
                {format(new Date(msg.timestamp), 'p')}
            </span>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed break-all">

            {msg.text}

        </p>

    </div>
</div>
))}
</div>

<div className="p-3 md:p-4 border-t border-zinc-800 bg-zinc-900/30">
<div className="flex gap-2 md:gap-4">
<div className="flex-1 relative group">
<span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">
    {">"}
</span>
<input autoFocus value={input}  onKeyDown ={(e)=>{if(e.key==="Enter"&& input.trim()){
    sendMessage({text:input})
    inputRef.current?.focus()
}}

}placeholder={"Type Message :>"}onChange={(e)=>setInput(e.target.value)} type="text"className="w-full bg-black border border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-2.5 md:py-3 pl-7 md:pl-8 pr-3 md:pr-4 text-sm" />
</div>
<button onClick={()=>{
    sendMessage({text:input})
    inputRef.current?.focus()
    }}
    disabled={!input.trim() || isSending}
    className="bg-zinc-800 text-zinc-400 px-4 md:px-6 text-xs md:text-sm font-bold hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{isSending ? "Sending..." : "SEND"}</button>
</div>
</div>
</main>
}

export default Page