-- Supabase Database Schema

-- Custom Types
CREATE TYPE user_role AS ENUM ('student', 'admin');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS setup for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when auth.user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Clubs table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    established INTEGER,
    image TEXT,
    created_by UUID REFERENCES profiles(id)
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clubs are viewable by everyone." ON clubs FOR SELECT USING (true);
CREATE POLICY "Admins can insert clubs." ON clubs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update clubs." ON clubs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admin Seed (You should replace `YOUR_ADMIN_UUID` with actual ID from Auth, or update manually in table)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@admin.com';

-- Club Members table
CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- member, admin, etc
    status TEXT DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Memberships viewable by everyone." ON club_members FOR SELECT USING (true);
CREATE POLICY "Users can join clubs." ON club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave clubs." ON club_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert memberships." ON club_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete memberships." ON club_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update memberships." ON club_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events viewable by everyone." ON events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events." ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update events." ON events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete events." ON events FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Event Attendees table
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendees viewable by everyone." ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can register." ON event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unregister." ON event_attendees FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage attendees." ON event_attendees FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Join Requests table (request → approval flow)
CREATE TABLE join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(club_id, user_id)
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Join requests viewable by everyone." ON join_requests FOR SELECT USING (true);
CREATE POLICY "Users can create join requests." ON join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own requests." ON join_requests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update join requests." ON join_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete join requests." ON join_requests FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
