import { useState } from "react";
import { Link } from "wouter";
import { ShoppingBag, Trash2, Loader2, ShoppingCart, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import CartItem from "@/components/CartItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CartPage() {
  const { items, total, count, isLoading, clearCartMutation } = useCart();
  const [couponCode, setCouponCode] = useState("");
  
  // Calculate shipping based on cart total
  const shipping = total > 50 ? 0 : 9.99;
  const grandTotal = total + shipping;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (count === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild className="bg-primary hover:bg-blue-600">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <ShoppingBag className="h-6 w-6 mr-2" />
          <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.cartItem.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div>
                              <Link href={`/product/${item.product.id}`}>
                                <a className="font-medium hover:text-primary">
                                  {item.product.name}
                                </a>
                              </Link>
                              <p className="text-sm text-gray-500">
                                Category: {item.product.category}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(item.product.price)}</TableCell>
                        <TableCell>
                          <CartItem item={item} />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.product.price * item.cartItem.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden divide-y">
                {items.map(item => (
                  <div key={item.cartItem.id} className="p-4">
                    <CartItem item={item} />
                  </div>
                ))}
              </div>

              <div className="p-4 border-t flex flex-wrap justify-between gap-4">
                <div className="flex items-center">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => clearCartMutation.mutate()} 
                    disabled={clearCartMutation.isPending}
                    className="flex items-center"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Clear Cart
                  </Button>
                </div>
                <Button asChild variant="outline">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {count} {count === 1 ? 'item' : 'items'} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button 
                      className="absolute right-0 top-0 h-full rounded-l-none"
                      disabled={!couponCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col pt-4">
                <div className="flex justify-between w-full text-lg font-bold mb-4">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <Button asChild className="w-full bg-primary hover:bg-blue-600">
                  <Link href="/checkout">
                    <div className="flex items-center justify-center w-full">
                      Proceed to Checkout
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
