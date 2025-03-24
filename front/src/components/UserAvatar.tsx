import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

interface UserAvatarProps {
  user: {
    username?: string;
    displayName?: string;
    avatar?: string;
  };
  className?: string;
}

export const UserAvatar = ({ user, className }: UserAvatarProps) => {
  const { username, displayName, avatar } = user;

  // 获取显示名称的首字母作为头像占位符
  const getInitials = () => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    
    return "U";
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={avatar || ""} alt={displayName || username || "用户"} />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}; 
