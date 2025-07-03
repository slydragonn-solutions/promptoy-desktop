import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/favorites")({
  component: Favorites,
})

function Favorites() {

  return (
    <div className="flex h-screen w-full items-center justify-center">
     Favorites
    </div>
  )
}