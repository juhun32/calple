// components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

// utils
import { cn } from "@/lib/utils";

// constants/types
import {
    moodOptions,
    energyOptions,
    sexualMoodOptions,
} from "@/lib/constants/checkin";
import type { CheckinFormProps } from "@/lib/types/checkin";

export const CheckinForm = ({
    formState,
    formSetters,
    isSubmitting,
    handleSubmit,
}: CheckinFormProps) => {
    const { currentMood, currentEnergy, currentSexualMood, note } = formState;
    const { setCurrentMood, setCurrentEnergy, setCurrentSexualMood, setNote } =
        formSetters;

    return (
        <div className="space-y-4">
            {/* Mood Selection */}
            <div>
                <h3 className="font-medium mb-3">How are you feeling today?</h3>
                <div className="grid grid-cols-5 gap-2">
                    {moodOptions.map((mood) => (
                        <Button
                            key={mood.value}
                            variant="outline"
                            className={cn(
                                "flex flex-col items-center gap-1 h-auto p-3",
                                currentMood === mood.value
                                    ? "bg-accent dark:bg-accent"
                                    : "bg-background dark:bg-background"
                            )}
                            onClick={() => setCurrentMood(mood.value as any)}
                        >
                            <mood.icon className={cn("w-4 h-4", mood.color)} />
                            <span className="text-xs">{mood.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Energy Level */}
            <div>
                <h3 className="font-medium mb-3">
                    How's your energy level today?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {energyOptions.map((energy) => (
                        <Button
                            key={energy.value}
                            variant="outline"
                            className={cn(
                                "flex flex-col items-center gap-1 h-auto p-3",
                                currentEnergy === energy.value
                                    ? "bg-accent dark:bg-accent"
                                    : "bg-background dark:bg-background"
                            )}
                            onClick={() =>
                                setCurrentEnergy(energy.value as any)
                            }
                        >
                            <energy.icon
                                className={cn("w-4 h-4", energy.color)}
                            />
                            <span className="text-xs">{energy.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Sexual Mood */}
            <div>
                <h3 className="font-medium mb-3">
                    Are you in the mood today? (Optional)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {sexualMoodOptions.map((sexualMood) => (
                        <Button
                            key={sexualMood.value}
                            variant="outline"
                            className={cn(
                                "flex flex-col items-center gap-1 h-auto p-3",
                                currentSexualMood === sexualMood.value
                                    ? "bg-accent dark:bg-accent"
                                    : "bg-background dark:bg-background"
                            )}
                            onClick={() =>
                                setCurrentSexualMood(sexualMood.value as any)
                            }
                        >
                            <sexualMood.icon
                                className={cn("w-4 h-4", sexualMood.color)}
                            />
                            <span className="text-xs">{sexualMood.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Note */}
            <div>
                <h3 className="font-medium mb-3">Add a note (Optional)</h3>
                <Textarea
                    placeholder="Share something about your day..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px] resize-none bg-background dark:bg-background inset-shadow-sm"
                    maxLength={500}
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                    {note.length}/500
                </div>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={!currentMood || !currentEnergy || isSubmitting}
                className="w-full"
                size="lg"
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Share with Partner
                    </>
                )}
            </Button>
        </div>
    );
};
