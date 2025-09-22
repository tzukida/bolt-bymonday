/*
  # Initial Schema for ByMonday POS System

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text)
      - `role` (text, admin/staff)
      - `email` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (decimal)
      - `stock` (integer)
      - `image` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `items` (jsonb)
      - `total` (decimal)
      - `payment_method` (text)
      - `user_id` (text)
      - `created_at` (timestamp)
    
    - `activity_logs`
      - `id` (uuid, primary key)
      - `action` (text)
      - `user_id` (text)
      - `user_role` (text)
      - `type` (text)
      - `details` (jsonb)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text)
      - `message` (text)
      - `type` (text)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image text,
  category text DEFAULT 'General',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL,
  total decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id text NOT NULL,
  user_role text NOT NULL,
  type text DEFAULT 'system',
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update users" ON users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete users" ON users FOR DELETE TO authenticated USING (true);

-- Create policies for products table
CREATE POLICY "Anyone can read products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can delete products" ON products FOR DELETE TO authenticated USING (true);

-- Create policies for transactions table
CREATE POLICY "Anyone can read transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for activity_logs table
CREATE POLICY "Anyone can read activity logs" ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert activity logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create policies for notifications table
CREATE POLICY "Anyone can read notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON notifications FOR UPDATE TO authenticated USING (true);

-- Insert sample users
INSERT INTO users (username, password, role, email) VALUES
  ('admin', 'admin123', 'admin', 'admin@bymonday.com'),
  ('staff', 'staff123', 'staff', 'staff@bymonday.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, stock, image, category) VALUES
  ('Espresso', 85.00, 25, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400', 'Coffee'),
  ('Cappuccino', 120.00, 18, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400', 'Coffee'),
  ('Latte', 135.00, 8, 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=400', 'Coffee'),
  ('Americano', 95.00, 30, 'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg?auto=compress&cs=tinysrgb&w=400', 'Coffee'),
  ('Croissant', 65.00, 12, 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400', 'Pastry'),
  ('Blueberry Muffin', 75.00, 3, 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400', 'Pastry')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();