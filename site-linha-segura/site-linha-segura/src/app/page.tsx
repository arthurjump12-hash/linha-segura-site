import { Hero } from "@/components/Hero";
import {
  AboutSection,
  AcademyTeaser,
  AISection,
  ContactSection,
  DifferentialsSection,
  FAQSection,
  FinderSection,
  ProcessSection,
  ProjectSection,
  SegmentsSection,
  SolutionsSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <SolutionsSection />
      <FinderSection />
      <AISection />
      <AcademyTeaser />
      <ProjectSection />
      <ProcessSection />
      <SegmentsSection />
      <DifferentialsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
