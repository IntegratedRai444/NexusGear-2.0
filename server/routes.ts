import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCartItemSchema, 
  contactFormSchema, 
  checkoutSchema,
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper function to get session ID
  function getSessionId(req: any): string {
    if (!req.session.cartId) {
      req.session.cartId = randomUUID();
    }
    return req.session.cartId;
  }

  // Products routes
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/featured", async (req, res) => {
    const products = await storage.getFeaturedProducts();
    res.json(products);
  });

  app.get("/api/products/new", async (req, res) => {
    const products = await storage.getNewProducts();
    res.json(products);
  });

  app.get("/api/products/search", async (req, res) => {
    const term = req.query.term as string;
    if (!term) {
      return res.status(400).json({ message: "Search term is required" });
    }
    const products = await storage.searchProducts(term);
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const category = req.params.category;
    const products = await storage.getProductsByCategory(category);
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:name", async (req, res) => {
    const name = req.params.name;
    const category = await storage.getCategoryByName(name);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    const sessionId = getSessionId(req);
    const userId = req.user?.id;
    
    const cartWithProducts = await storage.getCartWithProducts(sessionId, userId);
    const total = cartWithProducts.reduce(
      (sum, { cartItem, product }) => sum + product.price * cartItem.quantity, 
      0
    );
    
    res.json({
      items: cartWithProducts,
      total: parseFloat(total.toFixed(2)),
      count: cartWithProducts.length
    });
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const userId = req.user?.id;
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
        sessionId
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid cart data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }
    
    const updatedItem = await storage.updateCartItem(id, quantity);
    
    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.json(updatedItem);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const success = await storage.removeCartItem(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.status(204).send();
  });

  app.delete("/api/cart", async (req, res) => {
    const sessionId = getSessionId(req);
    const userId = req.user?.id;
    
    await storage.clearCart(sessionId, userId);
    res.status(204).send();
  });

  // Contact form route
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = contactFormSchema.parse(req.body);
      // In a real application, you would save this to a database or send an email
      // For now, we'll just return success
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Checkout route
  app.post("/api/checkout", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const userId = req.user?.id;
      
      // Validate checkout data
      const checkoutData = checkoutSchema.parse(req.body);
      
      // Get cart items
      const cartWithProducts = await storage.getCartWithProducts(sessionId, userId);
      
      if (cartWithProducts.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      const totalAmount = cartWithProducts.reduce(
        (sum, { cartItem, product }) => sum + product.price * cartItem.quantity, 
        0
      );
      
      // Create order
      const order = await storage.createOrder({
        userId,
        totalAmount,
        status: "pending",
        shippingAddress: `${checkoutData.address}, ${checkoutData.city}, ${checkoutData.zipCode}, ${checkoutData.country}`,
        billingAddress: `${checkoutData.address}, ${checkoutData.city}, ${checkoutData.zipCode}, ${checkoutData.country}`,
        paymentMethod: checkoutData.paymentMethod,
        sessionId
      });
      
      // Create order items
      for (const { cartItem, product } of cartWithProducts) {
        await storage.addOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: product.price
        });
      }
      
      // Clear cart
      await storage.clearCart(sessionId, userId);
      
      res.status(201).json({ 
        orderId: order.id,
        message: "Order placed successfully" 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid checkout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
