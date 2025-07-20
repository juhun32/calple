"use client";

import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";

// components
import { toast } from "sonner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { ConnectionCard } from "@/components/profile/ConnectionCard";
import { GenderSettingsCard } from "@/components/profile/GenderSettingsCard";
import { AccountSettingsCard } from "@/components/profile/AccountSettingsCard";
import { DatingInfoCard } from "@/components/profile/DatingInfoCard";

// api
import { getUserMetadata, updateUserMetadata } from "@/lib/api/checkin";

// utils
import { logout } from "@/lib/utils";

export default function Profile() {
    const { authState } = useAuth();
    const [userSex, setUserSex] = useState<"male" | "female">("female");
    const [startedDating, setStartedDating] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    useEffect(() => {
        const loadUserMetadata = async () => {
            try {
                const metadata = await getUserMetadata();
                if (metadata) {
                    setUserSex(metadata.sex as "male" | "female");
                    if (metadata.startedDating) {
                        setStartedDating(metadata.startedDating);
                    }
                }
            } catch (error) {
                console.error("Failed to load user metadata:", error);
            }
        };

        loadUserMetadata();
    }, []);

    const handleSexChange = async (sex: "male" | "female") => {
        setIsLoading(true);
        try {
            await updateUserMetadata({ sex });
            setUserSex(sex);
            toast("Gender setting updated successfully");
        } catch (error) {
            console.error("Failed to update Gender setting:", error);
            toast("Failed to update Gender setting");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateDatingDate = async (date: string) => {
        setIsLoading(true);
        try {
            const updatedMetadata = await updateUserMetadata({
                startedDating: date,
            });
            if (updatedMetadata.startedDating) {
                setStartedDating(updatedMetadata.startedDating);
            }
            toast.success("Dating date updated successfully");
        } catch (error) {
            console.error("Failed to update dating date:", error);
            toast.error("Failed to update dating date");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete account from server.");
            }

            toast.success("Account deleted successfully.");
            await logout();
        } catch (error) {
            console.error("Account deletion failed:", error);
            toast.error("An error occurred while deleting your account.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl flex flex-col pt-20 pb-12 lg:pb-16 px-4 lg:px-8 gap-4">
            <ProfileHeader
                name={authState.user?.name}
                email={authState.user?.email}
            />

            <div className="flex flex-col gap-4">
                <ProfileInfoCard email={authState.user?.email} />
                <DatingInfoCard
                    startedDating={startedDating}
                    onUpdate={handleUpdateDatingDate}
                    isLoading={isLoading}
                />
                <ConnectionCard />
                <GenderSettingsCard
                    userSex={userSex}
                    isLoading={isLoading}
                    onSexChange={handleSexChange}
                />
                <AccountSettingsCard
                    isDeleting={isDeleting}
                    onDeleteAccount={handleDeleteAccount}
                    onLogout={logout}
                />
            </div>
        </div>
    );
}
