import { useEffect, useState, useRef } from 'react';
import { api, DownloadConfig } from '@xtunes/api';
import { Terminal } from '@/components/terminal';
import { 
    Alert, AlertDescription, AlertTitle, 
    Tabs, TabsContent, TabsList, TabsTrigger, 
    Input, Label, Switch, Button, Progress,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@xtunes/ui';
import { AlertTriangle, Download as DownloadIcon, Terminal as TerminalIcon, Settings2, CodeSquare, Disc, Video, Music, Subtitles, Image as ImageIcon, Tags } from 'lucide-react';
import { toast } from 'sonner';

type EngineState = 'CHECKING' | 'MISSING' | 'READY' | 'DOWNLOADING';

export default function DownloadPage() {
    const [ytdlpState, setYtdlpState] = useState<EngineState>('CHECKING');
    const [ffmpegState, setFfmpegState] = useState<EngineState>('CHECKING');
    const [ytdlpProgress, setYtdlpProgress] = useState(0);
    const [ffmpegProgress, setFfmpegProgress] = useState(0);
    const [isDownloadingMedia, setIsDownloadingMedia] = useState(false);
    const isDownloadingMediaRef = useRef(false);
    
    // Config state
    const [url, setUrl] = useState('');
    const [extractAudio, setExtractAudio] = useState(false);
    const [videoFormat, setVideoFormat] = useState('mp4');
    const [videoQuality, setVideoQuality] = useState('best');
    const [audioFormat, setAudioFormat] = useState('mp3');
    const [audioQuality, setAudioQuality] = useState('320');
    
    // Extras
    const [embedSubs, setEmbedSubs] = useState(false);
    const [embedMetadata, setEmbedMetadata] = useState(true);
    const [embedThumbnail, setEmbedThumbnail] = useState(true);

    useEffect(() => {
        checkEngine();
        
        const unlistenProgress = api.binaries.onDownloadProgress((payload) => {
            if (payload.binary === 'yt-dlp') {
                setYtdlpProgress(payload.percentage);
            } else if (payload.binary === 'ffmpeg') {
                setFfmpegProgress(payload.percentage);
            }
        });

        const unlistenFinished = api.downloader.onDownloadFinished(() => {
            // Se maneja asíncronamente en executeDownload
        });

        return () => {
            unlistenProgress.then(fn => fn());
            unlistenFinished.then(fn => fn());
        };
    }, []);

    const checkEngine = async () => {
        try {
            const status = await api.binaries.checkDependencies();
            setYtdlpState(status.yt_dlp.status === 'MISSING' ? 'MISSING' : 'READY');
            setFfmpegState(status.ffmpeg.status === 'MISSING' ? 'MISSING' : 'READY');
        } catch (e) {
            console.error(e);
        }
    };

    const handleInstallBinary = async (binary: 'yt-dlp' | 'ffmpeg') => {
        if (binary === 'yt-dlp') setYtdlpState('DOWNLOADING');
        if (binary === 'ffmpeg') setFfmpegState('DOWNLOADING');
        
        try {
            await api.binaries.installBinary(binary);
            if (binary === 'yt-dlp') setYtdlpState('READY');
            if (binary === 'ffmpeg') setFfmpegState('READY');
            toast.success(`${binary} installed successfully`);
        } catch (e: any) {
            toast.error(e.toString());
            if (binary === 'yt-dlp') setYtdlpState('MISSING');
            if (binary === 'ffmpeg') setFfmpegState('MISSING');
        }
    };

    const handleDownload = async () => {
        if (!url) {
            toast.error("Please enter a valid URL");
            return;
        }

        const config: DownloadConfig = {
            url,
            extractAudio,
            videoFormat: extractAudio ? undefined : videoFormat,
            videoQuality: extractAudio ? undefined : videoQuality,
            audioFormat: extractAudio ? audioFormat : undefined,
            audioQuality: extractAudio ? audioQuality : undefined,
            embedSubs,
            embedMetadata,
            embedThumbnail
        };

        setIsDownloadingMedia(true);
        isDownloadingMediaRef.current = true;
        
        // Creamos un toast loading persistente
        const toastId = toast.loading("Downloading media...");
        
        try {
            const result = await api.downloader.executeDownload(config);
            toast.success(`Download successful!`, {
                id: toastId,
                description: result.title
            });
        } catch (e: any) {
            // El backend devuelve el stderr o el error de validación
            toast.error(`Download failed`, {
                id: toastId,
                description: typeof e === 'string' ? e : e.toString(),
                duration: 8000
            });
        } finally {
            setIsDownloadingMedia(false);
            isDownloadingMediaRef.current = false;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <header className="flex-none">
                <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
                <p className="text-muted-foreground mt-1">Manage your media downloads and engine configuration.</p>
            </header>

            {(ytdlpState !== 'READY' || ffmpegState !== 'READY') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* yt-dlp Status */}
                    {ytdlpState === 'MISSING' && (
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>yt-dlp Missing</AlertTitle>
                            <AlertDescription className="flex flex-col gap-3">
                                <p>The yt-dlp engine is required for downloads.</p>
                                <Button variant="outline" size="sm" className="w-fit" onClick={() => handleInstallBinary('yt-dlp')}>
                                    Install yt-dlp
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    {ytdlpState === 'DOWNLOADING' && (
                        <Alert className="border-primary/50 bg-primary/5">
                            <DownloadIcon className="h-4 w-4 animate-bounce" />
                            <AlertTitle>Installing yt-dlp...</AlertTitle>
                            <AlertDescription className="flex flex-col gap-2 mt-2">
                                <Progress value={ytdlpProgress} className="h-2" />
                                <span className="text-xs text-muted-foreground">{ytdlpProgress.toFixed(1)}%</span>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* ffmpeg Status */}
                    {ffmpegState === 'MISSING' && (
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>ffmpeg Missing</AlertTitle>
                            <AlertDescription className="flex flex-col gap-3">
                                <p>ffmpeg is required for audio extraction and muxing.</p>
                                <Button variant="outline" size="sm" className="w-fit" onClick={() => handleInstallBinary('ffmpeg')}>
                                    Install ffmpeg
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    {ffmpegState === 'DOWNLOADING' && (
                        <Alert className="border-primary/50 bg-primary/5">
                            <DownloadIcon className="h-4 w-4 animate-bounce" />
                            <AlertTitle>Installing ffmpeg...</AlertTitle>
                            <AlertDescription className="flex flex-col gap-2 mt-2">
                                <Progress value={ffmpegProgress} className="h-2" />
                                <span className="text-xs text-muted-foreground">{ffmpegProgress.toFixed(1)}%</span>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            <Tabs defaultValue="assistant" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-fit grid grid-cols-2 bg-background/50 backdrop-blur-lg border border-border/50">
                    <TabsTrigger value="assistant" className="gap-2"><Settings2 className="w-4 h-4"/> Assistant</TabsTrigger>
                    <TabsTrigger value="console" className="gap-2"><TerminalIcon className="w-4 h-4"/> Console</TabsTrigger>
                </TabsList>

                <TabsContent value="assistant" className="flex-1 mt-4 data-[state=active]:flex flex-col gap-6 min-h-0 overflow-y-auto pr-2 pb-10">
                    <div className="bg-card/40 border border-border/50 rounded-xl p-6 backdrop-blur-md shadow-sm space-y-8 relative overflow-hidden">
                        
                        {/* URL Input */}
                        <div className="space-y-3">
                            <Label htmlFor="url" className="text-lg font-semibold flex items-center gap-2">
                                <Disc className="w-5 h-5 text-primary"/> Media Source
                            </Label>
                            <Input 
                                id="url" 
                                placeholder="https://youtube.com/watch?v=..." 
                                className="h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary/50 transition-all"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>

                        {/* Format Mode Toggle */}
                        <div className="flex flex-col gap-4 p-5 rounded-xl border border-border/50 bg-background/30">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-base font-semibold flex items-center gap-2">
                                        {extractAudio ? <Music className="w-4 h-4 text-pink-500" /> : <Video className="w-4 h-4 text-blue-500" />}
                                        Format Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Toggle between Video and Audio-only extraction.</p>
                                </div>
                                <div className="flex items-center space-x-3 bg-background/50 p-1.5 rounded-lg border border-border/50">
                                    <span className={`text-sm font-medium ${!extractAudio ? 'text-primary' : 'text-muted-foreground'}`}>Video</span>
                                    <Switch checked={extractAudio} onCheckedChange={setExtractAudio} />
                                    <span className={`text-sm font-medium ${extractAudio ? 'text-primary' : 'text-muted-foreground'}`}>Audio</span>
                                </div>
                            </div>

                            {/* Conditional Selectors */}
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                {!extractAudio ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Video Resolution</Label>
                                            <Select value={videoQuality} onValueChange={(val) => setVideoQuality(val as string)}>
                                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="best">Best Available</SelectItem>
                                                    <SelectItem value="2160">4K (2160p)</SelectItem>
                                                    <SelectItem value="1440">2K (1440p)</SelectItem>
                                                    <SelectItem value="1080">FHD (1080p)</SelectItem>
                                                    <SelectItem value="720">HD (720p)</SelectItem>
                                                    <SelectItem value="480">SD (480p)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Video Container</Label>
                                            <Select value={videoFormat} onValueChange={(val) => setVideoFormat(val as string)}>
                                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mp4">MP4 (Recommended)</SelectItem>
                                                    <SelectItem value="mkv">MKV</SelectItem>
                                                    <SelectItem value="webm">WEBM</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Audio Bitrate</Label>
                                            <Select value={audioQuality} onValueChange={(val) => setAudioQuality(val as string)}>
                                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">Best (VBR)</SelectItem>
                                                    <SelectItem value="320">320 kbps</SelectItem>
                                                    <SelectItem value="256">256 kbps</SelectItem>
                                                    <SelectItem value="192">192 kbps</SelectItem>
                                                    <SelectItem value="128">128 kbps</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Audio Codec</Label>
                                            <Select value={audioFormat} onValueChange={(val) => setAudioFormat(val as string)}>
                                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mp3">MP3</SelectItem>
                                                    <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                                                    <SelectItem value="m4a">M4A (AAC)</SelectItem>
                                                    <SelectItem value="wav">WAV</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Extra Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col justify-between rounded-lg border border-border/50 p-4 bg-background/30 hover:bg-background/50 transition-colors">
                                <div className="space-y-1 mb-4">
                                    <Label className="text-sm font-semibold flex items-center gap-2"><Tags className="w-4 h-4"/> Metadata</Label>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Embed artist, title, and album info into the file.</p>
                                </div>
                                <Switch checked={embedMetadata} onCheckedChange={setEmbedMetadata} />
                            </div>

                            <div className="flex flex-col justify-between rounded-lg border border-border/50 p-4 bg-background/30 hover:bg-background/50 transition-colors">
                                <div className="space-y-1 mb-4">
                                    <Label className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Thumbnail</Label>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Download and embed cover art into the media.</p>
                                </div>
                                <Switch checked={embedThumbnail} onCheckedChange={setEmbedThumbnail} />
                            </div>

                            <div className={`flex flex-col justify-between rounded-lg border border-border/50 p-4 transition-colors ${extractAudio ? 'bg-background/10 opacity-50 cursor-not-allowed' : 'bg-background/30 hover:bg-background/50'}`}>
                                <div className="space-y-1 mb-4">
                                    <Label className="text-sm font-semibold flex items-center gap-2"><Subtitles className="w-4 h-4"/> Subtitles</Label>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Download and embed subtitles (Video only).</p>
                                </div>
                                <Switch checked={embedSubs} onCheckedChange={setEmbedSubs} disabled={extractAudio} />
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full h-14 text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]" 
                            onClick={handleDownload}
                            disabled={isDownloadingMedia || ytdlpState !== 'READY' || ffmpegState !== 'READY'}
                        >
                            {isDownloadingMedia ? (
                                <><DownloadIcon className="mr-2 h-5 w-5 animate-pulse" /> Processing Request...</>
                            ) : (
                                <><DownloadIcon className="mr-2 h-5 w-5" /> Start Download</>
                            )}
                        </Button>
                    </div>

                    {/* Simple Log Output view during download for the assistant */}
                    {isDownloadingMedia && (
                        <div className="flex-1 min-h-[250px] flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4">
                            <Label className="flex items-center gap-2 text-primary"><CodeSquare className="w-4 h-4"/> Live Output</Label>
                            <div className="flex-1 relative rounded-xl overflow-hidden shadow-inner border border-border/50">
                                <Terminal />
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="console" className="flex-1 mt-4 data-[state=active]:flex flex-col min-h-0">
                    <div className="flex-1 rounded-xl overflow-hidden border border-border/50 shadow-lg bg-card/40 backdrop-blur-md">
                        <Terminal />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
