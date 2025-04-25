import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full group">
      {/* Glow effect for focus state */}
      <div 
        className={cn(
          "absolute inset-0 rounded-lg transition-opacity duration-300 opacity-0",
          isFocused ? "opacity-100" : "opacity-0",
          "bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-md -z-10"
        )}
      />
      
      <div className="relative">
        <Input
          type="text"
          placeholder="Search gaming gear..."
          className={cn(
            "w-full py-5 px-4 pl-10 pr-12",
            "bg-card/50 backdrop-blur-sm border-border/60",
            "rounded-lg text-foreground placeholder:text-muted-foreground/70",
            "transition-all duration-300",
            "focus:border-primary/50 focus:bg-card/80 focus:ring-1 focus:ring-primary/30"
          )}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {/* Left icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        
        {/* Submit button */}
        <motion.div 
          className="absolute right-3 top-1/2 -translate-y-1/2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            type="submit"
            variant="ghost" 
            size="icon"
            className="h-7 w-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          >
            <Zap className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
