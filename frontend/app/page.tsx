"use client";

import { useRouter } from "next/navigation";

// utils
import { login } from "@/lib/utils";

// components
import { useAuth } from "@/components/auth-provider";

// ui
import { Button } from "@/components/ui/button";

// icons
import { Calendar, Droplets, SquareCheckBig } from "lucide-react";
import Rectangle from "@/lib/assets/rectangle";
import Start from "./start";

export default function Home() {
    const { authState } = useAuth();
    const router = useRouter();

    return (
        <div className="container w-full min-h-screen flex flex-col items-center justify-center pt-32 md:px-8 mx-auto">
            <Rectangle className="absolute inset-0 w-full h-full z-[-1]" />
            <div className="container px-4 md:px-8 gap-4 h-full w-full md:border-8 border-border/20 bg-background/50 md:px-20 md:py-20 rounded-lg flex flex-col">
                <div className="flex flex-col gap-2 items-start justify-start">
                    <h1 className="flex flex-col md:flex-row sm:gap-2 text-4xl sm:text-4xl font-medium">
                        For Your Healthier
                        <p className="text-rose-500">Dating</p> Life
                    </h1>
                    <p className="text-normal sm:text-xl text-muted-foreground">
                        Everything a couple needs to make their life easier.
                        Plan your dates, manage your tasks, and stay organized
                        with Calple.
                    </p>
                </div>

                {!authState.isAuthenticated ? (
                    <Button
                        variant="outline"
                        size={"sm"}
                        className="rounded-full px-3 w-fit"
                        onClick={login}
                    >
                        <div className="gsi-material-button-icon">
                            <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 48 48"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                style={{ display: "block" }}
                            >
                                <path
                                    fill="#EA4335"
                                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                ></path>
                                <path
                                    fill="#4285F4"
                                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                ></path>
                                <path
                                    fill="#FBBC05"
                                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                ></path>
                                <path
                                    fill="#34A853"
                                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                ></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                        </div>
                        <span>Sign in with Google</span>
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size={"sm"}
                            className="rounded-full px-3 w-fit"
                            onClick={() => router.push("/checkin")}
                        >
                            <SquareCheckBig className="h-4 w-4 text-rose-500" />
                            <span>Check-In</span>
                        </Button>
                        <Button
                            variant="outline"
                            size={"sm"}
                            className="rounded-full px-3 w-fit"
                            onClick={() => router.push("/calendar")}
                        >
                            <Calendar className="h-4 w-4 text-rose-500" />
                            <span>Calendar</span>
                        </Button>
                        <Button
                            variant="outline"
                            size={"sm"}
                            className="rounded-full px-3 w-fit"
                            onClick={() => router.push("/tracker")}
                        >
                            <Droplets className="h-4 w-4 text-rose-500" />
                            <span>Cycle</span>
                        </Button>
                    </div>
                )}
            </div>
            <Start />
        </div>
    );
}
