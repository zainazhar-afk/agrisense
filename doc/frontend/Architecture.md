# Frontend Architecture

## Stack
- Next.js app router
- React
- Styled components and Tailwind utilities

## High-level structure
- src/app: route pages for each feature
- src/components: shared UI and layout components
- src/features: feature modules that contain page-level content
- src/hooks: reusable hooks (theme, chat, upload)
- src/utils: API wrappers and helpers
- src/constants: API endpoints and static data

## Data flow
1. Pages in src/app render feature content components.
2. Feature components call helpers in src/utils and src/hooks.
3. API calls target the backend services using environment variables.
4. Responses update local state and render UI components.

## Key folders
- src/app/assistant
- src/app/disease-detection
- src/app/soil-monitor
- src/app/social
- src/components/ui
- src/features/assistant
- src/features/disease-detection
- src/features/soil-monitoring
