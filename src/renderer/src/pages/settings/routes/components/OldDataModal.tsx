import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useData } from "@/contexts"
import { List, ListChecks, Music } from "lucide-react";
import { SetStateAction } from "react";

type OldDataModalProps = {
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>
}

export default function OldDataModal({
    open,
    setOpen
}: OldDataModalProps) {
    const {oldData} = useData()

    const {oldSongs, oldPlaylistSongs, oldPlaylists} = oldData
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="z-[9999]">
                <DialogHeader>
                    <DialogTitle>This is your backup</DialogTitle>
                    <DialogDescription>
                        Select the songs and playlists you want to save
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="songs">
                    <ScrollArea>
                        <div className="max-h-[calc(70vh)] relative">
                            <TabsList className="w-full sticky top-0 backdrop-blur-lg bg-background/20">
                                <TabsTrigger value="songs">
                                    <Music />
                                    Songs
                                </TabsTrigger>
                                <TabsTrigger value="playlists">
                                    <List />
                                    Playlists
                                </TabsTrigger>
                                <TabsTrigger value="playlistSongs">
                                    <ListChecks />
                                    Playlist Songs
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="songs">
                                    {oldSongs.map((song, index) => (
                                        <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-md border p-3 has-[[aria-checked=true]]:border-accent has-[[aria-checked=true]]:bg-accent">
                                            <Checkbox
                                                id="toggle-2"
                                                defaultChecked
                                                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                                            />
                                            <div className="grid gap-1.5 font-normal">
                                                <p className="text-sm leading-none font-medium">
                                                    {song.title}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {song.artist} / MP3 {song.video && "& MP4"}
                                                </p>
                                            </div>
                                        </Label>
                                    ))}
                            </TabsContent>
                            <TabsContent value="playlists">

                            </TabsContent>
                            <TabsContent value="playlistSongs">

                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
