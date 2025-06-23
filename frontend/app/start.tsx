"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Start() {
    return (
        <div className="container flex flex-col gap-4 px-8 my-16 md:px-20 font-serif">
            <h1 className="text-2xl font-bold">
                Happier Dating life with Calple
            </h1>
            <p className="text-muted-foreground">
                Dating is hard when it gets to planning, squeezing your tasks,
                and keeping track of your partner's schedule. Calple is here to
                help you manage your dating life schedule!
            </p>

            <p>
                Get started by connecting and sharing your calple with your
                partner.
            </p>
            <Button
                className="rounded-full w-fit"
                variant="outline"
                size={"sm"}
                onClick={() => {
                    window.location.href = "/profile";
                }}
            >
                <User className="h-4 w-4 text-rose-500 border border-rose-500 rounded-full" />
                Profile
            </Button>
        </div>
    );
}
