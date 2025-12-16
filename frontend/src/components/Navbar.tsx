import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store'
import { getInitials } from '@/utils'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-1">
              <svg
                className="w-8 h-8 text-[#FF385C]"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M16 1c2 0 3.46 1.96 3.13 3.93L18.76 7c-.2 1.03.39 2 1.46 2 1.07 0 1.96-.98 2.29-2L23 4c.33-1.02 1.01-2 2.01-2 1 0 2 1 2 2v3c0 4.96-4.04 9-9 9H14C9.04 16 5 11.96 5 7V4c0-1 1-2 2-2 1 0 1.68.98 2.01 2l.5 3c.33 1.02 1.22 2 2.29 2 1.07 0 1.66-.97 1.46-2l-.39-2.07C12.54 2.96 14 1 16 1z"></path>
                <path d="M26 17a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3.66l2.08 7.25a1 1 0 0 0 .96.75h6.6a1 1 0 0 0 .96-.75L22.34 17H26z"></path>
              </svg>
              <span className="hidden sm:block text-xl font-bold text-[#FF385C]">
                RoomBnB
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="px-6 py-2 border-r border-gray-300">
              <div className="text-sm font-semibold">Anywhere</div>
            </div>
            <div className="px-6 py-2 border-r border-gray-300">
              <div className="text-sm font-semibold">Any week</div>
            </div>
            <div className="px-6 py-2 pr-2 flex items-center gap-2">
              <div className="text-sm text-gray-600">Add guests</div>
              <div className="bg-[#FF385C] rounded-full p-2">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            <button className="hidden lg:block text-sm font-semibold hover:bg-gray-100 px-4 py-3 rounded-full transition">
              RoomBnB your home
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 border border-gray-300 rounded-full p-2 pl-3 hover:shadow-md transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  {isAuthenticated && user ? (
                    <span className="text-white text-sm font-medium">
                      {getInitials(user.firstName, user.lastName)}
                    </span>
                  ) : (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/my-bookings"
                        className="block px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Trips
                      </Link>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition">
                        Wishlists
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition">
                        My Listings
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition">
                        Account
                      </button>
                      <div className="border-t border-gray-200 mt-2"></div>
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                          navigate('/')
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition text-red-600"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 hover:bg-gray-50 transition font-semibold"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign up
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition">
                        RoomBnB your home
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition">
                        Help
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
