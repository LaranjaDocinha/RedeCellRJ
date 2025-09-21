import React from 'react';
import Form from '../components/Form';
import Field from '../components/Field';
import Button from '../components/Button';
import { useFormContext } from 'react-hook-form';
import { ImageUpload } from './ImageUpload'; // Import ImageUpload

interface ProductFormInputs {
  name: string;
  description?: string;
  sku?: string;
  branch_id: number;
  imageUrl?: string; // Add imageUrl
  variations: Array<{ color: string; price: number; stock_quantity: number; id?: number }>;
}

interface ProductFormProps {
  initialData?: ProductFormInputs | null;
  onSubmit: (data: ProductFormInputs) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit }) => {
  const [currentImageUrl, setCurrentImageUrl] = React.useState<string | undefined>(initialData?.imageUrl);

  const defaultValues = initialData || {
    name: '',
    description: '',
    sku: '',
    branch_id: 1, // Default branch ID
    imageUrl: '',
    variations: [{ color: '', price: 0, stock_quantity: 0 }],
  };

  const handleImageUpload = (url: string) => {
    setCurrentImageUrl(url);
  };

  const handleSubmit = (data: ProductFormInputs) => {
    onSubmit({ ...data, imageUrl: currentImageUrl });
  };

  return (
    <Form onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, control, formState: { errors } }) => (
        <>
          <Field name="name" label="Product Name" />
          <Field name="description" label="Description" />
          <Field name="sku" label="SKU" />
          <Field name="branch_id" label="Branch ID" type="number" />

          <h3 className="text-lg font-semibold mt-4 mb-2">Product Image</h3>
          <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={currentImageUrl} />

          {/* Variations - Simplificado por enquanto, idealmente seria um componente separado com FieldArray */}
          <h3 className="text-lg font-semibold mt-4 mb-2">Variations</h3>
          <Field name="variations.0.color" label="Color" />
          <Field name="variations.0.price" label="Price" type="number" />
          <Field name="variations.0.stock_quantity" label="Stock Quantity" type="number" />

          <Button type="submit" label="Save Product" />
        </>
      )}
    </Form>
  );
};

export default ProductForm;
