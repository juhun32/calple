"use client";

import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";
import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { toast } from "sonner";

// components
import { ConnectionManager } from "@/components/connection/ConnectionHandler";
import { redirect } from "next/navigation";
import { getUserMetadata, updateUserMetadata } from "@/lib/api/checkin";

export default function Profile() {
    const { authState } = useAuth();
    const [userSex, setUserSex] = useState<"male" | "female" | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
                            <span className="font-medium">Member since :</span>
                            <span className="text-muted-foreground">
                                {new Date().toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Last active :</span>
                            <span className="text-muted-foreground">Today</span>
                        </div>
                    </div>
                </Card.CardContent>
            </Card.Card>

            {/* Gender settings */}
            <Card.Card className="gap-4">
                <Card.CardHeader>
                    <Card.CardTitle className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        Gender setting
                    </Card.CardTitle>
                    <Card.CardDescription className="text-xs">
                        This setting controls period data visibility and editing
                        permissions
                    </Card.CardDescription>
                </Card.CardHeader>
                <Card.CardContent>
                    <div className="flex gap-2 mb-2">
                        <Button
                            variant={
                                userSex === "female" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handleSexChange("female")}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <Venus className="w-4 h-4" />
                            Female
                        </Button>
                        <Button
                            variant={userSex === "male" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSexChange("male")}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <Mars className="w-4 h-4" />
                            Male
                        </Button>
                    </div>
                    {userSex && (
                        <Badge variant="outline" className="w-fit">
                            Current Setting :{" "}
                            {userSex === "female" ? "Female" : "Male"}
                        </Badge>
                    )}
                </Card.CardContent>
            </Card.Card>

            {/* Connection Management */}
            <Card.Card className="gap-4">
                <Card.CardHeader>
                    <Card.CardTitle className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Partner Connection
                    </Card.CardTitle>
                    <Card.CardDescription className="text-xs">
                        Manage your calendar connection with your partner
                    </Card.CardDescription>
                </Card.CardHeader>
                <Card.CardContent>
                    <ConnectionManager />
                </Card.CardContent>
            </Card.Card>

            {/* Privacy & Settings */}
            {/* <Card.Card className="gap-4">
                <Card.CardHeader>
                    <Card.CardTitle className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Privacy & Settings
                    </Card.CardTitle>
                </Card.CardHeader>
                <Card.CardContent>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-fit rounded-full"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Account Settings
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-fit rounded-full"
                            onClick={() => redirect("/privacy")}
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Privacy Policy
                        </Button>
                        <Button variant="outline" size="sm" className="w-fit">
                            <Heart className="w-4 h-4 mr-2" />
                            Support
                        </Button>
                    </div>
                </Card.CardContent>
            </Card.Card> */}
        </div>
    );
}
