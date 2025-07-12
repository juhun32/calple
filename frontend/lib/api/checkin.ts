// API functions for checkin functionality

export interface CheckinData {
    id: string;
    userId: string;
    date: string;
    mood: "great" | "good" | "okay" | "bad" | "terrible";
    energy: "high" | "medium" | "low";
    periodStatus?: "on" | "off" | "starting" | "ending";
    sexualMood?:
        | "very_horny"
        | "horny"
        | "interested"
        | "neutral"
        | "not_interested";
    note?: string;
    createdAt: string;
}

export interface UserMetadata {
    id: string;
    userId: string;
    sex: "male" | "female";
    createdAt: string;
    updatedAt: string;
}

export interface PartnerCheckin {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userSex: "male" | "female";
    date: string;
    mood: "great" | "good" | "okay" | "bad" | "terrible";
    energy: "high" | "medium" | "low";
    periodStatus?: "on" | "off" | "starting" | "ending";
    sexualMood?:
        | "very_horny"
        | "horny"
        | "interested"
        | "neutral"
        | "not_interested";
    note?: string;
    createdAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Get user metadata (sex)
export const getUserMetadata = async (): Promise<UserMetadata> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/periods/metadata`, {
            credentials: "include",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("getUserMetadata error:", {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            });

            if (response.status === 401) {
                throw new Error(
                    "Authentication required. Please log in again."
                );
            } else if (response.status === 404) {
                throw new Error("User not found. Please contact support.");
            } else if (response.status === 500) {
                throw new Error("Server error. Please try again later.");
            } else {
                throw new Error(
                    `Failed to fetch user metadata: ${response.status} ${response.statusText}`
                );
            }
        }

        const data = await response.json();
        return data.userMetadata;
    } catch (error) {
        console.error("getUserMetadata fetch error:", error);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error("Failed to fetch user metadata");
        }
    }
};

// Update user metadata (sex)
export const updateUserMetadata = async (
    sex: "male" | "female"
): Promise<UserMetadata> => {
    const response = await fetch(`${BACKEND_URL}/api/periods/metadata`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sex }),
    });

    if (!response.ok) {
        throw new Error("Failed to update user metadata");
    }

    const data = await response.json();
    return data.userMetadata;
};

// Get partner metadata
export const getPartnerMetadata = async (): Promise<UserMetadata> => {
    const response = await fetch(
        `${BACKEND_URL}/api/periods/partner/metadata`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        // Check if it's a "No partner connection found" error
        try {
            const errorData = await response.json();
            if (errorData.error === "No partner connection found") {
                throw new Error("No partner connection found");
            }
        } catch (e) {
            // If we can't parse the error, continue with the original error
        }
        throw new Error("Failed to fetch partner metadata");
    }

    const data = await response.json();
    return data.partnerMetadata;
};

// Get today's checkin
export const getTodayCheckin = async (): Promise<CheckinData | null> => {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(
        `${BACKEND_URL}/api/periods/checkin/${today}`,
        {
            credentials: "include",
        }
    );

    if (response.status === 404) {
        return null; // No checkin for today
    }

    if (!response.ok) {
        throw new Error("Failed to fetch today's checkin");
    }

    const data = await response.json();
    return data.checkin;
};

// Create or update checkin
export const createCheckin = async (
    checkinData: Omit<CheckinData, "id" | "userId" | "createdAt">
): Promise<CheckinData> => {
    const response = await fetch(`${BACKEND_URL}/api/periods/checkin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(checkinData),
    });

    if (!response.ok) {
        throw new Error("Failed to create checkin");
    }

    const data = await response.json();
    return data.checkin;
};

// Get partner's checkin for today
export const getPartnerCheckin = async (): Promise<PartnerCheckin | null> => {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(
        `${BACKEND_URL}/api/periods/partner/checkin/${today}`,
        {
            credentials: "include",
        }
    );

    if (response.status === 404) {
        return null; // Partner hasn't checked in today
    }

    if (!response.ok) {
        // Check if it's a "No partner connection found" error
        try {
            const errorData = await response.json();
            if (errorData.error === "No partner connection found") {
                return null; // No partner connection
            }
        } catch (e) {
            // If we can't parse the error, continue with the original error
        }
        throw new Error("Failed to fetch partner's checkin");
    }

    const data = await response.json();
    return data.partnerCheckin;
};

// Debug function to test connection status
export const debugConnection = async () => {
    const response = await fetch(`${BACKEND_URL}/api/debug/connection`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to debug connection");
    }

    const data = await response.json();
    return data;
};
