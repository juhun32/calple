"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    UserMetadata,
    PartnerCheckin,
    getUserMetadata,
    getPartnerMetadata,
    getTodayCheckin,
    createCheckin,
    getPartnerCheckin as getPartnerCheckinAPI,
    debugConnection,
} from "@/lib/api/checkin";

const moodOptions = [
    {
        value: "great",
        label: "Great",
        icon: Star,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
        value: "good",
        label: "Good",
        icon: Smile,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
        value: "okay",
        label: "Okay",
        icon: Meh,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
        value: "bad",
        label: "Bad",
        icon: Frown,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
        value: "terrible",
        label: "Terrible",
        icon: Heart,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
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
        bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
        value: "neutral",
        label: "Neutral",
        icon: Heart,
        color: "text-gray-500",
        bgColor: "bg-gray-50 dark:bg-gray-950/20",
    },
    {
        value: "not_interested",
        label: "Not Interested",
        icon: Heart,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
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
    const [userSex, setUserSex] = useState<"male" | "female" | null>(null);
    const [isRefreshingPartner, setIsRefreshingPartner] = useState(false);

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    // Debug function to test connection
    const testConnection = async () => {
        try {
            console.log("🔍 Testing connection...");
            const debugInfo = await debugConnection();
            console.log("🔍 Connection debug info:", debugInfo);
            toast("Connection debug info logged to console");
        } catch (error) {
            console.error("❌ Connection test failed:", error);
            toast("Connection test failed - check console");
        }
    };

    // Function to load partner data
    const loadPartnerData = async () => {
        setIsRefreshingPartner(true);
        try {
            console.log("=== Loading partner data ===");
            console.log("Loading partner metadata...");
            const partnerMeta = await getPartnerMetadata();
            console.log("✅ Partner metadata loaded:", partnerMeta);
            setHasPartner(true);

            // Get partner's checkin for today
            console.log("Loading partner checkin...");
            const partnerCheckin = await getPartnerCheckinAPI();
            console.log("✅ Partner checkin loaded:", partnerCheckin);
            if (partnerCheckin) {
                setPartnerCheckin(partnerCheckin);
            } else {
                setPartnerCheckin(null);
            }
        } catch (error) {
            console.error("❌ Error loading partner data:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            // No partner connection found
            setHasPartner(false);
            setPartnerCheckin(null);
        } finally {
            setIsRefreshingPartner(false);
        }
    };

    // Load user data and checkins
    useEffect(() => {
        const loadData = async () => {
            try {
                // Get user metadata (sex)
                const userMeta = await getUserMetadata();
                setUserSex(userMeta.sex as "male" | "female");

                // Get today's checkin
                const todayCheckin = await getTodayCheckin();
                if (todayCheckin) {
                    setTodayCheckin(todayCheckin);
                    setCurrentMood(todayCheckin.mood);
                    setCurrentEnergy(todayCheckin.energy);
                    setCurrentPeriod(todayCheckin.periodStatus || null);
                    setCurrentSexualMood(todayCheckin.sexualMood || null);
                    setNote(todayCheckin.note || "");
                }

                // Load partner data
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

        // Set up periodic refresh for partner data (every 30 seconds)
        const interval = setInterval(loadPartnerData, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async () => {
        if (!currentMood || !currentEnergy) {
            return;
        }

        setIsSubmitting(true);

        try {
            const checkinData = {
                date: new Date().toISOString().split("T")[0],
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

            toast("Checkin submitted successfully!");
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

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // All users can see and edit all data
    const canSeePeriodData = true;
    const canEditPeriodData = true;
    const showPartialPartnerData = false;

    return (
        <div className="container mx-auto flex flex-col pt-20 pb-12 lg:pb-16 px-4 lg:px-8 gap-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold mb-2">Daily Check-in</h1>
                <p className="text-muted-foreground">
                    Share your mood and day with your partner
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center lg:items-stretch gap-4 flex-col lg:flex-row">
                <Card.Card className="w-full h-full flex flex-col">
                    <Card.CardHeader>
                        <Card.CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Your Check-in
                        </Card.CardTitle>
                    </Card.CardHeader>
                    <Card.CardContent className="space-y-6 flex-1">
                        {todayCheckin ? (
                            // Show existing checkin
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage
                                            src=""
                                            alt={authState.user?.name || "You"}
                                        />
                                        <AvatarFallback className="text-lg font-semibold">
                                            {getInitials(authState.user?.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {authState.user?.name || "You"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Checked in at{" "}
                                            {formatTime(todayCheckin.createdAt)}
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="ml-auto"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Completed
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-card border">
                                        <div className="text-2xl mb-2">
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
                                                    <IconComponent className="mx-auto w-8 h-8 text-muted-foreground" />
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
                                    <div className="text-center p-4 rounded-lg bg-card border">
                                        <div className="text-2xl mb-2">
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
                                                    <IconComponent className="mx-auto w-8 h-8 text-muted-foreground" />
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
                                        <div className="text-center p-4 rounded-lg bg-card border">
                                            <div className="text-2xl mb-2">
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
                                                        <IconComponent className="mx-auto w-8 h-8 text-muted-foreground" />
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
                                    <div className="p-4 rounded-lg bg-muted/50">
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
                            <div className="space-y-6">
                                {/* Mood Selection */}
                                <div>
                                    <h3 className="font-medium mb-3">
                                        How are you feeling today?
                                    </h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {moodOptions.map((mood) => (
                                            <Button
                                                key={mood.value}
                                                variant={
                                                    currentMood === mood.value
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={cn(
                                                    "flex flex-col items-center gap-1 h-auto p-3",
                                                    currentMood ===
                                                        mood.value &&
                                                        mood.bgColor
                                                )}
                                                onClick={() =>
                                                    setCurrentMood(
                                                        mood.value as any
                                                    )
                                                }
                                            >
                                                <mood.icon
                                                    className={cn(
                                                        "w-6 h-6",
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
                                                variant={
                                                    currentEnergy ===
                                                    energy.value
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="flex flex-col items-center gap-1 h-auto p-3"
                                                onClick={() =>
                                                    setCurrentEnergy(
                                                        energy.value as any
                                                    )
                                                }
                                            >
                                                <energy.icon
                                                    className={cn(
                                                        "w-6 h-6",
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
                                                variant={
                                                    currentSexualMood ===
                                                    sexualMood.value
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={cn(
                                                    "flex flex-col items-center gap-1 h-auto p-3",
                                                    currentSexualMood ===
                                                        sexualMood.value &&
                                                        sexualMood.bgColor
                                                )}
                                                onClick={() =>
                                                    setCurrentSexualMood(
                                                        sexualMood.value as any
                                                    )
                                                }
                                            >
                                                <sexualMood.icon
                                                    className={cn(
                                                        "w-5 h-5",
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
                                        className="min-h-[100px]"
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
                    <Card.Card className="w-full h-full flex flex-col">
                        <Card.CardHeader>
                            <Card.CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Partner's Check-in
                                <div className="ml-auto flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={testConnection}
                                        className="text-xs"
                                    >
                                        Debug
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={loadPartnerData}
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
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage
                                                src=""
                                                alt={partnerCheckin.userName}
                                            />
                                            <AvatarFallback className="text-lg font-semibold">
                                                {getInitials(
                                                    partnerCheckin.userName
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
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
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 rounded-lg bg-card border">
                                            <div className="text-2xl mb-2">
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
                                                        <IconComponent className="mx-auto w-8 h-8 text-muted-foreground" />
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
                                        <div className="text-center p-4 rounded-lg bg-card border">
                                            <div className="text-2xl mb-2">
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
                                                        <IconComponent className="mx-auto w-8 h-8 text-muted-foreground" />
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
                                            <div className="text-center p-4 rounded-lg bg-card border">
                                                <div className="text-2xl mb-2">
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
                                                            <IconComponent className="mx-auto w-8 h-8 text-muted-foreground" />
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
                                        <div className="p-4 rounded-lg bg-muted/50">
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
                    <Card.Card className="w-full h-full flex flex-col">
                        <Card.CardHeader>
                            <Card.CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
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
                                    className="mt-4"
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
                    <Card.Card className="w-full h-full flex flex-col">
                        <Card.CardHeader>
                            <Card.CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Partner's Check-in
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
                                    onClick={loadPartnerData}
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
