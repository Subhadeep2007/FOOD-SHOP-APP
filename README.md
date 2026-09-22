🍔 FoodShop — Full-Stack Food Ordering Platform

FoodShop is a full-stack food ordering web application built for a restaurant/food business.

The project includes a customer-facing food ordering system, authentication, cart and checkout, address management, online/COD payments, order tracking, notifications, reviews, refunds, favorites, coupons, and an admin dashboard for managing the complete restaurant workflow.

📌 Project Overview

FoodShop follows a modern client-server architecture:

Customer
   ↓
React Frontend
   ↓
Axios API Layer
   ↓
Node.js + Express Backend
   ↓
MongoDB / Mongoose

Additional services:

Cloudinary  → Food/Profile Images
Razorpay    → Online Payments
Socket.io   → Live Order Updates
Leaflet     → Map / Location

✨ Main Features

👤 Customer Features

Authentication

User registration

Admin registration

Email verification with OTP

Resend verification OTP

User login

Admin login

Forgot password

Reset password with OTP

Change password

JWT access-token authentication

HTTP-only refresh-token cookie

Logout

Logout from all sessions

Protected routes

Admin-only routes

Persistent authentication

Food Discovery

Food menu

Food search

Category filtering

Food type filtering

Minimum/maximum price filtering

Sorting

Food details

Food images

Discounted prices

Availability status

Stock-aware food availability

Ratings and review count

Favorites

Add food to favorites

Remove food from favorites

View favorite foods

Favorite status on food cards

Cart

Add food to cart

Remove food

Increase quantity

Decrease quantity

Update quantity

Clear cart

Cart count

Backend-synchronized cart

Stock validation

Food availability validation

Empty-cart state

Address Management

Add delivery address

Edit address

Delete address

Select delivery address

Full name

Phone

Address line

Landmark

City

State

Postal code

Country

Latitude

Longitude

Formatted address

Place ID where supported

Leaflet map/location support

Checkout

Cart summary

Address selection

Add/change address

Coupon code

Coupon validation

Discount calculation

Delivery fee

Tax

Final order summary

COD payment option

Online payment option

Payments

Razorpay online payment

Payment verification

Payment success handling

Payment failure handling

Payment cancellation handling

COD orders

Duplicate payment protection

Payment status tracking

Orders

Place order

My Orders

Order details

Order number

Ordered items

Quantity

Unit price

Item subtotal

Discount

Delivery fee

Tax

Final amount

Payment status

Order status

Delivery address

Delivery partner/delivery details

Cancellation reason

Customer order cancellation

Order Status Tracking

The order lifecycle supports:

PLACED
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY_FOR_PICKUP
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED

Cancellation can occur where the backend rules allow it.

Live Order Tracking

Socket.io integration

Real-time order status updates

Live order timeline

Order cancellation updates

Automatic UI updates

Reconnection handling

Socket listener cleanup

Notifications

Notification bell

Unread notification count

Notification dropdown

Notification page

Order notifications

Payment notifications

Refund notifications

Read/unread state

Mark as read where supported

Mark all as read where supported

Real-time notification updates

Reviews

View food reviews

Average rating

Review count

Create review

Edit own review

Delete own review

Rating selector

Comment

User name

User profile image

Review date

Review eligibility based on completed/delivered orders

Refunds

Create refund request

Refund history

Refund details

Refund amount

Refund reason

Refund note

COD bank details where required

Razorpay refund processing

Refund status tracking

Possible refund states include:

REQUESTED
UNDER_REVIEW
APPROVED
PROCESSING
COMPLETED
REJECTED
FAILED

Profile / Account

Profile information

Profile image

Name

Email

Role

Email verification status

My Favorites

My Orders

My Addresses

Change Password

Refund history

Notifications

Logout

Logout all sessions

🛠️ Admin Features

Admin Dashboard

The admin area provides restaurant-side management for the application.

