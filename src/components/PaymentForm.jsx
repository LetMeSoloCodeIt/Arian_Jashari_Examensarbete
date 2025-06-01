import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const PaymentForm = ({ 
  amount, 
  onPaymentComplete, 
  onCancel 
}) => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const handlePayment = () => {
    setIsProcessing(true);
    

    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };
  
  const isFormValid = () => {
    if (paymentMethod === "card") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 && 
        cardName.trim().length > 3 && 
        expiryMonth && 
        expiryYear && 
        cvv.length === 3
      );
    } else {
      return phoneNumber.replace(/\s/g, "").length === 10;
    }
  };
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Betalning - {amount.toFixed(2)} SEK</h2>
      
      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => setPaymentMethod(value)}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem 
            value="card" 
            id="card" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="card"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="mb-2">Betalkort</span>
            <div className="flex space-x-1">
              <div className="h-6 w-9 rounded bg-[#1434CB] text-xs text-white flex items-center justify-center">VISA</div>
              <div className="h-6 w-9 rounded bg-[#252525] text-xs text-white flex items-center justify-center">MC</div>
            </div>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem 
            value="swish" 
            id="swish" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="swish"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="mb-2">Swish</span>
            <div className="h-6 w-12 rounded bg-[#F8C9D6] text-xs flex items-center justify-center font-bold text-[#412648]">swish</div>
          </Label>
        </div>
      </RadioGroup>
      
      {paymentMethod === "card" ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Kortnummer</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-name">Namn på kortet</Label>
              <Input
                id="card-name"
                placeholder="KALLE KARLSSON"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-month">Månad</Label>
                <Select
                  value={expiryMonth}
                  onValueChange={(value) => setExpiryMonth(value)}
                >
                  <SelectTrigger id="expiry-month">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      return (
                        <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                          {month.toString().padStart(2, "0")}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiry-year">År</Label>
                <Select
                  value={expiryYear}
                  onValueChange={(value) => setExpiryYear(value)}
                >
                  <SelectTrigger id="expiry-year">
                    <SelectValue placeholder="ÅÅ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={year.toString().slice(-2)}>
                          {year.toString().slice(-2)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  maxLength={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="phone-number">Mobiltelefonnummer</Label>
              <Input
                id="phone-number"
                placeholder="07X XXX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
              />
              <p className="text-sm text-muted-foreground">
                Du kommer att få en betalningsförfrågan via Swish-appen.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Avbryt
        </Button>
        <Button onClick={handlePayment} disabled={!isFormValid() || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Bearbetar...
            </>
          ) : (
            `Betala ${amount.toFixed(2)} SEK`
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm; 