"use client";

import { Meh } from "@/lib/assets/meh";
import calendar from "@/lib/assets/calendar.png";
import { Wow } from "@/lib/assets/wow";

export default function Start() {
    return (
        <div className="container flex flex-col px-4 md:px-8 md:px-20">
            <div className="h-160 grid grid-cols-[1fr_auto] items-center gap-16">
                <div className="flex flex-col gap-4">
                    <h1 className="text-6xl font-bold">
                        Happy dating life with tons of memories to share
                    </h1>
                    <p className="text-2xl">
                        The place to share, plan, and cherish your special
                        moments of your relationship.
                    </p>
                </div>
                <div className="flex justify-end">
                    <Meh className="h-100" />
                </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-16 pb-16">
                <div className="flex flex-col gap-4">
                    <p className="text-4xl">
                        Separate your personal life from your professional life
                    </p>
                    <div className="flex items-center gap-2">
                        Sharable calendar only for you two, designed to keep
                        your personal life organized and separate from your
                        professional life.
                        <Wow className="w-52 h-auto" />
                    </div>
                </div>
                <div className="bg-gradient-to-b from-pink-200 via-pink-100 to-background pt-4 px-4 rounded-t-xl">
                    <img
                        src={calendar.src}
                        alt="Calendar"
                        className="rounded-t-xl mask-b-from-70% mask-b-to-100%"
                    />
                </div>
            </div>
        </div>
    );
}
