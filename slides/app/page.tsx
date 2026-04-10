import { slides } from "@/data/slides";
import { SlideViewer } from "@/components/SlideViewer";

export default function Home() {
  return <SlideViewer slides={slides} />;
}
