import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/settings")({
  component: Settings,
})

function Settings() {

  return (
    <div className="flex h-screen w-full items-center justify-center">
     Settings
    </div>
  )
}