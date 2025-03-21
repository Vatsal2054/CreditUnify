"use client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT_ADMIN, DEFAULT_LOGIN_REDIRECT_BANK, DEFAULT_LOGIN_REDIRECT_USER } from "@/routes";
import { use, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useCurrentUserClient } from "@/hooks/use-current-user";

export const Social = ({disabled,setDisabled}:{disabled:boolean,setDisabled:any}) => {
  const [googlePassword, setgooglePassword] = useState<boolean>(false);
  const {theme} = useTheme();
  const [Theme,setTheme] = useState<string>(theme as string);
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl")
  const user = useCurrentUserClient();
  const onClick = () => {
    // setDisabled(true);
    setgooglePassword(true);
    try{
      if(!user)
        return null;
      let redirecturl="";
      if(user.role==="USER"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_USER;
      }else if(user.role==="ADMIN"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_ADMIN;
      }else if(user.role==="BANK"){
        redirecturl=DEFAULT_LOGIN_REDIRECT_BANK;
      }
      signIn("google",{
        callbackUrl:redirecturl
      });
  }catch(e){
    console.error("Error: ",e);
  }

    // setDisabled(false);
  }
  return <>
      <div className="relative mt-4 w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex w-full justify-center text-xs uppercase">
          <span className="px-2 text-muted-foreground ligth: bg-sarthak_L dark:bg-sarthak_d">
            Or continue with
          </span>
        </div>
      </div>
      <div className='grid grid-cols-1 w-full' >
        <Button
          className="my-3 w-full mb-2" 
          onClick={()=>onClick()}
          variant={Theme=="dark" ?"ghost" :"outline"}
          disabled={disabled}
          >
          {googlePassword?<Loader2 className="mr-2 h-4 w-4 animate-spin" />:<FcGoogle className="mr-2 h-4 w-4" />}
            Google
        </Button>
      </div>
</>
}