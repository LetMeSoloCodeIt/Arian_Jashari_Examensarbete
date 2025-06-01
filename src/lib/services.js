import { 
  servicesCollection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from '@/lib/firebase';

// hämtar tjänsterna
export const getAllServices = async () => {
  try {
    const querySnapshot = await getDocs(servicesCollection);
    const services = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      services.push({
        id: doc.id,
        name: data.name,
        duration: data.duration,
        price: data.price,
        description: data.description,
        category: data.category || 'Uncategorized',
        availableDays: data.availableDays || []
      });
    });
    
    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// Lägg till ny service
export const addService = async (service) => {
  try {
    const serviceWithTimestamp = {
      ...service,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(servicesCollection, serviceWithTimestamp);
    
    return {
      id: docRef.id,
      ...service
    };
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

// Uppdatera service
export const updateService = async (id, serviceData) => {
  try {
    const serviceRef = doc(servicesCollection, id);
    await updateDoc(serviceRef, {
      ...serviceData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// Ta bort en service
export const deleteService = async (id) => {
  try {
    const serviceRef = doc(servicesCollection, id);
    await deleteDoc(serviceRef);
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// hämta service via ID
export const getServiceById = async (id) => {
  try {
    const serviceRef = doc(servicesCollection, id);
    const serviceSnap = await getDoc(serviceRef);
    
    if (serviceSnap.exists()) {
      const data = serviceSnap.data();
      return {
        id: serviceSnap.id,
        name: data.name,
        duration: data.duration,
        price: data.price,
        description: data.description,
        category: data.category || 'Uncategorized',
        availableDays: data.availableDays || []
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting service:", error);
    throw error;
  }
}; 