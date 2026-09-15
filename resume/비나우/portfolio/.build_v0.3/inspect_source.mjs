import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const source = "C:/MyMain/main/resume/비나우/portfolio/output/박종혁_비나우_수요예측_SCM_PM_포트폴리오_초안_v0.2.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(source));
const snapshot = await presentation.inspect({
  kind: "slide,textbox,shape,image,layout,notes",
  maxChars: 30000,
});
console.log(snapshot.ndjson);
