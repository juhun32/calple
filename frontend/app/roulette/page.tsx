import * as Resizable from "@/components/ui/resizable";

import RouletteCards from "@/components/roulette/RouletteCards";
import RouletteSocial from "@/components/roulette/RouletteSocial";

export default function Roulette() {
    return (
        <div className="container h-full px-8 pt-20 pb-16 mx-auto flex flex-col gap-4">
            <Resizable.ResizablePanelGroup
                direction="horizontal"
                className="rounded-lg border w-full"
            >
                <Resizable.ResizablePanel defaultSize={50}>
                    <Resizable.ResizablePanelGroup direction="vertical">
                        <Resizable.ResizablePanel defaultSize={75}>
                            <div className="flex flex-col h-full items-center justify-center p-6">
                                <p>Welcome to Community Roulette!</p>
                                <p className="text-sm text-muted-foreground">
                                    This is a fun way to discover new ideas for
                                    your next date. Roulette contains a variety
                                    of date ideas from community users, you can
                                    also contribute your own ideas to the
                                    community.
                                </p>
                                <RouletteCards />
                            </div>
                        </Resizable.ResizablePanel>

                        <Resizable.ResizableHandle withHandle />

                        <Resizable.ResizablePanel defaultSize={25}>
                            <div className="flex flex-col h-full items-center justify-center p-6">
                                <p>Recently Added Ideas</p>
                                <p className="text-sm text-muted-foreground">
                                    Check out the latest ideas added by the
                                    community.
                                </p>
                            </div>
                        </Resizable.ResizablePanel>
                    </Resizable.ResizablePanelGroup>
                </Resizable.ResizablePanel>

                <Resizable.ResizableHandle withHandle />

                <Resizable.ResizablePanel
                    defaultSize={50}
                    className="flex items-center justify-center"
                >
                    <div className="flex items-center justify-center p-6 w-full h-full min-w-xs max-w-xl">
                        <RouletteSocial />
                    </div>
                </Resizable.ResizablePanel>
            </Resizable.ResizablePanelGroup>
        </div>
    );
}
