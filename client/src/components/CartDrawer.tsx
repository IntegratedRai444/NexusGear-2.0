import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import CartItem from "./CartItem";

export default function CartDrawer() {
  const [location] = useLocation();
  const { items, total, count } = useCart();
  const [open, setOpen] = useState(false);

  // Listen for custom event to open cart
  useEffect(() => {
    const handleOpenCart = () => setOpen(true);
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  // Close the cart when navigating to cart or checkout pages
  useEffect(() => {
    if (location === "/cart" || location === "/checkout") {
      setOpen(false);
    }
  }, [location]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Your Cart {count > 0 && <span className="text-primary">({count} items)</span>}</SheetTitle>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="flex-grow overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <CartItem key={item.cartItem.id} item={item} />
                ))}
              </>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator className="my-4" />
              <Button asChild className="w-full mb-2 bg-primary hover:bg-blue-600">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full text-primary hover:text-blue-700"
                onClick={() => setOpen(false)}
              >
                <Link href="/cart">View Cart</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
