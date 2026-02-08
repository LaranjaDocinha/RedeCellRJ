import { compatibilityService } from '../src/services/compatibilityService.js';

const initialCompatibilities = [
  // Apple
  {
    brand: 'Apple',
    model: 'iPhone 11',
    compatible_models: ['iPhone XR'],
    category: 'Pelicula 3D',
    notes: 'Tela de 6.1 polegadas'
  },
  {
    brand: 'Apple',
    model: 'iPhone 11 Pro Max',
    compatible_models: ['iPhone XS Max'],
    category: 'Pelicula 3D',
    notes: 'Tela de 6.5 polegadas'
  },
  {
    brand: 'Apple',
    model: 'iPhone 12',
    compatible_models: ['iPhone 12 Pro'],
    category: 'Pelicula 3D',
    notes: 'Tela de 6.1 polegadas'
  },
  {
    brand: 'Apple',
    model: 'iPhone 13',
    compatible_models: ['iPhone 13 Pro', 'iPhone 14'],
    category: 'Pelicula 3D',
    notes: 'Tela de 6.1 polegadas'
  },
  {
    brand: 'Apple',
    model: 'iPhone 13 Pro Max',
    compatible_models: ['iPhone 14 Plus'],
    category: 'Pelicula 3D',
    notes: 'Tela de 6.7 polegadas'
  },
  // Samsung
  {
    brand: 'Samsung',
    model: 'Galaxy A01',
    compatible_models: ['Galaxy M01'],
    category: 'Pelicula 3D'
  },
  {
    brand: 'Samsung',
    model: 'Galaxy A10',
    compatible_models: ['Galaxy M10'],
    category: 'Pelicula 3D'
  },
  {
    brand: 'Samsung',
    model: 'Galaxy A22 4G',
    compatible_models: ['Galaxy M32', 'Galaxy A32 4G'],
    category: 'Pelicula 3D'
  },
  {
    brand: 'Samsung',
    model: 'Galaxy A52',
    compatible_models: ['Galaxy A52s', 'Galaxy A53'],
    category: 'Pelicula 3D'
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S20 FE',
    compatible_models: ['Galaxy S21 FE'],
    category: 'Pelicula 3D'
  },
  // Motorola
  {
    brand: 'Motorola',
    model: 'Moto G10',
    compatible_models: ['Moto G20', 'Moto G30'],
    category: 'Pelicula 3D'
  },
  {
    brand: 'Motorola',
    model: 'Moto G100',
    compatible_models: ['Moto Edge S'],
    category: 'Pelicula 3D'
  }
];

async function seed() {
  console.log('Seeding compatibilities...');
  try {
    await compatibilityService.bulkCreate(initialCompatibilities);
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding compatibilities:', error);
    process.exit(1);
  }
}

seed();
