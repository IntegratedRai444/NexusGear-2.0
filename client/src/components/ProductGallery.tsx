import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "./ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { filterByPriceRange, sortProducts } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ProductGalleryProps = {
  title: string;
  apiUrl: string;
  emptyMessage?: string;
};

export default function ProductGallery({ title, apiUrl, emptyMessage = "No products found" }: ProductGalleryProps) {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [apiUrl],
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  
  const productsPerPage = 8;
  
  // Process products based on filters and sorting
  const processProducts = () => {
    if (!products) return [];
    
    // First filter by price range
    const filtered = filterByPriceRange(products, priceRange[0], priceRange[1]);
    
    // Then sort
    return sortProducts(filtered, sortBy);
  };
  
  const filteredProducts = processProducts();
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  
  // Update price range from inputs
  const handlePriceRangeUpdate = () => {
    setPriceRange([minPrice, maxPrice]);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-500">Error loading products: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <div className="flex items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="md:w-1/4 lg:w-1/5">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-4">Filters</h3>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">Price Range</h4>
              <div className="mb-4">
                <Slider
                  value={priceRange}
                  min={0}
                  max={2000}
                  step={10}
                  onValueChange={setPriceRange}
                  className="mb-6"
                />
                <div className="flex items-center gap-4">
                  <div>
                    <Label htmlFor="min-price">Min</Label>
                    <Input
                      id="min-price"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      min={0}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-price">Max</Label>
                    <Input
                      id="max-price"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      min={0}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handlePriceRangeUpdate}
                  className="mt-2 w-full"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product grid */}
        <div className="md:w-3/4 lg:w-4/5">
          {paginatedProducts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
