export * from "./resumeForm";
import dynamic from "next/dynamic";

export const Download = dynamic(() => import("./Download"), {
  ssr: false,
});
export { default as EditResume } from "./EditResume";
export { default as MoreOption } from "./MoreOption";
export { default as PreviewModal } from "./PreviewModal";
export { default as ResumePreview } from "./ResumePreview";
export { default as ResumeTitle } from "./ResumeTitle";
export { default as ThemeColor } from "./ThemeColor";
export { default as TopSection } from "./TopSection";
