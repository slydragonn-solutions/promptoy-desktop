import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from "@/components/ui/button"
import { HouseIcon, SquareChevronRight, HeartIcon, TagIcon, PcCaseIcon, CloudUploadIcon, InfoIcon, SettingsIcon, LockKeyhole } from "lucide-react"
import { useEffect } from 'react';
import { promptsStore } from '@/store/prompts-store';
import { Toaster } from '@/components/ui/sonner';


export const Route = createRootRoute({
    component: () => {
        const router = useRouterState()
        const currentPath = router.location.pathname
        const { setSelectedPrompt } = promptsStore()

        useEffect(() => {
            if(currentPath !== "/all"){
                setSelectedPrompt(null)
            }
        }, [currentPath])

        return (
        <main className="flex h-screen items-center justify-center">
            <nav className="flex flex-col h-screen items-center justify-between gap-2 p-2 bg-neutral-900 text-neutral-400">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='Home'><HouseIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/all" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='All Prompts'><SquareChevronRight /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/local" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='Local Prompts'><PcCaseIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/backup" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='Backup Prompts'><CloudUploadIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/tags" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='Tags'><TagIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Button variant="ghost" size="icon" className="rounded-full" title='Private prompts'><LockKeyhole /></Button>
                    </li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/settings" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='Settings'><SettingsIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/info" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className="rounded-full" title='Info'><InfoIcon /></Button>
                        </Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
            <TanStackRouterDevtools position='bottom-right' />
            <Toaster />
        </main>
    )}
})
