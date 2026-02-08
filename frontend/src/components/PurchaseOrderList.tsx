import React from 'react';

interface PurchaseOrder {
  id: number;
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
}

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  onViewDetails: (id: number) => void;
  onUpdateStatus: (id: number, status: 'pending' | 'ordered' | 'received' | 'cancelled') => void;
  onReceiveItems: (id: number) => void;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  orders,
  onViewDetails,
  onUpdateStatus,
  onReceiveItems,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-normal text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Supplier ID</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Order Date</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Expected Delivery</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Status</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Total Amount</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No purchase orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{order.id}</td>
                <td className="py-3 px-4">{order.supplier_id}</td>
                <td className="py-3 px-4">{new Date(order.order_date).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  {order.expected_delivery_date
                    ? new Date(order.expected_delivery_date).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="py-3 px-4">{order.status}</td>
                <td className="py-3 px-4">${order.total_amount.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onViewDetails(order.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-normal py-1 px-2 rounded text-xs mr-2"
                  >
                    View Details
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        order.id,
                        e.target.value as 'pending' | 'ordered' | 'received' | 'cancelled',
                      )
                    }
                    className="border rounded px-2 py-1 text-xs mr-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => onReceiveItems(order.id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-normal py-1 px-2 rounded text-xs"
                  >
                    Receive Items
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

