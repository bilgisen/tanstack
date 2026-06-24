# Requirements Document

## Introduction

This feature adds mobile-specific improvements to the Topbar component including: a simplified "J" icon logo on mobile devices, navigation items displayed as icons only on mobile, new menu items (Haberler and Raporlar), unified user menu behavior, and profile picture display in avatars. The solution uses responsive styling based on the standard md breakpoint (768px) to provide optimal user experiences across all device types.

## Glossary

- **Mobile Logo**: The simplified icon-only variant of the company logo showing only the "J" character, displayed on screens smaller than 768px
- **Full Logo**: The complete company logo including the full text "Hissepro", displayed on screens 768px and larger
- **Breakpoint**: The screen width threshold (768px) that determines which logo variant is displayed
- **ResponsiveLogo**: A new component that automatically renders the appropriate logo variant based on screen size
- **SiteIcon**: The existing component that renders the icon-only HisseproIcon SVG
- **Logo Component**: The existing component that can render either the full or icon variant of the company logo
- **Mobile Menu**: A navigation menu optimized for small screens, displaying items as icons or compact representations
- **Unified User Menu**: A single clickable avatar component that opens a dropdown menu instead of separate avatar and kebab button elements
- **Profile Picture**: A user-uploaded image used for avatar display, with fallback to initials if not available
- **Desktop Layout**: The full-featured layout with text labels and expanded navigation displayed on screens 768px and larger
- **Mobile Layout**: The compact layout with icon-only navigation and unified menu interactions displayed on screens smaller than 768px

## Requirements

### Requirement 1: Mobile Logo Display

**User Story:** As a mobile user, I want to see a compact logo in the topbar, so that I can see the app branding without taking up valuable screen space.

#### Acceptance Criteria

1. WHEN the screen width is less than 768 pixels THEN the system SHALL display only the icon variant of the logo (J character)
2. WHEN the screen width is 768 pixels or greater THEN the system SHALL display the full logo variant
3. WHILE the screen width crosses the 768 pixel threshold, the system SHALL switch between logo variants without requiring page refresh
4. IF the window resize event occurs, THEN the system SHALL update the displayed logo variant within 100 milliseconds

### Requirement 2: Responsive Logo Component Implementation

**User Story:** As a developer, I want the logo component to be responsive and reusable, so that I can maintain consistent branding across the application.

#### Acceptance Criteria

1. WHEN a mobile user visits any page in the application THEN the system SHALL display the icon-only logo
2. WHEN a desktop user visits any page in the application THEN the system SHALL display the full logo
3. WHEN the ResponsiveLogo component is used in the Topbar THEN the system SHALL replace the current Logo implementation
4. WHERE a custom mobile size is specified, the system SHALL use that size instead of the default mobile size
5. WHERE a custom desktop size is specified, the system SHALL use that size instead of the default desktop size

### Requirement 3: Logo Aspect Ratio and Sizing

**User Story:** As a maintainer, I want the logo component to preserve aspect ratios and sizing consistency, so that branding appears professional and scaled correctly.

#### Acceptance Criteria

1. FOR ANY logo variant, WHEN rendered with a specific size, THEN the system SHALL maintain the original aspect ratio of that variant
2. FOR ANY mobile device, WHEN the SiteIcon is rendered, THEN the system SHALL use appropriate sizing (default 14px or custom mobileSize)
3. FOR ANY non-mobile device, WHEN the Logo full variant is rendered, THEN the system SHALL use appropriate sizing (default 24px or custom desktopSize)
4. WHEN the mobileSize prop is provided, THEN the system SHALL prioritize mobileSize over the generic size prop for mobile rendering
5. WHEN the desktopSize prop is provided, THEN the system SHALL prioritize desktopSize over the generic size prop for desktop rendering

### Requirement 4: Resize Event Handling

**User Story:** As a performance-conscious developer, I want the responsive logo component to handle window resize events efficiently, so that the application remains responsive during user interactions.

#### Acceptance Criteria

1. WHILE a window resize operation is in progress, THEN the system SHALL debounce resize events to prevent excessive re-renders
2. IF a resize event occurs on a mobile device, THEN the system SHALL only update the logo when the breakpoint threshold is crossed
3. WHEN the ResponsiveLogo component unmounts, THEN the system SHALL remove all resize event listeners to prevent memory leaks
4. WHEN the ResponsiveLogo component mounts, THEN the system SHALL initialize with the correct logo variant based on current window width

### Requirement 5: Accessibility Compliance

**User Story:** As an accessibility advocate, I want the logo component to be properly labeled for screen readers, so that all users are aware of the branding.

#### Acceptance Criteria

