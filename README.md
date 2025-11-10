# Case Archives - Horror-Themed Investigation Database

A full-stack web application for managing investigation case studies and target profiles with a dark horror aesthetic. Features JWT authentication, multi-image uploads with thumbnails, and complete Docker support including Tor .onion hidden service setup.

## 🎯 Features

- **JWT Authentication**: Passphrase-protected access with server-side verification
- **Cases & Targets Management**: Create, view, and delete investigation records
- **Multi-Image Upload**: Support for up to 6 images per entry with client-side previews
- **Automatic Thumbnails**: Server-side thumbnail generation using Sharp
- **Horror UI Theme**: Dark matte black design with blood-red accents, scanline effects, and glitch animations
- **Fully Responsive**: Mobile-friendly with accessible keyboard navigation
- **Docker Ready**: Complete containerization with docker-compose
- **Tor Hidden Service**: Instructions for .onion deployment

## 🛠 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router
- Shadcn UI Components
- Lucide Icons

### Backend
- Node.js + Express
- SQLite3 (better-sqlite3)
- JWT for authentication
- Multer for file uploads
- Sharp for image processing
- Express Validator for input validation
- Helmet for security headers

## 📦 Installation & Setup

### Local Development

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:8080)
npm run dev
```

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your secrets
# APP_PASSPHRASE=your_secure_passphrase
# JWT_SECRET=your_secure_jwt_secret

# Initialize database and start server
npm start
```

The backend will run on `http://localhost:3000` by default.

### Production Build

#### Frontend
```bash
npm run build
# Built files will be in ./dist
```

#### Backend
```bash
cd backend
NODE_ENV=production node server.js
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

### Environment Variables

Create a `.env` file in the project root:

```env
APP_PASSPHRASE=123
JWT_SECRET=change_me_to_a_secure_random_string
VITE_API_URL=http://localhost:3000
```

## 🧅 Tor Hidden Service Setup

To expose your backend as a Tor .onion address:

### 1. Install Tor

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install tor
```

#### macOS:
```bash
brew install tor
```

### 2. Configure Tor Hidden Service

Edit the Tor configuration file:

```bash
sudo nano /etc/tor/torrc
```

Add these lines at the end:

```
HiddenServiceDir /var/lib/tor/case_archives/
HiddenServicePort 80 127.0.0.1:3000
```

This will forward requests from port 80 of your .onion address to your local backend on port 3000.

### 3. Restart Tor

```bash
sudo systemctl restart tor
```

### 4. Get Your .onion Address

```bash
sudo cat /var/lib/tor/case_archives/hostname
```

This will output your unique .onion address (e.g., `abc123def456.onion`).

### 5. Update Frontend Configuration

Update your frontend to use the .onion address:

```env
VITE_API_URL=http://your-onion-address.onion
```

Rebuild the frontend:

```bash
npm run build
```

### 6. Access Your Hidden Service

- Install Tor Browser: https://www.torproject.org/download/
- Navigate to your .onion address in Tor Browser
- The passphrase modal will appear (default: `123`)

## 🔐 Security Considerations

### ⚠️ Important Security Notes

**The default configuration is for DEVELOPMENT/DEMO purposes only.**

#### Production Security Checklist:

1. **Change Default Passphrase**
   - Default `APP_PASSPHRASE=123` is insecure
   - Use a strong, unique passphrase (20+ characters)

2. **Strong JWT Secret**
   - Generate a cryptographically secure random string
   - Use at least 32 characters: `openssl rand -base64 32`

3. **Use HTTPS in Production**
   - Configure TLS certificates
   - Never transmit credentials over HTTP in production

4. **Consider Better Authentication**
   - Current implementation uses shared passphrase
   - Recommended: Implement per-user authentication with bcrypt-hashed passwords
   - Consider OAuth or multi-factor authentication

5. **Session Management**
   - Current: JWT in sessionStorage (lost on tab close)
   - Consider: HttpOnly cookies for better XSS protection
   - Implement token refresh mechanism

