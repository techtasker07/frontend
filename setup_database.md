# Database Setup Instructions

## Method 1: Using Render Dashboard (Recommended)

1. **Go to your Render Dashboard**
2. **Navigate to your PostgreSQL database**
3. **Click on "Connect" or "Query"**
4. **Copy and paste the entire content of `database_setup.sql`**
5. **Execute the SQL commands**

## Method 2: Using psql Command Line

```bash
# Connect to your Render database
psql "postgresql://mipripity_web_db_gwcq_user:XchI0m4vvfUCpW0PyPjByvpBcQr3qayR@dpg-d2evj0bipnbc73agng7g-a.frankfurt-postgres.render.com/mipripity_web_db_gwcq"

# Then copy and paste the SQL commands from database_setup.sql
```

## Method 3: Using pgAdmin or Database Client

1. **Connect using your database credentials:**
   - Host: `dpg-d2evj0bipnbc73agng7g-a.frankfurt-postgres.render.com`
   - Port: `5432`
   - Database: `mipripity_web_db_gwcq`
   - Username: `mipripity_web_db_gwcq_user`
   - Password: `XchI0m4vvfUCpW0PyPjByvpBcQr3qayR`

2. **Execute the SQL file**

## What the Schema Includes:

### Tables Created:
- ✅ **users** - User accounts with authentication
- ✅ **categories** - Property categories (Residential, Commercial, Land, Industrial)
- ✅ **vote_options** - Voting options for each category
- ✅ **properties** - User-submitted properties
- ✅ **property_images** - Property photos
- ✅ **votes** - User votes on properties
- ✅ **prospect_properties** - AI-generated prospect properties
- ✅ **property_prospects** - Investment ideas for prospect properties

### Sample Data Included:
- ✅ **2 Test Users** (password: `password123`)
  - john.doe@example.com
  - jane.smith@example.com
- ✅ **4 Categories** with vote options
- ✅ **2 Sample Properties** with images
- ✅ **2 Prospect Properties** with investment ideas
- ✅ **Sample Votes** and relationships

### Images Used:
- All images use Picsum Photos (https://picsum.photos) for realistic placeholder images
- Images are properly sized (800x600 for properties, 200x200 for profiles)

## After Setup:

1. **Deploy your updated code to Vercel**
2. **Test login with:**
   - Email: `john.doe@example.com`
   - Password: `password123`
3. **Verify all features work:**
   - Dashboard loads
   - Properties display
   - Prospect properties work
   - AI Prospect feature works
   - Voting system works

## Verification Commands:

After setup, you can verify with these SQL commands:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM properties;
SELECT COUNT(*) FROM prospect_properties;
SELECT COUNT(*) FROM categories;
```

Expected results:
- 2 users
- 2 properties  
- 2 prospect properties
- 4 categories
