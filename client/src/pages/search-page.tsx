import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { Product } from "@shared/schema";

export default function SearchPage() {
  const [, params] = useLocation();
  const searchParams = new URLSearchParams(params);
  const initialTerm = searchParams.get("term") || "";
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [debouncedTerm, setDebouncedTerm] = useState(initialTerm);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [`/api/products/search?term=${debouncedTerm}`],
    enabled: debouncedTerm.length > 0,
  });

  // Debounce the search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedTerm(searchTerm);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" className="bg-primary hover:bg-blue-600">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {debouncedTerm && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Search Results for "{debouncedTerm}"
            </h1>
            <p className="text-gray-600">
              {isLoading
                ? "Searching..."
                : products?.length
                ? `Found ${products.length} results`
                : "No products found"}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : debouncedTerm ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Search className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-gray-600">
              We couldn't find any products matching "{debouncedTerm}".
            </p>
            <div className="mt-6">
              <h3 className="font-medium mb-2">Suggestions:</h3>
              <ul className="text-gray-600">
                <li>Check the spelling of your search term</li>
                <li>Try using more general keywords</li>
                <li>Try searching for related products</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <Search className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Search for products
            </h2>
            <p className="text-gray-600">
              Enter a search term to find products in our catalog
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
