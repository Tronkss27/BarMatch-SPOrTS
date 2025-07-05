# SPOrTS - API Documentation

## 🌐 Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.sports.app/api`

## 🔐 Autenticazione

L'API utilizza **JWT Bearer Tokens** per l'autenticazione.

### Headers Richiesti
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Ottenere Token
```bash
POST /api/auth/login
{
  "email": "demo@sports.it",
  "password": "demo123"
}

# Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "644f8b2d4c9d6500123456",
    "name": "Demo User",
    "email": "demo@sports.it",
    "role": "venue_owner"
  }
}
```

---

## 🔑 Authentication Endpoints

### POST `/auth/register`
Registrazione nuovo utente

**Request Body:**
```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "password": "password123",
  "role": "customer" // Optional: "customer" | "venue_owner" | "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "644f8b2d4c9d6500123456",
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "role": "customer"
  }
}
```

### POST `/auth/login`
Login utente esistente

**Request Body:**
```json
{
  "email": "demo@sports.it",
  "password": "demo123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "644f8b2d4c9d6500123456",
    "name": "Demo User",
    "email": "demo@sports.it",
    "role": "venue_owner"
  }
}
```

### GET `/auth/demo`
Login demo automatico

**Response:**
```json
{
  "success": true,
  "message": "Demo login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "644f8b2d4c9d6500123456",
    "name": "Demo User",
    "email": "demo@sports.it",
    "role": "venue_owner"
  }
}
```

### GET `/auth/me`
Profilo utente corrente

**Headers Required:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "644f8b2d4c9d6500123456",
    "name": "Demo User",
    "email": "demo@sports.it",
    "role": "venue_owner",
    "createdAt": "2024-06-03T10:30:00.000Z"
  }
}
```

---

## 🏟️ Venues Endpoints

### GET `/venues`
Lista di tutti i locali

**Query Parameters:**
- `page` (number): Numero pagina (default: 1)
- `limit` (number): Elementi per pagina (default: 20)
- `city` (string): Filtra per città
- `features` (string): Filtra per caratteristiche (comma-separated)
- `search` (string): Ricerca per nome/descrizione

**Example Request:**
```bash
GET /api/venues?page=1&limit=10&city=Milano&features=live_sports,multiple_screens
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "644f8b2d4c9d6500123456",
      "name": "Sports Bar Milano",
      "description": "Il miglior sports bar di Milano...",
      "location": {
        "address": {
          "street": "Via Torino 45",
          "city": "Milano",
          "postalCode": "20123",
          "country": "Italy"
        },
        "coordinates": {
          "latitude": 45.4642,
          "longitude": 9.1900
        }
      },
      "contact": {
        "email": "info@sportsbar.milano.it",
        "phone": "+39 02 1234567",
        "website": "https://sportsbar.milano.it"
      },
      "features": ["live_sports", "multiple_screens", "full_bar"],
      "capacity": {
        "total": 80,
        "tables": 60,
        "bar": 20
      },
      "analytics": {
        "averageRating": 4.2,
        "totalReviews": 23,
        "totalBookings": 145
      },
      "isCurrentlyOpen": true,
      "mainImage": "https://example.com/image.jpg",
      "slug": "sports-bar-milano-123456"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 27,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET `/venues/:id`
Dettagli specifico locale

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "644f8b2d4c9d6500123456",
    "name": "Sports Bar Milano",
    "description": "Il miglior sports bar di Milano...",
    "owner": {
      "id": "644f8b2d4c9d6500123457",
      "name": "Demo User",
      "email": "demo@sports.it"
    },
    "location": {
      "address": {
        "street": "Via Torino 45",
        "city": "Milano",
        "postalCode": "20123",
        "country": "Italy"
      },
      "coordinates": {
        "latitude": 45.4642,
        "longitude": 9.1900
      }
    },
    "hours": {
      "monday": { "open": "18:00", "close": "02:00", "closed": false },
      "tuesday": { "open": "18:00", "close": "02:00", "closed": false }
    },
    "features": ["live_sports", "multiple_screens", "full_bar"],
    "sportsOfferings": [
      {
        "sport": "calcio",
        "leagues": ["Serie A", "Champions League"],
        "isPrimary": true
      }
    ],
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "caption": "Main hall",
        "isMain": true
      }
    ],
    "pricing": {
      "basePrice": 0,
      "pricePerPerson": 0,
      "minimumSpend": 15,
      "currency": "EUR"
    },
    "bookingSettings": {
      "enabled": true,
      "requiresApproval": false,
      "advanceBookingDays": 30,
      "minimumPartySize": 1,
      "maximumPartySize": 10
    }
  }
}
```

### POST `/venues`
Crea nuovo locale (Solo venue_owner/admin)

**Headers Required:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Nuovo Sports Bar",
  "description": "Descrizione del locale...",
  "contact": {
    "email": "info@nuovo.it",
    "phone": "+39 02 9876543",
    "website": "https://nuovo.it"
  },
  "location": {
    "address": {
      "street": "Via Roma 100",
      "city": "Roma",
      "postalCode": "00186",
      "country": "Italy"
    },
    "coordinates": {
      "latitude": 41.9028,
      "longitude": 12.4964
    }
  },
  "capacity": {
    "total": 60,
    "tables": 45,
    "bar": 15
  },
  "features": ["live_sports", "outdoor_seating"],
  "hours": {
    "monday": { "open": "18:00", "close": "02:00", "closed": false }
  }
}
```

