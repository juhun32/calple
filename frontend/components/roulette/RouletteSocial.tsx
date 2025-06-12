"use client";

import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Bookmark, Heart, MessageCircle, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";

export default function RouletteSocial() {
    return (
        <div className="pt-8">
            <Card.Card className="w-full overflow-hidden h-fit">
                <Card.CardHeader className="">
                    <Card.CardTitle>
                        <Avatar className="w-8 h-8 rounded-full">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>
                                <Heart className="w-4 h-4" />
                            </AvatarFallback>
                        </Avatar>
                    </Card.CardTitle>
                    <Card.CardDescription></Card.CardDescription>
                </Card.CardHeader>
                <Card.CardContent className="flex flex-col">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                        <Image
                            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                            alt="Photo by Drew Beamer"
                            fill
                            className="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </AspectRatio>
                    <div className="flex items-baseline justify-between">
                        <p className="font-bold pt-1">
                            Ideas for dates from other people
                        </p>
                        <p className="text-xs text-muted-foreground">
                            2 days ago
                        </p>
                    </div>
                    <p className="text-sm pb-1">description</p>
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant="outline"
                            className="text-muted-foreground font-normal"
                        >
                            category
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-muted-foreground font-normal"
                        >
                            budget Budget
                        </Badge>
                        <Badge
                            variant="outline"
                            className="text-muted-foreground font-normal"
                        >
                            duration
                        </Badge>
                    </div>
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
                                12
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
                                5
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
        </div>
    );
}
