import html2pdf from "html2pdf.js";
import { renderAsync } from "docx-preview";

export async function generatePdf(
  docxBlob,
  candidateName
) {
  const container =
    document.createElement("div");

  container.className = "pdf-document";

  container.style.position = "fixed";
  container.style.left = "-100000px";
  container.style.top = "0";
  container.style.width = "8.5in";
  container.style.background = "white";

  document.body.appendChild(container);

  try {
    await renderAsync(
      docxBlob,
      container,
      null,
      {
        className: "pdf-docx",
        inWrapper: true,
        breakPages: true,
        ignoreWidth: false,
        ignoreHeight: false,
        experimental: false,
      }
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    const filename =
      `${sanitizeFilename(candidateName)} ` +
      `- Eagle Scout Court of Honor.pdf`;

    await html2pdf()
      .set({
        margin: 0,
        filename,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
        pagebreak: {
          mode: [
            "css",
            "legacy",
            "avoid-all",
          ],
        },
      })
      .from(container)
      .save();

  } finally {
    container.remove();
  }
}

function sanitizeFilename(name) {
  return String(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
