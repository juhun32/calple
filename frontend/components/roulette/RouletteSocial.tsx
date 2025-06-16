"use client";

import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Bookmark, Heart, MessageCircle, Plus, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// components
import Image from "next/image";

// hooks
import { usePosts } from "@/lib/hooks/useIdeas";

export default function RouletteSocial() {
    const { allPosts, loading, error } = usePosts();

    if (loading && allPosts.length === 0) {
        // Show loading only on initial load or when posts are empty
        return <div className="w-full text-center p-4">Loading posts...</div>;
    }

    if (error) {
        return (
            <div className="w-full text-center p-4 text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col overflow-y-auto h-full p-8 gap-4">
            <div className="flex flex-col gap-4">
                {allPosts.map((post) => (
                    <Card.Card key={post.id} className="w-full">
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
        </div>
    );
}
