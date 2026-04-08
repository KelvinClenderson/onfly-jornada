import type { FlightResult, HotelResult, FlightFare, FlightLeg } from './quote-search';

export interface TravelPackage {
  id: string;
  name: string;
  badge: {
    label: string;
    className: string;
  };
  highlight: boolean;
  flight: {
    fare: FlightFare;
    leg: FlightLeg;
  };
  hotel: HotelResult;
  totalPrice: number;
  explanation: string;
}

function calculateFlightDurationInMinutes(duration: string): number {
  const parts = duration.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function assemblePackages(
  flights: FlightResult[],
  hotels: HotelResult[]
): TravelPackage[] {
  if (!flights.length || !hotels.length) {
    return [];
  }

  const packages: TravelPackage[] = [];

  const allFares = flights.flatMap(f =>
    f.fares.map(fare => ({ fare, leg: f.legs[0] }))
  );

  const cheapestFlight = allFares.reduce((min, current) =>
    current.fare.cheapestTotalPrice < min.fare.cheapestTotalPrice ? current : min
  );

  const cheapestHotel = hotels.reduce((min, current) =>
    current.cheapestPrice < min.cheapestPrice ? current : min
  );

  packages.push({
    id: 'best-price',
    name: 'Melhor Preço',
    badge: {
      label: 'Mais econômico',
      className: 'bg-[#00A86B1A] text-[#00A86B]'
    },
    highlight: false,
    flight: cheapestFlight,
    hotel: cheapestHotel,
    totalPrice: cheapestFlight.fare.cheapestTotalPrice + cheapestHotel.cheapestPrice,
    explanation: 'Este pacote oferece a combinação mais econômica, perfeito para quem busca otimizar o orçamento sem abrir mão da qualidade. Selecionamos o voo e hotel com os melhores preços disponíveis.'
  });

  const fastestFlight = allFares.reduce((min, current) => {
    const currentDuration = calculateFlightDurationInMinutes(current.leg.duration);
    const minDuration = calculateFlightDurationInMinutes(min.leg.duration);
    return currentDuration < minDuration ? current : min;
  });

  const cityCenterCoordinates = { lat: -23.5505, lon: -46.6333 };

  const closestHotel = hotels.filter(h => h.coordinates).reduce((closest, current) => {
    if (!current.coordinates) return closest;
    if (!closest.coordinates) return current;

    const currentDistance = calculateDistance(
      cityCenterCoordinates.lat,
      cityCenterCoordinates.lon,
      current.coordinates.latitude,
      current.coordinates.longitude
    );

    const closestDistance = calculateDistance(
      cityCenterCoordinates.lat,
      cityCenterCoordinates.lon,
      closest.coordinates.latitude,
      closest.coordinates.longitude
    );

    return currentDistance < closestDistance ? current : closest;
  }, hotels.find(h => h.coordinates) || hotels[0]);

  packages.push({
    id: 'fastest',
    name: 'Mais Rápido',
    badge: {
      label: 'Menos tempo de viagem',
      className: 'bg-[#0078D41A] text-[#0078D4]'
    },
    highlight: false,
    flight: fastestFlight,
    hotel: closestHotel,
    totalPrice: fastestFlight.fare.cheapestTotalPrice + closestHotel.cheapestPrice,
    explanation: 'Ideal para quem valoriza o tempo. Este pacote minimiza a duração total da viagem, com o voo mais rápido e hotel próximo ao centro.'
  });

  const businessClassFlight = allFares.find(f => f.fare.businessClass === 'J');
  const premiumFlight = businessClassFlight ||
    allFares.find(f => f.fare.family === 'PREMIUM' || f.fare.family === 'TOP') ||
    allFares.reduce((max, current) =>
      current.fare.cheapestTotalPrice > max.fare.cheapestTotalPrice ? current : max
    );

  const comfortHotel = hotels.reduce((best, current) => {
    if (current.stars > best.stars) return current;
    if (current.stars === best.stars && current.breakfast && !best.breakfast) return current;
    if (current.stars === best.stars && current.breakfast === best.breakfast &&
        current.cheapestPrice > best.cheapestPrice) return current;
    return best;
  });

  packages.push({
    id: 'comfort',
    name: 'Mais Conforto',
    badge: {
      label: 'Premium',
      className: 'bg-[#0078D4] text-white'
    },
    highlight: true,
    flight: premiumFlight,
    hotel: comfortHotel,
    totalPrice: premiumFlight.fare.cheapestTotalPrice + comfortHotel.cheapestPrice,
    explanation: 'A escolha premium para quem busca a melhor experiência. Inclui classe executiva ou tarifas superiores, hotéis com mais estrelas e serviços diferenciados.'
  });

  return packages;
}