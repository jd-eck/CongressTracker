import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterSectionProps {
  filters: {
    state: string;
    chamber: string;
    name: string;
  };
  onFiltersChange: (filters: { state: string; chamber: string; name: string }) => void;
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function FilterSection({ filters, onFiltersChange }: FilterSectionProps) {
  const [nameInput, setNameInput] = useState(filters.name);
  
  // Update filtered name after a delay
  useEffect(() => {
    const handler = setTimeout(() => {
      if (nameInput !== filters.name) {
        onFiltersChange({ ...filters, name: nameInput });
      }
    }, 500);
    
    return () => clearTimeout(handler);
  }, [nameInput, filters, onFiltersChange]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-neutral-400">
          Find Representatives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-neutral-300 mb-1">
            State
          </label>
          <Select
            value={filters.state}
            onValueChange={(value) => onFiltersChange({ ...filters, state: value })}
          >
            <SelectTrigger id="state" className="w-full">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="chamber" className="block text-sm font-medium text-neutral-300 mb-1">
            Chamber
          </label>
          <div className="flex space-x-2">
            <Button
              variant={filters.chamber === "senate" ? "default" : "outline"}
              className="flex-1"
              onClick={() => onFiltersChange({ ...filters, chamber: "senate" })}
            >
              Senate
            </Button>
            <Button
              variant={filters.chamber === "house" ? "default" : "outline"}
              className="flex-1"
              onClick={() => onFiltersChange({ ...filters, chamber: "house" })}
            >
              House
            </Button>
          </div>
        </div>
        
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-neutral-300 mb-1">
            Search by Name
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Enter name"
              className="pl-8"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
