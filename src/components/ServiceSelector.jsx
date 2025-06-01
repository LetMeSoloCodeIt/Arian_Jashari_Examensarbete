import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Scissors, Clock, Tag, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

const ServiceSelector = ({
  services,
  selectedService,
  onSelectService,
}) => {
  const [filter, setFilter] = useState("all");

 
  const categories = useMemo(() => {
    const cats = new Set(services.map(service => service.category || 'Uncategorized'));
    return Array.from(cats);
  }, [services]);

  
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


  const filteredServices = useMemo(() => {
    if (filter === "all") {
      return services;
    } else {
      return services.filter(service => (service.category || 'Uncategorized') === filter);
    }
  }, [services, filter]);

  return (
    <Card className="w-full border shadow-sm bg-white/70 backdrop-blur-sm">
      <CardHeader className="border-b bg-white/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span>Välj en tjänst</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrera efter kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kategorier</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {filter === "all" ? (
          <Tabs defaultValue={Object.keys(groupedServices)[0] || "uncategorized"} className="w-full">
            <TabsList className="mb-4 flex overflow-auto">
              {Object.keys(groupedServices).map(category => (
                <TabsTrigger key={category} value={category} className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(groupedServices).map(([category, services]) => (
              <TabsContent key={category} value={category} className="fade-in">
                <ServiceList 
                  services={services} 
                  selectedService={selectedService} 
                  onSelectService={onSelectService} 
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="fade-in">
            <div className="flex items-center mb-4 text-sm text-muted-foreground">
              <Tag className="h-4 w-4 mr-2 text-primary" />
              Visar tjänster i kategorin: <span className="font-medium ml-1">{filter}</span>
            </div>
            <ServiceList 
              services={filteredServices} 
              selectedService={selectedService} 
              onSelectService={onSelectService} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const ServiceList = ({
  services,
  selectedService,
  onSelectService,
}) => {
  return (
    <RadioGroup
      value={selectedService?.id || ""}
      onValueChange={(value) => {
        const service = services.find((s) => s.id === value);
        if (service) {
          onSelectService(service);
        }
      }}
      className="grid gap-4"
    >
      {services.map((service) => (
        <div
          key={service.id}
          className={`flex items-start space-x-3 rounded-md border p-4 cursor-pointer 
            transition-all duration-300 ease-in-out transform 
            hover:border-primary hover:shadow-lg hover:-translate-y-1
            ${selectedService?.id === service.id 
              ? 'border-primary bg-primary/10 shadow-md scale-[1.01]' 
              : 'bg-white/80 hover:bg-white/95'
            }`}
          onClick={() => onSelectService(service)}
        >
          <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
          <div className="flex-1">
            <div className="flex justify-between">
              <Label 
                htmlFor={service.id} 
                className="text-base font-medium cursor-pointer"
              >
                {service.name}
              </Label>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {service.category || "Uncategorized"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {service.description}
            </p>
            <div className="flex justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-sm flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration} minuter
              </span>
              <span className="font-medium text-primary">
                {service.price.toFixed(0)} SEK
              </span>
            </div>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};

export default ServiceSelector;
