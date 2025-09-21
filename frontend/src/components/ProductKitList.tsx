import React from 'react';

interface ProductKitItem {
  product_id: number;
  variation_id: number;
  quantity: number;
}

interface ProductKit {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  items?: ProductKitItem[];
}

interface ProductKitListProps {
  kits: ProductKit[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ProductKitList: React.FC<ProductKitListProps> = ({ kits, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 uppercase font-semibold text-sm">ID</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Description</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Price</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Active</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Items</th>
            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {kits.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">No product kits found.</td>
            </tr>
          ) : (
            kits.map((kit) => (
              <tr key={kit.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{kit.id}</td>
                <td className="py-3 px-4">{kit.name}</td>
                <td className="py-3 px-4">{kit.description || 'N/A'}</td>
                <td className="py-3 px-4">${kit.price.toFixed(2)}</td>
                <td className="py-3 px-4">{kit.is_active ? 'Yes' : 'No'}</td>
                <td className="py-3 px-4">
                  {kit.items && kit.items.length > 0 ? (
                    <ul className="list-disc list-inside text-xs">
                      {kit.items.map((item, idx) => (
                        <li key={idx}>P: {item.product_id}, V: {item.variation_id}, Q: {item.quantity}</li>
                      ))}
                    </ul>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onEdit(kit.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(kit.id)}
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
