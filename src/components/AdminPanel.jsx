import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { formatDateTime, isBusinessOpen } from "@/utils/dateUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Calendar as CalendarIcon, Tag } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { sv } from "date-fns/locale";
import { format, addMonths } from "date-fns";

const AdminPanel = ({
  services,
  bookings,
  businessHours,
  onAddService,
  onUpdateBusinessHours,
  onDeleteService,
  onUpdateService = async () => {},
}) => {
  const [newService, setNewService] = useState({
    name: "",
    duration: 60,
    price: 0,
    description: "",
    availableDays: [],
    category: "Uncategorized", 
  });


  const [editingService, setEditingService] = useState(null);
  const [editedService, setEditedService] = useState({
    name: "",
    duration: 60,
    price: 0,
    description: "",
    availableDays: [],
    category: "",
  });

 
  const [localBusinessHours, setLocalBusinessHours] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAddDayDialog, setShowAddDayDialog] = useState(false);
  const [newDay, setNewDay] = useState(null);

  const [serviceToDelete, setServiceToDelete] = useState(null);


  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [isEditingNewCategory, setIsEditingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
 
  const [localCategories, setLocalCategories] = useState([]);

  const [categorySelectKey, setCategorySelectKey] = useState(0);
  const [editCategorySelectKey, setEditCategorySelectKey] = useState(0);

 
  const serviceCategories = useMemo(() => {
    const categories = new Set([
      ...services.map(service => service.category || 'Uncategorized'),
      ...localCategories
    ]);
    return ['Uncategorized', ...Array.from(categories)].filter((value, index, self) => 
      self.indexOf(value) === index
    );
  }, [services, localCategories]);

  
  useEffect(() => {
    setLocalBusinessHours([...businessHours]);
    setHasUnsavedChanges(false);
  }, [businessHours]);

  const daysOfWeek = [
    "Söndag",
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
  ];

  const handleAddService = () => {
    onAddService(newService);
    setNewService({
      name: "",
      duration: 60,
      price: 0,
      description: "",
      availableDays: [],
      category: "Uncategorized", 
    });
  };


  const handleEditService = (service) => {
    setEditingService(service);
    setEditedService({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description,
      availableDays: service.availableDays || [],
      category: service.category || "Uncategorized",
    });
  };


  const handleSaveEditedService = () => {
    if (editingService) {
      onUpdateService(editingService.id, editedService);
      setEditingService(null);
    }
  };


  const handleDeleteService = () => {
    if (serviceToDelete) {
      onDeleteService(serviceToDelete);
      setServiceToDelete(null);
    }
  };

 
  const handleAddAvailableDay = (day) => {
    if (!newService.availableDays.includes(day)) {
      setNewService({
        ...newService,
        availableDays: [...newService.availableDays, day].sort((a, b) => a - b)
      });
    } else {
 
      setNewService({
        ...newService,
        availableDays: newService.availableDays.filter(d => d !== day)
      });
    }
  };


  const handleAddEditAvailableDay = (day) => {
    if (!editedService.availableDays.includes(day)) {
      setEditedService({
        ...editedService,
        availableDays: [...editedService.availableDays, day].sort((a, b) => a - b)
      });
    } else {
      // If day is already selected, remove it
      setEditedService({
        ...editedService,
        availableDays: editedService.availableDays.filter(d => d !== day)
      });
    }
  };


  const updateHours = (index, field, value) => {
    const updatedHours = [...localBusinessHours];
    

    if (field === "isOpen" && value === true) {
      if (!updatedHours[index].openTime) {
        updatedHours[index].openTime = "09:00";
      }
      if (!updatedHours[index].closeTime) {
        updatedHours[index].closeTime = "17:00";
      }
    }
    
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setLocalBusinessHours(updatedHours);
    setHasUnsavedChanges(true);
  };


  const formatTimeForInput = (timeString) => {
    if (!timeString) return "09:00";
    return timeString;
  };

  const saveBusinessHours = () => {
    onUpdateBusinessHours(localBusinessHours);
    setHasUnsavedChanges(false);
  };


  const addDay = () => {
    if (newDay === null) return;
    
 
    if (localBusinessHours.some(hours => hours.dayOfWeek === newDay)) {
      return;
    }

    const updatedHours = [...localBusinessHours];
    updatedHours.push({
      dayOfWeek: newDay,
      isOpen: false,
      openTime: "09:00",
      closeTime: "17:00"
    });

    setLocalBusinessHours(updatedHours);
    setHasUnsavedChanges(true);
    setShowAddDayDialog(false);
    setNewDay(null);
  };


  const deleteDay = (dayIndex) => {
    const updatedHours = localBusinessHours.filter((_, index) => index !== dayIndex);
    setLocalBusinessHours(updatedHours);
    setHasUnsavedChanges(true);
  };


  const getMissingDays = () => {
    const existingDays = new Set(localBusinessHours.map(hours => hours.dayOfWeek));
    return Array.from({length: 7}, (_, i) => i).filter(day => !existingDays.has(day));
  };


  const groupedServices = useMemo(() => {
    const groups = {};
    
    services.forEach(service => {
      const category = service.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
    });
    
    return groups;
  }, [services]);

  return (
    <Tabs defaultValue="hours" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="bookings">Bokningar</TabsTrigger>
        <TabsTrigger value="services">Tjänster</TabsTrigger>
        <TabsTrigger value="hours">Öppettider</TabsTrigger>
      </TabsList>
      
      <TabsContent value="bookings">
        <Card>
          <CardHeader>
            <CardTitle>Kommande bokningar</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Inga bokningar ännu.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum & Tid</TableHead>
                      <TableHead>Kund</TableHead>
                      <TableHead>Tjänst</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const service = services.find(s => s.id === booking.serviceId);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>{formatDateTime(booking.date)}</TableCell>
                          <TableCell>
                            <div>{booking.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {booking.customerEmail}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {booking.customerPhone}
                            </div>
                          </TableCell>
                          <TableCell>{service?.name}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "confirmed" 
                                ? "bg-green-100 text-green-800" 
                                : booking.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {booking.status === "confirmed" ? "Bekräftad" : 
                               booking.status === "canceled" ? "Avbokad" : "Väntande"}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="services">
        <Card>
          <CardHeader>
            <CardTitle>Hantera tjänster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedServices).map(([category, services]) => (
              <div key={category} className="mb-8">
                <h3 className="font-medium text-lg mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-primary" />
                  {category}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <Card key={service.id} className="overflow-hidden">
                      <div className="p-4">
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <div>
                            <span className="text-sm">{service.duration} minuter</span>
                            <span className="font-medium ml-2">{service.price.toFixed(2)} SEK</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setServiceToDelete(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>Lägg till ny tjänst</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Lägg till ny tjänst</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tjänstens namn</Label>
                    <Input
                      id="name"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({ ...newService, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Kategori</Label>
                    {!isAddingNewCategory ? (
                      <>
                        <Select
                          key={categorySelectKey}
                          value={newService.category}
                          onValueChange={(value) => {
                            if (value === "new") {
                              setIsAddingNewCategory(true);
                              setNewCategoryName("");
                            } else {
                              setNewService({ ...newService, category: value });
                            }
                          }}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Välj en kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="new">+ Ny kategori</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Ange ny kategori"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setIsAddingNewCategory(false);
                              setCategorySelectKey(prev => prev + 1);
                            }}
                          >
                            Avbryt
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (newCategoryName.trim()) {
                                setLocalCategories(prev => [...prev, newCategoryName.trim()]);
                                setNewService({ ...newService, category: newCategoryName.trim() });
                                setIsAddingNewCategory(false);
                                setCategorySelectKey(prev => prev + 1);
                              }
                            }}
                          >
                            Lägg till
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Varaktighet (minuter)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newService.duration}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            duration: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Pris (SEK)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newService.price}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Tillgängliga dagar (lämna tomt för alla dagar)</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {daysOfWeek.map((day, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={newService.availableDays.includes(index) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                          onClick={() => handleAddAvailableDay(index)}
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddService} className="w-full">
                    Lägg till tjänst
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {}
        <Dialog open={editingService !== null} onOpenChange={() => setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redigera tjänst</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tjänstens namn</Label>
                <Input
                  id="edit-name"
                  value={editedService.name}
                  onChange={(e) =>
                    setEditedService({ ...editedService, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Beskrivning</Label>
                <Textarea
                  id="edit-description"
                  value={editedService.description}
                  onChange={(e) =>
                    setEditedService({ ...editedService, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Kategori</Label>
                {!isEditingNewCategory ? (
                  <>
                    <Select
                      key={editCategorySelectKey}
                      value={editedService.category}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setIsEditingNewCategory(true);
                          setEditCategoryName("");
                        } else {
                          setEditedService({ ...editedService, category: value });
                        }
                      }}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Välj en kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ Ny kategori</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Ange ny kategori"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsEditingNewCategory(false);
                          setEditCategorySelectKey(prev => prev + 1);
                        }}
                      >
                        Avbryt
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (editCategoryName.trim()) {
                            setLocalCategories(prev => [...prev, editCategoryName.trim()]);
                            setEditedService({ ...editedService, category: editCategoryName.trim() });
                            setIsEditingNewCategory(false);
                            setEditCategorySelectKey(prev => prev + 1);
                          }
                        }}
                      >
                        Lägg till
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Varaktighet (minuter)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editedService.duration}
                    onChange={(e) =>
                      setEditedService({
                        ...editedService,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Pris (SEK)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editedService.price}
                    onChange={(e) =>
                      setEditedService({
                        ...editedService,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Tillgängliga dagar (lämna tomt för alla dagar)</Label>
                <div className="grid grid-cols-7 gap-1">
                  {daysOfWeek.map((day, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={editedService.availableDays.includes(index) ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => handleAddEditAvailableDay(index)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingService(null)}>
                  Avbryt
                </Button>
                <Button onClick={handleSaveEditedService}>
                  Spara ändringar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {}
        <Dialog open={serviceToDelete !== null} onOpenChange={() => setServiceToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bekräfta borttagning</DialogTitle>
              <DialogDescription>
                Är du säker på att du vill ta bort denna tjänst? Detta går inte att ångra.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setServiceToDelete(null)}>
                Avbryt
              </Button>
              <Button variant="destructive" onClick={handleDeleteService}>
                Ta bort tjänst
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TabsContent>
      
      <TabsContent value="hours">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Öppettider</CardTitle>
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button onClick={saveBusinessHours} size="sm">
                  Spara ändringar
                </Button>
              )}
              <Dialog open={showAddDayDialog} onOpenChange={setShowAddDayDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Lägg till dag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Lägg till ny dag</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="day">Välj dag</Label>
                      <Select value={newDay?.toString() || ""} onValueChange={(value) => setNewDay(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj en dag" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMissingDays().map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {daysOfWeek[day]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDayDialog(false)}>
                        Avbryt
                      </Button>
                      <Button onClick={addDay} disabled={newDay === null}>
                        Lägg till
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localBusinessHours
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((hours, index) => (
                <div key={hours.dayOfWeek} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium min-w-[80px]">
                      {daysOfWeek[hours.dayOfWeek]}
                    </span>
                    <Switch
                      checked={hours.isOpen}
                      onCheckedChange={(checked) => updateHours(index, "isOpen", checked)}
                    />
                    {hours.isOpen && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={formatTimeForInput(hours.openTime)}
                          onChange={(e) => updateHours(index, "openTime", e.target.value)}
                          className="w-24"
                        />
                        <span>till</span>
                        <Input
                          type="time"
                          value={formatTimeForInput(hours.closeTime)}
                          onChange={(e) => updateHours(index, "closeTime", e.target.value)}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDay(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminPanel;
