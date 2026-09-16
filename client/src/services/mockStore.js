// ==========================================================
// UniMart: Client-Side Fallback Reactive Store
// Ensures the catalog, listings, and demo logins work 100%
// even when deployed statically without a live backend server.
// ==========================================================

export const INITIAL_CATEGORIES = [
  { id: 1, name: 'IoT & Microcontrollers', slug: 'iot-microcontrollers', type: 'hardware', icon: 'Cpu', description: 'Arduino, ESP32, ESP8266, Raspberry Pi & dev kits' },
  { id: 2, name: 'Sensors & Modules', slug: 'sensors-modules', type: 'hardware', icon: 'Radio', description: 'Ultrasonic, temperature, gas, motion & camera modules' },
  { id: 3, name: 'Prototyping & Tools', slug: 'prototyping-tools', type: 'hardware', icon: 'Wrench', description: 'Breadboards, jumper wires, multimeters & tools' },
  { id: 4, name: 'Displays & Actuators', slug: 'displays-actuators', type: 'hardware', icon: 'Monitor', description: 'LCD, OLED, servo motors, stepper motors & relays' },
  { id: 5, name: 'Web Design & Development', slug: 'web-design', type: 'skill', icon: 'Code', description: 'Portfolio sites, React/Node apps, coursework web projects' },
  { id: 6, name: 'Graphic Design & Branding', slug: 'graphic-design', type: 'skill', icon: 'Palette', description: 'Posters, social banners, logos, UI/UX wireframes' },
  { id: 7, name: 'Video Editing & Production', slug: 'video-editing', type: 'skill', icon: 'Video', description: 'Project demos, presentation reels, club promo videos' },
  { id: 8, name: 'Audio Editing & Mixing', slug: 'audio-editing', type: 'skill', icon: 'Headphones', description: 'Audio cleanup, voiceovers, podcast mastering & event sound' }
];

export const INITIAL_PROFILES = [
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'anuki.d@student.rjt.ac.lk',
    password: 'Password123',
    full_name: 'Anuki De Silva',
    reg_id: 'ICT/2024/002',
    faculty: 'Faculty of Technology',
    department: 'Department of ICT',
    bio: 'Creative multimedia editor and graphic designer. Specializing in campus event posters, Figma mockups, and video showcases.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone_number: '0773456789',
    rating_avg: 5.0,
    rating_count: 9
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'dinuka.f@student.rjt.ac.lk',
    password: 'Password123',
    full_name: 'Dinuka Fernando',
    reg_id: 'ICT/2024/003',
    faculty: 'Faculty of Technology',
    department: 'Department of ICT',
    bio: 'Electronics and hardware tinkerer. Regularly sharing verified sensors, microcontrollers and testing tools with peers.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone_number: '0754567890',
    rating_avg: 4.8,
    rating_count: 6
  },
  {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    email: 'chamari.j@student.rjt.ac.lk',
    password: 'Password123',
    full_name: 'Chamari Jayasinghe',
    reg_id: 'ICT/2024/004',
    faculty: 'Faculty of Technology',
    department: 'Department of ICT',
    bio: 'Sound technician and voiceover editor. Helping student project teams prepare crisp, professional audio for presentations.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    phone_number: '0785678901',
    rating_avg: 4.7,
    rating_count: 4
  }
];

