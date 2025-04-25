import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, User, Menu, X, Gamepad2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { count } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: categories } = useQuery<{id: number, name: string, displayName: string}[]>({
    queryKey: ["/api/categories"],
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300 backdrop-blur-lg",
      isScrolled 
        ? "bg-background/80 shadow-lg border-b border-border/40" 
        : "bg-background/60"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="relative mr-2 text-primary">
                <Gamepad2 className="h-6 w-6 group-hover:text-accent transition-colors duration-300" />
                <div className="absolute -inset-1 bg-primary/10 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="logo-text text-xl font-black tracking-wider">
                <span className="text-gradient-cyber">Nexus</span>
                <span className="text-gradient-gaming">Gear</span>
              </div>
            </Link>
          </div>

          {/* Search Bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10">
                    <User className="h-5 w-5 mr-1" />
                    <span className="hidden md:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border border-border/50 bg-card/95 backdrop-blur-md">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="w-full cursor-pointer">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth" className="flex items-center text-foreground hover:text-primary">
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10">
                  <User className="h-5 w-5 mr-1" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
            
            <Link href="/cart" className="relative">
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-primary hover:bg-primary/10 relative"
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Cart</span>
                {count > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search (Conditional) */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Category Navigation */}
        <nav className={cn(
          "py-3 overflow-x-auto scrollbar-hide",
          mobileMenuOpen ? "block" : "hidden md:block"
        )}>
          <div className="flex space-x-6">
            <Link href="/" className={cn(
              "flex-shrink-0 pb-1 transition-all duration-300",
              location === "/" 
                ? "text-primary font-medium border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50"
            )}>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>Featured</span>
              </div>
            </Link>
            
            {categories?.map(category => (
              <Link 
                key={category.id} 
                href={`/category/${category.name}`}
                className={cn(
                  "flex-shrink-0 pb-1 transition-all duration-300",
                  location === `/category/${category.name}`
                    ? "text-primary font-medium border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50"
                )}
              >
                {category.displayName}
              </Link>
            ))}
            
            <Link 
              href="/contact"
              className={cn(
                "flex-shrink-0 pb-1 transition-all duration-300",
                location === "/contact"
                  ? "text-primary font-medium border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50"
              )}
            >
              Contact
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
