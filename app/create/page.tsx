import type { Metadata } from "next";
import CreateExperience from "@/components/create/CreateExperience";

export const metadata: Metadata = {
  title: "Create your Lovely — A little place for love",
  description:
    "Build a personalized interactive Valentine, save it, and share it with one short link.",
};

export default function CreatePage() {
  return <CreateExperience />;
}
