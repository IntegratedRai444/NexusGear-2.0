import { Link } from "wouter";
import { Category } from "@shared/schema";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Gamepad2, Headphones, Joystick, Laptop, Volume2, SquareUser } from "lucide-react";
import { useRef } from "react";

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  // 3D card movement effect
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const posX = e.clientX - centerX;
    const posY = e.clientY - centerY;
    x.set(posX);
    y.set(posY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Get the icon based on category name
  const getIcon = () => {
    switch (category.name) {
      case 'headphones':
        return <Headphones className="w-8 h-8" />;
      case 'laptops':
        return <Laptop className="w-8 h-8" />;
      case 'consoles':
        return <Gamepad2 className="w-8 h-8" />;
      case 'earbuds':
        return <Headphones className="w-8 h-8" />;
      case 'accessories':
        return <Joystick className="w-8 h-8" />;
      case 'chairs':
        return <SquareUser className="w-8 h-8" />;
      default:
        return <Gamepad2 className="w-8 h-8" />;
    }
  };

  // Define glow color based on category name
  const getGlowColor = () => {
    switch (category.name) {
      case 'headphones':
        return 'from-purple-500 to-blue-500';
      case 'laptops':
        return 'from-blue-500 to-cyan-400';
      case 'consoles':
        return 'from-green-500 to-emerald-400';
      case 'earbuds':
        return 'from-pink-500 to-purple-500';
      case 'accessories':
        return 'from-amber-500 to-orange-400';
      case 'chairs':
        return 'from-indigo-500 to-violet-400';
      default:
        return 'from-purple-500 to-blue-500';
    }
  };

  return (
    <Link href={`/category/${category.name}`} className="block">
      <motion.div
        ref={cardRef}
        className="relative p-1 rounded-xl group perspective"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          // Apply 3D rotation
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
      >
        {/* Gradient border effect */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${getGlowColor()} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        
        {/* Card content */}
        <div className="relative flex flex-col items-center p-6 bg-card rounded-xl shadow-md border border-border z-10 transform-gpu transition-all duration-300">
          {/* Icon with dynamic background */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
            <motion.div 
              className="text-primary group-hover:text-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {getIcon()}
            </motion.div>
          </div>
          
          {/* Category name */}
          <span className="font-bold text-foreground text-center group-hover:text-gradient transition-all duration-300">
            {category.displayName}
          </span>
          
          {/* Hover effects */}
          <motion.div 
            className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-0 group-hover:opacity-100"
            initial={{ width: "0%" }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </Link>
  );
}
