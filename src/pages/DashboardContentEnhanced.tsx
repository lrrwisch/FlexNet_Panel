import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { dashboardApi } from '../services/api';
import type { DashboardStats } from '../types';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function DashboardContentEnhanced() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApi.getStats();
      const statsData = (response as any).stats || response.data;
      if (response.success && statsData) {
        setStats(statsData);
      } else {
        setError(response.message || 'Failed to load stats');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Panel yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500">
        Veri bulunamadı
      </div>
    );
  }

  // Status Distribution Chart Data
  const statusChartData = {
    labels: ['Gönderildi', 'Etiket Oluşturuldu', 'Beklemede'],
    datasets: [
      {
        data: [
          stats.shippedShipments,
          stats.labelCreatedShipments,
          stats.pendingShipments
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(234, 179, 8, 0.8)'    // yellow
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tekrar hoş geldiniz, {user?.email?.split('@')[0] || 'Kullanıcı'}!
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Bugün gönderilerinizde neler oluyor
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-500">Son güncelleme</p>
            <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Toplam Gönderi</p>
              <p className="text-4xl font-bold mt-2">{stats.totalShipments}</p>
              <p className="text-blue-100 text-xs mt-2">Tüm gönderiler</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Gönderildi</p>
              <p className="text-4xl font-bold mt-2">{stats.shippedShipments}</p>
              <p className="text-green-100 text-xs mt-2">Başarıyla teslim edildi</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Beklemede</p>
              <p className="text-4xl font-bold mt-2">{stats.pendingShipments}</p>
              <p className="text-amber-100 text-xs mt-2">İşlem bekliyor</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-gray-800 rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Müşteriler</p>
              <p className="text-4xl font-bold mt-2">{stats.totalCustomers}</p>
              <p className="text-gray-300 text-xs mt-2">Aktif müşteriler</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Durum Dağılımı</h3>
            <div className="px-3 py-1 bg-blue-50 rounded-full">
              <span className="text-xs font-semibold text-blue-600">Genel Bakış</span>
            </div>
          </div>
          <div className="h-64">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-blue-600 mb-1">Etiket Oluşturuldu</p>
            <p className="text-3xl font-bold text-blue-900">{stats.labelCreatedShipments}</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-emerald-600 mb-1">Tamamlanma Oranı</p>
            <p className="text-3xl font-bold text-emerald-900">
              {stats.totalShipments > 0 ? Math.round((stats.shippedShipments / stats.totalShipments) * 100) : 0}%
            </p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-amber-600 mb-1">İşleniyor</p>
            <p className="text-3xl font-bold text-amber-900">{stats.pendingShipments + stats.labelCreatedShipments}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Son Gönderiler</h2>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              Son Aktivite
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sipariş Kodu</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Takip</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tarih</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {stats.recentShipments.length > 0 ? (
                stats.recentShipments.map((shipment) => (
                  <tr key={shipment.shipmentId} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{shipment.orderCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {shipment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                        shipment.status === 'Label_Olusturuldu'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {shipment.waybill || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">Gönderi bulunamadı</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
