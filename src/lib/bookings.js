import { 
  bookingsCollection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from '@/lib/firebase';

// Hämta alla bookings
export const getAllBookings = async () => {
  try {
    const querySnapshot = await getDocs(bookingsCollection);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Konvertera firestore timestamps tillbaka 
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
      
      bookings.push({
        id: doc.id,
        serviceId: data.serviceId,
        date: date,
        timeSlotId: data.timeSlotId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes || "",
        status: data.status
      });
    });
    
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// Lägg till ny booking
export const addBooking = async (booking) => {
  try {
    // Säkerställ att datum är stored som firestore timestamp
    const dateValue = typeof booking.date === 'string' 
      ? new Date(booking.date) 
      : booking.date;
    
    const firestoreBooking = {
      ...booking,
      date: Timestamp.fromDate(dateValue),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(bookingsCollection, firestoreBooking);
    
    return {
      id: docRef.id,
      ...booking
    };
  } catch (error) {
    console.error("Error adding booking:", error);
    throw error;
  }
};

// Uppdatera en booking
export const updateBooking = async (id, bookingData) => {
  try {
    const bookingRef = doc(bookingsCollection, id);
    

    const updateData = { ...bookingData, updatedAt: serverTimestamp() };
    if (bookingData.date) {
      const dateValue = typeof bookingData.date === 'string' 
        ? new Date(bookingData.date) 
        : bookingData.date;
      
      updateData.date = Timestamp.fromDate(dateValue);
    }
    
    await updateDoc(bookingRef, updateData);
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};

//  Ta bort en booking
export const deleteBooking = async (id) => {
  try {
    const bookingRef = doc(bookingsCollection, id);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

// Hämta bookings för specifikt datum 
export const getBookingsByDate = async (date) => {
  try {
    // Skapa start och end tider för dagen
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Konvertera till firestore timestamps
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    // Hämta bokningar inom det angivna intervallet
    const q = query(
      bookingsCollection, 
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        serviceId: data.serviceId,
        date: data.date.toDate(),
        timeSlotId: data.timeSlotId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes || "",
        status: data.status
      });
    });
    
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    throw error;
  }
}; 