# Admin & Rider App Tables Plan

## Existing Database Structure

Based on the current Supabase schema, the following tables are already in place for admin and rider functionality:

### Users Table (`users`)
- **id**: UUID (primary key)
- **email**: VARCHAR(255) UNIQUE NOT NULL
- **password_hash**: TEXT NOT NULL
- **full_name**: VARCHAR(255) NOT NULL
- **phone**: VARCHAR(20)
- **role**: VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin', 'rider'))
- **is_active**: BOOLEAN DEFAULT true
- **created_at**: TIMESTAMPTZ DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ DEFAULT NOW()

### Admins Table (`admins`)
- **id**: UUID (primary key)
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **permissions**: JSONB DEFAULT '[]'
- **department**: VARCHAR(100)
- **employee_id**: VARCHAR(50) UNIQUE
- **created_at**: TIMESTAMPTZ DEFAULT NOW()

### Riders Table (`riders`)
- **id**: UUID (primary key)
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **vehicle_type**: VARCHAR(50) NOT NULL
- **vehicle_number**: VARCHAR(50) UNIQUE
- **license_number**: VARCHAR(100) UNIQUE NOT NULL
- **current_latitude**: DECIMAL(10, 8)
- **current_longitude**: DECIMAL(11, 8)
- **is_available**: BOOLEAN DEFAULT true
- **is_online**: BOOLEAN DEFAULT false
- **rating**: DECIMAL(3, 2) DEFAULT 0.00
- **total_deliveries**: INTEGER DEFAULT 0
- **joining_date**: TIMESTAMPTZ DEFAULT NOW()
- **created_at**: TIMESTAMPTZ DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ DEFAULT NOW()

## Admin App Functionality

### Required Tables/Features:
1. **User Management**
   - View all users
   - Activate/deactivate users
   - Assign admin/rider roles

2. **Product Management**
   - CRUD operations on products
   - Manage categories
   - Update inventory levels

3. **Order Management**
   - View all orders
   - Update order status
   - Assign riders to orders
   - Process refunds/cancellations

4. **Store Management**
   - Manage store locations
   - Set delivery areas
   - Configure store hours

5. **Analytics & Reports**
   - Sales reports
   - Rider performance
   - Customer analytics

### Suggested Enhancements:
- Add `last_login` field to `users` table for tracking activity
- Add `admin_notes` field to `orders` table for internal comments
- Create `audit_log` table for tracking admin actions

## Rider App Functionality

### Required Tables/Features:
1. **Order Assignment**
   - Receive new order notifications
   - Accept/reject delivery requests
   - View order details and delivery address

2. **Navigation & Tracking**
   - Integrated maps for navigation
   - Real-time location tracking
   - ETA calculations

3. **Delivery Management**
   - Mark orders as picked up
   - Mark orders as delivered
   - Handle customer signatures/verification

4. **Earnings & Performance**
   - View delivery history
   - Track earnings
   - See performance ratings

5. **Availability Management**
   - Go online/offline
   - Set working hours
   - Manage break times

### Suggested Enhancements:
- Add `rider_availability` table for scheduling
- Add `delivery_verification` table for proof of delivery (photos, signatures)
- Add `earnings` table to track rider payments

## Implementation Plan

### Phase 1: Basic Functionality (Current)
- ✅ User authentication with role-based access
- ✅ Basic admin and rider tables
- ✅ Order management system

### Phase 2: Admin App Features
- [ ] Admin dashboard with analytics
- [ ] User management interface
- [ ] Product catalog management
- [ ] Order processing system
- [ ] Reporting tools

### Phase 3: Rider App Features
- [ ] Rider onboarding flow
- [ ] Order assignment system
- [ ] Real-time tracking integration
- [ ] Earnings and performance dashboard
- [ ] In-app navigation

### Phase 4: Advanced Features
- [ ] Multi-store support
- [ ] Dynamic pricing based on distance
- [ ] Rider scheduling system
- [ ] Customer loyalty programs
- [ ] Advanced analytics

## Technical Considerations

1. **Authentication**: Use Supabase Auth with role-based permissions
2. **Real-time Updates**: Utilize Supabase Realtime for order updates and rider tracking
3. **Location Services**: Integrate with Mapbox/Google Maps for navigation
4. **Push Notifications**: Implement for order alerts and rider assignments
5. **Security**: Ensure proper RLS policies for data protection

## Next Steps

1. Review and enhance RLS policies for admin/rider access
2. Create API endpoints for admin and rider specific functionality
3. Develop separate React Native apps for admin and rider roles
4. Implement real-time features using Supabase Realtime
5. Add comprehensive logging and error handling

This plan provides a foundation for building robust admin and rider applications on top of the existing database structure.