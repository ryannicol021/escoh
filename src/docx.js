import JSZip from "jszip";
import { saveAs } from "file-saver";

const TEMPLATE_URL =
  `${import.meta.env.BASE_URL}template/eagle-court-of-honor.docx`;

export async function loadTemplate() {
  const response = await fetch(TEMPLATE_URL);

  if (!response.ok) {
    throw new Error(
      `Unable to load the DOCX template. HTTP ${response.status}`
    );
  }

  return await response.arrayBuffer();
}

export async function generateDocx(data) {
  const templateBuffer = await loadTemplate();

  return generateDocxFromBuffer(
    templateBuffer,
    data
  );
}

export async function generateDocxFromBuffer(
  templateBuffer,
  data
) {
  const zip = await JSZip.loadAsync(templateBuffer);

  const replacements = {
    ...data,
  };

  const xmlFiles = Object.keys(zip.files).filter(
    (path) =>
      path.endsWith(".xml") &&
      !zip.files[path].dir
  );

  const replacementCounts = {};

  for (const path of xmlFiles) {
    const file = zip.files[path];

    let xml = await file.async("string");

    for (const [placeholder, value] of Object.entries(
      replacements
    )) {
      const countBefore = countOccurrences(
        xml,
        placeholder
      );

      if (countBefore > 0) {
        xml = replaceAllLiteral(
          xml,
          placeholder,
          escapeXml(String(value ?? ""))
        );

        replacementCounts[placeholder] =
          (replacementCounts[placeholder] || 0) +
          countBefore;
      }
    }

    zip.file(path, xml);
  }

  const missing = Object.keys(replacements).filter(
    (key) => !replacementCounts[key]
  );

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  return {
    blob,
    replacementCounts,
    missing,
  };
}

export async function downloadDocx(
  blob,
  candidateName
) {
  const filename =
    `${sanitizeFilename(candidateName)} ` +
    `- Eagle Scout Court of Honor.docx`;

  saveAs(blob, filename);
}

function replaceAllLiteral(
  source,
  search,
  replacement
) {
  return source.split(search).join(replacement);
}

function countOccurrences(
  source,
  search
) {
  if (!search) {
    return 0;
  }

  return source.split(search).length - 1;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeFilename(name) {
  return String(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
