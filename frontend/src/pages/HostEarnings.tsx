import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { earningsService } from '@/services'
import type {
  EarningsSummary,
  MonthlyEarnings,
  PropertyEarnings,
  OccupancyData,
} from '@/services/earnings.service'
import { useAuth } from '@/store'
import { formatCurrency } from '@/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function HostEarnings() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyEarnings[]>([])
  const [propertyEarnings, setPropertyEarnings] = useState<PropertyEarnings[]>([])
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!user?.isHost) {
      navigate('/')
      return
    }

    fetchAllData()
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (isAuthenticated && user?.isHost) {
      fetchMonthlyData()
    }
  }, [selectedYear])

  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [summaryData, monthly, byProperty, occupancy] = await Promise.all([
        earningsService.getSummary(),
        earningsService.getMonthlyEarnings(selectedYear),
        earningsService.getEarningsByProperty(),
        earningsService.getOccupancyRates(90),
      ])

      setSummary(summaryData)
      setMonthlyData(monthly)
      setPropertyEarnings(byProperty)
      setOccupancyData(occupancy)
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMonthlyData = async () => {
    try {
      const monthly = await earningsService.getMonthlyEarnings(selectedYear)
      setMonthlyData(monthly)
    } catch (err) {
      console.error('Failed to fetch monthly data:', err)
    }
  }

  const maxMonthlyEarnings = Math.max(...monthlyData.map((m) => m.earnings), 1)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error loading earnings</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchAllData}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Earnings Dashboard</h1>
          <p className="text-gray-600">Track your hosting income and performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Earnings</span>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.totalEarnings || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {summary?.totalBookings || 0} completed bookings
            </p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">This Month</span>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.thisMonthEarnings || 0)}
            </p>
            <div className="flex items-center mt-1">
              {(summary?.percentageChange || 0) >= 0 ? (
                <span className="text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {summary?.percentageChange}% vs last month
                </span>
              ) : (
                <span className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {Math.abs(summary?.percentageChange || 0)}% vs last month
                </span>
              )}
            </div>
          </div>

          {/* Average Booking */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Avg. Booking Value</span>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.averageBookingValue || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">per booking</p>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Active Properties</span>
              <svg className="w-5 h-5 text-[#FF385C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900">{propertyEarnings.length}</p>
            <p className="text-sm text-gray-500 mt-1">generating income</p>
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Earnings</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
            >
              {[0, 1, 2].map((offset) => {
                const year = new Date().getFullYear() - offset
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              })}
            </select>
          </div>

          {monthlyData.length > 0 ? (
            <div className="flex items-end gap-2 h-64">
              {monthlyData.map((data) => {
                const height = (data.earnings / maxMonthlyEarnings) * 100
                return (
                  <div
                    key={data.month}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-[#FF385C] rounded-t-lg transition-all hover:bg-[#E31C5F] cursor-pointer"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                          <p className="font-semibold">{formatCurrency(data.earnings)}</p>
                          <p className="text-gray-300">{data.bookings} bookings</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{MONTHS[data.month - 1]}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No earnings data for {selectedYear}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Properties */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Earning Properties</h2>

            {propertyEarnings.length > 0 ? (
              <div className="space-y-4">
                {propertyEarnings.slice(0, 5).map((property, index) => (
                  <div
                    key={property.propertyId}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/properties/${property.propertyId}`)}
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <img
                      src={property.propertyImage || 'https://via.placeholder.com/100'}
                      alt={property.propertyTitle}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.propertyTitle}</p>
                      <p className="text-sm text-gray-500">
                        {property.bookingCount} bookings
                        {property.averageRating && (
                          <span className="ml-2">
                            <svg className="w-4 h-4 inline text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {property.averageRating}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(property.totalEarnings)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No property earnings yet
              </div>
            )}
          </div>

          {/* Occupancy Rates */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Occupancy Rates (Last 90 Days)</h2>

            {occupancyData.length > 0 ? (
              <div className="space-y-4">
                {occupancyData.map((property) => (
                  <div key={property.propertyId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate pr-4">
                        {property.propertyTitle}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {property.occupancyRate}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          property.occupancyRate >= 70
                            ? 'bg-green-500'
                            : property.occupancyRate >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${property.occupancyRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {property.totalDaysBooked} days booked out of {property.periodDays}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No occupancy data available
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
