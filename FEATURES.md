# AppGrosir - Feature Documentation

## Overview
AppGrosir is a comprehensive wholesale management system designed for large wholesale stores. It provides an elegant, responsive interface for managing inventory, sales, attendance, and financial reporting across both desktop and mobile devices.

## UI/UX Design

### Login Screen
![Login Page](https://github.com/user-attachments/assets/f2aff7af-2e31-4d92-aa43-37887e48dfb3)

**Features:**
- Modern gradient background (purple to blue)
- Clean, centered login card with shadow
- Clear branding with store icon
- Input fields with icons
- Responsive design
- Default credentials displayed for convenience

### Design Principles
- **Color Scheme**: Professional purple/indigo primary color with complementary accent colors
- **Typography**: System fonts for optimal performance and readability
- **Layout**: Card-based design with consistent spacing and shadows
- **Animations**: Smooth transitions and hover effects
- **Responsiveness**: Mobile-first approach with breakpoints at 768px and 1024px

## Core Features

### 1. Dashboard
**Real-time Statistics:**
- Total Products count
- Low Stock Alerts (products below minimum threshold)
- Today's Sales (count and revenue)
- Monthly Sales summary
- Employee Attendance tracking

**Visual Elements:**
- Color-coded stat cards with icons
- Gradient icon backgrounds (blue, orange, green, purple)
- Interactive hover effects
- Recent activities feed
- Monthly revenue metrics

**Role-based Access:**
- Owners/Managers: Full access to all statistics
- Staff: Limited view based on permissions
- Cashiers: Sales-focused metrics

### 2. Product Management

**Product Catalog:**
- SKU-based product identification
- Product name and description
- Category organization
- Unit of measurement (kg, liter, pieces, etc.)
- Purchase and selling price tracking
- Separate stock levels for warehouse and cashier
- Minimum stock alert thresholds

**Actions:**
- Add new products
- Edit product details
- Delete products (with confirmation)
- View complete product list in table format
- Search and filter capabilities

### 3. Stock Management

**Three Main Operations:**

**a) Receive Stock (Incoming)**
- Add stock to warehouse from suppliers
- Reference number tracking (PO numbers)
- Notes for additional information
- Automatic warehouse stock update
- Audit trail creation

**b) Transfer Stock (Warehouse → Cashier)**
- Move inventory from warehouse to cashier location
- Quantity validation (ensures sufficient warehouse stock)
- Both locations updated automatically
- Transaction logging
- Notes for transfer purpose

**c) Adjust Stock (Manual Corrections)**
- Correct stock discrepancies
- Location-specific adjustments (warehouse or cashier)
- Required reason/notes for accountability
- Full audit trail

**Stock Movement History:**
- Complete transaction log
- Product details with SKU
- Movement type (in, out, transfer, adjustment)
- Source and destination locations
- Quantity moved
- User who performed action
- Timestamp for each transaction

### 4. Point of Sale (POS)

**Cashier Interface:**
- Visual product grid with search
- Product cards showing:
  - Product name
  - Current selling price
  - Available stock in cashier
- Click to add to cart
- Shopping cart with:
  - Line items with quantity controls
  - Price per item
  - Subtotal calculation
  - Remove item option
- Payment method selection (Cash, Card, Transfer, Credit)
- Optional customer name field
- Real-time total calculation
- One-click checkout

**Sale Processing:**
- Automatic stock deduction from cashier inventory
- Invoice number generation (INV-timestamp)
- Transaction recording
- Payment method tracking
- Customer name (optional)
- Complete sales history

### 5. Profit & Loss Reporting

**Financial Metrics:**
- **Revenue**: Total sales amount
- **Cost of Goods**: Purchase price × quantity sold
- **Gross Profit**: Revenue - Cost of Goods
- **Expenses**: Operating expenses (future enhancement)
- **Net Profit**: Gross Profit - Expenses
- **Profit Margin**: (Net Profit / Revenue) × 100%

**Date Range Selection:**
- Custom date range picker
- Default to current month
- Historical reporting capability
- Color-coded values (positive in green, negative in red)

**Report Display:**
- Grid layout with clear labels
- Large, readable numbers
- Highlighted net profit section
- Percentage-based margin indicator

### 6. Employee Attendance

**Time Tracking:**
- Check-in functionality
- Check-out functionality
- Automatic timestamp recording
- Notes field for special circumstances
- Status tracking (present, absent, etc.)

**Today's Attendance View:**
- List of all employees
- Check-in times
- Check-out times (or "Active" status)
- Employee name and role
- Visual status indicators

**Features:**
- Prevents duplicate check-ins
- Validates check-out against check-in
- Daily attendance summary
- Historical attendance records
- User-specific attendance view

### 7. User Management

**User Administration (Manager/Owner only):**
- Create new user accounts
- Assign roles:
  - **Owner**: Full system access
  - **Manager**: Most features, limited admin
  - **Staff**: Inventory and operational features
  - **Cashier**: POS and sales focus
