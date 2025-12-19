// frontend/src/components/Cart/CartDisplay.tsx
import React from 'react';
import { useCart } from '../../contexts/CartContext';

const CartDisplay: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Impostos e total podem ser adicionados aqui, dependendo da lógica de negócio
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.05; // Exemplo de 5% de imposto
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div style={{ border: '1px solid #eee', padding: '10px', margin: '10px', borderRadius: '5px' }}>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #eee', padding: '10px', margin: '10px', borderRadius: '5px' }}>
      <h2>Your Cart</h2>
      <ul>
        {cartItems.map(item => (
          <li key={item.id} style={{ marginBottom: '10px', borderBottom: '1px dashed #ccc', paddingBottom: '5px' }}>
            <div>
              <strong>{item.name}</strong> - ${item.price.toFixed(2)} x
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                min="1"
                style={{ width: '50px', marginLeft: '5px', marginRight: '5px' }}
              />
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
            <div>Total: ${(item.price * item.quantity).toFixed(2)}</div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax (5%): ${tax.toFixed(2)}</p>
        <h3>Total: ${total.toFixed(2)}</h3>
        <button onClick={clearCart} style={{ marginTop: '10px' }}>Clear Cart</button>
        {/* Botão de checkout pode ser adicionado aqui */}
      </div>
    </div>
  );
};

export default CartDisplay;
