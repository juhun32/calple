"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as Card from "@/components/ui/card";
import * as AlertDialog from "@/components/ui/alert-dialog";

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
            <Dialog.Dialog
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
                <Dialog.DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-fit sm:w-auto rounded-full bg-background dark:bg-background hover:cursor-pointer"
                    >
                        <Blend className="w-4 h-4" />
                        Manage Connection
                    </Button>
                </Dialog.DialogTrigger>
                <Dialog.DialogContent>
                    <Dialog.DialogHeader>
                        <Dialog.DialogTitle>
                            Calendar Connection
                        </Dialog.DialogTitle>
                        <Dialog.DialogDescription>
                            Connect with a partner.
                        </Dialog.DialogDescription>
                    </Dialog.DialogHeader>

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

                        <TabsContent value="connection">
                            {connection ? (
                                <Card.Card>
                                    <Card.CardHeader>
                                        <Card.CardTitle>
                                            Connected Partner
                                        </Card.CardTitle>
                                        <Card.CardDescription>
                                            You are sharing with:
                                        </Card.CardDescription>
                                    </Card.CardHeader>
                                    <Card.CardContent>
                                        <div className="flex flex-col space-y-2">
                                            <p className="font-medium">
                                                {connection.partner?.name ||
                                                    "Unknown"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {connection.partner?.email}
                                            </p>
                                        </div>
                                    </Card.CardContent>
                                </Card.Card>
                            ) : (
                                <Card.Card className="gap-8">
                                    <Card.CardHeader className="gap-2">
                                        <Card.CardTitle>
                                            No Connection
                                        </Card.CardTitle>
                                        <Card.CardDescription>
                                            Invite someone to share your calple
                                        </Card.CardDescription>
                                    </Card.CardHeader>
                                    <Card.CardContent>
                                        <div className="flex flex-col gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm text-muted-foreground"
                                            >
                                                Email address
                                            </Label>
                                            <div className="flex flex-col md:flex-row gap-2 lg:gap-4">
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
                                                    size={"sm"}
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
                                    </Card.CardContent>
                                </Card.Card>
                            )}
                        </TabsContent>

                        <TabsContent value="invitations">
                            {pendingInvitations.length === 0 ? (
                                <Card.Card>
                                    <Card.CardHeader className="gap-4">
                                        <Card.CardTitle>
                                            No Pending Invitations
                                        </Card.CardTitle>
                                        <Card.CardDescription>
                                            You don't have any pending
                                            invitations.
                                        </Card.CardDescription>
                                    </Card.CardHeader>
                                </Card.Card>
                            ) : (
                                <div className="space-y-4">
                                    {pendingInvitations.map((invitation) => (
                                        <Card.Card key={invitation.id}>
                                            <Card.CardHeader>
                                                <Card.CardTitle>
                                                    Calendar Invitation
                                                </Card.CardTitle>
                                                <Card.CardDescription>
                                                    {invitation.from_name ||
                                                        invitation.from_email ||
                                                        "Someone"}{" "}
                                                    wants to connect
                                                </Card.CardDescription>
                                            </Card.CardHeader>
                                            <Card.CardContent>
                                                <p className="text-sm">
                                                    {invitation.from_email}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Sent on{" "}
                                                    {new Date(
                                                        invitation.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            </Card.CardContent>
                                            <Card.CardFooter className="flex justify-between">
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
                                            </Card.CardFooter>
                                        </Card.Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <Dialog.DialogFooter>
                        {connection && (
                            <AlertDialog.AlertDialog>
                                <AlertDialog.AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={isLoading}
                                    >
                                        Disconnect
                                    </Button>
                                </AlertDialog.AlertDialogTrigger>
                                <AlertDialog.AlertDialogContent>
                                    <AlertDialog.AlertDialogHeader>
                                        <AlertDialog.AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialog.AlertDialogTitle>
                                        <AlertDialog.AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete your account
                                            and remove your data from our
                                            servers.
                                        </AlertDialog.AlertDialogDescription>
                                    </AlertDialog.AlertDialogHeader>
                                    <AlertDialog.AlertDialogFooter>
                                        <AlertDialog.AlertDialogCancel>
                                            Cancel
                                        </AlertDialog.AlertDialogCancel>
                                        <AlertDialog.AlertDialogAction
                                            onClick={() =>
                                                handleCancelInvitation(
                                                    connection.connectionId
                                                )
                                            }
                                        >
                                            Disconnect
                                        </AlertDialog.AlertDialogAction>
                                    </AlertDialog.AlertDialogFooter>
                                </AlertDialog.AlertDialogContent>
                            </AlertDialog.AlertDialog>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-full"
                            disabled={isLoading}
                        >
                            Close
                        </Button>
                    </Dialog.DialogFooter>
                </Dialog.DialogContent>
            </Dialog.Dialog>
        </div>
    );
}
