import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  categories, type Category, type InsertCategory
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  searchProducts(term: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart operations
  getCartItems(sessionId: string, userId?: number): Promise<CartItem[]>;
  getCartItemWithProduct(cartItemId: number): Promise<{cartItem: CartItem, product: Product} | undefined>;
  getCartWithProducts(sessionId: string, userId?: number): Promise<{cartItem: CartItem, product: Product}[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string, userId?: number): Promise<boolean>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private categories: Map<number, Category>;
  sessionStore: session.SessionStore;

  currentUserId: number;
  currentProductId: number;
  currentCartItemId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentCategoryId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.categories = new Map();

    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentCategoryId = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h in milliseconds
    });

    // Initialize with default categories
    this.initializeCategories();
    // Initialize with sample products
    this.initializeProducts();
  }

  private initializeCategories() {
    const defaultCategories: InsertCategory[] = [
      { 
        name: "headphones", 
        displayName: "Gaming Headphones", 
        icon: "fa-headphones",
        imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=600&auto=format&fit=crop"
      },
      { 
        name: "earbuds", 
        displayName: "Gaming Earbuds", 
        icon: "fa-headphones-alt",
        imageUrl: "https://images.unsplash.com/photo-1606220588913-6fec7716022b?q=80&w=600&auto=format&fit=crop"
      },
      { 
        name: "consoles", 
        displayName: "Gaming Consoles", 
        icon: "fa-gamepad",
        imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=600&auto=format&fit=crop"
      },
      { 
        name: "accessories", 
        displayName: "Gaming Accessories", 
        icon: "fa-keyboard",
        imageUrl: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=600&auto=format&fit=crop"
      },
      { 
        name: "laptops", 
        displayName: "Gaming Laptops", 
        icon: "fa-laptop",
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop"
      }
    ];

    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  private initializeProducts() {
    const defaultProducts: InsertProduct[] = [
      {
        name: "Razer Kraken X Gaming Headphones",
        description: "7.1 Surround Sound - Lightweight Aluminum Frame - Designed for Gaming Comfort",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=600&auto=format&fit=crop",
        category: "headphones",
        rating: 4.5,
        reviewCount: 128,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "Legion Pro 7i Gaming Laptop",
        description: "Intel Core i9, RTX 4090, 32GB RAM, 2TB SSD, 16″ QHD 240Hz Display",
        price: 1899.99,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop",
        category: "laptops",
        rating: 5,
        reviewCount: 342,
        inStock: true,
        isFeatured: true
      },
      {
        name: "HP OMEN 16 Gaming Laptop",
        description: "AMD Ryzen 9 7940HS, NVIDIA GeForce RTX 4070, 32GB DDR5, 1TB SSD, 16.1″ QHD 240Hz IPS Display",
        price: 1699.99,
        imageUrl: "https://images.unsplash.com/photo-1630794180018-433d915c34ac?q=80&w=600&auto=format&fit=crop",
        category: "laptops",
        rating: 4.8,
        reviewCount: 203,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "ROG Chakram X Gaming Mouse",
        description: "RGB Wireless Gaming Mouse with 36,000 DPI, Push-button Switch Socket, and Joystick Control",
        price: 89.99,
        comparePrice: 119.99,
        imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop",
        category: "accessories",
        rating: 4,
        reviewCount: 96,
        inStock: true,
        isNew: false,
        isFeatured: true
      },
      {
        name: "SteelSeries Arctis Nova Pro",
        description: "Wireless Multi-System Gaming Headset + GameDAC Gen 2 with Hot-Swappable Battery System",
        price: 249.99,
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
        category: "headphones",
        rating: 4.5,
        reviewCount: 215,
        inStock: true,
        isFeatured: true
      },
      {
        name: "ASUS ROG Strix G16 Gaming Laptop",
        description: "16-inch 240Hz, Intel Core i7, NVIDIA RTX 4070, 16GB DDR5, 1TB SSD",
        price: 1499.99,
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop",
        category: "laptops",
        rating: 5,
        reviewCount: 42,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "Razer Hammerhead True Wireless Earbuds",
        description: "Low-Latency Bluetooth Gaming Earbuds with Noise Cancellation and RGB",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1600086827875-a63b01f1335c?q=80&w=600&auto=format&fit=crop",
        category: "earbuds",
        rating: 4,
        reviewCount: 18,
        inStock: true,
        isNew: true,
        isFeatured: false
      },
      {
        name: "PlayStation 5 Pro Console",
        description: "Next-gen gaming with 8K graphics, lightning-fast loading with ultra-high speed SSD",
        price: 699.99,
        imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=600&auto=format&fit=crop",
        category: "consoles",
        rating: 4.5,
        reviewCount: 531,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "Xbox Elite Wireless Controller Series 2",
        description: "Customizable controller with adjustable tension thumbsticks and wrap-around rubberized grip",
        price: 179.99,
        imageUrl: "https://images.unsplash.com/photo-1601784551606-1adf416b4ecd?q=80&w=600&auto=format&fit=crop",
        category: "accessories",
        rating: 4.8,
        reviewCount: 254,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "Nintendo Switch OLED",
        description: "Enhanced gaming with vibrant 7-inch OLED screen and improved audio",
        price: 349.99,
        imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?q=80&w=600&auto=format&fit=crop",
        category: "consoles",
        rating: 4.2,
        reviewCount: 178,
        inStock: true,
        isNew: false,
        isFeatured: false
      },
      {
        name: "HyperX Cloud III Wireless Gaming Headset",
        description: "Ultra-comfort with memory foam, spatial audio, 120 hours battery life",
        price: 169.99,
        imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop",
        category: "headphones",
        rating: 4.7,
        reviewCount: 129,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "HyperX Cloud Alpha Wireless Gaming Headset",
        description: "300-hour battery life, DTS Headphone:X Spatial Audio, memory foam ear cushions",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1616876195047-522383fd9ba0?q=80&w=600&auto=format&fit=crop",
        category: "headphones",
        rating: 4.9,
        reviewCount: 178,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "HyperX Cloud Core Wireless Gaming Headset",
        description: "DTS Headphone:X Spatial Audio, 20-hour battery life, detachable noise-canceling microphone",
        price: 129.99,
        comparePrice: 159.99,
        imageUrl: "https://images.unsplash.com/photo-1592744530638-92a4abbf496a?q=80&w=600&auto=format&fit=crop",
        category: "headphones",
        rating: 4.6,
        reviewCount: 142,
        inStock: true,
        isNew: false,
        isFeatured: true
      },
      {
        name: "ASUS ROG Strix G16 Gaming Laptop",
        description: "16-inch QHD 240Hz, Intel Core i9-14900H, NVIDIA RTX 4080, 32GB DDR5, 2TB SSD",
        price: 2199.99,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=600&auto=format&fit=crop",
        category: "laptops",
        rating: 4.8,
        reviewCount: 156,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "HP OMEN 16 Gaming Laptop",
        description: "16.1-inch QHD 240Hz, AMD Ryzen 9 7940HS, NVIDIA RTX 4070, 32GB DDR5, 2TB SSD",
        price: 1899.99,
        imageUrl: "https://images.unsplash.com/photo-1630794180018-433d915c34ac?q=80&w=600&auto=format&fit=crop",
        category: "laptops",
        rating: 4.7,
        reviewCount: 124,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "ASUS ROG Zephyrus Duo 16",
        description: "16-inch QHD 240Hz + 14-inch Secondary Display, AMD Ryzen 9 7945HX, NVIDIA RTX 4090, 64GB DDR5, 4TB SSD",
        price: 3999.99,
        imageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=600&auto=format&fit=crop",
        category: "laptops",
        rating: 4.9,
        reviewCount: 89,
        inStock: true,
        isNew: true,
        isFeatured: true
      },
      {
        name: "Logitech G915 TKL Wireless Gaming Keyboard",
        description: "Low profile GL mechanical switches with RGB lighting and aircraft-grade aluminum alloy",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=600&auto=format&fit=crop",
        category: "accessories",
        rating: 4.6,
        reviewCount: 87,
        inStock: true,
        isNew: false,
        isFeatured: true
      }
    ];

    defaultProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category,
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured,
    );
  }

  async getNewProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isNew,
    );
  }

  async searchProducts(term: string): Promise<Product[]> {
    const lowerTerm = term.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowerTerm) || 
        product.description.toLowerCase().includes(lowerTerm),
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const createdAt = new Date();
    const product: Product = { ...insertProduct, id, createdAt };
    this.products.set(id, product);
    return product;
  }

  // Cart methods
  async getCartItems(sessionId: string, userId?: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => (userId && item.userId === userId) || item.sessionId === sessionId,
    );
  }

  async getCartItemWithProduct(cartItemId: number): Promise<{cartItem: CartItem, product: Product} | undefined> {
    const cartItem = this.cartItems.get(cartItemId);
    if (!cartItem) return undefined;

    const product = this.products.get(cartItem.productId);
    if (!product) return undefined;

    return { cartItem, product };
  }

  async getCartWithProducts(sessionId: string, userId?: number): Promise<{cartItem: CartItem, product: Product}[]> {
    const cartItems = await this.getCartItems(sessionId, userId);
    const result: {cartItem: CartItem, product: Product}[] = [];

    for (const item of cartItems) {
      const product = this.products.get(item.productId);
      if (product) {
        result.push({ cartItem: item, product });
      }
    }

    return result;
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = await this.getCartItems(
      insertItem.sessionId || "",
      insertItem.userId,
    );

    const existingItem = existingItems.find(
      (item) => item.productId === insertItem.productId,
    );

    if (existingItem) {
      // Update quantity of existing item
      return this.updateCartItem(existingItem.id, existingItem.quantity + insertItem.quantity) as Promise<CartItem>;
    }

    // Add new item to cart
    const id = this.currentCartItemId++;
    const createdAt = new Date();
    const cartItem: CartItem = { ...insertItem, id, createdAt };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;

    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string, userId?: number): Promise<boolean> {
    const cartItems = await this.getCartItems(sessionId, userId);
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    return true;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    return order;
  }

  async addOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const createdAt = new Date();
    const orderItem: OrderItem = { ...insertItem, id, createdAt };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name === name,
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
}

import { MongoStorage } from './db/mongoStorage';

// Use MongoDB storage implementation if MONGO_ENABLED=true, otherwise use in-memory storage
const useMongoDb = process.env.MONGO_ENABLED === 'true';

export const storage: IStorage = useMongoDb 
  ? new MongoStorage() 
  : new MemStorage();

console.log(`Using ${useMongoDb ? 'MongoDB' : 'In-Memory'} storage implementation`);