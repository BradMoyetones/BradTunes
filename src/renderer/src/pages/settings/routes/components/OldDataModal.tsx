"use client"

import type React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMusicPath, useData as useOldData } from "@/contexts" // Assuming this context provides oldData
import { List, Music } from "lucide-react"
import type { SetStateAction } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type OldDataModalProps = {
    open: boolean
    setOpen: React.Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
    songs: z.array(z.object({
        id: z.number()
    })),
    playlists: z.array(z.object({
        id: z.number()
    })),
    playlistSongs: z.array(z.object({
        id: z.number()
    }))
})

export default function OldDataModal({ open, setOpen }: OldDataModalProps) {
    const { oldData } = useOldData()
    const { musicPath } = useMusicPath()
    const { oldSongs, oldPlaylistSongs, oldPlaylists } = oldData

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            songs: [],
            playlists: [],
            playlistSongs: []
        },
    })

    const findSong = (id: string) => {
        return oldSongs.find((value) => value.id === id)
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        
        console.log(values)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="z-[9999]">
                <DialogHeader>
                    <DialogTitle>This is your backup</DialogTitle>
                    <DialogDescription>Select the songs and playlists you want to save</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs defaultValue="songs">
                            <ScrollArea>
                                <div className="max-h-[calc(70vh)] relative">
                                    <TabsList className="w-full sticky top-0 backdrop-blur-lg bg-background/20 space-x-2">
                                        <TabsTrigger value="songs">
                                            <Music className="h-4 w-4" />
                                            Songs
                                        </TabsTrigger>
                                        <TabsTrigger value="playlists">
                                            <List className="h-4 w-4" />
                                            Playlists
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="songs">
                                        <FormField
                                            control={form.control}
                                            name="songs"
                                            render={({field}) => {
                                                const toggleSong = (id: number) => {
                                                    const exists = field.value.some(value => value.id === id);

                                                    if (exists) {
                                                        // Quitar del array
                                                        field.onChange(field.value.filter(value => value.id !== id));
                                                    } else {
                                                        // Añadir al array
                                                        field.onChange([...field.value, { id }]);
                                                    }
                                                    form.trigger("songs")
                                                };
                                                
                                                return (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="grid gap-2 pt-2">
                                                                {oldSongs.map((song, index) => {
                                                                    const checked = field.value.some(value => value.id === Number(song.id));
                                                                    return (
                                                                        <Label
                                                                            key={song.id + "-" + index}
                                                                            className="hover:bg-accent/50 flex items-start gap-3 rounded-md border p-2 has-[[aria-checked=true]]:border-accent has-[[aria-checked=true]]:bg-accent"
                                                                        >
                                                                            <Checkbox
                                                                                id={song.id}
                                                                                checked={checked}
                                                                                onCheckedChange={() => toggleSong(Number(song.id))}
                                                                                className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                                            />
                                                                            <div className="flex items-center gap-2">
                                                                                <img 
                                                                                    src={`safe-file://${musicPath}/img/${song.image}`}
                                                                                    alt="" 
                                                                                    className="size-10 object-cover object-center rounded"
                                                                                />
                                                                                <div className="grid gap-1.5 font-normal">
                                                                                    <p className="text-sm leading-none font-medium line-clamp-1">{song.title}</p>
                                                                                    <p className="text-muted-foreground text-sm">
                                                                                        {song.artist} / MP3 {song.video && "& MP4"}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </Label>
                                                                    )
                                                                })}
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    </TabsContent>
                                    <TabsContent value="playlists">
                                        {oldPlaylists.length > 0 ? (
                                            <Accordion type="multiple" className="w-full">
                                                <FormField
                                                    control={form.control}
                                                    name="playlists"
                                                    render={({field}) => {
                                                        const togglePlaylist = (id: number) => {
                                                            const exists = field.value.some(value => value.id === id);

                                                            if (exists) {
                                                                // Quitar del array
                                                                field.onChange(field.value.filter(value => value.id !== id));
                                                            } else {
                                                                // Añadir al array
                                                                field.onChange([...field.value, { id }]);
                                                            }
                                                            form.trigger("playlists")
                                                        };

                                                        const togglePlaylistSong = (id: number) => {
                                                            const exists = field.value.some(value => value.id === id);

                                                            if (exists) {
                                                                // Quitar del array
                                                                field.onChange(field.value.filter(value => value.id !== id));
                                                            } else {
                                                                // Añadir al array
                                                                field.onChange([...field.value, { id }]);
                                                            }
                                                            form.trigger("playlistSongs")
                                                        };
                                                        
                                                        return (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="grid gap-2 pt-2">
                                                                        {oldPlaylists.map((playlist) => {
                                                                            const checked = field.value.some(value => value.id === Number(playlist.id));

                                                                            return (
                                                                                <AccordionItem key={playlist.id} value={playlist.id}>
                                                                                    <AccordionTrigger className="flex items-center hover:no-underline">
                                                                                        <div className="flex gap-3">
                                                                                            <Checkbox
                                                                                                id={`playlist-${playlist.id}`}
                                                                                                checked={checked}
                                                                                                onCheckedChange={() => togglePlaylist(Number(playlist.id))}
                                                                                                className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                                                                onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling when checkbox is clicked
                                                                                            />
                                                                                            <div className="grid gap-1.5 font-normal text-left">
                                                                                                <p className="text-sm leading-none font-medium">{playlist.title}</p>
                                                                                                <p className="text-muted-foreground text-sm">{playlist.date}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </AccordionTrigger>
                                                                                    <AccordionContent className="px-4 py-2 border-t">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name="playlists"
                                                                                            render={({field: fieldTwo}) => {
                                                                                                return (
                                                                                                    <FormItem>
                                                                                                        <FormControl>
                                                                                                            <div className="grid gap-2">
                                                                                                                {oldPlaylistSongs
                                                                                                                    .filter((ps) => ps.playlistId === playlist.id)
                                                                                                                    .map((playlistSong, index) => {
                                                                                                                        const song = findSong(playlistSong.songId)
                                                                                                                        const checked = fieldTwo.value.some(value => value.id === Number(playlistSong.id));

                                                                                                                        if (!song) return null // Handle case where song might not be found
                                                                                                                        return (
                                                                                                                            <Label
                                                                                                                                key={playlistSong.id + "-" + index}
                                                                                                                                className="hover:bg-accent/50 flex items-start gap-3 rounded-md border p-2 has-[[aria-checked=true]]:border-accent has-[[aria-checked=true]]:bg-accent"
                                                                                                                            >
                                                                                                                                <Checkbox
                                                                                                                                    id={String(playlistSong.id)}
                                                                                                                                    checked={checked}
                                                                                                                                    onCheckedChange={() => togglePlaylistSong(Number(playlistSong.id))}
                                                                                                                                    className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                                                                                                />
                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                    <img 
                                                                                                                                        src={`safe-file://${musicPath}/img/${song.image}`}
                                                                                                                                        alt="" 
                                                                                                                                        className="size-10 object-cover object-center rounded"
                                                                                                                                    />
                                                                                                                                    <div className="grid gap-1.5 font-normal">
                                                                                                                                        <p className="text-sm leading-none font-medium line-clamp-1">{song.title}</p>
                                                                                                                                        <p className="text-muted-foreground text-sm">
                                                                                                                                            {song.artist} / MP3 {song.video && "& MP4"}
                                                                                                                                        </p>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </Label>
                                                                                                                        )
                                                                                                                    }
                                                                                                                )}
                                                                                                            </div>
                                                                                                        </FormControl>
                                                                                                        <FormMessage />
                                                                                                    </FormItem>
                                                                                                )
                                                                                            }}
                                                                                        />
                                                                                        
                                                                                        {oldPlaylistSongs.filter((ps) => ps.playlistId === playlist.id).length === 0 && (
                                                                                            <div className="text-muted-foreground p-4 flex flex-col items-center justify-center gap-2">
                                                                                                <Music className="h-5 w-5" />
                                                                                                No songs in this playlist
                                                                                            </div>
                                                                                        )}
                                                                                    </AccordionContent>
                                                                                </AccordionItem>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            </Accordion>
                                        ) : (
                                            <div className="text-muted-foreground p-4 flex flex-col items-center justify-center gap-2">
                                                <List className="h-5 w-5" />
                                                No playlists found
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </form>
                </Form>
                <DialogFooter>
                    <Button onClick={form.handleSubmit(onSubmit)}>
                        Restore backup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
