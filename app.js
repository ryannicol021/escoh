/*
  Eagle Scout Court of Honor Script Generator

  Everything happens in the user's browser.

  Required file in the repository root:

      template.docx

  The existing DOCX may contain these literal placeholders:

      ESC-FullName
      SM-Name
      ESC-Name
      SPL-Name
      Chp-Name
      Chp-Title
      MC-Name
      ES-Name
      EC-Name
      EC-Title
      A-Name
      B-Name
      [GrandparentSection]
      PJMO
      PJYR
      SVHR
      [Project]
      BNFCRY
      BTOWN
      [Minute]
      JOINYR
      EGLNUM

*/


const TEMPLATE_URL =
  "template.docx";


/*
  DOM elements
*/

const form =
  document.getElementById(
    "ceremony-form"
  );

const reviewSection =
  document.getElementById(
    "review-section"
  );

const reviewContent =
  document.getElementById(
    "review-content"
  );

const downloadSection =
  document.getElementById(
    "download-section"
  );

const generationError =
  document.getElementById(
    "generation-error"
  );

const generateButton =
  document.getElementById(
    "generate-button"
  );

const backButton =
  document.getElementById(
    "back-button"
  );

const downloadDocxButton =
  document.getElementById(
    "download-docx"
  );

const downloadPdfButton =
  document.getElementById(
    "download-pdf"
  );

const startOverButton =
  document.getElementById(
    "start-over"
  );

const pdfStatus =
  document.getElementById(
    "pdf-status"
  );

const eglnumInput =
  document.getElementById(
    "EGLNUM"
  );

const eglnumUnknown =
  document.getElementById(
    "EGLNUM-Unknown"
  );


/*
  Application state
*/

let currentData = null;

let currentDocxBlob = null;


/*
  Event handlers
*/

form.addEventListener(
  "submit",
  handleFormSubmit
);


