import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistSkeletonProps } from "./PlaylistSkeleton.types";

export function PlaylistSkeleton({id}: PlaylistSkeletonProps) {
    return (
        <div
            id="playlist-container"
            className="relative flex flex-col h-full bg-gradient-to-b from-primary via-primary/80 rounded-lg overflow-auto"
            style={{ viewTransitionName: `playlist-box-${id}` }}
        >
            <div className="flex flex-row gap-8 px-6 mt-6">
                <Skeleton 
                    className="aspect-square w-52 h-52 shrink-0" 
                    style={{ viewTransitionName: `playlist-image-${id}` }}
                />
                <div className="flex flex-col justify-between">
                    <div className="flex flex-1 items-end">
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <div>
                        <Skeleton 
                            className="h-14 w-[200px] mt-2" 
                            style={{ viewTransitionName: `playlist-title-${id}` }}
                        />
                    </div>
                    <div className="flex-1 flex items-end">
                        <div className="text-sm text-muted-foreground font-normal">
                            <div>
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="mt-1">
                                <Skeleton className="h-4 w-96" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
