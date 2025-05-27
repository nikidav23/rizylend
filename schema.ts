import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  ageGroup: text("age_group").notNull(),
  isPremium: boolean("is_premium").default(false),
  price: integer("price").default(0), // price in kopecks (0 = free)
  readingTime: integer("reading_time"), // in minutes
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audioBooks = pgTable("audio_books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration"), // in seconds
  categoryId: integer("category_id").references(() => categories.id),
  ageGroup: text("age_group").notNull(),
  isPremium: boolean("is_premium").default(false),
  price: integer("price").default(0), // price in kopecks (0 = free)
  narrator: text("narrator"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLibrary = pgTable("user_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  bookId: integer("book_id").references(() => books.id),
  audioBookId: integer("audio_book_id").references(() => audioBooks.id),
  isFavorite: boolean("is_favorite").default(false),
  progress: integer("progress").default(0), // percentage
  addedAt: timestamp("added_at").defaultNow(),
});

export const shopProducts = pgTable("shop_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  bookId: integer("book_id").references(() => books.id),
  audioBookId: integer("audio_book_id").references(() => audioBooks.id),
  shopProductId: integer("shop_product_id").references(() => shopProducts.id),
  amount: integer("amount").notNull(), // in cents
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  icon: true,
});

export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  author: true,
  description: true,
  coverImage: true,
  content: true,
  categoryId: true,
  ageGroup: true,
  isPremium: true,
  price: true,
  readingTime: true,
  isDeleted: true,
});

export const insertAudioBookSchema = createInsertSchema(audioBooks).pick({
  title: true,
  author: true,
  description: true,
  coverImage: true,
  audioUrl: true,
  duration: true,
  categoryId: true,
  ageGroup: true,
  isPremium: true,
  price: true,
  narrator: true,
  isDeleted: true,
});

export const insertUserLibrarySchema = createInsertSchema(userLibrary).pick({
  userId: true,
  bookId: true,
  audioBookId: true,
  isFavorite: true,
  progress: true,
});

export const insertShopProductSchema = createInsertSchema(shopProducts).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
  stock: true,
  isActive: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  bookId: true,
  audioBookId: true,
  shopProductId: true,
  amount: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type AudioBook = typeof audioBooks.$inferSelect;
export type InsertAudioBook = z.infer<typeof insertAudioBookSchema>;

export type UserLibrary = typeof userLibrary.$inferSelect;
export type InsertUserLibrary = z.infer<typeof insertUserLibrarySchema>;

export type ShopProduct = typeof shopProducts.$inferSelect;
export type InsertShopProduct = z.infer<typeof insertShopProductSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;