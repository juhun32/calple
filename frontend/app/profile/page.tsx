"use client";

import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as AlertDialog from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Mail,
    Calendar,
    Clock,
    Settings,
    Users,
    Shield,
    Venus,
    Mars,
    DoorOpen,
    LogOut,
} from "lucide-react";
import { toast } from "sonner";

// components
import { ConnectionManager } from "@/components/connection/ConnectionHandler";
import { redirect } from "next/navigation";
import { getUserMetadata, updateUserMetadata } from "@/lib/api/checkin";
import { cn, logout } from "@/lib/utils";

export default function Profile() {
    const { authState } = useAuth();
    const [userSex, setUserSex] = useState<"male" | "female" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    // Load user metadata
    useEffect(() => {
        const loadUserMetadata = async () => {
            try {
                const metadata = await getUserMetadata();
                setUserSex(metadata.sex as "male" | "female");
            } catch (error) {
                console.error("Failed to load user metadata:", error);
            }
        };

        loadUserMetadata();
    }, []);

    const handleSexChange = async (sex: "male" | "female") => {
        setIsLoading(true);
        try {
            await updateUserMetadata(sex);
            setUserSex(sex);
            toast("Gender setting updated successfully");
        } catch (error) {
            console.error("Failed to update Gender setting:", error);
            toast("Failed to update Gender setting");
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
        <div className="container mx-auto flex flex-col pt-20 pb-12 lg:pb-16 px-4 lg:px-8 gap-4">
            <div className="flex flex-col px-4 lg:px-8">
                <h1 className="text-xl font-bold">
                    {authState.user?.name || "User"}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Mail className="w-4 h-4" />
                    <span>{authState.user?.email}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card.Card className="gap-4">
                    <Card.CardHeader>
                        <Card.CardTitle className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Profile Information
                        </Card.CardTitle>
                    </Card.CardHeader>
                    <Card.CardContent className="space-y-4">
                        <div className="">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">Email :</span>
                                <span className="text-muted-foreground">
                                    {authState.user?.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">
                                    Member since :
                                </span>
                                <span className="text-muted-foreground">
                                    {new Date().toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">
                                    Last active :
                                </span>
                                <span className="text-muted-foreground">
                                    Today
                                </span>
                            </div>
                        </div>
                    </Card.CardContent>
                </Card.Card>

                {/* Connection Management */}
                <Card.Card className="gap-4">
                    <Card.CardHeader>
                        <Card.CardTitle className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4" />
                            Partner Connection
                        </Card.CardTitle>
                        <Card.CardDescription className="text-sm">
                            Manage your calendar connection with your partner
                        </Card.CardDescription>
                    </Card.CardHeader>
                    <Card.CardContent>
                        <ConnectionManager />
                    </Card.CardContent>
                </Card.Card>

                {/* Gender settings */}
                <Card.Card className="gap-4">
                    <Card.CardHeader>
                        <Card.CardTitle className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            Gender setting
                        </Card.CardTitle>
                        <Card.CardDescription className="text-sm">
                            This setting controls period data visibility and
                            editing permissions
                        </Card.CardDescription>
                    </Card.CardHeader>
                    <Card.CardContent>
                        <div className="flex gap-2 mb-2">
                            <Button
                                variant={"outline"}
                                size="sm"
                                onClick={() => handleSexChange("female")}
                                disabled={isLoading}
                                className={cn(
                                    `flex items-center gap-2`,
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
                                size="sm"
                                onClick={() => handleSexChange("male")}
                                disabled={isLoading}
                                className={cn(
                                    `flex items-center gap-2`,
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
                                className="w-fit bg-background dark:bg-background inset-shadow-sm"
                            >
                                Current Setting :{" "}
                                {userSex === "female" ? "Female" : "Male"}
                            </Badge>
                        )}
                    </Card.CardContent>
                </Card.Card>

                {/* Privacy & Settings */}
                <Card.Card className="gap-4">
                    <Card.CardHeader>
                        <Card.CardTitle className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Account Settings
                        </Card.CardTitle>
                    </Card.CardHeader>
                    <Card.CardContent>
                        <div className="flex flex-row gap-2">
                            <AlertDialog.AlertDialog>
                                <AlertDialog.AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-fit rounded-full"
                                    >
                                        <DoorOpen className="w-4 h-4" />
                                        Delete Account
                                    </Button>
                                </AlertDialog.AlertDialogTrigger>
                                <AlertDialog.AlertDialogContent>
                                    <AlertDialog.AlertDialogHeader>
                                        <AlertDialog.AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialog.AlertDialogTitle>
                                        <AlertDialog.AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete your
                                            account.
                                        </AlertDialog.AlertDialogDescription>
                                    </AlertDialog.AlertDialogHeader>
                                    <AlertDialog.AlertDialogFooter>
                                        <AlertDialog.AlertDialogCancel>
                                            Cancel
                                        </AlertDialog.AlertDialogCancel>
                                        <AlertDialog.AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            disabled={isDeleting}
                                            className={cn(
                                                "bg-destructive text-card hover:bg-destructive/90 inset-shadow-sm"
                                            )}
                                        >
                                            {isDeleting
                                                ? "Deleting..."
                                                : "Continue"}
                                        </AlertDialog.AlertDialogAction>
                                    </AlertDialog.AlertDialogFooter>
                                </AlertDialog.AlertDialogContent>
                            </AlertDialog.AlertDialog>

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-fit rounded-full"
                                onClick={logout}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>
                    </Card.CardContent>
                </Card.Card>
            </div>
        </div>
    );
}
