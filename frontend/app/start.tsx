"use client";

import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";

export default function Start() {
    return (
        <div className="flex flex-col h-screen justify-center items-center">
            <div className="container mx-auto p-8 gap-4 flex flex-col items-center">
                <h1 className="text-2xl font-bold">Welcome to Calple!</h1>
                <p>
                    Get started with calendar app. You can plan and share your
                    schedule with your partner.
                </p>
                <Button
                    className="rounded-full w-40"
                    onClick={() => {
                        window.location.href = "/calendar";
                    }}
                    variant="secondary"
                >
                    <Calendar className="h-4 w-4" />
                    Go to Calendar
                </Button>

                <p>Connect and share your calple with your partner.</p>
                <Button
                    className="rounded-full w-40"
                    onClick={() => {
                        window.location.href = "/profile";
                    }}
                    variant="secondary"
                >
                    <User className="h-4 w-4" />
                    Go to Profile
                </Button>
            </div>
            <p>
                How it works We know online dating isn’t one-size-fits-all, so
                we’re letting you choose your own adventure and connect with
                other singles in a way that feels right for you. Whether you’re
                into sending a good-old-fashioned DM or otherwise, we’ve got
                lots of options to make finding your person actually fun. How it
                works We know online dating isn’t one-size-fits-all, so we’re
                letting you choose your own adventure and connect with other
                singles in a way that feels right for you. Whether you’re into
                sending a good-old-fashioned DM or otherwise, we’ve got lots of
                options to make finding your person actually fun. How it works
                We know online dating isn’t one-size-fits-all, so we’re letting
                you choose your own adventure and connect with other singles in
                a way that feels right for you. Whether you’re into sending a
                good-old-fashioned DM or otherwise, we’ve got lots of options to
                make finding your person actually fun. How it works We know
                online dating isn’t one-size-fits-all, so we’re letting you
                choose your own adventure and connect with other singles in a
                way that feels right for you. Whether you’re into sending a
                good-old-fashioned DM or otherwise, we’ve got lots of options to
                make finding your person actually fun. How it works We know
                online dating isn’t one-size-fits-all, so we’re letting you
                choose your own adventure and connect with other singles in a
                way that feels right for you. Whether you’re into sending a
                good-old-fashioned DM or otherwise, we’ve got lots of options to
                make finding your person actually fun. How it works We know
                online dating isn’t one-size-fits-all, so we’re letting you
                choose your own adventure and connect with other singles in a
                way that feels right for you. Whether you’re into sending a
                good-old-fashioned DM or otherwise, we’ve got lots of options to
                make finding your person actually fun. How it works We know
                online dating isn’t one-size-fits-all, so we’re letting you
                choose your own adventure and connect with other singles in a
                way that feels right for you. Whether you’re into sending a
                good-old-fashioned DM or otherwise, we’ve got lots of options to
                make finding your person actually fun.
            </p>
        </div>
    );
}
