export interface Institution {
  id: number;
  name: string;
  lat: number;
  lng: number;
  dependency: number; 
  liberated: boolean;
  influenceRadius?: number; 
}

export const institutions: Institution[] = [
  
  { id: 1, name: 'Mairie de Paris', lat: 48.8566, lng: 2.3522, dependency: 80, liberated: false },
  { id: 2, name: 'Université de Lille', lat: 50.6333, lng: 3.0667, dependency: 70, liberated: false },
  { id: 3, name: 'Lycée Thiers, Marseille', lat: 43.2965, lng: 5.378, dependency: 90, liberated: false },
  { id: 4, name: 'IUT de Bordeaux', lat: 44.8378, lng: -0.5792, dependency: 60, liberated: false },
  { id: 5, name: 'École Maternelle, Rennes', lat: 48.1173, lng: -1.6778, dependency: 50, liberated: false },

  
  { id: 6, name: 'IUT de Nevers', lat: 46.996, lng: 3.170, dependency: 75, liberated: false },
  { id: 7, name: 'Université de Strasbourg', lat: 48.5839, lng: 7.7478, dependency: 65, liberated: false },
  { id: 8, name: 'Mairie de Lyon', lat: 45.7640, lng: 4.8357, dependency: 85, liberated: false },
  { id: 9, name: 'Collège Jean Moulin, Toulouse', lat: 43.6047, lng: 1.4442, dependency: 78, liberated: false },
  { id: 10, name: 'Université de Nantes', lat: 47.2184, lng: -1.5536, dependency: 68, liberated: false },
  { id: 11, name: 'Mairie de Nice', lat: 43.7000, lng: 7.2667, dependency: 88, liberated: false },
  { id: 12, name: 'Lycée Joffre, Montpellier', lat: 43.6108, lng: 3.8767, dependency: 82, liberated: false },
  { id: 13, name: 'IUT de Grenoble', lat: 45.1943, lng: 5.7245, dependency: 55, liberated: false },
  { id: 14, name: 'Mairie de Reims', lat: 49.2583, lng: 4.0317, dependency: 79, liberated: false },
  { id: 15, name: 'Université de Caen', lat: 49.1829, lng: -0.3707, dependency: 62, liberated: false },
  { id: 16, name: 'École primaire, Amiens', lat: 49.8941, lng: 2.2958, dependency: 45, liberated: false },
  { id: 17, name: 'Mairie de Brest', lat: 48.3904, lng: -4.4861, dependency: 77, liberated: false },
  { id: 18, name: 'Université de Poitiers', lat: 46.5802, lng: 0.3404, dependency: 64, liberated: false },
  { id: 19, name: 'Lycée Fénelon, Paris', lat: 48.8529, lng: 2.3393, dependency: 95, liberated: false },
  { id: 20, name: 'IUT de Lannion', lat: 48.7321, lng: -3.4589, dependency: 58, liberated: false },
  { id: 21, name: 'Mairie de Dijon', lat: 47.3220, lng: 5.0415, dependency: 81, liberated: false },
  { id: 22, name: 'Université d\'Angers', lat: 47.4784, lng: -0.5632, dependency: 67, liberated: false },
  { id: 23, name: 'Collège Sévigné, Tourcoing', lat: 50.7200, lng: 3.1600, dependency: 73, liberated: false },
  { id: 24, name: 'Mairie de Limoges', lat: 45.8315, lng: 1.2578, dependency: 76, liberated: false },
  { id: 25, name: 'Université de Clermont-Ferrand', lat: 45.7772, lng: 3.0870, dependency: 69, liberated: false }
];
