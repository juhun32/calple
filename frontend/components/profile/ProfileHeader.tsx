import { ProfileHeaderProps } from "@/lib/types/profile";
import { Mail } from "lucide-react";

export const ProfileHeader = ({ name, email }: ProfileHeaderProps) => {
    return (
        <div className="flex flex-col px-4 lg:px-8">
            <h1 className="text-xl font-bold">{name || "User"}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{email}</span>
            </div>
        </div>
    );
};
