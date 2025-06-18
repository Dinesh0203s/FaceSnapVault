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

function generateMockFaceVector(): number[] {
  const vector: number[] = [];
  for (let i = 0; i < 128; i++) {
    vector.push((Math.random() - 0.5) * 2);
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

export async function processPhotoWithVision(imagePath: string, photoId: number | null): Promise<FaceDetection[]> {
  try {
    console.log(`Processing photo: ${imagePath}`);
    
    const mockDetections: FaceDetection[] = [
      {
        vector: generateMockFaceVector(),
        boundingBox: { x: 100, y: 150, width: 200, height: 250 },
        confidence: 0.85,
      },
      {
        vector: generateMockFaceVector(),
        boundingBox: { x: 400, y: 120, width: 180, height: 220 },
        confidence: 0.92,
      }
    ];

    if (photoId) {
      const { storage } = await import('../storage');
      for (const detection of mockDetections) {
        await storage.createFaceVector({
          photoId,
          vector: detection.vector,
          boundingBox: detection.boundingBox,
          confidence: Math.round(detection.confidence * 100),
        });
      }
      await storage.updatePhotoProcessed(photoId, true);
    }

    return mockDetections;
  } catch (error) {
    console.error('Error processing photo:', error);
    throw error;
  }
}