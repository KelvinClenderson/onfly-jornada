export const MOCK_USER = {
  id: "usr_onfly_4821",
  name: "Edson Hackathon",
  email: "edson.hackathon@onfly.com.br",
  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Edson+Hackathon&backgroundColor=0078D4&textColor=ffffff",
  company: "Onfly Tecnologia",
  role: "Analista de Viagens",
  tripCount: 12,
  onfly_jwt: "mock_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockpayload.mocksignature",
  preferences: {
    preferredAirline: "LATAM",
    flightClass: "economy",
    hotelCategory: 4,
    transport: "uber"
  }
};

export type MockUser = typeof MOCK_USER;
