import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HouseIcon, SquareChevronRight, HeartIcon, TagIcon, PcCaseIcon, CloudUploadIcon, InfoIcon, SettingsIcon } from "lucide-react"


export const Route = createRootRoute({
    component: () => (
        <main className="flex h-screen items-center justify-center">
            <nav className="flex flex-col h-screen items-center justify-between gap-2 p-2 bg-neutral-900 text-neutral-400">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><HouseIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Home</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                    <li>
                        <Link to="/all" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full text-neutral-50 bg-neutral-800"><SquareChevronRight /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>All Prompts</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                    <li>
                        <Link to="/favorites" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><HeartIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Favorite Prompts</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                    <li>
                        <Link to="/tags" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><TagIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Tags</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/local" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><PcCaseIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Local Prompts</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                    <li>
                        <Link to="/backup" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><CloudUploadIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Backup Prompts</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/info" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><InfoIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Info</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="[&.active]:text-orange-500">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><SettingsIcon /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Settings</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
            <TanStackRouterDevtools />
        </main>
    )
})
