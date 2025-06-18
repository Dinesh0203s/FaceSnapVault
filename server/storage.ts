import { 
  users, events, photos, faceVectors, photoMatches, eventAccess,
  type User, type InsertUser, type Event, type InsertEvent,
  type Photo, type InsertPhoto, type FaceVector, type InsertFaceVector,
  type PhotoMatch, type InsertPhotoMatch, type EventAccess, type InsertEventAccess
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;

  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByCode(code: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Photo methods
  getEventPhotos(eventId: number): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
  updatePhotoProcessed(id: number, processed: boolean): Promise<boolean>;

  // Face vector methods
  getFaceVectorsByPhotoId(photoId: number): Promise<FaceVector[]>;
  getFaceVectorsByEventId(eventId: number): Promise<FaceVector[]>;
  createFaceVector(faceVector: InsertFaceVector): Promise<FaceVector>;

  // Photo match methods
  getUserPhotoMatches(userId: number): Promise<(PhotoMatch & { photo: Photo; event: Event })[]>;
  createPhotoMatch(photoMatch: InsertPhotoMatch): Promise<PhotoMatch>;
  updateMatchEmailSent(id: number): Promise<boolean>;

  // Event access methods
  createEventAccess(eventAccess: InsertEventAccess): Promise<EventAccess>;
  getUserEventAccess(userId: number, eventId: number): Promise<EventAccess | undefined>;

  // Admin stats
  getAdminStats(): Promise<{
    totalEvents: number;
    totalPhotos: number;
    activeUsers: number;
    successfulMatches: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEventByCode(code: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.code, code.toUpperCase()));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values({
      ...event,
      code: event.code.toUpperCase()
    }).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    // First delete all photos associated with this event
    await db.delete(photos).where(eq(photos.eventId, id));
    
    // Then delete the event
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  async getEventPhotos(eventId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.eventId, eventId)).orderBy(desc(photos.createdAt));
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo || undefined;
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }

  async deletePhoto(id: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return result.rowCount > 0;
  }

  async updatePhotoProcessed(id: number, processed: boolean): Promise<boolean> {
    const result = await db
      .update(photos)
      .set({ processed })
      .where(eq(photos.id, id));
    return result.rowCount > 0;
  }

  async getFaceVectorsByPhotoId(photoId: number): Promise<FaceVector[]> {
    return await db.select().from(faceVectors).where(eq(faceVectors.photoId, photoId));
  }

  async getFaceVectorsByEventId(eventId: number): Promise<FaceVector[]> {
    return await db
      .select({
        id: faceVectors.id,
        photoId: faceVectors.photoId,
        vector: faceVectors.vector,
        boundingBox: faceVectors.boundingBox,
        confidence: faceVectors.confidence,
        createdAt: faceVectors.createdAt,
      })
      .from(faceVectors)
      .innerJoin(photos, eq(faceVectors.photoId, photos.id))
      .where(eq(photos.eventId, eventId));
  }

  async createFaceVector(faceVector: InsertFaceVector): Promise<FaceVector> {
    const [newFaceVector] = await db.insert(faceVectors).values(faceVector).returning();
    return newFaceVector;
  }

  async getUserPhotoMatches(userId: number): Promise<(PhotoMatch & { photo: Photo; event: Event })[]> {
    return await db
      .select({
        id: photoMatches.id,
        userId: photoMatches.userId,
        photoId: photoMatches.photoId,
        eventId: photoMatches.eventId,
        confidence: photoMatches.confidence,
        selfieUrl: photoMatches.selfieUrl,
        emailSent: photoMatches.emailSent,
        createdAt: photoMatches.createdAt,
        photo: photos,
        event: events,
      })
      .from(photoMatches)
      .innerJoin(photos, eq(photoMatches.photoId, photos.id))
      .innerJoin(events, eq(photoMatches.eventId, events.id))
      .where(eq(photoMatches.userId, userId))
      .orderBy(desc(photoMatches.createdAt));
  }

  async createPhotoMatch(photoMatch: InsertPhotoMatch): Promise<PhotoMatch> {
    const [newPhotoMatch] = await db.insert(photoMatches).values(photoMatch).returning();
    return newPhotoMatch;
  }

  async updateMatchEmailSent(id: number): Promise<boolean> {
    const result = await db
      .update(photoMatches)
      .set({ emailSent: true })
      .where(eq(photoMatches.id, id));
    return result.rowCount > 0;
  }

  async createEventAccess(eventAccess: InsertEventAccess): Promise<EventAccess> {
    const [newEventAccess] = await db.insert(eventAccess).values(eventAccess).returning();
    return newEventAccess;
  }

  async getUserEventAccess(userId: number, eventId: number): Promise<EventAccess | undefined> {
    const [access] = await db
      .select()
      .from(eventAccess)
      .where(and(eq(eventAccess.userId, userId), eq(eventAccess.eventId, eventId)));
    return access || undefined;
  }

  async getAdminStats(): Promise<{
    totalEvents: number;
    totalPhotos: number;
    activeUsers: number;
    successfulMatches: number;
  }> {
    const [eventsCount] = await db.select({ count: sql<number>`count(*)` }).from(events);
    const [photosCount] = await db.select({ count: sql<number>`count(*)` }).from(photos);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [matchesCount] = await db.select({ count: sql<number>`count(*)` }).from(photoMatches);

    return {
      totalEvents: Number(eventsCount.count),
      totalPhotos: Number(photosCount.count),
      activeUsers: Number(usersCount.count),
      successfulMatches: Number(matchesCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
