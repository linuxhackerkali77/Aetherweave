'use client';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  children: string;
  className?: string;
}

export default function GlitchText({ children, className }: GlitchTextProps) {
  return (
    <span className={cn("relative inline-block", className)} data-text={children}>
      <span className="glitch-text">{children}</span>
      <style jsx>{`
        .glitch-text {
          position: relative;
          display: inline-block;
          animation: glitch-skew 1s infinite linear alternate-reverse;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
          animation: glitch-anim2 1s infinite linear alternate-reverse;
        }
        @keyframes glitch-anim {
          0% { clip: rect(31px, 9999px, 94px, 0); transform: skew(0.3deg); }
          5% { clip: rect(70px, 9999px, 71px, 0); transform: skew(0.5deg); }
          10% { clip: rect(60px, 9999px, 86px, 0); transform: skew(0.2deg); }
          15% { clip: rect(89px, 9999px, 35px, 0); transform: skew(0.8deg); }
          20% { clip: rect(15px, 9999px, 15px, 0); transform: skew(0.1deg); }
          25% { clip: rect(54px, 9999px, 44px, 0); transform: skew(0.4deg); }
          30% { clip: rect(26px, 9999px, 81px, 0); transform: skew(0.6deg); }
          35% { clip: rect(99px, 9999px, 98px, 0); transform: skew(0.3deg); }
          40% { clip: rect(65px, 9999px, 43px, 0); transform: skew(0.7deg); }
          45% { clip: rect(11px, 9999px, 5px, 0); transform: skew(0.2deg); }
          50% { clip: rect(76px, 9999px, 77px, 0); transform: skew(0.5deg); }
          100% { clip: rect(31px, 9999px, 94px, 0); transform: skew(0.3deg); }
        }
        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 119px, 0); transform: skew(0.5deg); }
          5% { clip: rect(52px, 9999px, 74px, 0); transform: skew(0.3deg); }
          10% { clip: rect(79px, 9999px, 85px, 0); transform: skew(0.7deg); }
          15% { clip: rect(12px, 9999px, 94px, 0); transform: skew(0.2deg); }
          20% { clip: rect(63px, 9999px, 29px, 0); transform: skew(0.6deg); }
          25% { clip: rect(41px, 9999px, 82px, 0); transform: skew(0.4deg); }
          30% { clip: rect(3px, 9999px, 8px, 0); transform: skew(0.8deg); }
          35% { clip: rect(86px, 9999px, 73px, 0); transform: skew(0.1deg); }
          40% { clip: rect(25px, 9999px, 50px, 0); transform: skew(0.5deg); }
          45% { clip: rect(97px, 9999px, 16px, 0); transform: skew(0.3deg); }
          50% { clip: rect(44px, 9999px, 61px, 0); transform: skew(0.7deg); }
          100% { clip: rect(65px, 9999px, 119px, 0); transform: skew(0.5deg); }
        }
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          10% { transform: skew(-1deg); }
          20% { transform: skew(1deg); }
          30% { transform: skew(-2deg); }
          40% { transform: skew(2deg); }
          50% { transform: skew(-1deg); }
          60% { transform: skew(1deg); }
          70% { transform: skew(0deg); }
          80% { transform: skew(-1deg); }
          90% { transform: skew(1deg); }
          100% { transform: skew(0deg); }
        }
      `}</style>
    </span>
  );
}
