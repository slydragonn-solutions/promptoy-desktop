import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/backup")({
  component: Backup,
})

function Backup() {

  return (
    <div className="flex h-screen w-full items-center justify-center">
     Backup
    </div>
  )
}