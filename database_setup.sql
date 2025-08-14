-- Complete Database Schema and Seed Data for Mipripity Web App
-- Execute these commands in your Render PostgreSQL database

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS property_prospects CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS prospect_properties CASCADE;
DROP TABLE IF EXISTS vote_options CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (id SERIAL PRIMARY KEY, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, phone_number VARCHAR(20), firebase_uid VARCHAR(255), profile_picture TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Create Categories table
CREATE TABLE categories (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Create Vote Options table
CREATE TABLE vote_options (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Create Properties table
CREATE TABLE properties (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, location VARCHAR(255) NOT NULL, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE, current_worth DECIMAL(15,2), year_of_construction INTEGER, lister_phone_number VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Create Property Images table
CREATE TABLE property_images (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE, image_url TEXT NOT NULL, is_primary BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Create Votes table
CREATE TABLE votes (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE, vote_option_id INTEGER REFERENCES vote_options(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, property_id));

-- Create Prospect Properties table
CREATE TABLE prospect_properties (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, location VARCHAR(255) NOT NULL, category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE, estimated_worth DECIMAL(15,2), year_of_construction INTEGER, image_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Create Property Prospects table (for prospect investment ideas)
CREATE TABLE property_prospects (id SERIAL PRIMARY KEY, prospect_property_id INTEGER REFERENCES prospect_properties(id) ON DELETE CASCADE, title VARCHAR(255) NOT NULL, description TEXT NOT NULL, estimated_cost DECIMAL(15,2) NOT NULL, total_cost DECIMAL(15,2) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

-- Insert Categories
INSERT INTO categories (name, description) VALUES ('Residential', 'Houses, apartments, and residential buildings');
INSERT INTO categories (name, description) VALUES ('Commercial', 'Office buildings, retail spaces, and commercial properties');
INSERT INTO categories (name, description) VALUES ('Land/Agricultural', 'Undeveloped land and agricultural properties');
INSERT INTO categories (name, description) VALUES ('Industrial/Material', 'Warehouses, factories, and industrial facilities');

-- Insert Vote Options for each category
INSERT INTO vote_options (name, category_id) VALUES ('Excellent Investment', 1), ('Good Investment', 1), ('Fair Investment', 1), ('Poor Investment', 1), ('Overpriced', 1);
INSERT INTO vote_options (name, category_id) VALUES ('High ROI Potential', 2), ('Moderate ROI', 2), ('Low ROI', 2), ('High Risk', 2), ('Market Saturated', 2);
INSERT INTO vote_options (name, category_id) VALUES ('Prime Location', 3), ('Good for Development', 3), ('Agricultural Potential', 3), ('Zoning Issues', 3), ('Environmental Concerns', 3);
INSERT INTO vote_options (name, category_id) VALUES ('Strategic Location', 4), ('Good Infrastructure', 4), ('Transportation Access', 4), ('Regulatory Challenges', 4), ('High Maintenance', 4);

-- Insert Sample Users (password is 'password123' hashed with bcrypt)
INSERT INTO users (first_name, last_name, email, password_hash, phone_number, profile_picture) VALUES ('John', 'Doe', 'john.doe@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+234-801-234-5678', 'https://picsum.photos/200/200?random=1');
INSERT INTO users (first_name, last_name, email, password_hash, phone_number, profile_picture) VALUES ('Jane', 'Smith', 'jane.smith@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+234-802-345-6789', 'https://picsum.photos/200/200?random=2');

-- Insert Sample Properties
INSERT INTO properties (title, description, location, user_id, category_id, current_worth, year_of_construction, lister_phone_number) VALUES ('Modern 3-Bedroom Apartment', 'Beautiful modern apartment with excellent amenities in a prime location. Features include spacious living areas, modern kitchen, and great views.', 'Victoria Island, Lagos', 1, 1, 45000000.00, 2020, '+234-801-234-5678');
INSERT INTO properties (title, description, location, user_id, category_id, current_worth, year_of_construction, lister_phone_number) VALUES ('Commercial Office Complex', 'Prime commercial office space in the heart of Abuja business district. Perfect for corporate headquarters or multi-tenant office building.', 'Central Business District, Abuja', 2, 2, 120000000.00, 2018, '+234-802-345-6789');

-- Insert Property Images
INSERT INTO property_images (property_id, image_url, is_primary) VALUES (1, 'https://picsum.photos/800/600?random=10', TRUE);
INSERT INTO property_images (property_id, image_url, is_primary) VALUES (1, 'https://picsum.photos/800/600?random=11', FALSE);
INSERT INTO property_images (property_id, image_url, is_primary) VALUES (1, 'https://picsum.photos/800/600?random=12', FALSE);
INSERT INTO property_images (property_id, image_url, is_primary) VALUES (2, 'https://picsum.photos/800/600?random=20', TRUE);
INSERT INTO property_images (property_id, image_url, is_primary) VALUES (2, 'https://picsum.photos/800/600?random=21', FALSE);

-- Insert Sample Votes
INSERT INTO votes (user_id, property_id, vote_option_id) VALUES (1, 2, 6);
INSERT INTO votes (user_id, property_id, vote_option_id) VALUES (2, 1, 1);

-- Insert Sample Prospect Properties
INSERT INTO prospect_properties (title, description, location, category_id, estimated_worth, year_of_construction, image_url) VALUES ('Luxury Residential Estate Plot', 'Prime land for luxury residential estate development in Lekki. Perfect for high-end housing project with excellent infrastructure access.', 'Lekki Phase 2, Lagos', 3, 80000000.00, NULL, 'https://picsum.photos/800/600?random=30');
INSERT INTO prospect_properties (title, description, location, category_id, estimated_worth, year_of_construction, image_url) VALUES ('Industrial Warehouse Facility', 'Large warehouse facility suitable for logistics and distribution operations. Strategic location with excellent transportation links.', 'Ikeja Industrial Estate, Lagos', 4, 150000000.00, 2015, 'https://picsum.photos/800/600?random=40');

-- Insert Property Prospects (Investment Ideas)
INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES (1, 'Luxury Estate Development', 'Develop a high-end residential estate with 50 luxury homes, clubhouse, and recreational facilities targeting affluent buyers.', 48000000.00, 128000000.00);
INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES (1, 'Mixed-Use Development', 'Create a mixed-use development combining residential units, commercial spaces, and recreational areas for maximum ROI.', 60000000.00, 140000000.00);
INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES (2, 'Logistics Hub Conversion', 'Convert and expand the warehouse into a modern logistics hub with automated systems and multi-tenant capabilities.', 45000000.00, 195000000.00);
INSERT INTO property_prospects (prospect_property_id, title, description, estimated_cost, total_cost) VALUES (2, 'E-commerce Fulfillment Center', 'Transform into a state-of-the-art e-commerce fulfillment center serving the Lagos metropolitan area.', 75000000.00, 225000000.00);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_category_id ON properties(category_id);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_votes_property_id ON votes(property_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_prospect_properties_category_id ON prospect_properties(category_id);
CREATE INDEX idx_property_prospects_prospect_property_id ON property_prospects(prospect_property_id);

-- Update sequences to ensure proper auto-increment
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('vote_options_id_seq', (SELECT MAX(id) FROM vote_options));
SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties));
SELECT setval('property_images_id_seq', (SELECT MAX(id) FROM property_images));
SELECT setval('votes_id_seq', (SELECT MAX(id) FROM votes));
SELECT setval('prospect_properties_id_seq', (SELECT MAX(id) FROM prospect_properties));
SELECT setval('property_prospects_id_seq', (SELECT MAX(id) FROM property_prospects));
