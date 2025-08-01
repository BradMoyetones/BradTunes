import { useContext } from "react";
import { VersionContext } from "./VersionContext";

export function useVersion() {
    const context = useContext(VersionContext);
    if (!context) {
        throw new Error("useVersion must be used within a VersionProvider");
    }
    return context;
}
