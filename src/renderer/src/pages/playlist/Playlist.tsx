import { useParams } from "react-router-dom";
import { PlaylistProvider } from "./contexts";
import PlaylistView from "./PlaylistView";

export default function Playlist() {
    const { id } = useParams<{ id: string }>();

    return (
        <PlaylistProvider id={id}>
            <PlaylistView />
        </PlaylistProvider>
    );
}
