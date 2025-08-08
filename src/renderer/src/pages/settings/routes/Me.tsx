import { useState } from "react";
import OldDataModal from "./components/OldDataModal";
import { Button } from "@/components/ui/button";

export default function Me() {
    const [openModal, setOpenModal] = useState(false)
    return (
        <div>
            <h1 className="text-2xl font-bold">My account</h1>
            <Button onClick={() => setOpenModal(true)}>
                Verify Backup
            </Button>
            <OldDataModal open={openModal} setOpen={setOpenModal} />
        </div>
    )
}
