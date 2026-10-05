import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

import { supabase } from '../services/supabase';

type CartItem = {
  id: string;
  product_name: string;
  selling_price: number;
  image_url: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => Promise<void>;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = async (product: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, product_name, selling_price, image_url'
        )
        .eq('id', product.id)
        .single();

      if (error) {
        console.log(
          'CART PRODUCT ERROR:',
          error
        );
        return;
      }

      if (!data) {
        console.log(
          'CART PRODUCT NOT FOUND'
        );
        return;
      }

      const sellingPrice = Number(
        data.selling_price
      );

      if (!Number.isFinite(sellingPrice)) {
        console.log(
          'INVALID PRODUCT PRICE:',
          data.selling_price
        );
        return;
      }

      setCart((currentCart) => {
        const existingItem =
          currentCart.find(
            (item) => item.id === data.id
          );

        if (existingItem) {
          return currentCart.map((item) =>
            item.id === data.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
          );
        }

        return [
          ...currentCart,
          {
            id: data.id,
            product_name:
              data.product_name,
            selling_price: sellingPrice,
            image_url: data.image_url,
            quantity: 1,
          },
        ];
      });
    } catch (error) {
      console.log(
        'ADD TO CART ERROR:',
        error
      );
    }
  };

  const increaseQuantity = (
    id: string
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (
    id: string
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const removeFromCart = (
    id: string
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.selling_price *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
}