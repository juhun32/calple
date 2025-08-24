import {
    Heart,
    Smile,
    Frown,
    Meh,
    Coffee,
    Sun,
    Moon,
    Star,
    HeartCrack,
} from "lucide-react";

export const moodOptions = [
    { value: "great", label: "Great", icon: Star, color: "text-yellow-500" },
    { value: "good", label: "Good", icon: Smile, color: "text-green-500" },
    { value: "okay", label: "Okay", icon: Meh, color: "text-blue-500" },
    { value: "bad", label: "Bad", icon: Frown, color: "text-orange-500" },
    {
        value: "sad",
        label: "Sad",
        icon: HeartCrack,
        color: "text-red-500",
    },
];

export const energyOptions = [
    {
        value: "high",
        label: "High",
        icon: Sun,
        color: "text-yellow-500",
    },
    {
        value: "medium",
        label: "Med",
        icon: Coffee,
        color: "text-orange-500",
    },
    { value: "low", label: "Low", icon: Moon, color: "text-blue-500" },
];

export const sexualMoodOptions = [
    {
        value: "interested",
        label: "Yes",
        icon: Heart,
        color: "text-purple-500",
    },
    { value: "neutral", label: "Eeh", icon: Heart, color: "text-gray-500" },
    {
        value: "not_interested",
        label: "No",
        icon: Heart,
        color: "text-blue-500",
    },
];
