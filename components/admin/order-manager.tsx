'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Order } from '@/types/orders';
import { OrderStatus } from '@/types/orders';

export function OrderManagerContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders?stats=true', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CREATED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.SUBMITTED: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING: return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED: return 'bg-green-100 text-green-800';
      case OrderStatus.DELIVERED: return 'bg-green-200 text-green-900';
      case OrderStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      case OrderStatus.FAILED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center px-4 py-2 bg-coffee-primary text-white rounded-md hover:bg-coffee-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Manager</h1>
          <p className="text-gray-600 mt-2">{orders.length} total orders</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={fetchOrders}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 relative z-[10]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {/* Export CSV Button with proper z-index to appear above header */}
          <div className="export-button-container relative z-[60]">
            <button 
              className="export-button inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-coffee-primary hover:bg-coffee-secondary relative z-[61] min-h-[40px] transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label={`Export ${filteredOrders.length} orders to CSV`}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-primary focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value={OrderStatus.CREATED}>Created</option>
            <option value={OrderStatus.SUBMITTED}>Submitted</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
            <option value={OrderStatus.FAILED}>Failed</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roastify
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} items
                      <div className="text-xs text-gray-500">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totals.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.roastify?.roastify_order_id ? (
                        <div>
                          <span className="text-green-600 font-medium">✅ Submitted</span>
                          <div className="text-xs text-gray-500">{order.roastify.roastify_order_id}</div>
                        </div>
                      ) : order.roastify?.submitted === false && order.roastify?.error ? (
                        <div>
                          <span className="text-red-600 font-medium">❌ Failed</span>
                          <div className="text-xs text-red-500" title={order.roastify.error}>
                            {order.roastify.error.substring(0, 30)}...
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">⏳ Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
                        className="text-coffee-primary hover:text-coffee-secondary mr-3"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {order.status === OrderStatus.FAILED && (
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Retry Roastify Submission"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === OrderStatus.DELIVERED).length}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => [OrderStatus.CREATED, OrderStatus.SUBMITTED, OrderStatus.PROCESSING].includes(o.status)).length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-2xl font-bold text-red-600">
            {orders.filter(o => o.status === OrderStatus.FAILED).length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>
    </div>
  );
}
