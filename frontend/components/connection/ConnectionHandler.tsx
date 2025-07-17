"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";

// types
import { Connection, Invitation } from "@/lib/types/connection";
import { Blend } from "lucide-react";

export function ConnectionManager() {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("connection");
    const [inviteEmail, setInviteEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [connection, setConnection] = useState<Connection | null>(null);
    const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
        []
    );

    const fetchConnection = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connection`,
                {
                    credentials: "include",
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.connected) {
                    setConnection({
                        connectionId: data.connectionId,
                        partner: data.partner,
                    });
                } else {
                    setConnection(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch connection:", error);
        }
    };

    const fetchPendingInvitations = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connection/pending`,
                {
                    credentials: "include",
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPendingInvitations(data.invitations || []);
            }
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        }
    };

    // load connection and invitations when dialog opens
    useEffect(() => {
        if (open) {
            fetchConnection();
            fetchPendingInvitations();
        }
    }, [open]);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast("Invalid email");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connection/invite`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: inviteEmail.trim(),
                    }),
                }
            );

            if (response.ok) {
                toast(`Invitation sent to ${inviteEmail}`);
                setInviteEmail("");
            } else {
                const errorData = await response.json();
                console.error("Invitation error:", errorData);
                toast(`Failed: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            toast("Failed to send invitation");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptInvitation = async (invitationId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connection/${invitationId}/accept`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (response.ok) {
                toast("Invitation accepted");
                await fetchConnection();
                await fetchPendingInvitations();
                setActiveTab("connection");
            } else {
                const errorData = await response.json();
                toast(
                    "Failed to accept invitation",
                    errorData.error || "Something went wrong"
                );
            }
        } catch (error) {
            toast("Failed to accept invitation");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/connection/${invitationId}/reject`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (response.ok) {
                toast("Invitation rejected");
                await fetchPendingInvitations();
            } else {
                const errorData = await response.json();
                toast(
                    "Failed to reject invitation",
                    errorData.error || "Something went wrong"
                );
            }
        } catch (error) {
            toast("Failed to reject invitation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Dialog
                open={open}
                onOpenChange={(value) => {
                    setOpen(value);
                    if (value) {
                        setActiveTab("connection");
                        setInviteEmail("");
                        setIsLoading(false);
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-fit sm:w-auto rounded-full bg-background dark:bg-background hover:cursor-pointer"
                    >
                        <Blend className="w-4 h-4" />
                        Manage Connection
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Calendar Connection</DialogTitle>
                        <DialogDescription>
                            Connect with a partner.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs
                        defaultValue={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2 rounded-full">
                            <TabsTrigger
                                value="connection"
                                className="rounded-full"
                            >
                                My Connection
                            </TabsTrigger>
                            {!connection ? (
                                <TabsTrigger
                                    value="invitations"
                                    data-count={pendingInvitations.length}
                                    className="rounded-full"
                                >
                                    Invitations
                                    {pendingInvitations.length > 0 &&
                                        `(${pendingInvitations.length})`}
                                </TabsTrigger>
                            ) : (
                                <TabsTrigger
                                    value="invitations"
                                    data-count={pendingInvitations.length}
                                    disabled
                                >
                                    Invitations
                                    {pendingInvitations.length > 0 &&
                                        `(${pendingInvitations.length})`}
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="connection" className="mt-4">
                            {connection ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Connected Partner</CardTitle>
                                        <CardDescription>
                                            You are sharing with:
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col space-y-2">
                                            <p className="font-medium">
                                                {connection.partner?.name ||
                                                    "Unknown"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {connection.partner?.email}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="gap-8">
                                    <CardHeader className="gap-2">
                                        <CardTitle>No Connection</CardTitle>
                                        <CardDescription>
                                            Invite someone to share your
                                            calendar
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm text-muted-foreground"
                                            >
                                                Email address
                                            </Label>
                                            <div className="flex gap-2 lg:gap-4">
                                                <Input
                                                    id="email"
                                                    placeholder="partner@example.com"
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) =>
                                                        setInviteEmail(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="rounded-full"
                                                    disabled={isLoading}
                                                />
                                                <Button
                                                    onClick={handleInvite}
                                                    className="rounded-full"
                                                    disabled={
                                                        isLoading ||
                                                        !inviteEmail.trim()
                                                    }
                                                >
                                                    {isLoading
                                                        ? "Sending..."
                                                        : "Invite"}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="invitations" className="mt-4">
                            {pendingInvitations.length === 0 ? (
                                <Card>
                                    <CardHeader className="gap-4">
                                        <CardTitle>
                                            No Pending Invitations
                                        </CardTitle>
                                        <CardDescription>
                                            You don't have any pending
                                            invitations.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {pendingInvitations.map((invitation) => (
                                        <Card key={invitation.id}>
                                            <CardHeader>
                                                <CardTitle>
                                                    Calendar Invitation
                                                </CardTitle>
                                                <CardDescription>
                                                    {invitation.from_name ||
                                                        invitation.from_email ||
                                                        "Someone"}{" "}
                                                    wants to connect
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm">
                                                    {invitation.from_email}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Sent on{" "}
                                                    {new Date(
                                                        invitation.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <Button
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleCancelInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        handleAcceptInvitation(
                                                            invitation.id
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    Accept
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        {connection && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={isLoading}
                                    >
                                        Disconnect
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete your account
                                            and remove your data from our
                                            servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                handleCancelInvitation(
                                                    connection.connectionId
                                                )
                                            }
                                        >
                                            Disconnect
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-full"
                            disabled={isLoading}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
