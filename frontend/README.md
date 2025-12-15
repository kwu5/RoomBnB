# RoomBnB Frontend

The frontend application for RoomBnB, an Airbnb clone built for educational and portfolio purposes.

## Tech Stack

- **Framework**: Vite + React 19
- **Language**: TypeScript
- **Routing**: React Router v7
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (planned)
- **State Management**: Zustand (global) + React Query (server state) - planned
- **Forms**: React Hook Form + Zod (planned)
- **HTTP Client**: Axios
- **Maps**: Mapbox GL JS (planned)
- **Payments**: Stripe.js (planned)
- **Date Handling**: date-fns (planned)

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components (Home, Listing, Profile, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer (axios instances)
│   ├── types/           # TypeScript type definitions
│   ├── store/           # Zustand stores
│   ├── utils/           # Helper functions
│   ├── lib/             # Third-party library configs
│   ├── App.tsx          # Main app component
│   └── main.tsx         # App entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_MAPBOX_TOKEN=your_mapbox_token
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Core Features

### Implemented
- Basic React app setup with Vite
- TypeScript configuration
- TailwindCSS styling
- React Router for navigation
- Navbar component
- Home page

### Planned
- User authentication (login/register)
- Property listings & search
- Property detail pages
- Booking system with calendar
- User profiles
- Favorites/wishlists
- Reviews & ratings
- Real-time messaging
- Payment integration with Stripe
- Map-based property search

## Development Workflow

1. Create feature branches for new features
2. Follow conventional commit messages (feat, fix, chore, etc.)
3. Use TypeScript types for all props and state
4. Keep components modular and reusable
5. Use TailwindCSS for styling

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_MAPBOX_TOKEN` | Mapbox API token for maps | No (for map features) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | No (for payments) |

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready to be deployed to platforms like Vercel or Netlify.

## Related Documentation

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

## License

This project is created for educational and portfolio purposes only. Not affiliated with Airbnb, Inc.
