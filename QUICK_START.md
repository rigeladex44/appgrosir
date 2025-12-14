# Quick Start Guide - AppGrosir

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js installed (v14 or higher)
- Terminal/Command prompt access

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rigeladex44/appgrosir.git
cd appgrosir

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

### Access the Application

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

## 🎯 First Steps After Login

### 1. Add Your First Product
1. Click **Products** in the sidebar
2. Click **+ Add Product** button
3. Fill in product details:
   - SKU: `PROD001`
   - Name: `Sample Product`
   - Category: `Test`
   - Unit: `pcs`
   - Purchase Price: `10.00`
   - Selling Price: `15.00`
4. Click **Add Product**

### 2. Receive Stock to Warehouse
1. Navigate to **Stock Management**
2. Click **Receive Stock** card
3. Select your product
4. Enter quantity: `100`
5. Add reference: `PO-001`
6. Click **Receive Stock**

### 3. Transfer Stock to Cashier
1. Still in **Stock Management**
2. Click **Transfer Stock** card
3. Select your product
4. Enter quantity: `20`
5. Click **Transfer Stock**

### 4. Make Your First Sale
1. Go to **Sales / POS**
2. Click on your product in the grid
3. Adjust quantity in cart if needed
4. Select payment method: `Cash`
5. Click **Complete Sale**

### 5. View Reports
1. Navigate to **Profit & Loss**
2. Click **Generate Report**
3. View your profit metrics!

## 📊 Key Features Overview

| Feature | Location | Purpose |
|---------|----------|---------|
| Dashboard | First page after login | Overview of all metrics |
| Products | Sidebar menu | Manage product catalog |
| Stock Management | Sidebar menu | Handle inventory movements |
| Sales/POS | Sidebar menu | Process customer transactions |
| Profit & Loss | Sidebar menu | View financial reports |
| Attendance | Sidebar menu | Track employee time |
| Users | Sidebar menu | Manage team access |

## 👥 User Roles

### Owner (Default: admin)
- Full access to everything
- Can manage users
- Can delete records
- Views all reports

### Manager
- Most features accessible
- Can manage products and stock
- Can view reports
- Cannot delete users

### Staff
- Inventory management
- Stock operations
- Basic reporting

### Cashier
- POS/Sales focus
- View products
- Process transactions
- Limited access

## 🔧 Common Tasks

### Create a New User
1. Navigate to **Users** (Owner/Manager only)
2. Click **+ Add User**
3. Fill in details and assign role
4. New user can now login

### Check Employee Attendance
1. Go to **Attendance**
2. Click **Check In** when arriving
3. Click **Check Out** when leaving
4. View today's attendance list

### Generate Monthly Report
1. Open **Profit & Loss**
2. Select start and end dates
3. Click **Generate Report**
4. Review revenue, costs, and profit

### Handle Low Stock
1. Check **Dashboard** for alerts
2. Note products with low stock badge
3. Go to **Stock Management**
4. Use **Receive Stock** to replenish

## 📱 Mobile Usage

### Access on Mobile
1. Open browser on your phone
2. Navigate to: `http://[server-ip]:3000`
3. Login with credentials
4. Tap hamburger menu (☰) to navigate

### Mobile-Optimized Features
- Touch-friendly buttons
- Responsive tables
- Collapsible menu
- Optimized POS for mobile cashiers

## 🔐 Security Tips

### Change Default Password
1. After first login, go to **Users**
2. Find admin user
3. Click edit icon
4. Change password immediately

### Best Practices
- Use strong passwords (8+ characters, mixed case, numbers)
- Assign appropriate roles to users
- Regularly review user access
- Keep software updated
- Backup database regularly

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
netstat -an | grep 3000

# Try different port
PORT=3001 npm start
```

### Can't Login
- Verify username: `admin`
- Verify password: `admin123`
- Check browser console for errors
- Clear browser cache

### Database Issues
- Delete `database.db` file
- Restart server (will recreate with defaults)

### Rate Limiting Error
- Wait 15 minutes
- Server will reset rate limits
- Login attempts limited to 5 per 15 min

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Complete setup and usage guide |
| [FEATURES.md](FEATURES.md) | Detailed feature documentation |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Technical implementation details |
| [QUICK_START.md](QUICK_START.md) | This guide |

## 🌟 Tips & Tricks

### Keyboard Navigation
- **Tab**: Move between form fields
- **Enter**: Submit forms
- **Esc**: Close modals (future enhancement)

### Efficient POS Usage
1. Use search box to find products quickly
2. Click products to add (no dragging needed)
3. Use +/- buttons for quantity adjustments
4. Keep customer name optional for speed

### Dashboard Insights
- Check **Low Stock Alerts** daily
- Monitor **Today's Sales** for targets
- Review **Monthly Sales** for trends
- Track **Attendance** for staffing

## 🎨 Customization

### Change Port
```bash
# Edit .env file
PORT=8080

# Or set environment variable
PORT=8080 npm start
```

### Change JWT Secret (Important!)
```bash
# Edit .env file
JWT_SECRET=your-very-secure-random-string-here
```

### Database Location
Default: `./database.db` (in project root)
Automatic creation on first run

## 🚨 Production Deployment

### Before Going Live
1. ✅ Change JWT_SECRET in .env
2. ✅ Change admin password
3. ✅ Set NODE_ENV=production
4. ✅ Enable HTTPS/SSL
5. ✅ Set up reverse proxy (nginx)
6. ✅ Configure firewall
7. ✅ Set up database backups
8. ✅ Configure logging

### Recommended Stack
- **Server**: Ubuntu 20.04+ / CentOS 8+
- **Process Manager**: PM2
- **Reverse Proxy**: nginx
- **SSL**: Let's Encrypt
- **Monitoring**: PM2 + custom logging

## 💡 Next Steps

### Explore Features
- [x] Try all menu items
- [x] Create test products
- [x] Process sample sales
- [x] Generate reports
- [x] Add team members

### Customize
- [ ] Add your real products
- [ ] Set appropriate stock alerts
- [ ] Configure user roles
- [ ] Adjust prices
- [ ] Set up regular backups

### Expand
- [ ] Review recommended enhancements
- [ ] Consider barcode scanner
- [ ] Plan for receipt printing
- [ ] Think about multi-location
- [ ] Explore mobile apps

## 📞 Support

### Getting Help
1. Check documentation files
2. Review error messages in console
3. Verify configuration in .env
4. Check server logs for details

### Common Questions

**Q: Can I use a different database?**  
A: Yes, but requires code changes. SQLite is lightweight and perfect for most uses.

**Q: How many products can I add?**  
A: Practically unlimited. SQLite handles millions of rows efficiently.

**Q: Does it work offline?**  
A: Server must be running. Client needs connection to server. PWA features can be added.

**Q: Can I export data?**  
A: Not yet built-in. Database file can be backed up. Excel export is a recommended enhancement.

**Q: Is it secure for production?**  
A: Yes, with proper deployment practices (HTTPS, firewall, strong passwords, regular updates).

## 🎉 Success!

You're now ready to use AppGrosir for your wholesale business!

**Remember:**
- Start small and learn the system
- Add real data gradually
- Train your team properly
- Backup regularly
- Keep documentation handy

---

**Questions?** Review the full documentation in README.md and FEATURES.md

**Ready to scale?** Check IMPLEMENTATION_SUMMARY.md for technical details

**Happy selling!** 🛒💰
