import { createContext, useContext, useEffect, useState } from "react"
import { ThemeColors } from "@/types/theme-types"
import { allColorThemes, detectSystemTheme } from "@/lib/theme-colors"
// import setGlobalColorTheme from "@/lib/theme-colors";

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColor?: ThemeColors // Default color theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  themeColor: ThemeColors // Añadir color al estado
  setTheme: (theme: Theme) => void
  setThemeColor: (color: ThemeColors) => void; // Añadir setter para color
}

const initialState: ThemeProviderState = {
  theme: "system",
  themeColor: "Zinc", // Valor por defecto
  setTheme: () => null,
  setThemeColor: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColor = "Zinc", // Color por defecto
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  
  const [themeColor, setThemeColor] = useState<ThemeColors>(
    () => (localStorage.getItem(`${storageKey}-color`) as ThemeColors) || defaultColor
  );

  // Efecto para que funcione con las clases establecidas en el index.css
  useEffect(() => {
    const root = window.document.documentElement;

    // Función para aplicar la clase de tema
    const applyTheme = (theme: Theme) => {
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = detectSystemTheme();
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    // Remover todas las posibles clases de color
    allColorThemes.forEach((color) => {
      root.classList.remove(`theme-${color.toLowerCase()}`);
    });

    // Aplicar tema y color
    applyTheme(theme);
    root.classList.add(`theme-${themeColor.toLowerCase()}`);

    // Escuchar cambios en el esquema de color del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, themeColor]);


  // Efecto para que funcione con el archivo de colores con constantes
  // useEffect(() => {
  //   const root = window.document.documentElement;

  //   root.classList.remove("light", "dark");

  //   if (theme === "system") {
  //     const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  //       ? "dark"
  //       : "light";
  //     root.classList.add(systemTheme);
  //   } else {
  //     root.classList.add(theme);
  //   }

  //   // Aplicar el tema de color
  //   setGlobalColorTheme(theme === "system" ? "light" : theme, themeColor);
  // }, [theme, themeColor]);

  const value = {
    theme,
    themeColor,
    setTheme: (theme: Theme) => {
      localStorage.setItem(`${storageKey}`, theme);
      setTheme(theme);
    },
    setThemeColor: (color: ThemeColors) => {
      localStorage.setItem(`${storageKey}-color`, color);
      setThemeColor(color);
    },
  };


  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
