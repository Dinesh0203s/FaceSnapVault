import { FaceDetection } from './google-vision';
import { FaceVector } from '@shared/schema';

interface FaceMatch {
  photoId: number;
  confidence: number;
  vector: FaceVector;
}

export async function findFaceMatches(
  targetFace: FaceDetection,
  eventFaceVectors: FaceVector[],
  threshold: number = 0.7
): Promise<FaceMatch[]> {
  const matches: FaceMatch[] = [];
  
  for (const faceVector of eventFaceVectors) {
    const similarity = calculateCosineSimilarity(
      targetFace.vector,
      faceVector.vector as number[]
    );
    
    if (similarity >= threshold) {
      matches.push({
        photoId: faceVector.photoId,
        confidence: similarity,
        vector: faceVector,
      });
    }
  }
  
  // Sort by confidence (highest first) and limit results
  return matches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 50); // Limit to top 50 matches
}

function calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

export function calculateFaceDistance(vectorA: number[], vectorB: number[]): number {
  return Math.sqrt(
    vectorA.reduce((sum, val, i) => sum + Math.pow(val - vectorB[i], 2), 0)
  );
}

export function isValidFaceVector(vector: any): boolean {
  return Array.isArray(vector) && 
         vector.length > 0 && 
         vector.every(val => typeof val === 'number' && !isNaN(val));
}