1. WHEN either logo variant is rendered, THEN the system SHALL include role="img" attribute
2. WHEN either logo variant is rendered, THEN the system SHALL include aria-label="Company logo" attribute
3. WHERE an SVG title element exists, THEN the system SHALL provide descriptive text for screen readers

### Requirement 6: Component Integration

**User Story:** As a developer, I want to integrate the responsive logo into the Topbar component, so that the mobile-specific logo appears in the navigation bar.

#### Acceptance Criteria

1. WHEN the Topbar component renders on a mobile device, THEN the system SHALL display the icon-only logo
2. WHEN the Topbar component renders on a desktop device, THEN the system SHALL display the full logo
3. WHEN a user clicks the logo in the Topbar, THEN the system SHALL navigate to the home page (/)
4. WHILE the Topbar is visible, THEN the system SHALL update the logo variant when the screen crosses the 768px breakpoint

### Requirement 7: Mobile Menu Items Display

**User Story:** As a mobile user, I want to see navigation items as icons only, so that I can navigate the application efficiently on small screens without taking up excessive horizontal space.

#### Acceptance Criteria

1. WHEN the screen width is less than 768 pixels, THEN the system SHALL display navigation items (Endeksler, Sektörler, Şirketler) as icons only in the mobile menu
2. WHEN the screen width is 768 pixels or greater, THEN the system SHALL display navigation items with both icons and text labels
3. FOR ALL mobile navigation items, WHEN rendered as icons, THEN the system SHALL maintain consistent sizing and spacing
4. WHERE a user taps a mobile navigation icon, THEN the system SHALL navigate to the corresponding page

### Requirement 8: New Mobile Menu Items

**User Story:** As a mobile user, I want access to additional content sections (Haberler and Raporlar) in the mobile menu, so that I can access all application features from the mobile interface.

#### Acceptance Criteria

1. WHEN the mobile menu is opened, THEN the system SHALL include "Haberler" menu item with RSS icon
2. WHEN the mobile menu is opened, THEN the system SHALL include "Raporlar" menu item with Document icon
3. WHEN "Haberler" is selected, THEN the system SHALL navigate to the news/haberler page
4. WHEN "Raporlar" is selected, THEN the system SHALL navigate to the reports/raporlar page
5. WHERE the screen width is less than 768 pixels, THEN the system SHALL display these new items in the mobile navigation
6. WHERE the screen width is 768 pixels or greater, THEN the system SHALL show these items in the desktop navigation with appropriate layout

### Requirement 9: Unified User Menu

**User Story:** As a user, I want a simplified user menu interaction, so that I can access my profile options with a single tap/click.

#### Acceptance Criteria

1. WHEN a user clicks on their avatar, THEN the system SHALL open the user dropdown menu
2. WHEN the user menu is open, THEN the system SHALL display all profile options (Profil, Tema settings, Çıkış Yap)
3. WHILE the user menu dropdown is open, THEN the system SHALL keep the avatar in its clicked state for visual feedback
4. WHEN a user clicks outside the dropdown area, THEN the system SHALL close the user menu dropdown
5. FOR ALL user menu interactions, THEN the system SHALL maintain accessibility standards (keyboard navigation, screen reader support)

### Requirement 10: Avatar Display with Profile Picture

**User Story:** As a user, I want to see my actual profile picture in the avatar, so that I can easily identify my account.

#### Acceptance Criteria

1. WHEN a user has an uploaded profile picture, THEN the system SHALL display that image in the avatar component
2. WHEN a user does not have an uploaded profile picture, THEN the system SHALL display user initials as fallback
3. FOR ANY avatar display, WHEN rendered, THEN the system SHALL use appropriate image loading attributes for performance
4. IF the profile picture fails to load, THEN the system SHALL gracefully fall back to displaying initials
5. WHEN the avatar displays initials, THEN the system SHALL use the user's full name or email to generate initials following the existing logic

### Requirement 11: Responsive Breakpoint Configuration

**User Story:** As a developer, I want a standard responsive breakpoint configuration, so that the mobile and desktop layouts are consistent with common design practices.

#### Acceptance Criteria

1. WHEN the screen width is below 768 pixels, THEN the system SHALL use the mobile layout variant for all responsive components
2. WHEN the screen width is 768 pixels or greater, THEN the system SHALL use the desktop layout variant for all responsive components
3. FOR THE Logo component, WHEN the breakpoint is crossed, THEN the system SHALL switch between icon-only and full logo variants
4. FOR THE Navigation component, WHEN the breakpoint is crossed, THEN the system SHALL show/hide text labels appropriately
5. FOR THE User Menu component, WHEN the breakpoint is crossed, THEN the system SHALL switch between unified avatar click and separate avatar+kebab layout