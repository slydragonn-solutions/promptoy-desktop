import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from "@/components/ui/button"
import { HouseIcon, InfoIcon, SettingsIcon, LockKeyhole, BookText, Tags } from "lucide-react"
import { useEffect } from 'react';
import { promptsStore } from '@/store/prompts-store';
import { Toaster } from '@/components/ui/sonner';
import TitleBar from '@/components/layout/title-bar';
import { ThemeProvider } from '@/components/theme/theme-provider';

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
            <ThemeProvider defaultTheme='light'>
            <TitleBar />
            <main className="flex h-[calc(100vh-37px)] items-center justify-center">
            <nav className="flex flex-col h-full items-center justify-between gap-2 p-2 bg-neutral-100 text-neutral-500 border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/">
                            <Button variant="ghost" size="icon" className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/" ? "bg-indigo-50 text-neutral-900 dark:bg-indigo-800 dark:text-neutral-200" : ""}`} title='Home'><HouseIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/vault">
                            <Button variant="ghost" size="icon" className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/vault" ? "bg-indigo-50 text-neutral-900 dark:bg-indigo-800 dark:text-neutral-200" : ""}`} title='Vault'><BookText /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/tags">
                            <Button variant="ghost" size="icon" className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/tags" ? "bg-indigo-50 text-neutral-900 dark:bg-indigo-800 dark:text-neutral-200" : ""}`} title='Tags'><Tags /></Button>
                        </Link>
                    </li>
                </ul>
                <ul className="flex flex-col gap-2">
                    <li>
                        <Link to="/settings">
                            <Button variant="ghost" size="icon" className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/settings" ? "bg-indigo-50 text-neutral-900 dark:bg-indigo-800 dark:text-neutral-200" : ""}`} title='Settings'><SettingsIcon /></Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/info">
                            <Button variant="ghost" size="icon" className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/info" ? "bg-indigo-50 text-neutral-900 dark:bg-indigo-800 dark:text-neutral-200" : ""}`} title='Info'><InfoIcon /></Button>
                        </Link>
                    </li>
                </ul>
            </nav>
            <Outlet />
            <TanStackRouterDevtools position='top-left' />
            <Toaster />
        </main>
        </ThemeProvider>
    )}
})
