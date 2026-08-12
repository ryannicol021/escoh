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
local.csv

  organization,title,name,contact,term_end,towns

Rules:

  - Base dignitaries are always invitations.
  - National dignitaries are always correspondence.
  - Local officials are invitations.
  - Local officials are filtered by the selected location.
  - Local officials are selected by default.
  - Expired officials are excluded.
  - A blank term_end means indefinite.
  - towns may contain multiple locations separated by semicolons.
  - towns may contain "ALL".
*/


/*
Data files
*/

const BASE_CSV_URL =
  "data/base.csv";

const NATIONAL_CSV_URL =
  "data/national.csv";

const LOCAL_CSV_URL =
  "data/local.csv";


/*
DOM elements
*/

const form =
  document.getElementById(
    "dignitary-form"
  );

const locationInput =
  document.getElementById(
    "location"
  );

const streetAddressInput =
  document.getElementById(
    "street-address"
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
Application state
*/

let baseDignitaries = [];

let nationalCorrespondence = [];

let localOfficials = [];


/*
Initialization
*/

document.addEventListener(
  "DOMContentLoaded",
  initialize
);


async function initialize() {

  try {

    await loadDignitaryData();

  } catch (error) {

    console.error(
      "Could not load dignitary data:",
      error
    );

    showError(
      "The dignitary information could not be loaded. " +
      "Make sure the three CSV files are present in the " +
      "data folder."
    );

    return;
  }

}


/*
Load all CSV files
*/

async function loadDignitaryData() {

  const [
    baseCsv,
    nationalCsv,
    localCsv
  ] = await Promise.all([

    fetchCsv(
      BASE_CSV_URL
    ),

    fetchCsv(
      NATIONAL_CSV_URL
    ),

    fetchCsv(
      LOCAL_CSV_URL
    )

  ]);


  baseDignitaries =
    parseCsv(
      baseCsv
    );


  nationalCorrespondence =
    parseCsv(
      nationalCsv
    );


  localOfficials =
    parseCsv(
      localCsv
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

}


/*
Fetch a CSV file
*/

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
      `Could not load ${url}. ` +
      `HTTP ${response.status}.`
    );

  }


  return await response.text();

}


/*
Simple CSV parser.

Supports:

  - comma-separated fields
  - quoted fields
  - commas inside quoted fields
  - escaped quotes
  - Windows or Unix line endings
*/

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
  Add final field / row.
  */

  row.push(
    field
  );


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
                values[index] ??
                ""
              ).trim();

          }
        );


        return record;

      }
    );

}


/*
Location change
*/

locationInput.addEventListener(
  "change",
  handleLocationChange
);


function handleLocationChange() {

  const location =
    locationInput.value;


  if (!location) {

    localSection.classList.add(
      "hidden"
    );

    localOfficialsContainer.innerHTML =
      "";

    return;

  }


  renderLocalOfficials(
    location
  );

}


/*
Render applicable local officials
*/

function renderLocalOfficials(
  location
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
    (
      official,
      index
    ) => {

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


/*
Determine whether an official applies
to the selected location.
*/

function officialAppliesToLocation(
  official,
  location
) {

  const towns =
    String(
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


  if (
    function correspondenceAppliesToLocation(
  official,
  location
) {

  const towns =
    String(
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


  /*
  Blank towns means the official
  applies to every location.
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


  return towns.includes(
    location
  );

}
  ) {

    return false;

  }


  if (
    towns.includes(
      "ALL"
    )
  ) {

    return true;

  }


  return towns.includes(
    location
  );

}


/*
Determine whether an official is current.
*/

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


  /*
  Parse the date as a local calendar date
  rather than as a UTC timestamp.
  */

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

    /*
    An invalid nonblank date is treated as
    expired rather than indefinite.
    */

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


  const expirationDate =
    new Date(
      year,
      month - 1,
      day
    );


  /*
  The person remains active through the
  listed term-end date.
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


/*
Build a readable official label.
*/

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


/*
Generate results
*/

form.addEventListener(
  "submit",
  handleGenerate
);


function handleGenerate(
  event
) {

  event.preventDefault();


  if (
    !form.checkValidity()
  ) {

    form.reportValidity();

    return;

  }


  hideError();


  const location =
    locationInput.value;


  const streetAddress =
    streetAddressInput.value.trim();


  /*
  Base dignitaries.
  */

  const invitations =
    baseDignitaries.filter(
      isOfficialCurrent
    );


  /*
  Selected local officials.
  */

  const selectedLocalOfficials =
    getSelectedLocalOfficials();


  invitations.push(
    ...selectedLocalOfficials
  );


  /*
  National correspondence.
  */

const correspondence =
  nationalCorrespondence.filter(
    official =>
      isOfficialCurrent(official) &&
      correspondenceAppliesToLocation(
        official,
        location
      )
  );


  renderResults({
    streetAddress,
    location,
    invitations,
    correspondence
  });


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


/*
Get the local officials currently
checked by the user.
*/

function getSelectedLocalOfficials() {

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


/*
Render the final list.
*/

function renderResults(
  data
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


  if (
    data.streetAddress ||
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
      data.streetAddress
    ) {

      addressParts.push(
        data.streetAddress
      );

    }


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
  Invitation section.
  */

  resultsContent.appendChild(
    createResultsGroup(
      "Invitations",
      data.invitations
    )
  );


  /*
  Correspondence section.
  */

  resultsContent.appendChild(
    createResultsGroup(
      "Correspondence",
      data.correspondence
    )
  );

}


/*
Create an invitation/correspondence group.
*/

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


/*
Create one official's displayed result.
*/

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


/*
Create the contact display/link.

Rules:

  email address:
    display the email
    link to mailto:email

  http/https:
    display "Contact Form"
    link directly to the URL

  anything else:
    display as plain text
*/

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


  if (
    !cleanValue
  ) {

    return contact;

  }


  /*
  Email
  */

  if (
    cleanValue.includes("@")
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
  Website / contact form
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
  Everything else is plain text.
  */

  contact.textContent =
    cleanValue;


  return contact;

}


/*
Print button
*/

printButton.addEventListener(
  "click",
  handlePrint
);


function handlePrint() {

  window.print();

}


/*
Edit button
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
Start over
*/

startOverButton.addEventListener(
  "click",
  handleStartOver
);


function handleStartOver() {

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


  hideError();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/*
Error handling
*/

function showError(
  message
) {

  errorMessage.textContent =
    message;

  errorMessage.classList.remove(
    "hidden"
  );

}


function hideError() {

  errorMessage.textContent =
    "";

  errorMessage.classList.add(
    "hidden"
  );

}


/*
Debug information.

Open the browser console and type:

  EagleDignitary

*/

window.EagleDignitary = {

  version:
    "1.0.0",

  files: {

    base:
      BASE_CSV_URL,

    national:
      NATIONAL_CSV_URL,

    local:
      LOCAL_CSV_URL

  }

};
