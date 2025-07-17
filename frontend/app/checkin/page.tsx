"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Heart,
    Smile,
    Frown,
    Meh,
    Coffee,
    Sun,
    Moon,
    Star,
    Send,
    Calendar,
    Clock,
    User,
    MessageCircle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    CheckinData,
    PartnerCheckin,
    getUserMetadata,
    getPartnerMetadata,
    getTodayCheckin,
    createCheckin,
    deleteCheckin,
    getPartnerCheckin as getPartnerCheckinAPI,
} from "@/lib/api/checkin";

const moodOptions = [
    {
        value: "great",
        label: "Great",
        icon: Star,
        color: "text-yellow-500",
    },
    {
        value: "good",
        label: "Good",
        icon: Smile,
        color: "text-green-500",
    },
    {
        value: "okay",
        label: "Okay",
        icon: Meh,
        color: "text-blue-500",
    },
    {
        value: "bad",
        label: "Bad",
        icon: Frown,
        color: "text-orange-500",
    },
    {
        value: "terrible",
        label: "Terrible",
        icon: Heart,
        color: "text-red-500",
    },
];

const energyOptions = [
    {
        value: "high",
        label: "High Energy",
        icon: Sun,
        color: "text-yellow-500",
    },
    {
        value: "medium",
        label: "Medium Energy",
        icon: Coffee,
        color: "text-orange-500",
    },
    { value: "low", label: "Low Energy", icon: Moon, color: "text-blue-500" },
];

const sexualMoodOptions = [
    {
        value: "interested",
        label: "Interested",
        icon: Heart,
        color: "text-purple-500",
    },
    {
        value: "neutral",
        label: "Neutral",
        icon: Heart,
        color: "text-gray-500",
    },
    {
        value: "not_interested",
        label: "Not Interested",
        icon: Heart,
        color: "text-blue-500",
    },
];

