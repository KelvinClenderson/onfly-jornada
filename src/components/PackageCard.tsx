import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, MapPin, Briefcase, Coffee, Star, Check, X, Plane } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { TravelPackage } from '@/lib/journey-packages';

interface PackageCardProps {
  package: TravelPackage;
  onSelect: (packageId: string) => void;
  index: number;
}

export function PackageCard({ package: pkg, onSelect, index }: PackageCardProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const stopsCount = pkg.flight.leg.segments.length - 1;
  const stopsText = stopsCount === 0 ? 'Voo direto' : `${stopsCount} parada${stopsCount > 1 ? 's' : ''}`;

  const cardClassName = pkg.highlight
    ? 'border-2 border-[#0078D4] shadow-[0_0_0_3px_#C7E0F4]'
    : 'border border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <Card className={`h-full flex flex-col ${cardClassName}`}>
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
              <Badge className={`mt-2 ${pkg.badge.className}`}>
                {pkg.badge.label}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total do pacote</p>
              <p className="text-2xl font-bold text-[#0078D4]">
                {formatCurrency(pkg.totalPrice)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-[#0078D4]" />
              <h4 className="font-semibold text-gray-900">Voo</h4>
            </div>

            <div className="flex items-center gap-4">
              {pkg.flight.fare.ciaManaging.imageUrl && (
                <img
                  src={pkg.flight.fare.ciaManaging.imageUrl}
                  alt={pkg.flight.fare.ciaManaging.name}
                  className="h-8 w-auto"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {pkg.flight.leg.departure.iata} → {pkg.flight.leg.arrival.iata}
                </p>
                <p className="text-sm text-gray-600">
                  {pkg.flight.leg.departure.city} → {pkg.flight.leg.arrival.city}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Partida</p>
                <p className="font-medium">{formatTime(pkg.flight.leg.departure.date)}</p>
                <p className="text-xs text-gray-500">{formatDate(pkg.flight.leg.departure.date)}</p>
              </div>
              <div>
                <p className="text-gray-600">Chegada</p>
                <p className="font-medium">{formatTime(pkg.flight.leg.arrival.date)}</p>
                <p className="text-xs text-gray-500">{formatDate(pkg.flight.leg.arrival.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{pkg.flight.leg.duration}</span>
              </div>
              <Badge variant="secondary">{stopsText}</Badge>
              <Badge variant="outline">{pkg.flight.fare.family}</Badge>
            </div>

            {pkg.flight.fare.includedServices && pkg.flight.fare.includedServices.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Serviços incluídos:</p>
                <div className="space-y-1">
                  {pkg.flight.fare.includedServices.slice(0, 3).map((service, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-3 w-3 text-green-600" />
                      <span>{service.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              {pkg.flight.fare.penalties.cancellation ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Cancelamento permitido</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-4 w-4" />
                  <span>Sem cancelamento</span>
                </div>
              )}
              {pkg.flight.fare.penalties.change ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Alteração permitida</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <X className="h-4 w-4" />
                  <span>Sem alteração</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#0078D4]" />
              <h4 className="font-semibold text-gray-900">Hotel</h4>
            </div>

            {pkg.hotel.imageUrl && (
              <img
                src={pkg.hotel.imageUrl}
                alt={pkg.hotel.name}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{pkg.hotel.name}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: pkg.hotel.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <p className="text-sm text-gray-600">{pkg.hotel.address.addressLine}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {pkg.hotel.breakfast && (
                <Badge className="bg-green-100 text-green-700">
                  <Coffee className="h-3 w-3 mr-1" />
                  Café da manhã incluído
                </Badge>
              )}
              {pkg.hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <Badge key={idx} variant="outline">{amenity}</Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Preço por noite</p>
                <p className="font-medium">{formatCurrency(pkg.hotel.cheapestDailyPrice)}</p>
              </div>
              <div>
                <p className="text-gray-600">Total hospedagem</p>
                <p className="font-medium">{formatCurrency(pkg.hotel.cheapestPrice)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <button
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="flex items-center gap-2 text-sm font-medium text-[#0078D4] hover:text-[#106ebe] transition-colors"
            >
              Por que este plano?
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isExplanationOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isExplanationOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 text-sm text-gray-600">
                    {pkg.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => onSelect(pkg.id)}
            className="w-full bg-[#0078D4] hover:bg-[#106ebe] text-white"
            size="lg"
          >
            Escolher este plano →
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}