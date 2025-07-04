import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HouseIcon, SquareChevronRight, HeartIcon, TagIcon, PcCaseIcon, CloudUploadIcon, InfoIcon, SettingsIcon } from "lucide-react"
import { useEffect } from 'react';
import { promptsStore } from '@/store/prompts-store';
import { Toaster } from '@/components/ui/sonner';


export const Route = createRootRoute({
    component: () => {
        const router = useRouterState()
        const currentPath = router.location.pathname
        const { setSelectedPrompt } = promptsStore()

        useEffect(() => {
            setSelectedPrompt(null)
        }, [currentPath])

        return (
        <main className="flex h-screen items-center justify-center">
            <nav className="flex flex-col h-screen items-center justify-between gap-2 p-2 bg-neutral-900 text-neutral-400">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/" className="[&.active]:text-neutral-50">
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
                        <Link to="/all" className="[&.active]:text-neutral-50">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="rounded-full"><SquareChevronRight /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>All Prompts</p>
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                    <li>
                        <Link to="/favorites" className="[&.active]:text-neutral-50">
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
                        <Link to="/tags" className="[&.active]:text-neutral-50">
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
                <ul className="flex flex-col gap-4">
                    <li>
                        <Link to="/local" className="[&.active]:text-neutral-50">
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
                        <Link to="/backup" className="[&.active]:text-neutral-50">
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
                        <Link to="/info" className="[&.active]:text-neutral-50">
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
                        <Link to="/settings" className="[&.active]:text-neutral-50">
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
            <Toaster />
        </main>
    )}
})