export default function Checkin() {
    const { authState } = useAuth();
    const [currentMood, setCurrentMood] = useState<
        "great" | "good" | "okay" | "bad" | "terrible" | null
    >(null);
    const [currentEnergy, setCurrentEnergy] = useState<
        "high" | "medium" | "low" | null
    >(null);
    const [currentPeriod, setCurrentPeriod] = useState<
        "on" | "off" | "starting" | "ending" | null
    >(null);
    const [currentSexualMood, setCurrentSexualMood] = useState<
        | "very_horny"
        | "horny"
        | "interested"
        | "neutral"
        | "not_interested"
        | null
    >(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(null);
    const [partnerCheckin, setPartnerCheckin] = useState<PartnerCheckin | null>(
        null
    );
    const [hasPartner, setHasPartner] = useState(false);
    const [isRefreshingPartner, setIsRefreshingPartner] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    // Function to delete today's checkin
    const handleDeleteCheckin = async () => {
        if (!todayCheckin) return;

        setIsDeleting(true);
        try {
            await deleteCheckin(todayCheckin.date);
            setTodayCheckin(null);

            // reset form
            setCurrentMood(null);
            setCurrentEnergy(null);
            setCurrentPeriod(null);
            setCurrentSexualMood(null);
            setNote("");

            toast("Checkin deleted successfully.");
        } catch (error) {
            console.error("Failed to delete checkin:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to delete checkin";
            toast(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const loadPartnerData = useCallback(async (date?: string) => {
        setIsRefreshingPartner(true);
        try {
            console.log("=== Loading partner data ===");
            console.log("Loading partner metadata...");
            const partnerMeta = await getPartnerMetadata();
            console.log("Partner metadata loaded:", partnerMeta);
            setHasPartner(true);

            console.log("Loading partner checkin...");
            const partnerCheckin = await getPartnerCheckinAPI(date);
            console.log("Partner checkin loaded:", partnerCheckin);
            if (partnerCheckin) {
                setPartnerCheckin(partnerCheckin);
            } else {
                setPartnerCheckin(null);
            }
        } catch (error) {
            console.error("Error loading partner data:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });

            setHasPartner(false);
            setPartnerCheckin(null);
        } finally {
            setIsRefreshingPartner(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const todayCheckin = await getTodayCheckin();
                if (todayCheckin) {
                    setTodayCheckin(todayCheckin);
                    setCurrentMood(todayCheckin.mood);
                    setCurrentEnergy(todayCheckin.energy);
                    setCurrentPeriod(todayCheckin.periodStatus || null);
                    setCurrentSexualMood(todayCheckin.sexualMood || null);
                    setNote(todayCheckin.note || "");
                }

                await loadPartnerData();
            } catch (error) {
                console.error("Failed to load checkin data:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to load checkin data";
                toast(errorMessage, {
                    description:
                        "Please try refreshing the page or contact support if the issue persists.",
                });
            }
        };

        loadData();
    }, []);

    const handleSubmit = async () => {
        if (!currentMood || !currentEnergy) {
            return;
        }

        setIsSubmitting(true);

        try {
            const checkinData = {
                date: new Date().toLocaleDateString("en-CA"),
                mood: currentMood,
                energy: currentEnergy,
                periodStatus: currentPeriod || undefined,
                sexualMood: currentSexualMood || undefined,
                note: note.trim() || undefined,
            };

            const newCheckin = await createCheckin(checkinData);
            setTodayCheckin(newCheckin);

            // Reset form
            setCurrentMood(null);
            setCurrentEnergy(null);
            setCurrentPeriod(null);
            setCurrentSexualMood(null);
            setNote("");

            // Refresh partner data after submitting
            await loadPartnerData();

            toast("Checkin submitted successfully");
        } catch (error) {
            console.error("Failed to submit checkin:", error);
            toast("Failed to submit checkin");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="container mx-auto flex flex-col pt-20 pb-12 lg:pb-16 px-4 lg:px-8 gap-6 min-h-screen">
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

            <div className="flex items-stretch gap-4 flex-col lg:flex-row flex-1">
                <Card.Card className="w-full flex flex-col">
                    <Card.CardHeader>
                        <Card.CardTitle className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Your Today
                            {todayCheckin && (
                                <div className="ml-auto flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDeleteCheckin}
                                        disabled={isDeleting}
                                        className=""
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </Card.CardTitle>
                    </Card.CardHeader>
                    <Card.CardContent className="space-y-4 flex-1">
                        {todayCheckin ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <div className="font-medium">
                                        {authState.user?.name || "You"}
                                    </div>
                                    <div className="text-sm text-muted-foreground bg-background inset-shadow-sm px-2 py-1 rounded flex flex-row gap-1">
                                        <p className="hidden md:block">
                                            Checked in at
                                        </p>
                                        {formatTime(todayCheckin.createdAt)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="text-center p-2 rounded-lg bg-background inset-shadow-sm">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            My Mood
                                        </div>
                                        <div className="text-lg mb-2">
                                            {(() => {
                                                const moodOption =
                                                    moodOptions.find(
                                                        (m) =>
                                                            m.value ===
                                                            todayCheckin.mood
                                                    );
                                                const IconComponent =
                                                    moodOption?.icon;
                                                return IconComponent ? (
                                                    <IconComponent className="mx-auto w-4 h-4 text-muted-foreground" />
                                                ) : null;
                                            })()}
                                        </div>
                                        <div className="font-medium text-sm">
                                            {
                                                moodOptions.find(
                                                    (m) =>
                                                        m.value ===
                                                        todayCheckin.mood
                                                )?.label
                                            }
                                        </div>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-background inset-shadow-sm">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            My Energy Level
                                        </div>
                                        <div className="text-lg mb-2">
                                            {(() => {
                                                const energyOption =
                                                    energyOptions.find(
                                                        (e) =>
                                                            e.value ===
                                                            todayCheckin.energy
                                                    );
                                                const IconComponent =
                                                    energyOption?.icon;
                                                return IconComponent ? (
                                                    <IconComponent className="mx-auto w-4 h-4 text-muted-foreground" />
                                                ) : null;
                                            })()}
                                        </div>
                                        <div className="font-medium text-sm">
                                            {
                                                energyOptions.find(
                                                    (e) =>
                                                        e.value ===
                                                        todayCheckin.energy
                                                )?.label
                                            }
                                        </div>
                                    </div>
                                    {todayCheckin.sexualMood && (
                                        <div className="text-center p-2 rounded-lg bg-background inset-shadow-sm">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Up for intimacy?
                                            </div>
                                            <div className="text-lg mb-2">
                                                {(() => {
                                                    const sexualMoodOption =
                                                        sexualMoodOptions.find(
                                                            (s) =>
                                                                s.value ===
                                                                todayCheckin.sexualMood
                                                        );
                                                    const IconComponent =
                                                        sexualMoodOption?.icon;
                                                    return IconComponent ? (
                                                        <IconComponent className="mx-auto w-4 h-4 text-muted-foreground" />
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="font-medium text-sm">
                                                {
                                                    sexualMoodOptions.find(
                                                        (s) =>
                                                            s.value ===
                                                            todayCheckin.sexualMood
                                                    )?.label
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {todayCheckin.note && (
                                    <div className="p-4 rounded-lg bg-background inset-shadow-sm">
                                        <div className="font-medium text-sm mb-1">
                                            Note:
                                        </div>
                                        <div className="text-sm">
                                            {todayCheckin.note}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Show checkin form
                            <div className="space-y-4">
                                {/* Mood Selection */}
                                <div>
                                    <h3 className="font-medium mb-3">
                                        How are you feeling today?
                                    </h3>
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
                                                onClick={() =>
                                                    setCurrentMood(
                                                        mood.value as any
                                                    )
                                                }
                                            >
                                                <mood.icon
                                                    className={cn(
                                                        "w-4 h-4",
                                                        mood.color
                                                    )}
                                                />
                                                <span className="text-xs">
                                                    {mood.label}
                                                </span>
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
                                                    currentEnergy ===
                                                        energy.value
                                                        ? "bg-accent dark:bg-accent"
                                                        : "bg-background dark:bg-background"
                                                )}
                                                onClick={() =>
                                                    setCurrentEnergy(
                                                        energy.value as any
                                                    )
                                                }
                                            >
                                                <energy.icon
                                                    className={cn(
                                                        "w-4 h-4",
                                                        energy.color
                                                    )}
                                                />
                                                <span className="text-xs">
                                                    {energy.label}
                                                </span>
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
                                                    currentSexualMood ===
                                                        sexualMood.value
                                                        ? "bg-accent dark:bg-accent"
                                                        : "bg-background dark:bg-background"
                                                )}
                                                onClick={() =>
                                                    setCurrentSexualMood(
                                                        sexualMood.value as any
                                                    )
                                                }
                                            >
                                                <sexualMood.icon
                                                    className={cn(
                                                        "w-4 h-4",
                                                        sexualMood.color
                                                    )}
                                                />
                                                <span className="text-xs">
                                                    {sexualMood.label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Note */}
                                <div>
                                    <h3 className="font-medium mb-3">
                                        Add a note (Optional)
                                    </h3>
                                    <Textarea
                                        placeholder="Share something about your day..."
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
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
                                    disabled={
                                        !currentMood ||
                                        !currentEnergy ||
                                        isSubmitting
                                    }
                                    className="w-full"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Share with Partner
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </Card.CardContent>
                </Card.Card>

                {hasPartner && partnerCheckin && (
                    <Card.Card className="w-full flex flex-col">
                        <Card.CardHeader>
                            <Card.CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Partner's Today
                                <div className="ml-auto flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => loadPartnerData()}
                                        disabled={isRefreshingPartner}
                                    >
                                        <RefreshCw
                                            className={cn(
                                                "w-4 h-4",
                                                isRefreshingPartner &&
                                                    "animate-spin"
                                            )}
                                        />
                                    </Button>
                                </div>
                            </Card.CardTitle>
                        </Card.CardHeader>
                        <Card.CardContent className="flex-1">
                            {partnerCheckin ? (
                                <div className="space-y-4">
                                    <div>
                                        <div className="font-medium">
                                            {partnerCheckin.userName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Checked in at{" "}
                                            {formatTime(
                                                partnerCheckin.createdAt
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div className="text-center p-2 rounded-lg bg-card inset-shadow-sm">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Partner's Mood
                                            </div>
                                            <div className="text-lg mb-2">
                                                {(() => {
                                                    const moodOption =
                                                        moodOptions.find(
                                                            (m) =>
                                                                m.value ===
                                                                partnerCheckin.mood
                                                        );
                                                    const IconComponent =
                                                        moodOption?.icon;
                                                    return IconComponent ? (
                                                        <IconComponent className="mx-auto w-4 h-4 text-muted-foreground" />
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="font-medium text-sm">
                                                {
                                                    moodOptions.find(
                                                        (m) =>
                                                            m.value ===
                                                            partnerCheckin.mood
                                                    )?.label
                                                }
                                            </div>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-card inset-shadow-sm">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Partner's Energy Level
                                            </div>
                                            <div className="text-lg mb-2">
                                                {(() => {
                                                    const energyOption =
                                                        energyOptions.find(
                                                            (e) =>
                                                                e.value ===
                                                                partnerCheckin.energy
                                                        );
                                                    const IconComponent =
                                                        energyOption?.icon;
                                                    return IconComponent ? (
                                                        <IconComponent className="mx-auto w-4 h-4 text-muted-foreground" />
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="font-medium text-sm">
                                                {
                                                    energyOptions.find(
                                                        (e) =>
                                                            e.value ===
                                                            partnerCheckin.energy
                                                    )?.label
                                                }
                                            </div>
                                        </div>
                                        {/* Sexual mood */}
                                        {partnerCheckin.sexualMood && (
                                            <div className="text-center p-2 rounded-lg bg-card inset-shadow-sm">
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    Up for Intimacy?
                                                </div>
                                                <div className="text-lg mb-2">
                                                    {(() => {
                                                        const sexualMoodOption =
                                                            sexualMoodOptions.find(
                                                                (s) =>
                                                                    s.value ===
                                                                    partnerCheckin.sexualMood
                                                            );
                                                        const IconComponent =
                                                            sexualMoodOption?.icon;
                                                        return IconComponent ? (
                                                            <IconComponent className="mx-auto w-4 h-4 text-muted-foreground" />
                                                        ) : null;
                                                    })()}
                                                </div>
                                                <div className="font-medium text-sm">
                                                    {
                                                        sexualMoodOptions.find(
                                                            (s) =>
                                                                s.value ===
                                                                partnerCheckin.sexualMood
                                                        )?.label
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Note */}
                                    {partnerCheckin.note && (
                                        <div className="p-4 rounded-lg bg-muted/50 inset-shadow-sm">
                                            <div className="font-medium text-sm mb-1">
                                                Note:
                                            </div>
                                            <div className="text-sm">
                                                {partnerCheckin.note}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>
                                        Your partner hasn't checked in yet today
                                    </p>
                                    <p className="text-sm">
                                        They'll appear here once they share
                                        their mood
                                    </p>
                                </div>
                            )}
                        </Card.CardContent>
                    </Card.Card>
                )}

                {!hasPartner && (
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
                                <p>
                                    Connect with a partner to share daily
                                    check-ins
                                </p>
                                <p className="text-sm">
                                    Go to your profile to manage connections
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4 bg-background dark:bg-background"
                                    onClick={() =>
                                        (window.location.href = "/profile")
                                    }
                                >
                                    Go to Profile
                                </Button>
                            </div>
                        </Card.CardContent>
                    </Card.Card>
                )}

                {hasPartner && !partnerCheckin && (
                    <Card.Card className="w-full flex flex-col">
                        <Card.CardHeader>
                            <Card.CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Partner's Today
                            </Card.CardTitle>
                        </Card.CardHeader>
                        <Card.CardContent className="flex-1 flex flex-col items-center justify-center">
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Your partner hasn't checked in yet today</p>
                                <p className="text-sm">
                                    They'll appear here once they share their
                                    mood
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadPartnerData()}
                                    disabled={isRefreshingPartner}
                                    className="mt-4"
                                >
                                    <RefreshCw
                                        className={cn(
                                            "w-4 h-4 mr-2",
                                            isRefreshingPartner &&
                                                "animate-spin"
                                        )}
                                    />
                                    Refresh
                                </Button>
                            </div>
                        </Card.CardContent>
                    </Card.Card>
                )}
            </div>
        </div>
    );
}
