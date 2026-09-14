-- ==========================================================
-- UniMart: Smart Student Marketplace
-- Seed Data for Supabase / PostgreSQL
-- Rajarata University of Sri Lanka - Faculty of Technology
-- ==========================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, type, icon, description) VALUES
-- Hardware Categories
(1, 'IoT & Microcontrollers', 'iot-microcontrollers', 'hardware', 'Cpu', 'Arduino, ESP32, ESP8266, Raspberry Pi & dev boards'),
(2, 'Sensors & Modules', 'sensors-modules', 'hardware', 'Radio', 'Ultrasonic, temperature, gas, motion & camera modules'),
(3, 'Prototyping & Tools', 'prototyping-tools', 'hardware', 'Wrench', 'Breadboards, jumper wires, multimeters, soldering irons & components'),
(4, 'Displays & Actuators', 'displays-actuators', 'hardware', 'Monitor', 'LCD, OLED, servo motors, stepper motors & relays'),

-- Skill Categories
(5, 'Web Design & Development', 'web-design', 'skill', 'Code', 'Portfolio sites, React/Node apps, coursework web projects'),
(6, 'Graphic Design & Branding', 'graphic-design', 'skill', 'Palette', 'Posters, social banners, logos, UI/UX wireframes'),
(7, 'Video Editing & Production', 'video-editing', 'skill', 'Video', 'Project demos, presentation reels, club promo videos'),
(8, 'Audio Editing & Mixing', 'audio-editing', 'skill', 'Headphones', 'Audio cleanup, voiceovers, podcast mastering & event sound')
ON CONFLICT (id) DO NOTHING;

-- Reset categories sequence
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM public.categories));

