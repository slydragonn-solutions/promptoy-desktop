import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HouseIcon, SquareChevronRight, HeartIcon, TagIcon, PcCaseIcon, CloudUploadIcon, InfoIcon, SettingsIcon } from "lucide-react"

export default function MainMenu() {
    return (
        <nav className="flex flex-col h-screen items-center justify-between gap-2 p-1 border-r border-r-neutral-200">
            <ul className="flex flex-col gap-2">
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><HouseIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Home</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><SquareChevronRight /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>All Prompts</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><HeartIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Favorite Prompts</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><TagIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Tags</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
            </ul>
            <ul className="flex flex-col gap-2">
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><PcCaseIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Local Prompts</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><CloudUploadIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Backup Prompts</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
            </ul>
            <ul className="flex flex-col gap-2">
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><InfoIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Info</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost"><SettingsIcon /></Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
                </li>
            </ul>
        </nav>
    )
}