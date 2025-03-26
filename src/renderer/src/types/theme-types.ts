export type ThemeColors = "Zinc" | "Slate" | "Stone" | "Gray" | "Neutral" | "Red" | "Rose" | "Orange" | "Green" | "Blue" | "Yellow" | "Violet"

export interface ThemeColorStateParams {
    themeColor: ThemeColors;
    setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>>
}