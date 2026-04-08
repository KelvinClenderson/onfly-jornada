export const mockUser = {
  name: "Ana Carolina",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
  tripCount: 12,
};

export const mockEvents = [
  {
    id: "evt-1",
    title: "Web Summit Lisboa 2025",
    date: "2025-06-14T09:00:00",
    endDate: "2025-06-16T18:00:00",
    location: "Lisboa, Portugal",
    type: "conference" as const,
    daysUntil: 5,
  },
  {
    id: "evt-2",
    title: "Reunião com Parceiros LATAM",
    date: "2025-06-20T14:00:00",
    endDate: "2025-06-20T17:00:00",
    location: "Buenos Aires, Argentina",
    type: "meeting" as const,
    daysUntil: 11,
  },
  {
    id: "evt-3",
    title: "Training Workshop SAP",
    date: "2025-07-02T08:00:00",
    endDate: "2025-07-04T17:00:00",
    location: "São Paulo, SP",
    type: "training" as const,
    daysUntil: 23,
  },
];

export const mockCards = [
  {
    index: 0,
    badge: "MELHOR PREÇO",
    badgeColor: "success",
    flight: {
      airline: "LATAM",
      code: "LA8042",
      from: "GRU",
      to: "LIS",
      duration: "14h30",
      type: "direto",
      departure: "23:10",
      arrival: "13:40+1",
    },
    hotel: {
      name: "Bairro Alto Hotel",
      stars: 5,
      distance: "0.3km do evento",
    },
    transport: {
      type: "Uber Comfort",
      price: "R$ 38",
      description: "do aeroporto",
    },
    total: "R$ 4.280",
    reasoning:
      "Este é o voo mais econômico com boa avaliação. O hotel fica a poucos metros do evento e o Uber Comfort oferece boa relação custo-benefício. Economia de 22% em relação à média das suas últimas viagens para Europa.",
  },
  {
    index: 1,
    badge: "MAIS RÁPIDO",
    badgeColor: "accent",
    flight: {
      airline: "TAP",
      code: "TP0088",
      from: "GRU",
      to: "LIS",
      duration: "9h45",
      type: "direto",
      departure: "17:30",
      arrival: "07:15+1",
    },
    hotel: {
      name: "Hotel Avenida Palace",
      stars: 4,
      distance: "0.8km do evento",
    },
    transport: {
      type: "Transfer privativo",
      price: "R$ 120",
      description: "do aeroporto",
    },
    total: "R$ 5.150",
    reasoning:
      "Voo mais curto disponível, chegando pela manhã com tempo de sobra. Hotel clássico e bem localizado. Transfer privativo garante pontualidade. Ideal se você valoriza tempo de descanso antes do evento.",
  },
  {
    index: 2,
    badge: "MAIS CONFORTO",
    badgeColor: "primary",
    featured: true,
    flight: {
      airline: "LATAM",
      code: "LA8042",
      from: "GRU",
      to: "LIS",
      duration: "14h30",
      type: "business",
      departure: "23:10",
      arrival: "13:40+1",
    },
    hotel: {
      name: "Four Seasons Ritz",
      stars: 5,
      distance: "1.2km do evento",
    },
    transport: {
      type: "Uber Black",
      price: "R$ 55",
      description: "do aeroporto",
    },
    total: "R$ 8.420",
    reasoning:
      "Baseado nas suas últimas viagens, você costuma voar LATAM e preferiu hotéis boutique no centro. Este plano mantém essas preferências com upgrade para business class, garantindo descanso total no voo noturno. O Four Seasons é referência em Lisboa.",
  },
];

export const mockLogs = [
  "Analisando suas 12 viagens anteriores...",
  "Preferência detectada: LATAM, categoria business",
  "Buscando voos para São Paulo → Lisboa...",
  "Consultando hotéis 4★+ próximos ao local do evento...",
  "Verificando condições climáticas em Lisboa...",
  "Aplicando política de viagens da empresa...",
  "Montando suas recomendações...",
];

export const mockAlert = {
  severity: "warn" as const,
  message: "Previsão de chuva forte em Lisboa nos dias 14–15. Leve guarda-chuva.",
  details:
    "A previsão meteorológica indica precipitação acima de 30mm para os dias 14 e 15 de junho em Lisboa. Temperaturas entre 16°C e 22°C. Recomendamos levar agasalho leve e guarda-chuva.",
};

export const mockMetrics = {
  acceptRate: { value: 68, trend: 5.2 },
  avgReloads: { value: 0.4, data: [0.8, 0.6, 0.5, 0.4, 0.3, 0.4] },
  abandonRate: { value: 12, previous: 18 },
  customizationRate: { value: 23, total: 580 },
  funnel: [
    { stage: "Hook exibido", value: 1240, pct: 100 },
    { stage: "Jornada iniciada", value: 892, pct: 72 },
    { stage: "Cards exibidos", value: 810, pct: 65 },
    { stage: "Opção escolhida", value: 631, pct: 51 },
    { stage: "Reserva fechada", value: 580, pct: 47 },
  ],
  sessions: [
    { user: "user_***4a2", destination: "Lisboa", option: "Melhor Preço", reloads: 0, status: "confirmed", timestamp: "2025-06-09 14:32" },
    { user: "user_***8f1", destination: "Buenos Aires", option: "Mais Conforto", reloads: 1, status: "confirmed", timestamp: "2025-06-09 13:15" },
    { user: "user_***2c7", destination: "Miami", option: "-", reloads: 3, status: "abandoned", timestamp: "2025-06-09 12:48" },
    { user: "user_***9d3", destination: "São Paulo", option: "Mais Rápido", reloads: 0, status: "confirmed", timestamp: "2025-06-09 11:20" },
    { user: "user_***1e5", destination: "Lisboa", option: "Melhor Preço", reloads: 1, status: "confirmed", timestamp: "2025-06-09 10:05" },
    { user: "user_***6b8", destination: "Madrid", option: "Mais Conforto", reloads: 0, status: "confirmed", timestamp: "2025-06-08 16:42" },
  ],
};
