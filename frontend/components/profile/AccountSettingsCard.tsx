// components
import * as Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as AlertDialog from "@/components/ui/alert-dialog";
import { Shield, DoorOpen, LogOut } from "lucide-react";

// utils
import { cn } from "@/lib/utils";

// types
import { AccountSettingsCardProps } from "@/lib/types/profile";

export const AccountSettingsCard = ({
    isDeleting,
    onDeleteAccount,
    onLogout,
}: AccountSettingsCardProps) => {
    return (
        <Card.Card className="gap-4">
            <Card.CardHeader>
                <Card.CardTitle className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" />
                    Account Settings
                </Card.CardTitle>
                <Card.CardDescription>
                    Manage your account.
                </Card.CardDescription>
            </Card.CardHeader>
            <Card.CardContent>
                <div className="flex flex-row gap-2">
                    <AlertDialog.AlertDialog>
                        <AlertDialog.AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-fit rounded-full bg-background dark:bg-background border-none"
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
                                    This action cannot be undone. This will
                                    permanently delete your account.
                                </AlertDialog.AlertDialogDescription>
                            </AlertDialog.AlertDialogHeader>
                            <AlertDialog.AlertDialogFooter>
                                <AlertDialog.AlertDialogCancel>
                                    Cancel
                                </AlertDialog.AlertDialogCancel>
                                <AlertDialog.AlertDialogAction
                                    onClick={onDeleteAccount}
                                    disabled={isDeleting}
                                    className={cn(
                                        "bg-destructive text-card hover:bg-destructive/90 inset-shadow-sm"
                                    )}
                                >
                                    {isDeleting ? "Deleting..." : "Continue"}
                                </AlertDialog.AlertDialogAction>
                            </AlertDialog.AlertDialogFooter>
                        </AlertDialog.AlertDialogContent>
                    </AlertDialog.AlertDialog>

                    <Button
                        variant="outline"
                        className="w-fit rounded-full bg-background dark:bg-background border-none"
                        onClick={onLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </Card.CardContent>
        </Card.Card>
    );
};
