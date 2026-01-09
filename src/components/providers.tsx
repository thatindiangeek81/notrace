"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RealtimeProvider } from "@upstash/realtime/client"
import { useState } from "react"

export const Providers =({
    children,
}:{
    children:React.ReactNode
}) =>{
    
    const [queryClient_var]=useState (()=>{
        return new QueryClient();
    }       
) //VERY IMPORTANT TO UNDERSTAND WRITTERN BELOW IN DEPTH


//ab we want to use queryclient that we created in dirrent components uske liye we need queryclientprovider

return(
    <RealtimeProvider><QueryClientProvider client={queryClient_var}>
       {children} 
    </QueryClientProvider>{/*iske andar woh components daalege jo queryClient_var use karege*/}
    </RealtimeProvider>/*1:59:38*/
);
}










/*LINE 7 KA EXPLANATION
const [variable ka naam hai bas(QueryClient hamare case mein)]=useState (()=>new QueryClient()) 

---EXPLANATION----

yeh line mein 2 chize hai ek hai queryclient() aur dusra hai UseState

mota mota yeh line yeh chati hai hamara jo queryclient() ka function hai woh baar baar har new render par naya create nah ho
and har re render par already jo stored hai woh return karde

const[variable_name]<-this is where it is getting stored
so basically page jab first time load hoga tab isme


-----IMPORTANT---
//what is queryclient?->screenshot check whatsapp 29-12-25 5:05am 
-----------------

"We are using useState so we can store and not re-render or update in every re-render"

without useState:
const queryClient = new QueryClient(); // Creates NEW one every re-render ❌
With useState:
javascriptconst [queryClient] = useState(() => new QueryClient()); // Creates ONCE, reuses same one ✅

-------------------END-------------------



---------why use <query-client-Provider>-------------

Without QueryClientProvider:

Your components wouldn't know which QueryClient to use. They'd be lost.

With QueryClientProvider:

All your components can use useQuery and they all share the same QueryClient.
--------------END-----------------
*/ 