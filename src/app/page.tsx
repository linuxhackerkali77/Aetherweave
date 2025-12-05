'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { 
  Sparkles, Zap, Brain, MessageCircle, Shield, Rocket, 
  ArrowRight, Play, ChevronDown, Globe, Cpu, Network,
  Lock, Star, Users, Clock, Layers, Eye, Terminal
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FloatingParticle = ({ delay = 0, size = 4, duration = 20 }: { delay?: number; size?: number; duration?: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
      boxShadow: `0 0 ${size * 2}px hsl(var(--primary) / 0.5)`,
    }}
    initial={{ 
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
      opacity: 0 
    }}
    animate={{
      y: -100,
      opacity: [0, 1, 1, 0],
      x: `+=${Math.random() * 200 - 100}`,
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const GlitchText = ({ children, className }: { children: string; className?: string }) => {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn("relative inline-block", className)}>
      <span className={cn(glitch && "animate-glitch")}>{children}</span>
      {glitch && (
        <>
          <span className="absolute top-0 left-0 text-cyan-400 opacity-70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)', transform: 'translate(-2px, -2px)' }}>
            {children}
          </span>
          <span className="absolute top-0 left-0 text-rose-500 opacity-70" style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)', transform: 'translate(2px, 2px)' }}>
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
  const streams = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${5 + (i * 6.5)}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    chars: Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)])
  })), []);

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
  const nodes = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + (Math.random() * 80),
    y: 10 + (Math.random() * 80),
    size: 3 + Math.random() * 4
  })), []);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
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
                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
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
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
        />
      ))}
    </svg>
  );
};

const CyberButton = ({ children, href, variant = 'primary', icon: Icon }: { children: React.ReactNode; href: string; variant?: 'primary' | 'secondary'; icon?: any }) => {
  const [hover, setHover] = useState(false);
  
  return (
    <Link href={href}>
      <motion.button
        className={cn(
          "relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden group transition-all duration-300",
          variant === 'primary' 
            ? "bg-primary text-primary-foreground hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)]" 
            : "bg-transparent border-2 border-primary/50 text-primary hover:border-primary hover:bg-primary/10"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
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
      </motion.button>
    </Link>
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
      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%] animate-gradient">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-muted-foreground mt-2">{label}</div>
    </motion.div>
  );
};

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
    { icon: Brain, title: 'Neural AI Core', description: 'Powered by advanced AI that learns your workflow and anticipates your needs. Experience seamless productivity enhancement.' },
    { icon: MessageCircle, title: 'Quantum Comms', description: 'Real-time encrypted messaging with holographic video calls. Connect instantly across the digital realm.' },
    { icon: Shield, title: 'CyberShield Pro', description: 'Military-grade encryption protects your data. Your privacy is our prime directive.' },
    { icon: Layers, title: 'Omni-Dashboard', description: 'Unified command center for all your tasks, notes, and files. Total control at your fingertips.' },
    { icon: Zap, title: 'HyperFlow Engine', description: 'Lightning-fast performance with zero-latency interactions. The speed of thought, digitized.' },
    { icon: Globe, title: 'Nexus Network', description: 'Seamlessly sync across all devices in the metaverse. Your workspace follows you everywhere.' },
  ];

  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 10
  })), []);

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
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
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
            <span className="text-2xl font-bold font-headline tracking-tight">
              <GlitchText>AETHERDASH</GlitchText>
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Security', 'Pricing'].map((item, i) => (
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

          <div className="flex items-center gap-4">
            <Link href="/login">
              <motion.button
                className="px-5 py-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      <motion.section 
        className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <NeuralNetwork />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-mono text-muted-foreground">SYSTEM_STATUS: ONLINE</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline leading-tight mb-8">
              <span className="block text-foreground">Welcome to the</span>
              <span className="block mt-2">
                <GlitchText className="bg-gradient-to-r from-primary via-cyan-400 to-secondary bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                  Digital Nexus
                </GlitchText>
              </span>
            </h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Experience the future of productivity. AetherDash is your cyberpunk command center — 
              where AI meets human potential in perfect synthesis.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CyberButton href="/signup" variant="primary" icon={Rocket}>
                Enter the Nexus
              </CyberButton>
              <CyberButton href="#features" variant="secondary" icon={Play}>
                Watch Demo
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

      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <StatCounter value={50000} label="Active Users" suffix="+" />
            <StatCounter value={99} label="Uptime" suffix="%" />
            <StatCounter value={2} label="Response Time" suffix="ms" />
            <StatCounter value={256} label="Encryption" suffix="-bit" />
          </div>
        </div>
      </section>

      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">
              <GlitchText>Augmented Capabilities</GlitchText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock your full potential with our next-generation toolkit designed for the digital age.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      <section id="security" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">
                <GlitchText>Fortress-Grade Security</GlitchText>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Your data is protected by military-grade encryption and zero-knowledge architecture. 
                We cant see your data, and neither can anyone else.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Lock, text: 'End-to-end encryption on all communications' },
                  { icon: Eye, text: 'Zero-knowledge proof architecture' },
                  { icon: Terminal, text: 'Open-source security audits' },
                  { icon: Shield, text: 'GDPR & SOC2 compliant' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-square max-w-md mx-auto">
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-8 rounded-full border border-secondary/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-16 rounded-full border border-primary/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                    animate={{ boxShadow: ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 0 30px hsl(var(--primary) / 0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-16 h-16 text-white" />
                  </motion.div>
                </div>

                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 rounded-full bg-primary"
                    style={{
                      top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                      left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold font-headline mb-8">
              Ready to <GlitchText>Transcend</GlitchText>?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of pioneers already experiencing the future of digital productivity. 
              Your journey into the nexus begins now.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CyberButton href="/signup" variant="primary" icon={ArrowRight}>
                Create Free Account
              </CyberButton>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              No credit card required • Free forever tier • Setup in 30 seconds
            </p>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">AETHERDASH</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors">API</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 AetherDash. All rights reserved.
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
