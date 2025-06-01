import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BookingCalendar from "@/components/BookingCalendar";
import TimeSlotSelector from "@/components/TimeSlotSelector";
import ServiceSelector from "@/components/ServiceSelector";
import BookingForm from "@/components/BookingForm";
import BookingConfirmation from "@/components/BookingConfirmation";
import PaymentForm from "@/components/PaymentForm";
import AdminPanel from "@/components/AdminPanel";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/lib/AuthContext";
import { generateTimeSlots, formatDate } from "@/utils/dateUtils";
import { Link, Send } from "lucide-react";

// Importera firestore services
import { getAllServices, addService, deleteService, updateService } from "@/lib/services";
import { getAllBookings, addBooking, getBookingsByDate } from "@/lib/bookings";
import { getBusinessHours, updateBusinessHours, initializeDefaultBusinessHours } from "@/lib/businessHours";
import { createBookingLink } from "@/lib/booking-links";

// mock data first load
const initialServices = [
  {
    id: "1",
    name: "Damklippning",
    duration: 60,
    price: 550,
    description: "Komplett klippning med tvättning och styling för damer",
    availableDays: [],
    category: "Klippning",
  },
  {
    id: "2",
    name: "Herrklippning",
    duration: 45,
    price: 450,
    description: "Komplett klippning med tvättning och styling för herrar",
    availableDays: [],
    category: "Klippning",
  },
  {
    id: "3",
    name: "Barnklippning",
    duration: 30,
    price: 350,
    description: "Enkel klippning för barn under 12 år",
    availableDays: [],
    category: "Klippning",
  },
  {
    id: "4",
    name: "Färgning & klippning",
    duration: 120,
    price: 1250,
    description: "Färgning, toning, klippning och styling",
    availableDays: [],
    category: "Färgbehandling",
  },
  {
    id: "5",
    name: "Slingor",
    duration: 90,
    price: 950,
    description: "Färgslingor med folieteknik",
    availableDays: [],
    category: "Färgbehandling",
  },
  {
    id: "6",
    name: "Permanent",
    duration: 120,
    price: 850,
    description: "Permanent för mer volym och lockar",
    availableDays: [],
    category: "Behandling",
  },
];

