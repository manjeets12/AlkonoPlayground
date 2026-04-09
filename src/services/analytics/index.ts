import { trackGA } from "./ga"

export const trackEvent =(event:string)=>{
    trackGA(event)
}