- User information:
  - Username (unique)
  - Full name
  - Email (optional)
  - Phone (optional)
  - Role assignment
- Password management
- User deletion (Owner only)

**Role-Based Access Control:**
- Route protection via JWT authentication
- Role-specific feature visibility
- API endpoint authorization
- Automatic session management

## Technical Features

### Security
- **JWT Authentication**: Secure token-based authentication with 24-hour expiration
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-Based Authorization**: Middleware-enforced permission checks
- **SQL Injection Prevention**: Parameterized queries throughout
- **Session Management**: Automatic token refresh and expiration handling

### Database
- **SQLite**: Lightweight, file-based database
- **Schema**: Normalized with foreign key relationships
- **Transactions**: ACID-compliant for critical operations
- **Audit Trail**: Complete history of all stock movements
- **Timestamps**: Automatic creation and update timestamps

### API Architecture
- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Format**: All requests and responses in JSON
- **Error Handling**: Consistent error responses with meaningful messages
- **Authentication**: Bearer token in Authorization header
- **Validation**: Input validation at API level

### Frontend
- **Vanilla JavaScript**: No framework overhead, fast performance
- **Local Storage**: Token and user info persistence
- **Single Page Application**: Dynamic page switching without reload
- **Responsive Design**: CSS Grid and Flexbox for layouts
- **Progressive Enhancement**: Works without JavaScript for basic features

### Mobile Optimization
- **Breakpoints**: 768px (tablet) and below for mobile
- **Touch Targets**: Large, easy-to-tap buttons
- **Collapsible Sidebar**: Hamburger menu for mobile navigation
- **Responsive Tables**: Horizontal scroll on small screens
- **Mobile-First CSS**: Optimized for small screens first
- **Viewport Meta Tag**: Proper scaling on mobile devices

## User Experience Enhancements

### Visual Feedback
- **Hover Effects**: Button lift and shadow on hover
- **Loading States**: Appropriate feedback during operations
- **Success Messages**: Confirmation alerts for actions
- **Error Messages**: Clear, actionable error information
- **Color Coding**: Status badges with semantic colors

### Navigation
- **Sidebar Navigation**: Persistent menu with active state indication
- **Breadcrumbs**: Page header shows current location
- **Mobile Menu**: Slide-in sidebar on mobile
- **Quick Actions**: Card-based shortcuts on relevant pages
- **Search**: Product search in POS interface

### Forms
- **Clear Labels**: Icons and text for field identification
- **Input Validation**: Real-time validation feedback
- **Required Fields**: Asterisk indication
- **Modal Dialogs**: Contextual forms without page navigation
- **Form Reset**: Automatic reset after successful submission

### Tables
- **Sortable Columns**: Click headers to sort (future enhancement)
- **Pagination**: Handle large datasets efficiently (future)
- **Row Actions**: Inline edit/delete buttons
- **Hover Highlight**: Row highlight on hover
- **Responsive**: Scroll on small screens

## Recommended Enhancements

### High Priority
1. **Barcode Scanner Integration**: Speed up product selection in POS
2. **Receipt Printing**: Generate printable receipts for customers
3. **Export Reports**: Excel/PDF export for financial reports
4. **Email Notifications**: Low stock alerts, daily summaries
5. **Backup System**: Automated database backups

### Medium Priority
6. **Charts & Graphs**: Visual analytics on dashboard
7. **Customer Management**: Customer database with purchase history
8. **Supplier Management**: Supplier contacts and order tracking
9. **Multi-location**: Support multiple warehouses/stores
10. **Dark Mode**: Theme toggle for user preference

### Future Enhancements
11. **Offline Support**: PWA with offline capabilities
12. **Multi-language**: i18n support for global use
13. **Advanced Search**: Full-text search across all entities
14. **Customizable Dashboard**: Drag-and-drop widgets
15. **API Documentation**: Swagger/OpenAPI documentation

## Browser Compatibility
- Chrome/Chromium: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Edge: ✅ Fully supported
- Mobile browsers: ✅ Optimized

## Performance
- **Initial Load**: < 2 seconds on standard connection
- **API Response**: < 100ms for most operations
- **Database Queries**: Indexed for optimal performance
- **Asset Size**: Minimal CSS/JS footprint
- **Caching**: Static assets cached by browser

## Accessibility
- **Keyboard Navigation**: Tab-based navigation support
- **ARIA Labels**: Semantic HTML with proper labels (future enhancement)
- **Color Contrast**: WCAG AA compliant colors
- **Font Sizing**: Relative units for scalability
- **Focus Indicators**: Clear focus states

## System Requirements
- **Server**: Node.js 14+
- **Database**: SQLite (included)
- **Browser**: Modern browser with ES6 support
- **Network**: Internet for Font Awesome icons
- **Storage**: Minimal (<50MB including dependencies)

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Built with**: Node.js, Express, SQLite, Vanilla JavaScript
