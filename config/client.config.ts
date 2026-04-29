/**
 * Client Configuration
 * 
 * This is the single source of truth for all client-specific settings.
 * For a new client, duplicate this file and customize the values.
 * Environment variables can override any setting at runtime.
 */

export const CLIENT_CONFIG = {
  // Branding & Identity
  site: {
    name: "The Strengths Writer",
    domain: "strengthswriter.com",
    tagline: "Positive psychology and personal development newsletter",
    description: "Write, refine, and publish from one place",
  },

  // Logo & Visual Branding
  branding: {
    logoComponent: "strengths-writer", // references components/logos/[name].tsx
    logoText: "TheStrengthsWriter",
    favicon: "/favicons/default.ico",
  },

  // Authentication Settings
  auth: {
    primaryAdminEmail: "sanjuanregie@gmail.com",
    oauth: {
      enableGithub: true,
      enableGoogle: true,
    },
  },

  // Theme & Colors
  theme: {
    mode: "light",
    colors: {
      // Admin Theme
      admin: {
        bg: "#f7f2ea",
        surface: "#ffffff",
        surfaceHover: "#efe7dc",
        text: "#3a332f",
        muted: "#7b6f64",
        heading: "#1f3d39",
        accent: "#1f3d39",
        success: "#2b776a",
        danger: "#b4534a",
        info: "#3a6b8f",
      },
      // Guest Theme
      guest: {
        background: "#faf9f6",
        foreground: "#302c2c",
        primary: "#beb09a",
      },
    },
    fonts: {
      primary: "Inter",
      secondary: "JetBrains Mono",
      accent: "Hanken Grotesk",
    },
  },

  // Content Settings
  content: {
    postType: "stories", // "stories", "articles", "posts", etc
    itemsPerPage: 10,
  },

  // Feature Flags
  features: {
    comments: true,
    tags: true,
    authorProfiles: true,
    userApprovalWorkflow: true,
    multiAuthor: true,
    assetStorage: true,
    search: true,
  },

  // Storage Configuration
  storage: {
    bucket: "post-assets",
    maxFileSize: 52428800, // 50MB in bytes
  },

  // Social & External Links
  social: {
    twitter: "https://twitter.com/strengthswriter",
    linkedin: "https://linkedin.com/in/ianllenares",
    email: "hello@strengthswriter.com",
  },

  // Taxonomy (Tags for this client)
  taxonomy: {
    tags: [
      { name: "featured", label: "Featured", color: "#F0D8A1" },
      { name: "movie-review", label: "Movie Review", color: "#E29578" },
      { name: "personal-blog", label: "Personal Blog", color: "#A8DADC" },
      { name: "worries", label: "What's Your Worry?", color: "#F4A261" },
      { name: "positive-psychology", label: "Why Positive Psychology?", color: "#8AB17D" },
      // Add remaining 31 tags here as needed
    ],
  },

  // Default Authors (can be overridden by database)
  defaultAuthors: [
    {
      id: "ian-llenares",
      name: "Ian Llenares",
      slug: "ian-llenares",
      role: "founder",
      bio: "Founder & Lead Writer - Positive Psychology Advocate",
      avatar: "/images/authors/ian-llenares.jpg",
    },
  ],
} as const;

export type ClientConfig = typeof CLIENT_CONFIG;
export type ClientConfigKey = keyof typeof CLIENT_CONFIG;
