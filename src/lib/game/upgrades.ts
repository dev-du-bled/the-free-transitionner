export interface Upgrade {
  id: string;
  name: string;
  description: string;
  effect: string;
  cost: number;
}

export const permanentUpgrades: Upgrade[] = [
  {
    id: 'script-install',
    name: 'Automation Scripts',
    description: 'Develop and share automation scripts.',
    effect: 'Increases mission progress speed by 50%.',
    cost: 150,
  },
  {
    id: 'hardware-certification',
    name: 'Hardware Certification Program',
    description: 'Certify hardware for Linux compatibility.',
    effect: 'Reduces the chance of technical hardware issues during missions.',
    cost: 250,
  },
  {
    id: 'community-building',
    name: 'Community Building',
    description: 'Foster local communities.',
    effect: 'Increases the radius and impact of liberation spread.',
    cost: 300,
  },
  {
    id: 'training-materials',
    name: 'Better Training Materials',
    description: 'Create high-quality training materials.',
    effect: 'Provides a small, permanent reduction in dependency for all non-liberated institutions.',
    cost: 400,
  },
  {
    id: 'open-source-contribution',
    name: 'Open Source Contributor',
    description: 'Become a regular contributor to key open source projects.',
    effect: 'Generates a passive income of $10 per second.',
    cost: 500,
  },
  {
    id: 'legal-aid',
    name: 'Legal Aid Network',
    description: 'A network of lawyers to handle contract disputes.',
    effect: 'Reduces the penalty of vendor lock-in events.',
    cost: 600,
  },
  {
    id: 'build-servers',
    name: 'Dedicated Build Servers',
    description: 'High-performance servers for compilation.',
    effect: 'Increases base mission speed by 20%.',
    cost: 800,
  },
  {
    id: 'awareness-campaign',
    name: 'National Awareness Campaign',
    description: 'Public campaigns promoting digital sovereignty.',
    effect: 'Reduces dependency of all non-liberated institutions by 10.',
    cost: 1000,
  },
  {
    id: 'policy-lobbying',
    name: 'Policy Lobbying',
    description: 'Advocate for free software in government.',
    effect: 'Increases passive income by $20 per second.',
    cost: 1500,
  }
];
