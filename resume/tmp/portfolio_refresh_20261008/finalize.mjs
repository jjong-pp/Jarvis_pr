import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const SKILL='C:/Users/ParkJongHyeok/.codex/plugins/cache/openai-primary-runtime/presentations/26.915.20218/skills/presentations';
const D='C:/MyMain/main/resume/tmp/portfolio_refresh_20261008';
process.env.RUNTIME_NODE_MODULES='C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({
 workspaceDir:'C:/MyMain/main/resume',candidatePath:D+'/candidate.pptx',
 finalPath:'C:/MyMain/main/resume/PM용/기본틀_PM_포트폴리오_SCM대시보드.pptx',
 pythonExecutable:'C:/Users/ParkJongHyeok/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:SKILL+'/container_tools/inspect_presentation_package_integrity.py',
 layoutValidatorPath:SKILL+'/container_tools/inspect_presentation_layout_geometry.py',
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...[5,6,8,12,13,16,17,20,21].flatMap(n=>['--require-native-table-slide',String(n)])],
 explicitTotalSlideCount:24,
 requiredNativeTableOwnerSlides:[5,6,8,12,13,16,17,20,21],
 sourceTemplatePath:D+'/source.pptx',
 fontPolicy:{basis:'reference',families:['Noto Sans KR'],referencePath:D+'/source.pptx',referenceSha256:crypto.createHash('sha256').update(await fs.readFile(D+'/source.pptx')).digest('hex')},
 verifyArtifactToolImport:true,
 receiptPath:D+'/validation.json'
});
console.log(JSON.stringify(result));
