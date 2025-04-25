import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { Product } from "@shared/schema";
import { useMobile } from "@/hooks/use-mobile";

export default function NewArrivalsCarousel() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/new"],
  });
  
  const [position, setPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  
  // Determine number of visible items based on screen size
  const getVisibleItems = () => {
    if (isMobile) return 1; // Mobile: 1 item
    if (window.innerWidth < 768) return 2; // Small tablets: 2 items
    if (window.innerWidth < 1024) return 3; // Tablets: 3 items
    return 4; // Desktop: 4 items
  };
  
  const [visibleItems, setVisibleItems] = useState(getVisibleItems());
  
  // Update visible items on window resize
  useEffect(() => {
    const handleResize = () => {
      const newVisibleItems = getVisibleItems();
      setVisibleItems(newVisibleItems);
      
      // Make sure position is valid after resize
      const maxPosition = Math.max(0, (products?.length || 0) - newVisibleItems);
      if (position > maxPosition) {
        setPosition(maxPosition);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, products?.length]);
  
  const totalItems = products?.length || 0;
  const maxPosition = Math.max(0, totalItems - visibleItems);
  
  const moveNext = () => {
    if (position < maxPosition) {
      setPosition(position + 1);
    }
  };
  
  const movePrev = () => {
    if (position > 0) {
      setPosition(position - 1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 blur-xl opacity-70 animate-pulse"></div>
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
      </div>
    );
  }
  
  if (!products || products.length === 0) {
    return null;
  }
  
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background effects for gaming aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-background to-background z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex justify-between items-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <div className="mr-3 bg-primary/20 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gradient-gaming mb-1">Just Dropped</h2>
              <p className="text-muted-foreground">Latest gaming gear to elevate your experience</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={movePrev}
                disabled={position === 0}
                className="h-10 w-10 p-0 border-primary/30 bg-card/50 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={moveNext}
                disabled={position >= maxPosition}
                className="h-10 w-10 p-0 border-primary/30 bg-card/50 backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        {/* 3D transformed carousel container */}
        <motion.div 
          className="relative perspective"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Track glowing effect */}
          <div className="absolute inset-x-0 h-1/3 bottom-[15%] bg-gradient-to-r from-purple-900/0 via-purple-900/10 to-purple-900/0 blur-xl"></div>
          
          <div className="relative overflow-hidden perspective">
            <motion.div
              ref={carouselRef}
              className="flex transition-all duration-500 ease-out"
              style={{
                transform: `translateX(-${position * (100 / visibleItems)}%)`,
              }}
              animate={{
                x: `-${position * (100 / visibleItems)}%`
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex-shrink-0 transform-gpu"
                  style={{ width: `${100 / visibleItems}%`, padding: '0 0.75rem' }}
                  initial={{ opacity: 0, y: 20, rotateY: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="transform-gpu transition-all duration-300 hover:translate-z-5 hover:scale-[1.02]">
                    <ProductCard product={product} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Position indicators */}
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: Math.min(5, maxPosition + 1) }).map((_, i) => (
                <motion.button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === position ? 'bg-primary w-6' : 'bg-primary/30'}`}
                  onClick={() => setPosition(i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