Food Management

View all foods

Search foods

Filter by category

Filter by food type

Filter by stock/availability

Filter by active state

Pagination

Create food

Edit food

Multiple food image upload

Cloudinary image upload

Update food price

Update stock

Update availability

Soft delete/deactivate food

Stock Management

Stock is managed from the admin food management area.

Example:

Food: Chicken Biryani
Stock: 25

Admin updates:
25 → 40

When an order is successfully placed, backend logic reduces food stock.

When a cancellable order is cancelled, backend logic restores the corresponding stock.

If stock becomes zero, the food can become unavailable according to backend rules.

Category Management

View categories

Create category

Edit category

Category description

Category image

Sort order

Active/inactive status

Delete/deactivate where supported

Order Management

View all customer orders

Filter by status

Pagination

View order details

Confirm orders

Move orders through status flow

Add delivery partner/delivery details

Cancel order

Cancellation reason

Customer information

Payment information

Refund-related information

Review Management

View customer reviews

Review information

Food information

Customer information

Moderation/deletion where supported by backend

Coupon Management

Create coupons

Edit coupons

Activate/deactivate coupons

Coupon validation

Coupon usage tracking where supported

User Management

Where supported by the backend:

View users

Search users

Account information

Active/inactive management

Customer-related information

Refund Management

View refund requests

Review refund requests

Reject refund

Approve refund

Process Razorpay refund

Complete COD refund

Track refund status

Analytics

The admin dashboard can use real backend analytics such as:

Orders

Revenue

Users

Food performance

Category performance

Refunds

Coupon usage

Payment information

Only backend-supported analytics should be shown.

💻 Technology Stack

Frontend

React 19

Vite

Tailwind CSS v4

Redux Toolkit

React Redux

React Router

Axios

React Hot Toast

Lucide React

Leaflet

React Leaflet

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

bcrypt

Multer

Cloudinary

Socket.io

Nodemailer

Joi / request validation

Razorpay

🏗️ Architecture

Frontend

The frontend is organized into:

client/
├── src/
│   ├── api/
│   ├── components/
│   │   ├── layout/
│   │   ├── food/
│   │   ├── cart/
│   │   ├── address/
│   │   ├── order/
│   │   ├── review/
│   │   ├── refund/
│   │   ├── notification/
│   │   └── admin/
│   ├── pages/
│   ├── store/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js

Backend

The backend follows a modular architecture:

server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── socket/
├── utils/
├── validators/
└── app/server entry files

The project separates:

Routes
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
MongoDB

🔐 Authentication Architecture

FoodShop uses two-token authentication.

Access Token

The access token is used by the frontend for authenticated API requests:

Authorization: Bearer ACCESS_TOKEN

Refresh Token

The refresh token is stored by the backend in an HTTP-only cookie.

This avoids exposing the refresh token directly to frontend JavaScript.

Authentication Flow

Login
 ↓
Backend verifies credentials
 ↓
Access token returned
 ↓
Refresh token stored in HTTP-only cookie
 ↓
Frontend stores authenticated user state
 ↓
Axios adds Bearer access token

When an access token expires:

API request
 ↓
401
 ↓
Refresh-token request
 ↓
New access token
 ↓
Retry original request

🌐 API Layer

Frontend API modules are separated by feature.

Typical structure:

src/api/
├── axios.js
├── authApi.js
├── foodApi.js
├── categoryApi.js
├── favoriteApi.js
├── cartApi.js
├── addressApi.js
├── orderApi.js
├── paymentApi.js
├── reviewApi.js
├── refundApi.js
├── couponApi.js
└── notificationApi.js

Axios

The Axios instance handles:

Backend base URL

Credentials

Authorization header

Access token

Common API configuration

📦 API Response Unwrapping

Some backend responses follow this structure:

{
    success: true,
    message: "Request successful",
    data: {
        addresses: []
    }
}

