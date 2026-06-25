# Implementation Plan: Mobile Logo Feature

## Overview

This implementation adds mobile-specific improvements to the Topbar component, including responsive logo display (SiteIcon on mobile, full logo on desktop), mobile navigation menu with icon-only items, new menu items (Haberler and Raporlar), unified user menu, and profile picture display with fallback to initials.

## Tasks

- [x] 1. Create ResponsiveLogo Component
  - Create new component file `src/components/layout/ResponsiveLogo.tsx`
  - Implement breakpoint detection using window.innerWidth and 768px threshold
  - Render SiteIcon for mobile screens (< 768px)
  - Render Logo (full variant) for desktop screens (>= 768px)
  - Support mobileSize and desktopSize props for customization
  - Add window resize event listener with debouncing
  - Include proper cleanup on unmount to prevent memory leaks
  - Add ARIA attributes for accessibility (role="img", aria-label="Company logo")
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2_

- [ ] 2. Create useIsMobile Hook
  - Create new hook file `src/hooks/useIsMobile.ts`
  - Implement responsive breakpoint detection (768px threshold)
  - Use matchMedia API for efficient breakpoint monitoring
  - Add debouncing to prevent excessive re-renders during resize
  - Implement proper cleanup on unmount
  - Return boolean value indicating mobile screen state
  - _Requirements: 1.1, 1.2, 1.4, 7.1, 7.2, 9.1, 9.2_

- [ ] 3. Update Topbar to Use ResponsiveLogo
  - Import ResponsiveLogo component into `src/components/layout/Topbar.tsx`
  - Replace current Logo usage with ResponsiveLogo
  - Configure appropriate size props for mobile and desktop
  - Ensure logo links to home page (/)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 4. Create MobileMenu Component
  - Create new component file `src/components/layout/MobileMenu.tsx`
  - Accept items prop (array of navigation menu items)
  - Implement icon-only rendering for mobile screens (< 768px)
  - Implement icon + text rendering for desktop screens (>= 768px)
  - Add proper navigation links for all menu items
  - Support onClick callback for item selection
  - Include accessibility attributes (role="navigation", proper labels)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 5. Create Navigation Menu Items Configuration
  - Create new file `src/lib/navigationItems.ts`
  - Define MenuItem interface with id, label, icon, path, showAsIconOnMobile properties
  - Create configuration for existing items (Endeksler, Sektörler, Şirketler)
  - Add new items (Haberler with Rss icon, Raporlar with FileText icon)
  - Configure showAsIconOnMobile=true for mobile optimization
  - Export constant array for use in MobileMenu component
  - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.5, 8.6_

- [ ] 6. Add Mobile Menu to Topbar
  - Import MobileMenu and navigation items into Topbar
  - Add MobileMenu to navigation section in Topbar
  - Configure responsive display (hidden on desktop, visible on mobile)
  - Connect navigation to router using navigate function
  - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.5, 8.6_

- [ ] 7. Create ProfileAvatar Component
  - Create new component file `src/components/layout/ProfileAvatar.tsx`
  - Display user's profile picture from avatar_url if available
  - Implement graceful fallback to initials if no picture
  - Handle image load errors and fallback to initials
  - Support size variants (sm, md, lg) with appropriate dimensions
  - Add lazy loading attribute for performance
  - Implement click handler for unified menu behavior
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Generate User Initials Helper
  - Create utility function `src/lib/initials.ts`
  - Extract first and last name from full_name or name fields
  - Fall back to email if no name information available
  - Generate two-character uppercase initials
  - Handle edge cases (single word names, empty strings)
  - Export function for use in ProfileAvatar component
  - _Requirements: 10.5_

