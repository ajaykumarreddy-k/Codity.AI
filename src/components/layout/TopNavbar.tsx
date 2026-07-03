import { Bell, Search, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TopNavbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-24 bg-transparent flex items-center justify-between px-6 md:px-10 lg:px-12 shrink-0 z-10 relative">
      <div className="flex items-center w-full max-w-md gap-2">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search task" 
            className="w-full pl-11 bg-card border border-black/5 dark:border-white/5 h-12 text-sm rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-visible:ring-4 focus-visible:ring-primary/10 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Select defaultValue="production">
          <SelectTrigger className="w-[140px] h-12 rounded-full border border-black/5 dark:border-white/5 bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm font-medium px-4 hover:bg-card/90 transition-colors">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="development">Development</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground h-12 w-12 rounded-full bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/5 dark:border-white/5 hover:bg-card/90 transition-all"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground h-12 w-12 rounded-full bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/5 dark:border-white/5 hover:bg-card/90 transition-all">
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-12 rounded-full inline-flex shrink-0 items-center justify-center gap-3 pl-2 pr-5 bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/5 dark:border-white/5 hover:bg-card/90 focus-visible:ring-4 focus-visible:ring-primary/10 outline-none transition-all cursor-pointer">
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">A</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium tracking-tight">Admin</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 z-50" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">demo@codity.ai</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
              onClick={() => window.location.href = '/login'}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
