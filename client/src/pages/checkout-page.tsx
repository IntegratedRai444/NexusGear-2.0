import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle, CreditCard, ShoppingCart, Truck, User, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { checkoutSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Extend the checkout schema with additional validation
const formSchema = checkoutSchema.extend({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  cardName: z.string().min(2, "Card holder name is required"),
  expiryDate: z.string().min(5, "Expiry date is required"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  savePaymentInfo: z.boolean().optional(),
});

type CheckoutFormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, total, count, isLoading: cartLoading } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [checkoutStep, setCheckoutStep] = useState(1);
  
  // Calculate shipping and totals
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08; // 8% tax rate
  const grandTotal = total + shipping + tax;

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      address: "",
      city: "",
      zipCode: "",
      country: "US",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
      savePaymentInfo: false,
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const res = await apiRequest("POST", "/api/checkout", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${data.orderId} has been placed.`,
      });
      setCheckoutStep(3); // Move to success step
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "There was a problem processing your order",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (checkoutStep === 1) {
      form.trigger(['fullName', 'email', 'address', 'city', 'zipCode', 'country']).then(isValid => {
        if (isValid) setCheckoutStep(2);
      });
    }
  };

  const prevStep = () => {
    if (checkoutStep === 2) {
      setCheckoutStep(1);
    }
  };

  const onSubmit = (data: CheckoutFormValues) => {
    checkoutMutation.mutate(data);
  };

  if (cartLoading || authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (count === 0 && checkoutStep !== 3) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout hideFooter={checkoutStep === 3}>
      <div className="container mx-auto px-4 py-8">
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-8">
            <div className={`flex flex-col items-center ${checkoutStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${checkoutStep >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                <User className="h-5 w-5" />
              </div>
              <span className="text-sm mt-1">Information</span>
            </div>
            <div className={`w-12 h-0.5 ${checkoutStep >= 2 ? 'bg-primary' : 'bg-gray-300'} mx-2`}></div>
            <div className={`flex flex-col items-center ${checkoutStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${checkoutStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm mt-1">Payment</span>
            </div>
            <div className={`w-12 h-0.5 ${checkoutStep >= 3 ? 'bg-primary' : 'bg-gray-300'} mx-2`}></div>
            <div className={`flex flex-col items-center ${checkoutStep >= 3 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${checkoutStep >= 3 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm mt-1">Confirmation</span>
            </div>
          </div>

          {checkoutStep === 1 && (
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Shipping Information</h1>
          )}
          {checkoutStep === 2 && (
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Payment Details</h1>
          )}
          {checkoutStep === 3 && (
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Order Confirmation</h1>
          )}
        </div>

        {checkoutStep !== 3 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="lg:w-2/3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {checkoutStep === 1 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Contact Information
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Truck className="mr-2 h-5 w-5" />
                        Shipping Address
                      </h2>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your street address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your zip code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="AU">Australia</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="bg-primary hover:bg-blue-600"
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 2 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Payment Method
                      </h2>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3 mb-6">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="credit_card" id="credit_card" />
                                  <Label htmlFor="credit_card" className="flex items-center">
                                    <i className="fab fa-cc-visa text-blue-700 text-2xl mr-2"></i>
                                    <i className="fab fa-cc-mastercard text-red-600 text-2xl mr-2"></i>
                                    <i className="fab fa-cc-amex text-blue-500 text-2xl"></i>
                                    <span className="ml-2">Credit / Debit Card</span>
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <Label htmlFor="paypal" className="flex items-center">
                                    <i className="fab fa-paypal text-blue-700 text-2xl mr-2"></i>
                                    <span>PayPal</span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("paymentMethod") === "credit_card" && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234 5678 9012 3456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Holder Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Name on card" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date</FormLabel>
                                  <FormControl>
                                    <Input placeholder="MM/YY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={prevStep}
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-blue-600"
                          disabled={checkoutMutation.isPending}
                        >
                          {checkoutMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Place Order"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Order Summary
                </h2>
                
                <div className="mb-4 max-h-80 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.cartItem.id} className="flex items-center py-2 border-b">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded mr-3"
                      />
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Qty: {item.cartItem.quantity}</span>
                          <span>{formatPrice(item.product.price * item.cartItem.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Thank You for Your Order!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully. We've sent a confirmation email with the details of your purchase.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-medium">Order Reference: <span className="text-primary">TS-{Math.floor(1000 + Math.random() * 9000)}</span></p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-blue-600">
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/orders">View Your Orders</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