- [ ] 9. Create UnifiedUserMenu Component
  - Create new component file `src/components/layout/UnifiedUserMenu.tsx`
  - Display ProfileAvatar component with user data
  - Implement dropdown menu with proper ARIA attributes
  - Add menu items (Profil, Tema options, Çıkış Yap)
  - Implement outside click detection and menu closing
  - Add keyboard navigation support (Arrow keys, Enter, Escape)
  - Implement focus management for accessibility
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Integrate Unified User Menu into Topbar
  - Import UnifiedUserMenu into Topbar component
  - Replace current avatar + kebab menu implementation
  - Remove separate kebab button for logged-in users
  - Configure avatar click to open dropdown
  - Connect all callback handlers (logout, theme change, navigation)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Update Anonymous User Menu in Topbar
  - Refactor anonymous user menu (kebab only) to use unified structure
  - Ensure consistent menu behavior between authenticated and anonymous states
  - Verify theme selection works for anonymous users
  - _Requirements: 11.5 (anonymous users should still show unified menu style)_

- [x] 12. Add Unit Tests for ResponsiveLogo
  - Test mobile screen rendering (SiteIcon displayed)
  - Test desktop screen rendering (Logo full displayed)
  - Test mobileSize prop takes precedence over size on mobile
  - Test desktopSize prop takes precedence over size on desktop
  - Test size prop fallback to default when other props not provided
  - Test breakpoint crossing without page refresh
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 13. Add Unit Tests for MobileMenu
  - Test mobile rendering shows icons only (no text)
  - Test desktop rendering shows icons with text labels
  - Test all menu items are rendered correctly
  - Test navigation links are properly configured
  - Test Haberler and Raporlar items are present
  - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 14. Add Unit Tests for ProfileAvatar
  - Test profile picture display when avatar_url is available
  - Test initials fallback when avatar_url is not available
  - Test initials fallback when image fails to load
  - Test initials generation from full_name, name, and email
  - Test size variants (sm, md, lg) render correctly
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 15. Add Unit Tests for UnifiedUserMenu
  - Test avatar click opens dropdown when closed
  - Test dropdown opens with all menu options
  - Test outside click closes dropdown
  - Test menu options navigate correctly (Profil, logout)
  - Test keyboard navigation works (Arrow keys, Enter, Escape)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 16. Add Unit Tests for Initials Utility
  - Test initials generation from full name (two words)
  - Test initials generation from name field
  - Test initials fallback to email if no name
  - Test edge cases (single word, empty strings)
  - _Requirements: 10.5_

- [ ] 17. Add Integration Tests for Topbar
  - Test responsive logo renders correctly in Topbar on mobile
  - Test responsive logo renders correctly in Topbar on desktop
  - Test mobile menu shows icon-only navigation on mobile
  - Test mobile menu shows full navigation on desktop
  - Test unified user menu works with avatar click on mobile
  - Test logo click navigates to home page
  - Test new menu items (Haberler, Raporlar) are clickable
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4_

- [ ] 18. Add Property-Based Tests for Responsive Behavior
  - Property: Mobile screens always show SiteIcon
  - Property: Desktop screens always show Logo full
  - Property: Size props are correctly applied based on screen size
  - Property: Aspect ratios are preserved for all logo variants
  - Property: Mobile menu items display as icons only on mobile
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.2, 3.3, 7.1, 7.2_

- [ ] 19. Add Property-Based Tests for User Menu
  - Property: Avatar click opens menu when closed
  - Property: Outside click closes open menu
  - Property: Menu items are accessible via keyboard navigation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 20. Performance Testing
  - Test resize handler performance with debouncing
  - Test memory usage during rapid resizing
  - Verify no memory leaks on component unmount
  - Test initial render performance (< 1ms)
  - Test menu open/close performance (< 100ms)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 21. Accessibility Audit
  - Verify all SVG elements have role="img" and aria-label
  - Verify avatar has role="button" and aria-expanded state
  - Verify dropdown menu has role="menu" and aria-labelledby
  - Test keyboard navigation (Arrow keys, Enter, Escape)
  - Test screen reader compatibility
  - _Requirements: 5.1, 5.2, 5.3, 9.5_

