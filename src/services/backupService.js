// 🔄 Firebase Backup Service
// Backup API data to Firebase for emergency fallback
// Admin can manually trigger backup or set automatic daily backup

import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getBatches, getContentRoot, getFolderContent, getVideoDetails } from './apiService';

// Backup all batches to Firebase
export const backupBatchesToFirebase = async () => {
  try {
    console.log('📦 Starting batches backup...');
    
    const batchesData = await getBatches();
    const batches = batchesData.data || batchesData || [];
    
    // Save to Firebase
    await setDoc(doc(db, 'backups', 'batches'), {
      data: batches,
      timestamp: new Date().toISOString(),
      count: batches.length
    });
    
    console.log(`✅ Backed up ${batches.length} batches to Firebase`);
    return { success: true, count: batches.length };
  } catch (error) {
    console.error('❌ Backup batches error:', error);
    return { success: false, error: error.message };
  }
};

// Backup single batch content with all nested folders
export const backupBatchContent = async (batchId) => {
  try {
    console.log(`📦 Backing up batch ${batchId}...`);
    
    // Get root content
    const rootData = await getContentRoot(batchId);
    const rootItems = rootData.data || rootData || [];
    
    let allContent = [...rootItems];
    
    // Recursively get all folder content
    const folders = rootItems.filter(item => item.material_type === 'FOLDER');
    
    for (const folder of folders) {
      try {
        const folderData = await getFolderContent(batchId, folder.id);
        const folderItems = folderData.data || folderData || [];
        allContent = [...allContent, ...folderItems];
        
        // Get nested folders
        const nestedFolders = folderItems.filter(item => item.material_type === 'FOLDER');
        for (const nested of nestedFolders) {
          try {
            const nestedData = await getFolderContent(batchId, nested.id);
            const nestedItems = nestedData.data || nestedData || [];
            allContent = [...allContent, ...nestedItems];
          } catch (err) {
            console.warn(`⚠️ Failed to backup nested folder ${nested.id}`);
          }
        }
      } catch (err) {
        console.warn(`⚠️ Failed to backup folder ${folder.id}`);
      }
    }
    
    // Save to Firebase
    await setDoc(doc(db, 'backups', `batch_${batchId}`), {
      batchId,
      content: allContent,
      timestamp: new Date().toISOString(),
      itemCount: allContent.length
    });
    
    console.log(`✅ Backed up ${allContent.length} items for batch ${batchId}`);
    return { success: true, count: allContent.length };
  } catch (error) {
    console.error(`❌ Backup batch ${batchId} error:`, error);
    return { success: false, error: error.message };
  }
};