The frontend can use a small helper such as:

const unwrap = (response) =>
    response.data &&
    response.data.data
        ? response.data.data
        : response.data;

This means the component can work with:

const data = await getAddresses();

instead of repeatedly accessing nested Axios/backend response objects.

unwrap is only a response-format helper. It does not add a new feature.

🖼️ Image Handling

Cloudinary is used for backend-managed image uploads.

Food Images

Admin can upload multiple food images.

Backend flow:

Admin selects image
 ↓
Multer memory storage
 ↓
Cloudinary upload
 ↓
Cloudinary secure URL
 ↓
MongoDB stores image URL

Profile Image

The authenticated user object contains profileImage when available.

The frontend can display it in:

Account page

Navbar/profile area

Review UI where user image is supported

🗺️ Location & Maps

Leaflet / React Leaflet is used for location-related UI where supported.

Address data can contain:

latitude
longitude
formattedAddress
placeId

This allows the checkout/address experience to keep location information along with the textual delivery address.

💳 Payment Architecture

FoodShop supports:

COD
Online Razorpay Payment

Online payment should follow the backend's payment creation and verification flow.

The frontend should never be treated as the authority for the final payable amount.

Backend remains the source of truth for:

Food price
Discount
Stock
Coupon discount
Delivery fee
Tax
Final order amount
Payment status

📦 Order & Stock Logic

The backend validates the cart before creating an order.

Typical order flow:

Cart
 ↓
Address validation
 ↓
Food availability check
 ↓
Stock validation
 ↓
Server-side price calculation
 ↓
Coupon validation
 ↓
Delivery fee
 ↓
Tax
 ↓
Final amount
 ↓
Order creation
 ↓
Stock reduction

For allowed order cancellation:

Order cancelled
 ↓
Stock restored

⚡ Real-Time Architecture

Socket.io is used for real-time order updates.

Example:

Admin changes order status
        ↓
Backend updates order
        ↓
Socket.io event
        ↓
Customer receives event
        ↓
Order UI updates
        ↓
Notification can appear

The frontend should clean up listeners when components unmount to prevent duplicate events.

🧭 Customer Routes

The customer application includes routes such as:

/
 /menu
 /foods/:foodId
 /favorites
 /cart
 /checkout
 /orders
 /orders/:id
 /account
 /addresses
 /notifications
 /refunds
 /refunds/:id
 /change-password

Authentication routes include:

/login
/register
/verify-email
/forgot-password
/reset-password

🛡️ Admin Routes

The admin area includes routes such as:

/admin
/admin/login
/admin/register
/admin/foods
/admin/categories
/admin/orders
/admin/reviews
/admin/coupons
/admin/users
/admin/analytics

Admin routes must be protected by role-based authorization.

🎨 UI / UX Principles

FoodShop uses a clean restaurant-style interface with:

Orange accent colors

White cards

Rounded corners

Tailwind responsive layouts

Mobile-first behavior

Loading states

Empty states

Error states

Toast notifications

Confirmation dialogs

Reusable components

Internal navigation should use React Router instead of full-page anchor navigation.

🔒 Validation & Security

The application uses:

JWT authentication

HTTP-only refresh cookie

Password hashing

Auth middleware

Admin authorization

Request validation

Rate limiting for authentication endpoints

File size limits

Server-side stock validation

Server-side order pricing

Server-side coupon validation

Payment verification

📋 Known Customer Flow

The main customer journey is:

Home
 ↓
Menu
 ↓
Food Details
 ↓
Add to Cart
 ↓
Cart
 ↓
Address
 ↓
Coupon
 ↓
Checkout
 ↓
COD / Razorpay
 ↓
Order Created
 ↓
My Orders
 ↓
Order Details
 ↓
Live Status
 ↓
Delivered
 ↓
Review

👨‍💼 Known Admin Flow

The restaurant/admin journey is:

Admin Login
 ↓
