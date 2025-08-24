"use client";

import { Sad } from "@/lib/assets/sad";
import { useState, useRef, useEffect, useMemo } from "react";
import { articles } from "@/lib/constants/articles";

export const Education = () => {
    // pick 2 random articles once on mount
    const selectedArticles = useMemo(() => {
        const copy = [...articles];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy.slice(0, 2);
    }, []); // run once

    // store loaded previews keyed by href
    const [previews, setPreviews] = useState<Record<string, string | null>>({});
    // refs for each resource card to observe intersection
    const refs = useRef<Record<string, HTMLAnchorElement | null>>({});

    async function loadPreview(href: string) {
        if (previews[href] !== undefined) return;
        try {
            const res = await fetch(
                `/api/preview?url=${encodeURIComponent(href)}`
            );
            const data = await res.json();
            setPreviews((p) => ({ ...p, [href]: data.image ?? null }));
        } catch (e) {
            setPreviews((p) => ({ ...p, [href]: null }));
        }
    }

    useEffect(() => {
        if (typeof window === "undefined") return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLAnchorElement;
                        const href = el.getAttribute("data-href");
                        if (href) {
                            loadPreview(href);
                            observer.unobserve(el);
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0.1,
            }
        );

        selectedArticles.forEach((r) => {
            const el = refs.current[r.href];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section className="pb-12 md:pb-16">
            <h2 className="text-2xl font-semibold">Educational Resources</h2>
            <p className="text-sm text-muted-foreground">
                Short articles about healthy relationships and intimacy.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-3">
                {selectedArticles.map((r) => (
                    <a
                        key={r.href}
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-href={r.href}
                        ref={(el) => {
                            refs.current[r.href] = el;
                        }}
                        className="block p-3 rounded-lg bg-background border hover:shadow-md inset-shadow-sm flex gap-4"
                    >
                        <div className="w-28 h-20 flex-shrink-0 rounded overflow-hidden bg-muted/10">
                            {/* show OG image thumbnail when available */}
                            {previews[r.href] === undefined ? (
                                <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/10" />
                            ) : previews[r.href] ? (
                                <img
                                    src={previews[r.href]!}
                                    alt={r.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center border rounded-lg">
                                    <Sad className="w-full h-auto" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="grid grid-cols-[2fr_1fr] items-baseline gap-4">
                                <h3 className="text-lg font-medium truncate">
                                    {r.title}
                                </h3>
                                <span className="text-xs text-muted-foreground truncate">
                                    {r.source}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {r.summary}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
};
