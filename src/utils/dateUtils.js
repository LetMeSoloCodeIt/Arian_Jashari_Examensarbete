import { format, parse, addMinutes, isWithinInterval, addDays } from "date-fns";
import { sv } from "date-fns/locale";

export const formatDate = (date) => {
  return format(date, "d MMM yyyy", { locale: sv });
};

export const formatTime = (time) => {
  // Konvertera 09:00 till 9:00
  const date = parse(time, "HH:mm", new Date());
  return format(date, "HH:mm");
};

export const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return format(date, "d MMM yyyy HH:mm", { locale: sv });
};

export const isBusinessOpen = (date, businessHours) => {
  const dayOfWeek = date.getDay();
  const hoursForDay = businessHours.find(hours => hours.dayOfWeek === dayOfWeek);
  
  if (!hoursForDay || !hoursForDay.isOpen) {
    return false;
  }
  
  return true;
};

// Kolla om ett datum är i dåtid
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// Generera time slots för ett givet datum och service längd
export const generateTimeSlots = (
  date, 
  businessHours, 
  serviceDuration,
  existingBookings = []
) => {
  const dayOfWeek = date.getDay();
  const hoursForDay = businessHours.find(hours => hours.dayOfWeek === dayOfWeek);
  
  if (!hoursForDay || !hoursForDay.isOpen) {
    return [];
  }
  
  const slots = [];
  const slotInterval = 30; // Minuter mellan slots
  
  const startDate = new Date(date);
  startDate.setHours(
    parseInt(hoursForDay.openTime.split(":")[0], 10),
    parseInt(hoursForDay.openTime.split(":")[1], 10),
    0, 0
  );
  
  const endDate = new Date(date);
  endDate.setHours(
    parseInt(hoursForDay.closeTime.split(":")[0], 10),
    parseInt(hoursForDay.closeTime.split(":")[1], 10),
    0, 0
  );
  
  // justera sluttiden så att den tar hänsyn till tjänstens längd
  const lastStartTime = addMinutes(endDate, -serviceDuration);
  
  let currentSlotStart = startDate;
  
  while (currentSlotStart <= lastStartTime) {
    const currentSlotEnd = addMinutes(currentSlotStart, serviceDuration);
    
    // Kolla om slotten overlappar med existerande bokning
    const isAvailable = !existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      // kollar efter overlaps
      return (
        (currentSlotStart >= bookingStart && currentSlotStart < bookingEnd) ||
        (currentSlotEnd > bookingStart && currentSlotEnd <= bookingEnd) ||
        (currentSlotStart <= bookingStart && currentSlotEnd >= bookingEnd)
      );
    });
    
    slots.push({
      id: currentSlotStart.toISOString(),
      startTime: currentSlotStart.toISOString(),
      endTime: currentSlotEnd.toISOString(),
      available: isAvailable
    });
    
    // flytta till nästa tids starttid
    currentSlotStart = addMinutes(currentSlotStart, slotInterval);
  }
  
  return slots;
};

// hämtar 7 kommande dagar för kalenderview
export const getNextDays = (startDate, daysToShow) => {
  const dates = [];
  
  for (let i = 0; i < daysToShow; i++) {
    dates.push(addDays(startDate, i));
  }
  
  return dates;
};

// Hämtar time slots för display
export const getTimeSlotDisplay = (timeSlot) => {
  const start = new Date(timeSlot.startTime);
  const end = new Date(timeSlot.endTime);
  
  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
}; 