- [ ] 22. Responsive Breakpoint Verification
  - Test at 375px (mobile) - SiteIcon, icon-only navigation, unified menu
  - Test at 768px (breakpoint) - Verify correct layout
  - Test at 1024px (desktop) - Logo full, full navigation, unified menu
  - Test at 1440px (large desktop) - All features work correctly
  - Test dynamic resizing across breakpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 9.1, 9.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 23. Cross-Browser Testing
  - Test on Chrome (desktop and mobile)
  - Test on Firefox (desktop and mobile)
  - Test on Safari (desktop and mobile)
  - Test on Edge (desktop and mobile)
  - _Requirements: All functional requirements_

- [ ] 24. Error Handling Testing
  - Test profile picture load failure (fallback to initials)
  - Test missing user metadata (fallback to default initial)
  - Test invalid navigation item configuration (skip invalid items)
  - Test breakpoint detection failure (default to desktop)
  - _Requirements: All error scenarios from design document_

- [ ] 25. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify passes
  - Run all integration tests and verify passes
  - Run all property-based tests and verify passes
  - Address any test failures before proceeding

- [ ] 26. Final Checkpoint - Ensure all requirements met
  - Verify all acceptance criteria from requirements.md are met
  - Verify all functionality from design.md is implemented
  - Verify accessibility compliance
  - Verify performance targets are met
  - Verify cross-browser compatibility
  - Verify error handling is complete
  - _Requirements: All requirements from requirements.md_

## Task Dependency Graph

```
Phase 1: Foundation
1 (ResponsiveLogo) ───> 2 (useIsMobile)
      ^                      |
      |                      v
      +──────────────────── 7 (ProfileAvatar) ───> 8 (Initials Utility)

Phase 2: Navigation
2 (useIsMobile) ───> 4 (MobileMenu) ───> 5 (Navigation Items) ───> 6 (Mobile Menu in Topbar)
                                          |
                                          +────> 3 (ResponsiveLogo in Topbar)

Phase 3: User Menu
7 (ProfileAvatar) ───> 9 (UnifiedUserMenu) ───> 10 (Integrate into Topbar)
                                            |
                                            +────> 11 (Anonymous User Menu)

Phase 4: Testing
3 (ResponsiveLogo in Topbar) ───> 12 (ResponsiveLogo Tests) ───> 17 (Integration Tests)
4 (MobileMenu) ───> 13 (MobileMenu Tests) ───> 17 (Integration Tests)
7 (ProfileAvatar) ───> 14 (ProfileAvatar Tests) ───> 17 (Integration Tests)
9 (UnifiedUserMenu) ───> 15 (UnifiedUserMenu Tests) ───> 17 (Integration Tests)
8 (Initials Utility) ───> 16 (Initials Tests) ───> 14 (ProfileAvatar Tests)

Phase 5: Verification
17 (Integration Tests) ───> 18 (Property Tests) ───> 21 (Accessibility Audit) ───> 26 (Final Checkpoint)
19 (Property Tests) ───────────────────────────────────────────^
18, 19 ───> 20 (Performance Testing) ───> 21 (Accessibility Audit)
20, 21 ───> 22 (Breakpoint Verification) ───> 23 (Cross-Browser) ───> 26 (Final Checkpoint)
12, 13, 14, 15, 16 ───> 24 (Error Handling) ───> 25 (Checkpoint) ───> 26 (Final Checkpoint)
                                          |
                                          +────> 25 (Checkpoint)
```

## Summary

**Total Tasks**: 26 tasks
- **Core Implementation**: Tasks 1-11 (11 tasks)
- **Testing**: Tasks 12-16 (5 tasks)
- **Integration**: Tasks 17-24 (8 tasks)
- **Verification**: Tasks 25-26 (2 tasks)

**Key Dependencies**:
- ResponsiveLogo and useIsMobile are foundational for other components
- MobileMenu depends on ResponsiveLogo for breakpoint detection
- ProfileAvatar and UnifiedUserMenu depend on user data structures
- All components depend on Topbar integration for final implementation

**Testing Strategy**:
- Unit tests for each individual component
- Integration tests for Topbar as the main integration point
- Property-based tests for universal properties defined in design
- Performance and accessibility testing for quality assurance

**Breakpoints**:
- Checkpoint 1 (Task 25): After all testing is complete
- Checkpoint 2 (Task 26): Final verification of all requirements
