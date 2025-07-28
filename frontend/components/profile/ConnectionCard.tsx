import * as Card from "@/components/ui/card";
import { Users } from "lucide-react";
import { ConnectionManager } from "@/components/profile/ConnectionHandler";

export const ConnectionCard = () => {
    return (
        <Card.Card className="gap-4">
            <Card.CardHeader>
                <Card.CardTitle className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    Connect with your partner
                </Card.CardTitle>
                <Card.CardDescription className="text-sm">
                    Manage your calendar connection with your partner
                </Card.CardDescription>
            </Card.CardHeader>
            <Card.CardContent>
                <ConnectionManager />
            </Card.CardContent>
        </Card.Card>
    );
};
