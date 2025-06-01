import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBusinessOpen, isPastDate } from "@/utils/dateUtils";
import { CalendarClock } from "lucide-react";
import { sv } from "date-fns/locale";
import { format } from "date-fns";

const BookingCalendar = ({
  selectedDate,
  onSelectDate,
  businessHours,
  selectedService,
}) => {
 
  const disabledDays = (date) => {

    if (isPastDate(date)) {
      return true;
    }
    

    if (!isBusinessOpen(date, businessHours)) {
      return true;
    }
    
  
    if (selectedService?.availableDays && selectedService.availableDays.length > 0) {
      const dayOfWeek = date.getDay(); 
      return !selectedService.availableDays.includes(dayOfWeek);
    }
    

    return false;
  };

  return (
    <Card className="w-full border shadow-md bg-white/80 backdrop-blur-md transition-all duration-300">
      <CardHeader className="border-b bg-white/60">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <span>Välj ett datum</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          {selectedDate && (
            <div className="text-center mb-2 text-sm font-medium text-primary fade-in">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: sv })}
            </div>
          )}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            disabled={disabledDays}
            className="booking-calendar pointer-events-auto mx-auto max-w-sm"
            locale={sv}
            weekStartsOn={1} 
            initialFocus
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
