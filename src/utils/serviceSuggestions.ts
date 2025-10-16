// Service type categories and suggestions for all business types
export const SERVICE_TYPES = [
  'Hair Services',
  'Styling & Treatment',
  'Coloring',
  'Nail Services',
  'Spa & Massage',
  'Facial & Skincare',
  'Body Treatments',
  'Waxing & Hair Removal',
  'Makeup',
  'Barber Services',
  'Beauty Services',
  'Cleaning Services',
  'Fitness Services',
  'Massage Services',
  'Tattoo & Body Art',
  'Medical Aesthetics'
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];

// Service name suggestions by type
export const SERVICE_SUGGESTIONS: Record<string, string[]> = {
  'Hair Services': [
    'Haircut',
    'Blow Dry',
    'Hair Wash',
    'Kids Haircut',
    'Trim',
    'Layered Cut',
    'Bob Cut',
    'Pixie Cut'
  ],
  'Styling & Treatment': [
    'Hair Styling',
    'Updo',
    'Braiding',
    'Cornrows',
    'Twists',
    'Weaving',
    'Hair Treatment',
    'Deep Conditioning',
    'Keratin Treatment',
    'Perm'
  ],
  'Coloring': [
    'Full Color',
    'Root Touch Up',
    'Highlights',
    'Lowlights',
    'Balayage',
    'Ombre',
    'Color Correction',
    'Bleaching'
  ],
  'Nail Services': [
    'Manicure',
    'Pedicure',
    'Gel Nails',
    'Acrylic Nails',
    'Nail Art',
    'Nail Extensions',
    'Shellac',
    'French Manicure'
  ],
  'Spa & Massage': [
    'Swedish Massage',
    'Deep Tissue Massage',
    'Hot Stone Massage',
    'Aromatherapy',
    'Sports Massage',
    'Thai Massage',
    'Reflexology',
    'Back Massage'
  ],
  'Facial & Skincare': [
    'Basic Facial',
    'Deep Cleansing Facial',
    'Anti-Aging Facial',
    'Hydrating Facial',
    'Acne Treatment',
    'Chemical Peel',
    'Microdermabrasion',
    'LED Light Therapy'
  ],
  'Body Treatments': [
    'Body Scrub',
    'Body Wrap',
    'Body Polish',
    'Cellulite Treatment',
    'Slimming Treatment',
    'Detox Treatment'
  ],
  'Waxing & Hair Removal': [
    'Full Leg Wax',
    'Half Leg Wax',
    'Brazilian Wax',
    'Bikini Wax',
    'Underarm Wax',
    'Eyebrow Wax',
    'Upper Lip Wax',
    'Full Body Wax',
    'Laser Hair Removal'
  ],
  'Makeup': [
    'Bridal Makeup',
    'Evening Makeup',
    'Natural Makeup',
    'Party Makeup',
    'Special Effects Makeup',
    'Airbrush Makeup',
    'Makeup Lesson'
  ],
  'Barber Services': [
    'Mens Haircut',
    'Beard Trim',
    'Beard Shaping',
    'Hot Towel Shave',
    'Fade',
    'Taper',
    'Line Up',
    'Hair Design'
  ],
  'Beauty Services': [
    'Lash Extensions',
    'Lash Lift',
    'Brow Lamination',
    'Microblading',
    'Henna Tattoo',
    'Teeth Whitening'
  ],
  'Cleaning Services': [
    'Standard Cleaning',
    'Deep Cleaning',
    'Move-Out Cleaning',
    'Move-In Cleaning',
    'Office Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
    'Oven Cleaning',
    'Post-Construction Cleaning',
    'Spring Cleaning',
    'Upholstery Cleaning',
    'Pressure Washing'
  ],
  'Fitness Services': [
    'Personal Training',
    'Group Fitness Class',
    'Yoga Session',
    'Pilates Class',
    'HIIT Training',
    'Strength Training',
    'Cardio Session',
    'CrossFit Class',
    'Boxing Class',
    'Spinning Class',
    'Zumba Class',
    'Stretching Session',
    'Nutrition Consultation',
    'Body Assessment',
    'Weight Loss Program',
    'Functional Training',
    'Circuit Training',
    'Boot Camp Class'
  ],
  'Massage Services': [
    'Swedish Massage',
    'Deep Tissue Massage',
    'Hot Stone Massage',
    'Aromatherapy Massage',
    'Sports Massage',
    'Thai Massage',
    'Prenatal Massage',
    'Couples Massage',
    'Chair Massage',
    'Reflexology',
    'Trigger Point Therapy',
    'Lymphatic Drainage',
    'Shiatsu Massage'
  ],
  'Tattoo & Body Art': [
    'Custom Tattoo',
    'Tattoo Cover-Up',
    'Tattoo Touch-Up',
    'Small Tattoo',
    'Large Tattoo',
    'Sleeve Tattoo',
    'Body Piercing',
    'Ear Piercing',
    'Tattoo Consultation',
    'Tattoo Removal Consultation',
    'Henna Tattoo',
    'Temporary Tattoo'
  ],
  'Medical Aesthetics': [
    'Botox Treatment',
    'Dermal Fillers',
    'Laser Hair Removal',
    'Laser Skin Resurfacing',
    'Chemical Peel',
    'Microneedling',
    'PRP Therapy',
    'Body Contouring',
    'Skin Tightening',
    'Vein Treatment',
    'Scar Treatment',
    'Stretch Mark Treatment',
    'Medical Consultation'
  ]
};
