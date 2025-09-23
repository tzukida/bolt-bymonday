/*
  # Initialize Sample Data

  1. Sample Data
    - Insert default admin and staff users
    - Insert sample products for coffee shop
    - Insert sample notifications

  2. Security
    - All tables already have RLS enabled
    - Policies are already in place
*/

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

-- Insert sample notifications
INSERT INTO notifications (title, message, type, read) VALUES
  ('Welcome to ByMonday', 'Your inventory and POS system is ready to use!', 'system', false),
  ('Low Stock Alert', 'Some products are running low on stock', 'low_stock', false)
ON CONFLICT DO NOTHING;

-- Insert sample activity log
INSERT INTO activity_logs (action, user_id, user_role, type) VALUES
  ('System initialized with sample data', 'system', 'admin', 'system')
ON CONFLICT DO NOTHING;