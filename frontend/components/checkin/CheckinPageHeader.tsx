import { Calendar } from "lucide-react";

export const CheckinPageHeader = () => (
    <div className="flex flex-col items-start px-4 lg:px-8">
        <h1 className="text-xl font-bold">Daily Check-in</h1>
        <p className="text-muted-foreground">
            Share your mood and day with your partner
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="bg-card inset-shadow-sm px-2 py-1 rounded text-foreground font-medium">
                {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </span>
        </div>
    </div>
);
