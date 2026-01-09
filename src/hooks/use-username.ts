import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

export const useUsername=()=>{
    const [username,setUserName]=useState("");

    const ANIMALS =["wolf","hog","bear","shark","bear","tiger"]

const STORAGE_KEY="chat_username"

const generateUserName=()=>{
  const word=ANIMALS[Math.floor(Math.random()*ANIMALS.length)]
  return `anonymous-${word}-${nanoid(5)}`
}
    //---------------------------------------------------------------------------------------------------------
    //Think of useEffect as a "Do This After Rendering" Command
    //React components render (draw stuff on screen) and then useEffect says: 
    //"Hey, after you're done drawing, do this extra thing"
    useEffect(() => {
      const main = () => {
        
        // STEP 1: Check if username already exists in browser
        const stored = localStorage.getItem(STORAGE_KEY);
        // Tries to get saved username from browser's localStorage
        
        // STEP 2: If username exists, use it
        if (stored) {
          setUserName(stored);  // Set the saved username
          return;               // Exit early, we're done!
        }
        
        // STEP 3: If no username exists, create a new one
        const generated = generateUserName();
        // Calls a function to generate a random username
        
        // STEP 4: Save the new username to browser
        localStorage.setItem(STORAGE_KEY, generated);
        
        // STEP 5: Update React state with new username
        setUserName(generated);
      }
      
      main(); // Execute the function
    }, []);// ← This controls WHEN it runs
    
    //Dependency Array ,When It Runs,Example
    
    //[] (empty), Once when component loads, Setup code, fetch data once
    //[username], Every time username changes, Save to localStorage when username changes
    //------------------------------------------------------------------------------------------------------
    return {username}
}