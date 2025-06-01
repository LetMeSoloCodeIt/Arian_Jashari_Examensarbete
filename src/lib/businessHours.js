import { 
  businessHoursCollection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp
} from '@/lib/firebase';

// Hämtar alla tider
export const getBusinessHours = async () => {
  try {
    const querySnapshot = await getDocs(businessHoursCollection);
    const businessHours = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      businessHours.push({
        dayOfWeek: data.dayOfWeek,
        isOpen: data.isOpen,
        openTime: data.openTime,
        closeTime: data.closeTime,
      });
    });
    
    // Sortera dagar i veckan
    businessHours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    
    return businessHours;
  } catch (error) {
    console.error("Error fetching business hours:", error);
    throw error;
  }
};

// Uppdatera öppetider
export const updateBusinessHours = async (businessHours) => {
  try {
 
    for (const hours of businessHours) {
      const docRef = doc(businessHoursCollection, hours.dayOfWeek.toString());
      
      await setDoc(docRef, {
        ...hours,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating business hours:", error);
    throw error;
  }
};

// starta standardöppettider om inga finns
export const initializeDefaultBusinessHours = async () => {
  try {
    const querySnapshot = await getDocs(businessHoursCollection);
    
    // Dra bara igång om där inte finns någon data 
    if (querySnapshot.empty) {
      const defaultHours = [
        { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Sunday
        { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Monday
        { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Tuesday
        { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Wednesday
        { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Thursday
        { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Friday
        { dayOfWeek: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Saturday
      ];
      
      await updateBusinessHours(defaultHours);
    }
  } catch (error) {
    console.error("Error initializing default business hours:", error);
    throw error;
  }
}; 