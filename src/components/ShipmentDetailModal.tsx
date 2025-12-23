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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Shipment Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading shipment details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : shipment ? (
              <div className="space-y-6">
                {/* Product Image */}
                {shipment.productImage && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h3>
                    <div className="flex justify-center">
                      <img
                        src={shipment.productImage}
                        alt={shipment.packageDescription || 'Product'}
                        className="max-w-md w-full h-auto rounded-lg shadow-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    {(shipment.productVariant || shipment.productVariant2) && (
                      <div className="mt-3 text-center">
                        <p className="text-sm text-gray-600">
                          {shipment.productVariant && <span className="font-medium">{shipment.productVariant}</span>}
                          {shipment.productVariant && shipment.productVariant2 && <span className="mx-2">•</span>}
                          {shipment.productVariant2 && <span className="font-medium">{shipment.productVariant2}</span>}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Order Code</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{shipment.orderCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Flex Code</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{shipment.flexCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Customer</label>
                      <p className="mt-1 text-sm text-gray-900">{shipment.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span
                        className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${
                          shipment.status === 'Label_Olusturuldu'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {shipment.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tracking Number</label>
                      <p className="mt-1 text-sm text-gray-900">{shipment.waybill || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Shipping Company</label>
                      <p className="mt-1 text-sm text-gray-900">{shipment.shipCompany || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(shipment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {shipment.labelDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Label Created Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(shipment.labelDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receiver Information */}
                {shipment.receiverName && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiver Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverPhone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverEmail || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Country</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverCountry || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Address</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverAddress || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">City</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverCity || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">State</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverState || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Zip Code</label>
                        <p className="mt-1 text-sm text-gray-900">{shipment.receiverZipCode || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Package Details */}
                {(shipment.packageWeight || shipment.packageDescription || shipment.productQuantity || shipment.productPrice) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shipment.packageDescription && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500">Product Description</label>
                          <p className="mt-1 text-sm text-gray-900">{shipment.packageDescription}</p>
                        </div>
                      )}
                      {shipment.productQuantity && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Quantity</label>
                          <p className="mt-1 text-sm text-gray-900">{shipment.productQuantity} pcs</p>
                        </div>
                      )}
                      {shipment.productPrice && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Product Price</label>
                          <p className="mt-1 text-sm text-gray-900 font-semibold">${shipment.productPrice.toFixed(2)}</p>
                        </div>
                      )}
                      {shipment.packageWeight && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Weight</label>
                          <p className="mt-1 text-sm text-gray-900">{shipment.packageWeight} kg</p>
                        </div>
                      )}
                      {shipment.packageLength && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Dimensions (L × W × H)</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {shipment.packageLength} × {shipment.packageWidth} × {shipment.packageHeight} cm
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {shipment.shippingCost && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Shipping Cost</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {shipment.shippingCost} {shipment.currency || 'USD'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {shipment.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{shipment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Order Created</p>
                        <p className="text-xs text-gray-500">{new Date(shipment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {shipment.isCreatedLabel && shipment.labelDate && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Label Created</p>
                          <p className="text-xs text-gray-500">{new Date(shipment.labelDate).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {shipment.isShipped && shipment.shippedDate && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Shipped</p>
                          <p className="text-xs text-gray-500">{new Date(shipment.shippedDate).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No shipment data available
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
