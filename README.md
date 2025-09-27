# 🤖 Exoself - Your Digital Echo

A cutting-edge web platform that allows users to create AI replicas of themselves by uploading personal data like WhatsApp chats, messages, and conversations.

## ✨ Features

### 🎨 Modern 2025 Design
- **Cyber-themed UI** with purple/cyan gradient aesthetics
- **Framer Motion animations** for smooth interactions
- **Matrix rain effect** and floating particles
- **Glassmorphism** with backdrop blur effects
- **Responsive design** that works on all devices

### 🔐 Authentication
- **Google OAuth integration** for secure sign-in
- **Privacy-focused** with encrypted data storage
- **GDPR compliant** user data handling

### 📱 Data Upload Interface
- **Drag-and-drop file upload** with visual feedback
- **Multiple format support**: WhatsApp (.txt), SMS, Email exports
- **Real-time processing status** with progress indicators
- **Auto-detection** of file types and user identification

### 🧠 AI Features
- **Personality analysis** from uploaded conversations
- **Real-time chat** with your digital echo
- **Writing pattern recognition** and style mimicking
- **Self-aware AI** that admits limitations honestly

### 🎭 3D Visualization
- **Spline integration** ready for 3D robot scenes
- **Animated placeholders** with orbital rings and particles
- **Future robot embodiment** showcase

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Dropzone** for file uploads
- **Lucide React** for icons

### 3D & Visual
- **Spline** for 3D robot scenes
- **Custom animations** with CSS keyframes
- **Particle systems** and matrix effects

### Authentication
- **NextAuth.js** for OAuth
- **Google Provider** integration
- **Session management**

## 🛠️ Installation

```bash
# Navigate to website directory
cd exoself-website

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 📂 Project Structure

```
exoself-website/
├── app/
│   ├── auth/signin/         # Authentication pages
│   ├── dashboard/           # User dashboard
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # Reusable components
├── lib/                     # Utility functions
├── public/                  # Static assets
├── styles/                  # Additional styles
└── package.json
```

## 🎯 Key Pages

### 🏠 Landing Page (`/`)
- Hero section with animated 3D robot placeholder
- Feature showcase with cyber aesthetics
- Call-to-action buttons with hover effects
- Matrix rain background animation

### 🔐 Sign In (`/auth/signin`)
- Google OAuth integration
- Security features highlight
- Animated loading states
- Privacy assurance messaging

### 📊 Dashboard (`/dashboard`)
- File upload interface with drag-and-drop
- Data source management
- Real-time processing status
- Quick actions for AI interaction
- Statistics and analytics

## 🎨 Design System

### Colors
- **Primary**: Purple (`#8b5cf6`) to Cyan (`#06b6d4`) gradients
- **Background**: Dark matrix theme (`#0f0f23` to `#1a1a2e`)
- **Accents**: Pink (`#ec4899`) and Green (`#10b981`)

### Typography
- **Main Font**: Inter for clean readability
- **Code Font**: JetBrains Mono for cyber aesthetics
- **Sizes**: Responsive scale from mobile to desktop

### Animations
- **Entrance**: Staggered fade-in with motion blur
- **Hover**: Scale and glow effects
- **Background**: Continuous matrix rain and grid movement
- **Loading**: Smooth rotation and pulse effects

## 🔮 Future Enhancements

### 🤖 Advanced AI Features
- **Real-time conversation learning**
- **Emotional state detection**
- **Multi-language personality support**
- **Voice synthesis integration**

### 🌐 Social Integration
- **WhatsApp API** for direct import
- **Instagram/Twitter** data connection
- **Email provider integration**
- **Phone SMS import**

### 🎭 3D Avatar System
- **Custom Spline robot scenes**
- **Personality-based avatar design**
- **Real-time animation during chat**
- **VR/AR readiness**

### 📱 Mobile App
- **React Native** companion app
- **Cross-platform sync**
- **Push notifications**
- **Offline chat capability**

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🚀 Deployment

The website is optimized for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

## 📈 Performance

- **Core Web Vitals** optimized
- **Image optimization** with Next.js
- **Code splitting** for faster loads
- **Service Worker** for offline functionality

## 🛡️ Security

- **HTTPS only** in production
- **OAuth token encryption**
- **File upload validation**
- **XSS protection**
- **CSRF tokens**

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for the future of digital consciousness**