---

## ⚽ Fixtures Endpoints

### GET `/fixtures`
Lista partite sportive

**Query Parameters:**
- `page` (number): Numero pagina
- `limit` (number): Elementi per pagina
- `league` (string): ID lega specifica
- `team` (string): ID team specifico
- `status` (string): Stato partita ("scheduled", "live", "finished")
- `date` (string): Data specifica (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "644f8b2d4c9d6500123456",
      "fixtureId": "fix_001",
      "homeTeam": {
        "id": "team_001",
        "name": "Inter",
        "logo": "https://example.com/inter.png"
      },
      "awayTeam": {
        "id": "team_002", 
        "name": "Milan",
        "logo": "https://example.com/milan.png"
      },
      "league": {
        "id": "serie_a",
        "name": "Serie A",
        "country": "Italy",
        "season": "2024/25"
      },
      "date": "2024-06-06T20:00:00.000Z",
      "status": "scheduled",
      "venue": {
        "id": "ext_venue_001",
        "name": "San Siro",
        "city": "Milano"
      },
      "popularity": 9,
      "odds": {
        "home": 2.1,
        "draw": 3.2,
        "away": 3.8
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 87
  }
}
```

### GET `/fixtures/search`
Ricerca partite

**Query Parameters:**
- `query` (string): Termine di ricerca
- `league` (string): Filtra per lega
- `team` (string): Filtra per team

**Response:** Stesso formato di `/fixtures`

---

## 📅 Bookings Endpoints

### GET `/bookings`
Lista prenotazioni dell'utente corrente

**Headers Required:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "644f8b2d4c9d6500123456",
      "customer": {
        "name": "Mario Rossi",
        "email": "mario.rossi@email.it",
        "phone": "+39 333 1234567"
      },
      "venue": {
        "id": "644f8b2d4c9d6500123457",
        "name": "Sports Bar Milano",
        "location": {
          "address": {
            "street": "Via Torino 45",
            "city": "Milano"
          }
        }
      },
      "fixture": {
        "id": "644f8b2d4c9d6500123458",
        "homeTeam": { "name": "Inter" },
        "awayTeam": { "name": "Milan" },
        "date": "2024-06-06T20:00:00.000Z"
      },
      "date": "2024-06-06T20:00:00.000Z",
      "timeSlot": {
        "start": "20:00",
        "end": "23:00"
      },
      "partySize": 4,
      "status": "confirmed",
      "confirmationCode": "SPT123ABC",
      "totalAmount": 60,
      "notes": "Mesa vicino allo schermo principale"
    }
  ]
}
```

### POST `/bookings`
Crea nuova prenotazione

**Request Body:**
```json
{
  "venueId": "644f8b2d4c9d6500123456",
  "fixtureId": "644f8b2d4c9d6500123457", // Optional
  "customer": {
    "name": "Mario Rossi",
    "email": "mario.rossi@email.it",
    "phone": "+39 333 1234567"
  },
  "date": "2024-06-06T20:00:00.000Z",
  "timeSlot": {
    "start": "20:00",
    "end": "23:00"
  },
  "partySize": 4,
  "notes": "Mesa vicino allo schermo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "644f8b2d4c9d6500123456",
    "confirmationCode": "SPT123ABC",
    "status": "confirmed",
    "totalAmount": 60
  }
}
```

### GET `/bookings/:id`
Dettagli prenotazione specifica

### PUT `/bookings/:id`
Modifica prenotazione

### DELETE `/bookings/:id`
Cancella prenotazione

---

## 🎯 Offers Endpoints

### GET `/offers`
Lista offerte attive

