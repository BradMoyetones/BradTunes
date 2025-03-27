import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/Spinner";
import { Check, UploadIcon } from "lucide-react";
import { useVersion } from "@/contexts/VersionContext";

export default function Advanced() {
    const { appVersion, versionInfo, loading, checkVersionApp, updateApp, checkVersion, updateYtDlp } = useVersion();

    return (
        <div>
            <h1 className="text-2xl font-bold">Advanced</h1>

            <div className="mt-4">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">Application version</h2>
                <div className="flex gap-4">
                    <Card className="w-full bg-zinc-900 border-zinc-700">
                        <CardContent className="p-6">
                            <h3 className="flex items-center gap-2 mb-4">
                                <div className={`aspect-square h-4 w-4 rounded-full ${appVersion?.newVersion ? "bg-yellow-500" : "bg-green-500"} animate-pulse`} />
                                {appVersion?.message || "Check for updates"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                <span>Current version: </span> {appVersion?.currentVersion}
                            </p>
                            <div className="flex gap-2">
                                <Button onClick={checkVersionApp} disabled={loading} className={`${appVersion?.newVersion && "hidden"}`}>
                                    {loading ? <Spinner /> : <Check />}
                                    Verify version
                                </Button>
                                {appVersion?.newVersion && (
                                    <Button onClick={updateApp} disabled={loading}>
                                        {loading ? <Spinner /> : <UploadIcon />}
                                        {loading ? "Updating..." : "Update now"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-base font-extrabold text-muted-foreground mb-4">YT-DLP version</h2>
                <div className="flex gap-4">
                    <Card className="w-full bg-zinc-900 border-zinc-700">
                        <CardContent className="p-6">
                            <h3 className="flex items-center gap-2 mb-4">
                                <div className={`aspect-square h-4 w-4 rounded-full ${versionInfo?.newVersion ? "bg-yellow-500" : "bg-green-500"} animate-pulse`} />
                                {versionInfo?.message || "Check for updates"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                <span>Current version: </span>{versionInfo?.currentVersion}
                            </p>
                            <div className="flex gap-2">
                                <Button onClick={checkVersion} disabled={loading} className={`${versionInfo?.newVersion && "hidden"}`}>
                                    {loading ? <Spinner /> : <Check />}
                                    Verify version
                                </Button>
                                {versionInfo?.newVersion && (
                                    <Button onClick={updateYtDlp} disabled={loading}>
                                        {loading ? <Spinner /> : <UploadIcon />}
                                        {loading ? "Updating..." : "Update now"}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