const initialBusinessHours = [
  { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Söndag
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Måndag
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Tisdag
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Onsdag
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Torsdag
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Fredag
  { dayOfWeek: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Lördag
];

const Index = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
// Tillstånd för bokningsflödet
  const [currentStep, setCurrentStep] = useState("service");
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Tillstånd för bokningslänken
  const [bookingLink, setBookingLink] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  
  // Tillstånd för Admin
  const [services, setServices] = useState(initialServices);
  const [bookings, setBookings] = useState([]);
  const [businessHours, setBusinessHours] = useState(
    initialBusinessHours
  );
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Tillstånd för att spara bokningsdata under betalningen
  const [bookingData, setBookingData] = useState(null);

  // Slut på att copy-pasta ordet Tillstånd i varje kommentar....
  
  // Ladda data från firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        
        // Initiera standardöppettider om det behövs
        await initializeDefaultBusinessHours();
        
        // Ladda tjänster, bokningar och öppettider samtidigt
        const [servicesData, bookingsData, businessHoursData] = await Promise.all([
          getAllServices(),
          getAllBookings(),
          getBusinessHours()
        ]);
        
        setServices(servicesData);
        setBookings(bookingsData);
        setBusinessHours(businessHoursData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Laddningsfel",
          description: "Det gick inte att ladda data från servern. Försök igen senare.",
        });
      } finally {
        setDataLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  // Generera tillgängliga time slots när dett datum är valt
  useEffect(() => {
    if (selectedDate && selectedService) {
      const loadBookingsForDate = async () => {
        try {
          // Ladda bokningar för det valda datumet
          const dateBookings = await getBookingsByDate(selectedDate);
          
          // Konvertera bokningar till time slots
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
  
  // Hantera val av tjänst
  const handleSelectService = (service) => {
    setSelectedService(service);  // Spara tjänst du valt
    setCurrentStep("datetime"); // Gå vidare till datum och tid
    // Återställ datum och tid om man byter tjänst
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
  };
  
  // Hantera inskickning av bokningsformulär
  const handleBookingSubmit = async (formValues) => {
    if (!selectedService || !selectedTimeSlot || !selectedDate) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i all bokningsinformation",
        variant: "destructive",
      });
      return;
    }
    
    //  Detta ska göra så att man går till payment istället för att göra en booking
    setIsLoading(true);
    
    try {
      // Förbered bokningsdata men spara den inte ännu
      const newBooking = {
        serviceId: selectedService.id,
        date: selectedTimeSlot.startTime,
        timeSlotId: selectedTimeSlot.id,
        customerName: formValues.name,
        customerEmail: formValues.email,
        customerPhone: formValues.phone,
        notes: formValues.notes || "",
        status: "confirmed",
      };
      
     // Spara bokningsdatan tillfälligt
      setBookingData(newBooking);
      
     // Gå vidare till betalning
      setCurrentStep("payment");
    } catch (error) {
      // Visa felmeddelande om något går fel
      console.error("Error preparing booking:", error);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Det gick inte att förbereda din bokning. Försök igen senare.",
      });
    } finally {
        // Avsluta laddningen
      setIsLoading(false);
    }
  };
  
  // Hantera när betalningen är klar
  const handlePaymentComplete = async () => {
    setIsLoading(true);
    
    try {
       // En liten säkerhetskontrol
      if (!bookingData) {
        throw new Error("Booking data not found");
      }
      
      // Spara bokningen i databasen
      const savedBooking = await addBooking(bookingData);
      
      // Uppdatera listan med bokningar 
      setBookings([...bookings, savedBooking]);
       // Spara den bekräftade bokningen
      setConfirmedBooking(savedBooking);
      // Gå vidare till bekräftelsesteget
      setCurrentStep("confirmation");
      
     // Visa bekräftelsemeddelande
      toast({
        title: "Bokning bekräftad!",
        description: "Din tid har bokats och betalats framgångsrikt.",
      });
    } catch (error) {
       // Visa felmeddelande om bokningen misslyckas
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Bokningsfel",
        description: "Det gick inte att skapa din bokning. Försök igen senare.",
      });
    } finally {
        // Ta bort laddnings inikatorn!
      setIsLoading(false);
    }
  };
  
  // Starta om bokningsflödet, fixar ny bokning
  const handleNewBooking = () => {
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setConfirmedBooking(null);
    setCurrentStep("service");
  };
  
  // Generera booking link
  const generateBookingLink = async () => {
    try {
      //  Kontrollera om användaren är inloggad 
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Autentisering krävs",
          description: "Du måste vara inloggad för att skapa en bokningslänk.",
        });
        return "";
      }

      setLinkLoading(true);
      
      try {
        console.log("Starting booking link creation...");
        
        // Skapa bokningslänk i databasen
        const bookingLink = await createBookingLink();
        console.log("Booking link created successfully:", bookingLink);
        
        // bugger hel url med id
        const link = `${window.location.origin}/book/${bookingLink.linkId}`;
        console.log("Generated complete URL:", link);
        
         // Spara och visa länken i texten
        setBookingLink(link);
        setShowLinkForm(true);

        // visar succe toasten yippie
        toast({
          title: "Bokningslänk skapad",
          description: "En ny bokningslänk har skapats framgångsrikt.",
        });
        
        return link;
      } catch (firebaseError) {
        console.error("Firebase error creating booking link:", firebaseError);
        
       // Släpp inte in dom saknar access
        if (firebaseError.message && firebaseError.message.includes("Missing or insufficient permissions")) {
          toast({
            variant: "destructive",
            title: "Behörighetsfel",
            description: "Du har inte behörighet att skapa bokningslänkar. Kontrollera Firestore-reglerna.",
          });
        } else {
          // Visa ett fel om något annat gick fel, wordplay
          toast({
            variant: "destructive",
            title: "Fel",
            description: `Det gick inte att skapa en bokningslänk: ${firebaseError.message}`,
          });
        }
        return "";
      }
    } catch (error) {
      // Catchar oväntade fel som inte är från Firebase!!!!
      console.error("Error in generateBookingLink:", error);
      toast({
        variant: "destructive",
        title: "Oväntat fel",
        description: `Ett oväntat fel uppstod: ${error.message}`,
      });
      return "";
    } finally {
        // Sluta visa indikatorn oavsett vad
      setLinkLoading(false);
    }
  };
  
  //  Felhantering email
  const sendBookingLink = async () => {
    if (!recipientEmail) {
      toast({
        title: "Fel",
        description: "Vänligen ange en e-postadress",
        variant: "destructive",
      });
      return;
    }
    
    try {
         // Skapa en ny bokningslänk om det inte redan finns en
      const link = bookingLink || await generateBookingLink();
      
      if (!link) {
        return; // Misslyckades med att skapa länk
      }
      
       // Om det var en riktig app så skulle det skickas ett e-mail
      console.log(`Sending booking link ${link} to ${recipientEmail}`);
      
       // Bekräftelsemeddelande till användaren
      toast({
        title: "Bokningslänk skickad!",
        description: `En bokningslänk har skickats till ${recipientEmail}`,
      });
      
      setRecipientEmail(""); // Rensa e-postfältet
      setShowLinkForm(false); // Dölj länkformuläret
    } catch (error) {
      console.error("Error sending booking link:", error);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Det gick inte att skicka bokningslänken. Försök igen senare.",
      });
    }
  };
  
  // Kopiera bokningslänk till urklipp
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: "Kopierad!",
      description: "Bokningslänken har kopierats till urklipp.",
    });
  };
  
  
