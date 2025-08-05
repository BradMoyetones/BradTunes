export interface VideoFullScreenContextType {
    isFullScreen: boolean;
    isButtonVisible: boolean;
    isCursorHidden: boolean;
    enterFullScreen: () => void;
    exitFullScreen: () => void;
}