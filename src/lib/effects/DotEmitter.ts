// src/lib/effects/DotEmitter.ts

import type { Map, LatLng, Circle } from 'leaflet';

export class DotEmitter {
    private L: any;
    private map: Map;
    private center: LatLng;
    private maxRadius: number; // in meters
    private pane: string;
    
    private interval: any;
    private currentRadius = 0;
    private growthRate: number;
    private mainCircle: Circle | null = null;

    constructor(L: any, map: Map, center: LatLng, maxRadius: number = 2000000, pane: string = 'overlayPane') {
        this.L = L;
        this.map = map;
        this.center = center;
        this.maxRadius = maxRadius;
        this.growthRate = 150; // Adjusted growth rate for 100ms interval (was 75 for 50ms)
        this.pane = pane;
    }

    start() {
        // Create the main expanding circle (the "gradient" base)
        this.mainCircle = this.L.circle(this.center, {
            radius: 0,
            color: 'transparent',
            fillColor: '#007bff',
            fillOpacity: 0.2,
            className: 'spread-circle',
            pane: this.pane,
            weight: 0
        }).addTo(this.map);

        this.interval = setInterval(() => {
            if (this.currentRadius >= this.maxRadius) {
                this.stop();
                return;
            }

            this.currentRadius += this.growthRate;
            
            // Update the main circle size
            if (this.mainCircle) {
                this.mainCircle.setRadius(this.currentRadius);
            }
            
            // Spawn fewer dots
            this.spawnDot();

        }, 100); // Slower interval
    }

    stop() {
        clearInterval(this.interval);
        // Optionally keep the circle or remove it. Usually, "spread" implies it stays.
        // But if we want to optimize, we might stop growing it.
        // For now, let's leave it on the map to show "conquered" territory.
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
