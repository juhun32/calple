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

type Invitation = {
    id: string;
    from: {
        email: string;
        name: string | null;
    };
    createdAt: string;
};

type Connection = {
    connectionId: string;
    partner: {
        email: string;
        name: string;
    } | null;
};

export function ConnectionManager() {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("connection");
    const [inviteEmail, setInviteEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [connection, setConnection] = useState<Connection | null>(null);
    const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(
        []
    );

    // Fetch current connection status
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

    // Fetch pending invitations
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

    // Load data when component mounts or dialog opens
    useEffect(() => {
        if (open) {
            fetchConnection();
            fetchPendingInvitations();
        }
    }, [open]);

    // Send invitation
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

    // Accept invitation
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

    // Reject invitation
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            setActiveTab("connection");
                            setInviteEmail("");
                            setIsLoading(false);
                            setOpen(true);
                        }}
                    >
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
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="connection">
                                My Connection
                            </TabsTrigger>
                            {!connection ? (
                                <TabsTrigger
                                    value="invitations"
                                    data-count={pendingInvitations.length}
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle>No Connection</CardTitle>
                                        <CardDescription>
                                            Invite someone to share your
                                            calendar
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col space-y-2">
                                            <Label htmlFor="email">
                                                Email address
                                            </Label>
                                            <div className="flex space-x-2">
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
                                                    disabled={isLoading}
                                                />
                                                <Button
                                                    onClick={handleInvite}
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
                                    <CardHeader>
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
                                                    {invitation.from.name ||
                                                        invitation.from
                                                            .email}{" "}
                                                    wants to connect
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm">
                                                    {invitation.from.email}
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
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
