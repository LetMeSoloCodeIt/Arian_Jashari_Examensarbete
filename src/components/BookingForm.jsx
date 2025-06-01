import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, FileText } from "lucide-react";


const formSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  email: z.string().email("Ogiltig e-postadress"),
  phone: z.string().min(6, "Telefonnummer krävs"),
  notes: z.string().optional(),
});

const BookingForm = ({ onSubmit, isLoading = false }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  return (
    <Card className="w-full border shadow-md bg-white/80 backdrop-blur-md transition-all duration-300">
      <CardHeader className="border-b bg-white/60">
        <CardTitle className="text-lg">Dina uppgifter</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-primary/80" />
                    Fullständigt namn
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Sven Svensson" 
                      {...field} 
                      className="transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-primary/80" />
                    E-post
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="sven@exempel.se" 
                      type="email" 
                      {...field} 
                      className="transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-primary/80" />
                    Telefonnummer
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="070-123 45 67" 
                      {...field} 
                      className="transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-primary/80" />
                    Ytterligare information (Valfritt)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Särskilda önskemål eller information..."
                      {...field}
                      className="min-h-[100px] transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full mt-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Bekräftar bokning...</span>
                </div>
              ) : (
                "Bekräfta bokning"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
