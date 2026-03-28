import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * QAPRIL Physical Storage Utility
 * Handles permanent file storage on VPS outside the deployment root.
 */

const PERSISTENT_ROOT = process.env.NODE_ENV === 'production' 
  ? '/home/github/capril_data' 
  : path.join(process.cwd(), 'persistence');

const UPLOADS_DIR = path.join(PERSISTENT_ROOT, 'uploads');

/**
 * Save a File (Blob) to disk and return the public URL path
 */
export async function savePhysicalFile(file: File, subfolder: string = 'general'): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetDir = path.join(UPLOADS_DIR, subfolder);
    await fs.mkdir(targetDir, { recursive: true });

    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(targetDir, fileName);

    await fs.writeFile(filePath, buffer);

    // Return the relative path for the public symlink access
    return `/uploads/${subfolder}/${fileName}`;
  } catch (error) {
    console.error('[STORAGE ERROR] Failed to save file:', error);
    throw new Error('Erreur de stockage physique');
  }
}

/**
 * Delete a file from disk
 */
export async function deletePhysicalFile(relativeUrl: string): Promise<boolean> {
  try {
    // Convert /uploads/sub/file.jpg to sub/file.jpg
    const relativePath = relativeUrl.replace('/uploads/', '');
    const fullPath = path.join(UPLOADS_DIR, relativePath);
    
    await fs.unlink(fullPath);
    return true;
  } catch (e) {
    return false;
  }
}
