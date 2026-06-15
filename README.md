# VisionVibe 🕶️

VisionVibe is a full-featured e-commerce web application built using Node.js, Express, MongoDB, and EJS. It provides a complete platform for users to browse products, manage their carts, apply coupons, and securely checkout using Razorpay. It also includes a comprehensive Admin panel for managing products, categories, orders, coupons, and users.

## 🚀 Features

### User Features
*   **Authentication & Authorization:** Secure login/signup using Email, Password with OTP verification, and Google OAuth2 integration.
*   **Product Browsing:** View categories, search, and browse products with detailed descriptions and images.
*   **Shopping Cart & Wishlist:** Add, remove, and manage products in the cart and wishlist.
*   **Checkout & Payments:** Seamless checkout process with Razorpay integration for online payments, along with other payment options like Wallet and Cash on Delivery (COD).
*   **User Wallet:** Integrated wallet system for refunds and purchases.
*   **Order Management:** Track order history, view order details, and manage order statuses.
*   **Coupons:** Apply discount coupons during checkout.

### Admin Features
*   **Dashboard:** Overview of sales, revenue, and platform statistics.
*   **User Management:** View, block, or unblock users.
*   **Product & Category Management:** Add, edit, delete, and manage products and categories, including image uploads.
*   **Order Management:** View all orders, update order statuses, and process refunds.
*   **Coupon Management:** Create, edit, and manage promotional coupons.

## 🛠️ Technology Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose ODM
*   **Template Engine:** EJS (Embedded JavaScript)
*   **Authentication:** Passport.js (Google OAuth2), bcrypt (password hashing)
*   **Payment Gateway:** Razorpay
*   **File Uploads:** Multer
*   **Email Services:** Nodemailer (for OTP and email notifications)
*   **Session Management:** express-session, cookie-session
*   **Styling:** CSS / Bootstrap (assumed from typical EJS setups)

## 📁 Project Structure

```text
VisionVibe/
├── controller/         # Contains logic for handling user and admin requests
│   ├── adminC/         # Admin related controllers
│   └── userC/          # User related controllers
├── helper/             # Helper functions and utilities
├── middleware/         # Custom middlewares (auth, error handling, etc.)
├── model/              # Mongoose database schemas (User, Product, Order, Cart, etc.)
├── public/             # Static files (CSS, JS, Images)
├── routes/             # Express route definitions (userRouter, adminRouter)
├── views/              # EJS templates for rendering the UI
│   ├── admin/          # Admin panel views
│   ├── user/           # User facing views
│   └── partials/       # Reusable EJS components (headers, footers)
├── .env                # Environment variables configuration file
├── server.js           # Application entry point
└── package.json        # Project metadata and dependencies
```

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
*   [Node.js](https://nodejs.org/) installed on your machine.
*   [MongoDB](https://www.mongodb.com/) installed locally or a MongoDB Atlas URI.

## 🚀 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AbhijithS98/VisionVibe.git
    cd VisionVibe
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add the following variables. (Replace the placeholders with your actual credentials):
    ```env
    PORT=3000
    DB_URL=your_mongodb_connection_string

    # Nodemailer Configuration
    email=your_admin_email@gmail.com
    password=your_admin_email_password
    otpemail=your_otp_email@gmail.com
    otppassword=your_otp_email_app_password

    # Google OAuth2 Configuration
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # Razorpay Configuration
    RAZORPAY_ID_KEY=your_razorpay_key_id
    RAZORPAY_SECRET_KEY=your_razorpay_secret_key
    ```

4.  **Run the application:**
    ```bash
    # For development mode with Nodemon
    npm start
    
    # Or run normally
    node server.js
    ```

5.  **Access the application:**
    Open your web browser and navigate to `http://localhost:3000`

## 📄 License

This project is licensed under the ISC License.
