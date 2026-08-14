/*
Eagle Scout Court of Honor
Dignitary Invitation Generator

Everything happens in the user's browser.

Required files:

  data/base.csv
  data/national.csv
  data/local.csv

CSV structures:

base.csv

  organization,title,name,contact,term_end

national.csv

  organization,title,name,contact,term_end,towns

local.csv

  organization,title,name,contact,term_end,towns

Rules:

  - Base dignitaries are always invitations.
  - National dignitaries are correspondence requests.
  - National dignitaries with blank towns apply to everyone.
  - Local officials are invitation requests.
  - Local officials are filtered by the selected location.
  - National officials are filtered by the selected location.
  - Local and national officials are selected by default.
  - Expired officials are excluded.
  - A blank term_end means indefinite.
  - towns may contain multiple locations separated by semicolons.
  - towns may contain "ALL".
*/


/* =========================================================
   Data files
   ========================================================= */

const BASE_CSV_URL =
  "data/base.csv";

const NATIONAL_CSV_URL =
  "data/national.csv";

const LOCAL_CSV_URL =
  "data/local.csv";


/* =========================================================
   Application state
   ========================================================= */

let baseDignitaries = [];

let nationalCorrespondence = [];

let localOfficials = [];


/* =========================================================
   DOM initialization
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initialize
  );

} else {

  initialize();

}


async function initialize() {

  /*
  Get DOM elements after the page has loaded.
  */

  const form =
    document.getElementById(
      "dignitary-form"
    );

  const locationInput =
    document.getElementById(
      "location"
    );

  const localSection =
    document.getElementById(
      "local-section"
    );

  const localOfficialsContainer =
    document.getElementById(
      "local-officials"
    );

  const nationalSection =
    document.getElementById(
      "national-section"
    );

  const nationalOfficialsContainer =
    document.getElementById(
      "national-officials"
    );

  const errorMessage =
    document.getElementById(
      "error-message"
    );


  /* =======================================================
     Verify required HTML elements
     ======================================================= */

  const missingElements = [];


  if (!form) {
    missingElements.push(
      "dignitary-form"
    );
  }

  if (!locationInput) {
    missingElements.push(
      "location"
    );
  }

  if (!localSection) {
    missingElements.push(
      "local-section"
    );
  }

  if (!localOfficialsContainer) {
    missingElements.push(
      "local-officials"
    );
  }

  if (!nationalSection) {
    missingElements.push(
      "national-section"
    );
  }

  if (!nationalOfficialsContainer) {
    missingElements.push(
      "national-officials"
    );
  }

  if (!errorMessage) {
    missingElements.push(
      "error-message"
    );
  }


  if (
    missingElements.length > 0
  ) {

    console.error(
      "Missing HTML elements:",
      missingElements
    );

    return;

  }


  /* =======================================================
     Load CSV data
     ======================================================= */

  try {

    await loadDignitaryData();

  } catch (error) {

    console.error(
      "Could not load dignitary data:",
      error
    );

    showError(
      errorMessage,
      "The dignitary information could not be loaded. " +
      "Check that base.csv, national.csv, and local.csv " +
      "are present in the data folder."
    );

    return;

  }


  console.log(
    "Dignitary data loaded successfully."
  );

  console.log(
    "Base dignitaries:",
    baseDignitaries
  );

  console.log(
    "National correspondence:",
    nationalCorrespondence
  );

  console.log(
    "Local officials:",
    localOfficials
  );


  /* =======================================================
     Location change
     ======================================================= */

  locationInput.addEventListener(
    "change",
    () => {

      handleLocationChange(
        locationInput,
        localSection,
        localOfficialsContainer,
        nationalSection,
        nationalOfficialsContainer
      );

    }
  );


  /* =======================================================
     Form submission
     ======================================================= */

  form.addEventListener(
    "submit",
    async event => {

      await handleGenerate(
        event,
        form,
        locationInput,
        localOfficialsContainer,
        nationalOfficialsContainer,
        errorMessage
      );

    }
  );

}


