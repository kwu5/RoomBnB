import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-20 max-w-[2520px] mx-auto">
        <h1 className="text-4xl font-semibold text-gray-800 mb-8">
          Welcome to RoomBnB
        </h1>
        <p className="text-lg text-gray-600">
          Find your next stay
        </p>
      </main>
    </div>
  )
}
