# AppGrosir - Wholesale Management System

A comprehensive web application designed for large wholesale stores to manage inventory, sales, attendance, and financial reporting. Built with a focus on elegant UI/UX with both desktop and mobile responsive designs.

## Features

### 🏪 Core Functionality
- **Stock Synchronization**: Real-time sync between warehouse and cashier inventory
- **Point of Sale (POS)**: Intuitive cashier interface for fast transactions
- **Profit & Loss Tracking**: Comprehensive financial reports with revenue, costs, and profit margins
- **Employee Attendance**: Check-in/check-out system with attendance tracking
- **User Management**: Role-based access control (Owner, Manager, Staff, Cashier)

### 📊 Management Capabilities
- **Inventory Management**: Track products with SKU, pricing, and stock levels
- **Stock Movements**: Record and track all inventory movements (receiving, transfers, adjustments)
- **Low Stock Alerts**: Automatic alerts when products reach minimum threshold
- **Sales History**: Complete transaction history with invoice tracking
- **Activity Tracking**: Real-time activity feed for all operations

### 🎨 UI/UX Features
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Dashboard Analytics**: Visual overview with key metrics and statistics
- **Role-Based Views**: Customized interface based on user role
- **Dark/Light Themes**: Elegant color schemes for comfortable viewing

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for data persistence
- **JWT** authentication for secure access
- **bcrypt** for password hashing

### Frontend
- **Vanilla JavaScript** for lightweight performance
- **CSS3** with modern responsive design
- **Font Awesome** icons for visual clarity

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appgrosir
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Create a `.env` file based on `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Update the `JWT_SECRET` with a secure random string
   - Default configuration is ready for development

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open browser and navigate to: `http://localhost:3000`
   - Default credentials:
     - Username: `admin`
     - Password: `admin123`

## Deployment

### Vercel Deployment

This application is configured for easy deployment to Vercel:

1. **Push your code to GitHub**

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the Node.js project

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add the following required variable:
     - `JWT_SECRET`: A secure random string (generate using `openssl rand -base64 32`)
   - Optional variables:
     - `PORT`: Will be set automatically by Vercel
     - `NODE_ENV`: Set to `production`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be available at `your-project.vercel.app`

**Important Notes:**
- The `vercel.json` configuration ensures API routes are properly handled
- All API responses return JSON with proper content-type headers
- Error handling is optimized for production deployment
- SQLite database will be created on first run (consider upgrading to a persistent database for production)

## Usage Guide

### For Owners/Managers

#### Dashboard
- View real-time statistics and key metrics
- Monitor daily sales and inventory status
- Track employee attendance
- Review recent activities

#### Product Management
1. Navigate to **Products** section
2. Click **Add Product** to create new items
3. Enter product details (SKU, name, pricing, etc.)
4. Set minimum stock alert levels

#### User Management
1. Go to **Users** section
2. Click **Add User** to create new accounts
3. Assign appropriate roles (Staff, Cashier, Manager, Owner)
4. Manage user permissions and access

#### Reports & Analytics
1. Access **Profit & Loss** section
2. Select date range for report
3. Click **Generate Report**
4. View detailed breakdown:
   - Revenue from sales
   - Cost of goods sold
   - Gross and net profit
   - Profit margins

### For Staff

#### Stock Management

**Receiving Stock (Incoming)**
1. Go to **Stock Management**
2. Click **Receive Stock**
3. Select product and enter quantity
4. Add reference (PO number) and notes
5. Submit to update warehouse inventory

**Transferring Stock (Warehouse → Cashier)**
1. Click **Transfer Stock**
2. Select product and quantity
3. System validates warehouse availability
4. Confirms transfer and updates both locations

**Stock Adjustments**
1. Click **Adjust Stock**
2. Select product and location
3. Enter correct quantity
4. Provide reason for adjustment
5. Submit correction

### For Cashiers

#### Point of Sale (POS)
1. Navigate to **Sales / POS**
2. Browse or search for products
3. Click products to add to cart
4. Adjust quantities as needed
5. Select payment method
6. Enter customer name (optional)
7. Click **Complete Sale**
8. System generates invoice and updates inventory

### For All Employees

#### Attendance Tracking
1. Go to **Attendance** section
2. Click **Check In** when arriving
3. Click **Check Out** when leaving
4. View today's attendance summary

## Database Schema

### Users
- Authentication and role management
- Supports: Owner, Manager, Staff, Cashier roles

### Products
- Product catalog with SKU, pricing, descriptions
- Separate stock tracking for warehouse and cashier
- Minimum stock alert thresholds

### Stock Movements
- Complete audit trail of all inventory changes
- Tracks: receiving, transfers, sales, adjustments
- Links to user and timestamp

### Sales & Sales Items
- Transaction records with invoice numbers
- Line items with product, quantity, pricing
- Payment method and customer information

### Attendance
- Check-in/check-out timestamps
- Employee attendance history
- Status tracking

### Expenses
- Operating expense tracking
- Used in profit/loss calculations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (authenticated)

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/alerts/low-stock` - Get low stock alerts

### Stock Management
- `GET /api/stock/movements` - List stock movements
- `POST /api/stock/receive` - Receive incoming stock
- `POST /api/stock/transfer` - Transfer warehouse to cashier
- `POST /api/stock/adjust` - Adjust stock levels

### Sales
- `GET /api/sales` - List sales transactions
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale

### Attendance
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/my-status` - Current user status
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out

### Dashboard & Reports
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/profit-loss` - Profit/loss report
- `GET /api/dashboard/recent-activities` - Recent activities

### Users
- `GET /api/users` - List users (manager/owner)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/password` - Change password
- `DELETE /api/users/:id` - Delete user (owner only)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **Role-Based Access**: Permissions based on user roles
- **SQL Injection Prevention**: Parameterized queries
- **Session Management**: Token expiration and renewal

## Mobile Responsiveness

The application is fully responsive with:
- **Mobile-optimized navigation**: Collapsible sidebar
- **Touch-friendly buttons**: Larger touch targets
- **Responsive tables**: Horizontal scrolling on small screens
- **Adaptive layouts**: Grid columns adjust to screen size
- **Mobile POS**: Simplified interface for mobile cashiers

## Recommended Additions

### Future Enhancements
1. **Barcode Scanner Integration**: Quick product lookup
2. **Receipt Printing**: Direct printer integration
3. **Multi-location Support**: Multiple warehouse/store management
4. **Email Notifications**: Alerts for low stock, sales reports
5. **Export Functions**: Excel/PDF export for reports
6. **Backup/Restore**: Automated database backups
7. **Analytics Dashboard**: Charts and graphs for trends
8. **Customer Management**: Customer database and loyalty program
9. **Supplier Management**: Supplier contact and order tracking
10. **Advanced Reporting**: Customizable report builder

### UI/UX Improvements
1. **Dark Mode**: Toggle for dark/light theme
2. **Customizable Dashboard**: Drag-and-drop widgets
3. **Keyboard Shortcuts**: Fast navigation for power users
4. **Offline Support**: PWA for offline operations
5. **Multi-language**: Internationalization support

## Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review API endpoints
3. Contact system administrator

## License

ISC License - See LICENSE file for details

---

**Built with ❤️ for efficient wholesale management**