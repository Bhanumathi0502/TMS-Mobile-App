import React,{createContext,useContext,useEffect,useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext=createContext(null);
const light={dark:false,background:"#F8FAFC",surface:"#FFFFFF",surfaceSoft:"#F8FAFC",text:"#0F172A",muted:"#64748B",border:"#E2E8F0",input:"#F8FAFC",primary:"#315D8A"};
const dark={dark:true,background:"#0B1220",surface:"#111827",surfaceSoft:"#172033",text:"#F8FAFC",muted:"#94A3B8",border:"#334155",input:"#0F172A",primary:"#60A5FA"};
export function ThemeProvider({children}){const [mode,setMode]=useState("light");useEffect(()=>{AsyncStorage.getItem("tms_theme").then(v=>v&&setMode(v)).catch(()=>{});},[]);const toggle=async v=>{const next=v?"dark":"light";setMode(next);await AsyncStorage.setItem("tms_theme",next)};return <ThemeContext.Provider value={{mode,dark:mode==="dark",colors:mode==="dark"?dark:light,toggle}}>{children}</ThemeContext.Provider>}
export const useTheme=()=>useContext(ThemeContext);
