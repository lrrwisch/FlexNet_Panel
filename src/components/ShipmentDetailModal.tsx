import { useEffect, useState, useCallback } from 'react';
import type { ShipmentDetail } from '../types';
import api from '../services/api';

interface ShipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: number;
}

export default function ShipmentDetailModal({ isOpen, onClose, shipmentId }: ShipmentDetailModalProps) {
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShipmentDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch shipment detail from backend
      const response = await api.get(`/api/Shipment/detail/${shipmentId}`);
      
      if (response.data.success && response.data.data) {
        setShipment(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load shipment details');
      }
    } catch (err: unknown) {
      console.error('Shipment detail error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    if (isOpen && shipmentId) {
      loadShipmentDetail();
    }
  }, [isOpen, shipmentId, loadShipmentDetail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Shipment Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-8 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-1/2 -translate-x-1/2"></div>
                  </div>
                  <p className="mt-6 text-gray-600 font-medium">Loading shipment details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            ) : shipment ? (
              <div className="space-y-6">
                {shipment.productImage && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Product Image
                      </h3>
                    </div>
                    <div className="p-6 flex justify-center bg-gray-50">
                      <img
                        src={shipment.productImage}
                        alt={shipment.packageDescription || 'Product'}
                        className="max-w-md w-full h-auto rounded-xl shadow-lg border-2 border-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    {(shipment.productVariant || shipment.productVariant2) && (
                      <div className="px-6 py-4 bg-white border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2">
                          {shipment.productVariant && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {shipment.productVariant}
                            </span>
                          )}
                          {shipment.productVariant2 && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {shipment.productVariant2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Basic Information
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Code</label>
                      <p className="text-base text-gray-900 font-bold">{shipment.orderCode}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Flex Code</label>
                      <p className="text-base text-gray-900 font-bold">{shipment.flexCode}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</label>
                      <p className="text-base text-gray-900 font-semibold">{shipment.customerName}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                          shipment.status === 'Label_Olusturuldu'
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                        {shipment.status}
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tracking Number</label>
                      <p className="text-base text-gray-900 font-mono font-semibold">{shipment.waybill || '-'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping Company</label>
                      <p className="text-base text-gray-900 font-semibold">{shipment.shipCompany || '-'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Created Date</label>
                      <p className="text-sm text-gray-900 font-medium">
                        {new Date(shipment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {shipment.labelDate && (
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Label Created Date</label>
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(shipment.labelDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {shipment.receiverName && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Receiver Information
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Name</label>
                        <p className="text-base text-gray-900 font-semibold">{shipment.receiverName}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                        <p className="text-base text-gray-900 font-mono">{shipment.receiverPhone || '-'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                        <p className="text-sm text-gray-900">{shipment.receiverEmail || '-'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Country</label>
                        <p className="text-base text-gray-900 font-semibold">{shipment.receiverCountry || '-'}</p>
                      </div>
                      <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Address</label>
                        <p className="text-sm text-gray-900 leading-relaxed">{shipment.receiverAddress || '-'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">City</label>
                        <p className="text-base text-gray-900 font-semibold">{shipment.receiverCity || '-'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">State</label>
                        <p className="text-base text-gray-900 font-semibold">{shipment.receiverState || '-'}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 md:col-start-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Zip Code</label>
                        <p className="text-base text-gray-900 font-mono font-bold">{shipment.receiverZipCode || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(shipment.packageWeight || shipment.packageDescription || shipment.productQuantity || shipment.productPrice) && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Package Details
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {shipment.packageDescription && (
                        <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Description</label>
                          <p className="text-sm text-gray-900 leading-relaxed">{shipment.packageDescription}</p>
                        </div>
                      )}
                      {shipment.productQuantity && (
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
                          <p className="text-lg text-gray-900 font-bold">{shipment.productQuantity} <span className="text-sm font-normal text-gray-600">pcs</span></p>
                        </div>
                      )}
                      {shipment.productPrice && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Product Price</label>
                          <p className="text-xl text-green-600 font-bold">${shipment.productPrice.toFixed(2)}</p>
                        </div>
                      )}
                      {shipment.packageWeight && (
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Weight</label>
                          <p className="text-lg text-gray-900 font-bold">{shipment.packageWeight} <span className="text-sm font-normal text-gray-600">kg</span></p>
                        </div>
                      )}
                      {shipment.packageLength && (
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dimensions (L × W × H)</label>
                          <p className="text-base text-gray-900 font-semibold">
                            {shipment.packageLength} × {shipment.packageWidth} × {shipment.packageHeight} <span className="text-sm font-normal text-gray-600">cm</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {shipment.shippingCost && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg overflow-hidden border-2 border-blue-200">
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 flex items-center mb-1">
                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Shipping Cost
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">Total shipping fee</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-extrabold text-blue-600">
                            {shipment.shippingCost}
                          </p>
                          <p className="text-sm font-semibold text-gray-600">{shipment.currency || 'USD'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {shipment.notes && (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Notes
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed italic">{shipment.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status Timeline
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          {(shipment.isCreatedLabel || shipment.isShipped) && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-300 to-green-300"></div>
                          )}
                        </div>
                        <div className="ml-4 flex-1 bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-200">
                          <p className="text-sm font-bold text-gray-900">Order Created</p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">{new Date(shipment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      {shipment.isCreatedLabel && shipment.labelDate && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            {shipment.isShipped && (
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-green-300 to-teal-300"></div>
                            )}
                          </div>
                          <div className="ml-4 flex-1 bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-200">
                            <p className="text-sm font-bold text-gray-900">Label Created</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{new Date(shipment.labelDate).toLocaleString()}</p>
                          </div>
                        </div>
                      )}

                      {shipment.isShipped && shipment.shippedDate && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4 flex-1 bg-gradient-to-br from-teal-50 to-white rounded-lg p-4 border border-teal-200">
                            <p className="text-sm font-bold text-gray-900">Shipped</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{new Date(shipment.shippedDate).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 font-medium">No shipment data available</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gradient-to-r from-gray-100 to-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
