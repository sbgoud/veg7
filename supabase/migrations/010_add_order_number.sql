-- Add order_number column to orders table
ALTER TABLE orders ADD COLUMN order_number VARCHAR(20) UNIQUE;

-- Create index for order_number for better performance
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Update existing orders with numeric order numbers (using last 8 digits of UUID)
UPDATE orders SET order_number = RIGHT(REPLACE(id::text, '-', ''), 8) WHERE order_number IS NULL;
