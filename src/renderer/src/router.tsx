import { createHashRouter } from "react-router-dom";
import { lazy } from "react";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/home/Home";
import Settings from "./pages/settings/Settings";
import Profiles from "./pages/settings/routes/Profiles";
import Devices from "./pages/settings/routes/Devices";
import Appearance from "./pages/settings/routes/Appearance";
import Accessibility from "./pages/settings/routes/Accessibility";
import Advanced from "./pages/settings/routes/Advanced";

const Playlist = lazy(() => import("./pages/playlist/Playlist"));
const EditSong = lazy(() => import("./pages/song/EditSong"));
const Video = lazy(() => import("./pages/video/Video"));

const Me = lazy(() => import("./pages/settings/routes/Me"));

const router = createHashRouter([
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "playlist/:id",
                element: <Playlist />
            },
            {
                path: "song/:id/:playlistSongId?",
                element: <EditSong />
            },
            {
                path: "video/:id",
                element: <Video />
            },
            {
                path: "settings",
                element: <Settings />,
                children: [
                    {
                        index: true,
                        element: <Me />
                    },
                    {
                        path: "profiles",
                        element: <Profiles />
                    },
                    {
                        path: "devices",
                        element: <Devices />
                    },
                    {
                        path: "appearance",
                        element: <Appearance />
                    },
                    {
                        path: "accessibility",
                        element:  <Accessibility />
                    },
                    {
                        path: "advanced",
                        element:  <Advanced />
                    },
                ]
            },
        ]
    },
]);

export default router;