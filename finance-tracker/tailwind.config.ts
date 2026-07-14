// tailwind.config.ts
// Wires every custom property from src/styles/tokens.css into Tailwind's
// theme so components use `bg-canvas`, `text-primary`, `shadow-glow-blue`,
// `font-display`, etc. instead of inline `style={{ background: 'var(--x)' }}`.

import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-bg-canvas)',
        surface: {
          DEFAULT: 'var(--color-bg-surface)',
          raised: 'var(--color-bg-surface-raised)',
        },
        subtle: 'var(--color-bg-subtle)',
        muted: 'var(--color-bg-muted)',
        inverse: 'var(--color-bg-inverse)',

        border: {
          DEFAULT: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },

        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          disabled: 'var(--color-text-disabled)',
        },

        brand: {
          primary: 'var(--color-brand-primary)',
          'primary-hover': 'var(--color-brand-primary-hover)',
          secondary: 'var(--color-brand-secondary)',
        },

        financial: {
          positive: 'var(--color-financial-positive)',
          'positive-bg': 'var(--color-financial-positive-bg)',
          negative: 'var(--color-financial-negative)',
          'negative-bg': 'var(--color-financial-negative-bg)',
          neutral: 'var(--color-financial-neutral)',
          'neutral-bg': 'var(--color-financial-neutral-bg)',
        },

        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',

        glass: {
          bg: 'var(--glass-bg)',
          'bg-strong': 'var(--glass-bg-strong)',
          border: 'var(--glass-border)',
        },
      },

      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },

      fontSize: {
        '2xs': 'var(--fs-2xs)',
        xs: 'var(--fs-xs)',
        sm: 'var(--fs-sm)',
        base: 'var(--fs-base)',
        lg: 'var(--fs-lg)',
        xl: 'var(--fs-xl)',
        '2xl': 'var(--fs-2xl)',
        '3xl': 'var(--fs-3xl)',
        '4xl': 'var(--fs-4xl)',
        '5xl': 'var(--fs-5xl)',
        '6xl': 'var(--fs-6xl)',
      },

      fontWeight: {
        regular: 'var(--fw-regular)',
        medium: 'var(--fw-medium)',
        semibold: 'var(--fw-semibold)',
        bold: 'var(--fw-bold)',
        extrabold: 'var(--fw-extrabold)',
      },

      lineHeight: {
        tight: 'var(--lh-tight)',
        snug: 'var(--lh-snug)',
        normal: 'var(--lh-normal)',
        relaxed: 'var(--lh-relaxed)',
      },

      letterSpacing: {
        tight: 'var(--ls-tight)',
        normal: 'var(--ls-normal)',
        wide: 'var(--ls-wide)',
      },

      spacing: {
        px: 'var(--space-px)',
        18: '4.5rem',
        88: '22rem',
      },

      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },

      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'glow-blue': 'var(--shadow-glow-blue)',
        'glow-emerald': 'var(--shadow-glow-emerald)',
        'glow-rose': 'var(--shadow-glow-rose)',
        glass: 'var(--glass-shadow)',
      },

      backdropBlur: {
        glass: 'var(--glass-blur)',
        'glass-strong': 'var(--glass-blur-strong)',
      },

      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        decelerate: 'var(--ease-decelerate)',
        accelerate: 'var(--ease-accelerate)',
        elastic: 'var(--ease-elastic)',
        magnetic: 'var(--ease-magnetic)',
        'spring-stiff': 'var(--ease-spring-stiff)',
      },

      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
        page: 'var(--duration-page)',
      },

      zIndex: {
        base: 'var(--z-base)',
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
        max: 'var(--z-max)',
      },

      backgroundImage: {
        'aurora-1': 'var(--aurora-glow-1)',
        'aurora-2': 'var(--aurora-glow-2)',
        'aurora-3': 'var(--aurora-glow-3)',
      },

      screens: {
        xs: '420px',
        // sm/md/lg/xl/2xl remain Tailwind defaults (640/768/1024/1280/1536px)
      },

      keyframes: {
        'shimmer-sweep': {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        shimmer: 'shimmer-sweep 1.6s var(--ease-standard) infinite',
        'fade-in': 'fade-in var(--duration-base) var(--ease-decelerate) forwards',
        'scale-in': 'scale-in var(--duration-base) var(--ease-magnetic) forwards',
        'slide-up': 'slide-up var(--duration-slow) var(--ease-decelerate) forwards',
      },
    },
  },
  plugins: [
    // Custom variant so you can write `data-numeric:tabular-nums` style
    // utilities if ever needed outside the [data-numeric] selector in globals.css.
    plugin(({ addVariant }) => {
      addVariant('data-numeric', '&[data-numeric="true"]');
      addVariant('glass', '&.glass-surface');
    }),

    // Small plugin exposing `.glass` / `.aurora-bg` as Tailwind-recognized
    // component utilities (mirrors the @layer components block in globals.css
    // so editors/IntelliSense surface them as valid classes).
    plugin(({ addComponents, theme }) => {
      addComponents({
        '.glass-panel': {
          backgroundColor: theme('colors.glass.bg'),
          border: `1px solid ${theme('colors.glass.border')}`,
          boxShadow: theme('boxShadow.glass'),
        },
      });
    }),
  ],
};

export default config;
