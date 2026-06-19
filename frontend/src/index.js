// ==========================================
// AgriSense AI - Central Export Hub
// ==========================================
// Import everything from this file using the @ alias
// Example: import { Card, Button, HomeContent } from "@/index"

// ==========================================
// UI Components
// ==========================================
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  ActionCard,
  Button,
  Badge,
  Section,
  SectionTitle,
  SectionContent,
} from "@/components/ui";

// ==========================================
// Common Components
// ==========================================
export { default as ThemeToggle } from "@/components/common/ThemeToggle";
export { default as Header } from "@/components/layout/Header";

// ==========================================
// Feature Components
// ==========================================
export { default as HomeContent } from "@/features/home/HomeContent";
export { default as DiseaseDetectionContent } from "@/features/disease-detection/DiseaseDetectionContent";
export { default as AssistantContent } from "@/features/assistant/AssistantContent";
export { default as LoginContent } from "@/features/auth/LoginContent";

// ==========================================
// Feature Sub-Components
// ==========================================
export { LoginForm } from "@/features/auth/components";

// ==========================================
// Custom Hooks
// ==========================================
export { useTheme, useImageUpload, useMessages } from "@/hooks";

// ==========================================
// Utilities
// ==========================================
export {
  formatPercentage,
  formatNumber,
  formatFileSize,
  isValidEmail,
  truncateText,
} from "@/utils/formatters";

export {
  fileToDataURL,
  isValidFileType,
  isValidFileSize,
  uploadFile,
} from "@/utils/fileHandlers";

// ==========================================
// Constants
// ==========================================
export {
  API_ENDPOINTS,
  ROUTES,
  SOIL_DATA,
  NUTRIENT_DATA,
  DASHBOARD_STATS,
  SOIL_MONITORING_DATA,
  SOIL_SENSOR_CARDS,
  FERTILIZER_RECOMMENDATIONS,
  DISEASE_DETECTION_RESULT,
  DISEASE_DETECTION_FEATURES,
} from "@/constants";
