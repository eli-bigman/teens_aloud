# TEENS ALOUD FOUNDATION - Associates Admin Dashboard

A comprehensive member management system built with Next.js and Supabase for the Teens Aloud Foundation.

## Features

- **Member Management**: Add, view, and manage associate members
- **Family Tracking**: Track spouses and children relationships
- **Birthday & Anniversary Reminders**: Never miss important dates
- **Employment Status**: Monitor job status and career preferences
- **Contact Management**: Phone numbers, emails, and WhatsApp status
- **Analytics Dashboard**: Visual insights into member demographics
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/eli-bigman/teens_aloud.git
cd teens_aloud/teens
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Copy and run the SQL from `scripts/create-database-schema.sql`
   - This will create the `associates`, `spouses`, and `children` tables

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Database Setup

The application requires three main tables in your Supabase database:

### 1. Associates Table
Stores main member information including personal details, contact info, education, and employment status.

### 2. Spouses Table  
Stores spouse information for married associates.

### 3. Children Table
Stores children information linked to associates.

**To set up the database:**
1. Open your Supabase project
2. Go to SQL Editor
3. Run the SQL script from `scripts/create-database-schema.sql`

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── birthday-dashboard.tsx
│   ├── member-table.tsx
│   ├── add-member-modal.tsx
│   └── ...
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client and setup
│   └── utils.ts
└── scripts/              # Database setup scripts
```

## Usage

### Adding Members

1. Navigate to the **Members** tab
2. Click **"Add New Member"**
3. Fill out the multi-step form:
   - **Personal Details**: Name, email, birth date, etc.
   - **Contact Information**: Phone numbers, address, WhatsApp status
   - **Professional Info**: Education, employment status
   - **Family Details**: Spouse and children (if applicable)

### Managing Data

- **Search & Filter**: Use the search bar and filters to find specific members
- **Birthday Tracking**: View upcoming birthdays in the Birthday dashboard
- **Analytics**: Monitor demographics and statistics in the Analytics tab
- **Family Insights**: Track family relationships and children

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Notifications**: Sonner
- **Icons**: Lucide React

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (optional, for admin operations) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please contact the development team or create an issue in the repository.
