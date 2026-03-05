# DRIVEDEAL Backend API

Backend server for DRIVEDEAL contact form and admin panel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `backend` directory (you can copy `env.example`) with the following configuration:
```bash
# Admin email address to receive enquiry notifications
ADMIN_EMAIL=drivedeal@gmail.com

# Gmail SMTP Configuration for sending enquiry emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password

# Optional: enable SMTP debug logs in console
SMTP_DEBUG=false

# Server Port (optional, defaults to 5000)
PORT=5000
NODE_ENV=development
```

**Important:** For Gmail SMTP, you need to use an App Password, not your regular password:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to Security > App passwords
4. Generate a new app password for "Mail"
5. Use that 16-character password as `SMTP_PASS`

3. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /api/contact
Submit a contact form enquiry.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "message": "I'm interested in a car"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! We will contact you soon.",
  "data": { ... }
}
```

### GET /api/enquiries
Get all enquiries (for admin panel).

**Response:**
```json
{
  "success": true,
  "data": [ ... ]
}
```

### GET /api/health
Health check endpoint.

## Notes

- Currently uses in-memory storage
- In production, replace with a database (MongoDB, PostgreSQL, etc.)
- Add email/SMS notification service integration
- Add authentication for admin endpoints

