export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export const permanentUpgrades: Upgrade[] = [
  {
    id: 'script-install',
    name: 'Automation Scripts',
    description: 'Develop and share automation scripts. Increases mission progress speed by 50%.',
    cost: 150,
  },
  {
    id: 'community-building',
    name: 'Community Building',
    description: 'Foster local communities. Increases the radius and impact of liberation spread.',
    cost: 300,
  },
  {
    id: 'hardware-certification',
    name: 'Hardware Certification Program',
    description: 'Certify hardware for Linux compatibility. Reduces the chance of technical hardware issues during missions.',
    cost: 250,
  },
  {
    id: 'open-source-contribution',
    name: 'Open Source Contributor',
    description: 'Become a regular contributor to key open source projects. Generates a passive income of $10 per second.',
    cost: 500,
  },
  {
    id: 'training-materials',
    name: 'Better Training Materials',
    description: 'Create high-quality training materials. Provides a small, permanent reduction in dependency for all non-liberated institutions.',
    cost: 400,
  }
];
