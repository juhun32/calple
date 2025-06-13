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

const dinnerIdeas = [
    "Cook a new recipe",
    "Order from a local restaurant",
    "Have a themed dinner night",
    "Make homemade pizza",
    "Try a new cuisine",
    "Have a dessert night",
    "Cook breakfast for dinner",
    "Make sushi together",
];

interface RouletteCarouselProps {
    items: string[];
    onResult: (item: string) => void;
}

function RouletteCarousel({ items, onResult }: RouletteCarouselProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    const itemWidth = 250;

    const N_SETS_IN_EXTENDED_ITEMS = 5;
    const extendedItems = Array(N_SETS_IN_EXTENDED_ITEMS).fill(items).flat();
    const carouselCycleLength = items.length * itemWidth;

    const RESET_BLOCK_INDEX = 2;
    const NUM_VISUAL_SPINS = 2;

    const [offset, setOffset] = useState(() => {
        const initialItemIndexInResetBlock =
            items.length * RESET_BLOCK_INDEX + 0;
        return initialItemIndexInResetBlock * itemWidth;
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
        const resetLandingOffset = resetItemActualIndex * itemWidth;
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
                carouselItemsEl.style.transition = `transform 2500ms ease-out`;
            }
            setOffset(animationTargetOffset);
        });

        setTimeout(() => {
            setIsSpinning(false);
            setSelectedItem(actualSelectedItem);
            onResult(actualSelectedItem);
            // IMPORTANT: match the timeout duration with the transition duration
        }, 2500);
    };

    return (
        <Card className="w-full h-full">
            <CardContent className="flex flex-col items-center gap-4">
                <div style={{ width: `${itemWidth}px` }}>
                    <div ref={carouselRef} className="overflow-hidden">
                        <div className="relative flex items-center">
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
    const [dateResult, setDateResult] = useState<string | null>(null);
    const [dinnerResult, setDinnerResult] = useState<string | null>(null);

    const handleDateResult = (result: string) => {
        setDateResult(result);
    };

    const handleDinnerResult = (result: string) => {
        setDinnerResult(result);
    };

    return (
        <div className="grid grid-cols-2 items-center gap-4">
            <RouletteCarousel items={dateIdeas} onResult={handleDateResult} />

            <RouletteCarousel
                items={dinnerIdeas}
                onResult={handleDinnerResult}
            />

            <RouletteCarousel items={dateIdeas} onResult={handleDateResult} />

            <RouletteCarousel items={dateIdeas} onResult={handleDateResult} />
        </div>
    );
}