Dashboard
 ↓
Foods / Categories
 ↓
Manage Stock
 ↓
Orders
 ↓
Confirm Order
 ↓
Prepare
 ↓
Ready for Pickup
 ↓
Out for Delivery
 ↓
Delivered

Supporting management:

Reviews
Coupons
Refunds
Users
Analytics

⚙️ Environment Variables

Frontend

A typical frontend environment file uses:

VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000

Use the variable names expected by the current frontend Axios/socket configuration.

Backend

Backend environment variables depend on the project's configuration and may include:

PORT=8000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

ADMIN_SECRET_KEY=your_admin_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

Use the exact variable names defined by the current backend configuration files.

🚀 Installation

1. Clone the repository

git clone <your-repository-url>
cd FOOD-SHOP-APP

2. Install backend dependencies

cd server
npm install

3. Configure backend environment

Create the backend .env file and add the required values.

4. Start backend

npm run dev

or use the project's configured start script.

5. Install frontend dependencies

cd ../client
npm install

6. Configure frontend environment

Create:

client/.env

Example:

VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000

7. Start frontend

npm run dev

🧪 Testing Checklist

Authentication

[ ] Register
[ ] Verify email
[ ] Resend OTP
[ ] Login
[ ] Logout
[ ] Logout all
[ ] Forgot password
[ ] Reset password
[ ] Change password
[ ] Page refresh authentication
[ ] Protected routes
[ ] Admin protection

Food

[ ] Menu loading
[ ] Search
[ ] Category filter
[ ] Food type
[ ] Price filter
[ ] Sorting
[ ] Food details
[ ] Favorites
[ ] Availability

Cart / Checkout

[ ] Add to cart
[ ] Quantity update
[ ] Remove item
[ ] Clear cart
[ ] Address CRUD
[ ] Coupon validation
[ ] Checkout
[ ] COD
[ ] Online payment

Orders

[ ] Create order
[ ] My orders
[ ] Order details
[ ] Cancel order
[ ] Status updates
[ ] Live tracking

Reviews / Refunds

[ ] Create review
[ ] Edit review
[ ] Delete review
[ ] Refund request
[ ] Refund history
[ ] Refund details

Admin

[ ] Admin dashboard
[ ] Food CRUD
[ ] Stock management
[ ] Category management
[ ] Order management
[ ] Review management
[ ] Coupon management
[ ] Refund management
[ ] User management where supported
[ ] Analytics

🧑‍💻 Development Rules

This project follows these coding rules:

Avoid optional chaining ?.

Preserve existing working features when adding new functionality

Latest code is the source of truth

Do not invent backend APIs

Use real backend data instead of mock data

Keep business logic on the server

Use reusable components

Keep pages responsive

Handle loading, empty, error, and success states

Use React Router for internal navigation

Keep authentication and authorization separated

Keep API modules modular

📈 Future Improvements

Possible future improvements include:

Delivery partner application

Advanced inventory management

Restaurant kitchen dashboard

Scheduled orders

Multiple restaurant branches

Advanced analytics

Loyalty/reward system

Product recommendations

Referral system

Push notifications

Progressive Web App support

Automated deployment pipeline

👤 Project

Project Name: FoodShop

Type: Full-Stack Food Ordering Platform

Architecture: MERN-style modular architecture

Frontend: React + Vite + Tailwind

Backend: Node.js + Express

Database: MongoDB

Payments: Razorpay + COD

Images: Cloudinary

Real-time: Socket.io

Maps: Leaflet

📄 License

Add your preferred project license here.

⭐ Final Note

FoodShop is designed as a complete restaurant ordering platform where customers can discover food, manage favorites and cart items, save delivery addresses, checkout, pay, track orders in real time, receive notifications, review completed orders, and request refunds.

The admin side provides the tools required to manage foods, stock, categories, orders, reviews, coupons, refunds, users, and analytics.
