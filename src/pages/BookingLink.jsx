import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingCalendar from "@/components/BookingCalendar";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import ServiceSelector from "@/components/ServiceSelector";
import BookingForm from "@/components/BookingForm";
import BookingConfirmation from "@/components/BookingConfirmation";
import { generateTimeSlots, formatDate } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";

// för firestore services
import { getAllServices } from "@/lib/services";
import { addBooking, getBookingsByDate } from "@/lib/bookings";
import { getBusinessHours } from "@/lib/businessHours";
import { validateBookingLink } from "@/lib/booking-links";

const BookingLink = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // För att hantera bokningsflödet och data
  const [currentStep, setCurrentStep] = useState("service");
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [linkValid, setLinkValid] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  
  // Logga när komponenten laddas
  useEffect(() => {
    console.log("BookingLink component mounted with linkId:", linkId);
    console.log("Current URL:", window.location.href);
  }, [linkId]);
  
  // Validera länken och ladda data
  useEffect(() => {
    const validateAndLoadData = async () => {
      try {
        setDataLoading(true);
        
        if (!linkId) {
          console.log("No linkId provided in URL parameters");
          setLinkValid(false);
          setDataLoading(false);
          return;
        }
        
        console.log("Attempting to validate booking link:", linkId);
        
        // Specialfall för demo
        if (linkId === 'demo') {
          console.log("Using demo link - skipping validation");
          setLinkValid(true);
          loadServiceData();
          return;
        }
        
        // Validera länken
        const validatedLink = await validateBookingLink(linkId);
        
        if (!validatedLink) {
          console.log("Link validation failed for ID:", linkId);
          setLinkValid(false);
          setDataLoading(false);
          toast({
            variant: "destructive",
            title: "Ogiltig länk",
            description: "Denna bokningslänk är ogiltig eller har utgått.",
          });
          return;
        }
        
        console.log("Link validation successful:", validatedLink);
        setLinkValid(true);
        loadServiceData();
      } catch (error) {
        console.error("Error in validateAndLoadData:", error);
        toast({
          variant: "destructive",
          title: "Laddningsfel",
          description: "Det gick inte att validera bokningslänken. Vänligen försök igen senare.",
        });
        setLinkValid(false);
        setDataLoading(false);
      }
    };
    
    const loadServiceData = async () => {
      try {
        console.log("Loading services and business hours...");
        const [servicesData, businessHoursData] = await Promise.all([
          getAllServices(),
          getBusinessHours()
        ]);
        
        console.log("Successfully loaded data:", {
          services: servicesData.length,
          businessHours: businessHoursData.length
        });
        
        setServices(servicesData);
        setBusinessHours(businessHoursData);
      } catch (loadError) {
        console.error("Error loading service data:", loadError);
        toast({
          variant: "destructive",
          title: "Laddningsfel",
          description: "Det gick inte att ladda tjänsterna. Vänligen försök igen senare.",
        });
      } finally {
        setDataLoading(false);
      }
    };
    
    validateAndLoadData();
  }, [linkId, toast]);
  
  // Generera time slot för datum är valt
  useEffect(() => {
    if (selectedDate && selectedService) {
      const loadBookingsForDate = async () => {
        try {
          // Ladda existerade bokningar för valt datum
          const dateBookings = await getBookingsByDate(selectedDate);
          
          // Konvertera bookings till time slots
          const bookedSlots = dateBookings.map(booking => ({
            id: booking.timeSlotId,
            startTime: new Date(booking.date).toISOString(),
            endTime: new Date(new Date(booking.date).getTime() + selectedService.duration * 60000).toISOString(),
            available: false
          }));
          
          const slots = generateTimeSlots(
            selectedDate,
            businessHours,
            selectedService.duration,
            bookedSlots
          );
          
          setTimeSlots(slots);
          setSelectedTimeSlot(null);
        } catch (error) {
          console.error("Error loading bookings for date:", error);
        }
      };
      
      loadBookingsForDate();
    }
  }, [selectedDate, selectedService, businessHours]);
  
  // Hantera service selection
  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentStep("datetime");
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
  };
  
  // Hantera formuläret när det skickas in
  const handleBookingSubmit = async (formData) => {
    if (!selectedService || !selectedTimeSlot || !selectedDate) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i all bokningsinformation",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Skapa nytt bokingsobjekt
      const newBooking = {
        serviceId: selectedService.id,
        date: selectedTimeSlot.startTime,
        timeSlotId: selectedTimeSlot.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        notes: formData.notes || "",
        status: "confirmed",
      };
      
      // Spara bokning till firestore
      const savedBooking = await addBooking(newBooking);
      
      // Uppdatera local state
      setBookings([...bookings, savedBooking]);
      setConfirmedBooking(savedBooking);
      setCurrentStep("confirmation");
      
      // Visar succe toasten
      toast({
        title: "Bokning bekräftad!",
        description: "Din tid har bokats framgångsrikt.",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Bokningsfel",
        description: "Det gick inte att skapa din bokning. Försök igen senare.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
 // Återställ bokningsflödet för en ny bokning
  const handleNewBooking = () => {
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setConfirmedBooking(null);
    setCurrentStep("service");
  };
  
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }
  
  if (linkValid === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6 space-y-4">
            <h1 className="text-2xl font-bold">Ogiltig bokningslänk</h1>
            <p className="text-muted-foreground">
              Denna bokningslänk är ogiltig eller har utgått. Vänligen kontakta salongen för en ny bokningslänk.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Link ID: {linkId}
            </p>
            <Button onClick={() => navigate("/")}>
              Gå till startsidan
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Boka tid hos BokaHos</h1>
            <p className="text-muted-foreground mt-2">
              Bokningslänk ID: {linkId}
            </p>
            
            {/* Felsökningsinformation!! Tydligen bara synlig i utvecklingsläge, huvudvärk */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 border border-yellow-300 bg-yellow-50 rounded-md">
                <p className="text-xs font-mono">Debug Info:</p>
                <p className="text-xs font-mono">URL: {window.location.href}</p>
                <p className="text-xs font-mono">Link ID: {linkId}</p>
                <p className="text-xs font-mono">Services loaded: {services.length}</p>
              </div>
            )}
          </div>
          
          {currentStep === "confirmation" && confirmedBooking ? (
            <BookingConfirmation
              booking={confirmedBooking}
              service={
                services.find((s) => s.id === confirmedBooking.serviceId) ||
                services[0]
              }
              onNewBooking={handleNewBooking}
            />
          ) : (
            <div className="space-y-6">
              <Tabs value={currentStep} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="service"
                    onClick={() => setCurrentStep("service")}
                    disabled={currentStep === "confirmation"}
                  >
                    Tjänst
                  </TabsTrigger>
                  <TabsTrigger
                    value="datetime"
                    onClick={() => {
                      if (selectedService) setCurrentStep("datetime");
                    }}
                    disabled={!selectedService || currentStep === "confirmation"}
                  >
                    Datum & Tid
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    onClick={() => {
                      if (selectedService && selectedTimeSlot)
                        setCurrentStep("details");
                    }}
                    disabled={
                      !selectedService ||
                      !selectedTimeSlot ||
                      currentStep === "confirmation"
                    }
                  >
                    Dina uppgifter
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="service" className="mt-6">
                  <ServiceSelector
                    services={services}
                    selectedService={selectedService}
                    onSelectService={handleSelectService}
                  />
                </TabsContent>
                
                <TabsContent value="datetime" className="mt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <BookingCalendar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        businessHours={businessHours}
                        selectedService={selectedService}
                      />
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium mb-4">
                        {selectedDate
                          ? `Tillgängliga tider för ${formatDate(selectedDate)}`
                          : "Välj ett datum för att se tillgängliga tider"}
                      </h2>
                      {selectedDate ? (
                        <TimeSlotSelector
                          timeSlots={timeSlots}
                          selectedTimeSlot={selectedTimeSlot}
                          onSelectTimeSlot={setSelectedTimeSlot}
                        />
                      ) : (
                        <div className="h-40 flex items-center justify-center border rounded-md bg-muted/20">
                          <p className="text-muted-foreground">
                            Vänligen välj ett datum först
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setCurrentStep("details")}
                      disabled={!selectedTimeSlot}
                    >
                      Fortsätt
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-6">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 p-4 border rounded-md bg-muted/20">
                      <h3 className="font-medium">Bokningsöversikt</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Tjänst: </span>
                          {selectedService?.name}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Datum: </span>
                          {selectedDate && formatDate(selectedDate)}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Tid: </span>
                          {selectedTimeSlot &&
                            new Date(selectedTimeSlot.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Pris: </span>
                          {selectedService?.price.toFixed(2)} SEK
                        </p>
                      </div>
                    </div>
                    
                    <BookingForm
                      onSubmit={handleBookingSubmit}
                      isLoading={isLoading}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingLink;
