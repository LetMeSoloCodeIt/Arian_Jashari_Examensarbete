import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import { Check, Calendar, Clock, CreditCard, User, MessageSquare } from "lucide-react";

const BookingConfirmation = ({
  booking,
  service,
  onNewBooking,
}) => {
  return (
    <div className="flex flex-col items-center max-w-md mx-auto fade-in">
      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 shadow-lg animate-bounce-gentle">
        <Check className="h-12 w-12 text-primary" />
      </div>
      
      <Card className="w-full border shadow-md bg-white/80 backdrop-blur-md transition-all duration-300">
        <CardHeader className="border-b bg-white/60 text-center">
          <CardTitle className="text-xl">Bokning bekräftad!</CardTitle>
          <p className="text-muted-foreground text-sm">Tack för din bokning</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 border rounded-lg border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 font-semibold text-lg mb-2 text-primary">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              {service.name}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Datum & Tid</p>
                <p className="font-medium">{formatDateTime(booking.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Varaktighet</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="font-medium">{service.duration} minuter</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pris</p>
                <p className="font-semibold text-lg">{service.price.toFixed(0)} SEK</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Kund</p>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
                <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
              </div>
            </div>
            
            {booking.notes && (
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Anteckningar</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-2 pb-6">
          <Button 
            onClick={onNewBooking} 
            className="w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 font-semibold"
          >
            Boka en annan tid
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            En bekräftelse har skickats till din e-post.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
