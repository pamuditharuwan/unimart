// ==========================================================
// UniMart: Smart Student Marketplace - System Constants
// ==========================================================

export const DEFAULT_ALLOWED_DOMAINS = [
  '@___.___ .ac.lk',
  '@student.rjt.ac.lk',
  '.ac.lk'
];

export const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'IoT & Microcontrollers',
    slug: 'iot-microcontrollers',
    type: 'hardware',
    icon: 'Cpu',
    description: 'Arduino, ESP32, ESP8266, Raspberry Pi & development kits'
  },
  {
    id: 2,
    name: 'Sensors & Modules',
    slug: 'sensors-modules',
    type: 'hardware',
    icon: 'Radio',
    description: 'Ultrasonic, temperature, gas, motion & camera modules'
  },
  {
    id: 3,
    name: 'Prototyping & Tools',
    slug: 'prototyping-tools',
    type: 'hardware',
    icon: 'Wrench',
    description: 'Breadboards, jumper wires, multimeters, soldering irons & components'
  },
  {
    id: 4,
    name: 'Displays & Actuators',
    slug: 'displays-actuators',
    type: 'hardware',
    icon: 'Monitor',
    description: 'LCD, OLED, servo motors, stepper motors & relays'
  },
  {
    id: 5,
    name: 'Web Design & Development',
    slug: 'web-design',
    type: 'skill',
    icon: 'Code',
    description: 'Portfolio sites, React/Node apps, coursework web projects'
  },
  {
    id: 6,
    name: 'Graphic Design & Branding',
    slug: 'graphic-design',
    type: 'skill',
    icon: 'Palette',
    description: 'Posters, social banners, logos, UI/UX wireframes'
  },
  {
    id: 7,
    name: 'Video Editing & Production',
    slug: 'video-editing',
    type: 'skill',
    icon: 'Video',
    description: 'Project demos, presentation reels, club promo videos'
  },
  {
    id: 8,
    name: 'Audio Editing & Mixing',
    slug: 'audio-editing',
    type: 'skill',
    icon: 'Headphones',
    description: 'Audio cleanup, voiceovers, podcast mastering & event sound'
  }
];

export const INITIAL_PROFILES = [
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'anuki.d@student.rjt.ac.lk',
    password: '$2a$10$wBskvI/3441B/6lG4.mQkuN8o23VnQ4HqLd61Z9g/kYfU7pB.vHsq', // password: 'Password123'
    full_name: 'Anuki De Silva',
    reg_id: 'ICT/2024/002',
    faculty: 'Faculty of Technology',
    department: 'Department of ICT',
    bio: 'Creative multimedia editor and graphic designer. Specializing in campus event posters, Figma mockups, and video showcases.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone_number: '0773456789',
    rating_avg: 5.0,
    rating_count: 9,
    created_at: '2026-08-05T12:00:00Z'
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'dinuka.f@student.rjt.ac.lk',
    password: '$2a$10$wBskvI/3441B/6lG4.mQkuN8o23VnQ4HqLd61Z9g/kYfU7pB.vHsq', // password: 'Password123'
    full_name: 'Dinuka Fernando',
    reg_id: 'ICT/2024/003',
    faculty: 'Faculty of Technology',
    department: 'Department of ICT',
    bio: 'Electronics and hardware tinkerer. Regularly sharing verified sensors, microcontrollers and testing tools with peers.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone_number: '0754567890',
    rating_avg: 4.8,
    rating_count: 6,
    created_at: '2026-08-10T14:30:00Z'
  },
  {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    email: 'chamari.j@student.rjt.ac.lk',
    password: '$2a$10$wBskvI/3441B/6lG4.mQkuN8o23VnQ4HqLd61Z9g/kYfU7pB.vHsq', // password: 'Password123'
    full_name: 'Chamari Jayasinghe',
    reg_id: 'ICT/2024/004',
    faculty: 'Faculty of Technology',
    department: 'Department of ICT',
    bio: 'Sound technician and voiceover editor. Helping student project teams prepare crisp, professional audio for presentations.',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    phone_number: '0785678901',
    rating_avg: 4.7,
    rating_count: 4,
    created_at: '2026-08-12T09:15:00Z'
  }
];

export const INITIAL_LISTINGS = [
  // --- 5 Academic Hardware Items ---
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Arduino Uno R3 Original + 830-Point Breadboard & Jumpers',
    description: 'Gently used original Arduino Uno R3 development board tested in university lab coursework. Package includes blue high-speed USB cable, a full-sized 830-point solderless breadboard, and 65 male-to-male flexible jumper wires. Tested and fully functional. Can test together in the lab before taking it!',
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
    contact_phone: '0754567890',
    created_at: '2026-09-01T08:30:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'ESP32 NodeMCU WiFi + Bluetooth Dev Kit CP2102',
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
    contact_phone: '0754567890',
    created_at: '2026-09-03T11:20:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Sensor Pack: HC-SR04 Ultrasonic + DHT22 Temp & Humidity',
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
    contact_phone: '0754567890',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/OLED_display_module.jpg/800px-OLED_display_module.jpg'
    ],
    status: 'active',
    views: 28,
    contact_phone: '0754567890',
    created_at: '2026-09-07T16:45:00Z'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    user_id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Digital Multimeter (XL830L) with Test Probes & 9V Battery',
    description: 'Compact digital multimeter with yellow protective holster. Measures AC/DC voltage, DC current, resistance, diode test, and continuity buzzer. Essential for troubleshooting circuit prototypes, checking sensor voltages, and verifying breadboard wiring in electronics lab.',
    category_id: 3,
    item_type: 'hardware',
    price: 1450.00,
    price_type: 'fixed',
    condition: 'used_like_new',
    location: 'FOT Electronics Lab 02 or Main Canteen',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Digital_Multimeter.jpg/800px-Digital_Multimeter.jpg'
    ],
    status: 'active',
    views: 35,
    contact_phone: '0754567890',
    created_at: '2026-09-08T08:00:00Z'
  },

  // --- 5 Student Skills Items ---
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
    contact_phone: '0773456789',
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
    contact_phone: '0773456789',
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
    contact_phone: '0785678901',
    created_at: '2026-09-08T09:00:00Z'
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    user_id: 'ac34aca7-870c-4646-ad1f-33d1dfb1c218',
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
    contact_phone: '0712345678',
    created_at: '2026-09-02T10:15:00Z'
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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
    contact_phone: '0773456789',
    created_at: '2026-09-08T16:00:00Z'
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