/* =========================================================
   Load all CSV files
   ========================================================= */

async function loadDignitaryData() {

  const results =
    await Promise.all([
      fetchCsv(BASE_CSV_URL),
      fetchCsv(NATIONAL_CSV_URL),
      fetchCsv(LOCAL_CSV_URL)
    ]);


  baseDignitaries =
    parseCsv(
      results[0]
    );


  nationalCorrespondence =
    parseCsv(
      results[1]
    );


  localOfficials =
    parseCsv(
      results[2]
    );


  if (
    baseDignitaries.length === 0
  ) {

    console.warn(
      "base.csv loaded but contains no records."
    );

  }


  if (
    nationalCorrespondence.length === 0
  ) {

    console.warn(
      "national.csv loaded but contains no records."
    );

  }


  if (
    localOfficials.length === 0
  ) {

    console.warn(
      "local.csv loaded but contains no records."
    );

  }

}


/* =========================================================
   Fetch CSV
   ========================================================= */

async function fetchCsv(
  url
) {

  const response =
    await fetch(
      url,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Could not load ${url}. HTTP ${response.status}.`
    );

  }


  return await response.text();

}


/* =========================================================
   CSV parser
   ========================================================= */

function parseCsv(
  text
) {

  const rows = [];

  let row = [];

  let field = "";

  let insideQuotes = false;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const character =
      text[i];

    const nextCharacter =
      text[i + 1];


    /*
    Quoted field.
    */

    if (
      character === '"'
    ) {

      if (
        insideQuotes &&
        nextCharacter === '"'
      ) {

        field += '"';

        i++;

      } else {

        insideQuotes =
          !insideQuotes;

      }

      continue;

    }


    /*
    Comma ends a field.
    */

    if (
      character === "," &&
      !insideQuotes
    ) {

      row.push(
        field
      );

      field = "";

      continue;

    }


    /*
    Newline ends a row.
    */

    if (
      (
        character === "\n" ||
        character === "\r"
      ) &&
      !insideQuotes
    ) {

      if (
        character === "\r" &&
        nextCharacter === "\n"
      ) {

        i++;

      }


      row.push(
        field
      );

      field = "";


      if (
        row.some(
          value =>
            value.trim() !== ""
        )
      ) {

        rows.push(
          row
        );

      }


      row = [];

      continue;

    }


    field +=
      character;

  }


  /*
  Add final field/row.
  */

  if (
    field !== "" ||
    row.length > 0
  ) {

    row.push(
      field
    );

  }


  if (
    row.some(
      value =>
        value.trim() !== ""
    )
  ) {

    rows.push(
      row
    );

  }


  if (
    rows.length === 0
  ) {

    return [];

  }


  /*
  First row contains headers.
  */

  const headers =
    rows[0].map(
      header =>
        header
          .replace(
            /^\uFEFF/,
            ""
          )
          .trim()
    );


  /*
  Convert rows to objects.
  */

  return rows
    .slice(1)
    .map(
      values => {

        const record = {};


        headers.forEach(
          (
            header,
            index
          ) => {

            record[header] =
              String(
                values[index] ?? ""
              ).trim();

          }
        );


        return record;

      }
    );

}


/* =========================================================
   Location handling
   ========================================================= */

function handleLocationChange(
  locationInput,
  localSection,
  localOfficialsContainer,
  nationalSection,
  nationalOfficialsContainer
) {

  const location =
    locationInput.value.trim();


  /*
  No location selected.
  */

  if (!location) {

    localSection.classList.add(
      "hidden"
    );

    nationalSection.classList.add(
      "hidden"
    );

    localOfficialsContainer.innerHTML =
      "";

    nationalOfficialsContainer.innerHTML =
      "";

    return;

  }


  /*
  Render local invitation requests.
  */

  renderLocalOfficials(
    location,
    localSection,
    localOfficialsContainer
  );


  /*
  Render national correspondence requests.
  */

  renderNationalOfficials(
    location,
    nationalSection,
    nationalOfficialsContainer
  );

}


/* =========================================================
   Render local invitation requests
   ========================================================= */

function renderLocalOfficials(
  location,
  localSection,
  localOfficialsContainer
) {

  localOfficialsContainer.innerHTML =
    "";


  const applicableOfficials =
    localOfficials.filter(
      official =>
        isOfficialCurrent(
          official
        ) &&
        localOfficialAppliesToLocation(
          official,
          location
        )
    );


  if (
    applicableOfficials.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );

    message.className =
      "help";

    message.textContent =
      "No local officials are currently listed for this location.";


    localOfficialsContainer.appendChild(
      message
    );


    localSection.classList.remove(
      "hidden"
    );

    return;

  }


  applicableOfficials.forEach(
    official => {

      const label =
        createCheckbox(
          official,
          "local"
        );


      localOfficialsContainer.appendChild(
        label
      );

    }
  );


  localSection.classList.remove(
    "hidden"
  );

}


/* =========================================================
   Render national correspondence requests
   ========================================================= */

function renderNationalOfficials(
  location,
  nationalSection,
  nationalOfficialsContainer
) {

  nationalOfficialsContainer.innerHTML =
    "";


  const applicableOfficials =
    nationalCorrespondence.filter(
      official =>
        isOfficialCurrent(
          official
        ) &&
        correspondenceAppliesToLocation(
          official,
          location
        )
    );


  if (
    applicableOfficials.length === 0
  ) {

    const message =
      document.createElement(
        "p"
      );

    message.className =
      "help";

    message.textContent =
      "No correspondence officials are currently listed for this location.";


    nationalOfficialsContainer.appendChild(
      message
    );


    nationalSection.classList.remove(
      "hidden"
    );

    return;

  }


  applicableOfficials.forEach(
    official => {

      const label =
        createCheckbox(
          official,
          "national"
        );


      nationalOfficialsContainer.appendChild(
        label
      );

    }
  );


  nationalSection.classList.remove(
    "hidden"
  );

}


/* =========================================================
   Create checkbox
   ========================================================= */

function createCheckbox(
  official,
  type
) {

  const label =
    document.createElement(
      "label"
    );

  label.className =
    "checkbox-label";


  const checkbox =
    document.createElement(
      "input"
    );

  checkbox.type =
    "checkbox";

  checkbox.checked =
    true;


  /*
  Store the original array index so we
  can retrieve the official later.
  */

  if (
    type === "local"
  ) {

    checkbox.dataset.localIndex =
      String(
        localOfficials.indexOf(
          official
        )
      );

  } else {

    checkbox.dataset.nationalIndex =
      String(
        nationalCorrespondence.indexOf(
          official
        )
      );

  }


  const text =
    document.createElement(
      "span"
    );

  text.textContent =
    buildOfficialLabel(
      official
    );


  label.append(
    checkbox,
    text
  );


  return label;

}


/* =========================================================
   Local geographic filtering
   ========================================================= */

function localOfficialAppliesToLocation(
  official,
  location
) {

  const towns =
    getOfficialTowns(
      official
    );


  /*
  Local officials require an explicit
  town or ALL.
  */

  if (
    towns.length === 0
  ) {

    return false;

  }


  if (
    towns.includes("ALL")
  ) {

    return true;

  }


  return towns.includes(
    location.trim()
  );

}


/* =========================================================
   National geographic filtering
   ========================================================= */

function correspondenceAppliesToLocation(
  official,
  location
) {

  const towns =
    getOfficialTowns(
      official
    );


  /*
  Blank towns means EVERY location.
  */

  if (
    towns.length === 0
  ) {

    return true;

  }


  /*
  ALL means EVERY location.
  */

  if (
    towns.includes("ALL")
  ) {

    return true;

  }


  /*
  Otherwise the selected location
  must be in the towns list.
  */

  return towns.includes(
    location.trim()
  );

}


/* =========================================================
   Get towns
   ========================================================= */

function getOfficialTowns(
  official
) {

  return String(
    official.towns || ""
  )
    .split(";")
    .map(
      town =>
        town.trim()
    )
    .filter(
      Boolean
    );

}


/* =========================================================
   Determine whether official is current
   ========================================================= */

function isOfficialCurrent(
  official
) {

  const termEnd =
    String(
      official.term_end || ""
    ).trim();


  /*
  Blank term_end means indefinite.
  */

  if (!termEnd) {

    return true;

  }


  const parts =
    termEnd.split("-");


  if (
    parts.length !== 3
  ) {

    console.warn(
      "Invalid term_end:",
      termEnd,
      official
    );

    return false;

  }


  const year =
    Number(
      parts[0]
    );

  const month =
    Number(
      parts[1]
    );

  const day =
    Number(
      parts[2]
    );


  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {

    console.warn(
      "Invalid term_end:",
      termEnd,
      official
    );

    return false;

  }


  const expirationDate =
    new Date(
      year,
      month - 1,
      day
    );


  /*
  Reject impossible dates.
  */

  if (
    expirationDate.getFullYear() !== year ||
    expirationDate.getMonth() !== month - 1 ||
    expirationDate.getDate() !== day
  ) {

    console.warn(
      "Invalid term_end:",
      termEnd,
      official
    );

    return false;

  }


  /*
  The official remains current
  through the listed term-end date.
  */

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  return expirationDate >= today;

}


/* =========================================================
   Build readable official label
   ========================================================= */

function buildOfficialLabel(
  official
) {

  const parts = [];


  if (
    official.organization
  ) {

    parts.push(
      official.organization
    );

  }


  if (
    official.title
  ) {

    parts.push(
      official.title
    );

  }


  if (
    official.name
  ) {

    parts.push(
      official.name
    );

  }


  return parts.join(
    " "
  );

}


/* =========================================================
   Generate and export results
   ========================================================= */

async function handleGenerate(
  event,
  form,
  locationInput,
  localOfficialsContainer,
  nationalOfficialsContainer,
  errorMessage
) {

  /*
  VERY IMPORTANT:

  Prevent the browser from submitting the form
  and adding ?location= to the URL.
  */

  event.preventDefault();
  event.stopPropagation();


  /*
  Validate form.
  */

  if (
    !form.checkValidity()
  ) {

    form.reportValidity();

    return;

  }


  hideError(
    errorMessage
  );


  const location =
    locationInput.value.trim();


  /*
  Base dignitaries.

  These are ALWAYS invitations and do
  not have checkboxes.
  */

  const invitations =
    baseDignitaries.filter(
      official =>
        isOfficialCurrent(
          official
        )
    );


  /*
  Selected local invitation requests.
  */

  const invitationRequests =
    getSelectedLocalOfficials(
      localOfficialsContainer
    );


  /*
  Selected national correspondence requests.
  */

  const correspondenceRequests =
    getSelectedNationalOfficials(
      nationalOfficialsContainer
    );


  /*
  Find the submit button.
  */

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );


  const originalButtonText =
    submitButton
      ? submitButton.textContent
      : "";


  /*
  Prevent multiple PDF generations
  while the first one is running.
  */

  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.textContent =
      "Generating PDF...";

  }


  try {

    await exportDignitaryPdf(
      {
        location,
        invitations,
        invitationRequests,
        correspondenceRequests
      }
    );

  } catch (error) {

    console.error(
      "Could not generate dignitary PDF:",
      error
    );

    showError(
      errorMessage,
      "The dignitary PDF could not be generated. " +
      "Please try again."
    );

  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        originalButtonText ||
        "Export Dignitary List";

    }

  }

}


/* =========================================================
   Get selected local officials
   ========================================================= */

function getSelectedLocalOfficials(
  localOfficialsContainer
) {

  const checkboxes =
    localOfficialsContainer.querySelectorAll(
      'input[type="checkbox"][data-local-index]'
    );


  const selected = [];


  checkboxes.forEach(
    checkbox => {

      if (
        !checkbox.checked
      ) {

        return;

      }


      const index =
        Number(
          checkbox.dataset.localIndex
        );


      const official =
        localOfficials[index];


      if (
        official &&
        isOfficialCurrent(
          official
        )
      ) {

        selected.push(
          official
        );

      }

    }
  );


  return selected;

}


/* =========================================================
   Get selected national officials
   ========================================================= */

function getSelectedNationalOfficials(
  nationalOfficialsContainer
) {

  const checkboxes =
    nationalOfficialsContainer.querySelectorAll(
      'input[type="checkbox"][data-national-index]'
    );


  const selected = [];


  checkboxes.forEach(
    checkbox => {

      if (
        !checkbox.checked
      ) {

        return;

      }


      const index =
        Number(
          checkbox.dataset.nationalIndex
        );


      const official =
        nationalCorrespondence[index];


      if (
        official &&
        isOfficialCurrent(
          official
        )
      ) {

        selected.push(
          official
        );

      }

    }
  );


  return selected;

}


/* =========================================================
   PDF EXPORT
   ========================================================= */

async function exportDignitaryPdf(
  data
) {

  /*
  html2pdf.bundle includes html2canvas and jsPDF.
  */

  if (
    typeof html2pdf === "undefined"
  ) {

    throw new Error(
      "html2pdf.js is not loaded."
    );

  }


  /*
  Get the bundled libraries directly.

  Different versions expose jsPDF slightly
  differently, so support both common forms.
  */

  const html2canvasFunction =
    typeof html2canvas !== "undefined"
      ? html2canvas
      : null;


  const jsPDFConstructor =
    window.jspdf &&
    window.jspdf.jsPDF
      ? window.jspdf.jsPDF
      : (
          window.jsPDF
            ? window.jsPDF
            : null
        );


  if (
    !html2canvasFunction
  ) {

    throw new Error(
      "html2canvas is not available. " +
      "Make sure html2pdf.bundle.min.js is loaded."
    );

  }


  if (
    !jsPDFConstructor
  ) {

    throw new Error(
      "jsPDF is not available. " +
      "Make sure html2pdf.bundle.min.js is loaded."
    );

  }


  /*
  Create the temporary PDF document.
  */

  const pdfRoot =
    document.createElement(
      "div"
    );

  pdfRoot.className =
    "pdf-export-root";


  /*
  IMPORTANT:
  Keep the element inside the viewport.

  html2canvas can have problems rendering
  elements positioned far outside the viewport.
  */

  pdfRoot.style.position =
    "absolute";

  pdfRoot.style.left =
    "0";

  pdfRoot.style.top =
    "0";

  pdfRoot.style.width =
    "8.5in";

  pdfRoot.style.background =
    "#ffffff";

  pdfRoot.style.zIndex =
    "999999";

  pdfRoot.style.pointerEvents =
    "none";


  document.body.appendChild(
    pdfRoot
  );


  try {

    /*
    Three groups are deliberately created
    as separate PDF page sections.
    */

    const groups = [

      {
        title:
          "Universal Dignitary Invites",

        officials:
          data.invitations
      },

      {
        title:
          "Location-Specific Dignitary Invites",

        officials:
          data.invitationRequests
      },

      {
        title:
          "Correspondence Requests",

        officials:
          data.correspondenceRequests
      }

    ];


    /*
    Create first page.
    */

    let currentPage =
      createPdfPage(
        pdfRoot
      );


    createPdfDocumentHeader(
      currentPage,
      data.location
    );


    createPdfGroupHeading(
      currentPage,
      groups[0].title
    );


    await waitForPdfLayout();


    await addOfficialsToPdfPages(
      pdfRoot,
      currentPage,
      groups[0].officials
    );


    /*
    Create the remaining group pages.
    */

    for (
      let groupIndex = 1;
      groupIndex < groups.length;
      groupIndex++
    ) {

      const group =
        groups[groupIndex];


      currentPage =
        createPdfPage(
          pdfRoot
        );


      createPdfGroupHeading(
        currentPage,
        group.title
      );


      await waitForPdfLayout();


      await addOfficialsToPdfPages(
        pdfRoot,
        currentPage,
        group.officials
      );

    }


    await waitForPdfLayout();


    /*
    Get the pages we manually created.
    */

    const pages =
      Array.from(
        pdfRoot.querySelectorAll(
          ".pdf-page"
        )
      );


    if (
      pages.length === 0
    ) {

      throw new Error(
        "PDF export created zero pages."
      );

    }


    console.log(
      "PDF pages created:",
      pages.length
    );


    /*
    Create the actual PDF.
    */

    const pdf =
      new jsPDFConstructor(
        {
          unit:
            "in",

          format:
            "letter",

          orientation:
            "portrait",

          compress:
            true
        }
      );


    /*
    Render each already-created PDF page
    separately.
    */

    for (
      let pageIndex = 0;
      pageIndex < pages.length;
      pageIndex++
    ) {

      const page =
        pages[pageIndex];


      await waitForPdfLayout();


      const rect =
        page.getBoundingClientRect();


      console.log(
        `Rendering PDF page ${pageIndex + 1}:`,
        {
          width:
            rect.width,

          height:
            rect.height,

          scrollWidth:
            page.scrollWidth,

          scrollHeight:
            page.scrollHeight
        }
      );


      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {

        throw new Error(
          `PDF page ${pageIndex + 1} has zero dimensions.`
        );

      }


      const canvas =
        await html2canvasFunction(
          page,
          {
            scale:
              2,

            backgroundColor:
              "#ffffff",

            useCORS:
              true,

            logging:
              false,

            width:
              Math.ceil(
                rect.width
              ),

            height:
              Math.ceil(
                rect.height
              ),

            windowWidth:
              Math.max(
                document.documentElement.clientWidth,
                Math.ceil(
                  rect.width
                )
              ),

            windowHeight:
              Math.max(
                document.documentElement.clientHeight,
                Math.ceil(
                  rect.height
                )
              ),

            scrollX:
              0,

            scrollY:
              0
          }
        );


      console.log(
        `Canvas created for PDF page ${pageIndex + 1}:`,
        {
          width:
            canvas.width,

          height:
            canvas.height
        }
      );


      if (
        canvas.width <= 0 ||
        canvas.height <= 0
      ) {

        throw new Error(
          `PDF page ${pageIndex + 1} produced an empty canvas.`
        );

      }


      /*
      The jsPDF constructor automatically creates
      the first page.

      Add subsequent pages manually.
      */

      if (
        pageIndex > 0
      ) {

        pdf.addPage(
          "letter",
          "portrait"
        );

      }


      /*
      Put the rendered canvas onto the entire
      8.5 x 11 inch PDF page.
      */

      pdf.addImage(
        canvas,
        "JPEG",
        0,
        0,
        8.5,
        11,
        undefined,
        "FAST"
      );

    }


    console.log(
      "Saving PDF..."
    );


    pdf.save(
      buildPdfFilename(
        data.location
      )
    );


    console.log(
      "PDF saved successfully."
    );

  } finally {

    pdfRoot.remove();

  }

}


/* =========================================================
   Create PDF page
   ========================================================= */

function createPdfPage(
  pdfRoot
) {

  const page =
    document.createElement(
      "section"
    );

  page.className =
    "pdf-page";


  const content =
    document.createElement(
      "div"
    );

  content.className =
    "pdf-page-content";


  const columns =
    document.createElement(
      "div"
    );

  columns.className =
    "pdf-columns";


  const leftColumn =
    document.createElement(
      "div"
    );

  leftColumn.className =
    "pdf-column";


  const rightColumn =
    document.createElement(
      "div"
    );

  rightColumn.className =
    "pdf-column";


  columns.append(
    leftColumn,
    rightColumn
  );


  content.append(
    columns
  );


  page.append(
    content
  );


  pdfRoot.appendChild(
    page
  );


  return page;

}


/* =========================================================
   PDF document header
   ========================================================= */

function createPdfDocumentHeader(
  page,
  location
) {

  const header =
    document.createElement(
      "header"
    );

  header.className =
    "pdf-document-header";


  const title =
    document.createElement(
      "h1"
    );

  title.textContent =
    "Eagle Scout Court of Honor";


  const subtitle =
    document.createElement(
      "h2"
    );

  subtitle.textContent =
    "Dignitary Invitations & Correspondence";


  const locationElement =
    document.createElement(
      "p"
    );

  locationElement.className =
    "pdf-location";

  locationElement.textContent =
    location;


  header.append(
    title,
    subtitle,
    locationElement
  );


  const content =
    page.querySelector(
      ".pdf-page-content"
    );


  const columns =
    page.querySelector(
      ".pdf-columns"
    );


  content.insertBefore(
    header,
    columns
  );

}


/* =========================================================
   PDF group heading
   ========================================================= */

function createPdfGroupHeading(
  page,
  title
) {

  const heading =
    document.createElement(
      "h3"
    );

  heading.className =
    "pdf-group-heading";

  heading.textContent =
    title;


  const content =
    page.querySelector(
      ".pdf-page-content"
    );


  const columns =
    page.querySelector(
      ".pdf-columns"
    );


  content.insertBefore(
    heading,
    columns
  );

}


/* =========================================================
   Add officials to PDF pages
   ========================================================= */

async function addOfficialsToPdfPages(
  pdfRoot,
  startingPage,
  officials
) {

  /*
  No officials.
  */

  if (
    officials.length === 0
  ) {

    const empty =
      document.createElement(
        "p"
      );

    empty.className =
      "pdf-empty";

    empty.textContent =
      "None.";


    startingPage
      .querySelector(
        ".pdf-columns"
      )
      .appendChild(
        empty
      );

    return;

  }


  await waitForPdfLayout();


  let currentPage =
    startingPage;


  let leftColumn =
    currentPage.querySelector(
      ".pdf-column"
    );


  let rightColumn =
    currentPage.querySelectorAll(
      ".pdf-column"
    )[1];


  for (
    const official of officials
  ) {

    const item =
      createPdfOfficialElement(
        official
      );


    /*
    Measure the complete dignitary.
    */

    leftColumn.appendChild(
      item
    );


    await waitForPdfLayout();


    const itemHeight =
      item.getBoundingClientRect()
        .height;


    leftColumn.removeChild(
      item
    );


    /*
    Determine the current heights
    of both columns.
    */

    const leftHeight =
      leftColumn
        .getBoundingClientRect()
        .height;


    const rightHeight =
      rightColumn
        .getBoundingClientRect()
        .height;


    /*
    Use the shorter column first.
    */

    let targetColumn;

    if (
      leftHeight <= rightHeight
    ) {

      targetColumn =
        leftColumn;

    } else {

      targetColumn =
        rightColumn;

    }


    const columns =
      currentPage.querySelector(
        ".pdf-columns"
      );


    const availableHeight =
      columns
        .getBoundingClientRect()
        .height;


    const targetHeight =
      targetColumn
        .getBoundingClientRect()
        .height;


    const remainingHeight =
      availableHeight -
      targetHeight;


    /*
    If the complete dignitary does not
    fit in the preferred column, try
    the other column.
    */

    if (
      itemHeight > remainingHeight
    ) {

      const otherColumn =
        targetColumn === leftColumn
          ? rightColumn
          : leftColumn;


      const otherHeight =
        otherColumn
          .getBoundingClientRect()
          .height;


      const otherRemainingHeight =
        availableHeight -
        otherHeight;


      if (
        itemHeight <= otherRemainingHeight
      ) {

        targetColumn =
          otherColumn;

      } else {

        /*
        The entire dignitary does not fit
        in either column.

        Create a new page and put the
        complete dignitary at the top
        of the first column.
        */

        currentPage =
          createPdfPage(
            pdfRoot
          );


        leftColumn =
          currentPage.querySelector(
            ".pdf-column"
          );


        rightColumn =
          currentPage.querySelectorAll(
            ".pdf-column"
          )[1];


        targetColumn =
          leftColumn;

      }

    }


    /*
    Add the complete dignitary.
    */

    targetColumn.appendChild(
      item
    );


    await waitForPdfLayout();

  }

}


/* =========================================================
   Create PDF official
   ========================================================= */

function createPdfOfficialElement(
  official
) {

  const item =
    document.createElement(
      "article"
    );

  item.className =
    "pdf-official";


  const organization =
    document.createElement(
      "div"
    );

  organization.className =
    "pdf-official-organization";

  organization.textContent =
    official.organization || "";


  const title =
    document.createElement(
      "div"
    );

  title.className =
    "pdf-official-title";

  title.textContent =
    official.title || "";


  const name =
    document.createElement(
      "div"
    );

  name.className =
    "pdf-official-name";

  name.textContent =
    official.name || "";


  const contact =
    createContactElement(
      official.contact
    );


  contact.classList.add(
    "pdf-official-contact"
  );


  item.append(
    organization,
    title,
    name,
    contact
  );


  return item;

}


/* =========================================================
   Wait for PDF layout
   ========================================================= */

function waitForPdfLayout() {

  return new Promise(
    resolve => {

      requestAnimationFrame(
        () => {

          requestAnimationFrame(
            resolve
          );

        }
      );

    }
  );

}


/* =========================================================
   PDF filename
   ========================================================= */

function buildPdfFilename(
  location
) {

  const safeLocation =
    String(
      location || "Location"
    )
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );


  return (
    `Eagle-Scout-Dignitary-List-${safeLocation}.pdf`
  );

}


/* =========================================================
   Create contact element
   ========================================================= */

function createContactElement(
  value
) {

  const contact =
    document.createElement(
      "div"
    );

  contact.className =
    "dignitary-contact";


  const cleanValue =
    String(
      value || ""
    ).trim();


  if (!cleanValue) {

    return contact;

  }


  /*
  Email address.
  */

  if (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      cleanValue
    )
  ) {

    const link =
      document.createElement(
        "a"
      );

    link.href =
      `mailto:${cleanValue}`;

    link.textContent =
      cleanValue;


    contact.appendChild(
      link
    );


    return contact;

  }


  /*
  Website/contact form.
  */

  if (
    /^https?:\/\//i.test(
      cleanValue
    )
  ) {

    const link =
      document.createElement(
        "a"
      );

    link.href =
      cleanValue;

    link.textContent =
      "Contact Form";

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";


    contact.appendChild(
      link
    );


    return contact;

  }


  /*
  Plain text.
  */

  contact.textContent =
    cleanValue;


  return contact;

}


/* =========================================================
   Error handling
   ========================================================= */

function showError(
  errorMessage,
  message
) {

  errorMessage.textContent =
    message;

  errorMessage.classList.remove(
    "hidden"
  );

}


function hideError(
  errorMessage
) {

  errorMessage.textContent =
    "";

  errorMessage.classList.add(
    "hidden"
  );

}


/* =========================================================
   Debug information
   =========================================================

   Open the browser console and type:

     EagleDignitary

   ========================================================= */

window.EagleDignitary = {

  version:
    "4.0.0",

  files: {

    base:
      BASE_CSV_URL,

    national:
      NATIONAL_CSV_URL,

    local:
      LOCAL_CSV_URL

  },

  getData: function () {

    return {

      base:
        baseDignitaries,

      national:
        nationalCorrespondence,

      local:
        localOfficials

    };

  }

};
