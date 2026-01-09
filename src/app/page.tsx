"use client";
import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";



//this is taki agar ek user ne ek baar apna jo bhi hai 
// woh bana liya hai and 
// user agar refresh kare toh usko 
// naya id yah name yah jo bhi hai woh nah mile


const Page=()=>{
return <Suspense>
  <Lobby/>
</Suspense>
}



function Lobby() {
  const{username}=useUsername()



  const router = useRouter();

  const searchParams=useSearchParams()
  const wasDestroyed=searchParams.get("destroyed")==="true"
  const error=searchParams.get("error")
// yeh jo upar searchPaRAMS hai yeh basically url jo hai usme se dhundhega ki kya hamare paas jo url hai usme destroy naam ka wrod hai yah error naam ka word hai





//use mutation is->It's a special function that helps you manage "actions that change data" (like creating, updating, deleting)
//UseMutation mein bohot saari chize hai ->mutate,isPending,isError,data
//muate property renaming to createRoom
//mutate->is a function that triggers your mutation(runs your mutationFn)
//we will add to button of --"create secure room"--
//mutationFn: = a property name - this tells useMutation "here's the function you should run when I want to mutate data"
const{mutate:createRoom}=useMutation({
  mutationFn :async()=>{
    const res=await client.room.create.post()
  //this is like front end is sending letter to backend(elysia),elysia recieves it,process it,and send a reply back
 //client is auto generated object by elysia,it is like starting point

  if (res.data && res.data.roomId) { // Check both exist
      router.push(`/room/${res.data.roomId}`);
    } else {
      console.error('Failed to create room');
    }
 
  },
})





/*
const res = await client.room.create.post()
// res = { success: true }
```

---

## 📊 Visual Flow Diagram
```
FRONTEND (React)                    BACKEND (Elysia Server)
┌─────────────────┐                ┌──────────────────┐
│  User clicks    │                │                  │
│  button         │                │                  │
└────────┬────────┘                │                  │
         │                         │                  │
         ▼                         │                  │
┌─────────────────┐                │                  │
│  mutate()       │                │                  │
│  is called      │                │                  │
└────────┬────────┘                │                  │
         │                         │                  │
         ▼                         │                  │
┌─────────────────┐                │                  │
│ client.room     │  HTTP Request  │                  │
│ .create.post()  │───────────────>│  Receives at     │
│                 │  POST /api/    │  POST /api/room/ │
│                 │  room/create   │  create          │
└────────┬────────┘                └────────┬─────────┘
         │                                  │
         │                                  ▼
         │                         ┌──────────────────┐
         │                         │ Handler runs:    │
         │                         │ console.log()    │
         │                         │ Create room in DB│
         │                         └────────┬─────────┘
         │                                  │
         │         HTTP Response            │
         │  { success: true, room: {...} }  │
         │<─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  res = response │
│  TanStack Query │
│  stores in data │
└─────────────────┘



client.room.create.post() is NOT loading a webpage like when you click a link.
It's making a data transfer in the background:

Frontend sends data to backend
Backend processes it
Backend sends response
Frontend receives response
All while staying on the same page!
*/ 





return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">

      <div className="w-full max-w-md space-y-8">
        {wasDestroyed && <div className="bg-red-950/50 border border-red-900 p-4 text-center">
  <p className="text-sm text-red-500 font-bold">
    ROOM DESTROYED
  </p>
  <p className="text-zinc-500 text-xs mt-1">
    All messages were permanently deleted.
  </p>
</div>}

{error==="room-not-found" && <div className="bg-red-950/50 border border-red-900 p-4 text-center">
  <p className="text-sm text-red-500 font-bold">
    ROOM NOT FOUND
  </p>
  <p className="text-zinc-500 text-xs mt-1">
    This room may have been expired or never existed.
  </p>
</div>}

{error==="room-full" && <div className="bg-red-950/50 border border-red-900 p-4 text-center">
  <p className="text-sm text-red-500 font-bold">
    ROOM FULL
  </p>
  <p className="text-zinc-500 text-xs mt-1">
    This room is at maximum capacity.
  </p>
</div>}
       <div className="text-center space-y-2">
  <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
    NoTrace
  </h1>
  <p className="text-sm text-zinc-500">A private self-destructing chat room.</p>
</div>
        <div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center text-zinc-500">Your Identity</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono">
                {username}
              </div>
            </div>
          </div>
          <button onClick={()=>createRoom()} className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50">
            CREATE SECURE ROOM
          </button>
        </div>
        </div>
      </div>
    </main>
            
  );
  
}

export default Page



/*

**What it does visually:**
- This is what **LOOKS like an input box** but it's actually just a `<div>`
- `flex-1` makes it **stretch to fill available space**
- Has a **very dark background** (almost black)
- Has a **dark gray border**
- Adds **padding inside**
- Text would be **small, gray, and monospace font** (like code)
- Currently **empty** because `{username}` is commented out

**Think of it as:** A fake input box that's actually just displaying text (or will display text)

---

## Visual Summary:
```
┌─ DIV 1 (main) ────────────── FULL SCREEN, CENTERS EVERYTHING ─┐
│                                                                 │
│         ┌─ DIV 2 ─────── LIMITS WIDTH ─────┐                  │
│         │                                    │                  │
│         │  ┌─ DIV 3 ──── THE VISIBLE CARD ─┐ │                  │
│         │  │                               │ │                  │
│         │  │  ┌─ DIV 4 ── ADDS SPACING ──┐│ │                  │
│         │  │  │                          ││ │                  │
│         │  │  │ ┌─ DIV 5 ─ LABEL+INPUT ┐││ │                  │
│         │  │  │ │ "Your Identity"      │││ │                  │
│         │  │  │ │                       │││ │                  │
│         │  │  │ │ ┌─ DIV 6 ─ ROW ────┐ │││ │                  │
│         │  │  │ │ │                  │ │││ │                  │
│         │  │  │ │ │ ┌─ DIV 7 ─ BOX ┐ │ │││ │                  │
│         │  │  │ │ │ │  (empty box) │ │ │││ │                  │
│         │  │  │ │ │ └──────────────┘ │ │││ │                  │
│         │  │  │ │ └──────────────────┘ │││ │                  │
│         │  │  │ └──────────────────────┘││ │                  │
│         │  │  │                          ││ │                  │
│         │  │  │  <BUTTON>               ││ │                  │
│         │  │  └──────────────────────────┘│ │                  │
│         │  └───────────────────────────────┘ │                  │
│         └────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘

*/