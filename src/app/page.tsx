'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, Zap, Brain, MessageCircle, Shield, Rocket, 
  Play, ChevronDown, Globe, Code, Gamepad2, Users,
  Lock, Layers, Eye, Terminal, ArrowRight, Heart, 
  GraduationCap, Star, Mail, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FloatingParticle = ({ delay = 0, size = 4, duration = 20, seed = 0 }: { delay?: number; size?: number; duration?: number; seed?: number }) => {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: seed * 50 % 100, drift: 0 });
  
  useEffect(() => {
    setMounted(true);
    setPos({ 
      x: Math.random() * 100, 
      drift: Math.random() * 200 - 100 
    });
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${pos.x}%`,
        background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
        boxShadow: `0 0 ${size * 2}px hsl(var(--primary) / 0.5)`,
      }}
      initial={{ 
        y: '100vh',
        opacity: 0 
      }}
      animate={{
        y: -100,
        opacity: [0, 1, 1, 0],
        x: `+=${pos.drift}`,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

const GlitchText = ({ children, className }: { children: string; className?: string }) => {
  const [glitch, setGlitch] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const baseInterval = 3500;
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, baseInterval);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <span className={cn("relative inline-block", className)}>{children}</span>;
  }

  return (
    <span className={cn("relative inline-block", className)}>
      <span className={cn(glitch && "animate-glitch")}>{children}</span>
      {glitch && (
        <>
          <span className="absolute top-0 left-0 text-cyan-400 opacity-70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, -2px)' }} aria-hidden="true">
            {children}
          </span>
          <span className="absolute top-0 left-0 text-rose-500 opacity-70" style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)', transform: 'translate(2px, 2px)' }} aria-hidden="true">
            {children}
          </span>
        </>
      )}
    </span>
  );
};

const HologramCard = ({ icon: Icon, title, description, delay = 0 }: { icon: any; title: string; description: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotateX: -15 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ scale: 1.05, rotateY: 5 }}
    className="relative group perspective-1000"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
    <div className="relative p-6 md:p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-background/80 via-card/50 to-background/80 backdrop-blur-xl overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--primary)/0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  </motion.div>
);

const DataStream = () => {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const [mounted, setMounted] = useState(false);
  const [streams, setStreams] = useState<Array<{id: number; left: string; delay: number; duration: number; chars: string[]}>>([]);

  useEffect(() => {
    setMounted(true);
    setStreams(Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 6.5)}%`,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)])
    })));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          className="absolute text-primary/60 font-mono text-xs"
          style={{ left: stream.left }}
          initial={{ y: '-100%' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: stream.duration,
            delay: stream.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {stream.chars.map((char, i) => (
            <div key={i} style={{ opacity: 1 - (i * 0.04) }}>{char}</div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

const NeuralNetwork = () => {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState<Array<{id: number; x: number; y: number; size: number; animDuration: number; linkDelay: number}>>([]);

  useEffect(() => {
    setMounted(true);
    setNodes(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + (Math.random() * 80),
      y: 10 + (Math.random() * 80),
      size: 3 + Math.random() * 4,
      animDuration: 2 + Math.random() * 2,
      linkDelay: Math.random() * 2
    })));
  }, []);

  if (!mounted || nodes.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" aria-hidden="true">
      {nodes.map((node, i) => 
        nodes.slice(i + 1).map((target, j) => {
          const distance = Math.hypot(target.x - node.x, target.y - node.y);
          if (distance < 40) {
            return (
              <motion.line
                key={`${i}-${j}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, delay: node.linkDelay }}
              />
            );
          }
          return null;
        })
      )}
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={`${node.x}%`}
          cy={`${node.y}%`}
          r={node.size}
          fill="hsl(var(--primary))"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: node.animDuration, repeat: Infinity }}
        />
      ))}
    </svg>
  );
};

const CyberButton = ({ children, href, variant = 'primary', icon: Icon }: { children: React.ReactNode; href: string; variant?: 'primary' | 'secondary'; icon?: any }) => {
  const [hover, setHover] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <Link 
        href={href}
        className={cn(
          "relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden group transition-all duration-300 inline-flex items-center",
          variant === 'primary' 
            ? "bg-primary text-primary-foreground hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)]" 
            : "bg-transparent border-2 border-primary/50 text-primary hover:border-primary hover:bg-primary/10"
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={hover ? { x: '100%' } : { x: '-100%' }}
          transition={{ duration: 0.6 }}
        />
        <span className="relative z-10 flex items-center gap-3">
          {children}
          {Icon && <Icon className="w-5 h-5" />}
        </span>
        
        {variant === 'primary' && (
          <motion.div
            className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
              backgroundSize: '200% 200%',
              filter: 'blur(15px)',
              zIndex: -1,
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </Link>
    </motion.div>
  );
};

const StatCounter = ({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%] animate-gradient">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground mt-2 text-sm md:text-base">{label}</div>
    </motion.div>
  );
};

const CreatorCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-xl" />
    <div className="relative p-8 md:p-12 rounded-3xl border border-primary/30 bg-gradient-to-br from-background/90 via-card/70 to-background/90 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-primary via-secondary to-primary p-1">
            <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-2" />
                <span className="text-xs font-mono text-muted-foreground">Class 10</span>
              </div>
            </div>
          </div>
          <motion.div
            className="absolute -inset-2 rounded-3xl border border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary">FOUNDER & DEVELOPER</span>
          </motion.div>
          
          <h3 className="text-3xl md:text-4xl font-bold font-headline mb-2">
            <GlitchText>Mubashir Ali</GlitchText>
          </h3>
          
          <p className="text-lg text-muted-foreground mb-4">
            15 Years Old • Student Developer • Pakistan
          </p>
          
          <p className="text-muted-foreground leading-relaxed max-w-xl">
            A passionate young developer from Pakistan, currently in Class 10. Started coding at a young age 
            and fell in love with creating digital experiences. AetherDash is my vision of bringing 
            a futuristic, cyberpunk-themed productivity platform to life - proving that age is just a number 
            when it comes to innovation.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
            {['React', 'Next.js', 'Firebase', 'TypeScript', 'Tailwind'].map((tech) => (
              <span 
                key={tech}
                className="px-3 py-1 text-xs font-mono rounded-lg bg-primary/10 border border-primary/30 text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/apps');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Brain, title: 'AI-Powered Hub', description: 'Integrated AI assistant that helps you with tasks, answers questions, and enhances your productivity workflow.' },
    { icon: MessageCircle, title: 'Real-Time Chat', description: 'Connect with friends through instant messaging. Share ideas, collaborate, and stay connected in the digital realm.' },
    { icon: Gamepad2, title: 'Gaming Dashboard', description: 'Discord-like gaming spaces with channels, voice support, and community features for gamers.' },
    { icon: Layers, title: 'Unified Dashboard', description: 'All your tasks, notes, news, and tools in one cyberpunk command center. Total control at your fingertips.' },
    { icon: Code, title: 'Developer Mode', description: 'Built-in code editor with syntax highlighting, perfect for developers who want to code on the go.' },
    { icon: Users, title: 'Community Driven', description: 'Join a growing community of users. Make friends, join spaces, and be part of something amazing.' },
  ];

  const [particles, setParticles] = useState<Array<{id: number; delay: number; size: number; duration: number}>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.5,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 10
    })));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-primary font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            INITIALIZING_SYSTEM...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.15), transparent 40%)`,
        }}
      />
      
      <DataStream />
      
      {particles.map((p) => (
        <FloatingParticle key={p.id} delay={p.delay} size={p.size} duration={p.duration} />
      ))}

      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 backdrop-blur-md bg-background/50 border-b border-border/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/50 blur-lg"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-xl md:text-2xl font-bold font-headline tracking-tight">
              <GlitchText>AETHERDASH</GlitchText>
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'About', 'Contact'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-primary transition-colors relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <motion.button
                className="px-3 md:px-5 py-2 text-sm md:text-base text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="px-3 md:px-5 py-2 text-sm md:text-base bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join Free
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      <motion.section 
        className="relative min-h-screen flex items-center justify-center pt-24 md:pt-20 overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <NeuralNetwork />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-6 md:mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-xs md:text-sm font-mono text-muted-foreground">BETA VERSION • BUILT BY A 15-YEAR-OLD</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline leading-tight mb-6 md:mb-8">
              <span className="block text-foreground">Your Cyberpunk</span>
              <span className="block mt-2">
                <GlitchText className="bg-gradient-to-r from-primary via-cyan-400 to-secondary bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                  Digital Hub
                </GlitchText>
              </span>
            </h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              AetherDash is a futuristic productivity platform with AI assistance, real-time chat, 
              gaming spaces, and more — all wrapped in a stunning cyberpunk aesthetic. 
              Created with passion by a young developer from Pakistan.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CyberButton href="/signup" variant="primary" icon={Rocket}>
                Get Started Free
              </CyberButton>
              <CyberButton href="#features" variant="secondary" icon={Play}>
                Explore Features
              </CyberButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-primary/50" />
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </motion.section>

      <section className="py-16 md:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-16">
            <StatCounter value={100} label="Beta Users" suffix="+" />
            <StatCounter value={99} label="Uptime" suffix="%" />
            <StatCounter value={6} label="Core Features" suffix="+" />
            <StatCounter value={1} label="Passionate Dev" suffix="" />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-12 md:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 md:mb-6">
              <GlitchText>Platform Features</GlitchText>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need in one cyberpunk-themed platform. Built with modern tech and lots of love.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => (
              <HologramCard 
                key={feature.title} 
                {...feature} 
                delay={i * 0.1} 
              />
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        
        <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 md:mb-6">
              Meet the <GlitchText>Creator</GlitchText>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The story behind AetherDash - a passion project by a young developer.
            </p>
          </motion.div>

          <CreatorCard />

          <motion.div
            className="mt-12 md:mt-16 p-6 md:p-8 rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              Why I Built This
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              I wanted to create something that combines my love for cyberpunk aesthetics with useful productivity tools. 
              AetherDash started as a learning project but evolved into a full-featured platform. Every feature you see 
              here was built with dedication and countless hours of learning. This is proof that young developers can 
              create amazing things when they put their minds to it. I hope you enjoy using AetherDash as much as 
              I enjoyed building it!
            </p>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6 md:mb-8">
              Ready to <GlitchText>Join</GlitchText>?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
              Be part of the AetherDash community. Sign up for free and start exploring 
              all the features. Your feedback helps make this platform better!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <CyberButton href="/signup" variant="primary" icon={ArrowRight}>
                Create Free Account
              </CyberButton>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              Free forever • No credit card required • Join in seconds
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-8 border-t border-border/50">
              <a 
                href="https://wa.me/9203122574283"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-green-400 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>WhatsApp: 03122574283</span>
              </a>
              <a 
                href="mailto:aetherweavedash@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>aetherweavedash@gmail.com</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 md:py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">AETHERDASH</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">BETA</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link>
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#about" className="hover:text-primary transition-colors">About</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground text-center md:text-right">
              Made with <Heart className="w-4 h-4 inline text-red-500" /> by Mubashir Ali
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s ease infinite;
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        .animate-glitch {
          animation: glitch 0.3s ease infinite;
        }
      `}</style>
    </div>
  );
}
