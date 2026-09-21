# Snitch E-Commerce Clone

A full-stack e-commerce application implementing role-based access control, complex inventory state management, and optimized media delivery pipelines.

## Tech Stack
- **Framework**: Next.js (App Router)
- **State Management**: Redux Toolkit
- **Database**: MongoDB (Mongoose)
- **Media Management**: ImageKit.io
- **Styling**: Tailwind CSS

## Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| `MONGODB_URI` | Connection string for MongoDB instance | Yes |
| `JWT_SECRET` | Secret key for signing authentication tokens | Yes |
| `IMAGEKIT_PUBLIC_KEY` | Public API key for ImageKit assets | Yes |
| `IMAGEKIT_PRIVATE_KEY` | Private API key for ImageKit server-side operations | Yes |
| `IMAGEKIT_URL` | Base URL for ImageKit media delivery | Yes |
| `RAZORPAY_KEY_ID` | API key for Razorpay payment gateway | Yes |
| `RAZORPAY_KEY_SECRET` | Secret key for Razorpay payment gateway | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | Yes |

## Getting Started

### Installation
```bash
git clone <repository-url>
cd snitch-ecommerce-clone
npm install
```

### Configuration
Create a `.env.local` file in the root directory and populate it with the variables listed in the Environment Variables table.

### Local Development
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Project Structure

```text
src/
├── app/
│   ├── api/                # Next.js Route Handlers (Auth, Products, Cart, Orders)
│   ├── admin/              # Administrative dashboard and inventory management
│   ├── (auth)/             # Authentication flows (Login, Register)
│   ├── products/           # Product listing and detailed view pages
│   └── layout.js           # Global layout and providers
├── components/
│   ├── ui/                 # Atomic design components
│   └── layout/             # Page-level wrappers and navigation
├── lib/                    # Axios instances, shared utilities, and helper functions
├── models/                 # Mongoose schema definitions (User, Product, Order, Cart)
└── store/                  # Redux Toolkit slices and central store configuration
```

## License
MIT
