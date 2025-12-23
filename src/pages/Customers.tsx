import { useEffect, useState } from 'react';
import { customerApi } from '../services/api';
import type { Customer, CustomerStats } from '../types';
import CustomerDetailModal from '../components/CustomerDetailModal';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersResponse, statsResponse] = await Promise.all([
        customerApi.list(),
        customerApi.stats()
      ]);

      if (customersResponse.success && customersResponse.data) {
        setCustomers(customersResponse.data);
      } else {
        setError(customersResponse.message || 'Failed to load customers');
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (err: unknown) {
      console.error('Customers API Error:', err);
      setError((err as Error).message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchTerm === '' ||
      customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg shadow-lg">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage and view all your customers</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                <p className="text-4xl font-bold mt-2">{stats.totalCustomers}</p>
                <p className="text-blue-100 text-xs mt-2">All registered</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active</p>
                <p className="text-4xl font-bold mt-2">{stats.activeCustomers}</p>
                <p className="text-green-100 text-xs mt-2">Currently active</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-gray-800 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Inactive</p>
                <p className="text-4xl font-bold mt-2">{stats.inactiveCustomers}</p>
                <p className="text-gray-300 text-xs mt-2">Not active</p>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer code, name, company, or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
          />
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.customerId}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer"
                onClick={() => {
                  setSelectedCustomerId(customer.customerId);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {customer.customerName.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {customer.customerCode}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.customerName}</h3>
                {customer.companyName && (
                  <p className="text-sm text-gray-600 mb-3">{customer.companyName}</p>
                )}

                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {customer.phone}
                    </div>
                  )}
                  {customer.province && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {customer.district ? `${customer.district}, ${customer.province}` : customer.province}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold text-gray-900">{customer.totalShipments || 0}</span>
                    <span className="text-gray-600 ml-1">shipments</span>
                  </div>
                  {customer.activeShipments !== undefined && (
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {customer.activeShipments} active
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No customers found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Shipments
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-3">
                            {customer.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{customer.customerName}</div>
                            <div className="text-xs text-blue-600 font-semibold">{customer.customerCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.companyName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div className="text-gray-500">{customer.phone}</div>}
                        {!customer.email && !customer.phone && '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.province && customer.district
                          ? `${customer.district}, ${customer.province}`
                          : customer.province || customer.district || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">{customer.totalShipments || 0}</span>
                          {customer.activeShipments !== undefined && customer.activeShipments > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {customer.activeShipments} active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          onClick={() => {
                            setSelectedCustomerId(customer.customerId);
                            setIsModalOpen(true);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-500 font-medium">No customers found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600 bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
        <span className="font-medium">
          Showing {filteredCustomers.length} of {customers.length} customers
        </span>
        {filteredCustomers.length !== customers.length && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Clear filters
          </button>
        )}
      </div>

      {selectedCustomerId && (
        <CustomerDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCustomerId(null);
          }}
          customerId={selectedCustomerId}
        />
      )}
    </div>
  );
}
