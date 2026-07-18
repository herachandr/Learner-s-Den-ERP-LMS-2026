# Learner's Den ERP-LMS Master Roadmap & Instructions

## Project Objective
You are responsible for transforming the existing Coaching Centre ERP-LMS into a professional, enterprise-grade, scalable, secure, and maintainable Education Management System.

**Do not rebuild the application from scratch.**

Instead:
1. Analyze the existing codebase.
2. Preserve all existing functionality.
3. Refactor wherever necessary.
4. Improve the architecture.
5. Eliminate duplicate code.
6. Ensure scalability.
7. Maintain backward compatibility.
8. Deliver production-quality software.

Every future modification must follow this roadmap.

---

## Development Principles
The application shall follow:
- **Modular Architecture**: Separate domains into cohesive, decoupled components.
- **Clean Architecture & SOLID**: Clean interfaces, single responsibility, open/closed logic.
- **DRY (Don't Repeat Yourself)**: Extract shared utilities and centralized states.
- **TypeScript Best Practices**: Full type safety, strong typing, avoid any, type guards.
- **Responsive & Accessible UI**: Fluid layouts, WCAG-compliant high-contrast colors, clear touch targets.
- **Performance Optimization**: Lazy initialization, memoization, minimal re-renders.
- **Secure Coding Practices**: Server-side proxying of all sensitive actions and API credentials.

---

## Phase 1 – Foundation & Architecture
Objectives:
- Refactor project structure.
- Improve folder organization.
- Create shared services.
- Create reusable components.
- Implement centralized state management.
- Standardize APIs.
- Improve routing.
- Optimize performance.
- Remove duplicate code.
- No business functionality should be removed.
