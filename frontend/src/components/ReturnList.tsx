import React from 'react';

interface Return {
  id: number;
  sale_id: number;
  return_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  refund_amount: number;
}

interface ReturnListProps {
  returns: Return[];
  onViewDetails: (id: number) => void;
  onUpdateStatus: (id: number, status: 'pending' | 'approved' | 'rejected' | 'completed') => void;
}

export const ReturnList: React.FC<ReturnListProps> = ({
  returns,
  onViewDetails,
  onUpdateStatus,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-normal text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Sale ID</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Return Date</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Reason</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Status</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Refund Amount</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {returns.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No returns found.
              </td>
            </tr>
          ) : (
            returns.map((returnItem) => (
              <tr key={returnItem.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{returnItem.id}</td>
                <td className="py-3 px-4">{returnItem.sale_id}</td>
                <td className="py-3 px-4">
                  {new Date(returnItem.return_date).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">{returnItem.reason || 'N/A'}</td>
                <td className="py-3 px-4">{returnItem.status}</td>
                <td className="py-3 px-4">${returnItem.refund_amount.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onViewDetails(returnItem.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-normal py-1 px-2 rounded text-xs mr-2"
                  >
                    View Details
                  </button>
                  <select
                    value={returnItem.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        returnItem.id,
                        e.target.value as 'pending' | 'approved' | 'rejected' | 'completed',
                      )
                    }
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

