import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export interface FaceDetection {
  vector: number[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export async function processPhotoWithVision(imagePath: string, photoId: number | null): Promise<FaceDetection[]> {
  try {
    const [result] = await client.faceDetection(imagePath);
    const faces = result.faceAnnotations || [];
    
    const detections: FaceDetection[] = [];
    
    for (const face of faces) {
      if (!face.boundingPoly || !face.boundingPoly.vertices) {
        continue;
      }

      // Extract bounding box
      const vertices = face.boundingPoly.vertices;
      const x = Math.min(...vertices.map(v => v.x || 0));
      const y = Math.min(...vertices.map(v => v.y || 0));
      const maxX = Math.max(...vertices.map(v => v.x || 0));
      const maxY = Math.max(...vertices.map(v => v.y || 0));
      
      const boundingBox = {
        x,
        y,
        width: maxX - x,
        height: maxY - y,
      };

      // Generate face vector (simplified - in production, use face embedding model)
      const vector = generateFaceVector(face);
      
      const detection: FaceDetection = {
        vector,
        boundingBox,
        confidence: face.detectionConfidence || 0.8,
      };

      detections.push(detection);

      // Save to database if photoId is provided
      if (photoId) {
        const { storage } = await import('../storage');
        await storage.createFaceVector({
          photoId,
          vector: vector,
          boundingBox: boundingBox,
          confidence: Math.round((face.detectionConfidence || 0.8) * 100),
        });
      }
    }

    // Update photo as processed if photoId is provided
    if (photoId) {
      const { storage } = await import('../storage');
      await storage.updatePhotoProcessed(photoId, true);
    }

    return detections;
  } catch (error) {
    console.error('Error processing photo with Google Vision:', error);
    throw error;
  }
}

function generateFaceVector(face: any): number[] {
  // This is a simplified face vector generation
  // In production, you would use a proper face embedding model
  const landmarks = face.landmarks || [];
  const vector: number[] = [];
  
  // Extract key facial landmarks and create a feature vector
  const keyLandmarks = [
    'LEFT_EYE', 'RIGHT_EYE', 'NOSE_TIP', 'LEFT_EAR_TRAGION', 'RIGHT_EAR_TRAGION'
  ];
  
  for (const landmarkType of keyLandmarks) {
    const landmark = landmarks.find((l: any) => l.type === landmarkType);
    if (landmark && landmark.position) {
      vector.push(landmark.position.x || 0);
      vector.push(landmark.position.y || 0);
      vector.push(landmark.position.z || 0);
    } else {
      vector.push(0, 0, 0);
    }
  }
  
  // Pad vector to fixed length (128 dimensions)
  while (vector.length < 128) {
    vector.push(0);
  }
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}
