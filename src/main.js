import "styles.css";

import {
  buildFieldData,
} from "./fields.js";

import {
  generateDocx,
  downloadDocx,
} from "./docx.js";

import {
  generatePdf,
} from "./pdf.js";


const form =
  document.getElementById("ceremony-form");

const reviewSection =
  document.getElementById("review-section");

const reviewContent =
  document.getElementById("review-content");

const downloadSection =
  document.getElementById("download-section");

const generationError =
  document.getElementById("generation-error");

const generateButton =
  document.getElementById("generate-button");

const backButton =
  document.getElementById("back-button");

const downloadDocxButton =
  document.getElementById("download-docx");

const downloadPdfButton =
  document.getElementById("download-pdf");

const startOverButton =
  document.getElementById("start-over");

const pdfStatus =
  document.getElementById("pdf-status");

const eglnumInput =
  document.getElementById("EGLNUM");

const eglnumUnknown =
  document.getElementById("EGLNUM-Unknown");


let currentData = null;
let currentDocxBlob = null;


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
      behavior: "smooth",
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
  () => {
    eglnumInput.disabled =
      eglnumUnknown.checked;

    if (eglnumUnknown.checked) {
      eglnumInput.value = "";
    }
  }
);


function handleFormSubmit(event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const rawData =
    readFormData();

  currentData =
    buildFieldData(rawData);

  renderReview(
    currentData
  );

  reviewSection.classList.remove(
    "hidden"
  );

  reviewSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}


function readFormData() {
  const formData =
    new FormData(form);

  const data = {};

  for (
    const [key, value]
    of formData.entries()
  ) {
    data[key] = value;
  }

  data["EGLNUM-Unknown"] =
    eglnumUnknown.checked;

  return data;
}


function renderReview(data) {
  reviewContent.innerHTML = "";

  const entries = [
    [
      "Eagle Scout Candidate",
      data["ESC-FullName"],
    ],

    [
      "Scoutmaster",
      data["SM-Name"],
    ],

    [
      "Senior Patrol Leader",
      data["SPL-Name"],
    ],

    [
      "Chaplain",
      data["Chp-Name"],
    ],

    [
      "Chaplain's Title",
      data["Chp-Title"],
    ],

    [
      "Master of Ceremonies",
      data["MC-Name"],
    ],

    [
      "Eagle Pledge Reader",
      data["ES-Name"],
    ],

    [
      "Eagle Challenge Reader",
      data["EC-Name"],
    ],

    [
      "Mother",
      data["A-Name"],
    ],

    [
      "Father",
      data["B-Name"],
    ],

    [
      "Project Completion",
      `${data["PJMO"]} ${data["PJYR"]}`,
    ],

    [
      "Project Service Hours",
      data["SVHR"],
    ],

    [
      "Project",
      data["Project"],
    ],

    [
      "Beneficiary",
      data["BNFCRY"],
    ],

    [
      "Beneficiary Town",
      data["BTOWN"],
    ],

    [
      "Scoutmaster's Minute",
      data["Minute"],
    ],

    [
      "Year Joined Troop",
      data["JOINYR"],
    ],

    [
      "Eagle Number",
      data["EGLNUM"],
    ],
  ];

  const dl =
    document.createElement("dl");

  dl.className =
    "review-list";

  for (
    const [label, value]
    of entries
  ) {
    const dt =
      document.createElement("dt");

    dt.textContent =
      label;

    const dd =
      document.createElement("dd");

    dd.textContent =
      value;

    dl.append(
      dt,
      dd
    );
  }

  reviewContent.appendChild(dl);
}


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
    const result =
      await generateDocx(
        currentData
      );

    currentDocxBlob =
      result.blob;

    const importantMissing =
      result.missing.filter(
        (key) =>
          key !== "ESC-Name"
      );

    if (
      importantMissing.length > 0
    ) {
      console.warn(
        "Template placeholders not found:",
        importantMissing
      );
    }

    downloadSection.classList.remove(
      "hidden"
    );

    reviewSection.classList.add(
      "hidden"
    );

    downloadSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  } catch (error) {
    console.error(error);

    showGenerationError(
      error.message ||
      "Something went wrong while generating the document."
    );

  } finally {
    generateButton.disabled =
      false;

    generateButton.textContent =
      "Generate Script";
  }
}


function handleDocxDownload() {
  if (
    !currentDocxBlob ||
    !currentData
  ) {
    return;
  }

  downloadDocx(
    currentDocxBlob,
    currentData["ESC-FullName"]
  );
}


async function handlePdfDownload() {
  if (
    !currentDocxBlob ||
    !currentData
  ) {
    return;
  }

  downloadPdfButton.disabled =
    true;

  pdfStatus.classList.remove(
    "hidden"
  );

  pdfStatus.textContent =
    "Preparing the PDF. This may take a moment...";

  try {
    await generatePdf(
      currentDocxBlob,
      currentData["ESC-FullName"]
    );

    pdfStatus.textContent =
      "PDF downloaded successfully.";

  } catch (error) {
    console.error(error);

    pdfStatus.textContent =
      "The PDF could not be generated. The Word document is still available.";

  } finally {
    downloadPdfButton.disabled =
      false;
  }
}


function handleStartOver() {
  form.reset();

  eglnumInput.disabled =
    false;

  currentData = null;
  currentDocxBlob = null;

  reviewSection.classList.add(
    "hidden"
  );

  downloadSection.classList.add(
    "hidden"
  );

  pdfStatus.classList.add(
    "hidden"
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


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
    block: "center",
  });
}