// Backup video details with token
export const backupVideoDetails = async (videoId, batchId) => {
  try {
    const videoData = await getVideoDetails(videoId, batchId);
    
    // Save to Firebase with timestamp
    await setDoc(doc(db, 'videoBackups', `${batchId}_${videoId}`), {
      videoId,
      batchId,
      data: videoData,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });
    
    console.log(`✅ Backed up video ${videoId} with token`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Backup video ${videoId} error:`, error);
    return { success: false, error: error.message };
  }
};

// Full backup - All batches and their content
export const performFullBackup = async (onProgress) => {
  try {
    console.log('🚀 Starting FULL BACKUP...');
    const startTime = Date.now();
    
    // Step 1: Backup batches list
    if (onProgress) onProgress({ step: 'batches', status: 'in-progress' });
    const batchesResult = await backupBatchesToFirebase();
    if (!batchesResult.success) throw new Error('Failed to backup batches');
    if (onProgress) onProgress({ step: 'batches', status: 'complete', count: batchesResult.count });
    
    // Step 2: Get all batches
    const batchesData = await getBatches();
    const batches = batchesData.data || batchesData || [];
    
    // Step 3: Backup each batch content
    let totalItems = 0;
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (onProgress) onProgress({ 
        step: 'content', 
        status: 'in-progress', 
        current: i + 1, 
        total: batches.length,
        batchName: batch.course_name || batch.name
      });
      
      const contentResult = await backupBatchContent(batch.id);
      if (contentResult.success) {
        totalItems += contentResult.count;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 4: Save backup metadata
    await setDoc(doc(db, 'backups', 'metadata'), {
      lastBackup: new Date().toISOString(),
      batchCount: batches.length,
      totalItems: totalItems,
      duration: Date.now() - startTime,
      status: 'complete'
    });
    
    if (onProgress) onProgress({ step: 'complete', status: 'complete', totalItems });
    
    console.log(`✅ FULL BACKUP COMPLETE: ${batches.length} batches, ${totalItems} items`);
    return { 
      success: true, 
      batchCount: batches.length, 
      totalItems,
      duration: Date.now() - startTime
    };
  } catch (error) {
    console.error('❌ Full backup error:', error);
    if (onProgress) onProgress({ step: 'error', status: 'error', error: error.message });
    return { success: false, error: error.message };
  }
};

// Load batches from Firebase backup
export const loadBatchesFromBackup = async () => {
  try {
    const backupDoc = await getDoc(doc(db, 'backups', 'batches'));
    if (backupDoc.exists()) {
      const data = backupDoc.data();
      console.log(`✅ Loaded ${data.count} batches from backup (${data.timestamp})`);
      return { success: true, data: data.data, timestamp: data.timestamp };
    } else {
      return { success: false, error: 'No backup found' };
    }
  } catch (error) {
    console.error('❌ Load backup error:', error);
    return { success: false, error: error.message };
  }
};

// Load batch content from Firebase backup
export const loadBatchContentFromBackup = async (batchId) => {
  try {
    const backupDoc = await getDoc(doc(db, 'backups', `batch_${batchId}`));
    if (backupDoc.exists()) {
      const data = backupDoc.data();
      console.log(`✅ Loaded ${data.itemCount} items from backup for batch ${batchId}`);
      return { success: true, data: data.content, timestamp: data.timestamp };
    } else {
      return { success: false, error: 'No backup found for this batch' };
    }
  } catch (error) {
    console.error('❌ Load batch backup error:', error);
    return { success: false, error: error.message };
  }
};

// Load video details from backup
export const loadVideoFromBackup = async (videoId, batchId) => {
  try {
    const backupDoc = await getDoc(doc(db, 'videoBackups', `${batchId}_${videoId}`));
    if (backupDoc.exists()) {
      const data = backupDoc.data();
      console.log(`✅ Loaded video ${videoId} from backup (${data.date})`);
      return { success: true, data: data.data, timestamp: data.timestamp };
    } else {
      return { success: false, error: 'No backup found for this video' };
    }
  } catch (error) {
    console.error('❌ Load video backup error:', error);
    return { success: false, error: error.message };
  }
};

// Get backup metadata
export const getBackupMetadata = async () => {
  try {
    const metadataDoc = await getDoc(doc(db, 'backups', 'metadata'));
    if (metadataDoc.exists()) {
      return { success: true, data: metadataDoc.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('❌ Get metadata error:', error);
    return { success: false, error: error.message };
  }
};

// Enable/Disable backup mode
export const setBackupMode = async (enabled) => {
  try {
    await setDoc(doc(db, 'settings', 'backup'), {
      enabled,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Backup mode ${enabled ? 'enabled' : 'disabled'}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Set backup mode error:', error);
    return { success: false, error: error.message };
  }
};

// Check if backup mode is enabled
export const isBackupModeEnabled = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'backup'));
    if (settingsDoc.exists()) {
      return settingsDoc.data().enabled || false;
    }
    return false;
  } catch (error) {
    console.error('❌ Check backup mode error:', error);
    return false;
  }
};

// Schedule daily backup (to be called by admin)
export const scheduleDailyBackup = async () => {
  try {
    await setDoc(doc(db, 'settings', 'backupSchedule'), {
      enabled: true,
      frequency: 'daily',
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    console.log('✅ Daily backup scheduled');
    return { success: true };
  } catch (error) {
    console.error('❌ Schedule backup error:', error);
    return { success: false, error: error.message };
  }
};
