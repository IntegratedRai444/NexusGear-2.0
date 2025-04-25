import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { data: categories } = useQuery<{id: number, name: string, displayName: string}[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-accent">Tech</span>
              <span className="text-primary">Sphere</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Your premier destination for cutting-edge technology products and solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Shop</h4>
            <ul className="space-y-2">
              {categories?.map(category => (
                <li key={category.id}>
                  <Link href={`/category/${category.name}`} className="text-gray-400 hover:text-white transition duration-300">
                    {category.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition duration-300">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition duration-300">FAQs</Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition duration-300">Shipping & Returns</Link>
              </li>
              <li>
                <Link href="/warranty" className="text-gray-400 hover:text-white transition duration-300">Warranty Info</Link>
              </li>
              <li>
                <Link href="/track" className="text-gray-400 hover:text-white transition duration-300">Track Order</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-4">About Us</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition duration-300">Our Story</Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition duration-300">Careers</Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-white transition duration-300">Press</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition duration-300">Blog</Link>
              </li>
              <li>
                <Link href="/stores" className="text-gray-400 hover:text-white transition duration-300">Store Locations</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} TechSphere. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition duration-300">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-white text-sm transition duration-300">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}