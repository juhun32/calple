"use client";
import { use, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Bookmark,
    CalendarIcon,
    Frame,
    List,
    PictureInPicture,
    Plus,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Resizable from "@/components/ui/resizable";
import * as AlertDialog from "@/components/ui/alert-dialog";

import RouletteCards from "@/components/roulette/RouletteCards";
import RouletteSocial from "@/components/roulette/RouletteSocial";

// hooks
import { usePosts } from "@/lib/hooks/useIdeas";

// types
import { NewIdeaData } from "@/lib/types/ideas";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { set } from "date-fns";

export default function Roulette() {
    const { addPost, editPost, deletePost, posts } = usePosts();

    // state for add post form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hashtag, setHashtag] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [viewList, setViewList] = useState(false);

    useEffect(() => {
        if (!isAdding) {
            setTitle("");
            setDescription("");
            setHashtag(null);
            setSelectedImage(null);
            setImagePreview(null);
        }
    }, [isAdding]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedImage(null);
            setImagePreview(null);
        }
    };

    // clean up effect to revoke object URL when component unmounts or image changes
    // to prevent memory leaks by releasing the object URL created for the image preview
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleAddPost = async () => {
        if (!title) {
            console.error("Title is required.");
            return;
        }

        setIsSubmitting(true);

        const newPostData: NewIdeaData = {
            title: title,
            description: description,
            tags: hashtag ? [hashtag] : [],
        };

        if (selectedImage) {
            console.log("Selected image for upload:", selectedImage.name);

            // pipeline for image upload is not implemented yet

            // const imageUrl = await uploadImage(selectedImage);
            // newPostData.image_url = imageUrl; // Then assign the URL
        }

        try {
            const added = await addPost(newPostData);
            if (added) {
                console.log("Post added:", added);
            } else {
                console.error("Failed to add post.");
            }
        } catch (apiError) {
            console.error("An error occurred while adding the post:", apiError);
        } finally {
            setIsSubmitting(false);
            setIsAdding(false);
        }
    };

    return (
        <div className="container h-full px-8 pt-20 pb-16 mx-auto flex flex-col gap-4">
            <div>
                <p className="text-bold text-lg">
                    Welcome to Community Roulette!
                </p>
                <p className="text-sm text-muted-foreground">
                    This is a fun way to discover new ideas for your next date.
                    Roulette contains a variety of date ideas from community
                    users, you can also contribute your own ideas to the
                    community.
                </p>
            </div>
            <Resizable.ResizablePanelGroup
                direction="horizontal"
                className="rounded-lg border w-full"
            >
                <Resizable.ResizablePanel defaultSize={50}>
                    <div className="flex flex-col h-full items-center justify-between p-8 gap-4">
                        <RouletteCards />

                        <div className="flex w-full h-12 items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setIsAdding(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Add to Roulette
                            </Button>

                            <AlertDialog.AlertDialog
                                open={viewList}
                                onOpenChange={setViewList}
                            >
                                <AlertDialog.AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() => setViewList(true)}
                                    >
                                        <List className="w-4 h-4" />
                                        My Roulette List
                                    </Button>
                                </AlertDialog.AlertDialogTrigger>

                                <AlertDialog.AlertDialogContent className="max-w-xl">
                                    <AlertDialog.AlertDialogHeader>
                                        <AlertDialog.AlertDialogTitle>
                                            Share your date idea
                                        </AlertDialog.AlertDialogTitle>
                                    </AlertDialog.AlertDialogHeader>
                                    <div>
                                        {posts.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {posts.map((post) => (
                                                    <div
                                                        key={post.id}
                                                        className="p-4 border rounded-md"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-semibold">
                                                                    {post.title}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        post.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    deletePost(
                                                                        post.id
                                                                    )
                                                                }
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        {post.image_url && (
                                                            <img
                                                                src={
                                                                    post.image_url
                                                                }
                                                                alt={post.title}
                                                                className="mt-2 rounded-md border"
                                                            />
                                                        )}
                                                        {post.tags &&
                                                            post.tags.length >
                                                                0 && (
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    {post.tags.map(
                                                                        (
                                                                            tag
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    tag
                                                                                }
                                                                                className="px-2 py-1 bg-accent text-xs rounded-full"
                                                                            >
                                                                                {
                                                                                    tag
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                No ideas shared yet.
                                            </div>
                                        )}
                                    </div>
                                    <AlertDialog.AlertDialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setViewList(false)}
                                        >
                                            <X className="w-4 h-4" />
                                            Close
                                        </Button>
                                    </AlertDialog.AlertDialogFooter>
                                </AlertDialog.AlertDialogContent>
                            </AlertDialog.AlertDialog>
                        </div>
                    </div>
                </Resizable.ResizablePanel>

                <Resizable.ResizableHandle withHandle />

                <Resizable.ResizablePanel
                    defaultSize={50}
                    className="flex flex-col items-center justify-center"
                >
                    <AlertDialog.AlertDialog
                        open={isAdding}
                        onOpenChange={setIsAdding}
                    >
                        <AlertDialog.AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                onClick={() => setIsAdding(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Share Date Idea
                            </Button>
                        </AlertDialog.AlertDialogTrigger>

                        <AlertDialog.AlertDialogContent className="max-w-xl">
                            <AlertDialog.AlertDialogHeader>
                                <AlertDialog.AlertDialogTitle>
                                    Share your date idea
                                </AlertDialog.AlertDialogTitle>
                            </AlertDialog.AlertDialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Selected preview"
                                            className="rounded-md border"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-md flex items-center justify-center border-2 border-dashed">
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Frame className="w-3 h-3 text-muted-foreground" />
                                                No image selected
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="image-upload">
                                            Image (Optional)
                                        </Label>

                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/png, image/jpeg, image/gif"
                                            onChange={handleImageChange}
                                            className="w-full text-xs text-muted-foreground file:mr-4 file:bg-accent  file:px-2 file:rounded-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">
                                            Location
                                        </Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            placeholder="Location"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter idea title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Describe your ideas"
                                    className="min-h-32"
                                />
                            </div>
                            <div className="flex gap-4 justify-end mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAdding(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddPost}
                                    disabled={isSubmitting || !title}
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Add Idea"}
                                </Button>
                            </div>
                        </AlertDialog.AlertDialogContent>
                    </AlertDialog.AlertDialog>
                    <Button variant="outline" onClick={() => setIsAdding(true)}>
                        <Bookmark className="w-4 h-4" />
                        Saved Ideas
                    </Button>
                    <div className="flex items-center justify-center w-full h-full min-w-xs max-w-xl">
                        <RouletteSocial />
                    </div>
                </Resizable.ResizablePanel>
            </Resizable.ResizablePanelGroup>
        </div>
    );
}
