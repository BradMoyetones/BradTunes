import { CardPlayButton } from "@/components/CardPlayButton";
import { colors } from "@/lib/colors";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField } from "@/components/ui/form";
import ToastNotification from "@/components/ToastNotification";
import { ArrowLeft, Bug, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/contexts/PlayerProvider";
import { SongFull } from "@/types/data";
import { useData } from "@/contexts/DataProvider";
import { useMusicPathStore } from "@/store/useMusicPathStore";

// Actualización del schema para aceptar un archivo de imagen
const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Dont send this field empty."
    }),
    artist: z.string().min(1, {
        message: "Dont send this field empty."
    }),
    image: z.string().min(1, {
        message: "Dont send this field empty."
    }).optional(),
});

export default function EditSong() {
    const { currentMusic, setCurrentMusic } = usePlayer();
    const { playlists, setSongs } = useData();
    
    const { id, playlistSongId } = useParams<{ id: string, playlistSongId: string }>();
    const [ randomColorKey, setRandomColorKey ] = useState("");
    const [ song, setSong ] = useState<SongFull | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const navigate = useNavigate()
    const { musicPath } = useMusicPathStore();

    const playlist = playlists.find((data) => data.id === Number(playlistSongId))

    const getSong = async() => {
        const response = await window.api.getSongById(Number(id));
        return setSong(response)
    }

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
            artist: "",
            image: undefined,
        },
    })

    useEffect(() => {
        if (song) {
            form.reset({
                title: song.title,
                artist: song.artist,
                image: undefined,
            });
        }
    }, [song, form]);

    useEffect(() => {
        // Establecer una clave de color aleatoria
        const colorKey = Object.keys(colors)[Math.floor(Math.random() * Object.keys(colors).length)];
        setRandomColorKey(colorKey);
        getSong()
    }, []);

    // Evitar que randomColor sea undefined si randomColorKey es vacío o no válido
    const randomColor: {accent: string, dark: string} | null = randomColorKey ? colors[randomColorKey] : null;

    // Función para manejar los cambios en los campos editable
    const handleEditableChange = (field: "title" | "artist", value: string) => {
        const currentValue = form.getValues(field).trim(); // Obtener valor actual y limpiar espacios extra
        const newValue = value.trim(); // Limpiar espacios extra del nuevo valor
    
        if (currentValue !== newValue) { // Solo actualizar si hay un cambio real
            form.setValue(field, newValue);
            form.trigger(field);
            setIsEdited(true);  // Marca el formulario como editado
        }
    };

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        // console.log("Image value:", values.image); // Verificar si el archivo es correcto
        // return
        setLoading(true);
        try {
            const updatedSong = await window.api.updateSong(Number(id), values.title, values.artist, values.image);
            if(updatedSong){

                // Actualizar la canción en `songs`
                const updatedSongs = currentMusic.songs.map(song =>
                    song.id === updatedSong.id ? updatedSong : song
                );

                // Actualizar `song` si es la misma que se está editando
                const updatedCurrentSong = currentMusic.song?.id === updatedSong.id 
                    ? updatedSong 
                    : currentMusic.song;

                setCurrentMusic({
                    ...currentMusic,
                    songs: updatedSongs,
                    song: updatedCurrentSong
                });

                // Actualizar `setSongs`
                setSongs(prevSongs =>
                    prevSongs.map(song => 
                        song.id === updatedSong.id ? updatedSong : song
                    )
                );


                ToastNotification({
                    title: "Update successffuly",
                    description: "The song has been updated successfully",
                    Icon: Music,
                })
                setIsEdited(false);  // Resetear la edición
            }
        } catch (error) {
            if (error instanceof Error) {
                ToastNotification({
                    title: "Update failed",
                    description: error.message,
                    Icon: Bug,
                })
            } else {
                ToastNotification({
                    title: "Update failed",
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
            // Cargar la vista previa
            setPreviewImage(URL.createObjectURL(file));
    
            // Convertir la imagen a base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                // Establecer el valor en el formulario
                form.setValue("image", base64Image);
                form.trigger('image');
                setIsEdited(true);  // Marca el formulario como editado
            };
            reader.readAsDataURL(file); // Convierte el archivo a base64
        } else {
            // Si no hay archivo, resetear la imagen
            setPreviewImage(null);
            form.setValue("image", undefined);
        }
    };
    
    return (
        <div 
            style={{
                backgroundColor: randomColor?.accent,
                viewTransitionName: `box-song-${id}`
            }}
            className="relative flex flex-col h-full bg-slate-200 dark:bg-zinc-900 bg-gradient-to-t from-50% from-slate-200 via-zinc-200/80 dark:from-zinc-900 dark:via-zinc-900/80 rounded-lg"
        >
            <Button
                size={"icon"}
                className="sticky top-4 left-4"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft />
            </Button>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-center px-6 mx-auto h-full">
                    <div className="flex flex-col justify-center gap-4 px-6 z-50 mx-auto h-full">
                        <picture className="aspect-square w-80 h-80 flex-none mx-auto relative group hover:scale-95 transition-transform">
                            <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/20 z-10 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all flex items-center justify-center"></div>
                            <FormField
                                control={form.control}
                                name="image"
                                render={({  }) => (
                                    <label className="cursor-pointer">
                                        <img
                                            src={`safe-file://${musicPath}/img/${previewImage || song?.image}`}
                                            alt={`Cover of ${song?.title}`}
                                            className="object-cover w-full h-full shadow-lg rounded-lg"
                                            style={{
                                                viewTransitionName: `song-image-${id}`,
                                            }}
                                        />
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={
                                                (e) => {
                                                    handleImageChange(e.target.files?.[0]);
                                                }
                                            }
                                        />
                                    </label>
                                )}
                            />
                        </picture>
                        {form.formState.errors && form.formState.errors.image && <p className="text-red-500">{form.formState.errors.image.message}</p>}

                        <div className="flex flex-col justify-between">
                            <div className="flex-1 flex items-center justify-center">
                                
                                <div className="text-sm text-gray-600 dark:text-gray-300 font-normal text-center">
                                    <h2 className="text-center mx-auto mb-2">Song</h2>
                                    <h1 className="text-4xl font-bold block text-zinc-900 dark:text-white max-w-[400px]">
                                        <span
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleEditableChange('title', e.target.innerText)}
                                            style={{
                                                viewTransitionName: `song-title-${id}`,
                                                display: 'inline-block',
                                            }}
                                            className="focus:outline-none focus:bg-black/10 dark:focus:bg-black/40 focus:ring-2 focus:ring-primary p-1 rounded-md hover:scale-95 transition-transform"
                                        >
                                            {form.watch('title')}
                                        </span>
                                    </h1>
                                    {form.formState.errors && form.formState.errors.title && <p className="text-red-500">{form.formState.errors.title.message}</p>}

                                    <h2 className="hover:scale-95 transition-transform">
                                        <span
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleEditableChange('artist', e.target.innerText)}
                                            className="text-lg focus:outline-none focus:bg-black/10 dark:focus:bg-black/40 focus:ring-2 focus:ring-primary p-1 rounded-md "
                                            style={{ viewTransitionName: `song-artist-${id}` }}
                                        >
                                            {form.watch('artist')}
                                        </span>
                                    </h2>
                                    
                                    {form.formState.errors && form.formState.errors.artist && <p className="text-red-500">{form.formState.errors.artist.message}</p>}
                                    
                                    <p 
                                        className="mt-1" 
                                        style={{ viewTransitionName: `song-duration-${id}` }}
                                    
                                    >
                                        {song?.duration}
                                    </p>
                                </div>
                                    
                            </div>
                        </div>
                        <div className="mx-auto">
                            {song && (
                                <CardPlayButton song={song} playlist={playlist} />
                            )}
                            
                        </div>

                        {isEdited && (
                            <div className="mx-auto mt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Actualizar"}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
            </Form>
            
        </div>
    )
}
