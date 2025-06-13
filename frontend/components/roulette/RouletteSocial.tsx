"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Bookmark, Heart, MessageCircle, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

interface Comment {
    id: string;
    author: string;
    created_at: string;
    content: string;
}

interface Idea {
    id: string;
    title: string;
    description: string;
    author: string;
    created_at: string;
    updated_at: string;
    likes: number;
    tags: string[];
    comments: Comment[];
    image_url?: string; // Optional: if posts can have images
    author_avatar_url?: string; // Optional: if authors have avatars
}

export default function RouletteSocial() {
    const [posts, setPosts] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const backendUrl =
                    process.env.NEXT_PUBLIC_BACKEND_URL ||
                    "http://localhost:5000";
                const response = await fetch(`${backendUrl}/api/ideas/all`);
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch posts: ${response.status}`
                    );
                }
                const data: Idea[] = await response.json();
                setPosts(data);
                setError(null);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <div className="w-full text-center p-4">Loading posts...</div>;
    }

    if (error) {
        return (
            <div className="w-full text-center p-4 text-red-500">
                Error: {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return <div className="w-full text-center p-4">No posts found.</div>;
    }

    return (
        <div className="w-full space-y-4">
            {posts.map((post) => (
                <Card.Card
                    key={post.id}
                    className="w-full overflow-hidden h-fit"
                >
                    <Card.CardHeader>
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 rounded-full">
                                {post.author_avatar_url ? (
                                    <AvatarImage
                                        src={post.author_avatar_url}
                                        alt={post.author}
                                    />
                                ) : (
                                    <AvatarFallback>
                                        {post.author ? (
                                            post.author
                                                .substring(0, 1)
                                                .toUpperCase()
                                        ) : (
                                            <Heart className="w-4 h-4" />
                                        )}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div>
                                <p className="font-semibold">
                                    {post.author || "Anonymous"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(
                                        post.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card.CardHeader>
                    <Card.CardContent className="flex flex-col">
                        <AspectRatio
                            ratio={16 / 9}
                            className="bg-muted rounded-lg"
                        >
                            <Image
                                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                                alt="Photo by Drew Beamer"
                                fill
                                className="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"
                            />
                        </AspectRatio>
                        <div>
                            <p className="font-bold text-lg pt-1">
                                {post.title}
                            </p>
                            <p className="text-sm pb-1 text-muted-foreground">
                                {post.description}
                            </p>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-muted-foreground font-normal"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </Card.CardContent>
                    <Card.CardFooter className="flex justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 rounded-full"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                    {post.likes}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 rounded-full"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                    {post.comments?.length || 0}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 rounded-full"
                        >
                            <Bookmark className="w-4 h-4" />
                        </Button>
                    </Card.CardFooter>
                </Card.Card>
            ))}
        </div>
    );
}
