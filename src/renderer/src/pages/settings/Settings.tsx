import Spinner from "@/components/Spinner";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useVersion } from "@/contexts/VersionContext";
import Search from "@/icons/Search";
import { FacebookIcon, InstagramIcon, TikTokIcon, TwitterIcon, YouTubeIcon } from "@/icons/Social";
import { X } from "lucide-react";
import { Suspense, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

interface LinkSidebarSettingsProps {
    title: string;
    href: string;
    alert: boolean;
}

interface LinkProps {
    title: string;
    links: LinkSidebarSettingsProps[]
}

export default function Settings() {
    const [search, setSearch] = useState("");
    const { appVersion } = useVersion()    

    const LINKS: LinkProps[] = [
        {
            title: "User settings",
            links: [
                {
                    title: "My account",
                    href: "/settings",
                    alert: false
                },
                {
                    title: "Profiles",
                    href: "/settings/profiles",
                    alert: false
                },
                {
                    title: "Devices",
                    href: "/settings/devices",
                    alert: false
                },
            ],
        },
        {
            title: "Application settings",
            links: [
                {
                    title: "Appearance",
                    href: "/settings/appearance",
                    alert: false
                },
                {
                    title: "Accessibility",
                    href: "/settings/accessibility",
                    alert: false
                },
                {
                    title: "Advanced",
                    href: "/settings/advanced",
                    alert: useVersion().versionInfo?.newVersion ? true : false
                },
            ],
        }
    ]

    const filteredLinks = LINKS.map((section) => ({
        ...section,
        links: section.links.filter(
            (link) =>
                link.title.toLowerCase().includes(search.toLowerCase()) ||
                section.title.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((section) => section.links.length > 0);

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-slate-100 dark:bg-zinc-900 z-[1000] flex">
            <div className="max-w-xl w-full min-h-screen mx-auto flex justify-end flex-1">


                <ScrollArea className="h-screen max-w-52 w-full !pt-16 p-2 sticky top-0">
                    <div className="relative p-0.5">
                        <Input 
                            className="bg-slate-200 dark:bg-zinc-800 pr-8 border-white dark:border-zinc-700" 
                            placeholder="Search" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute top-2.5 right-2.5 text-muted-foreground size-5" />
                    </div>

                    {filteredLinks.length > 0 ? (
                        filteredLinks.map((link) => (
                            <div key={link.title}>
                                <div className="flex flex-col gap-1 my-4">
                                    <h2 className="uppercase text-muted-foreground text-xs font-extrabold">
                                        {link.title}
                                    </h2>
                                    {link.links.map((subLink) => (
                                        <LinkSidebarSettings key={subLink.href + subLink.title} link={subLink} />
                                    ))}
                                </div>
                                <Separator className="bg-slate-300 dark:bg-zinc-700 mb-4" />
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center my-4">No results found</p>
                    )}
                    
                    <div className="py-1.5 px-2.5 flex gap-4 justify-center items-center">
                        <a href="https://www.youtube.com/@its.bradss" target="_blank">
                            <TwitterIcon className="size-4" />
                        </a>
                        <a href="https://www.facebook.com/brad.navas" target="_blank">
                            <FacebookIcon className="size-4" />
                        </a>
                        <a href="https://www.instagram.com/bradnavas_/" target="_blank">
                            <InstagramIcon className="size-4" />
                        </a>
                        <a href="https://www.youtube.com/@its.bradss" target="_blank">
                            <YouTubeIcon className="size-4" />
                        </a>
                        <a href="https://www.tiktok.com/@bradmsn" target="_blank">
                            <TikTokIcon className="size-4" />
                        </a>
                    </div>

                    <p className="text-muted-foreground text-xs text-center my-4">
                        Version: {appVersion?.currentVersion}
                    </p>
                </ScrollArea>

            </div>
            <div className="md:w-[740px] w-full mx-auto min-h-screen bg-white dark:bg-zinc-800 overflow-auto pt-16 p-8">
                <Suspense fallback={<Spinner />}>
                    <Outlet />
                </Suspense>
            </div>

            <div className="h-screen w-full !pt-16 p-2 sticky top-0 flex-1">
                <Link
                    to={"/"}
                    className={buttonVariants({variant: "outline", size: "icon"})+" !rounded-full"}
                    viewTransition
                >
                    <X />
                </Link>
            </div>
            
        </div>
    )
}



const LinkSidebarSettings = ({link}: {link: LinkSidebarSettingsProps}) => {
    const location = useLocation()

    return (
        <Link to={link.href} className={`relative py-1.5 px-2.5 hover:bg-slate-200 dark:hover:bg-zinc-700 w-full rounded-lg transition-all text-sm font-bold text-zinc-600 dark:text-muted-foreground dark:hover:text-white ${link.href === location.pathname && "bg-slate-200 dark:bg-zinc-700 dark:text-white text-zinc-900"}`} viewTransition>
            {link.title}
            {link.alert && (
                <div className="absolute w-3 h-3 bg-yellow-400 rounded-full top-2.5 right-2 animate-pulse"></div>
            )}
        </Link>
    )
}
