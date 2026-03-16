# AP AUTO CARE - Smart Second-Hand Car Sales Management System

## Project Structure

```
SECOND-HAND CAR/
├── src/                    # Frontend React application
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth, Language)
│   ├── App.jsx
│   └── main.jsx
├── backend/               # Backend API server
│   ├── server.js         # Express server
│   ├── package.json
│   └── README.md
├── package.json          # Frontend dependencies
└── vite.config.js        # Vite configuration
```

## Getting Started

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
```

4. Start backend server:
```bash
npm run dev
```

Backend will run on: `http://localhost:5000`

## Features

- Modern, clean UI design
- Multi-language support (English, Tamil, Kannada, Telugu)
- Contact form with backend integration
- Responsive design
- Lottie animations
- Admin panel ready

## API Endpoints

- `POST /api/contact` - Submit contact form
- `GET /api/enquiries` - Get all enquiries (admin)
- `GET /api/health` - Health check

