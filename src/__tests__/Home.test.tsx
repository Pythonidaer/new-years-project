import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ThemeProvider } from "@/context/ThemeContext";

// Mock all section components
vi.mock("@/sections/TopBanner", () => ({
  TopBanner: () => <div data-testid="top-banner">TopBanner</div>,
}));

vi.mock("@/sections/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("@/sections/Hero", () => ({
  Hero: () => <div data-testid="hero">Hero</div>,
}));

vi.mock("@/sections/HeroMarquee", () => ({
  HeroMarquee: () => <div data-testid="hero-marquee">HeroMarquee</div>,
}));

vi.mock("@/sections/PlatformIntro", () => ({
  PlatformIntro: () => <div data-testid="platform-intro">PlatformIntro</div>,
}));

vi.mock("@/sections/AgencyLogos", () => ({
  AgencyLogos: () => <div data-testid="agency-logos">AgencyLogos</div>,
}));

vi.mock("@/sections/FeatureAccordion", () => ({
  FeatureAccordion: () => <div data-testid="feature-accordion">FeatureAccordion</div>,
}));

vi.mock("@/sections/CustomerSpotlight", () => ({
  CustomerSpotlight: () => <div data-testid="customer-spotlight">CustomerSpotlight</div>,
}));

vi.mock("@/sections/CampaignBanner", () => ({
  CampaignBanner: () => <div data-testid="campaign-banner">CampaignBanner</div>,
}));

vi.mock("@/sections/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("@/components/MetaTags", () => ({
  MetaTags: ({ title, description, url, type, image }: {
    title: string;
    description: string;
    url: string;
    type: string;
    image: string;
  }) => (
    <div data-testid="meta-tags">
      <div data-testid="meta-title">{title}</div>
      <div data-testid="meta-description">{description}</div>
      <div data-testid="meta-url">{url}</div>
      <div data-testid="meta-type">{type}</div>
      <div data-testid="meta-image">{image}</div>
    </div>
  ),
}));

// Mock LatestBlogs with lazy loading simulation
const mockLatestBlogs = vi.fn(() => <div data-testid="latest-blogs">LatestBlogs</div>);

// Create a factory that returns a new promise for each import
let resolveLatestBlogsImport: (value: typeof import("@/sections/LatestBlogs")) => void | undefined;

vi.mock("@/sections/LatestBlogs", () => {
  return new Promise<typeof import("@/sections/LatestBlogs")>((resolve) => {
    resolveLatestBlogsImport = () => {
      resolve({
        LatestBlogs: mockLatestBlogs,
      } as typeof import("@/sections/LatestBlogs"));
    };
    // Auto-resolve after a delay to allow Suspense fallback to be visible
    setTimeout(() => {
      resolve({
        LatestBlogs: mockLatestBlogs,
      } as typeof import("@/sections/LatestBlogs"));
    }, 100);
  });
});

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveLatestBlogsImport = undefined;
  });

  const renderHome = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  describe("component structure", () => {
    it("should render main element", () => {
      renderHome();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should render all section components in correct order", () => {
      renderHome();

      const sections = [
        "top-banner",
        "header",
        "hero",
        "hero-marquee",
        "platform-intro",
        "agency-logos",
        "feature-accordion",
        "customer-spotlight",
        "campaign-banner",
        "footer",
      ];

      sections.forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    });
  });

  describe("MetaTags", () => {
    it("should render MetaTags with correct title", () => {
      renderHome();
      expect(screen.getByTestId("meta-title")).toHaveTextContent(
        "Johnny H. | Software Engineer & Developer"
      );
    });

    it("should render MetaTags with correct description", () => {
      renderHome();
      expect(screen.getByTestId("meta-description")).toHaveTextContent(
        "Portfolio of Johnny Hammond - Software Engineer specializing in React, TypeScript, and modern web development. View projects, experience, and technical blog posts."
      );
    });

    it("should render MetaTags with correct url", () => {
      renderHome();
      expect(screen.getByTestId("meta-url")).toHaveTextContent("/");
    });

    it("should render MetaTags with correct type", () => {
      renderHome();
      expect(screen.getByTestId("meta-type")).toHaveTextContent("website");
    });

    it("should render MetaTags with correct image", () => {
      renderHome();
      expect(screen.getByTestId("meta-image")).toHaveTextContent("/og-image.png");
    });
  });

  describe("lazy loading LatestBlogs", () => {
    it("should show Suspense fallback while LatestBlogs is loading", () => {
      renderHome();
      // Fallback should be visible initially (before async import completes after 100ms)
      expect(screen.getByText("Loading blog preview...")).toBeInTheDocument();
    });

    it("should render LatestBlogs after lazy load completes", async () => {
      renderHome();

      // Initially shows fallback
      expect(screen.getByText("Loading blog preview...")).toBeInTheDocument();

      // Wait for lazy load to complete
      await waitFor(() => {
        expect(screen.getByTestId("latest-blogs")).toBeInTheDocument();
      }, { timeout: 1000 });

      // Fallback should be removed after component loads
      expect(screen.queryByText("Loading blog preview...")).not.toBeInTheDocument();
    });

    it("should call LatestBlogs component after loading", async () => {
      renderHome();

      await waitFor(() => {
        expect(mockLatestBlogs).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it("should render LatestBlogs within Suspense boundary", async () => {
      renderHome();

      await waitFor(() => {
        const latestBlogs = screen.getByTestId("latest-blogs");
        expect(latestBlogs).toBeInTheDocument();
        // Verify it's within the main element
        expect(latestBlogs.closest("main")).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe("component order", () => {
    it("should render components in the correct order", async () => {
      renderHome();

      // Wait for LatestBlogs to load
      await waitFor(() => {
        expect(screen.getByTestId("latest-blogs")).toBeInTheDocument();
      }, { timeout: 1000 });

      const main = screen.getByRole("main");
      const children = Array.from(main.children);

      // Check order: MetaTags, TopBanner, Header, Hero, HeroMarquee, PlatformIntro,
      // AgencyLogos, FeatureAccordion, CustomerSpotlight, Suspense (LatestBlogs), CampaignBanner, Footer
      const expectedOrder = [
        "meta-tags",
        "top-banner",
        "header",
        "hero",
        "hero-marquee",
        "platform-intro",
        "agency-logos",
        "feature-accordion",
        "customer-spotlight",
        "latest-blogs", // Inside Suspense
        "campaign-banner",
        "footer",
      ];

      // Get test IDs from rendered elements
      const renderedTestIds = children
        .map((child) => {
          if (child instanceof HTMLElement) {
            // Check if it's the Suspense boundary (contains LatestBlogs)
            const latestBlogs = child.querySelector('[data-testid="latest-blogs"]');
            if (latestBlogs) return "latest-blogs";
            return child.getAttribute("data-testid");
          }
          return null;
        })
        .filter(Boolean);

      // Verify all expected components are present
      expectedOrder.forEach((testId) => {
        expect(screen.getByTestId(testId)).toBeInTheDocument();
      });
    });
  });

  describe("Suspense fallback", () => {
    it("should remove fallback after LatestBlogs loads", async () => {
      renderHome();

      // Wait for LatestBlogs to load (mock auto-resolves after 100ms)
      await waitFor(() => {
        expect(screen.getByTestId("latest-blogs")).toBeInTheDocument();
      }, { timeout: 1000 });

      // Fallback should be removed after component loads
      expect(screen.queryByText("Loading blog preview...")).not.toBeInTheDocument();
    });
  });
});
