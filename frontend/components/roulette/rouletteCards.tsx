"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Play, RotateCw } from "lucide-react";

const dateIdeas = [
    "Make dinner together",
    "Movie night at home",
    "Go for a walk",
    "Play board games",
    "Have a picnic",
    "Visit a museum",
    "Go stargazing",
    "Try a new restaurant",
];

interface RouletteCarouselProps {
    items: string[];
    onResult: (item: string) => void;
}

function RouletteCarousel({ items, onResult }: RouletteCarouselProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    const itemWidth = 180;
    const visibleItems = 3;
    const containerWidth = itemWidth * visibleItems;

    const N_SETS_IN_EXTENDED_ITEMS = 5;
    const extendedItems = Array(N_SETS_IN_EXTENDED_ITEMS).fill(items).flat();
    const carouselCycleLength = items.length * itemWidth;

    const RESET_BLOCK_INDEX = 2;
    const NUM_VISUAL_SPINS = 2;

    const [offset, setOffset] = useState(() => {
        const initialItemIndexInResetBlock =
            items.length * RESET_BLOCK_INDEX + 0;
        return (
            initialItemIndexInResetBlock * itemWidth -
            (containerWidth / 2 - itemWidth / 2)
        );
    });
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const spin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setSelectedItem(null);

        const randomIndex = Math.floor(Math.random() * items.length);
        const actualSelectedItem = items[randomIndex];

        const resetItemActualIndex =
            items.length * RESET_BLOCK_INDEX + randomIndex;
        const resetLandingOffset =
            resetItemActualIndex * itemWidth -
            (containerWidth / 2 - itemWidth / 2);
        const animationTargetOffset =
            resetLandingOffset + NUM_VISUAL_SPINS * carouselCycleLength;

        // Get the actual moving element to control its transition style
        const carouselItemsEl = carouselRef.current?.querySelector(
            ".flex.transition-transform"
        ) as HTMLElement | null;

        if (carouselItemsEl) {
            carouselItemsEl.style.transition = "none";
        }
        setOffset(resetLandingOffset);

        requestAnimationFrame(() => {
            if (carouselItemsEl) {
                carouselItemsEl.style.transition = `transform 3000ms ease-out`;
            }
            setOffset(animationTargetOffset);
        });

        setTimeout(() => {
            setIsSpinning(false);
            setSelectedItem(actualSelectedItem);
            onResult(actualSelectedItem);
            // IMPORTANT: match the timeout duration with the transition duration
        }, 3000);
    };

    return (
        <Card className="w-full">
            <CardContent className="flex flex-col items-center gap-4">
                <div style={{ width: `${containerWidth}px` }}>
                    <div ref={carouselRef} className="overflow-hidden">
                        <div className="relative flex items-center">
                            <div className="absolute left-1/2 top-0 bottom-0 w-[180px] -translate-x-1/2 z-0 border-x border-dashed"></div>

                            <div
                                className="flex transition-transform"
                                style={{
                                    transform: `translateX(-${offset}px)`,
                                    width: `${
                                        extendedItems.length * itemWidth
                                    }px`,
                                }}
                            >
                                {extendedItems.map((item, index) => (
                                    <div
                                        key={`item-${index}`}
                                        className="flex-shrink-0 flex items-center justify-center px-4 py-2"
                                        style={{
                                            width: `${itemWidth}px`,
                                        }}
                                    >
                                        <span className=" font-semibold text-center text-sm leading-tight">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {selectedItem && (
                        <div className="px-4 py-2 rounded-full border">
                            {selectedItem}
                        </div>
                    )}

                    <Button onClick={spin} disabled={isSpinning}>
                        {isSpinning ? (
                            <>
                                <RotateCw className="w-4 h-4 animate-spin" />
                                Spinning...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Spin!
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Component() {
    const [currentRoulette, setCurrentRoulette] = useState<"date">("date");
    const [dateResult, setDateResult] = useState<string | null>(null);

    const handleDateResult = (result: string) => {
        setDateResult(result);
    };

    const resetRoulettes = () => {
        setCurrentRoulette("date");
        setDateResult(null);
    };

    return (
        <div className="py-8 px-4">
            <div className="flex flex-col items-center gap-4">
                {currentRoulette === "date" && (
                    <RouletteCarousel
                        items={dateIdeas}
                        onResult={handleDateResult}
                    />
                )}

                {dateResult && (
                    <Card className="w-full">
                        <CardContent>
                            {dateResult && (
                                <div className="p-4 rounded-lg">
                                    <p className="font-medium">
                                        Date Idea: {dateResult}
                                    </p>
                                </div>
                            )}
                            <Button onClick={resetRoulettes} variant="outline">
                                <RotateCcw className="w-4 h-4" />
                                Start Over
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
