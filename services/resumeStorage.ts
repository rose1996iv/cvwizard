import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc, 
  Timestamp,
  orderBy
} from "firebase/firestore";
import { ResumeData } from '../types';

export interface SavedResume {
  id: string;
  name: string;
  data: ResumeData;
  updatedAt: Timestamp;
  userId: string;
}

const COLLECTION_NAME = "resumes";

export const saveResumeToCloud = async (userId: string, data: ResumeData, resumeId?: string, name?: string) => {
  if (!userId) return null;

  try {
    if (resumeId) {
      const resumeRef = doc(db, COLLECTION_NAME, resumeId);
      await updateDoc(resumeRef, {
        data: data,
        updatedAt: Timestamp.now(),
        name: name || data.personalInfo.fullName || "Untitled Resume"
      });
      return resumeId;
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        userId,
        data,
        name: name || data.personalInfo.fullName || "Untitled Resume",
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving resume:", error);
    return null;
  }
};

export const getResumesByUser = async (userId: string): Promise<SavedResume[]> => {
  if (!userId) return [];
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedResume[];
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return [];
  }
};

export const deleteResumeFromCloud = async (resumeId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, resumeId));
    return true;
  } catch (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
};
