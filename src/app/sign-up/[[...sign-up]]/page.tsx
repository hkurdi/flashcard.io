import { NavBar } from "@/components/ui/navbar";
import { SignUp } from "@clerk/nextjs";

export default function Page () {

    return (
    <div className="relative">
      <NavBar isNormal={false} />
      <div className="min-h-screen w-full flex flex-col justify-center items-center">
        <SignUp />
      </div>
    </div>
    )    
}