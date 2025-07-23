import { Maximize, Minimize, Minus, X } from "lucide-react";
import { Button } from "../ui/button";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./title-bar.css"
import { useState } from "react";

export default function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false);
    
    const handleMinimize = async () => {
        await getCurrentWindow().minimize();
    };
    const handleMaximize = async () => {
        await getCurrentWindow().toggleMaximize();
        const maximized = await getCurrentWindow().isMaximized();
        setIsMaximized(maximized);
    };
    const handleClose = async () => {
        await getCurrentWindow().close();
    };

    return (
        <div 
            className="flex justify-end items-center w-full border-b border-neutral-200 bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-800" 
            data-tauri-drag-region
            id="title-bar"
        >
            <div className="flex gap-1" data-tauri-drag-region="false">
                <Button variant="ghost" size="icon" onClick={handleMinimize}>
                    <Minus />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleMaximize}>
                    {isMaximized ? <Maximize /> : <Minimize />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X />
                </Button>
            </div>
        </div>
    );
}