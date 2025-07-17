"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import {
    CheckinData,
    PartnerCheckin,
    getPartnerMetadata,
    getTodayCheckin,
    createCheckin,
    deleteCheckin,
    getPartnerCheckin as getPartnerCheckinAPI,
} from "@/lib/api/checkin";

// components
import { toast } from "sonner";
import { CheckinPageHeader } from "@/components/checkin/CheckinPageHeader";
import { UserCheckinCard } from "@/components/checkin/UserCheckinCard";
import { PartnerCheckinCard } from "@/components/checkin/PartnerCheckinCard";
import { NoPartnerCard } from "@/components/checkin/NoPartnerCard";
import { WaitingForPartnerCard } from "@/components/checkin/WaitingForPartnerCard";

export default function Checkin() {
    const { authState } = useAuth();
    const [currentMood, setCurrentMood] = useState<
        "great" | "good" | "okay" | "bad" | "terrible" | null
    >(null);
    const [currentEnergy, setCurrentEnergy] = useState<
        "high" | "medium" | "low" | null
    >(null);
    const [currentSexualMood, setCurrentSexualMood] = useState<
        "interested" | "neutral" | "not_interested" | null
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

    const handleDeleteCheckin = async () => {
        if (!todayCheckin) return;
        setIsDeleting(true);
        try {
            await deleteCheckin(todayCheckin.date);
            setTodayCheckin(null);
            setCurrentMood(null);
            setCurrentEnergy(null);
            setCurrentSexualMood(null);
            setNote("");
            toast("Checkin deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete checkin");
        } finally {
            setIsDeleting(false);
        }
    };

    const loadPartnerData = useCallback(async (date?: string) => {
        setIsRefreshingPartner(true);
        try {
            await getPartnerMetadata();
            setHasPartner(true);
            const partnerData = await getPartnerCheckinAPI(date);
            setPartnerCheckin(partnerData || null);
        } catch (error) {
            setHasPartner(false);
            setPartnerCheckin(null);
        } finally {
            setIsRefreshingPartner(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const checkin = await getTodayCheckin();
                if (checkin) {
                    setTodayCheckin(checkin);
                }
                await loadPartnerData();
            } catch (error) {
                toast.error("Failed to load checkin data");
            }
        };
        loadData();
    }, [loadPartnerData]);

    const handleSubmit = async () => {
        if (!currentMood || !currentEnergy) return;
        setIsSubmitting(true);
        try {
            const checkinData = {
                date: new Date().toLocaleDateString("en-CA"),
                mood: currentMood,
                energy: currentEnergy,
                sexualMood: currentSexualMood || undefined,
                note: note.trim() || undefined,
            };
            const newCheckin = await createCheckin(checkinData);
            setTodayCheckin(newCheckin);
            await loadPartnerData();
            toast.success("Checkin submitted successfully");
        } catch (error) {
            toast.error("Failed to submit checkin");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto flex flex-col pt-20 pb-12 lg:pb-16 px-4 lg:px-8 gap-6 min-h-screen">
            <CheckinPageHeader />

            <div className="flex items-stretch gap-4 flex-col lg:flex-row flex-1">
                <UserCheckinCard
                    todayCheckin={todayCheckin}
                    userName={authState.user?.name || "You"}
                    isDeleting={isDeleting}
                    handleDeleteCheckin={handleDeleteCheckin}
                    // Form props
                    formState={{
                        currentMood,
                        currentEnergy,
                        currentSexualMood,
                        note,
                    }}
                    formSetters={{
                        setCurrentMood,
                        setCurrentEnergy,
                        setCurrentSexualMood,
                        setNote,
                    }}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                />

                {hasPartner ? (
                    partnerCheckin ? (
                        <PartnerCheckinCard
                            partnerCheckin={partnerCheckin}
                            isRefreshingPartner={isRefreshingPartner}
                            loadPartnerData={loadPartnerData}
                        />
                    ) : (
                        <WaitingForPartnerCard
                            isRefreshingPartner={isRefreshingPartner}
                            loadPartnerData={loadPartnerData}
                        />
                    )
                ) : (
                    <NoPartnerCard />
                )}
            </div>
        </div>
    );
}
