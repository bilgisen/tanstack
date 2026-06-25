export interface User {
  user_metadata: {
    full_name?: string;
    name?: string;
  };
  email: string;
}

/**
 * Generates two-character uppercase initials from user data.
 * 
 * Priority order for name extraction:
 * 1. full_name from user_metadata
 * 2. name from user_metadata  
 * 3. email if no name information available
 * 
 * For names with multiple parts (separated by whitespace, dot, underscore, or hyphen),
 * takes the first character of the first two parts.
 * 
 * For single word names, takes the first two characters.
 * 
 * @param user - User object with metadata and email
 * @returns Two-character uppercase string, or "U" if no valid initials can be generated
 * 
 * @example
 * generateUserInitials({ user_metadata: { full_name: "John Doe" }, email: "john@example.com" })
 * // returns "JD"
 * 
 * @example
 * generateUserInitials({ user_metadata: { full_name: "Madonna" }, email: "madonna@example.com" })
 * // returns "MA"
 * 
 * @example
 * generateUserInitials({ user_metadata: {}, email: "john.doe@example.com" })
 * // returns "JO"
 */
export function generateUserInitials(user: User): string {
  // Get name from user_metadata, prioritizing full_name over name
  const name = user.user_metadata.full_name ?? user.user_metadata.name ?? user.email;

  // Handle empty or whitespace-only strings
  if (!name || name.trim() === "") {
    return "U";
  }

  // Split name by whitespace, dot, underscore, or hyphen
  const parts = name.split(/[\s._-]+/);

  // Filter out empty parts
  const filteredParts = parts.filter(part => part.length > 0);

  // Handle empty result after filtering
  if (filteredParts.length === 0) {
    return "U";
  }

  // Generate initials
  if (filteredParts.length >= 2) {
    // Take first character from first two parts
    const firstInitial = filteredParts[0].charAt(0).toUpperCase();
    const secondInitial = filteredParts[1].charAt(0).toUpperCase();
    return firstInitial + secondInitial;
  } else {
    // Single word name - take first two characters
    const firstPart = filteredParts[0];
    const firstChar = firstPart.charAt(0).toUpperCase();
    const secondChar = firstPart.charAt(1)?.toUpperCase() ?? "";
    return firstChar + secondChar;
  }
}
