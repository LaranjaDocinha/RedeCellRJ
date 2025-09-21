import React from 'react';

interface LoyaltyTier {
  id: number;
  name: string;
  min_points: number;
  description?: string;
  benefits?: any; // JSONB
}

interface LoyaltyTierListProps {
  tiers: LoyaltyTier[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const LoyaltyTierList: React.FC<LoyaltyTierListProps> = ({ tiers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Min Points</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Description</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Benefits</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {tiers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">No loyalty tiers found.</td>
            </tr>
          ) : (
            tiers.map((tier) => (
              <tr key={tier.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{tier.id}</td>
                <td className="py-3 px-4">{tier.name}</td>
                <td className="py-3 px-4">{tier.min_points}</td>
                <td className="py-3 px-4">{tier.description || 'N/A'}</td>
                <td className="py-3 px-4">
                  {tier.benefits ? (
                    <pre className="text-xs bg-gray-100 p-1 rounded overflow-auto max-h-16">
                      {JSON.stringify(tier.benefits, null, 2)}
                    </pre>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(tier.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(tier.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Delete
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
