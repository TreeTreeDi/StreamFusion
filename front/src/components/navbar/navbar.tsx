import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Bell, Search } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";

export function Navbar() {
  return (
    <div className="fixed top-0 w-full h-14 z-10 bg-[#18181b] border-b border-[#303032] shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        <Link href="/">
          <div className="text-2xl font-bold text-[#a970ff]">
            TwitchClone
          </div>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-x-4">
          <Link href="/browse">
            <Button variant="ghost" className="hover:text-[#a970ff] hover:bg-background/10">浏览</Button>
          </Link>
          <Link href="/following">
            <Button variant="ghost" className="hover:text-[#a970ff] hover:bg-background/10">关注</Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 ml-auto">
          <div className="relative w-full max-w-[400px] hidden md:block mx-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索" 
              className="w-full pl-9 bg-[#2c2c2f] border-none focus-visible:ring-0 focus-visible:ring-transparent" 
            />
          </div>
        </div>
        
        {/* User Actions */}
        <div className="flex items-center gap-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-[#a970ff] hover:bg-background/10 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </Button>
          <AuthButton />
        </div>
      </div>
    </div>
  );
} 
