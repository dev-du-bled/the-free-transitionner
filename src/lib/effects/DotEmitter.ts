// src/lib/effects/DotEmitter.ts

import type { Map, LatLng } from 'leaflet';

export class DotEmitter {
    private L: any;
    private map: Map;
    private center: LatLng;
    private maxRadius: number; // in meters
    private pane: string;
    
    private interval: any;
    private currentRadius = 0;
    private growthRate: number;

    constructor(L: any, map: Map, center: LatLng, maxRadius: number = 2000000, pane: string = 'overlayPane') {
        this.L = L;
        this.map = map;
        this.center = center;
        this.maxRadius = maxRadius;
        this.growthRate = 75; // Fixed growth rate
        this.pane = pane;
    }

    start() {
        this.interval = setInterval(() => {
            if (this.currentRadius >= this.maxRadius) {
                this.stop();
                return;
            }

            this.currentRadius += this.growthRate;
            
            // Spawn dots
            for (let i = 0; i < 3; i++) {
                this.spawnDot();
            }

        }, 50);
    }

    stop() {
        clearInterval(this.interval);
    }

    private spawnDot() {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.sqrt(Math.random()) * this.currentRadius;

        const latOffset = (distance * Math.sin(angle)) / 111111;
        const lngOffset = (distance * Math.cos(angle)) / (111111 * Math.cos(this.center.lat * Math.PI / 180));

        const dotPosition = this.L.latLng(this.center.lat + latOffset, this.center.lng + lngOffset);

        // Dots are permanent
        this.L.circle(dotPosition, {
            radius: 30,
            color: '#007bff',
            fillColor: '#007bff',
            fillOpacity: 0.4,
            weight: 0,
            pane: this.pane
        }).addTo(this.map);
    }
}