backButton.addEventListener(
  "click",
  () => {

    reviewSection.classList.add(
      "hidden"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


generateButton.addEventListener(
  "click",
  handleGenerate
);


downloadDocxButton.addEventListener(
  "click",
  handleDocxDownload
);


downloadPdfButton.addEventListener(
  "click",
  handlePdfDownload
);


startOverButton.addEventListener(
  "click",
  handleStartOver
);


eglnumUnknown.addEventListener(
  "change",
  handleEagleNumberCheckbox
);


/*
  Eagle number checkbox
*/

function handleEagleNumberCheckbox() {

  eglnumInput.disabled =
    eglnumUnknown.checked;


  if (
    eglnumUnknown.checked
  ) {

    eglnumInput.value =
      "newest";

  } else {

    eglnumInput.value =
      "";

  }

}


/*
  Form submission
*/

function handleFormSubmit(
  event
) {

  event.preventDefault();


  if (
    !form.checkValidity()
  ) {

    form.reportValidity();

    return;

  }


  const rawData =
    readFormData();


  currentData =
    buildFieldData(
      rawData
    );


  renderReview(
    currentData
  );


  reviewSection.classList.remove(
    "hidden"
  );


  reviewSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/*
  Read form fields
*/

function readFormData() {

  const formData =
    new FormData(form);


  const data = {};


  for (
    const [key, value]
    of formData.entries()
  ) {

    data[key] =
      value;

  }


  data[
    "EGLNUM-Unknown"
  ] =
    eglnumUnknown.checked;


  return data;

}


/*
  Build final replacement values
*/

function buildFieldData(
  formData
) {

  const fullName =
    cleanWhitespace(
      formData["ESC-FullName"]
    );


  const nameParts =
    fullName.split(" ");


  const firstName =
    nameParts[0] || "";


  return {

    "ESC-FullName":
      fullName,

    "ESC-Name":
      firstName,

    "SM-Name":
      cleanWhitespace(
        formData["SM-Name"]
      ),

    "SPL-Name":
      cleanWhitespace(
        formData["SPL-Name"]
      ),

    "Chp-Name":
      cleanWhitespace(
        formData["Chp-Name"]
      ),

    "Chp-Title":
      cleanWhitespace(
        formData["Chp-Title"]
      ),

    "MC-Name":
      cleanWhitespace(
        formData["MC-Name"]
      ),

    "ES-Name":
      cleanWhitespace(
        formData["ES-Name"]
      ),

    "EC-Name":
      cleanWhitespace(
        formData["EC-Name"]
      ),

    "EC-Title":
      cleanWhitespace(
        formData["EC-Title"]
      ),

    "A-Name":
      cleanWhitespace(
        formData["A-Name"]
      ),

    "B-Name":
      cleanWhitespace(
        formData["B-Name"]
      ),

    "GP-Attendance":
      formData["GP-Attendance"] || "",

    "PJMO":
      cleanWhitespace(
        formData["PJMO"]
      ),

    "PJYR":
      cleanWhitespace(
        formData["PJYR"]
      ),

    "SVHR":
      cleanWhitespace(
        formData["SVHR"]
      ),

    "Project":
      normalizeProjectDescription(
        formData["Project"]
      ),

    "BNFCRY":
      cleanWhitespace(
        formData["BNFCRY"]
      ),

    "BTOWN":
      cleanWhitespace(
        formData["BTOWN"]
      ),

    "Minute":
      String(
        formData["Minute"] || ""
      ).trim(),

    "JOINYR":
      cleanWhitespace(
        formData["JOINYR"]
      ),

    "EGLNUM":
      formData["EGLNUM-Unknown"]
        ? "newest"
        : cleanWhitespace(
            formData["EGLNUM"]
          )

  };

}


/*
  Normalize ordinary text
*/

function cleanWhitespace(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
  Normalize the project description.

  The requested format is:

      lowercase beginning
      no punctuation at the end
*/

function normalizeProjectDescription(
  value
) {

  let result =
    cleanWhitespace(
      value
    );


  if (!result) {
    return result;
  }


  result =
    result.replace(
      /[.!?;:,]+$/,
      ""
    );


  result =
    result.charAt(0).toLowerCase() +
    result.slice(1);


  return result;

}


/*
  Review screen
*/

function renderReview(
  data
) {

  reviewContent.innerHTML =
    "";


  const entries = [

    [
      "Eagle Scout Candidate",
      data["ESC-FullName"]
    ],

    [
      "Scoutmaster",
      data["SM-Name"]
    ],

    [
      "Senior Patrol Leader",
      data["SPL-Name"]
    ],

    [
      "Chaplain",
      data["Chp-Name"]
    ],

    [
      "Chaplain's Title",
      data["Chp-Title"]
    ],

    [
      "Master of Ceremonies",
      data["MC-Name"]
    ],

    [
      "Eagle Pledge Reader",
      data["ES-Name"]
    ],

    [
      "Eagle Challenger",
      data["EC-Name"]
    ],

    [
      "Eagle Challenger's Title",
      data["EC-Title"]
    ],

    [
      "Mother",
      data["A-Name"]
    ],

    [
      "Father",
      data["B-Name"]
    ],

    [
      "Grandparent Attendance",
      getGrandparentAttendanceLabel(
        data["GP-Attendance"]
      )
    ],

    [
      "Project Completion",
      `${data["PJMO"]} ${data["PJYR"]}`
    ],

    [
      "Project Service Hours",
      data["SVHR"]
    ],

    [
      "Project",
      data["Project"]
    ],

    [
      "Beneficiary",
      data["BNFCRY"]
    ],

    [
      "Beneficiary Town",
      data["BTOWN"]
    ],

    [
      "Scoutmaster's Minute",
      data["Minute"]
    ],

    [
      "Year Joined Troop",
      data["JOINYR"]
    ],

    [
      "Eagle Number",
      data["EGLNUM"]
    ]

  ];


  const dl =
    document.createElement(
      "dl"
    );


  dl.className =
    "review-list";


  for (
    const [label, value]
    of entries
  ) {

    const dt =
      document.createElement(
        "dt"
      );


    dt.textContent =
      label;


    const dd =
      document.createElement(
        "dd"
      );


    dd.textContent =
      value;


    dl.append(
      dt,
      dd
    );

  }


  reviewContent.appendChild(
    dl
  );

}

function getGrandparentAttendanceLabel(
  value
) {

  switch (value) {

    case "none":
      return "No grandparents";

    case "grandfather":
      return "One grandparent (grandfather)";

    case "grandmother":
      return "One grandparent (grandmother)";

    case "multiple":
      return "Multiple grandparents";

    default:
      return "";

  }

}

/*
  Generate the DOCX
*/

async function handleGenerate() {

  if (!currentData) {
    return;
  }


  generationError.classList.add(
    "hidden"
  );


  generateButton.disabled =
    true;


  generateButton.textContent =
    "Generating...";


  try {

    const templateBuffer =
      await loadTemplate();


    const blob =
      await generateDocx(
        templateBuffer,
        currentData
      );


    currentDocxBlob =
      blob;


    downloadSection.classList.remove(
      "hidden"
    );


    reviewSection.classList.add(
      "hidden"
    );


    downloadSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error(
      error
    );


    showGenerationError(
      formatError(error)
    );

  } finally {

    generateButton.disabled =
      false;


    generateButton.textContent =
      "Generate Script";

  }

}


/*
  Load template.docx
*/

async function loadTemplate() {

  const response =
    await fetch(
      TEMPLATE_URL,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Could not load template.docx. ` +
      `GitHub Pages returned HTTP ${response.status}. ` +
      `Make sure the file is named exactly "template.docx" ` +
      `and is in the repository root.`
    );

  }


  return await response.arrayBuffer();

}


/*
  Generate DOCX.

  Your original document uses plaintext placeholders.

  We first convert:

      ESC-FullName

  into:

      {{ESC-FullName}}

  inside the DOCX XML.

  Then Docxtemplater performs the actual replacement.
*/

async function generateDocx(templateBuffer, data) {

  if (typeof PizZip === "undefined") {
    throw new Error(
      "PizZip did not load. Please refresh the page."
    );
  }

  let zip;

  try {
    zip = new PizZip(templateBuffer);
  } catch (error) {
    console.error("Could not open DOCX:", error);

    throw new Error(
      "The Word template could not be opened. " +
      "Make sure template.docx is a valid Word document."
    );
  }


  /*
   * These are the EXACT plaintext placeholders
   * in the Word template.
   *
   * The keys are what appears in Word.
   * The values are the keys used by the form data.
   */

  const replacements = {

    "ESC-FullName": "ESC-FullName",
    "SM-Name": "SM-Name",
    "ESC-Name": "ESC-Name",
    "SPL-Name": "SPL-Name",
    "Chp-Name": "Chp-Name",
    "Chp-Title": "Chp-Title",
    "MC-Name": "MC-Name",
    "ES-Name": "ES-Name",
    "EC-Name": "EC-Name",
    "EC-Title": "EC-Title",
    "A-Name": "A-Name",
    "B-Name": "B-Name",
    "[GrandparentSection]": "GrandparentSection",
    "PJMO": "PJMO",
    "PJYR": "PJYR",
    "SVHR": "SVHR",
    "[Project]": "Project",
    "BNFCRY": "BNFCRY",
    "BTOWN": "BTOWN",
    "[Minute]": "Minute",
    "JOINYR": "JOINYR",
    "EGLNUM": "EGLNUM"

  };

  /*
   * Build the grandparent section based on attendance.
   *
   * "none" is handled specially below because the entire
   * Word paragraph must be removed rather than merely
   * replacing its text with an empty string.
   */

  let grandparentSection = "";

  switch (
    data["GP-Attendance"]
  ) {

    case "grandfather":

      grandparentSection =
        `Your parents were not the only ones giving you that never-ending support, patience, and love. ` +
        `${data["ESC-Name"]}, please present your grandfather with his Eagle grandparent pin.`;

      break;


    case "grandmother":

      grandparentSection =
        `Your parents were not the only ones giving you that never-ending support, patience, and love. ` +
        `${data["ESC-Name"]}, please present your grandmother with her Eagle grandparent pin.`;

      break;


    case "multiple":

      grandparentSection =
        `Your parents were not the only ones giving you that never-ending support, patience, and love. ` +
        `${data["ESC-Name"]}, please present your grandparents with their Eagle grandparent pins.`;

      break;


    case "none":

      grandparentSection =
        "";

      break;

  }

  
  /*
   * XML-escape user-entered text.
   *
   * This is important because the replacement is
   * going directly into Word XML.
   */

  function escapeXml(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  }


  /*
   * These are the XML files that can contain visible
   * Word text.
   *
   * document.xml = main document
   * header*.xml = headers
   * footer*.xml = footers
   * footnotes.xml = footnotes
   * endnotes.xml = endnotes
   * comments*.xml = comments
   */

  const xmlFiles = Object.keys(zip.files).filter(
    path => {

      if (zip.files[path].dir) {
        return false;
      }

      return (
        path === "word/document.xml" ||
        /^word\/header\d+\.xml$/.test(path) ||
        /^word\/footer\d+\.xml$/.test(path) ||
        path === "word/footnotes.xml" ||
        path === "word/endnotes.xml" ||
        /^word\/comments\d+\.xml$/.test(path)
      );

    }
  );


  console.log(
    "DOCX XML files being processed:",
    xmlFiles
  );


  const found = new Set();


  /*
   * Word stores visible text in <w:t> elements.
   *
   * Example:
   *
   * <w:t>ESC-FullName</w:t>
   *
   * We're intentionally replacing only text inside
   * a <w:t> element.
   *
   * That means the surrounding Word formatting
   * (<w:rPr>, bold, italic, font, size, etc.)
   * remains untouched.
   */

    for (const path of xmlFiles) {

    let xml = zip.files[path].asText();


    /*
     * If no grandparents are attending, remove the entire
     * paragraph containing [GrandparentSection].
     *
     * This is preferable to replacing the placeholder with
     * an empty string because it also removes the paragraph
     * itself and therefore preserves normal paragraph spacing.
     */

    if (
      data["GP-Attendance"] === "none"
    ) {

      xml =
        xml.replace(
          /<w:p\b[^>]*>[\s\S]*?\[GrandparentSection\][\s\S]*?<\/w:p>/g,
          ""
        );

    }


    /*
     * Find each <w:t>...</w:t> text node.

     */

    xml = xml.replace(
      /(<w:t\b[^>]*>)([\s\S]*?)(<\/w:t>)/g,
      (fullMatch, openingTag, text, closingTag) => {

        let newText = text;


        for (
          const [placeholder, dataKey]
          of Object.entries(replacements)
        ) {

          if (
            newText.includes(placeholder)
          ) {

            const value =
  escapeXml(
    placeholder === "[GrandparentSection]"
      ? grandparentSection
      : data[dataKey] ?? ""
  );



            /*
             * Replace every occurrence of this
             * placeholder within this text run.
             */

            newText =
              newText.split(
                placeholder
              ).join(
                value
              );


            found.add(
              placeholder
            );


            console.log(
              `Replaced "${placeholder}" in ${path}`
            );

          }

        }


        return (
          openingTag +
          newText +
          closingTag
        );

      }
    );


    zip.file(
      path,
      xml
    );

  }


  /*
   * Report what we found.
   */

  const missing =
    Object.keys(replacements).filter(
      placeholder =>
        !found.has(placeholder)
    );


  console.log(
    "Template placeholders found:",
    [...found]
  );


  console.log(
    "Template placeholders not found:",
    missing
  );


  /*
   * We don't treat missing placeholders as an error.
   *
   * Some markers may intentionally be absent from a
   * particular part of the template, and this also
   * makes the application more tolerant of future
   * template changes.
   */


  /*
   * Create the finished DOCX.
   *
   * No Docxtemplater.
   * No template parsing.
   * Just the original DOCX with the text changed.
   */

  try {

    return zip.generate({
      type: "blob",

      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      compression:
        "DEFLATE"

    });

  } catch (error) {

    console.error(
      "Could not generate DOCX:",
      error
    );

    throw new Error(
      "The completed Word document could not be generated."
    );

  }

}

/*
  Download DOCX
*/

function handleDocxDownload() {

  if (
    !currentDocxBlob ||
    !currentData
  ) {

    return;

  }


  const filename =
    `${sanitizeFilename(
      currentData["ESC-FullName"]
    )} - Eagle Scout Court of Honor.docx`;


  downloadBlob(
    currentDocxBlob,
    filename
  );

}


/*
  PDF generation.

  This is a browser-based conversion:

      DOCX
       ↓
      docx-preview
       ↓
      HTML
       ↓
      html2pdf
       ↓
      PDF

  DOCX remains the primary/authoritative output.
*/

async function handlePdfDownload() {

  if (
    !currentDocxBlob ||
    !currentData
  ) {

    return;

  }


  if (
    typeof docx === "undefined" ||
    typeof docx.renderAsync !== "function"
  ) {

    showPdfStatus(
      "The document print preview could not be loaded. Please refresh the page and try again.",
      true
    );

    return;

  }


  downloadPdfButton.disabled =
    true;


  showPdfStatus(
    "Preparing the completed Word document for printing..."
  );


  const printWindow =
    window.open(
      "",
      "_blank"
    );


  if (!printWindow) {

    showPdfStatus(
      "The print window was blocked by your browser. " +
      "Please allow pop-ups for this site and try again.",
      true
    );

    downloadPdfButton.disabled =
      false;

    return;

  }


  /*
   * Create the print window immediately so the browser
   * does not block it while the DOCX is being rendered.
   */

  printWindow.document.open();

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<title>
${sanitizeFilename(
  currentData["ESC-FullName"]
)} - Eagle Scout Court of Honor
</title>

<style>

html,
body {
  margin: 0;
  padding: 0;
  background: #ffffff;
}

body {
  padding: 0;
}

#docx-container {
  width: 100%;
}

@media print {

  @page {
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
  }

}

</style>

</head>

<body>

<div id="docx-container"></div>

</body>
</html>
  `);

  printWindow.document.close();


  const renderArea =
    printWindow.document.getElementById(
      "docx-container"
    );


  try {

    await renderDocxForPrint(
      renderArea,
      printWindow
    );

  } catch (error) {

    console.error(
      "DOCX print rendering error:",
      error
    );


    try {
      printWindow.close();
    } catch (_) {
      // Ignore close errors.
    }


    showPdfStatus(
      "The completed Word document could not be prepared for printing.",
      true
    );


    downloadPdfButton.disabled =
      false;


    return;

  }


  showPdfStatus(
    "Print preview is ready. Choose Print or Save as PDF."
  );


  downloadPdfButton.disabled =
    false;

}


/*
  Render the actual completed DOCX into the print window.
*/

async function renderDocxForPrint(
  renderArea,
  printWindow
) {

  await docx.renderAsync(
    currentDocxBlob,
    renderArea,
    renderArea,
    {

      className:
        "pdf-docx",

      inWrapper:
        true,

      breakPages:
        true,

      ignoreWidth:
        false,

      ignoreHeight:
        false,

      ignoreFonts:
        false,

      hideWrapperOnPrint:
        false,

      renderHeaders:
        true,

      renderFooters:
        true,

      renderFootnotes:
        true,

      renderEndnotes:
        true

    }
  );


  /*
   * Give the browser a moment to finish laying out
   * the rendered Word document before printing.
   */

  await wait(300);


  /*
   * Print the actual rendered DOCX.
   */

  printWindow.focus();


  printWindow.print();


  /*
   * Close the temporary print window after printing.
   */

  printWindow.addEventListener(
    "afterprint",
    function() {

      setTimeout(
        function() {

          try {
            printWindow.close();
          } catch (_) {
            // Ignore close errors.
          }

        },
        100
      );

    }
  );

}


/*
  Show PDF status
*/

function showPdfStatus(
  message,
  isError = false
) {

  pdfStatus.textContent =
    message;


  pdfStatus.classList.remove(
    "hidden"
  );


  if (isError) {

    pdfStatus.style.background =
      "#fff0f0";

    pdfStatus.style.color =
      "#a53d3d";

  } else {

    pdfStatus.style.background =
      "#eaf3fa";

    pdfStatus.style.color =
      "#18324b";

  }

}


/*
  Start over
*/

function handleStartOver() {

  form.reset();


  eglnumInput.disabled =
    false;


  currentData =
    null;


  currentDocxBlob =
    null;


  reviewSection.classList.add(
    "hidden"
  );


  downloadSection.classList.add(
    "hidden"
  );


  generationError.classList.add(
    "hidden"
  );


  pdfStatus.classList.add(
    "hidden"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/*
  Display generation error
*/

function showGenerationError(
  message
) {

  generationError.textContent =
    message;


  generationError.classList.remove(
    "hidden"
  );


  generationError.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/*
  Error formatting
*/

function formatError(
  error
) {

  if (
    error &&
    error.message
  ) {

    return error.message;

  }


  return String(
    error ||
    "An unknown error occurred."
  );

}


/*
  Generic blob downloader
*/

function downloadBlob(
  blob,
  filename
) {

  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    1000
  );

}


/*
  Replace every occurrence of a literal string.
*/

function replaceAll(
  source,
  search,
  replacement
) {

  return source
    .split(search)
    .join(replacement);

}


/*
  Count occurrences of a string.
*/

function countOccurrences(
  source,
  search
) {

  if (!search) {
    return 0;
  }


  return (
    source.split(search).length - 1
  );

}


/*
  Filename cleanup
*/

function sanitizeFilename(
  name
) {

  return String(
    name
  )
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/*
  Small async delay
*/

function wait(
  milliseconds
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}


/*
  Debug information.

  Open the browser console and type:

      ESCoh

  to see whether the application loaded.
*/

window.ESCoh = {

  version:
    "1.0.0",

  template:
    TEMPLATE_URL

};
