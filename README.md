# Toiletree: A Community-Driven Public Toilet Finder for Bangladesh

![Toiletree App](https://i.imgur.com/your-image-url.png) <!-- Add your app screenshots here -->

**Toiletree** is a React Native mobile application designed to address a critical public health and social issue in Bangladesh known as \"The Hidden Thirst.\" By providing a reliable, crowd-sourced map of public toilets, the app empowers users, especially women, to move freely in public spaces without compromising their health or dignity.

This project was developed as a submission for the **PTIB Civic Tech Challenge 2025**.

---

## The Problem: \"The Hidden Thirst\"

In many urban areas of Bangladesh, the scarcity of safe, clean, and accessible public toilets forces citizensâ€”predominantly womenâ€”to deliberately restrict their water intake. This coping mechanism leads to a silent epidemic of chronic dehydration, urinary tract infections (UTIs), kidney disease, and other severe health complications. It's a significant barrier to female participation in education, the workforce, and public life.

## The Solution: Toiletree

Toiletree tackles this challenge by putting the power of information directly into the hands of the community. It's a simple, intuitive platform to:

* **FIND:** Instantly locate nearby public toilets using an interactive map.
* **VERIFY:** Check the quality, cleanliness, and safety of a toilet through community ratings and reviews.
* **CONTRIBUTE:** Easily add new, unlisted toilets to the map, complete with photos, location, and key features.

---

## ðŸŒŸ Key Features

### Guest Features (No Sign-up Required)

* **Browse Without Account:** Immediately access the map and list of toilets without creating an account
* **Interactive Map View:** Toilets displayed as markers on a map centered on your location
* **Detailed List View:** Scrollable list of nearby toilets with photos, names, addresses, and ratings
* **Toilet Details:** View comprehensive information including:
  * Photo gallery
  * Average user rating (1-5 stars)
  * Feature tags (Female Friendly, Water Available, Paid)
  * Full address and location
  * Community reviews and ratings

### User Features (Sign-up Required)

* **Secure Authentication:** Create an account with email and password validation
* **Submit New Toilets:** Guided two-step submission process:
  1. Select location on an interactive map
  2. Fill in details (name, address, features) and upload photos
* **Rate & Review:** 
  * Rate toilets on a 5-star scale (one rating per user per toilet)
  * Write detailed reviews to help others
* **Report Issues:** Report problems like closures, cleanliness issues, or incorrect information
* **Profile Management:** 
  * View your profile and activity
  * Access settings
  * Request account deletion

### Admin Features

* **Admin Dashboard:** Comprehensive management interface with three tabs:
  * **Submissions:** Review, approve, or reject new toilet submissions with photos and feature tags
  * **Reports:** Manage user-reported issues (closures, cleanliness, etc.)
  * **Deletions:** Process user account deletion requests
* **Data Quality:** Ensure all submissions meet quality standards before appearing on the map

### Additional Features

* **Settings Screen:** Access to:
  * About Toiletree
  * Privacy Policy
  * Terms of Service
  * Send Feedback (email)
  * Delete Account
* **Feature Tags:** Every toilet can be tagged with:
  * â™€ï¸ Female Friendly - Suitable facilities for women
  * ðŸ’§ Water Available - Handwashing or drinking water access
  * ðŸ’° Paid - Requires payment to use
* **Photo Uploads:** Users can upload photos when submitting toilets (stored securely in Supabase Storage)

---

## ðŸ› ï¸ Technology Stack

### Frontend

* **React Native 0.81.5** with **Expo SDK 54.0.0**
* **TypeScript** for type safety
* **NativeWind 4.2.1** (Tailwind CSS for React Native) for styling
* **React Navigation 7.x** for navigation (Stack & Bottom Tab navigators)
* **react-native-maps 1.20.1** for interactive map interface
* **@expo/vector-icons** (MaterialCommunityIcons) for icons
* **expo-linear-gradient** for enhanced UI gradients

### Backend & Services

* **Supabase** as Backend-as-a-Service:
  * **PostgreSQL Database** - Stores all app data with Row Level Security (RLS)
  * **Authentication** - Handles user sign-up, login, and session management
  * **Storage** - Hosts user-uploaded toilet photos in a public bucket
  * **Database Triggers** - Automatically calculate average ratings when ratings change
* **Expo Location** - For GPS location services
* **Expo Image Picker** - For photo capture and selection

### Key Libraries

* @supabase/supabase-js - Supabase client library
* 
eact-native-gesture-handler - Touch gesture handling
* 
eact-native-reanimated - Smooth animations
* 
eact-native-safe-area-context - Safe area handling
* expo-file-system - File operations for photo uploads

---

## ðŸš€ Getting Started

### Prerequisites

* **Node.js** (LTS version recommended - v18 or higher)
* **npm** or **yarn**
* **Expo Go app** installed on your iOS or Android device (for development)
* **Supabase account** (free tier works fine)

### Installation & Setup

1. **Clone the Repository**
   `ash
   git clone https://github.com/your-username/toiletree.git
   cd toiletree
   `

2. **Install Dependencies**
   `ash
   npm install
   `

3. **Set Up Supabase**
   * Create a new project at [supabase.com](https://supabase.com)
   * Go to SQL Editor and run the supabase-schema.sql file to create all tables, policies, and triggers
   * Run any migration files in the migrations/ folder if needed
   * Create a storage bucket named 	oilet-photos (set as public)

4. **Configure Environment Variables**
   * Create a .env file in the root directory:
     `env
     EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
     `
   * Find these values in your Supabase project's Settings â†’ API

5. **Start the Development Server**
   `ash
   npx expo start --clear
   `

6. **Launch the App**
   * Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)
   * The app will load on your device

### Creating Your First Admin User

After setting up Supabase and creating your first account:

1. Sign up through the app
2. Go to your Supabase dashboard â†’ Table Editor â†’ profiles
3. Find your user ID and set is_admin to 	rue
4. Reload the app - you'll now have access to the Admin Dashboard

---

## ðŸ“ Project Structure

`
toiletree/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/          # Reusable UI components
â”‚   â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”œâ”€â”€ LoadingSpinner.tsx
â”‚   â”‚   â”œâ”€â”€ ReviewItem.tsx
â”‚   â”‚   â””â”€â”€ StarRating.tsx
â”‚   â”œâ”€â”€ context/             # React Context providers
â”‚   â”‚   â””â”€â”€ AuthContext.tsx
â”‚   â”œâ”€â”€ hooks/               # Custom React hooks
â”‚   â”‚   â””â”€â”€ useAuthRedirect.ts
â”‚   â”œâ”€â”€ navigation/          # Navigation configuration
â”‚   â”‚   â”œâ”€â”€ index.tsx
â”‚   â”‚   â””â”€â”€ types.ts
â”‚   â”œâ”€â”€ screens/             # App screens
â”‚   â”‚   â”œâ”€â”€ LoginScreen.tsx
â”‚   â”‚   â”œâ”€â”€ SignupScreen.tsx
â”‚   â”‚   â”œâ”€â”€ MapScreen.tsx
â”‚   â”‚   â”œâ”€â”€ ToiletListScreen.tsx
â”‚   â”‚   â”œâ”€â”€ ToiletDetailsScreen.tsx
â”‚   â”‚   â”œâ”€â”€ SubmitToiletScreen.tsx
â”‚   â”‚   â”œâ”€â”€ SelectLocationScreen.tsx
â”‚   â”‚   â”œâ”€â”€ ProfileScreen.tsx
â”‚   â”‚   â”œâ”€â”€ SettingsScreen.tsx
â”‚   â”‚   â”œâ”€â”€ AdminDashboardScreen.tsx
â”‚   â”‚   â””â”€â”€ ... (other screens)
â”‚   â”œâ”€â”€ services/            # API service layers
â”‚   â”‚   â”œâ”€â”€ supabase.ts
â”‚   â”‚   â”œâ”€â”€ auth.ts
â”‚   â”‚   â”œâ”€â”€ toilets.ts
â”‚   â”‚   â”œâ”€â”€ ratings.ts
â”‚   â”‚   â”œâ”€â”€ reviews.ts
â”‚   â”‚   â””â”€â”€ admin.ts
â”‚   â””â”€â”€ types/               # TypeScript type definitions
â”‚       â””â”€â”€ index.ts
â”œâ”€â”€ assets/                  # Images, fonts, etc.
â”œâ”€â”€ migrations/              # Database migration files
â”œâ”€â”€ supabase-schema.sql      # Complete database schema
â”œâ”€â”€ App.tsx                  # Main app entry point
â”œâ”€â”€ global.css               # Tailwind CSS imports
â”œâ”€â”€ babel.config.js          # Babel configuration
â”œâ”€â”€ tailwind.config.js       # Tailwind configuration
â”œâ”€â”€ metro.config.js          # Metro bundler configuration
â”œâ”€â”€ package.json
â””â”€â”€ README.md
`

---

## ðŸ—„ï¸ Database Schema

The app uses PostgreSQL with the following main tables:

* **profiles** - User accounts and admin status
* **toilets** - Approved public toilets with location, photos, and features
* **toilet_submissions** - Pending submissions awaiting admin approval
* **ratings** - User ratings (1-5 stars) for toilets
* **reviews** - Text reviews for toilets
* **reports** - User-reported issues with toilets

All tables have Row Level Security (RLS) policies to ensure data privacy and security. See supabase-schema.sql for complete schema details.

---

## ðŸ”’ Security & Privacy

* **Row Level Security (RLS)** enabled on all database tables
* **Secure authentication** via Supabase Auth
* **User data privacy** - users can request account deletion
* **Admin-only actions** - protected by RLS policies
* **Photo storage** - securely stored in Supabase Storage with public read access

---

## ðŸ¤ Contributing

This project was developed for the PTIB Civic Tech Challenge 2025. Contributions, issues, and feature requests are welcome!

---

## ðŸ“„ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ðŸ‘¤ Author

**Mahin**

* Email: itsmemahin.bd@outlook.com
* GitHub: codedbymahin 

---

## ðŸ™ Acknowledgments

* Developed for the **PTIB Civic Tech Challenge 2025**
* Built with React Native and Expo
* Backend powered by Supabase
* Community-driven approach to solving \"The Hidden Thirst\" problem in Bangladesh
