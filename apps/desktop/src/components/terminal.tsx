import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { api } from '@xtunes/api';
import { useTheme } from 'next-themes';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { resolvedTheme } = useTheme();
  const inputBufferRef = useRef('');
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const isDark = resolvedTheme === 'dark';
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: 'transparent',
        foreground: isDark ? '#f8f8f2' : '#f8f8f2',
        cursor: isDark ? '#f8f8f2' : '#f8f8f2',
      },
      convertEol: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('Welcome to xTunes Console.');
    term.writeln('Type your yt-dlp arguments here (e.g. --help).');
    term.write('\r\n$ yt-dlp ');

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    let unlistenLogs: (() => void) | null = null;
    let unlistenFinished: (() => void) | null = null;
    
    // Listen to backend console logs
    api.consoleStream.onConsoleLog((event) => {
      if (xtermRef.current) {
         xtermRef.current.writeln(event.line);
      }
    }).then(fn => {
      unlistenLogs = fn;
    });

    // Listen to command finish
    api.downloader.onDownloadFinished(() => {
        if (xtermRef.current && isExecutingRef.current) {
            isExecutingRef.current = false;
            xtermRef.current.write('\r\n$ yt-dlp ');
        }
    }).then(fn => {
        unlistenFinished = fn;
    });

    // Handle user input
    term.onData((data) => {
      if (isExecutingRef.current) return; // Block input while executing

      if (data === '\r') { // Enter
        term.write('\r\n');
        const currentBuf = inputBufferRef.current;
        inputBufferRef.current = '';
        
        if (currentBuf.trim()) {
            isExecutingRef.current = true;
            const args = currentBuf.trim().split(' ').filter(Boolean);
            api.consoleStream.executeConsoleCommand(args).catch(err => {
                term.writeln(`\x1b[31mError: ${err}\x1b[0m`);
                isExecutingRef.current = false;
                term.write('\r\n$ yt-dlp ');
            });
        } else {
            term.write('$ yt-dlp ');
        }
      } else if (data === '\u007F' || data === '\b') { // Backspace
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (data.startsWith('\x1b[')) {
        // Ignorar secuencias de escape ANSI (como las flechas direccionales)
      } else {
        // Printable characters
        inputBufferRef.current += data;
        term.write(data);
      }
    });

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          if (fitAddonRef.current && terminalRef.current && terminalRef.current.clientWidth > 0) {
            try {
               fitAddonRef.current.fit();
            } catch (e) {
               // Ignore fit errors on invisible containers
            }
          }
        });
      }, 50);
    });
    
    // Only observe if element exists
    if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current);
    }

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      if (unlistenLogs) unlistenLogs();
      else {
          setTimeout(() => { if (unlistenLogs) unlistenLogs(); }, 1000);
      }
      if (unlistenFinished) unlistenFinished();
      else {
          setTimeout(() => { if (unlistenFinished) unlistenFinished(); }, 1000);
      }
      term.dispose();
      xtermRef.current = null;
    };
  }, [resolvedTheme]);

  return (
    <div className="relative w-full h-full min-h-75 bg-background/50 backdrop-blur-md rounded-xl border border-border/50 shadow-inner overflow-hidden">
      <div className="absolute inset-0 p-4">
        <div ref={terminalRef} className="w-full h-full overflow-hidden" />
      </div>
    </div>
  );
}
