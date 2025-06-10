"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import * as Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    Heart,
    Plus,
    RefreshCw,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const dateIdeas = [
    {
        id: 1,
        title: "Picnic in the Park",
        description:
            "Pack a basket with your favorite foods and enjoy a relaxing day outdoors.",
        category: "Outdoor",
        budget: "Low",
        duration: "Half-day",
    },
    {
        id: 2,
        title: "Cooking Class",
        description:
            "Learn to make a new dish together with a professional chef.",
        category: "Indoor",
        budget: "Medium",
        duration: "2-3 hours",
    },
    {
        id: 3,
        title: "Stargazing",
        description:
            "Drive to a spot away from city lights and watch the stars together.",
        category: "Outdoor",
        budget: "Free",
        duration: "Evening",
    },
    {
        id: 4,
        title: "Museum Visit",
        description: "Explore a local museum and learn something new together.",
        category: "Indoor",
        budget: "Low",
        duration: "Half-day",
    },
    {
        id: 5,
        title: "Wine Tasting",
        description:
            "Visit a local winery or vineyard for a tasting experience.",
        category: "Outdoor",
        budget: "Medium",
        duration: "Half-day",
    },
    {
        id: 6,
        title: "Board Game Night",
        description:
            "Stay in and play your favorite board games with snacks and drinks.",
        category: "Indoor",
        budget: "Low",
        duration: "Evening",
    },
    {
        id: 7,
        title: "Hiking Adventure",
        description: "Find a scenic trail and enjoy nature together.",
        category: "Outdoor",
        budget: "Free",
        duration: "Full-day",
    },
];

export default function RouletteCards() {
    const [currentIdea, setCurrentIdea] = useState<any | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [savedIdeas, setSavedIdeas] = useState<any[]>([]);

    const getRandomIdea = () => {
        setSpinning(true);

        // delay for spinning effect
        setTimeout(() => {
            const availableIdeas = dateIdeas.filter(
                (idea) => !savedIdeas.some((saved) => saved.id === idea.id)
            );

            if (availableIdeas.length === 0) {
                // If all ideas are saved, pick from all ideas
                const randomIndex = Math.floor(
                    Math.random() * dateIdeas.length
                );
                setCurrentIdea(dateIdeas[randomIndex]);
            } else {
                // Pick from available ideas
                const randomIndex = Math.floor(
                    Math.random() * availableIdeas.length
                );
                setCurrentIdea(availableIdeas[randomIndex]);
            }

            setSpinning(false);
        }, 1000);
    };

    // Initialize with a random idea
    useEffect(() => {
        getRandomIdea();
    }, []);

    // Function to save current idea
    const saveIdea = () => {
        if (
            currentIdea &&
            !savedIdeas.some((idea) => idea.id === currentIdea.id)
        ) {
            setSavedIdeas([...savedIdeas, currentIdea]);
        }
        getRandomIdea();
    };

    // Function to skip current idea
    const skipIdea = () => {
        getRandomIdea();
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {currentIdea && (
                    <motion.div
                        key={currentIdea.id}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.1 }}
                        className="w-full"
                    >
                        <Card.Card className="w-full overflow-hidden py-4">
                            <Card.CardHeader className="px-8">
                                <Card.CardTitle>
                                    <p className="text-lg font-bold">
                                        {currentIdea.title}
                                    </p>
                                </Card.CardTitle>
                                <Card.CardDescription>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                            {currentIdea.category}
                                        </Badge>
                                        <Badge variant="outline">
                                            {currentIdea.budget} Budget
                                        </Badge>
                                        <Badge variant="outline">
                                            {currentIdea.duration}
                                        </Badge>
                                    </div>
                                </Card.CardDescription>
                            </Card.CardHeader>
                            <Card.CardContent className="px-8">
                                <p className="text-sm">
                                    {currentIdea.description}
                                </p>
                            </Card.CardContent>
                            <Card.CardFooter className="flex justify-between px-8 border-t">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={skipIdea}
                                    disabled={spinning}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={saveIdea}
                                    disabled={spinning}
                                >
                                    <Heart className="w-4 h-4" />
                                    Save This Idea
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={saveIdea}
                                    disabled={spinning}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </Button>
                            </Card.CardFooter>
                        </Card.Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={getRandomIdea}
                disabled={spinning}
            >
                <RefreshCw
                    className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`}
                />
                Spin Again
            </Button>

            <Dialog.Dialog>
                <Dialog.DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Custom Idea
                    </Button>
                </Dialog.DialogTrigger>
                <Dialog.DialogContent>
                    <Dialog.DialogHeader>
                        <Dialog.DialogTitle>
                            Add Custom Date Idea
                        </Dialog.DialogTitle>
                        <Dialog.DialogDescription>
                            Create your own date idea to add to the roulette.
                        </Dialog.DialogDescription>
                    </Dialog.DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Enter a title for your date idea"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            {/* <Textarea
                                    id="description"
                                    placeholder="Describe your date idea"
                                /> */}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="Indoor, Outdoor, etc."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="budget">Budget</Label>
                                <Input
                                    id="budget"
                                    placeholder="Free, Low, Medium, High"
                                />
                            </div>
                        </div>
                    </div>
                    <Dialog.DialogFooter>
                        <Button type="submit">Add Idea</Button>
                    </Dialog.DialogFooter>
                </Dialog.DialogContent>
            </Dialog.Dialog>
            {savedIdeas.length > 0 && (
                <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold">Saved Ideas</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {savedIdeas.map((idea) => (
                            <Card.Card
                                key={idea.id}
                                className="overflow-hidden"
                            >
                                <Card.CardHeader className="py-3">
                                    <Card.CardTitle className="text-lg bg-card">
                                        {idea.title}
                                    </Card.CardTitle>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {idea.category}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {idea.budget}
                                        </Badge>
                                    </div>
                                </Card.CardHeader>
                                <Card.CardContent className="py-3">
                                    <p className="text-sm">
                                        {idea.description}
                                    </p>
                                </Card.CardContent>
                            </Card.Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
