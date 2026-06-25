import { describe, it, expect } from "vitest";
import { generateUserInitials } from "./initials";

describe("generateUserInitials", () => {
  it("generates initials from full_name with two words", () => {
    const user = {
      user_metadata: { full_name: "John Doe" },
      email: "john@example.com",
    };
    expect(generateUserInitials(user)).toBe("JD");
  });

  it("generates initials from name field", () => {
    const user = {
      user_metadata: { name: "Jane Smith" },
      email: "jane@example.com",
    };
    expect(generateUserInitials(user)).toBe("JS");
  });

  it("falls back to email when no name available", () => {
    const user = {
      user_metadata: {},
      email: "john.doe@example.com",
    };
    // Email splits by . _ - so john.doe@example.com -> ["john", "doe", "example", "com"]
    expect(generateUserInitials(user)).toBe("JD");
  });

  it("handles single word names", () => {
    const user = {
      user_metadata: { full_name: "Madonna" },
      email: "madonna@example.com",
    };
    expect(generateUserInitials(user)).toBe("MA");
  });

  it("handles empty strings", () => {
    const user = {
      user_metadata: { full_name: "", name: "" },
      email: "user@example.com",
    };
    expect(generateUserInitials(user)).toBe("U");
  });

  it("handles names with special characters as separators", () => {
    const user = {
      user_metadata: { full_name: "Jean-Pierre" },
      email: "jean@example.com",
    };
    expect(generateUserInitials(user)).toBe("JP");
  });

  it("handles names with dots as separators", () => {
    const user = {
      user_metadata: { full_name: "J.R.R. Tolkien" },
      email: "jrtolkien@example.com",
    };
    expect(generateUserInitials(user)).toBe("JR");
  });

  it("handles names with underscores as separators", () => {
    const user = {
      user_metadata: { full_name: "John_Mike" },
      email: "john@example.com",
    };
    expect(generateUserInitials(user)).toBe("JM");
  });

  it("handles names with multiple spaces", () => {
    const user = {
      user_metadata: { full_name: "  John   Doe  " },
      email: "john@example.com",
    };
    expect(generateUserInitials(user)).toBe("JD");
  });

  it("handles email with underscores", () => {
    const user = {
      user_metadata: {},
      email: "john_doe@example.com",
    };
    // Email splits by _ so john_doe@example.com -> ["john", "doe@example", "com"]
    expect(generateUserInitials(user)).toBe("JD");
  });

  it("handles names with mixed separators", () => {
    const user = {
      user_metadata: { full_name: "Jean-Luc Picard" },
      email: "jpicard@example.com",
    };
    // Jean-Luc Picard splits by - so ["Jean", "Luc Picard"]
    expect(generateUserInitials(user)).toBe("JL");
  });

  it("handles name with only one character", () => {
    const user = {
      user_metadata: { full_name: "A" },
      email: "a@example.com",
    };
    expect(generateUserInitials(user)).toBe("A");
  });
});

// Property-Based Tests
describe("generateUserInitials property tests", () => {
  it("always returns exactly 2 characters for names with 2+ parts", () => {
    const users = [
      { user_metadata: { full_name: "John Doe" }, email: "john@example.com" },
      { user_metadata: { full_name: "Mary Jane Watson" }, email: "mary@example.com" },
      { user_metadata: { full_name: "A B" }, email: "a@example.com" },
      { user_metadata: { full_name: "John-Mike" }, email: "john@example.com" },
    ];
    users.forEach(user => {
      const initials = generateUserInitials(user);
      expect(initials.length).toBe(2);
    });
  });

  it("returns single character for single-letter names", () => {
    const users = [
      { user_metadata: { full_name: "A" }, email: "a@example.com" },
      { user_metadata: { full_name: "Z" }, email: "z@example.com" },
    ];
    users.forEach(user => {
      const initials = generateUserInitials(user);
      expect(initials.length).toBe(1);
    });
  });

  it("always returns uppercase letters", () => {
    const users = [
      { user_metadata: { full_name: "john doe" }, email: "john@example.com" },
      { user_metadata: { full_name: "MARY JANE" }, email: "mary@example.com" },
      { user_metadata: { full_name: "john_doe" }, email: "john@example.com" },
    ];
    users.forEach(user => {
      const initials = generateUserInitials(user);
      expect(initials).toBe(initials.toUpperCase());
    });
  });

  it("handles names with only whitespace gracefully", () => {
    const users = [
      { user_metadata: { full_name: "   " }, email: "user@example.com" },
      { user_metadata: { full_name: "" }, email: "user@example.com" },
    ];
    users.forEach(user => {
      const initials = generateUserInitials(user);
      expect(initials).toBe("U");
    });
  });
});
