document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray;
    let w, h;
    const particleCount = 100;
    const particleSize = 1;
    const connectionDistance = 150;
    const mouseRadius = 250;

    let mouse = {
        x: null,
        y: null,
        radius: mouseRadius
    };

    function init() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        particlesArray = [];
        for (let i = 0; i < particleCount; i++) {
            let size = Math.random() * particleSize + 1;
            let x = Math.random() * (w - size * 2) + size;
            let y = Math.random() * (h - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            let color = getRandomColor();
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function getRandomColor() {
        const colors = ['#39ff14', '#00ffff', '#ff00ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
        }
        update() {
            if (this.x > w || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > h || this.y < 0) {
                this.directionY = -this.directionY;
            }

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < w - this.size * 10) {
                    this.x += 10;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 10;
                }
                if (mouse.y < this.y && this.y < h - this.size * 10) {
                    this.y += 10;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                    this.y -= 10;
                }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                    ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < connectionDistance * connectionDistance) {
                    opacityValue = 1 - (distance / (connectionDistance * connectionDistance));
                    ctx.strokeStyle = `rgba(0, 255, 255, ${opacityValue})`;
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = `rgba(0, 255, 255, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    const trailContainer = document.getElementById('cursor-trail');
    const trailLength = 15;
    const trailElements = [];

    for (let i = 0; i < trailLength; i++) {
        const trailElement = document.createElement('div');
        trailElement.classList.add('trail-element');
        trailElement.style.width = `${Math.floor(Math.random() * 5) + 3}px`;
        trailElement.style.height = trailElement.style.width;
        trailElement.style.backgroundColor = 'transparent';
        trailElement.style.position = 'absolute';
        trailElement.style.borderRadius = '50%';
        trailElement.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';
        trailContainer.appendChild(trailElement);
        trailElements.push(trailElement);
    }

    let trailIndex = 0;
    document.addEventListener('mousemove', (e) => {
        const element = trailElements[trailIndex];
        element.style.left = `${e.clientX}px`;
        element.style.top = `${e.clientY}px`;
        element.style.transform = `scale(1.5)`;
        element.style.opacity = 1;
        element.style.boxShadow = `0 0 10px 2px var(--neon-magenta)`;
        element.style.backgroundColor = `var(--neon-magenta)`;

        setTimeout(() => {
            element.style.transform = `scale(0)`;
            element.style.opacity = 0;
            element.style.boxShadow = 'none';
        }, 1000);

        trailIndex = (trailIndex + 1) % trailLength;
    });

    const sections = document.querySelectorAll('.section');
    const options = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                const children = entry.target.querySelectorAll('h2, h3, p, a, .story-item, .details-item, .gallery-item');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.style.transform = 'translateY(0)';
                    child.style.opacity = 1;
                });
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        const children = section.querySelectorAll('h2, h3, p, a, .story-item, .details-item, .gallery-item');
        children.forEach(child => {
            child.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
            child.style.transform = 'translateY(30px)';
            child.style.opacity = 0;
        });
        observer.observe(section);
    });

    init();
    animate();

});