**Query Parameters:**
- `venueId` (string): Filtra per locale specifico
- `type` (string): Tipo offerta
- `active` (boolean): Solo offerte attive

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "644f8b2d4c9d6500123456",
      "title": "Happy Hour Weekend",
      "description": "Sconto 30% su tutte le bevande...",
      "venue": {
        "id": "644f8b2d4c9d6500123457",
        "name": "Sports Bar Milano"
      },
      "type": "percentage",
      "discount": {
        "value": 30,
        "unit": "percentage"
      },
      "validFrom": "2024-06-01T00:00:00.000Z",
      "validUntil": "2024-06-30T23:59:59.000Z",
      "timeRestrictions": {
        "daysOfWeek": [5, 6],
        "startTime": "18:00",
        "endTime": "21:00"
      },
      "status": "active",
      "analytics": {
        "totalRedemptions": 15,
        "totalSavings": 450
      }
    }
  ]
}
```

### POST `/offers`
Crea nuova offerta (Solo venue_owner per propri locali)

**Request Body:**
```json
{
  "title": "Promo Calcio",
  "description": "Sconto durante le partite",
  "venueId": "644f8b2d4c9d6500123456",
  "type": "percentage",
  "discount": {
    "value": 20,
    "unit": "percentage"
  },
  "validFrom": "2024-06-01T00:00:00.000Z",
  "validUntil": "2024-06-30T23:59:59.000Z",
  "limits": {
    "usagePerCustomer": 1,
    "maxTotalUsage": 100
  }
}
```

---

## ⭐ Reviews Endpoints

### GET `/reviews`
Lista recensioni

**Query Parameters:**
- `venueId` (string): Filtra per locale
- `rating` (number): Filtra per rating minimo
- `status` (string): Stato recensione

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "644f8b2d4c9d6500123456",
      "venue": {
        "id": "644f8b2d4c9d6500123457",
        "name": "Sports Bar Milano"
      },
      "customer": {
        "name": "Giuseppe Verdi",
        "isVerified": true
      },
      "rating": {
        "overall": 5,
        "food": 4,
        "service": 5,
        "atmosphere": 5,
        "value": 4
      },
      "title": "Fantastico per vedere le partite!",
      "content": "Locale fantastico con maxischermo gigante...",
      "visitDate": "2024-05-27T00:00:00.000Z",
      "partySize": 3,
      "status": "approved",
      "createdAt": "2024-05-28T10:00:00.000Z"
    }
  ]
}
```

### POST `/reviews`
Crea nuova recensione

**Request Body:**
```json
{
  "venueId": "644f8b2d4c9d6500123456",
  "customer": {
    "name": "Mario Rossi",
    "email": "mario@example.com"
  },
  "rating": {
    "overall": 4,
    "food": 4,
    "service": 5,
    "atmosphere": 4,
    "value": 4
  },
  "title": "Ottima esperienza",
  "content": "Locale carino e staff gentile...",
  "visitDate": "2024-06-01T00:00:00.000Z",
  "partySize": 2
}
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "statusCode": 400
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not exists)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Rate Limiting
- **General APIs**: 100 requests/15 minutes
- **Auth APIs**: 5 requests/15 minutes per IP
- **Headers Returned**:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1623456789
  ```

---

## 🔧 Utility Endpoints

### GET `/health`
Health check del server

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-03T11:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### GET `/status`
Status dettagliato del sistema

---

## 📖 SDK Examples

### JavaScript/Node.js
```javascript
// Install: npm install axios

const axios = require('axios')

class SportsAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.client = axios.create({ baseURL })
    this.token = null
  }

  async login(email, password) {
    const response = await this.client.post('/auth/login', {
      email, password
    })
    this.token = response.data.token
    this.client.defaults.headers.Authorization = `Bearer ${this.token}`
    return response.data
  }

  async getVenues(params = {}) {
    const response = await this.client.get('/venues', { params })
    return response.data
  }

  async createBooking(bookingData) {
    const response = await this.client.post('/bookings', bookingData)
    return response.data
  }
}

// Usage
const api = new SportsAPI()
await api.login('demo@sports.it', 'demo123')
const venues = await api.getVenues({ city: 'Milano' })
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@sports.it","password":"demo123"}'

# Get venues
curl -X GET "http://localhost:5000/api/venues?city=Milano" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": "644f8b2d4c9d6500123456",
    "customer": {
      "name": "Mario Rossi",
      "email": "mario@example.com",
      "phone": "+39 333 1234567"
    },
    "date": "2024-06-06T20:00:00.000Z",
    "timeSlot": {"start": "20:00", "end": "23:00"},
    "partySize": 4
  }'
```

---

## 📋 Changelog

### Version 1.0.0
- Initial API release
- Authentication system
- CRUD operations for all main entities
- Search and filtering capabilities
- Rate limiting and security measures 