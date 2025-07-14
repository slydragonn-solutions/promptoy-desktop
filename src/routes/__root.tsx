import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from "@/components/ui/button"
import { HouseIcon, TagIcon, PcCaseIcon, InfoIcon, SettingsIcon, LockKeyhole, BookText, Cloud } from "lucide-react"
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
            <nav className="flex flex-col h-screen items-center justify-between gap-2 pl-2 bg-neutral-900 text-neutral-400">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Home'><HouseIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/all" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/all" ? "bg-neutral-200 text-neutral-900" : ""}`} title='All Prompts'><BookText /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/local" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/local" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Local Prompts'><PcCaseIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/backup" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/backup" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Backup Prompts'><Cloud /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/tags" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/tags" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Tags'><TagIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/private" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Private prompts'><LockKeyhole /></Button>
                    </li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/settings" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/settings" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Settings'><SettingsIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/info" className="[&.active]:text-neutral-50">
                            <Button variant="ghost" size="icon" className={`rounded-l-xl rounded-r-none ${currentPath === "/info" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Info'><InfoIcon /></Button>
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
