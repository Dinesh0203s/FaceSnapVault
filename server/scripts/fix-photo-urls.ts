import 'dotenv/config';
import { db } from '../db';
import { photos } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';
import { eq } from 'drizzle-orm';
import { fileTypeFromBuffer } from 'file-type';

const uploadsDir = path.resolve(process.cwd(), 'uploads');

async function fixPhotoUrls() {
  console.log('Starting photo URL fix...');

  try {
    const allPhotos = await db.select().from(photos);
    console.log(`Found ${allPhotos.length} total photos to check.`);

    for (const photo of allPhotos) {
      const urlPath = photo.url;
      if (!urlPath) {
        console.warn(`Photo ID ${photo.id} has no URL. Skipping.`);
        continue;
      }
      
      const filename = path.basename(urlPath);
      const filePath = path.join(uploadsDir, filename);

      // Check if the URL already has an extension
      if (path.extname(filename)) {
        continue;
      }

      try {
        const buffer = await fs.readFile(filePath);
        const type = await fileTypeFromBuffer(buffer);

        if (type && type.ext) {
          const newFilename = `${filename}.${type.ext}`;
          const newFilePath = path.join(uploadsDir, newFilename);
          const newUrl = `/uploads/${newFilename}`;

          // Rename file
          await fs.rename(filePath, newFilePath);

          // Update database
          await db.update(photos)
            .set({ url: newUrl })
            .where(eq(photos.id, photo.id));
            
          console.log(`Fixed photo ${photo.id}: ${filename} -> ${newFilename}`);
        } else {
          console.warn(`Could not determine file type for ${filename}. Skipping.`);
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.error(`Error processing photo ${photo.id} (${filename}):`, error);
        }
      }
    }

    console.log('Finished fixing photo URLs.');
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

fixPhotoUrls().finally(() => {
  process.exit(0);
}); 