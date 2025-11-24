import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import * as THREE from 'three';

interface CardData {
    imagePath: string;
    title: string;
    width: number;
    height: number;
}

@Component({
    selector: 'app-threejs-card',
    standalone: true,
    templateUrl: './threejs-card.component.html' ,
    styleUrl: './threejs-card.component.css',
})
export class ThreejsCardComponent implements AfterViewInit, OnDestroy {
    @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;
    @Input() cards: CardData[] = [];
    @Input() mode: string = 'light';

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private cardMeshes: THREE.Mesh[] = [];
    private animationId?: number;
    private mouse = new THREE.Vector2();
    private raycaster = new THREE.Raycaster();
    private hoveredCard: THREE.Mesh | null = null;

    ngAfterViewInit() {
        this.initThree();
        this.createCards();
        this.animate();
        this.addEventListeners();
    }

    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.renderer?.dispose();
        this.cardMeshes.forEach(mesh => {
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.dispose());
            } else {
                mesh.material.dispose();
            }
        });
    }

    private initThree() {
        const width = this.container.nativeElement.offsetWidth;
        const height = this.container.nativeElement.offsetHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 1, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.nativeElement.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-5, 3, 5);
        this.scene.add(directionalLight2);
    }



    private createCardTexture(imageSrc: string, title: string): Promise<THREE.CanvasTexture> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const canvasWidth = 1024;
            const canvasHeight = 1536;
            const borderRadius = 60;
            const padding = 40;

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d')!;

            // Load image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                // Clear canvas
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);

                // Draw glass-like border background with rounded corners
              if (this.mode === 'light') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                this.drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, borderRadius);
                ctx.fill();

                // Draw outer glow/border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 4;
                this.drawRoundedRect(ctx, 2, 2, canvasWidth - 4, canvasHeight - 4, borderRadius);
                ctx.stroke();
              }else{
                ctx.fillStyle = 'rgba(25, 25, 25, 0.15)';
                this.drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, borderRadius);
                ctx.fill();

                // Draw outer glow/border
                ctx.strokeStyle = 'rgba(25, 25, 25, 0.3)';
                ctx.lineWidth = 4;
                this.drawRoundedRect(ctx, 2, 2, canvasWidth - 4, canvasHeight - 4, borderRadius);
                ctx.stroke();
              }
                // Calculate image dimensions with padding
                const imageWidth = canvasWidth - (padding * 2);
                const imageHeight = canvasHeight - (padding * 2);

                // Clip for rounded image
                ctx.save();
                this.drawRoundedRect(ctx, padding, padding, imageWidth, imageHeight, borderRadius - 20);
                ctx.clip();

                // Draw image
                ctx.drawImage(img, padding, padding, imageWidth, imageHeight);
                ctx.restore();

                // Draw gradient overlay at bottom for label
                const gradient = ctx.createLinearGradient(0, canvasHeight - 250, 0, canvasHeight);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

                ctx.save();
                this.drawRoundedRect(ctx, padding, padding, imageWidth, imageHeight, borderRadius - 20);
                ctx.clip();
                ctx.fillStyle = gradient;
                ctx.fillRect(padding, canvasHeight - 250, imageWidth, 250);
                ctx.restore();

                // Draw label text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 72px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillText(title, canvasWidth / 2, canvasHeight - 100);

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;
                resolve(texture);
            };

            img.onerror = () => {
                // Fallback texture
                ctx.fillStyle = '#333333';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.fillStyle = '#ffffff';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Image not found', canvasWidth / 2, canvasHeight / 2);
                resolve(new THREE.CanvasTexture(canvas));
            };

            img.src = imageSrc;
        });
    }

    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    private async createCards() {
        const spacing = 2.8; // Space between cards
        const totalWidth = (this.cards.length - 1) * spacing;
        const startX = -totalWidth / 2;

        // Angle variations for each card
        const angleVariations = [20, 10,0, -10, -20]; // Degrees for each card

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];

            // Create card texture with image and label
            const texture = await this.createCardTexture(card.imagePath, card.title);

            // Card geometry - slightly thicker for glass effect
            let geometry = new THREE.BoxGeometry(2.2, 3.3, 0.0001);

            if(i == this.cards.length - 1 || i == 0) {
                geometry = new THREE.BoxGeometry(2.2, 3.6, 0.0001);
            }

            // Create rounded corner effect by using a single material
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.9,
                metalness: 0,
                transparent: true,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geometry, material);

            // Position cards in a row
            mesh.position.x = startX + (i * spacing);
            mesh.position.y = 0;
            mesh.position.z = 0;

            // Apply slight angle variation
            const angle = angleVariations[i % angleVariations.length] || 0;
            mesh.rotation.y = THREE.MathUtils.degToRad(angle);

            // Store card data
            mesh.userData = {
                title: card.title,
                defaultY: 0,
                defaultZ: 0,
                defaultRotationX: 0,
                defaultRotationY: mesh.rotation.y,
                index: i
            };

            this.scene.add(mesh);
            this.cardMeshes.push(mesh);
        }
    }

    private addEventListeners() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        window.addEventListener('resize', () => this.onResize());
    }

    private onMouseMove(event: MouseEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycast for hover effects
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cardMeshes);

        // Reset previous hovered card
        if (this.hoveredCard && !intersects.find(i => i.object === this.hoveredCard)) {
            this.hoveredCard = null;
        }

        // Set new hovered card
        if (intersects.length > 0) {
            const card = intersects[0].object as THREE.Mesh;
            if (card !== this.hoveredCard) {
                this.hoveredCard = card;
            }
        }
    }

    private onMouseLeave() {
        this.hoveredCard = null;
    }

    private onResize() {
        const width = this.container.nativeElement.offsetWidth;
        const height = this.container.nativeElement.offsetHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        // Animate all cards back to default position
        this.cardMeshes.forEach(mesh => {
            mesh.position.y += (mesh.userData["defaultY"] - mesh.position.y) * 0.1;
            mesh.position.z += (mesh.userData["defaultZ"] - mesh.position.z) * 0.1;
            mesh.rotation.x += (mesh.userData["defaultRotationX"] - mesh.rotation.x) * 0.1;
            mesh.rotation.y += (mesh.userData["defaultRotationY"] - mesh.rotation.y) * 0.1;
        });

        // Animate hovered card
        if (this.hoveredCard) {
            const targetY = 0.5;
            const targetZ = 0.6;
            const targetRotX = -0.08;

            this.hoveredCard.position.y += (targetY - this.hoveredCard.position.y) * 0.15;
            this.hoveredCard.position.z += (targetZ - this.hoveredCard.position.z) * 0.15;
            this.hoveredCard.rotation.x += (targetRotX - this.hoveredCard.rotation.x) * 0.15;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
