import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * QAPRIL Physical Storage Utility
 * Handles permanent file storage on VPS outside the deployment root.
 * Hardened against Path Traversal (CWE-22) and Arbitrary File Upload (CWE-434).
 */

export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads_data');

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo max

// Extensions strictement autorisées (Interdiction absolue de .html, .svg, .php, .sh, .js, .exe)
const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'
]);

/**
 * Save a File (Blob) to disk and return the public URL path
 */
export async function savePhysicalFile(file: File, subfolder: string = 'general'): Promise<string> {
  try {
    if (!file || typeof file.size !== 'number') {
      throw new Error('Fichier invalide');
    }

    // 1. Taille maximale (DLP-DoS Protection)
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Fichier trop volumineux (maximum 15 Mo).');
    }

    // 2. Nettoyage strict du sous-dossier (Anti-Path-Traversal)
    const safeSubfolder = subfolder
      .replace(/\.\./g, '')
      .replace(/[^a-zA-Z0-9_\-\/]/g, '')
      .replace(/\/+/g, '/');

    const baseResolved = path.resolve(UPLOADS_DIR);
    const targetDir = path.resolve(baseResolved, safeSubfolder);

    if (!targetDir.startsWith(baseResolved)) {
      throw new Error('Chemin de destination invalide (Path Traversal détecté)');
    }

    await fs.mkdir(targetDir, { recursive: true });

    // 3. Extraction et validation stricte de l'extension
    const rawExt = path.extname(file.name || '').toLowerCase().replace(/^\./, '');
    const cleanExt = rawExt.replace(/[^a-z0-9]/g, '');

    if (!ALLOWED_EXTENSIONS.has(cleanExt)) {
      throw new Error(`Format de fichier non autorisé (.${cleanExt || 'inconnu'}). Formats autorisés : JPG, PNG, WEBP, PDF, DOC, XLS.`);
    }

    // 4. Nom de fichier aléatoire (UUIDv4) pour éliminer les injections de nom
    const fileName = `${uuidv4()}.${cleanExt}`;
    const filePath = path.join(targetDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    // Retourne le chemin relatif pour l'accès public
    return `/uploads/${safeSubfolder}/${fileName}`.replace(/\/+/g, '/');
  } catch (error: any) {
    console.error('[STORAGE ERROR] Failed to save file:', error.message || error);
    throw error;
  }
}

/**
 * Delete a file from disk with strict Path Traversal check
 */
export async function deletePhysicalFile(relativeUrl: string): Promise<boolean> {
  try {
    if (!relativeUrl || typeof relativeUrl !== 'string') return false;

    // Nettoyage de l'URL pour obtenir le chemin relatif propre
    const cleanRel = relativeUrl
      .replace(/^\/?uploads\//, '')
      .replace(/\.\./g, '')
      .replace(/\\+/g, '/');

    const baseResolved = path.resolve(UPLOADS_DIR);
    const fullPath = path.resolve(baseResolved, cleanRel);

    // Vérification stricte : le fichier doit impérativement être dans UPLOADS_DIR
    if (!fullPath.startsWith(baseResolved)) {
      console.warn(`[SECURITY] Tentative de Path Traversal bloquée dans deletePhysicalFile: ${relativeUrl}`);
      return false;
    }

    await fs.unlink(fullPath);
    return true;
  } catch (e) {
    return false;
  }
}