6. **File Storage**
   - Current: Local filesystem storage
   - Recommended for scale: S3, CloudFlare R2, or similar object storage
   - Implement virus scanning for uploaded files

7. **Rate Limiting**
   - Already implemented basic rate limiting
   - Consider stricter limits for auth endpoints
   - Monitor for abuse

8. **Input Validation**
   - Server-side validation is already implemented
   - Review and tighten validation rules based on your needs

9. **Database Security**
   - Current: Local SQLite file
   - Consider: PostgreSQL with proper user permissions for production
   - Implement regular backups

10. **Monitoring & Logging**
    - Implement proper logging (Winston, Bunyan)
    - Monitor authentication failures
    - Set up alerts for suspicious activity

## 📡 API Reference

### Authentication

#### POST `/api/auth`
Verify passphrase and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"passphrase": "123"}'
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Authentication successful"
}
```

### Cases

#### GET `/api/cases`
Retrieve all cases with images.

**Request:**
```bash
curl http://localhost:3000/api/cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### POST `/api/cases`
Create a new case with images (multipart/form-data).

**Request:**
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Investigation Alpha" \
  -F "description=Detailed case description here" \
  -F "mistakes=Lessons learned from this case" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

#### DELETE `/api/cases/:id`
Delete a case and its images.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/cases/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Targets

#### GET `/api/targets`
Retrieve all targets with images.

#### POST `/api/targets`
Create a new target (similar to cases).

#### DELETE `/api/targets/:id`
Delete a target and its images.

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Example Test (Included)
Basic unit test for `POST /api/cases` endpoint in `backend/tests/cases.test.js`.

## 🎨 UI Design Details

### Color Palette
- Background: `#070707` (Deep void black)
- Card: `#0f0f0f` (Matte black)
- Accent: `#b63131` (Desaturated blood red)
- Muted: `#8b8b8b` (Gray)

### Typography
- Headings: Cinzel (serif, horror aesthetic)
- Body: Inter (modern sans-serif)

### Effects
- Film grain overlay
- Animated scanlines
- Glitch animation on hover
- Smooth transitions with reduced motion support

## 📂 Project Structure

```
case-archives/
├── backend/
│   ├── database/
│   │   └── init.js              # Database setup
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── upload.js            # Multer config
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── cases.js             # Cases CRUD
│   │   └── targets.js           # Targets CRUD
│   ├── utils/
│   │   └── thumbnail.js         # Sharp thumbnail generation
│   ├── uploads/                 # Uploaded images (gitignored)
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                # Express app entry
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Main layout with nav
│   │   ├── PassphraseModal.tsx  # Auth modal
│   │   ├── ImageUpload.tsx      # Multi-image uploader
│   │   └── ImageGalleryModal.tsx # Fullscreen image viewer
│   ├── pages/
│   │   ├── Home.tsx             # Landing page
│   │   ├── Cases.tsx            # Cases list
│   │   ├── Targets.tsx          # Targets list
│   │   └── New.tsx              # Create forms
│   ├── index.css                # Design system + horror theme
│   └── App.tsx                  # Router + auth state
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── README.md
```

## 🚀 Demo Script

### Local Demo
```bash
# Terminal 1: Start backend
cd backend
npm install
cp .env.example .env
npm start

# Terminal 2: Start frontend
npm install
npm run dev

# Browser: Open http://localhost:8080
# Enter passphrase: 123
# Create a case with images
# View in Cases page
```

### Docker Demo
```bash
# Start with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Browser: http://localhost:8080
# Passphrase: 123
```

### Tor Hidden Service Demo
```bash
# After Tor setup (see above)
# 1. Get .onion address
sudo cat /var/lib/tor/case_archives/hostname

# 2. Open Tor Browser
# 3. Navigate to your-address.onion
# 4. Enter passphrase: 123
```

## 📝 License

MIT

## 🤝 Contributing

This is a personal case study project. Feel free to fork and modify for your own use.

---

**Note:** This application is designed for educational and demonstration purposes. For production use, implement the security recommendations listed above.
