import { Mail } from "lucide-react";

interface ProfileHeaderProps {
    name: string | null | undefined;
    email: string | null | undefined;
}

export const ProfileHeader = ({ name, email }: ProfileHeaderProps) => {
    return (
        <div className="flex flex-col px-4 lg:px-8">
            <h1 className="text-xl font-bold">{name || "User"}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
            </div>
        </div>
    );
};
