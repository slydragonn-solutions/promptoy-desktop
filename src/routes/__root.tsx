import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from "@/components/ui/button"
import { HouseIcon, InfoIcon, SettingsIcon, LockKeyhole, BookText, Tags } from "lucide-react"
import { useEffect } from 'react';
import { promptsStore } from '@/store/prompts-store';
import { Toaster } from '@/components/ui/sonner';
import TitleBar from '@/components/layout/title-bar';


export const Route = createRootRoute({
    component: () => {
        const router = useRouterState()
        const currentPath = router.location.pathname
        const { setSelectedPrompt } = promptsStore()

        useEffect(() => {
            if(currentPath !== "/vault"){
                setSelectedPrompt(null)
            }
        }, [currentPath])

        return (
            <>
            <TitleBar />
            <main className="flex h-[calc(100vh-37px)] items-center justify-center">
            <nav className="flex flex-col h-full items-center justify-between gap-2 p-2 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/">
                            <Button variant="ghost" size="icon" className={`rounded-xl hover:bg-neutral-50 hover:text-neutral-900 ${currentPath === "/" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Home'><HouseIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/vault">
                            <Button variant="ghost" size="icon" className={`rounded-xl hover:bg-neutral-50 hover:text-neutral-900 ${currentPath === "/vault" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Vault'><BookText /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/tags">
                            <Button variant="ghost" size="icon" className={`rounded-xl hover:bg-neutral-50 hover:text-neutral-900 ${currentPath === "/tags" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Tags'><Tags /></Button>
                        </Link>
                    </li>
                    <li>
                        <Button variant="ghost" size="icon" className={`rounded-xl hover:bg-neutral-50 hover:text-neutral-900 ${currentPath === "/private" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Private prompts'><LockKeyhole /></Button>
                    </li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/settings">
                            <Button variant="ghost" size="icon" className={`rounded-xl hover:bg-neutral-50 hover:text-neutral-900 ${currentPath === "/settings" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Settings'><SettingsIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/info">
                            <Button variant="ghost" size="icon" className={`rounded-xl hover:bg-neutral-50 hover:text-neutral-900 ${currentPath === "/info" ? "bg-neutral-200 text-neutral-900" : ""}`} title='Info'><InfoIcon /></Button>
                        </Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
            <TanStackRouterDevtools position='bottom-right' />
            <Toaster />
        </main>
        </>
    )}
})
