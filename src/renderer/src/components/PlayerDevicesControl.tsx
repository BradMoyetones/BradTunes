import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Check, Speaker } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useVideoFullScreen } from "@/contexts/VideoFullScreenContext";

export default function PlayerDevicesControl() {
    const { selectedDeviceId, setSelectedDeviceId } = usePlayerStore();
    const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
    const {isFullScreen} = useVideoFullScreen()
    

    // Función para actualizar la lista de dispositivos de salida y validar el dispositivo seleccionado
    const updateOutputDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((device) => device.kind === "audiooutput");
        setOutputDevices(audioOutputs);

        // Validar si el dispositivo seleccionado aún existe
        const isValid = audioOutputs.some((device) => device.deviceId === selectedDeviceId);
        if (!isValid) {
            const defaultDeviceId = audioOutputs[0]?.deviceId || "default";
            setSelectedDeviceId(defaultDeviceId); // Establecer el dispositivo por defecto si el actual no es válido
        }
    };

    useEffect(() => {
        // Actualizar dispositivos al cargar el componente
        updateOutputDevices();

        // Escuchar el evento devicechange
        navigator.mediaDevices.addEventListener("devicechange", updateOutputDevices);

        // Limpiar el evento cuando se desmonte el componente
        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", updateOutputDevices);
        };
    }, []);

    const handleDeviceChange = (deviceId: string) => {
        const selectedDevice = outputDevices.find(device => device.deviceId === deviceId);
        if (selectedDevice) {
            setSelectedDeviceId(deviceId);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Speaker className={`${outputDevices[0]?.deviceId === selectedDeviceId ? "opacity-50 hover:opacity-100" : "text-primary"} transition-all size-4 ${isFullScreen && "text-white"}`} />
                <span className="sr-only">
                    {outputDevices.find((device) => device.deviceId === selectedDeviceId)?.label || "Output Device"}
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {outputDevices.map((device) => (
                    <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() => handleDeviceChange(device.deviceId)}
                        className={`${
                            selectedDeviceId === device.deviceId ? "bg-secondary" : "cursor-pointer"
                        }`}
                        inset={selectedDeviceId !== device.deviceId}
                    >
                        {selectedDeviceId === device.deviceId && <Check />}
                        {device.label || "Unknown Device"}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
