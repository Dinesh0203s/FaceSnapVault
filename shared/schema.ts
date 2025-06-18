import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faceVectors = pgTable("face_vectors", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id").notNull().references(() => photos.id),
  vector: jsonb("vector").notNull(), // Face embedding vector
  boundingBox: jsonb("bounding_box").notNull(), // Face bounding box coordinates
  confidence: integer("confidence").notNull(), // Detection confidence (0-100)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoMatches = pgTable("photo_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  photoId: integer("photo_id").notNull().references(() => photos.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  confidence: integer("confidence").notNull(), // Match confidence (0-100)
  selfieUrl: text("selfie_url"), // URL of the selfie used for matching
  emailSent: boolean("email_sent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventAccess = pgTable("event_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  uploadedPhotos: many(photos),
  photoMatches: many(photoMatches),
  eventAccess: many(eventAccess),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  photos: many(photos),
  photoMatches: many(photoMatches),
  eventAccess: many(eventAccess),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  event: one(events, {
    fields: [photos.eventId],
    references: [events.id],
  }),
  uploader: one(users, {
    fields: [photos.uploadedBy],
    references: [users.id],
  }),
  faceVectors: many(faceVectors),
  photoMatches: many(photoMatches),
}));

export const faceVectorsRelations = relations(faceVectors, ({ one }) => ({
  photo: one(photos, {
    fields: [faceVectors.photoId],
    references: [photos.id],
  }),
}));

export const photoMatchesRelations = relations(photoMatches, ({ one }) => ({
  user: one(users, {
    fields: [photoMatches.userId],
    references: [users.id],
  }),
  photo: one(photos, {
    fields: [photoMatches.photoId],
    references: [photos.id],
  }),
  event: one(events, {
    fields: [photoMatches.eventId],
    references: [events.id],
  }),
}));

export const eventAccessRelations = relations(eventAccess, ({ one }) => ({
  user: one(users, {
    fields: [eventAccess.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventAccess.eventId],
    references: [events.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const insertFaceVectorSchema = createInsertSchema(faceVectors).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoMatchSchema = createInsertSchema(photoMatches).omit({
  id: true,
  createdAt: true,
});

export const insertEventAccessSchema = createInsertSchema(eventAccess).omit({
  id: true,
  accessedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type FaceVector = typeof faceVectors.$inferSelect;
export type InsertFaceVector = z.infer<typeof insertFaceVectorSchema>;
export type PhotoMatch = typeof photoMatches.$inferSelect;
export type InsertPhotoMatch = z.infer<typeof insertPhotoMatchSchema>;
export type EventAccess = typeof eventAccess.$inferSelect;
export type InsertEventAccess = z.infer<typeof insertEventAccessSchema>;
