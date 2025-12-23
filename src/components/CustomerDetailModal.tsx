import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CustomerDetail } from '../types';
import api from '../services/api';

interface Shipment {
  shipmentId: number;
  orderCode: string;
  flexCode: string;
  status: string;
  waybill?: string;
  createdAt: string;
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
}

export default function CustomerDetailModal({ isOpen, onClose, customerId }: CustomerDetailModalProps) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomerDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer detail
      const response = await api.get(`/api/Customer/detail/${customerId}`);
      
      if (response.data.success && response.data.data) {
        setCustomer(response.data.data);
        
        // Fetch customer's shipments
        const shipmentsResponse = await api.get('/api/Shipment/list');
        
        if (shipmentsResponse.data.success && shipmentsResponse.data.data) {
          // Filter shipments for this customer
          const customerShipments = shipmentsResponse.data.data.filter(
            (s: Shipment & { customerCode: string }) => 
              s.customerCode === response.data.data.customerCode
          );
          setShipments(customerShipments);
        }
      } else {
        setError(response.data.message || 'Failed to load customer details');
      }
    } catch (err: unknown) {
      console.error('Customer detail error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerDetail();
    }
  }, [isOpen, customerId, loadCustomerDetail]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
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
                  <p className="mt-4 text-gray-600">Loading customer details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : customer ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Customer Code</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{customer.customerCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Customer Name</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{customer.customerName}</p>
                    </div>
                    {customer.companyName && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Company Name</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.companyName}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.email}</p>
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.phone}</p>
                      </div>
                    )}
                    {customer.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500">Address</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.address}</p>
                      </div>
                    )}
                    {customer.district && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">District</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.district}</p>
                      </div>
                    )}
                    {customer.province && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Province</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.province}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax Information */}
                {(customer.taxNumber || customer.taxOffice) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.taxNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Tax Number</label>
                          <p className="mt-1 text-sm text-gray-900">{customer.taxNumber}</p>
                        </div>
                      )}
                      {customer.taxOffice && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Tax Office</label>
                          <p className="mt-1 text-sm text-gray-900">{customer.taxOffice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Total Shipments</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{customer.totalShipments || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Active</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{customer.activeShipments || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600 font-medium">Completed</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">{customer.completedShipments || 0}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600 font-medium">Label Created</p>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">{customer.labelCreatedShipments || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Shipments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Shipments ({shipments.length})
                  </h3>
                  {shipments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Order Code
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Flex Code
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Tracking
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {shipments.slice(0, 10).map((shipment) => (
                            <tr key={shipment.shipmentId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{shipment.orderCode}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{shipment.flexCode}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    shipment.status === 'Label_Olusturuldu'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {shipment.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {shipment.waybill || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(shipment.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {shipments.length > 10 && (
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Showing 10 of {shipments.length} shipments
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No shipments found for this customer
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No customer data available
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

  return createPortal(modalContent, document.body);
}
