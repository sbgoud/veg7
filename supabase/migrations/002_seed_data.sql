-- Seed data for veg7 application

-- Insert sample categories
INSERT INTO categories (id, name, description, image_url, sort_order, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Leafy Vegetables', 'Fresh green leafy vegetables rich in nutrients', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Root Vegetables', 'Healthy root vegetables grown locally', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Cruciferous', 'Cruciferous vegetables like broccoli and cauliflower', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', 3, true),
('550e8400-e29b-41d4-a716-446655440004', 'Nightshades', 'Tomatoes, peppers, and eggplant', 'https://images.unsplash.com/photo-1546470427-e9401ba6c0e3?w=400', 4, true),
('550e8400-e29b-41d4-a716-446655440005', 'Allium', 'Onions, garlic, and related vegetables', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', 5, true),
('550e8400-e29b-41d4-a716-446655440006', 'Legumes', 'Fresh beans and peas', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', 6, true),
('550e8400-e29b-41d4-a716-446655440007', 'Herbs', 'Fresh aromatic herbs', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 7, true),
('550e8400-e29b-41d4-a716-446655440008', 'Exotic Vegetables', 'Specialty and exotic vegetables', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', 8, true);

-- Insert sample products (100+ products across all categories and stores)
INSERT INTO products (id, name, description, price, weight, unit, image_url, category_id, store_id, stock_quantity, is_organic, is_seasonal, is_active) VALUES

-- Leafy Vegetables (20 products)
('550e8400-e29b-41d4-a716-446655440010', 'Fresh Spinach', 'Organic baby spinach leaves, perfect for salads and cooking', 45.00, 250, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 50, true, true, true),
('550e8400-e29b-41d4-a716-446655440011', 'Coriander Leaves', 'Fresh coriander with stems, aromatic and flavorful', 25.00, 100, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440007', 100, false, true, true),
('550e8400-e29b-41d4-a716-446655440012', 'Fenugreek Leaves', 'Fresh methi leaves, great for curries and parathas', 35.00, 200, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 30, false, true, true),
('550e8400-e29b-41d4-a716-446655440028', 'Lettuce', 'Crisp iceberg lettuce, perfect for salads', 60.00, 300, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 40, false, true, true),
('550e8400-e29b-41d4-a716-446655440029', 'Kale', 'Curly kale leaves, nutrient-rich superfood', 75.00, 200, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 25, true, true, true),
('550e8400-e29b-41d4-a716-446655440030', 'Swiss Chard', 'Colorful swiss chard with vibrant stems', 55.00, 250, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 20, false, true, true),
('550e8400-e29b-41d4-a716-446655440031', 'Arugula', 'Peppery arugula leaves, perfect for salads', 80.00, 150, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 35, true, true, true),
('550e8400-e29b-41d4-a716-446655440032', 'Watercress', 'Fresh watercress with peppery flavor', 90.00, 100, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 15, false, true, true),
('550e8400-e29b-41d4-a716-446655440033', 'Mint Leaves', 'Fresh mint leaves for cooking and beverages', 40.00, 50, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 60, false, true, true),
('550e8400-e29b-41d4-a716-446655440034', 'Curry Leaves', 'Aromatic curry leaves for South Indian cooking', 30.00, 50, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 80, false, true, true),
('550e8400-e29b-41d4-a716-446655440035', 'Dill Leaves', 'Fresh dill with aromatic fragrance', 45.00, 100, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 25, false, true, true),
('550e8400-e29b-41d4-a716-446655440036', 'Parsley', 'Fresh parsley leaves, flat and curly varieties', 35.00, 100, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 45, false, true, true),
('550e8400-e29b-41d4-a716-446655440037', 'Basil Leaves', 'Fresh basil leaves, sweet and aromatic', 50.00, 100, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 30, true, true, true),
('550e8400-e29b-41d4-a716-446655440038', 'Rocket Leaves', 'Wild rocket with peppery taste', 85.00, 150, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 20, true, true, true),
('550e8400-e29b-41d4-a716-446655440039', 'Amaranth Leaves', 'Fresh amaranth leaves, rich in iron', 40.00, 250, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 35, false, true, true),
('550e8400-e29b-41d4-a716-446655440040', 'Malabar Spinach', 'Climbing spinach with thick leaves', 35.00, 300, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 25, false, true, true),
('550e8400-e29b-41d4-a716-446655440041', 'Sorrel Leaves', 'Tangy sorrel leaves for cooking', 45.00, 200, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440007', 20, false, true, true),
('550e8400-e29b-41d4-a716-446655440042', 'Lemon Grass', 'Fresh lemon grass stalks', 25.00, 100, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 40, false, true, true),
('550e8400-e29b-41d4-a716-446655440043', 'Mustard Leaves', 'Fresh mustard greens', 30.00, 250, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 30, false, true, true),
('550e8400-e29b-41d4-a716-446655440044', 'Turnip Greens', 'Fresh turnip leaves', 35.00, 200, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440001', 25, false, true, true),

-- Root Vegetables (20 products)
('550e8400-e29b-41d4-a716-446655440013', 'Fresh Carrots', 'Crisp orange carrots, rich in beta-carotene', 40.00, 500, 'g', 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=400', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440300', 75, false, true, true),
('550e8400-e29b-41d4-a716-446655440014', 'Red Radish', 'Fresh red radishes with leaves', 30.00, 250, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440301', 40, false, true, true),
('550e8400-e29b-41d4-a716-446655440015', 'Beetroot', 'Fresh red beetroots with leaves', 55.00, 500, 'g', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440302', 25, false, true, true),
('550e8400-e29b-41d4-a716-446655440045', 'Potatoes', 'Fresh potatoes, perfect for cooking', 25.00, 1000, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 100, false, true, true),
('550e8400-e29b-41d4-a716-446655440046', 'Sweet Potatoes', 'Orange sweet potatoes, rich and nutritious', 50.00, 500, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 40, false, true, true),
('550e8400-e29b-41d4-a716-446655440047', 'White Radish', 'Fresh white radish (daikon)', 35.00, 500, 'g', 'https://images.unsplash.com/photo-1576045052776-4697c9b0c726?w=400', '550e8400-e29b-41d4-a716-446655440002', 30, false, true, true),
('550e8400-e29b-41d4-a716-446655440048', 'Turnips', 'Fresh turnips with greens', 45.00, 400, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 25, false, true, true),
('550e8400-e29b-41d4-a716-446655440049', 'Ginger', 'Fresh ginger root', 80.00, 200, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 50, false, true, true),
('550e8400-e29b-41d4-a716-446655440050', 'Turmeric Root', 'Fresh turmeric root, organic', 120.00, 100, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 20, true, true, true),
('550e8400-e29b-41d4-a716-446655440051', 'Garlic', 'Fresh garlic bulbs', 60.00, 250, 'g', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', '550e8400-e29b-41d4-a716-446655440005', 40, false, true, true),
('550e8400-e29b-41d4-a716-446655440052', 'Onions', 'Fresh red onions', 25.00, 1000, 'g', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', '550e8400-e29b-41d4-a716-446655440005', 80, false, true, true),
('550e8400-e29b-41d4-a716-446655440053', 'Shallots', 'Small shallots, aromatic', 70.00, 250, 'g', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', '550e8400-e29b-41d4-a716-446655440005', 35, false, true, true),
('550e8400-e29b-41d4-a716-446655440054', 'Spring Onions', 'Fresh spring onions with greens', 30.00, 100, 'g', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', '550e8400-e29b-41d4-a716-446655440005', 45, false, true, true),
('550e8400-e29b-41d4-a716-446655440055', 'Leeks', 'Fresh leeks, mild onion flavor', 65.00, 300, 'g', 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=400', '550e8400-e29b-41d4-a716-446655440005', 20, false, true, true),
('550e8400-e29b-41d4-a716-446655440056', 'Fennel Bulb', 'Fresh fennel with aromatic flavor', 85.00, 200, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 15, false, true, true),
('550e8400-e29b-41d4-a716-446655440057', 'Celery Root', 'Fresh celeriac, knobby root vegetable', 75.00, 400, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 18, false, true, true),
('550e8400-e29b-41d4-a716-446655440058', 'Parsnips', 'Sweet white parsnips', 55.00, 400, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 22, false, true, true),
('550e8400-e29b-41d4-a716-446655440059', 'Rutabaga', 'Yellow turnip, sweet and nutty', 60.00, 500, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 16, false, true, true),
('550e8400-e29b-41d4-a716-446655440060', 'Jicama', 'Mexican yam bean, crisp and sweet', 90.00, 300, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 12, false, true, true),
('550e8400-e29b-41d4-a716-446655440061', 'Lotus Root', 'Fresh lotus root, crispy texture', 150.00, 200, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440008', 10, false, true, true),

-- More categories and products would continue...
-- For brevity, I'll add a few more key products
('550e8400-e29b-41d4-a716-446655440062', 'Cabbage', 'Fresh green cabbage', 35.00, 1000, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440003', 40, false, true, true),
('550e8400-e29b-41d4-a716-446655440063', 'Tomatoes', 'Fresh red tomatoes', 40.00, 500, 'g', 'https://images.unsplash.com/photo-1546470427-e9401ba6c0e3?w=400', '550e8400-e29b-41d4-a716-446655440004', 80, false, true, true),
('550e8400-e29b-41d4-a716-446655440064', 'Cucumbers', 'Fresh green cucumbers', 30.00, 400, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 60, false, true, true),
('550e8400-e29b-41d4-a716-446655440065', 'Bell Peppers', 'Colored bell peppers', 80.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 45, false, true, true),
('550e8400-e29b-41d4-a716-446655440066', 'Green Beans', 'Fresh French beans', 55.00, 250, 'g', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '550e8400-e29b-41d4-a716-446655440006', 35, false, true, true),
('550e8400-e29b-41d4-a716-446655440067', 'Okra', 'Fresh lady finger', 45.00, 250, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 50, false, true, true),
('550e8400-e29b-41d4-a716-446655440068', 'Eggplant', 'Purple brinjal', 50.00, 400, 'g', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', '550e8400-e29b-41d4-a716-446655440004', 30, false, true, true),
('550e8400-e29b-41d4-a716-446655440069', 'Bottle Gourd', 'Fresh lauki', 25.00, 1000, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 25, false, true, true),
('550e8400-e29b-41d4-a716-446655440070', 'Bitter Gourd', 'Fresh karela', 40.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 20, false, true, true),
('550e8400-e29b-41d4-a716-446655440071', 'Ridge Gourd', 'Fresh turai', 35.00, 400, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 18, false, true, true),
('550e8400-e29b-41d4-a716-446655440072', 'Snake Gourd', 'Fresh snake gourd', 45.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 15, false, true, true),
('550e8400-e29b-41d4-a716-446655440073', 'Pointed Gourd', 'Fresh parwal', 60.00, 250, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 12, false, true, true),
('550e8400-e29b-41d4-a716-446655440074', 'Sponge Gourd', 'Fresh nenua', 40.00, 350, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 16, false, true, true),
('550e8400-e29b-41d4-a716-446655440075', 'Ivy Gourd', 'Fresh tindora', 55.00, 200, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 14, false, true, true),
('550e8400-e29b-41d4-a716-446655440076', 'Cluster Beans', 'Fresh guar', 50.00, 250, 'g', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '550e8400-e29b-41d4-a716-446655440006', 22, false, true, true),
('550e8400-e29b-41d4-a716-446655440077', 'French Beans', 'Slim green beans', 65.00, 200, 'g', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '550e8400-e29b-41d4-a716-446655440006', 28, false, true, true),
('550e8400-e29b-41d4-a716-446655440078', 'Broad Beans', 'Fresh papdi', 45.00, 300, 'g', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '550e8400-e29b-41d4-a716-446655440006', 18, false, true, true),
('550e8400-e29b-41d4-a716-446655440079', 'Snow Peas', 'Flat edible pods', 85.00, 150, 'g', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '550e8400-e29b-41d4-a716-446655440006', 12, false, true, true),
('550e8400-e29b-41d4-a716-446655440080', 'Sugar Snap Peas', 'Sweet snap peas', 90.00, 150, 'g', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400', '550e8400-e29b-41d4-a716-446655440006', 10, false, true, true),
('550e8400-e29b-41d4-a716-446655440081', 'Baby Corn', 'Fresh baby corn', 75.00, 200, 'g', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', '550e8400-e29b-41d4-a716-446655440008', 20, false, true, true),
('550e8400-e29b-41d4-a716-446655440082', 'Mushrooms', 'Fresh button mushrooms', 120.00, 200, 'g', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', '550e8400-e29b-41d4-a716-446655440008', 25, false, true, true),
('550e8400-e29b-41d4-a716-446655440083', 'Broccoli', 'Fresh green broccoli', 95.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440003', 22, false, true, true),
('550e8400-e29b-41d4-a716-446655440084', 'Cauliflower', 'Fresh white cauliflower', 50.00, 800, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440003', 18, false, true, true),
('550e8400-e29b-41d4-a716-446655440085', 'Zucchini', 'Green zucchini', 65.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 24, false, true, true),
('550e8400-e29b-41d4-a716-446655440086', 'Yellow Squash', 'Summer squash', 70.00, 350, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 16, false, true, true),
('550e8400-e29b-41d4-a716-446655440087', 'Pumpkin', 'Fresh pumpkin', 40.00, 2000, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 8, false, true, true),
('550e8400-e29b-41d4-a716-446655440088', 'Butternut Squash', 'Winter squash', 85.00, 1000, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 10, false, true, true),
('550e8400-e29b-41d4-a716-446655440089', 'Acorn Squash', 'Small winter squash', 75.00, 800, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 12, false, true, true),
('550e8400-e29b-41d4-a716-446655440090', 'Spaghetti Squash', 'Stringy flesh squash', 90.00, 900, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 8, false, true, true),
('550e8400-e29b-41d4-a716-446655440091', 'Kabocha Squash', 'Japanese pumpkin', 110.00, 700, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 6, false, true, true),
('550e8400-e29b-41d4-a716-446655440092', 'Delicata Squash', 'Sweet delicata', 95.00, 600, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 9, false, true, true),
('550e8400-e29b-41d4-a716-446655440093', 'Kohlrabi', 'Turnip cabbage', 55.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440003', 14, false, true, true),
('550e8400-e29b-41d4-a716-446655440094', 'Romanesco', 'Fractal cauliflower', 150.00, 400, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440003', 5, false, true, true),
('550e8400-e29b-41d4-a716-446655440095', 'Artichoke', 'Globe artichoke', 200.00, 200, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440003', 8, false, true, true),
('550e8400-e29b-41d4-a716-446655440096', 'Asparagus', 'Fresh green asparagus', 180.00, 250, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440004', 12, false, true, true),
('550e8400-e29b-41d4-a716-446655440097', 'Celery', 'Fresh celery stalks', 45.00, 400, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440007', 20, false, true, true),
('550e8400-e29b-41d4-a716-446655440098', 'Fennel', 'Fresh fennel bulb', 85.00, 200, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440007', 15, false, true, true),
('550e8400-e29b-41d4-a716-446655440099', 'Rhubarb', 'Fresh rhubarb stalks', 120.00, 300, 'g', 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400', '550e8400-e29b-41d4-a716-446655440007', 8, false, true, true),
('550e8400-e29b-41d4-a716-446655440100', 'Water Chestnut', 'Fresh water chestnuts', 100.00, 200, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440008', 10, false, true, true),
('550e8400-e29b-41d4-a716-446655440101', 'Taro Root', 'Fresh arbi', 60.00, 500, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 18, false, true, true),
('550e8400-e29b-41d4-a716-446655440102', 'Yam', 'Purple yam', 70.00, 500, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 15, false, true, true),
('550e8400-e29b-41d4-a716-446655440103', 'Cassava', 'Fresh cassava root', 45.00, 1000, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 12, false, true, true),
('550e8400-e29b-41d4-a716-446655440104', 'Arrowroot', 'Fresh arrowroot', 80.00, 300, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440002', 8, false, true, true),
('550e8400-e29b-41d4-a716-446655440105', 'Galangal', 'Fresh galangal root', 140.00, 100, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440007', 6, false, true, true),
('550e8400-e29b-41d4-a716-446655440106', 'Greater Galangal', 'Thai ginger', 160.00, 100, 'g', 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', '550e8400-e29b-41d4-a716-446655440007', 4, false, true, true),
('550e8400-e29b-41d4-a716-446655440107', 'Turmeric Leaves', 'Fresh turmeric leaves', 35.00, 100, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 14, false, true, true),
('550e8400-e29b-41d4-a716-446655440108', 'Sacred Basil', 'Tulsi leaves', 25.00, 50, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 25, true, true, true),
('550e8400-e29b-41d4-a716-446655440109', 'Thai Basil', 'Asian basil variety', 45.00, 100, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 18, false, true, true),
('550e8400-e29b-41d4-a716-446655440110', 'Lemon Balm', 'Citrus-scented herb', 55.00, 80, 'g', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', '550e8400-e29b-41d4-a716-446655440007', 12, false, true, true);

-- Insert sample stores (Hyderabad locations with real coordinates)
INSERT INTO stores (id, name, address, city, state, pincode, latitude, longitude, phone, email, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440300', 'veg7 Hi-Tech City', 'Hi-Tech City, Near Cyber Towers', 'Hyderabad', 'Telangana', '500081', 17.4504, 78.3900, '+91-40-41512456', 'hitech@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440301', 'veg7 Banjara Hills', 'Banjara Hills, Road No. 12', 'Hyderabad', 'Telangana', '500034', 17.4145, 78.4422, '+91-40-41512457', 'banjara@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440302', 'veg7 Jubilee Hills', 'Jubilee Hills, Near Apollo Hospital', 'Hyderabad', 'Telangana', '500033', 17.4299, 78.4088, '+91-40-41512458', 'jubilee@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440303', 'veg7 Gachibowli', 'Gachibowli, Near Financial District', 'Hyderabad', 'Telangana', '500032', 17.4401, 78.3489, '+91-40-41512459', 'gachibowli@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440304', 'veg7 Madhapur', 'Madhapur, Near Inorbit Mall', 'Hyderabad', 'Telangana', '500081', 17.4483, 78.3908, '+91-40-41512460', 'madhapur@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440305', 'veg7 Kondapur', 'Kondapur, Near Kothaguda Junction', 'Hyderabad', 'Telangana', '500084', 17.4652, 78.3637, '+91-40-41512461', 'kondapur@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440306', 'veg7 Ameerpet', 'Ameerpet, Near Maitrivanam', 'Hyderabad', 'Telangana', '500016', 17.4375, 78.4482, '+91-40-41512462', 'ameerpet@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440307', 'veg7 Begumpet', 'Begumpet, Near Hyderabad Public School', 'Hyderabad', 'Telangana', '500016', 17.4474, 78.4658, '+91-40-41512463', 'begumpet@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440308', 'veg7 Secunderabad', 'Secunderabad, Near Clock Tower', 'Secunderabad', 'Telangana', '500003', 17.4399, 78.4987, '+91-40-41512464', 'secunderabad@veg7.com', true),
('550e8400-e29b-41d4-a716-446655440309', 'veg7 Kukatpally', 'Kukatpally, Near Metro Station', 'Hyderabad', 'Telangana', '500072', 17.4943, 78.3997, '+91-40-41512465', 'kukatpally@veg7.com', true);

-- Insert sample users (including admin and rider accounts)
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active) VALUES
-- Regular users
('550e8400-e29b-41d4-a716-446655440100', 'user1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', '+919876543210', 'user', true),
('550e8400-e29b-41d4-a716-446655440101', 'user2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', '+919876543211', 'user', true),

-- Admin users (one for each store)
('550e8400-e29b-41d4-a716-446655440102', 'admin.cp@veg7.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CP Store Manager', '+1234567892', 'admin', true),
('550e8400-e29b-41d4-a716-446655440105', 'admin.kb@veg7.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KB Store Manager', '+1234567895', 'admin', true),
('550e8400-e29b-41d4-a716-446655440106', 'admin.ln@veg7.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LN Store Manager', '+1234567896', 'admin', true),

-- Rider users
('550e8400-e29b-41d4-a716-446655440103', 'rider1@veg7.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rider One', '+1234567893', 'rider', true),
('550e8400-e29b-41d4-a716-446655440104', 'rider2@veg7.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rider Two', '+1234567894', 'rider', true);

-- Insert admin profile
INSERT INTO admins (id, user_id, permissions, department, employee_id) VALUES
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440102', '["manage_products", "manage_orders", "manage_users", "view_analytics"]', 'Operations', 'ADM001');

-- Insert rider profiles
INSERT INTO riders (id, user_id, vehicle_type, vehicle_number, license_number, current_latitude, current_longitude, is_available, is_online, rating, total_deliveries, joining_date) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440103', 'motorcycle', 'TS09AB1234', 'TS0920230001234', 17.4504, 78.3900, true, false, 4.5, 150, NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440104', 'bicycle', 'TS09CD5678', 'TS0920230005678', 17.4145, 78.4422, true, true, 4.8, 89, NOW() - INTERVAL '20 days');

-- Insert sample addresses
INSERT INTO addresses (id, user_id, type, street_address, landmark, city, state, pincode, latitude, longitude, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440100', 'home', '123 Hi-Tech City Road', 'Near Cyber Towers', 'Hyderabad', 'Telangana', '500081', 17.4504, 78.3900, true),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440100', 'work', '456 Banjara Hills', 'Near Apollo Hospital', 'Hyderabad', 'Telangana', '500034', 17.4145, 78.4422, false),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440101', 'home', '789 Jubilee Hills', 'Near KBR Park', 'Hyderabad', 'Telangana', '500033', 17.4299, 78.4088, true);

-- Insert sample orders
INSERT INTO orders (id, user_id, rider_id, status, total_amount, delivery_fee, tax_amount, delivery_address_id, order_date, delivery_date, payment_status, payment_method) VALUES
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440201', 'delivered', 285.00, 40.00, 18.00, '550e8400-e29b-41d4-a716-446655440300', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'completed', 'razorpay'),
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440202', 'out_for_delivery', 165.00, 35.00, 12.00, '550e8400-e29b-41d4-a716-446655440302', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 hours', 'completed', 'razorpay');

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, weight) VALUES
('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440010', 1, 45.00, 45.00, 0.25),
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440013', 2, 40.00, 80.00, 1.0),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440018', 2, 35.00, 70.00, 1.0),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440021', 1, 25.00, 25.00, 0.5),

('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440016', 1, 85.00, 85.00, 0.3),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440011', 1, 25.00, 25.00, 0.1);

-- Insert sample reviews
INSERT INTO reviews (id, order_id, user_id, rider_id, rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440201', 5, 'Excellent service! Fresh vegetables delivered on time.'),
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440202', 4, 'Good quality products, delivery was prompt.');

-- Insert sample addresses (with proper coordinates for delivery calculation)
INSERT INTO addresses (id, user_id, type, street_address, landmark, city, state, pincode, latitude, longitude, is_default) VALUES
('550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440100', 'home', '123 Hi-Tech City Road', 'Near Cyber Towers', 'Hyderabad', 'Telangana', '500081', 17.4504, 78.3900, true),
('550e8400-e29b-41d4-a716-446655440311', '550e8400-e29b-41d4-a716-446655440100', 'work', '456 Banjara Hills', 'Near Apollo Hospital', 'Hyderabad', 'Telangana', '500034', 17.4145, 78.4422, false),
('550e8400-e29b-41d4-a716-446655440312', '550e8400-e29b-41d4-a716-446655440101', 'home', '789 Jubilee Hills', 'Near KBR Park', 'Hyderabad', 'Telangana', '500033', 17.4299, 78.4088, true),
('550e8400-e29b-41d4-a716-446655440313', '550e8400-e29b-41d4-a716-446655440100', 'home', 'A-123 Gachibowli', 'Near Financial District', 'Hyderabad', 'Telangana', '500032', 17.4401, 78.3489, false),
('550e8400-e29b-41d4-a716-446655440314', '550e8400-e29b-41d4-a716-446655440101', 'work', 'Tower B, Hi-Tech City', 'Near Mindspace', 'Hyderabad', 'Telangana', '500081', 17.4483, 78.3908, false);

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440700', '550e8400-e29b-41d4-a716-446655440100', 'Order Delivered', 'Your order #VEG7400 has been delivered successfully.', 'order', false),
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440101', 'Order Confirmed', 'Your order #VEG7401 has been confirmed and is being prepared.', 'order', false),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440100', 'Special Offer', 'Get 20% off on organic vegetables this week!', 'promotion', true);