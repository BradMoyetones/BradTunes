import { useTheme } from "@/components/theme-provider"
import { allColorThemes } from "@/lib/theme-colors"
import { ThemeColors } from "@/types/theme-types"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Check, Monitor } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
  

export default function Appearance() {
    const { theme, setTheme } = useTheme()

    return (
        <TooltipProvider delayDuration={0}>
            <div>
                <h1 className="text-2xl font-bold">Appearance</h1>
                <div className="mt-4">
                    <h2 className="text-base font-extrabold text-muted-foreground mb-4">Theme</h2>
                    <div className="flex gap-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className={`bg-zinc-900 aspect-square h-16 w-16 rounded-full ${theme === "dark" ? "border-primary" : "border-transparent"} border-2 relative`}
                                    onClick={() => setTheme("dark")}
                                >
                                    <span className="sr-only">Dark</span>
                                    {theme === "dark" && (
                                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 text-primary-foreground">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[1000] bg-slate-200 text-zinc-900 dark:bg-card dark:text-white">
                                <p>Dark</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className={`bg-white aspect-square h-16 w-16 rounded-full ${theme === "light" ? "border-primary" : "border-transparent"} border-2 relative`}
                                    onClick={() => setTheme("light")}
                                >
                                    <span className="sr-only">Light</span>
                                    {theme === "light" && (
                                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 text-primary-foreground">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[1000] bg-slate-200 text-zinc-900 dark:bg-card dark:text-white">
                                <p>Light</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className={`bg-slate-200 dark:bg-zinc-900 flex items-center justify-center aspect-square h-16 w-16 rounded-full ${theme === "system" ? "border-primary" : "border-transparent"} border-2 relative`}
                                    onClick={() => setTheme("system")}
                                >
                                    <span className="sr-only">Light</span>
                                    <Monitor />
                                    {theme === "system" && (
                                        <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 text-primary-foreground">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="z-[1000] bg-slate-200 text-zinc-900 dark:bg-card dark:text-white">
                                <p>System</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="mt-4">
                    <h2 className="text-base font-extrabold text-muted-foreground mb-4">Color</h2>
                    {/* <div className="flex flex-wrap gap-4"> */}
                        <Carousel className="overflow-hidden w-full group">
                            <CarouselContent>
                                {[...allColorThemes].reverse().map((color) => (
                                    <CarouselItem key={color} className="md:basis-1/2 lg:basis-1/3 group w-fit ">
                                        <CardColor color={color} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="translate-x-14 group-hover:!opacity-100 !opacity-0 transition-all" />
                            <CarouselNext className="-translate-x-20 group-hover:!opacity-100 !opacity-0 transition-all" />
                        </Carousel>
                    {/* </div> */}
                </div>
            </div>
        </TooltipProvider>
    )
}

const CardColor = ({color}: {color: ThemeColors}) => {
    const { themeColor, setThemeColor } = useTheme()

    const img = (
        color === "Zinc" || 
        color === "Slate" || 
        color === "Stone" ||
        color === "Gray" ||
        color === "Neutral") ? "img/themes/zinc.png" : `img/themes/${color.toLowerCase()}.png`;

    return (
        <div className="flex flex-col aspect-video w-48" onClick={() => setThemeColor(color  as ThemeColors)}>
            <img src={`${img}`} alt={color} className={`rounded-lg ${themeColor === color ? "border-primary": "cursor-pointer border-transparent"} border-4`} />

            <h3 className="flex items-center mt-2">
                <div className={`bg-${color.toLowerCase()}-600 w-6 h-6 flex-none rounded-full mr-2`}></div><span>{color}</span>
            </h3>
        </div>
    )
}