// Adminfunktion!!!! = lägg till ny tjänst
  const handleAddService = async (serviceData) => {
    try {
      // Lägg till tjänsten i Firestore
      const newService = await addService(serviceData);
      
      // Uppdatera det lokala tillståndet med den nya tjänsten
      setServices([...services, newService]);
      
      // via toasten!
      toast({
        title: "Tjänst tillagd",
        description: `${newService.name} har lagts till i dina tjänster.`,
      });
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Det gick inte att lägga till tjänsten. Försök igen senare.",
      });
    }
  };
  
  const handleUpdateService = async (serviceId, serviceData) => {
    try {
      // Update the service in Firestore
      await updateService(serviceId, serviceData);
      
      // Update the local state
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId 
            ? { ...service, ...serviceData } 
            : service
        )
      );
      
      toast({
        title: "Tjänst uppdaterad",
        description: `${serviceData.name} har uppdaterats.`,
      });
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Det gick inte att uppdatera tjänsten. Försök igen senare.",
      });
    }
  };
  
  // Adminfunktion!!!!== uppdatera en tjänst
  const handleDeleteService = async (serviceId) => {
    try {
      ///  Kolla om tjänsten används i bokningar
      const serviceBookings = bookings.filter(b => b.serviceId === serviceId);
      
      if (serviceBookings.length > 0) {
        toast({
          variant: "destructive",
          title: "Kan inte ta bort tjänst",
          description: `Denna tjänst har ${serviceBookings.length} bokningar kopplade till sig.`,
        });
        return;
      }
      
     // Ta bort tjänsten från Firestore
      await deleteService(serviceId);
      
    // Uppdatera tillståndet
      setServices(services.filter(service => service.id !== serviceId));
      

      // Yippie visar toast
      toast({
        title: "Tjänst borttagen",
        description: "Tjänsten har tagits bort framgångsrikt.",
      });
    } catch (error) {
        // Visa felmeddelande om fel vid borttagning
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Det gick inte att ta bort tjänsten. Försök igen senare.",
      });
    }
  };
  
  // Adminfunktion!!! == Uppdatera öppetider
  const handleUpdateBusinessHours = async (hours) => {
    try {
      // Uppdatera öppettider i Firestore
      await updateBusinessHours(hours);
      
      // Uppdaterar local state
      setBusinessHours(hours);
      
      // Visar toast yippie!
      toast({
        title: "Öppettider uppdaterade",
        description: "Dina öppettider har uppdaterats framgångsrikt.",
      });
    } catch (error) {
      // Felmedelande igen
      console.error("Error updating business hours:", error);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Det gick inte att uppdatera öppettiderna. Försök igen senare.",
      });
    }
  };
  
  // OM INLOGGAD = DU ADMIN OCH HAR BEHÖRIGHETER
  useEffect(() => {
    // Kolla om användares email är admino
    if (currentUser) {
      const allowedAdminEmails = ["admin1@gmail.com", "arianjashari1998@gmail.com"];
      const isAdminUser = allowedAdminEmails.includes(currentUser.email || "");
      
      // Om användare inte är admin men ser adminvyn, resetas
      if (!isAdminUser && isAdmin) {
        setIsAdmin(false);
      }
      
      // Kollar om admin är true i URL för att enabla admin
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true' && isAdminUser && !isAdmin) {
        setIsAdmin(true);
        // Tar bort parametern från URL efter adminlogg är färdigt
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (isAdmin) {
      // Om ingen användare är inloggad men admin view är enabled, så reseta
      setIsAdmin(false);
    }
  }, [currentUser, isAdmin]);
  
  // Toggla mellan admin och booking viewn
  const toggleAdminView = () => {
    if (currentUser) {
      const allowedAdminEmails = ["admin1@gmail.com", "arianjashari1998@gmail.com"];
      const isAdminUser = allowedAdminEmails.includes(currentUser.email || "");
      
      if (isAdminUser) {
        setIsAdmin(!isAdmin);
      } else {
        toast({
          variant: "destructive",
          title: "Åtkomst nekad",
          description: "Du har inte behörighet att komma åt administratörspanelen.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Autentisering krävs",
        description: "Du måste vara inloggad för att komma åt administratörspanelen.",
      });
    }
  };
  
  // Rendera main
  const renderContent = () => {
    if (isAdmin && currentUser) {
      return (
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Administrationspanel - Frisörsalong</h1>
            <Button variant="outline" onClick={toggleAdminView}>
              Byt till bokningsvyn
            </Button>
          </div>
          
          <div className="mb-6 p-6 border rounded-md bg-white/50 backdrop-blur-sm shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Hantera bokningslänkar</h2>
            <div className="space-y-4">
              {currentUser ? (
                <>
                  <Button 
                    onClick={async () => {
                      await generateBookingLink();
                      setShowLinkForm(true);
                    }}
                    className="flex items-center gap-2"
                    disabled={linkLoading}
                  >
                    {linkLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-b-2 border-current rounded-full mr-2"></div>
                        Skapar länk...
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4" />
                        Skapa ny bokningslänk
                      </>
                    )}
                  </Button>
                  
                  {showLinkForm && (
                    <div className="space-y-4 p-4 border rounded-md bg-white/80">
                      <div className="flex items-center gap-2">
                        <Input 
                          value={bookingLink} 
                          readOnly 
                          className="flex-1"
                        />
                        <Button onClick={copyLinkToClipboard} variant="outline">
                          Kopiera
                        </Button>
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Skicka länken via e-post
                          </label>
                          <Input 
                            type="email" 
                            placeholder="E-postadress" 
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                          />
                        </div>
                        <Button onClick={sendBookingLink} className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Skicka
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Du måste vara inloggad för att hantera bokningslänkar.
                </p>
              )}
            </div>
          </div>
          
          <AdminPanel
            services={services}
            bookings={bookings}
            businessHours={businessHours}
            onAddService={handleAddService}
            onUpdateBusinessHours={handleUpdateBusinessHours}
            onDeleteService={handleDeleteService}
            onUpdateService={handleUpdateService}
          />
        </div>
      );
    }
    
    return (
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Boka tid hos BokaHos</h1>
          {currentUser && (
            <Button variant="outline" onClick={toggleAdminView}>
              {isAdmin ? "Byt till bokningsvyn" : "Administrationspanel"}
            </Button>
          )}
        </div>
        
        {currentStep === "confirmation" && confirmedBooking ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <BookingConfirmation
              booking={confirmedBooking}
              service={
                services.find((s) => s.id === confirmedBooking.serviceId) ||
                services[0]
              }
              onNewBooking={handleNewBooking}
            />
          </div>
        ) : (
          <div className="space-y-6 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm p-6">
            <Tabs value={currentStep} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
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
                <TabsTrigger
                  value="payment"
                  onClick={() => {
                    if (bookingData) setCurrentStep("payment");
                  }}
                  disabled={
                    !bookingData ||
                    currentStep === "confirmation"
                  }
                >
                  Betalning
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
              
              <TabsContent value="payment" className="mt-6">
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
                  
                  <PaymentForm 
                    amount={selectedService?.price || 0}
                    onPaymentComplete={handlePaymentComplete}
                    onCancel={() => setCurrentStep("details")}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          renderContent()
        )}
      </main>
      
      <footer className="border-t py-6">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2025 BokaHos. Alla rättigheter förbehållna.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">
                Villkor
              </Button>
              <Button variant="ghost" size="sm">
                Integritet
              </Button>
              <Button variant="ghost" size="sm">
                Kontakt
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
