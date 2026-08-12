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
  - National dignitaries are correspondence.
  - National dignitaries with blank towns apply to everyone.
  - Local officials are invitations.
  - Local officials are filtered by the selected location.
  - Local officials are selected by default.
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

  const resultsSection =
    document.getElementById(
      "results-section"
    );

  const resultsContent =
    document.getElementById(
      "results-content"
    );

  const errorMessage =
    document.getElementById(
      "error-message"
    );

  const printButton =
    document.getElementById(
      "print-button"
    );

  const editButton =
    document.getElementById(
      "edit-button"
    );

  const startOverButton =
    document.getElementById(
      "start-over"
    );


  /*
  Make sure the expected HTML elements exist.
  */

  const missingElements = [];

  if (!form) {
    missingElements.push("dignitary-form");
  }

  if (!locationInput) {
    missingElements.push("location");
  }

  if (!localSection) {
    missingElements.push("local-section");
  }

  if (!localOfficialsContainer) {
    missingElements.push("local-officials");
  }

  if (!resultsSection) {
    missingElements.push("results-section");
  }

  if (!resultsContent) {
    missingElements.push("results-content");
  }

  if (!errorMessage) {
    missingElements.push("error-message");
  }

  if (!printButton) {
    missingElements.push("print-button");
  }

  if (!editButton) {
    missingElements.push("edit-button");
  }

  if (!startOverButton) {
    missingElements.push("start-over");
  }


  if (missingElements.length > 0) {

    console.error(
      "Missing HTML elements:",
      missingElements
    );

    return;

  }


  /*
  Load the CSV files.
  */

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


  /*
  Show what was actually loaded.
  */

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


  /*
  Location change.
  */

  locationInput.addEventListener(
    "change",
    () => {

      handleLocationChange(
        locationInput,
        localSection,
        localOfficialsContainer
      );

    }
  );


  /*
  Form submission.
  */

  form.addEventListener(
    "submit",
    event => {

      handleGenerate(
        event,
        form,
        locationInput,
        localOfficialsContainer,
        resultsSection,
        resultsContent,
        errorMessage
      );

    }
  );


  /*
  Print.
  */

  printButton.addEventListener(
    "click",
    () => {

      window.print();

    }
  );


  /*
  Edit.
  */

  editButton.addEventListener(
    "click",
    () => {

      resultsSection.classList.add(
        "hidden"
      );

      form.classList.remove(
        "hidden"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );


  /*
  Start over.
  */

  startOverButton.addEventListener(
    "click",
    () => {

      handleStartOver(
        form,
        localSection,
        localOfficialsContainer,
        resultsContent,
        resultsSection,
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


  /*
  Warn if files are unexpectedly empty.
  */

  if (baseDignitaries.length === 0) {

    console.warn(
      "base.csv loaded but contains no records."
    );

  }

  if (nationalCorrespondence.length === 0) {

    console.warn(
      "national.csv loaded but contains no records."
    );

  }

  if (localOfficials.length === 0) {

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

      /*
      Handle Windows CRLF.
      */

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


      /*
      Ignore completely blank rows.
      */

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


  /*
  No rows.
  */

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
  Convert each remaining row into an object.
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
  localOfficialsContainer
) {

  const location =
    locationInput.value.trim();


  if (!location) {

    localSection.classList.add(
      "hidden"
    );

    localOfficialsContainer.innerHTML =
      "";

    return;

  }


  renderLocalOfficials(
    location,
    localSection,
    localOfficialsContainer
  );

}


/* =========================================================
   Render local officials
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
        officialAppliesToLocation(
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
      Store the index in the original
      localOfficials array.
      */

      checkbox.dataset.localIndex =
        String(
          localOfficials.indexOf(
            official
          )
        );


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
   Local geographic filtering
   ========================================================= */

function officialAppliesToLocation(
  official,
  location
) {

  const towns =
    getOfficialTowns(
      official
    );


  /*
  A local official with no towns does NOT
  automatically apply everywhere.

  Local officials need an explicit town
  or ALL.
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
  IMPORTANT:

  For national.csv, a blank towns field
  means the official applies to EVERY
  location.
  */

  if (
    towns.length === 0
  ) {

    return true;

  }


  /*
  ALL also means every location.
  */

  if (
    towns.includes("ALL")
  ) {

    return true;

  }


  /*
  Otherwise the selected location must
  appear in the towns list.
  */

  return towns.includes(
    location.trim()
  );

}


/* =========================================================
   Get towns from an official
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
  Prevent JavaScript from accepting
  impossible dates such as February 31.
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
  Compare calendar dates at midnight.
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
    " — "
  );

}


/* =========================================================
   Generate results
   ========================================================= */

function handleGenerate(
  event,
  form,
  locationInput,
  localOfficialsContainer,
  resultsSection,
  resultsContent,
  errorMessage
) {

  event.preventDefault();


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

  Every current base dignitary is
  included as an invitation.
  */

  const invitations =
    baseDignitaries.filter(
      official =>
        isOfficialCurrent(
          official
        )
    );


  /*
  Add selected local officials.
  */

  const selectedLocalOfficials =
    getSelectedLocalOfficials(
      localOfficialsContainer
    );


  invitations.push(
    ...selectedLocalOfficials
  );


  /*
  National correspondence.

  Blank towns = everyone.
  ALL = everyone.
  Otherwise town must match.
  */

  const correspondence =
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


  /*
  Render.
  */

  renderResults(
    {
      location,
      invitations,
      correspondence
    },
    resultsContent
  );


  /*
  Switch from form to results.
  */

  form.classList.add(
    "hidden"
  );

  resultsSection.classList.remove(
    "hidden"
  );


  resultsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =========================================================
   Get selected local officials
   ========================================================= */

function getSelectedLocalOfficials(
  localOfficialsContainer
) {

  const checkboxes =
    localOfficialsContainer.querySelectorAll(
      'input[type="checkbox"]'
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
   Render final results
   ========================================================= */

function renderResults(
  data,
  resultsContent
) {

  resultsContent.innerHTML =
    "";


  /*
  Print-only heading.
  */

  const heading =
    document.createElement(
      "div"
    );

  heading.className =
    "print-header";


  const title =
    document.createElement(
      "h2"
    );

  title.textContent =
    "Eagle Scout Court of Honor";


  const subtitle =
    document.createElement(
      "h3"
    );

  subtitle.textContent =
    "Dignitary Invitations & Correspondence";


  heading.append(
    title,
    subtitle
  );


  /*
  Address.
  */

  if (
    data.location
  ) {

    const address =
      document.createElement(
        "p"
      );

    address.className =
      "print-address";


    const addressParts = [];

    if (
      data.location
    ) {

      addressParts.push(
        data.location
      );

    }


    address.textContent =
      addressParts.join(
        ", "
      );


    heading.appendChild(
      address
    );

  }


  resultsContent.appendChild(
    heading
  );


  /*
  Invitations.
  */

  resultsContent.appendChild(
    createResultsGroup(
      "Invitations",
      data.invitations
    )
  );


  /*
  Correspondence.
  */

  resultsContent.appendChild(
    createResultsGroup(
      "Correspondence",
      data.correspondence
    )
  );

}


/* =========================================================
   Create results group
   ========================================================= */

function createResultsGroup(
  title,
  officials
) {

  const section =
    document.createElement(
      "section"
    );

  section.className =
    "dignitary-group";


  const heading =
    document.createElement(
      "h3"
    );

  heading.textContent =
    title;


  section.appendChild(
    heading
  );


  if (
    officials.length === 0
  ) {

    const empty =
      document.createElement(
        "p"
      );

    empty.className =
      "help";

    empty.textContent =
      "None.";


    section.appendChild(
      empty
    );


    return section;

  }


  const list =
    document.createElement(
      "div"
    );

  list.className =
    "dignitary-list";


  officials.forEach(
    official => {

      list.appendChild(
        createOfficialResult(
          official
        )
      );

    }
  );


  section.appendChild(
    list
  );


  return section;

}


/* =========================================================
   Create one official result
   ========================================================= */

function createOfficialResult(
  official
) {

  const item =
    document.createElement(
      "div"
    );

  item.className =
    "dignitary-item";


  const organization =
    document.createElement(
      "div"
    );

  organization.className =
    "dignitary-organization";

  organization.textContent =
    official.organization || "";


  const title =
    document.createElement(
      "div"
    );

  title.className =
    "dignitary-title";

  title.textContent =
    official.title || "";


  const name =
    document.createElement(
      "div"
    );

  name.className =
    "dignitary-name";

  name.textContent =
    official.name || "";


  const contact =
    createContactElement(
      official.contact
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
   Start over
   ========================================================= */

function handleStartOver(
  form,
  localSection,
  localOfficialsContainer,
  resultsContent,
  resultsSection,
  errorMessage
) {

  form.reset();


  localSection.classList.add(
    "hidden"
  );


  localOfficialsContainer.innerHTML =
    "";


  resultsContent.innerHTML =
    "";


  resultsSection.classList.add(
    "hidden"
  );


  form.classList.remove(
    "hidden"
  );


  hideError(
    errorMessage
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

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
    "2.0.0",

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
