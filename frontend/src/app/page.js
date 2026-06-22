import  HomeContent  from "@/features/home/HomeContent";

export const metadata = {
  title: "AgriSense | Digital tools for Pakistani farmers",
  description:
    "Crop diagnostics, multilingual guidance, and community context for Pakistani farmers.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
