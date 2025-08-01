import { Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
import { useCallback, useMemo, useState } from "react"
import { useEditorStore } from "@/store/theme/store/editor-store"
import { useThemePresetStore } from "@/store/theme/store/theme-preset-store"
import { ThemeColors } from "@/components/theme-preset-select"
import { useTheme } from "@/contexts"
  

export default function Appearance() {
    const { theme, setTheme } = useTheme();

    const themeState = useEditorStore((store) => store.themeState);
    const applyThemePreset = useEditorStore((store) => store.applyThemePreset);
    const currentPreset = themeState.preset;
    const mode = themeState.currentMode;

    const presets = useThemePresetStore((store) => store.getAllPresets());

    const [search, setSearch] = useState("");

    const isSavedTheme = useCallback(
        (presetId: string) => {
            return presets[presetId]?.source === "SAVED";
        },
        [presets]
    );

    const presetNames = useMemo(() => ["default", ...Object.keys(presets)], [presets]);
    const currentPresetName = presetNames?.find((name) => name === currentPreset);

    const filteredPresets = useMemo(() => {
        const filteredList =
          search.trim() === ""
            ? presetNames
            : presetNames.filter((name) => {
                if (name === "default") {
                  return "default".toLowerCase().includes(search.toLowerCase());
                }
                return presets[name]?.label?.toLowerCase().includes(search.toLowerCase());
              });
    
        // Separate saved and default themes
        const savedThemesList = filteredList.filter((name) => name !== "default" && isSavedTheme(name));
        const defaultThemesList = filteredList.filter((name) => !savedThemesList.includes(name));
    
        // Sort each list, with "default" at the top for default themes
        const sortThemes = (list: string[]) => {
          const defaultTheme = list.filter((name) => name === "default");
          const otherThemes = list
            .filter((name) => name !== "default")
            .sort((a, b) => {
              const labelA = presets[a]?.label || a;
              const labelB = presets[b]?.label || b;
              return labelA.localeCompare(labelB);
            });
          return [...defaultTheme, ...otherThemes];
        };
    
        // Combine saved themes first, then default themes
        return [...sortThemes(savedThemesList), ...sortThemes(defaultThemesList)];
    }, [presetNames, search, presets, isSavedTheme]);

    const filteredDefaultThemes = useMemo(() => {
        return filteredPresets.filter((name) => name === "default" || !isSavedTheme(name));
    }, [filteredPresets, isSavedTheme]);

    return (
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
                        <TooltipContent className="z-[1000]">
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
                        <TooltipContent className="z-[1000]">
                            <p>Light</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">Color</h2>

                <div className="grid grid-cols-4 gap-2">
                    {filteredDefaultThemes.length > 0 && 
                        filteredDefaultThemes.map((presetName, index) => (
                            <Card
                                key={`${presetName}-${index}`}
                                onClick={() => {
                                    applyThemePreset(presetName);
                                    setSearch("");
                                }}
                                className="flex items-center gap-2 py-2 col-span-1 bg-background"
                            >
                                <ThemeColors presetName={presetName} mode={mode} />
                                <div className="flex flex-1 items-center gap-2">
                                    <span className="text-sm font-medium capitalize">
                                        {presets[presetName]?.label || presetName}
                                    </span>
                                </div>
                                <Check className={`h-4 w-4 shrink-0 ${presetName !== currentPresetName && "opacity-0"}`} />
                            </Card>
                        ))
                    }
                </div>

            </div>
        </div>
    )
}