export const INITIAL_LISTINGS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Arduino Uno R3 Original + 830-Point Breadboard & Jumpers',
    description: 'Gently used original Arduino Uno R3 development board tested in ICT 1108 lab coursework. Package includes blue high-speed USB cable, a full-sized 830-point solderless breadboard, and 65 male-to-male flexible jumper wires. Tested and fully functional. Can test together in the lab before taking it!',
    category_id: 1,
    item_type: 'hardware',
    price: 2800.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Electronics Lab 02 or Main Canteen',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg'
    ],
    status: 'active',
    views: 45,
    created_at: '2026-09-01T08:30:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'ESP32 NodeMCU WiFi + Bluetooth Dev Kit (CP2102)',
    description: 'Brand new in anti-static bag. ESP-WROOM-32 30-pin board with integrated antenna, micro-USB CP2102 programmer, and dual-core Xtensa 32-bit LX6 MCU. Ideal for IoT cloud projects, MQTT communication, and smart home coursework prototypes.',
    category_id: 1,
    item_type: 'hardware',
    price: 2200.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'ICT Department Lobby / Hostel Block B',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/f/f8/ESP32.jpg'
    ],
    status: 'active',
    views: 62,
    created_at: '2026-09-03T11:20:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Sensor Bundle: HC-SR04 Ultrasonic + DHT22 Temp & Humidity',
    description: 'Working sensor pack for your robotics or weather station project. Includes ultrasonic distance sensor HC-SR04 and high-precision DHT22 (AM2302) digital humidity & temperature sensor. Jumper wires included.',
    category_id: 2,
    item_type: 'hardware',
    price: 1500.00,
    price_type: 'negotiable',
    condition: 'used_good',
    location: 'Faculty Library Lobby',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/2/20/HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg'
    ],
    status: 'active',
    views: 31,
    created_at: '2026-09-05T14:10:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: '0.96 inch I2C OLED Display Module (128x64 Blue/Yellow)',
    description: 'Crisp 0.96 inch graphic OLED screen with 4-pin I2C interface (VCC, GND, SCL, SDA). Pre-soldered header pins, ready for instant breadboard use. Compatible with Adafruit SSD1306 and U8g2 libraries.',
    category_id: 4,
    item_type: 'hardware',
    price: 950.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Computer Lab 01',
    images: [
      '/images/items/oled-display.jpg'
    ],
    status: 'active',
    views: 28,
    created_at: '2026-09-07T16:45:00Z'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Modern Responsive Web Design & Coursework Frontend Coding',
    description: 'Offering front-end web development services for undergraduate projects, student societies, or personal portfolios. Built using modern React.js, Tailwind CSS, or clean HTML5/CSS3. Fast turnaround, clean code, and fully mobile-friendly.',
    category_id: 5,
    item_type: 'skill',
    price: 5000.00,
    price_type: 'per_project',
    condition: null,
    location: 'Online / Meet at FOT Study Area',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 74,
    created_at: '2026-09-02T10:15:00Z'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Academic Project Video Editing & Presentation Showcase Reels',
    description: 'Professional video editing for final year demonstrations, conference poster presentations, and society promotions. Clean cuts, cinematic transitions, audio balancing, voiceover synchronization, and subtitle generation using Premiere Pro.',
    category_id: 7,
    item_type: 'skill',
    price: 3500.00,
    price_type: 'per_project',
    condition: null,
    location: 'FOT Discussion Room / WhatsApp',
    images: [
      'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 89,
    created_at: '2026-09-04T13:00:00Z'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Graphic Design for Student Event Posters, Logos & UI Mockups',
    description: 'Custom graphic designs for university clubs, symposium announcements, sports meets, and project UI wireframes in Figma. Deliverables provided in high-res PNG, PDF, and source files.',
    category_id: 6,
    item_type: 'skill',
    price: 2000.00,
    price_type: 'per_project',
    condition: null,
    location: 'Campus Canteen or Digital Transfer',
    images: [
      'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 53,
    created_at: '2026-09-06T15:30:00Z'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    user_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Audio Noise Reduction, Voiceover Mastering & Podcast Editing',
    description: 'Removing room echo, microphone hiss, fan background noise, and balancing dialogue audio for project presentation videos and university podcasts. Experience using Audacity and Adobe Audition.',
    category_id: 8,
    item_type: 'skill',
    price: 1200.00,
    price_type: 'hourly',
    condition: null,
    location: 'ICT Department Common Room',
    images: [
      'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 40,
    created_at: '2026-09-08T09:00:00Z'
  },
  {
    id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Raspberry Pi 4 Model B (4GB RAM) with Aluminum Armor Case & Fan',
    description: 'Fully functional Raspberry Pi 4 Model B 4GB version used for a semester IoT edge AI project. Includes passive/active aluminum dual-fan armor heatsink case, official 5.1V 3A USB-C power supply, and 32GB SanDisk Ultra MicroSD card pre-loaded with Raspberry Pi OS. Perfect for computer vision or home automation coursework.',
    category_id: 1,
    item_type: 'hardware',
    price: 18500.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Computer Lab 02 or Hostel Block B',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/f/f1/Raspberry_Pi_4_Model_B_-_Side.jpg'
    ],
    status: 'active',
    views: 82,
    created_at: '2026-09-09T10:00:00Z'
  },
  {
    id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'SG90 Micro Servo Motors (Pack of 4) + PCA9685 16-Channel PWM Driver',
    description: 'Robotics actuator pack. Includes 4 TowerPro SG90 9g micro servo motors with horns and mounting screws, plus an I2C PCA9685 16-channel 12-bit PWM servo motor driver module. Perfect for robotic arm or pan-tilt camera projects.',
    category_id: 4,
    item_type: 'hardware',
    price: 2400.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'FOT Robotics Workshop / Lab 01',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Tower_Pro_SG90_micro_servo_motor.jpg'
    ],
    status: 'active',
    views: 47,
    created_at: '2026-09-09T13:20:00Z'
  },
  {
    id: 'cccc3333-cccc-3333-cccc-333333333333',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'L298N Dual H-Bridge Motor Driver Module for Smart Car Chassis',
    description: 'Heavy duty dual H-bridge motor driver module capable of driving two DC motors or one 4-wire two-phase stepper motor. Includes onboard 5V regulator and large aluminum heatsink. Tested and fully operational in 2nd year robotics coursework.',
    category_id: 4,
    item_type: 'hardware',
    price: 650.00,
    price_type: 'fixed',
    condition: 'used_good',
    location: 'Faculty Library Lobby',
    images: [
      '/images/items/l298n-motor-driver.jpg'
    ],
    status: 'active',
    views: 39,
    created_at: '2026-09-10T09:40:00Z'
  },
  {
    id: 'dddd4444-dddd-4444-dddd-444444444444',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'MB-102 Breadboard Power Supply (3.3V/5V) + 9V DC Battery Connector',
    description: 'Plug-in dual voltage power supply module for standard 830-point and 400-point breadboards. Independent power rails switchable between 3.3V, 5V, or OFF via jumpers. Includes 9V DC battery snap connector with barrel jack.',
    category_id: 3,
    item_type: 'hardware',
    price: 550.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'Main Campus Canteen or FOT Lab',
    images: [
      '/images/items/mb102-power-supply.jpg'
    ],
    status: 'active',
    views: 33,
    created_at: '2026-09-10T15:15:00Z'
  },
  {
    id: 'eeee5555-eeee-5555-eeee-555555555555',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'MQ-2 Gas & Flammable Smoke Sensor Module (Analog & Digital)',
    description: 'High sensitivity gas sensor for detecting LPG, smoke, methane, butane, and alcohol. Dual output (AO analog output and DO digital potentiometer threshold output). Tested with Arduino and ESP32 in campus environmental sensing project.',
    category_id: 2,
    item_type: 'hardware',
    price: 480.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Electronics Lab 01',
    images: [
      '/images/items/mq2-gas-sensor.jpg'
    ],
    status: 'active',
    views: 29,
    created_at: '2026-09-11T11:30:00Z'
  },
  {
    id: 'ffff6666-ffff-6666-ffff-666666666666',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'STM32F103C8T6 ARM Cortex-M3 "Blue Pill" Board + ST-Link V2 Programmer',
    description: 'Original 72MHz 32-bit ARM Cortex-M3 microcontroller development board with pre-soldered header pins. Includes ST-Link V2 USB debugger/programmer and 4-pin SWD jumper cable. Can be programmed with Arduino IDE, Keil, or STM32CubeIDE.',
    category_id: 1,
    item_type: 'hardware',
    price: 1750.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'ICT Department 2nd Floor Study Room',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Blue_Pill.jpg'
    ],
    status: 'active',
    views: 51,
    created_at: '2026-09-11T14:45:00Z'
  },
  {
    id: 'aaaa7777-aaaa-7777-aaaa-777777777777',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'UI/UX Figma Design for Academic Presentation Slides & Mobile Wireframes',
    description: 'Clean, modern Figma user interface designs and interactive prototypes for student project presentations, research defense slides, and coursework apps. Deliverables include Figma source link, typography scale, component library, and PNG/SVG asset exports.',
    category_id: 6,
    item_type: 'skill',
    price: 2500.00,
    price_type: 'per_project',
    condition: null,
    location: 'Online / FOT Study Area',
    images: [
      'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 68,
    created_at: '2026-09-08T16:00:00Z'
  },
  {
    id: 'bbbb8888-bbbb-8888-bbbb-888888888888',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'LaTeX & Overleaf Formatting for Final Year Research Papers (IEEE Standard)',
    description: 'Professional LaTeX document formatting for research papers, dissertation chapters, and technical symposium submissions following standard IEEE double-column format. Includes BibTeX bibliography compilation, equation formatting, and figure placement.',
    category_id: 5,
    item_type: 'skill',
    price: 1800.00,
    price_type: 'per_project',
    condition: null,
    location: 'Online / FOT Discussion Room',
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 55,
    created_at: '2026-09-09T08:30:00Z'
  },
  {
    id: 'cccc9999-cccc-9999-cccc-999999999999',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Coursework Python Data Analysis & Matplotlib / Seaborn Chart Generation',
    description: 'Assisting student project teams with Python data processing (Pandas, NumPy) and generating high-resolution scientific charts, bar graphs, heatmaps, and confusion matrices in Matplotlib and Seaborn for lab reports.',
    category_id: 5,
    item_type: 'skill',
    price: 2200.00,
    price_type: 'per_project',
    condition: null,
    location: 'ICT Lab 02 / WhatsApp',
    images: [
      'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 49,
    created_at: '2026-09-10T12:00:00Z'
  },
  {
    id: 'dddd1010-dddd-1010-dddd-101010101010',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Presentation Pitch Deck Design for Student Competitions & Lab Vivas',
    description: 'Transforming boring bullet points into sleek, engaging PowerPoint / Google Slides presentations for hackathons, IEEE conferences, and project viva defenses. Custom graphics, data charts, and clean formatting included.',
    category_id: 6,
    item_type: 'skill',
    price: 1500.00,
    price_type: 'per_project',
    condition: null,
    location: 'Faculty Library Lobby',
    images: [
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 64,
    created_at: '2026-09-11T09:15:00Z'
  },
  {
    id: 'eeee2020-eeee-2020-eeee-202020202020',
    user_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Student Portrait & Headshot Retouching for LinkedIn, CV & Uni Badges',
    description: 'Professional color grading, subtle skin retouching, and background clean-up for student LinkedIn profiles, internship CVs, conference speaker bios, and student council badges using Photoshop and Lightroom.',
    category_id: 7,
    item_type: 'skill',
    price: 800.00,
    price_type: 'per_project',
    condition: null,
    location: 'FOT Common Room',
    images: [
      'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 43,
    created_at: '2026-09-11T16:30:00Z'
  },
  {
    id: 'ffff3030-ffff-3030-ffff-303030303030',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Custom Vector Technical Diagram & Circuit Schematics Illustration',
    description: 'Creating crisp, publication-ready vector circuit diagrams, architectural flowcharts, and system block diagrams using Adobe Illustrator for student project reports and IEEE conference papers.',
    category_id: 6,
    item_type: 'skill',
    price: 1400.00,
    price_type: 'per_project',
    condition: null,
    location: 'Online / Canteen',
    images: [
      'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    status: 'active',
    views: 37,
    created_at: '2026-09-12T10:00:00Z'
  },
  {
    id: '10101010-aaaa-4444-aaaa-111111111111',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Digital Multimeter (XL830L) with Test Probes & 9V Battery',
    description: 'Compact digital multimeter with yellow protective holster. Measures AC/DC voltage, DC current, resistance, diode test, and continuity buzzer. Essential for troubleshooting circuit prototypes, checking sensor voltages, and verifying breadboard wiring in ICT 1108 lab.',
    category_id: 3,
    item_type: 'hardware',
    price: 1450.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Electronics Lab 02 or Main Canteen',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 35,
    created_at: '2026-09-12T11:00:00Z'
  },
  {
    id: '10101010-bbbb-4444-bbbb-222222222222',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'LoRa SX1278 433MHz Long Range Wireless Transceiver Module (Pair)',
    description: 'Two SX1278 433MHz LoRa wireless transceiver modules with external spring antennas and pre-soldered header pins. Features SPI communication, ultra-long range (up to 3km line-of-sight), and low power consumption. Perfect for campus remote telemetry and agricultural IoT projects.',
    category_id: 1,
    item_type: 'hardware',
    price: 2600.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'ICT Department 2nd Floor Study Room',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/a/af/LoRa_Module.jpg'
    ],
    status: 'active',
    views: 42,
    created_at: '2026-09-12T13:30:00Z'
  },
  {
    id: '10101010-cccc-4444-cccc-333333333333',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'RFID-RC522 13.56MHz Reader/Writer Kit + S50 White Card & Keychain Tag',
    description: 'MFRC522 RFID reader/writer module operating at 13.56MHz SPI interface. Includes one blank S50 RFID smart card and one blue keychain RFID fob. Tested with Arduino Uno and ESP32 for campus automated student attendance prototype.',
    category_id: 2,
    item_type: 'hardware',
    price: 680.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'Faculty Library Lobby',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/e/ec/RFID-RC522.jpg'
    ],
    status: 'active',
    views: 58,
    created_at: '2026-09-12T15:00:00Z'
  },
  {
    id: '10101010-dddd-4444-dddd-444444444444',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: '24MHz 8-Channel USB Logic Analyzer for Digital Protocol Debugging',
    description: 'USB logic analyzer with 8 digital channels supporting up to 24MHz sampling rate. Compatible with PulseView and Saleae software on Windows/Linux. Decodes I2C, SPI, UART, and 1-Wire packets in real time. Comes with USB cable and 10-pin Dupont test clip cable.',
    category_id: 3,
    item_type: 'hardware',
    price: 1950.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Electronics Workshop / Lab 02',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Saleae_Logic_Analyzer.jpg/640px-Saleae_Logic_Analyzer.jpg'
    ],
    status: 'active',
    views: 44,
    created_at: '2026-09-13T09:30:00Z'
  },
  {
    id: '10101010-eeee-4444-eeee-555555555555',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Adjustable 60W Temperature-Controlled Soldering Iron Kit with Stand & Solder',
    description: 'Fast-heating 60W soldering iron with adjustable temperature dial (200°C - 450°C). Comes with metallic safety stand, cleaning sponge, 5 interchangeable tip profiles, and a spool of 0.8mm lead-free rosin core solder wire. Ideal for soldering headers onto PCBs and custom shields.',
    category_id: 3,
    item_type: 'hardware',
    price: 2150.00,
    price_type: 'fixed',
    condition: 'used_good',
    location: 'FOT Ground Floor Lobby / Canteen',
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 39,
    created_at: '2026-09-13T11:15:00Z'
  },
  {
    id: '10101010-ffff-4444-ffff-666666666666',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'MPU-6050 6-Axis Accelerometer & Gyroscope Motion Sensor Module (I2C)',
    description: 'High precision 3-axis gyroscope and 3-axis accelerometer sensor with onboard Digital Motion Processor (DMP). Communicates over standard I2C. Headers pre-soldered for direct breadboard mounting. Perfect for gesture tracking, drone stabilization, or robotics balance projects.',
    category_id: 2,
    item_type: 'hardware',
    price: 550.00,
    price_type: 'fixed',
    condition: 'brand_new',
    location: 'FOT Computer Lab 01',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/2/23/MPU-6050.jpg'
    ],
    status: 'active',
    views: 61,
    created_at: '2026-09-13T14:40:00Z'
  },
  {
    id: '20202020-aaaa-5555-aaaa-111111111111',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Custom PCB Layout Design & Schematic Capture in EasyEDA / Altium',
    description: 'Designing professional double-sided printed circuit board layouts from your project schematics. Routing optimization, DRC verification, silkscreen labeling, and exporting manufacturing-ready Gerber files, drill files, and BOM. Ideal for 2nd/3rd year hardware projects.',
    category_id: 5,
    item_type: 'skill',
    price: 2500.00,
    price_type: 'per_project',
    condition: null,
    location: 'FOT Electronics Lab 02 or WhatsApp',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 52,
    created_at: '2026-09-12T12:00:00Z'
  },
  {
    id: '20202020-bbbb-5555-bbbb-222222222222',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: '3D CAD Mechanical Enclosure & Component Modeling in SolidWorks / Fusion 360',
    description: 'Custom 3D CAD design for project casing, sensor brackets, robot chassis, and snap-fit enclosures. Deliverables include editable STEP/IGES files and clean watertight STL files ready for 3D printing on campus.',
    category_id: 6,
    item_type: 'skill',
    price: 3000.00,
    price_type: 'per_project',
    condition: null,
    location: 'FOT Discussion Room / Online',
    images: [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 66,
    created_at: '2026-09-12T14:15:00Z'
  },
  {
    id: '20202020-cccc-5555-cccc-333333333333',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Embedded C & Arduino Code Debugging, Logic Optimization & Sensor Calibration',
    description: 'Troubleshooting memory leaks, timer interrupt conflicts, I2C/SPI communication errors, and sensor reading fluctuations in your Arduino/ESP32 code. In-person code review and live debugging sessions available in the lab.',
    category_id: 5,
    item_type: 'skill',
    price: 1200.00,
    price_type: 'hourly',
    condition: null,
    location: 'FOT Computer Lab 02',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 71,
    created_at: '2026-09-13T08:45:00Z'
  },
  {
    id: '20202020-dddd-5555-dddd-444444444444',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'MATLAB & Simulink Mathematical Modeling & Dynamic System Simulation',
    description: 'Assisting with MATLAB script automation, matrix operations, control systems analysis (Bode plots, root locus), and Simulink block diagram modeling for engineering coursework and assignment submissions.',
    category_id: 5,
    item_type: 'skill',
    price: 2200.00,
    price_type: 'per_project',
    condition: null,
    location: 'Faculty Library Study Area',
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 48,
    created_at: '2026-09-13T10:20:00Z'
  },
  {
    id: '20202020-eeee-5555-eeee-555555555555',
    user_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Academic English Proofreading & Technical Style Editing for Project Reports',
    description: 'Comprehensive grammar check, vocabulary enhancement, tense consistency, and academic flow refinement for undergraduate dissertations, project proposals, and research papers. Tracked changes returned in Microsoft Word.',
    category_id: 5,
    item_type: 'skill',
    price: 1000.00,
    price_type: 'hourly',
    condition: null,
    location: 'Library Lobby or Email Transfer',
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 59,
    created_at: '2026-09-13T13:10:00Z'
  },
  {
    id: '20202020-ffff-5555-ffff-666666666666',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Mobile App UI Wireframing & Interactive Prototype in Figma for HCI Coursework',
    description: 'Designing user-centric mobile screen wireframes, color themes, icon sets, and clickable user flow transitions in Figma. Meets HCI evaluation criteria and usability inspection standards.',
    category_id: 6,
    item_type: 'skill',
    price: 2400.00,
    price_type: 'per_project',
    condition: null,
    location: 'ICT Department Study Room',
    images: [
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 63,
    created_at: '2026-09-13T15:30:00Z'
  },
  {
    id: '20202020-1111-5555-1111-777777777777',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Database ERD Design, 3NF Normalization & SQL Query Optimization',
    description: 'Expert guidance on designing Entity-Relationship Diagrams (Crow\'s Foot notation in Draw.io), normalizing relational schemas to BCNF/3NF, writing complex PostgreSQL queries, and indexing for fast performance.',
    category_id: 5,
    item_type: 'skill',
    price: 1800.00,
    price_type: 'per_project',
    condition: null,
    location: 'FOT Computer Lab 02',
    images: [
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 54,
    created_at: '2026-09-13T17:00:00Z'
  },
  {
    id: '20202020-2222-5555-2222-888888888888',
    user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'Student Society Event Poster, Banner & Social Media Announcement Design',
    description: 'High-impact promotional graphics for student batch trips, welcome ceremonies, tech hackathons, and webinars. Formatted for Instagram square, Facebook banner, and A3 print resolution.',
    category_id: 6,
    item_type: 'skill',
    price: 1500.00,
    price_type: 'per_project',
    condition: null,
    location: 'Campus Canteen or Drive link',
    images: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 60,
    created_at: '2026-09-14T09:15:00Z'
  },
  {
    id: '20202020-3333-5555-3333-999999999999',
    user_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Academic Demonstration Video Voiceover Narration (Sinhala / English)',
    description: 'Crisp, studio-grade voiceover narration for final project demo videos, academic walkthroughs, and conference teasers. Recorded with studio condenser microphone, noise gated, and normalized to standard broadcast loudness.',
    category_id: 8,
    item_type: 'skill',
    price: 1500.00,
    price_type: 'per_project',
    condition: null,
    location: 'Digital WAV/MP3 Delivery',
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 41,
    created_at: '2026-09-14T11:45:00Z'
  },
  {
    id: '20202020-4444-5555-4444-aaaaaaaaaaaa',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Git & GitHub Collaboration Mentoring, Merge Conflict Resolution & Branching',
    description: 'One-on-one session to organize your group project repository: Git feature-branch workflows, setting up GitHub Projects sprint boards, resolving scary merge conflicts, and preparing clean commit histories for supervisor inspection.',
    category_id: 5,
    item_type: 'skill',
    price: 800.00,
    price_type: 'hourly',
    condition: null,
    location: 'ICT Department Open Lab',
    images: [
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    views: 77,
    created_at: '2026-09-14T14:00:00Z'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: '99999999-9999-9999-9999-999999999991',
    sender_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    receiver_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    listing_id: '11111111-1111-1111-1111-111111111111',
    content: 'Hi Dinuka, is the Arduino Uno board still available? Can we meet at the FOT Electronics Lab tomorrow around 1:00 PM?',
    is_read: true,
    created_at: '2026-09-12T07:15:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999992',
    sender_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    receiver_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    listing_id: '11111111-1111-1111-1111-111111111111',
    content: 'Hi Anuki! Yes, it is available. 1:00 PM at Lab 02 works great for me. You can test it on a lab PC before paying.',
    is_read: true,
    created_at: '2026-09-12T07:45:00Z'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: '88888888-9999-9999-9999-999999999991',
    reviewer_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    reviewee_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    listing_id: '11111111-1111-1111-1111-111111111111',
    rating: 5,
    comment: 'Great experience! The Arduino board was in mint condition and worked right away in our embedded systems lab assignment. Super friendly peer!',
    created_at: '2026-09-10T14:20:00Z'
  },
  {
    id: '88888888-9999-9999-9999-999999999992',
    reviewer_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    reviewee_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    listing_id: '77777777-7777-7777-7777-777777777777',
    rating: 5,
    comment: 'Anuki designed a poster for our ICT society workshop. Delivered within 24 hours and the quality was top notch. Highly recommended!',
    created_at: '2026-09-08T11:00:00Z'
  }
];

class ClientStore {
  constructor() {
    // Purge any stored Kavindu dummy account from browser localStorage
    try {
      const storedUser = localStorage.getItem('unimart_current_user');
      if (storedUser && (storedUser.includes('kavindu') || storedUser.includes('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'))) {
        localStorage.removeItem('unimart_current_user');
        localStorage.removeItem('unimart_token');
      }
      localStorage.removeItem('unimart_profiles_v2');
      localStorage.removeItem('unimart_profiles_v3');
    } catch {}

    const cachedCategories = this.load('unimart_categories_v2', null);
    if (!cachedCategories) {
      this.categories = INITIAL_CATEGORIES;
      this.save('unimart_categories_v2', this.categories);
    } else {
      const mergedCats = [...INITIAL_CATEGORIES];
      cachedCategories.forEach(c => {
        if (!mergedCats.some(mc => mc.id === c.id || mc.name.toLowerCase() === c.name.toLowerCase())) {
          mergedCats.push(c);
        }
      });
      this.categories = mergedCats;
      this.save('unimart_categories_v2', this.categories);
    }

    // Synchronize profiles with latest password-enforced defaults
    const cachedProfiles = this.load('unimart_profiles_v4', null);
    if (!cachedProfiles) {
      this.profiles = INITIAL_PROFILES;
      this.save('unimart_profiles_v4', this.profiles);
    } else {
      // Filter out any legacy dummy profiles
      const cleaned = cachedProfiles.filter(p => !p.email?.includes('kavindu') && p.id !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      const mergedProfiles = [...cleaned];
      INITIAL_PROFILES.forEach(ip => {
        const idx = mergedProfiles.findIndex(p => p.email.toLowerCase() === ip.email.toLowerCase());
        if (idx !== -1) {
          mergedProfiles[idx] = { ...mergedProfiles[idx], password: ip.password };
        } else {
          mergedProfiles.push(ip);
        }
      });
      this.profiles = mergedProfiles;
      this.save('unimart_profiles_v4', this.profiles);
    }

    // Initialize or synchronize listings with latest additions
    const cachedListings = this.load('unimart_listings_v6', null);
    if (!cachedListings) {
      this.listings = INITIAL_LISTINGS;
      this.save('unimart_listings_v6', this.listings);
    } else {
      const nonSeedListings = cachedListings.filter(c => !INITIAL_LISTINGS.some(s => s.id === c.id));
      this.listings = [...INITIAL_LISTINGS, ...nonSeedListings];
      this.save('unimart_listings_v6', this.listings);
    }

    this.messages = this.load('unimart_messages', INITIAL_MESSAGES);
    this.reviews = this.load('unimart_reviews', INITIAL_REVIEWS);
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }

  findProfileById(id) {
    return this.profiles.find(p => p.id === id) || null;
  }

  getAllListings({ type, categoryId, condition, search, minPrice, maxPrice, sort, userId } = {}) {
    let results = [...this.listings];

    if (type && type !== 'all') {
      results = results.filter(item => item.item_type === type);
    }
    if (categoryId) {
      results = results.filter(item => item.category_id === parseInt(categoryId, 10));
    }
    if (condition && condition !== 'all') {
      results = results.filter(item => item.condition === condition);
    }
    if (userId) {
      results = results.filter(item => item.user_id === userId);
    }
    if (minPrice !== undefined && minPrice !== '') {
      results = results.filter(item => item.price >= parseFloat(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      results = results.filter(item => item.price <= parseFloat(maxPrice));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    const enriched = results.map(listing => ({
      ...listing,
      seller: this.findProfileById(listing.user_id),
      category: this.categories.find(c => c.id === listing.category_id) || { name: 'General', type: listing.item_type }
    }));

    if (sort === 'price_asc') {
      enriched.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      enriched.sort((a, b) => b.price - a.price);
    } else {
      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return enriched;
  }

  getListingById(id) {
    const listing = this.listings.find(item => item.id === id);
    if (!listing) return null;
    const seller = this.findProfileById(listing.user_id);
    const category = this.categories.find(c => c.id === listing.category_id);
    const sellerOtherListings = this.listings
      .filter(l => l.user_id === listing.user_id && l.id !== listing.id && l.status === 'active')
      .slice(0, 3);

    return {
      ...listing,
      seller,
      category: category || { name: 'General', type: listing.item_type },
      sellerOtherListings
    };
  }

  createListing(listingData) {
    const newL = { ...listingData, id: Math.random().toString(36).substring(2, 15) };
    this.listings.unshift(newL);
    this.save('unimart_listings_v4', this.listings);
    return this.getListingById(newL.id);
  }

  updateListing(id, updates) {
    const idx = this.listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.listings[idx] = { ...this.listings[idx], ...updates };
      this.save('unimart_listings_v4', this.listings);
      return this.getListingById(id);
    }
    return null;
  }

  deleteListing(id) {
    this.listings = this.listings.filter(l => l.id !== id);
    this.save('unimart_listings_v4', this.listings);
    return true;
  }

  addCategory(categoryData) {
    const cleanName = (categoryData.name || '').trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = this.categories.find(c => c.name.toLowerCase() === cleanName.toLowerCase() || c.slug === slug);
    if (existing) return existing;

    const newId = this.categories.length ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
    const newCat = {
      id: categoryData.id || newId,
      name: cleanName,
      slug,
      type: categoryData.type || 'hardware',
      icon: categoryData.icon || (categoryData.type === 'skill' ? 'Code' : 'Cpu'),
      description: categoryData.description || `Custom ${categoryData.type || 'academic'} category for ${cleanName}`
    };
    this.categories.push(newCat);
    this.save('unimart_categories_v2', this.categories);
    return newCat;
  }

  createMessage(msg) {
    const newMsg = { ...msg, id: Math.random().toString(36).substring(2, 15), created_at: new Date().toISOString() };
    this.messages.push(newMsg);
    this.save('unimart_messages', this.messages);
    return newMsg;
  }

  createReview(rev) {
    const newRev = { ...rev, id: Math.random().toString(36).substring(2, 15), created_at: new Date().toISOString() };
    this.reviews.push(newRev);
    this.save('unimart_reviews', this.reviews);
    return newRev;
  }
}

export const clientStore = new ClientStore();