-- 2. Insert Student Profiles (Common Example Student Accounts)
INSERT INTO public.profiles (id, email, full_name, reg_id, faculty, department, bio, avatar_url, phone_number, rating_avg, rating_count) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'kavindu.p@student.rjt.ac.lk', 'Kavindu Perera', 'ICT/2024/001', 'Faculty of Technology', 'Department of ICT', 'BICT undergraduate passionate about embedded systems, IoT prototyping and React web apps.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '0712345678', 4.9, 12),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'anuki.d@student.rjt.ac.lk', 'Anuki De Silva', 'ICT/2024/002', 'Faculty of Technology', 'Department of ICT', 'Graphic designer & video editor. Experienced in Premiere Pro, After Effects and Photoshop for campus events.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '0773456789', 5.0, 9),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'dinuka.f@student.rjt.ac.lk', 'Dinuka Fernando', 'ICT/2024/003', 'Faculty of Technology', 'Department of ICT', 'Electronics enthusiast. Have spare sensors and development boards from 2nd year lab projects.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '0754567890', 4.8, 6),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'chamari.j@student.rjt.ac.lk', 'Chamari Jayasinghe', 'ICT/2024/004', 'Faculty of Technology', 'Department of ICT', 'Audio editor and sound designer. Clean vocal tracks and soundtrack mixing for presentations.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', '0785678901', 4.7, 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Listings (Academic Hardware + Student Digital Skills)
INSERT INTO public.listings (id, user_id, title, description, category_id, item_type, price, price_type, condition, location, images, status) VALUES
-- Hardware Listing 1
(
    '11111111-1111-1111-1111-111111111111',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Arduino Uno R3 Original + 830-Point Breadboard & Jumpers',
    'Barely used Arduino Uno R3 board tested in ICT 1108 lab. Comes with USB cable, 830-point solderless breadboard, and 65 male-to-male jumper wires. Perfect for 1st/2nd year microcontrollers lab.',
    1,
    'hardware',
    2800.00,
    'fixed',
    'used_like_new',
    'FOT Electronics Lab 02 or Main Canteen',
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'],
    'active'
),
-- Hardware Listing 2
(
    '22222222-2222-2222-2222-222222222222',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'ESP32 NodeMCU WiFi + Bluetooth Dev Kit CP2102',
    'Brand new sealed ESP-WROOM-32 30-pin board. Ideal for IoT cloud projects, MQTT communication, and smart home coursework prototypes.',
    1,
    'hardware',
    2200.00,
    'fixed',
    'brand_new',
    'ICT Department Lobby / Hostel Block B',
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/f8/ESP32.jpg'],
    'active'
),
-- Hardware Listing 3
(
    '33333333-3333-3333-3333-333333333333',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'Sensor Pack: HC-SR04 Ultrasonic + DHT22 Temp & Humidity',
    'Working sensor bundle tested with Arduino and ESP32. Includes HC-SR04 distance sensor and high-precision DHT22 (AM2302) digital humidity/temp sensor.',
    2,
    'hardware',
    1500.00,
    'negotiable',
    'used_good',
    'Faculty Library Lobby',
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/2/20/HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg'],
    'active'
),
-- Hardware Listing 4
(
    '44444444-4444-4444-4444-444444444444',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '0.96 inch I2C OLED Display Module (128x64 Blue/Yellow)',
    'Low-power 128x64 pixel OLED display for Arduino/STM32 projects. Tested with Adafruit SSD1306 library. Headers already pre-soldered for quick breadboard wiring.',
    4,
    'hardware',
    950.00,
    'fixed',
    'used_like_new',
    'FOT Computer Lab 01',
    ARRAY['/images/items/oled-display.jpg'],
    'active'
),
-- Skill Listing 1
(
    '55555555-5555-5555-5555-555555555555',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Modern Responsive Web Design & Coursework Frontend Development',
    'Offering custom website design and frontend coding for academic projects, student clubs, or portfolio sites using React.js, Tailwind CSS, or clean HTML/CSS. Includes responsive mobile optimization.',
    5,
    'skill',
    5000.00,
    'per_project',
    NULL,
    'Online / Meet at FOT Study Area',
    ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'],
    'active'
),
-- Skill Listing 2
(
    '66666666-6666-6666-6666-666666666666',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Academic Project Video Editing & Presentation Showcase Reels',
    'High quality video editing for project demonstrations, conference presentations, and society promotions. Fast turnaround with Premiere Pro & After Effects. Voiceover sync included.',
    7,
    'skill',
    3500.00,
    'per_project',
    NULL,
    'FOT Discussion Room / WhatsApp',
    ARRAY['https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'active'
),
-- Skill Listing 3
(
    '77777777-7777-7777-7777-777777777777',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Graphic Design for Student Event Posters, Logos & UI Mockups',
    'Custom Photoshop and Illustrator designs for campus societies, sports meets, symposium banners, and UI wireframes in Figma. Unlimited revisions until your team is satisfied.',
    6,
    'skill',
    2000.00,
    'per_project',
    NULL,
    'Campus Canteen or Digital Transfer',
    ARRAY['https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'active'
),
-- Skill Listing 4
(
    '88888888-8888-8888-8888-888888888888',
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'Audio Noise Reduction, Voiceover Mastering & Podcast Editing',
    'Professional audio cleanup for recorded lectures, student podcast episodes, and research video narrations. Removes background hums, fan noise, and clicks.',
    8,
    'skill',
    1200.00,
    'hourly',
    NULL,
    'ICT Department Common Room',
    ARRAY['https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800'],
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Messages
INSERT INTO public.messages (id, sender_id, receiver_id, listing_id, content, is_read, created_at) VALUES
(
    '99999999-9999-9999-9999-999999999991',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '11111111-1111-1111-1111-111111111111',
    'Hi Kavindu, is the Arduino Uno board still available? Can we meet at the FOT Electronics Lab tomorrow around 1:00 PM?',
    true,
    now() - INTERVAL '2 hours'
),
(
    '99999999-9999-9999-9999-999999999992',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '11111111-1111-1111-1111-111111111111',
    'Hi Anuki! Yes, it is available. 1:00 PM at Lab 02 works great for me. You can test it on a lab PC before paying.',
    true,
    now() - INTERVAL '1 hour 45 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Sample Reviews
INSERT INTO public.reviews (id, reviewer_id, reviewee_id, listing_id, rating, comment, created_at) VALUES
(
    '88888888-9999-9999-9999-999999999991',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '11111111-1111-1111-1111-111111111111',
    5,
    'Great experience! The Arduino board was in mint condition and worked right away in our embedded systems lab assignment. Super friendly peer!',
    now() - INTERVAL '1 day'
),
(
    '88888888-9999-9999-9999-999999999992',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '77777777-7777-7777-7777-777777777777',
    5,
    'Anuki designed a poster for our ICT society workshop. Delivered within 24 hours and the quality was top notch. Highly recommended!',
    now() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;
