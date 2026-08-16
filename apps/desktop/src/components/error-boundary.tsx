import { Component, type ReactNode } from 'react';
import '@/styles/index.css';
import { Button, buttonVariants, ExternalLink } from '@xtunes/ui';
import { WindowControls } from './window-controls';
import { AlertTriangle, ArrowUpRight, LogOut, RefreshCw } from 'lucide-react';
import { api, getOSInfo, OSInfo } from '@xtunes/api';

interface Props {
    children: ReactNode;
}
interface State {
    error: Error | null;
    platform: OSInfo | null;
}

/** Catches render crashes so a broken subtree shows a recover screen, not a
 * blank window. Recovery is a full reload — cheapest reliable reset. */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { 
        error: null,
        platform: null
    }

    async componentDidMount() {
        const osInfo = await getOSInfo();
        this.setState({ platform: osInfo });
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { error };
    }

    componentDidCatch(error: Error) {
        console.error('xTunes crashed:', error);
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div className="bg-[url('/grid/grid-light.svg')] dark:bg-[url('/grid/grid-dark.svg')] bg-background">
                <header data-tauri-drag-region className="w-full h-11 absolute top-0 flex justify-end z-10">
                    <WindowControls />
                </header>
                <div className="mx-auto flex h-screen flex-col items-center justify-center">
                    <div className="w-96 rounded-lg border bg-card p-4 shadow-sm transition hover:shadow-lg sm:p-6">
                        <div className="mb-3 flex flex-col space-y-3 border-b pb-3">
                            <AlertTriangle className="text-destructive" size={22} />
                            <h3 className="text-xl font-medium">Something went wrong.</h3>
                        </div>
                        <div className="mb-1 flex flex-col space-y-2 pb-3">
                            <p className="text-sm text-muted-foreground font-bold">Error:</p>

                            {this.state.error.message && (
                                <textarea
                                    className="mt-3 h-16 w-full resize-none rounded-sm bg-destructive/5 p-2 text-sm/relaxed text-destructive focus:outline-none focus:ring-0"
                                    value={this.state.error.message}
                                    readOnly
                                />
                            )}
                        </div>
                        <div className="flex flex-col space-y-2 border-b pb-3">
                            <p className="text-sm text-muted-foreground font-bold">OS info:</p>
                            <ol>
                                <li className="text-sm text-muted-foreground">
                                    <span className="font-medium">Platform:</span> {this.state.platform?.osType} -{' '}
                                    {this.state.platform?.platform}
                                </li>
                                <li className="text-sm text-muted-foreground">
                                    <span className="font-medium">Version:</span> {this.state.platform?.kernelVersion}
                                </li>
                                <li className="text-sm text-muted-foreground">
                                    <span className="font-medium">Architecture:</span> {this.state.platform?.architecture}
                                </li>
                            </ol>
                        </div>
                        <div className="mt-4 flex items-center space-x-1">
                            <Button
                                className="flex items-center space-x-2"
                                variant={"secondary"}
                                onClick={async () => {
                                    await api.app.exit(0);
                                }}
                            >
                                <LogOut size={16} />
                                <span>Exit</span>
                            </Button>
                            <Button
                                className="flex items-center space-x-2"
                                variant={"secondary"}
                                onClick={async () => {
                                    await api.app.relaunch();
                                }}
                            >
                                <RefreshCw size={16} />
                                <span>Reload</span>
                            </Button>
                            <ExternalLink
                                className={buttonVariants({
                                    className: 'flex items-center space-x-2',
                                    variant: "secondary"
                                })}
                                href="https://github.com/BradMoyetones/xtunes/issues/new"
                            >
                                <span>Report</span>
                                <ArrowUpRight size={16} />
                            </ExternalLink>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
