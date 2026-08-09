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
      A-Name
      B-Name
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

    "A-Name":
      cleanWhitespace(
        formData["A-Name"]
      ),

    "B-Name":
      cleanWhitespace(
        formData["B-Name"]
      ),

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
      "Eagle Challenge Reader",
      data["EC-Name"]
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
      generateDocx(
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

function generateDocx(templateBuffer, data) {

  if (typeof PizZip === "undefined") {
    throw new Error(
      "PizZip did not load. Please refresh the page and try again."
    );
  }

  if (typeof window.docxtemplater === "undefined") {
    throw new Error(
      "Docxtemplater did not load. Please refresh the page and try again."
    );
  }


  let zip;

  try {

    zip = new PizZip(templateBuffer);

  } catch (error) {

    console.error(error);

    throw new Error(
      "The template.docx file could not be opened."
    );

  }


  /*
   * Plain-text placeholders in the Word document.
   *
   * These are intentionally the EXACT strings that
   * appear in the Word document.
   */

  const placeholders = [
    "ESC-FullName",
    "SM-Name",
    "ESC-Name",
    "SPL-Name",
    "Chp-Name",
    "Chp-Title",
    "MC-Name",
    "ES-Name",
    "EC-Name",
    "A-Name",
    "B-Name",
    "PJMO",
    "PJYR",
    "SVHR",
    "[Project]",
    "BNFCRY",
    "BTOWN",
    "[Minute]",
    "JOINYR",
    "EGLNUM"
  ];


  /*
   * Map the two bracketed placeholders to the names
   * used by the form data.
   */

  const tagNames = {

    "[Project]": "Project",
    "[Minute]": "Minute"

  };


  /*
   * Get every XML file inside the DOCX.
   *
   * This includes:
   *
   * word/document.xml
   * word/header1.xml
   * word/header2.xml
   * word/footer1.xml
   * etc.
   */

  const xmlFiles = Object.keys(zip.files).filter(
    path =>
      path.endsWith(".xml") &&
      !zip.files[path].dir
  );


  const found = [];


  /*
   * Convert the plaintext placeholders into
   * Docxtemplater tags.
   *
   * IMPORTANT:
   *
   * We work from the ORIGINAL XML for each file
   * and build the replacement in one pass.
   *
   * This prevents one replacement from being
   * accidentally processed again.
   */

  for (const path of xmlFiles) {

    const originalXml =
      zip.files[path].asText();


    let xml =
      originalXml;


    for (const placeholder of placeholders) {

      const tagName =
        tagNames[placeholder] ||
        placeholder;


      const tag =
        `{${tagName}}`;


      /*
       * Only replace the literal plaintext
       * placeholder.
       *
       * Do NOT search for the tag after
       * creating it.
       */

      if (
        originalXml.includes(
          placeholder
        )
      ) {

        /*
         * Escape the placeholder for use in
         * a regular expression.
         */

        const escaped =
          placeholder.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );


        const regex =
          new RegExp(
            escaped,
            "g"
          );


        xml =
          xml.replace(
            regex,
            tag
          );


        found.push({
          placeholder,
          file: path
        });

      }

    }


    /*
     * DEBUG CHECK
     *
     * If the resulting XML contains malformed
     * quadruple braces, stop immediately rather
     * than handing it to Docxtemplater.
     */

    if (
      xml.includes("{{{{")
    ) {

      console.error(
        "Malformed template generated in:",
        path
      );

      console.error(
        xml
      );

      throw new Error(
        "The template conversion produced malformed " +
        "Docxtemplater tags in " +
        path +
        ". See the browser console for details."
      );

    }


    zip.file(
      path,
      xml
    );

  }


  console.log(
    "Template placeholders found:",
    found
  );


  /*
   * Warn about placeholders that weren't found.
   */

  const foundNames =
    new Set(
      found.map(
        item =>
          item.placeholder
      )
    );


  const missing =
    placeholders.filter(
      placeholder =>
        !foundNames.has(
          placeholder
        )
    );


  console.log(
    "Template placeholders not found:",
    missing
  );


  /*
   * Give the finished ZIP to Docxtemplater.
   */

  let doc;

  try {

    doc =
      new window.docxtemplater(
        zip,
        {
          paragraphLoop: true,
          linebreaks: true
        }
      );


    doc.render(
      data
    );

  } catch (error) {

    console.error(
      "Docxtemplater error:",
      error
    );


    let details = "";


    if (
      error &&
      error.properties
    ) {

      if (
        error.properties.id
      ) {

        details +=
          ` Error ID: ${error.properties.id}.`;

      }


      if (
        error.properties.explanation
      ) {

        details +=
          ` ${error.properties.explanation}`;

      }

    }


    throw new Error(
      "The Word template could not be filled." +
      details +
      " See the browser console for details."
    );

  }


  /*
   * Generate the finished DOCX.
   */

  return doc
    .getZip()
    .generate({
      type: "blob",

      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      compression:
        "DEFLATE"
    });

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
    typeof docx.renderAsync !==
    "function"
  ) {

    showPdfStatus(
      "The DOCX preview library did not load. " +
      "Please refresh the page and try again.",
      true
    );

    return;

  }


  if (
    typeof html2pdf !==
    "function"
  ) {

    showPdfStatus(
      "The PDF library did not load. " +
      "Please refresh the page and try again.",
      true
    );

    return;

  }


  downloadPdfButton.disabled =
    true;


  showPdfStatus(
    "Preparing the PDF..."
  );


  const renderArea =
    document.createElement(
      "div"
    );


  renderArea.className =
    "pdf-render-area";


  document.body.appendChild(
    renderArea
  );


  try {

    await docx.renderAsync(
      currentDocxBlob,
      renderArea,
      null,
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
          false
      }
    );


    /*
      Give the browser a moment to finish
      laying out the rendered document.
    */

    await wait(
      500
    );


    const filename =
      `${sanitizeFilename(
        currentData["ESC-FullName"]
      )} - Eagle Scout Court of Honor.pdf`;


    await html2pdf()
      .set({

        margin:
          0,

        filename,

        image: {
          type:
            "jpeg",

          quality:
            0.98
        },

        html2canvas: {

          scale:
            2,

          useCORS:
            true,

          backgroundColor:
            "#ffffff"
        },

        jsPDF: {

          unit:
            "in",

          format:
            "letter",

          orientation:
            "portrait"
        },

        pagebreak: {

          mode: [
            "css",
            "legacy",
            "avoid-all"
          ]

        }

      })
      .from(
        renderArea
      )
      .save();


    showPdfStatus(
      "PDF downloaded successfully."
    );


  } catch (error) {

    console.error(
      "PDF generation error:",
      error
    );


    showPdfStatus(
      "The PDF could not be generated. " +
      "The Word document is still available.",
      true
    );


  } finally {

    renderArea.remove();

    downloadPdfButton.disabled =
      false;

  }

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
