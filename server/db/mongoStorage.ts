import session from 'express-session';
import connectMongo from 'connect-mongodb-session';
import mongoose from 'mongoose';
import { IStorage } from '../storage';
import {
  User, IUser,
  Product, IProduct,
  Category, ICategory,
  CartItem, ICartItem,
  Order, IOrder,
  OrderItem, IOrderItem
} from './models';
import { 
  User as UserType, InsertUser,
  Product as ProductType, InsertProduct,
  Category as CategoryType, InsertCategory,
  CartItem as CartItemType, InsertCartItem,
  Order as OrderType, InsertOrder,
  OrderItem as OrderItemType, InsertOrderItem
} from '@shared/schema';

// Create MongoDB session store
const MongoDBStore = connectMongo(session);

export class MongoStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    // Create MongoDB session store
    this.sessionStore = new MongoDBStore({
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nexusgear',
      collection: 'sessions',
      expires: 1000 * 60 * 60 * 24 * 7, // 1 week
    });
  }

  // User methods
  async getUser(id: number): Promise<UserType | undefined> {
    try {
      const user = await User.findById(id);
      if (!user) return undefined;
      return this.mapUserToSchema(user);
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ username });
      if (!user) return undefined;
      return this.mapUserToSchema(user);
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ email });
      if (!user) return undefined;
      return this.mapUserToSchema(user);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    try {
      const user = new User(insertUser);
      await user.save();
      return this.mapUserToSchema(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Product methods
  async getProducts(): Promise<ProductType[]> {
    try {
      const products = await Product.find();
      return products.map(p => this.mapProductToSchema(p));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProductById(id: number): Promise<ProductType | undefined> {
    try {
      const product = await Product.findById(id);
      if (!product) return undefined;
      return this.mapProductToSchema(product);
    } catch (error) {
      console.error('Error getting product by id:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<ProductType[]> {
    try {
      const products = await Product.find({ category });
      return products.map(p => this.mapProductToSchema(p));
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  async getFeaturedProducts(): Promise<ProductType[]> {
    try {
      const products = await Product.find({ isFeatured: true });
      return products.map(p => this.mapProductToSchema(p));
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  async getNewProducts(): Promise<ProductType[]> {
    try {
      const products = await Product.find({ isNew: true });
      return products.map(p => this.mapProductToSchema(p));
    } catch (error) {
      console.error('Error getting new products:', error);
      return [];
    }
  }

  async searchProducts(term: string): Promise<ProductType[]> {
    try {
      const products = await Product.find({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        ]
      });
      return products.map(p => this.mapProductToSchema(p));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<ProductType> {
    try {
      const product = new Product(insertProduct);
      await product.save();
      return this.mapProductToSchema(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Cart methods
  async getCartItems(sessionId: string, userId?: number): Promise<CartItemType[]> {
    try {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      } else {
        query.sessionId = sessionId;
      }
      
      const cartItems = await CartItem.find(query);
      return cartItems.map(c => this.mapCartItemToSchema(c));
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  async getCartItemWithProduct(cartItemId: number): Promise<{cartItem: CartItemType, product: ProductType} | undefined> {
    try {
      const cartItem = await CartItem.findById(cartItemId);
      if (!cartItem) return undefined;
      
      const product = await Product.findById(cartItem.productId);
      if (!product) return undefined;
      
      return {
        cartItem: this.mapCartItemToSchema(cartItem),
        product: this.mapProductToSchema(product)
      };
    } catch (error) {
      console.error('Error getting cart item with product:', error);
      return undefined;
    }
  }

  async getCartWithProducts(sessionId: string, userId?: number): Promise<{cartItem: CartItemType, product: ProductType}[]> {
    try {
      const query: any = userId ? { userId } : { sessionId };
      
      const cartItems = await CartItem.find(query).populate('productId');
      return cartItems.map(item => ({
        cartItem: this.mapCartItemToSchema(item),
        product: this.mapProductToSchema(item.productId)
      }));
      
      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          result.push({
            cartItem: this.mapCartItemToSchema(item),
            product: this.mapProductToSchema(product)
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting cart with products:', error);
      return [];
    }
  }

  async addToCart(item: InsertCartItem): Promise<CartItemType> {
    try {
      // Check if item already exists in cart
      const query: any = { productId: item.productId };
      if (item.userId) {
        query.userId = item.userId;
      } else if (item.sessionId) {
        query.sessionId = item.sessionId;
      }
      
      const existingItem = await CartItem.findOne(query);
      
      if (existingItem) {
        // Update quantity of existing item
        existingItem.quantity += item.quantity || 1;
        await existingItem.save();
        return this.mapCartItemToSchema(existingItem);
      }
      
      // Add new item to cart
      const cartItem = new CartItem(item);
      await cartItem.save();
      return this.mapCartItemToSchema(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItemType | undefined> {
    try {
      const cartItem = await CartItem.findById(id);
      if (!cartItem) return undefined;
      
      cartItem.quantity = quantity;
      await cartItem.save();
      return this.mapCartItemToSchema(cartItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      return undefined;
    }
  }

  async removeCartItem(id: number): Promise<boolean> {
    try {
      const result = await CartItem.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error removing cart item:', error);
      return false;
    }
  }

  async clearCart(sessionId: string, userId?: number): Promise<boolean> {
    try {
      const query: any = {};
      if (userId) {
        query.userId = userId;
      } else {
        query.sessionId = sessionId;
      }
      
      const result = await CartItem.deleteMany(query);
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<OrderType> {
    try {
      const order = new Order(insertOrder);
      await order.save();
      return this.mapOrderToSchema(order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async addOrderItem(insertItem: InsertOrderItem): Promise<OrderItemType> {
    try {
      const orderItem = new OrderItem(insertItem);
      await orderItem.save();
      return this.mapOrderItemToSchema(orderItem);
    } catch (error) {
      console.error('Error adding order item:', error);
      throw error;
    }
  }

  async getOrderById(id: number): Promise<OrderType | undefined> {
    try {
      const order = await Order.findById(id);
      if (!order) return undefined;
      return this.mapOrderToSchema(order);
    } catch (error) {
      console.error('Error getting order by id:', error);
      return undefined;
    }
  }

  async getOrdersByUserId(userId: number): Promise<OrderType[]> {
    try {
      const orders = await Order.find({ userId });
      return orders.map(o => this.mapOrderToSchema(o));
    } catch (error) {
      console.error('Error getting orders by user id:', error);
      return [];
    }
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItemType[]> {
    try {
      const orderItems = await OrderItem.find({ orderId });
      return orderItems.map(o => this.mapOrderItemToSchema(o));
    } catch (error) {
      console.error('Error getting order items by order id:', error);
      return [];
    }
  }

  // Category methods
  async getCategories(): Promise<CategoryType[]> {
    try {
      const categories = await Category.find();
      return categories.map(c => this.mapCategoryToSchema(c));
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getCategoryByName(name: string): Promise<CategoryType | undefined> {
    try {
      const category = await Category.findOne({ name });
      if (!category) return undefined;
      return this.mapCategoryToSchema(category);
    } catch (error) {
      console.error('Error getting category by name:', error);
      return undefined;
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<CategoryType> {
    try {
      const category = new Category(insertCategory);
      await category.save();
      return this.mapCategoryToSchema(category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Helper methods to map MongoDB documents to schema types
  private mapUserToSchema(user: IUser): UserType {
    return {
      id: Number(user._id),
      username: user.username,
      password: user.password,
      email: user.email,
      fullName: user.fullName || null,
      createdAt: user.createdAt || null
    };
  }

  private mapProductToSchema(product: IProduct): ProductType {
    return {
      id: Number(product._id),
      name: product.name,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice || null,
      imageUrl: product.imageUrl,
      category: product.category,
      rating: product.rating || null,
      reviewCount: product.reviewCount || null,
      inStock: product.inStock || null,
      isNew: product.isNew || null,
      isFeatured: product.isFeatured || null,
      createdAt: product.createdAt || null
    };
  }

  private mapCartItemToSchema(cartItem: ICartItem): CartItemType {
    return {
      id: Number(cartItem._id),
      userId: cartItem.userId ? Number(cartItem.userId) : null,
      productId: Number(cartItem.productId),
      quantity: cartItem.quantity,
      sessionId: cartItem.sessionId || null,
      createdAt: cartItem.createdAt || null
    };
  }

  private mapOrderToSchema(order: IOrder): OrderType {
    return {
      id: Number(order._id),
      userId: order.userId ? Number(order.userId) : null,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress || null,
      billingAddress: order.billingAddress || null,
      paymentMethod: order.paymentMethod || null,
      sessionId: order.sessionId || null,
      createdAt: order.createdAt || null
    };
  }

  private mapOrderItemToSchema(orderItem: IOrderItem): OrderItemType {
    return {
      id: Number(orderItem._id),
      orderId: Number(orderItem.orderId),
      productId: Number(orderItem.productId),
      quantity: orderItem.quantity,
      price: orderItem.price,
      createdAt: orderItem.createdAt || null
    };
  }

  private mapCategoryToSchema(category: ICategory): CategoryType {
    return {
      id: Number(category._id),
      name: category.name,
      displayName: category.displayName,
      description: category.description || null,
      imageUrl: category.imageUrl || null,
      icon: category.icon || null
    };
  }
}

// Initialize and seed the database
export async function initializeDatabase() {
  // Check if we have categories already
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    console.log('Seeding categories...');
    const defaultCategories = [
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
      },
      { 
        name: "chairs", 
        displayName: "Gaming Chairs", 
        icon: "fa-chair",
        imageUrl: "https://images.unsplash.com/photo-1616715623022-65d18f0042ae?q=80&w=600&auto=format&fit=crop"
      }
    ];

    for (const category of defaultCategories) {
      await Category.create(category);
    }
  }

  // Check if we have products already
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log('Seeding products...');
    const defaultProducts = [
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
      // Add more products as needed
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
      }
    ];

    for (const product of defaultProducts) {
      await Product.create(product);
    }
  }
}