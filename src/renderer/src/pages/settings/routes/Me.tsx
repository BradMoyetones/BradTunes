import { useState } from "react";
import OldDataModal from "./components/OldDataModal";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts" // Assuming this context provides oldData

export default function Me() {
    const [openModal, setOpenModal] = useState(false)
    const { oldData } = useData()
    
    return (
        <div>
            <h1 className="text-2xl font-bold">My account</h1>
            <div className="mt-4">
                {(oldData.oldPlaylistSongs.length > 0 && oldData.oldSongs.length > 0 && oldData.oldPlaylists.length > 0) && (
                    <>
                        <Button onClick={() => setOpenModal(true)}>
                            Verify Backup
                        </Button>
                        <OldDataModal open={openModal} setOpen={setOpenModal} />
                    </>
                )}
            </div>
        </div>
    )
}
