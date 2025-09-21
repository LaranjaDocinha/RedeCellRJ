import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import { PriceHistoryTable } from '../components/PriceHistoryTable'; // Import PriceHistoryTable
import { ImageUpload } from '../components/ImageUpload'; // Import ImageUpload
// import { ReviewList } from '../components/ReviewList'; // Import ReviewList
// import { ReviewForm } from '../components/ReviewForm'; // Import ReviewForm
import './ProductDetailPage.css';

interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  imageUrl?: string; // Add imageUrl
  // Add other product fields as needed
}

interface PriceHistoryEntry {
  id: number;
  old_price: number;
  new_price: number;
  changed_at: string;
}

interface Variation {
  id?: number;
  color: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold?: number; // Add low_stock_threshold
  priceHistory?: PriceHistoryEntry[]; // Add priceHistory to Variation interface
}

interface ProductWithVariations extends Product {
  variations: Variation[];
}

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithVariations | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProductWithVariations | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState<number | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [reviews, setReviews] = useState<Review[]>([]); // State for product reviews
  const [showReviewForm, setShowReviewForm] = useState(false); // State for review form visibility
  const { token, user } = useAuth(); // Get user from AuthContext
  const { addNotification } = useNotification(); // Get addNotification from NotificationProvider

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        // Fetch product details
        const productResponse = await fetch(`http://localhost:3000/products/${id}`);
        if (!productResponse.ok) {
          throw new Error(`HTTP error! status: ${productResponse.status}`);
        }
        const productData: ProductWithVariations = await productResponse.json();

        // Fetch price history for each variation
        const variationsWithHistory = await Promise.all(
          productData.variations.map(async (variation) => {
            if (variation.id) {
              const historyResponse = await fetch(`http://localhost:3000/products/${id}/variations/${variation.id}/price-history`);
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                return { ...variation, priceHistory: historyData };
              }
            }
            return variation;
          })
        );

        const productWithHistory = { ...productData, variations: variationsWithHistory };
        setProduct(productWithHistory);
        setFormData(productWithHistory);
        setCurrentImageUrl(productWithHistory.imageUrl); // Set initial image URL

        // Fetch product reviews
        const reviewsResponse = await fetch(`http://localhost:3000/reviews/product/${id}`);
        if (!reviewsResponse.ok) {
          throw new Error(`HTTP error! status: ${reviewsResponse.status}`);
        }
        const reviewsData: Review[] = await reviewsResponse.json();
        setReviews(reviewsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleVariationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      const newVariations = [...prev.variations];
      newVariations[index] = {
        ...newVariations[index],
        [name]: name === 'price' || name === 'stock_quantity' || name === 'low_stock_threshold' ? parseFloat(value) : value,
      };
      return { ...prev, variations: newVariations };
    });
  };

  const handleAddVariation = () => {
    setFormData((prev) => {
      if (!prev) return null;
      const newVariations = [...prev.variations, { color: '', price: 0, stock_quantity: 0, low_stock_threshold: 0 }];
      return { ...prev, variations: newVariations };
    });
  };

  const handleRemoveVariation = (index: number) => {
    setFormData((prev) => {
      if (!prev) return null;
      const newVariations = prev.variations.filter((_, i) => i !== index);
      return { ...prev, variations: newVariations };
    });
  };

  const handleImageUpload = (url: string) => {
    setCurrentImageUrl(url);
    setFormData((prev) => (prev ? { ...prev, imageUrl: url } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const payload = { ...formData, imageUrl: currentImageUrl }; // Include imageUrl in payload
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProduct: ProductWithVariations = await response.json();
      setProduct(updatedProduct);
      setFormData(updatedProduct);
      setCurrentImageUrl(updatedProduct.imageUrl); // Update image URL after successful save
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="product-detail-page">Loading product details...</div>;
  }

  if (error) {
    return <div className="product-detail-page error">Error: {error}</div>;
  }

  if (!product) {
    return <div className="product-detail-page">Product not found.</div>;
  }

  return (
    <div className="product-detail-page">
      <h1>Product Details</h1>
      <Card className="product-detail-card">
        {!isEditing ? (
          <>
            {product.imageUrl && (
              <div className="mb-4">
                <img src={product.imageUrl} alt={product.name} className="max-w-xs max-h-48 object-contain rounded-md" />
              </div>
            )}
            <h2>{product.name}</h2>
            <p>
              <strong>Description:</strong> {product.description || 'N/A'}
            </p>
            <p>
              <strong>SKU:</strong> {product.sku || 'N/A'}
            </p>
            <h3>Variations:</h3>
            {product.variations.length > 0 ? (
              <ul>
                {product.variations.map((variation, index) => (
                  <li key={variation.id || index}>
                    Color: {variation.color}, Price: {variation.price}, Stock:{' '}
                    {variation.stock_quantity}
                    {variation.low_stock_threshold !== undefined && ` (Threshold: ${variation.low_stock_threshold})`}
                    {variation.id && (
                      <button
                        onClick={() => setShowPriceHistory(showPriceHistory === variation.id ? null : variation.id)}
                        className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
                      >
                        {showPriceHistory === variation.id ? 'Hide History' : 'View History'}
                      </button>
                    )}
                    {showPriceHistory === variation.id && variation.priceHistory && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Price History:</h4>
                        <PriceHistoryTable history={variation.priceHistory} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No variations available.</p>
            )}
            <div className="product-actions">
              <button className="button-primary" onClick={() => setIsEditing(true)}>
                Edit Product
              </button>
              <button className="button-secondary" onClick={() => navigate('/products')}>
                Back to List
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Product Image</h3>
              <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={currentImageUrl} />
            </div>
            <Input
              label="Product Name"
              name="name"
              value={formData?.name || ''}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Description"
              name="description"
              value={formData?.description || ''}
              onChange={handleInputChange}
              isTextArea
            />
            <Input
              label="SKU"
              name="sku"
              value={formData?.sku || ''}
              onChange={handleInputChange}
            />

            <h3>Variations:</h3>
            {formData?.variations.map((variation, index) => (
              <div key={variation.id || index} className="variation-item">
                <Input
                  label="Color"
                  name="color"
                  value={variation.color}
                  onChange={(e) => handleVariationChange(index, e)}
                  required
                />
                <Input
                  label="Price"
                  name="price"
                  type="number"
                  value={variation.price}
                  onChange={(e) => handleVariationChange(index, e)}
                  required
                />
                <Input
                  label="Stock Quantity"
                  name="stock_quantity"
                  type="number"
                  value={variation.stock_quantity}
                  onChange={(e) => handleVariationChange(index, e)}
                  required
                />
                <Input
                  label="Low Stock Threshold"
                  name="low_stock_threshold"
                  type="number"
                  value={variation.low_stock_threshold || 0}
                  onChange={(e) => handleVariationChange(index, e)}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVariation(index)}
                  className="button-secondary"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddVariation} className="button-secondary">
              Add Variation
            </button>

            <div className="product-actions">
              <button type="submit" className="button-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Product Reviews</h2>
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Write a Review
        </button>

        {/* {showReviewForm && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Submit Your Review</h3>
            <ReviewForm
              onSubmit={async (data) => {
                try {
                  const response = await fetch('http://localhost:3000/reviews', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...data, product_id: product.id }),
                  });
                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                  }
                  addNotification('Review submitted successfully!', 'success');
                  setShowReviewForm(false);
                  // Re-fetch reviews to update the list
                  const reviewsResponse = await fetch(`http://localhost:3000/reviews/product/${id}`);
                  if (reviewsResponse.ok) {
                    const reviewsData: Review[] = await reviewsResponse.json();
                    setReviews(reviewsData);
                  }
                } catch (err: any) {
                  addNotification(`Failed to submit review: ${err.message}`, 'error');
                }
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )} */}

        {/* <ReviewList
          reviews={reviews}
          onDelete={async (reviewId) => {
            if (!window.confirm('Are you sure you want to delete this review?')) return;
            try {
              const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
              }
              addNotification('Review deleted successfully!', 'success');
              // Re-fetch reviews to update the list
              const reviewsResponse = await fetch(`http://localhost:3000/reviews/product/${id}`);
              if (reviewsResponse.ok) {
                const reviewsData: Review[] = await reviewsResponse.json();
                setReviews(reviewsData);
              }
            } catch (err: any) {
              addNotification(`Failed to delete review: ${err.message}`, 'error');
            }
          }}
        /> */}
      </div>
    </div>
  );
};

export default ProductDetailPage;
