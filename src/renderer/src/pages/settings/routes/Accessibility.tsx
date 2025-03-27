import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMusicPath } from "@/contexts/MusicPathProvider";
import { AlertCircle, RotateCcw, SquarePen } from "lucide-react";

export default function StorageSettings() {
  const { musicPath, changePath, resetPath, defaultPath, isLoading } = useMusicPath();

    return (
        <div>
            <h1 className="text-2xl font-bold">Music Storage Settings</h1>

            <div className="mt-4">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">Storage Directory</h2>
                <Card className="w-full bg-zinc-900 border-zinc-700">
                    <CardContent className="p-6">
                        {defaultPath &&
                            <>
                                <div className="flex gap-2 mb-4">
                                    <div>
                                        <AlertCircle className="text-yellow-400" />
                                    </div> 
                                    <div>
                                        <p>It is recommended to change the default path to prevent your stored music from being deleted in future updates.</p>
                                    </div>
                                </div>
                                <Separator className="mb-4" />
                            </>
                        }
                        <div className="space-y-2">
                            <div>
                                <Label>Path</Label>
                                <Input type="text" value={musicPath} disabled />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={changePath} disabled={isLoading}>
                                    {isLoading ? <Spinner /> : <SquarePen />}
                                    Change
                                </Button>
                                <Button onClick={resetPath} variant={"destructive"} disabled={isLoading}>
                                    {isLoading ? <Spinner /> : <RotateCcw />}
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
