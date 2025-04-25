import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Product } from "@shared/schema";

type CartItemProps = {
  item: {
    cartItem: {
      id: number;
      productId: number;
      quantity: number;
    };
    product: Product;
  };
  showControls?: boolean;
};

export default function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateCartItemMutation, removeCartItemMutation } = useCart();
  const { cartItem, product } = item;

  const increaseQuantity = () => {
    updateCartItemMutation.mutate({
      id: cartItem.id,
      quantity: cartItem.quantity + 1,
    });
  };

  const decreaseQuantity = () => {
    if (cartItem.quantity > 1) {
      updateCartItemMutation.mutate({
        id: cartItem.id,
        quantity: cartItem.quantity - 1,
      });
    } else {
      removeCartItemMutation.mutate(cartItem.id);
    }
  };

  const removeItem = () => {
    removeCartItemMutation.mutate(cartItem.id);
  };

  return (
    <div className="flex items-center py-4 border-b">
      <Link href={`/product/${product.id}`}>
        <a>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-16 h-16 rounded object-cover mr-4"
          />
        </a>
      </Link>
      <div className="flex-grow">
        <Link href={`/product/${product.id}`}>
          <a>
            <h4 className="font-medium">{product.name}</h4>
          </a>
        </Link>
        <p className="text-gray-500 text-sm">
          {cartItem.quantity} × {formatPrice(product.price)}
        </p>
      </div>
      {showControls && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-primary"
            onClick={decreaseQuantity}
            disabled={updateCartItemMutation.isPending}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-2">{cartItem.quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-primary"
            onClick={increaseQuantity}
            disabled={updateCartItemMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-4 text-gray-500 hover:text-red-500"
            onClick={removeItem}
            disabled={removeCartItemMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
