import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Gamepad2, Headphones, Joystick, Laptop, Sparkles, Volume2, LucideHeadphones } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import NewArrivalsCarousel from "@/components/NewArrivalsCarousel";
import { Button } from "@/components/ui/button";
import { Product, Category } from "@shared/schema";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <Layout>
      {/* Hero Section - Gaming Equipment */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 z-0"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div 
            className="flex flex-col md:flex-row md:items-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div 
              className="md:w-1/2 mb-8 md:mb-0 md:pr-8"
              variants={fadeIn}
            >
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 text-gradient">
                Level Up Your <br/>Gaming Experience
              </h1>
              <p className="text-lg mb-8 text-foreground/80">
                Discover premium gaming gear with immersive sound, precision controls, and cutting-edge performance
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/80 text-white neon-glow">
                    <Link href="#featured">Explore Collection</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="outline" size="lg" className="bg-background/20 backdrop-blur-sm hover:bg-white/10 border border-primary/50 text-white">
                    <Link href="/category/headphones">Gaming Headsets</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 relative"
              variants={fadeIn}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1200&auto=format&fit=crop" 
                  alt="Premium Gaming Headphones" 
                  className="rounded-lg shadow-2xl w-full h-auto object-cover z-10 relative"
                />
                <div className="absolute -right-3 -bottom-3 w-full h-full border-2 border-primary rounded-lg z-0"></div>
                <div className="absolute -left-3 -top-3 w-full h-full border-2 border-secondary rounded-lg z-0"></div>
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-accent text-white font-bold py-2 px-4 rounded-lg shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  New 2025 Models
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Featured categories icons */}
          <motion.div 
            className="flex justify-center gap-10 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {[
              { icon: <Headphones className="w-6 h-6" />, label: "Headphones" },
              { icon: <Gamepad2 className="w-6 h-6" />, label: "Consoles" },
              { icon: <Laptop className="w-6 h-6" />, label: "Gaming Laptops" },
              { icon: <Volume2 className="w-6 h-6" />, label: "Speakers" },
              { icon: <Joystick className="w-6 h-6" />, label: "Controllers" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="flex flex-col items-center text-center"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2 text-primary">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex justify-between items-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Featured Gaming Gear</h2>
              <p className="text-muted-foreground">Premium equipment for the ultimate gaming experience</p>
            </div>
            <Link href="/products" className="text-primary hover:text-primary/80 font-medium flex items-center group">
              View All <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {featuredLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
                  <div className="h-48 bg-muted animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2 w-24"></div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
                      <div className="h-8 bg-muted rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-gradient-to-b from-background/30 to-background/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Gaming Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our specialized gaming equipment collections
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {categoriesLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center p-4 bg-card rounded-xl shadow-md">
                  <div className="w-16 h-16 rounded-full bg-muted animate-pulse mb-4"></div>
                  <div className="h-5 bg-muted rounded animate-pulse w-24 mb-2"></div>
                </div>
              ))
            ) : (
              categories?.map((category) => (
                <motion.div
                  key={category.id}
                  variants={fadeIn}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Carousel */}
      <NewArrivalsCarousel />

      {/* Promo Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-800/10 via-transparent to-transparent z-0"></div>
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col md:flex-row md:items-center bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-500/20 p-4 md:p-8 overflow-hidden">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="bg-secondary/80 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">LIMITED TIME OFFER</span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gradient">Epic Gaming Headset Sale</h2>
                <p className="text-lg mb-6 text-foreground/80">Get 20% off on premium gaming headphones and unlock your competitive edge</p>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  {['Days', 'Hours', 'Mins', 'Secs'].map((unit, i) => (
                    <motion.div 
                      key={unit}
                      className="bg-card backdrop-blur-sm rounded-lg p-4 flex flex-col items-center border border-purple-500/30 shadow-lg min-w-[80px]"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-foreground">{[2, 18, 45, 12][i]}</div>
                      <div className="text-xs uppercase text-muted-foreground">{unit}</div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild size="lg" className="bg-secondary hover:bg-secondary/80 text-white neon-glow">
                    <Link href="/category/headphones">Shop Headsets</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
            
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-1 rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600"
                  animate={{ 
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatType: 'reverse',
                  }}
                ></motion.div>
                
                <img 
                  src="https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=800&auto=format&fit=crop" 
                  alt="Premium Gaming Headphones" 
                  className="rounded-lg relative z-10 w-full h-auto object-cover"
                />
                
                <motion.div 
                  className="absolute -top-6 -right-6 bg-purple-900/80 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-lg shadow-xl rotate-12 z-20"
                  animate={{ 
                    rotate: [12, -5, 12],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                  }}
                >
                  20% OFF
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gradient">Gamer Reviews</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied gamers using our equipment
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                name: "Alex Thompson",
                role: "Pro Gamer",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                content: "The HyperX Cloud III headset completely transformed my gaming experience. Incredible sound separation helps me locate enemies with precision, and the comfort is unmatched even during 8-hour tournaments.",
                rating: 5
              },
              {
                name: "Sophia Chen",
                role: "Twitch Streamer",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                content: "Legion Pro 7i is an absolute beast! Handles my gaming and streaming setup flawlessly. The RGB lighting and cooling system are top-notch, and my viewers always comment on the crisp gameplay quality.",
                rating: 5
              },
              {
                name: "Marcus Williams",
                role: "Casual Gamer",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
                content: "The Xbox Elite controller was totally worth the investment. The customizable buttons have improved my gameplay dramatically. The build quality is exceptional and the battery life is impressive.",
                rating: 4.5
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                className="bg-card rounded-xl shadow-lg p-6 border border-border relative hover-float"
                variants={fadeIn}
              >
                <div className="absolute -top-4 -right-4 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                
                <div className="flex text-amber-400 mb-4">
                  {Array(Math.floor(testimonial.rating)).fill(0).map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                  {testimonial.rating % 1 === 0.5 && (
                    <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 17.27L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                    </svg>
                  )}
                </div>
                
                <p className="text-foreground/80 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-primary p-0.5">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl border border-border p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gradient">Join The Gaming Community</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe for exclusive deals, early access to new products, and gaming tips
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  required 
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" className="bg-primary hover:bg-primary/80 text-white w-full sm:w-auto">
                    Subscribe
                  </Button>
                </motion.div>
              </form>
              <p className="text-muted-foreground text-sm mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
