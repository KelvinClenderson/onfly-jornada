import { supabase } from '@/integrations/supabase/client';

export interface FlightSearchParams {
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  travelers: Array<{
    birthday: string;
    travelerEntityId: string;
  }>;
}

export interface HotelSearchParams {
  checkIn: string;
  checkOut: string;
  destination: {
    type: 'cityId';
    value: string;
  };
  travelers: Array<{
    birthday: string;
    roomIndex: number;
    travelerEntityId: string;
  }>;
}

export interface FlightLeg {
  departure: {
    iata: string;
    city: string;
    date: string;
  };
  arrival: {
    iata: string;
    city: string;
    date: string;
  };
  duration: string;
  segments: Array<{
    departure: {
      iata: string;
      city: string;
      date: string;
    };
    arrival: {
      iata: string;
      city: string;
      date: string;
    };
    duration: string;
    flightNumber: string;
    aircraft: string;
  }>;
}

export interface FlightFare {
  fareId: string;
  family: 'LIGHT' | 'PLUS' | 'TOP' | 'PREMIUM';
  businessClass?: string;
  cheapestTotalPrice: number;
  includedServices: Array<{
    icon: string;
    description: string;
  }>;
  penalties: {
    cancellation: boolean;
    change: boolean;
  };
  ciaManaging: {
    name: string;
    code: string;
    imageUrl: string;
  };
}

export interface FlightResult {
  legs: FlightLeg[];
  fares: FlightFare[];
}

export interface HotelResult {
  hotelId: string;
  name: string;
  stars: number;
  address: {
    addressLine: string;
    city: string;
    country: string;
  };
  imageUrl: string;
  amenities: string[];
  breakfast: boolean;
  cheapestPrice: number;
  cheapestDailyPrice: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SearchResults {
  flights: FlightResult[];
  hotels: HotelResult[];
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightResult[]> {
  const { data, error } = await supabase.functions.invoke('quote-search', {
    body: {
      type: 'flight',
      params
    }
  });

  if (error) {
    console.error('Error searching flights:', error);
    throw error;
  }

  return data?.results || [];
}

export async function searchHotels(params: HotelSearchParams): Promise<HotelResult[]> {
  const { data, error } = await supabase.functions.invoke('quote-search', {
    body: {
      type: 'hotel',
      params
    }
  });

  if (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }

  return data?.results || [];
}