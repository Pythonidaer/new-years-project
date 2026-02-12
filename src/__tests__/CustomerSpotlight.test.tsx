import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomerSpotlight } from "@/sections/CustomerSpotlight";
import { ThemeProvider } from "@/context/ThemeContext";

describe("CustomerSpotlight", () => {
  beforeEach(() => {
    // Clear any state between tests
  });

  describe("rendering", () => {
    it("renders the component without crashing", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const section = document.querySelector("section");
      expect(section).toBeTruthy();
    });

    it("displays the 'References' heading", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      expect(screen.getByText("References")).toBeTruthy();
    });

    it("renders the first testimonial by default", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      // First testimonial quote
      expect(
        screen.getByText(
          /Jonathan built a clear, reliable and accessible campaign website/i
        )
      ).toBeTruthy();
      // First testimonial author
      expect(screen.getByText("Bil Legault")).toBeTruthy();
      // First testimonial role
      expect(screen.getByText("Former Salem City Councilor At-Large")).toBeTruthy();
    });

    it("renders testimonial image when image is provided", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const image = screen.getByAltText("Bil Legault");
      expect(image).toBeTruthy();
      expect(image).toHaveAttribute("src", "/bil_legault.webp");
    });

    it("renders placeholder text when image is not provided", () => {
      const testimonialsWithoutImage = [
        {
          id: 1,
          quote: "Test quote without image.",
          author: "Test Author",
          role: "Test Role",
          // no image - triggers placeholder branch
        },
      ];
      render(
        <ThemeProvider>
          <CustomerSpotlight testimonials={testimonialsWithoutImage} />
        </ThemeProvider>
      );

      expect(screen.getByText("Image")).toBeInTheDocument();
    });

    it("renders all three dot indicators", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      // Should have 3 dots (one for each testimonial)
      const dots = screen.getAllByLabelText(/Go to testimonial \d+/);
      expect(dots.length).toBe(3);
    });

    it("highlights the first dot as active by default", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const firstDot = screen.getByLabelText("Go to testimonial 1");
      expect(firstDot.className).toContain("dotActive");
    });

    it("renders navigation arrows with correct aria-labels", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      expect(screen.getByLabelText("Previous testimonial")).toBeTruthy();
      expect(screen.getByLabelText("Next testimonial")).toBeTruthy();
    });
  });

  describe("navigation - scrollNext", () => {
    it("moves to the next testimonial when next button is clicked", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      // Initially showing first testimonial
      expect(screen.getByText("Bil Legault")).toBeTruthy();

      // Click next button
      const nextButton = screen.getByLabelText("Next testimonial");
      fireEvent.click(nextButton);

      // Should now show second testimonial
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();
      expect(
        screen.getByText(
          /Johnny showed consistent drive and curiosity/i
        )
      ).toBeTruthy();
    });

    it("wraps around to first testimonial when clicking next on last testimonial", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");

      // Navigate to last testimonial (click next twice from first)
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should be on third testimonial
      expect(screen.getByText("John Bauer")).toBeTruthy();

      // Click next again - should wrap to first
      fireEvent.click(nextButton);

      // Should be back on first testimonial
      expect(screen.getByText("Bil Legault")).toBeTruthy();
    });

    it("updates active dot when navigating to next testimonial", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");
      const firstDot = screen.getByLabelText("Go to testimonial 1");
      const secondDot = screen.getByLabelText("Go to testimonial 2");

      // First dot should be active initially
      expect(firstDot.className).toContain("dotActive");
      expect(secondDot.className).not.toContain("dotActive");

      // Click next
      fireEvent.click(nextButton);

      // Second dot should now be active
      expect(firstDot.className).not.toContain("dotActive");
      expect(secondDot.className).toContain("dotActive");
    });
  });

  describe("navigation - scrollPrev", () => {
    it("moves to the previous testimonial when previous button is clicked", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");
      const prevButton = screen.getByLabelText("Previous testimonial");

      // Navigate to second testimonial first
      fireEvent.click(nextButton);
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();

      // Click previous
      fireEvent.click(prevButton);

      // Should be back on first testimonial
      expect(screen.getByText("Bil Legault")).toBeTruthy();
    });

    it("wraps around to last testimonial when clicking previous on first testimonial", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const prevButton = screen.getByLabelText("Previous testimonial");

      // Should be on first testimonial initially
      expect(screen.getByText("Bil Legault")).toBeTruthy();

      // Click previous - should wrap to last
      fireEvent.click(prevButton);

      // Should be on last (third) testimonial
      expect(screen.getByText("John Bauer")).toBeTruthy();
      expect(
        screen.getByText(
          /Johnny brings strong frontend instincts/i
        )
      ).toBeTruthy();
    });

    it("updates active dot when navigating to previous testimonial", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const prevButton = screen.getByLabelText("Previous testimonial");
      const firstDot = screen.getByLabelText("Go to testimonial 1");
      const thirdDot = screen.getByLabelText("Go to testimonial 3");

      // First dot should be active initially
      expect(firstDot.className).toContain("dotActive");

      // Click previous (should wrap to last)
      fireEvent.click(prevButton);

      // Third dot should now be active
      expect(firstDot.className).not.toContain("dotActive");
      expect(thirdDot.className).toContain("dotActive");
    });
  });

  describe("navigation - dot indicators", () => {
    it("navigates to specific testimonial when dot is clicked", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      // Should start on first testimonial
      expect(screen.getByText("Bil Legault")).toBeTruthy();

      // Click third dot
      const thirdDot = screen.getByLabelText("Go to testimonial 3");
      fireEvent.click(thirdDot);

      // Should now show third testimonial
      expect(screen.getByText("John Bauer")).toBeTruthy();
    });

    it("updates active dot when clicking a different dot", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const firstDot = screen.getByLabelText("Go to testimonial 1");
      const secondDot = screen.getByLabelText("Go to testimonial 2");
      const thirdDot = screen.getByLabelText("Go to testimonial 3");

      // First dot should be active initially
      expect(firstDot.className).toContain("dotActive");

      // Click second dot
      fireEvent.click(secondDot);
      expect(secondDot.className).toContain("dotActive");
      expect(firstDot.className).not.toContain("dotActive");
      expect(thirdDot.className).not.toContain("dotActive");

      // Click third dot
      fireEvent.click(thirdDot);
      expect(thirdDot.className).toContain("dotActive");
      expect(firstDot.className).not.toContain("dotActive");
      expect(secondDot.className).not.toContain("dotActive");
    });

    it("displays correct testimonial content when navigating via dots", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      // Click second dot
      const secondDot = screen.getByLabelText("Go to testimonial 2");
      fireEvent.click(secondDot);

      // Should show second testimonial
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();
      expect(screen.getByText("Director of IT Services")).toBeTruthy();
      expect(
        screen.getByText(
          /Johnny showed consistent drive and curiosity/i
        )
      ).toBeTruthy();
    });
  });

  describe("testimonial content", () => {
    it("displays all three testimonials correctly", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");

      // First testimonial
      expect(screen.getByText("Bil Legault")).toBeTruthy();
      expect(screen.getByText("Former Salem City Councilor At-Large")).toBeTruthy();

      // Navigate to second
      fireEvent.click(nextButton);
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();
      expect(screen.getByText("Director of IT Services")).toBeTruthy();

      // Navigate to third
      fireEvent.click(nextButton);
      expect(screen.getByText("John Bauer")).toBeTruthy();
      expect(screen.getByText("Principal Software Engineer")).toBeTruthy();
    });

    it("displays images with correct alt text", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");

      // First testimonial image
      expect(screen.getByAltText("Bil Legault")).toHaveAttribute(
        "src",
        "/bil_legault.webp"
      );

      // Navigate to second
      fireEvent.click(nextButton);
      expect(screen.getByAltText("Johnathon Broekhuizen")).toHaveAttribute(
        "src",
        "/john_broekhuizen.png"
      );

      // Navigate to third
      fireEvent.click(nextButton);
      expect(screen.getByAltText("John Bauer")).toHaveAttribute(
        "src",
        "/john_bauer.png"
      );
    });

    it("displays quotes in blockquote elements", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const blockquote = document.querySelector("blockquote");
      expect(blockquote).toBeTruthy();
      expect(blockquote?.textContent).toContain(
        "Jonathan built a clear, reliable and accessible campaign website"
      );
    });
  });

  describe("accessibility", () => {
    it("has proper aria-labels for all interactive elements", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      // Navigation buttons
      expect(screen.getByLabelText("Previous testimonial")).toBeTruthy();
      expect(screen.getByLabelText("Next testimonial")).toBeTruthy();

      // Dot indicators
      expect(screen.getByLabelText("Go to testimonial 1")).toBeTruthy();
      expect(screen.getByLabelText("Go to testimonial 2")).toBeTruthy();
      expect(screen.getByLabelText("Go to testimonial 3")).toBeTruthy();
    });

    it("uses alt text for images", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const image = screen.getByAltText("Bil Legault");
      expect(image).toBeTruthy();
    });
  });

  describe("edge cases", () => {
    it("handles rapid navigation clicks correctly", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");

      // Rapidly click next multiple times
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should be on second testimonial (wrapped around)
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();
    });

    it("maintains correct state when navigating via multiple methods", () => {
      render(
        <ThemeProvider>
          <CustomerSpotlight />
        </ThemeProvider>
      );

      const nextButton = screen.getByLabelText("Next testimonial");
      const secondDot = screen.getByLabelText("Go to testimonial 2");
      const thirdDot = screen.getByLabelText("Go to testimonial 3");

      // Navigate via next button
      fireEvent.click(nextButton);
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();

      // Navigate via dot
      fireEvent.click(thirdDot);
      expect(screen.getByText("John Bauer")).toBeTruthy();

      // Navigate via dot again
      fireEvent.click(secondDot);
      expect(screen.getByText("Johnathon Broekhuizen")).toBeTruthy();
    });
  });
});
