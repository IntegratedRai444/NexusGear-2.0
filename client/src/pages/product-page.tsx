import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Star, StarHalf, ShoppingCart, Heart, Info, Minus, Plus, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ? parseInt(params.id) : 0;
  const [quantity, setQuantity] = useState(1);
  const { addToCartMutation } = useCart();

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const { data: relatedProducts, isLoading: relatedLoading } = useQuery<Product[]>({
    queryKey: [product ? `/api/products/category/${product.category}` : null],
    enabled: !!product,
  });

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const addToCart = () => {
    if (product) {
      addToCartMutation.mutate({ 
        productId: product.id, 
        quantity 
      });
      
      // Dispatch a custom event to open the cart drawer
      window.dispatchEvent(new CustomEvent("open-cart"));
    }
  };

  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex text-amber-400">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-current" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    );
  };

  if (productLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-center">Product not found</h1>
        </div>
      </Layout>
    );
  }

  const breadcrumbSegments = [
    { name: "Products", href: "/products" },
    { name: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: `/category/${product.category}` },
    { name: product.name, href: `/product/${product.id}` }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb segments={breadcrumbSegments} className="mb-8" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image */}
          <div className="lg:w-1/2">
            <Card>
              <CardContent className="p-2">
                <div className="relative aspect-square overflow-hidden rounded-md">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="object-cover w-full h-full"
                  />
                  {product.isNew && (
                    <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-2 py-1 rounded-md">
                      NEW
                    </span>
                  )}
                  {product.comparePrice && (
                    <span className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md">
                      SALE
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              {renderRating(product.rating)}
              <span className="text-gray-500">({product.reviewCount} reviews)</span>
            </div>

            <div className="mb-4">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                {product.comparePrice && (
                  <span className="text-gray-500 text-lg line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.comparePrice && (
                <div className="text-green-600 font-medium mt-1">
                  You save {formatPrice(product.comparePrice - product.price)} 
                  ({Math.round((1 - product.price / product.comparePrice) * 100)}%)
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6">
              <div className="font-medium mb-2">Availability:</div>
              <div className={product.inStock ? "text-green-600" : "text-red-600"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <div className="mb-6">
              <div className="font-medium mb-2">Quantity:</div>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-medium text-lg">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Button 
                size="lg" 
                className="flex-1 bg-primary hover:bg-blue-600"
                onClick={addToCart}
                disabled={addToCartMutation.isPending || !product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center text-sm text-gray-500">
              <Info className="mr-2 h-4 w-4" />
              Free shipping on orders over $50
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-4 mt-4">
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-gray-600 mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, 
                vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, 
                ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique.
              </p>
            </TabsContent>
            <TabsContent value="specifications" className="p-4 mt-4">
              <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <div className="font-medium">Category</div>
                  <div className="text-gray-600">{product.category}</div>
                </div>
                <div className="border-b pb-2">
                  <div className="font-medium">Brand</div>
                  <div className="text-gray-600">TechSphere</div>
                </div>
                <div className="border-b pb-2">
                  <div className="font-medium">Warranty</div>
                  <div className="text-gray-600">1 Year</div>
                </div>
                <div className="border-b pb-2">
                  <div className="font-medium">Model</div>
                  <div className="text-gray-600">TS-{product.id}</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="p-4 mt-4">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="text-4xl font-bold">{product.rating.toFixed(1)}</div>
                  <div className="text-gray-500">out of 5</div>
                </div>
                <div>
                  {renderRating(product.rating)}
                  <div className="text-gray-500 mt-1">Based on {product.reviewCount} reviews</div>
                </div>
              </div>
              
              {/* Sample Reviews */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {renderRating(5)}
                    </div>
                    <div className="font-medium">John D.</div>
                    <div className="text-gray-500 text-sm ml-2">2 months ago</div>
                  </div>
                  <p className="text-gray-600">
                    Great product, exceeded my expectations! Would definitely recommend.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {renderRating(4)}
                    </div>
                    <div className="font-medium">Sarah M.</div>
                    <div className="text-gray-500 text-sm ml-2">1 month ago</div>
                  </div>
                  <p className="text-gray-600">
                    Good quality and fast shipping. Only giving 4 stars because the setup instructions could be clearer.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          
          {relatedLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts
                ?.filter(p => p.id !== product.id)
                .slice(0, 4)
                .map(relatedProduct => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
