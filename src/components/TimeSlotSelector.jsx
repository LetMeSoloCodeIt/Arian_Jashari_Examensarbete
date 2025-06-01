import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getTimeSlotDisplay } from "@/utils/dateUtils";
import { Clock } from "lucide-react";

const TimeSlotSelector = ({
  timeSlots,
  selectedTimeSlot,
  onSelectTimeSlot,
}) => {
  return (
    <Card className="w-full border shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader className="border-b bg-white/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Välj en tid</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {timeSlots.length === 0 ? (
          <div className="flex items-center justify-center h-32 border border-dashed rounded-md bg-white/50 text-muted-foreground">
            <p className="text-center">
              Inga tillgängliga tider för det valda datumet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className={cn(
                  "px-4 py-3 rounded-md border text-center cursor-pointer transition-all duration-300 ease-in-out font-medium",
                  selectedTimeSlot?.id === slot.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02] transform"
                    : slot.available
                    ? "hover:border-primary hover:shadow-md hover:-translate-y-1 bg-white/90 hover:bg-white"
                    : "opacity-50 cursor-not-allowed bg-muted"
                )}
                onClick={() => {
                  if (slot.available) {
                    onSelectTimeSlot(slot);
                  }
                }}
              >
                <span className="block">
                  {getTimeSlotDisplay(slot)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotSelector;
