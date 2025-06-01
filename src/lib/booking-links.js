import { 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db, bookingLinksCollection } from './firebase';

// Test if the bookingLinks collection is accessible
export const testBookingLinkAccess = async () => {
  try {
    console.log("Testing booking link access...");
    const q = query(bookingLinksCollection, limit(1));
    const querySnapshot = await getDocs(q);
    
    console.log("Access test successful. Documents found:", querySnapshot.size);
    return true;
  } catch (error) {
    console.error("Error accessing booking links collection:", error);
    return false;
  }
};

// Skapa en bokningslänk
export const createBookingLink = async () => {
  try {
    // Kolla om databsen går att nå
    const isAccessible = await testBookingLinkAccess();
    if (!isAccessible) {
      console.warn("Booking links collection may not be accessible, but will try to create link anyway");
    }
    
    // Generar random linkID
    const linkId = Math.random().toString(36).substring(2, 8);
    
    // Skapar dokumentdata via ISO för createdAt
    const linkData = {
      linkId,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    console.log("Creating booking link with data:", linkData);
    
    // Lägger till data i databasen ( länkdata )
    const docRef = await addDoc(bookingLinksCollection, linkData);
    
    console.log("Successfully created booking link with ID:", docRef.id);
    
    return {
      id: docRef.id,
      linkId,
      createdAt: new Date(),
      isActive: true
    };
  } catch (error) {
    console.error("Error creating booking link:", error);
    throw error;
  }
};

// Validerar bokningslänk 
export const validateBookingLink = async (linkId) => {
  try {
    // Hanterar linkID case
    if (!linkId) {
      console.log("No linkId provided");
      return null;
    }
    
    // /demo
    if (linkId === 'demo') {
      console.log("Using demo link");
      return {
        id: 'demo',
        linkId: 'demo',
        createdAt: new Date(),
        isActive: true
      };
    }
    
    console.log("Validating booking link with ID:", linkId);
    
    // Hämta bokningslänken med angivnet linkId
    const q = query(bookingLinksCollection, where("linkId", "==", linkId));
    
    try {
      console.log("Executing query...");
      const querySnapshot = await getDocs(q);
      console.log("Query executed, documents found:", querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log("No booking link found with ID:", linkId);
        return null; 
      }
      
      // den hämtar det försat matchande dokumentet
      const docData = querySnapshot.docs[0];
      const data = docData.data();
      
      console.log("Found booking link:", { id: docData.id, ...data });
      
      // Okej så här kontrollerar den om den är en sträng eller ett timestamp objekt
      let createdAt;
      
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate();
      } else if (typeof data.createdAt === 'string') {
        createdAt = new Date(data.createdAt);
      } else {
        createdAt = new Date();
      }
      
      const bookingLink = {
        id: docData.id,
        linkId: data.linkId,
        createdAt,
        isActive: data.isActive ?? true
      };
      
      console.log("Returning validated booking link:", bookingLink);
      return bookingLink;
    } catch (error) {
      console.warn("Error querying booking links:", error);
      return null;
    }
  } catch (error) {
    console.error("Error validating booking link:", error);
    return null;
  }
};

// få booking link via dens ID
export const getBookingLinkById = async (id) => {
  try {
    if (!id) {
      return null;
    }
    
    if (id === 'demo') {
      return {
        id: 'demo',
        linkId: 'demo',
        createdAt: new Date(),
        isActive: true
      };
    }
    
    const linkRef = doc(bookingLinksCollection, id);
    const linkSnap = await getDoc(linkRef);
    
    if (!linkSnap.exists()) {
      return null;
    }
    
    const data = linkSnap.data();
    
    // Konvertera createdAt från string eller timestamp till datum 
    let createdAt;
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt.toDate();
    } else if (typeof data.createdAt === 'string') {
      createdAt = new Date(data.createdAt);
    } else {
      createdAt = new Date();
    }
    
    return {
      id: linkSnap.id,
      linkId: data.linkId,
      createdAt,
      isActive: data.isActive || true
    };
  } catch (error) {
    console.error("Error getting booking link:", error);
    return null;
  }
}; 