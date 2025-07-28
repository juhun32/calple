// compontents
import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Venus, Mars } from "lucide-react";

// utils
import { cn } from "@/lib/utils";

// types
import { GenderSettingsCardProps } from "@/lib/types/profile";

export const GenderSettingsCard = ({
    userSex,
    isLoading,
    onSexChange,
}: GenderSettingsCardProps) => {
    return (
        <Card.Card className="gap-4">
            <Card.CardHeader>
                <Card.CardTitle className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Tell us about yourself
                </Card.CardTitle>
                <Card.CardDescription className="text-sm">
                    This setting controls period data visibility and editing
                    permissions
                </Card.CardDescription>
            </Card.CardHeader>
            <Card.CardContent>
                <div className="flex gap-4 mb-2">
                    <Button
                        variant={"outline"}
                        onClick={() => onSexChange("female")}
                        disabled={isLoading}
                        className={cn(
                            `flex items-center gap-2 rounded-full border-none`,
                            userSex === "female"
                                ? "bg-accent dark:bg-accent"
                                : "bg-background dark:bg-background"
                        )}
                    >
                        <Venus className="w-4 h-4" />
                        Female
                    </Button>
                    <Button
                        variant={"outline"}
                        onClick={() => onSexChange("male")}
                        disabled={isLoading}
                        className={cn(
                            `flex items-center gap-2 rounded-full border-none`,
                            userSex === "male"
                                ? "bg-accent dark:bg-accent"
                                : "bg-background dark:bg-background"
                        )}
                    >
                        <Mars className="w-4 h-4" />
                        Male
                    </Button>
                </div>
                {userSex && (
                    <Badge
                        variant="outline"
                        className="w-fit bg-background dark:bg-background inset-shadow-sm border-none"
                    >
                        Current Setting :{" "}
                        {userSex === "female" ? "Female" : "Male"}
                    </Badge>
                )}
            </Card.CardContent>
        </Card.Card>
    );
};
