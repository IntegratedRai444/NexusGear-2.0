import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import ProductGallery from "@/components/ProductGallery";
import { Category } from "@shared/schema";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const categorySlug = params?.category || "";

  const { data: category, isLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categorySlug}`],
    enabled: !!categorySlug,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-center">Category not found</h1>
        </div>
      </Layout>
    );
  }

  const breadcrumbSegments = [
    { name: "Products", href: "/products" },
    { name: category.displayName, href: `/category/${category.name}` },
  ];

  // Set up hero section background based on category
  const getHeroBgColor = () => {
    switch (category.name) {
      case 'smartphones':
        return "from-blue-900 to-blue-700";
      case 'laptops':
        return "from-purple-900 to-purple-700";
      case 'audio':
        return "from-green-900 to-green-700";
      case 'wearables':
        return "from-red-900 to-red-700";
      case 'smarthome':
        return "from-yellow-800 to-yellow-600";
      case 'gaming':
        return "from-indigo-900 to-indigo-700";
      default:
        return "from-blue-900 to-violet-900";
    }
  };

  // Set up hero icon based on category
  const getHeroIcon = () => {
    return `fas ${category.icon} text-3xl mr-2`;
  };

  return (
    <Layout>
      {/* Category Hero */}
      <section className={`bg-gradient-to-r ${getHeroBgColor()} text-white`}>
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb 
            segments={breadcrumbSegments} 
            className="mb-6 text-white/80" 
          />
          <div className="flex items-center mb-4">
            <i className={getHeroIcon()}></i>
            <h1 className="text-3xl md:text-4xl font-bold">{category.displayName}</h1>
          </div>
          {category.description && (
            <p className="text-lg text-white/90 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products Gallery */}
      <ProductGallery 
        title={`${category.displayName} Products`} 
        apiUrl={`/api/products/category/${category.name}`} 
        emptyMessage={`No products found in the ${category.displayName} category`}
      />
    </Layout>
  );
}
