import React from 'react';

interface PriceHistoryEntry {
  id: number;
  old_price: number;
  new_price: number;
  changed_at: string;
}

interface PriceHistoryTableProps {
  history: PriceHistoryEntry[];
}

export const PriceHistoryTable: React.FC<PriceHistoryTableProps> = ({ history }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-normal text-sm">Date</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">Old Price</th>
            <th className="py-3 px-4 uppercase font-normal text-sm">New Price</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {history.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center py-4">
                No price history available.
              </td>
            </tr>
          ) : (
            history.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{new Date(entry.changed_at).toLocaleString()}</td>
                <td className="py-3 px-4">${entry.old_price.toFixed(2)}</td>
                <td className="py-3 px-4">${entry.new_price.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

