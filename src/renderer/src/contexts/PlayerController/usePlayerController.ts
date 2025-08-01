import { useContext } from "react";
import { PlayerControllerContext } from "./PlayerController";

export const usePlayerController = () => {
    const ctx = useContext(PlayerControllerContext);
    if (!ctx) throw new Error("usePlayerController must be used inside PlayerControllerProvider");
    return ctx;
};
