import { ReactNode } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

type LayoutProps = {
  children: ReactNode;
  hideFooter?: boolean;
};

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
    }
  }
};

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background grid pattern with glow effect */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] z-0 bg-gradient-to-b from-purple-900/20 via-blue-900/20 to-transparent"></div>
      </div>
      
      <Header />
      
      <main className="flex-grow relative z-10">
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
      
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  );
}
