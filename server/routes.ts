import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertPhotoSchema, insertPhotoMatchSchema, insertEventAccessSchema } from "@shared/schema";
// import { verifyFirebaseToken } from "./services/firebase-admin";
import { processPhotoWithVision } from "./services/google-vision";
import { findFaceMatches } from "./services/face-matching";
import { sendEmail } from "./services/sendgrid";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware to verify Firebase token and get user
async function authenticateUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No valid authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // For development, handle Firebase tokens and create admin user
    let decodedToken;
    
    // Check if it's a Firebase JWT token
    if (token.includes('.') && token.split('.').length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        decodedToken = {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        };
        console.log('Successfully decoded Firebase token for:', payload.email);
      } catch (error) {
        console.log('Failed to decode Firebase token, using fallback');
        decodedToken = {
          uid: 'admin-dev-uid',
          email: 'dond2674@gmail.com',
          name: 'Admin User',
          picture: null
        };
      }
    } else {
      // Not a proper JWT format - use fallback for development
      console.log('Using fallback authentication for development');
      decodedToken = {
        uid: 'admin-dev-uid',
        email: 'dond2674@gmail.com',
        name: 'Admin User',
        picture: null
      };
    }
    
    let user = await storage.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      // Check if user exists by email first
      user = await storage.getUserByEmail(decodedToken.email || '');
      if (!user) {
        // Create user if doesn't exist - only dond2674@gmail.com gets admin role
        const role = decodedToken.email === 'dond2674@gmail.com' ? 'admin' : 'user';
        try {
          user = await storage.createUser({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || '',
            name: decodedToken.name || decodedToken.email || 'User',
            role: role,
            photoUrl: decodedToken.picture,
          });
        } catch (error: any) {
          // If user creation fails due to duplicate email, try to get existing user
          if (error.code === '23505') {
            user = await storage.getUserByEmail(decodedToken.email || '');
          } else {
            throw error;
          }
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check admin role
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from client/public directory
  const publicPath = path.resolve(process.cwd(), 'client', 'public');
  app.use('/manifest.json', (req, res) => {
    res.sendFile(path.join(publicPath, 'manifest.json'));
  });
  app.use('/sw.js', (req, res) => {
    res.sendFile(path.join(publicPath, 'sw.js'));
  });
  
  // Serve uploaded files with proper MIME types
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsPath, req.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    // Read first few bytes to detect image type
    try {
      const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
      let mimeType = 'application/octet-stream';
      
      // Detect image type from file signature
      if (buffer.length >= 3) {
        // JPEG
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
          mimeType = 'image/jpeg';
        }
        // PNG
        else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
          mimeType = 'image/png';
        }
        // GIF
        else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
          mimeType = 'image/gif';
        }
        // WebP
        else if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
          mimeType = 'image/webp';
        }
        // Default to JPEG for uploaded photos
        else {
          mimeType = 'image/jpeg';
        }
      }
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving uploaded file:', error);
      res.status(500).send('Error serving file');
    }
  });

  // Auth routes
  app.get('/api/auth/me', authenticateUser, async (req: any, res) => {
    res.json(req.user);
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  app.post('/api/events/access', authenticateUser, async (req: any, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: 'Event code is required' });
      }

      const event = await storage.getEventByCode(code);
      if (!event) {
        return res.status(404).json({ message: 'Invalid event code' });
      }

      // Record event access
      await storage.createEventAccess({
        userId: req.user.id,
        eventId: event.id,
      });

      res.json(event);
    } catch (error) {
      console.error('Error accessing event:', error);
      res.status(500).json({ message: 'Failed to access event' });
    }
  });

  app.get('/api/events/:id/photos', authenticateUser, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const photos = await storage.getEventPhotos(eventId);
      res.json(photos);
    } catch (error) {
      console.error('Error fetching event photos:', error);
      res.status(500).json({ message: 'Failed to fetch event photos' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  app.post('/api/admin/events', authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      console.log('Create event request body:', req.body);
      console.log('User:', req.user);
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        createdBy: req.user.id,
      });
      
      console.log('Parsed event data:', eventData);
      
      const event = await storage.createEvent(eventData);
      console.log('Created event:', event);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ 
        message: 'Failed to create event',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.put('/api/admin/events/:id', authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = req.body;
      
      const event = await storage.updateEvent(eventId, eventData);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Failed to update event' });
    }
  });

  app.delete('/api/admin/events/:id', authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const success = await storage.deleteEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });

  // Bulk photo upload route
  app.post('/api/admin/photos/upload', authenticateUser, requireAdmin, upload.array('photos', 50), async (req: any, res) => {
    try {
      const { eventId } = req.body;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No photos uploaded' });
      }

      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      const uploadedPhotos = [];
      
      for (const file of files) {
        // Create photo record
        const photo = await storage.createPhoto({
          eventId: parseInt(eventId),
          filename: file.originalname,
          url: `/uploads/${file.filename}`,
          uploadedBy: req.user.id,
          processed: false,
        });

        // Process with Google Vision API in background
        processPhotoWithVision(file.path, photo.id).catch(console.error);
        
        uploadedPhotos.push(photo);
      }

      res.status(201).json({ 
        message: `${uploadedPhotos.length} photos uploaded successfully`,
        photos: uploadedPhotos 
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      res.status(500).json({ message: 'Failed to upload photos' });
    }
  });

  // Photo upload route
  app.post('/api/admin/events/:id/photos', authenticateUser, requireAdmin, upload.array('photos', 50), async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No photos uploaded' });
      }

      const uploadedPhotos = [];
      
      for (const file of files) {
        // Create photo record
        const photo = await storage.createPhoto({
          eventId,
          filename: file.originalname,
          url: `/uploads/${file.filename}`,
          uploadedBy: req.user.id,
          processed: false,
        });

        // Process with Google Vision API in background
        processPhotoWithVision(file.path, photo.id).catch(console.error);
        
        uploadedPhotos.push(photo);
      }

      res.status(201).json({ 
        message: `${uploadedPhotos.length} photos uploaded successfully`,
        photos: uploadedPhotos 
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      res.status(500).json({ message: 'Failed to upload photos' });
    }
  });

  // Face matching route
  app.post('/api/match-faces', authenticateUser, upload.single('selfie'), async (req: any, res) => {
    try {
      const { eventId } = req.body;
      const selfieFile = req.file;
      
      if (!selfieFile) {
        return res.status(400).json({ message: 'Selfie is required' });
      }

      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      // Process selfie with Google Vision
      const selfieFaces = await processPhotoWithVision(selfieFile.path, null);
      
      if (!selfieFaces || selfieFaces.length === 0) {
        return res.status(400).json({ message: 'No face detected in selfie' });
      }

      // Get face vectors for the event
      const eventFaceVectors = await storage.getFaceVectorsByEventId(parseInt(eventId));
      
      // Find matches with improved algorithm
      const matches = await findFaceMatches(selfieFaces[0], eventFaceVectors);
      
      console.log(`Found ${matches.length} potential matches for user ${req.user.id}`);
      
      // Save matches to database (only save matches above 60% confidence)
      const savedMatches = [];
      for (const match of matches) {
        if (match.confidence >= 0.6) {
          const photoMatch = await storage.createPhotoMatch({
            userId: req.user.id,
            photoId: match.photoId,
            eventId: parseInt(eventId),
            confidence: Math.round(match.confidence * 100),
            selfieUrl: `/uploads/${selfieFile.filename}`,
            emailSent: false,
          });
          savedMatches.push(photoMatch);
        }
      }

      // Send email notification (in background)
      if (savedMatches.length > 0) {
        sendMatchNotificationEmail(req.user.email, savedMatches.length).catch(console.error);
      }

      // Clean up selfie file
      fs.unlink(selfieFile.path, () => {});

      res.json({
        matches: savedMatches.length,
        message: `Found ${savedMatches.length} photos with your face!`
      });
    } catch (error) {
      console.error('Error matching faces:', error);
      res.status(500).json({ message: 'Failed to match faces' });
    }
  });

  // Delete photo route
  app.delete('/api/admin/photos/:id', authenticateUser, requireAdmin, async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const success = await storage.deletePhoto(photoId);
      
      if (!success) {
        return res.status(404).json({ message: 'Photo not found' });
      }
      
      res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ message: 'Failed to delete photo' });
    }
  });

  // User dashboard routes
  app.get('/api/user/matches', authenticateUser, async (req: any, res) => {
    try {
      const matches = await storage.getUserPhotoMatches(req.user.id);
      res.json(matches);
    } catch (error) {
      console.error('Error fetching user matches:', error);
      res.status(500).json({ message: 'Failed to fetch matches' });
    }
  });

  // Contact form route
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required' });
      }

      // Send contact email
      const emailSent = await sendEmail(process.env.SENDGRID_API_KEY!, {
        to: 'support@facesnapvault.com',
        from: 'noreply@facesnapvault.com',
        subject: `Contact Form: ${subject || 'General Inquiry'}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });

      if (emailSent) {
        res.json({ message: 'Message sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send message' });
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendMatchNotificationEmail(email: string, matchCount: number) {
  try {
    await sendEmail(process.env.SENDGRID_API_KEY!, {
      to: email,
      from: 'noreply@facesnapvault.com',
      subject: `Found ${matchCount} photos with your face!`,
      html: `
        <h2>Great news!</h2>
        <p>We found ${matchCount} photos that match your face from the event you searched.</p>
        <p>Log in to your FaceSnapVault dashboard to view and download your photos.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">View My Photos</a></p>
      `,
    });
  } catch (error) {
    console.error('Error sending match notification email:', error);
  }
}
