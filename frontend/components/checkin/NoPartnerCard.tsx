import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MessageCircle } from "lucide-react";

export const NoPartnerCard = () => (
    <Card.Card className="w-full flex flex-col">
        <Card.CardHeader>
            <Card.CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Partner Connection
            </Card.CardTitle>
        </Card.CardHeader>
        <Card.CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Connect with a partner to share daily check-ins</p>
                <p className="text-sm">
                    Go to your profile to manage connections
                </p>
                <Button
                    variant="outline"
                    className="mt-4 bg-background dark:bg-background"
                    onClick={() => (window.location.href = "/profile")}
                >
                    Go to Profile
                </Button>
            </div>
        </Card.CardContent>
    </Card.Card>
);
