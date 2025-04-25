import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, StarHalf, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatPrice, truncateText } from "@/lib/utils";
import { Product } from "@shared/schema";
import { motion } from "framer-motion";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCartMutation } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  
  const addToCart = () => {
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const renderRating = () => {
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex text-amber-400">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-current" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="bg-card rounded-xl shadow-md overflow-hidden border border-border group hover-float neon-glow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <Link href={`/product/${product.id}`} className="block">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-52 object-cover object-center transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        </Link>
        
        <div className="absolute top-3 right-3 z-10">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-border"
          >
            <Heart className="h-4 w-4 text-primary hover:fill-primary transition-all duration-300" />
          </motion.button>
        </div>
        
        {product.isNew && (
          <motion.div 
            className="absolute top-3 left-3 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">NEW</span>
          </motion.div>
        )}
        
        {product.comparePrice && (
          <motion.div 
            className="absolute top-3 left-3 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md">SALE</span>
          </motion.div>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-gradient transition duration-300">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          {renderRating()}
          <span className="text-muted-foreground text-sm ml-1">({product.reviewCount})</span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">
          {truncateText(product.description, 60)}
        </p>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-xl text-foreground price-inr">
              {formatPrice(product.price).replace('₹', '')}
            </span>
            {product.comparePrice && (
              <span className="text-muted-foreground text-sm line-through ml-2 price-inr">
                {formatPrice(product.comparePrice).replace('₹', '')}
              </span>
            )}
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/80 text-white rounded-lg"
              onClick={addToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
