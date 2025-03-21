
import { UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface ProfileSectionProps {
  userEmail?: string | null;
  onSignOut: () => void;
}

export function ProfileSection({
  userEmail,
  onSignOut
}: ProfileSectionProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link to="/profile" className="flex items-center gap-4 rounded-md px-5 py-6 hover:text-white group">
          <div className="relative z-10">
            <UserRound className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="relative z-10 text-[15px] font-medium">
              My Profile
            </span>
            {userEmail && <span className="text-xs text-muted-foreground group-hover:text-black transition-colors">{userEmail}</span>}
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
