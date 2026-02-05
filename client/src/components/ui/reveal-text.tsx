import { useEffect, useRef, useState } from "react";

interface RevealTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  splitBy?: "char" | "word";
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

export function RevealText({
  children,
  as = "span",
  className = "",
  splitBy = "char",
  delay = 0,
  staggerDelay = 30,
  once = true,
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasAnimated.current) return;
          
          setTimeout(() => {
            setIsVisible(true);
            hasAnimated.current = true;
          }, delay);
          
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay, once]);

  const splitContent = () => {
    if (splitBy === "word") {
      let wordIndex = 0;
      return children.split(/(\s+)/).map((segment, index) => {
        if (/^\s+$/.test(segment)) {
          return <span key={index}>{segment}</span>;
        }
        const currentWordIndex = wordIndex++;
        return (
          <span
            key={index}
            className="reveal-char"
            style={{
              transitionDelay: `${currentWordIndex * staggerDelay}ms`,
            }}
          >
            {segment}
          </span>
        );
      });
    }

    return children.split("").map((char, index) => (
      <span
        key={index}
        className="reveal-char"
        style={{
          transitionDelay: `${index * staggerDelay}ms`,
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  const content = (
    <>
      {splitContent()}
    </>
  );

  const baseClassName = `reveal-text ${isVisible ? "is-visible" : ""} ${className}`;

  switch (as) {
    case "h1":
      return <h1 ref={containerRef as React.RefObject<HTMLHeadingElement>} className={baseClassName} data-testid="reveal-text">{content}</h1>;
    case "h2":
      return <h2 ref={containerRef as React.RefObject<HTMLHeadingElement>} className={baseClassName} data-testid="reveal-text">{content}</h2>;
    case "h3":
      return <h3 ref={containerRef as React.RefObject<HTMLHeadingElement>} className={baseClassName} data-testid="reveal-text">{content}</h3>;
    case "h4":
      return <h4 ref={containerRef as React.RefObject<HTMLHeadingElement>} className={baseClassName} data-testid="reveal-text">{content}</h4>;
    case "p":
      return <p ref={containerRef as React.RefObject<HTMLParagraphElement>} className={baseClassName} data-testid="reveal-text">{content}</p>;
    case "div":
      return <div ref={containerRef as React.RefObject<HTMLDivElement>} className={baseClassName} data-testid="reveal-text">{content}</div>;
    default:
      return <span ref={containerRef as React.RefObject<HTMLSpanElement>} className={baseClassName} data-testid="reveal-text">{content}</span>;
  }
}

interface RevealBlockProps {
  children: React.ReactNode;
  as?: "div" | "section" | "article";
  className?: string;
  delay?: number;
  once?: boolean;
}

export function RevealBlock({
  children,
  as = "div",
  className = "",
  delay = 0,
  once = true,
}: RevealBlockProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasAnimated.current) return;
          
          setTimeout(() => {
            setIsVisible(true);
            hasAnimated.current = true;
          }, delay);
          
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay, once]);

  const baseClassName = `reveal-block ${isVisible ? "is-visible" : ""} ${className}`;

  switch (as) {
    case "section":
      return <section ref={containerRef as React.RefObject<HTMLElement>} className={baseClassName} data-testid="reveal-block">{children}</section>;
    case "article":
      return <article ref={containerRef as React.RefObject<HTMLElement>} className={baseClassName} data-testid="reveal-block">{children}</article>;
    default:
      return <div ref={containerRef as React.RefObject<HTMLDivElement>} className={baseClassName} data-testid="reveal-block">{children}</div>;
  }
}
