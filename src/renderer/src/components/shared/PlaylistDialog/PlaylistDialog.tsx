import { z } from "zod";
import { 
    AlertDialog, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogCancel 
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../ui/input";
import { useEffect, useRef, useState } from "react";
import { Playlist } from "@core/types/data";
import { useData, useMusicPath } from "@/contexts";
import { toast } from "sonner";

interface PlaylistDialogProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    data?: Playlist | null;
}

const FormSchema = z.object({
    title: z.string().min(1, {
        message: "No envie este campo vacio."
    }),
    cover: z.string().optional().nullable(),
});  


export function PlaylistDialog({ isOpen, setIsOpen, data }: PlaylistDialogProps) {
    const [loading, setLoading] = useState(false);
    const { playlists, setPlaylists } = useData();
    const { musicPath } = useMusicPath();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            cover: null,
        },
    })
        
    useEffect(() => {
        if (data) {
            form.reset({
                title: data.title,
            });
        }
    }, [data]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        setLoading(true);
        try {
            const functionToCall = data !== undefined ? window.api.updatePlaylist(data?.id, values.title, values.cover) : window.api.createPlaylist(values.title, values.cover);
            const response = await functionToCall;
            if(response){
                console.log(response);
                
                toast.success("Your playlist has been created successfully")
                
                if (data) {
                    // Actualizar la playlist en la lista actual
                    const updatedPlaylists = playlists.map(playlist => 
                        playlist.id === data.id ? response : playlist
                    );

                    setTimeout(() => {
                        setPlaylists(updatedPlaylists);
                    }, 200);
                } else {
                    // Añadir la nueva playlist
                    setTimeout(() => {
                        setPlaylists([...playlists, response]);
                    }, 200);
                }

                setIsOpen(false);
                form.reset({
                    title: "",
                    cover: null,
                });
                
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Error: An unknown error occurred")
            }

            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleImageChange = (file: File | undefined) => {
        if (file) {
            // Verifica que sea cualquier tipo de imagen
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file.");
                return;
            }

            // Convertir la imagen a base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                form.setValue("cover", base64Image);
                form.trigger("cover");
            };
            reader.readAsDataURL(file);
        } else {
            form.setValue("cover", undefined);
        }
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{data ? "Update": "Create"} a playlist</AlertDialogTitle>
                    <AlertDialogDescription>
                        {data ? "Update the playlist information" : "Create a new playlist for your favorite songs"}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="cover"
                            render={({ field }) => (
                                <FormItem className='col-span-2 sm:col-span-1'>
                                    <FormLabel>Cover</FormLabel>
                                    <FormControl>
                                        <div 
                                            className="flex flex-col gap-4" 
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleImageChange(e.dataTransfer.files[0]);
                                            }}
                                            onDragOver={handleDragOver}
                                        >
                                            <div className="flex flex-col focus:bg-black gap-2 p-4 min-h-20 border-2 border-dashed rounded-lg text-center items-center justify-center">
                                                <div className="w-24 h-24 rounded-lg">
                                                    <img src={field.value ? field.value : data ? `safe-file://${musicPath}/img/playlists/${data?.cover}` : "img/placeholder.svg"} alt="Default playlist image" className="rounded-lg object-cover object-center w-full h-full" />
                                                </div>
                                                <span className="text-muted-foreground">Drop file of type (PNG, JPEG and WEBP) or click <button type="button" className="text-primary-foreground hover:underline hover:text-primary" onClick={() => fileInputRef.current?.click()}>Here</button></span>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => handleImageChange(e.target.files?.[0])}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem >
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            placeholder="Name of the playlist"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <AlertDialogFooter>
                            <Button 
                                disabled={loading} 
                                className="text-primary-foreground"
                                type="submit"
                            >
                                {data ? "Update" : "Create"}
                            </Button>
                            <AlertDialogCancel 
                                onClick={() => {
                                    setIsOpen(false);
                                    form.reset({
                                        title: "",
                                        cover: null,
                                    });
                                }}
                            >
                                Cancel
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
