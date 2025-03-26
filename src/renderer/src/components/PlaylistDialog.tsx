import { z } from "zod";
import { 
    AlertDialog, 
    AlertDialogContent, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogCancel 
} from "./ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ToastNotification from "./ToastNotification";
import Library from "@/icons/Library";
import { Bug } from "lucide-react";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { PlaylistsFull } from "@/types/data";
import { colors } from "@/lib/colors";
import { useData } from "@/contexts/DataProvider";

interface PlaylistDialogProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    data?: PlaylistsFull | null;
}

// Define el esquema para los colores
const ColorSchema = z.object({
    accent: z.string().min(1, { message: "Accent color is required." }),
    dark: z.string().min(1, { message: "Dark color is required." }),
});

const FormSchema = z.object({
    title: z.string().min(1, {
        message: "No envie este campo vacio."
    }),
    color: ColorSchema,
    cover: z.string().optional().nullable(),
});  


export default function PlaylistDialog({ isOpen, setIsOpen, data }: PlaylistDialogProps) {
    const [loading, setLoading] = useState(false);
    const { playlists, setPlaylists } = useData();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            color: {
                accent: "",
                dark: ""
            },
            cover: null,
        },
    })
        
    useEffect(() => {
        if (data) {
            form.reset({
                title: data.title,
                color: {
                    accent: data.color.accent,
                    dark: data.color.dark,
                },
                cover: data.cover,
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
            const functionToCall = data !== undefined ? window.api.updatePlaylist(data?.id, values.title, values.color, values.cover) : window.api.createPlaylist(values.title, values.color, values.cover);
            const response = await functionToCall;
            if(response){
                console.log(response);
                
                ToastNotification({
                    title: "Playlist created",
                    description: "Your playlist has been created successfully",
                    Icon: Library,
                })
                
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
                    color: {
                        accent: "",
                        dark: ""
                    },
                    cover: null,
                });
                
            }
        } catch (error) {
            if (error instanceof Error) {
                ToastNotification({
                    title: "Create failed",
                    description: error.message,
                    Icon: Bug,
                })
            } else {
                ToastNotification({
                    title: "Create failed",
                    description: "Error: An unknown error occurred",
                    Icon: Bug,
                })
            }

            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleImageChange = (file: File | undefined) => {
        if (file) {
            // Verificar si el archivo es una imagen válida
            const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
            const maxFileSize = 500 * 1024; // 500 KB en bytes
    
            if (!validImageTypes.includes(file.type)) {
                ToastNotification({
                    title: "Invalid file",
                    description: "Please upload an image of type JPG, JPEG, PNG, or WEBP.",
                    Icon: Bug,
                });
                return;
            }
    
            if (file.size > maxFileSize) {
                ToastNotification({
                    title: "File too large",
                    description: "The image size must not exceed 500 KB.",
                    Icon: Bug,
                });
                return;
            }
    
            // Convertir la imagen a base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                // Establecer el valor en el formulario
                form.setValue("cover", base64Image);
                form.trigger("cover");
            };
            reader.readAsDataURL(file); // Convierte el archivo a base64
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
                                                    <img src={field.value ? field.value : data ? data?.cover : "img/IMG_4101.jpg"} alt="Default playlist image" className="rounded-lg object-cover object-center w-full h-full" />
                                                </div>
                                                <span className="text-muted-foreground">Drop file of type (PNG, JPEG and WEBP)</span>
                                            </div>
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
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Select 
                                            onValueChange={(e) => {
                                                const selectedColor = colors[e as keyof typeof colors];
                                                field.onChange(selectedColor || data); // Asigna el objeto del color seleccionado
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Theme of the playlist" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-48">
                                                <SelectGroup>
                                                    <SelectLabel>Color Schema</SelectLabel>
                                                    {Object.entries(colors).map(([key, value]) => (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center gap-4">
                                                                <div style={{backgroundColor: value.accent}} className="w-4 h-4 aspect-square rounded-full"></div> {key}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
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
                                        color: {
                                            accent: "",
                                            dark: ""
                                        },
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
