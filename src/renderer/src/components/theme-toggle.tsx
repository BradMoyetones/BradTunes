import { useTheme } from "@/components/theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeColors } from "@/types/theme-types";
import { allColorThemes } from "@/lib/theme-colors";

export function ThemeColorSelector() {
  const { themeColor, setThemeColor } = useTheme();

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
                <span className={`bg-${themeColor.toLocaleLowerCase()}-600 w-6 h-6 flex-none rounded-full`}></span><span className="sr-only">{themeColor}</span>
                {/* <span className={`bg-primary w-6 h-6 flex-none rounded-full`}></span><span className="sr-only">{themeColor}</span> */}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {allColorThemes.map((color) => (
                <DropdownMenuItem key={color} onClick={() => setThemeColor(color  as ThemeColors)} className={`${themeColor === color ? "bg-secondary": "cursor-pointer"}`}>
                    <span className={`bg-${color.toLowerCase()}-600 w-6 h-6 flex-none rounded-full mr-2`}></span><span>{color}</span>
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
