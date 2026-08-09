export const FIELD_DEFINITIONS = [
  {
    key: "ESC-FullName",
    label: "Eagle Scout Candidate's full name",
  },
  {
    key: "SM-Name",
    label: "Scoutmaster's full name",
  },
  {
    key: "SPL-Name",
    label: "Senior Patrol Leader's full name",
  },
  {
    key: "Chp-Name",
    label: "Chaplain's full name",
  },
  {
    key: "Chp-Title",
    label: "Chaplain's title",
  },
  {
    key: "MC-Name",
    label: "Master of Ceremonies' full name",
  },
  {
    key: "ES-Name",
    label: "Eagle Pledge reader's full name",
  },
  {
    key: "EC-Name",
    label: "Eagle Challenge reader's full name",
  },
  {
    key: "A-Name",
    label: "Mother's first name",
  },
  {
    key: "B-Name",
    label: "Father's first name",
  },
  {
    key: "PJMO",
    label: "Eagle Project completion month",
  },
  {
    key: "PJYR",
    label: "Eagle Project completion year",
  },
  {
    key: "SVHR",
    label: "Eagle Project service hours",
  },
  {
    key: "Project",
    label: "Eagle Project description",
  },
  {
    key: "BNFCRY",
    label: "Eagle Project beneficiary",
  },
  {
    key: "BTOWN",
    label: "Beneficiary's town",
  },
  {
    key: "Minute",
    label: "Scoutmaster's Minute",
  },
  {
    key: "JOINYR",
    label: "Year joined the troop",
  },
  {
    key: "EGLNUM",
    label: "Eagle number in Troop 690 history",
  },
];

export function buildFieldData(formData) {
  const fullName = cleanWhitespace(formData["ESC-FullName"]);

  const nameParts = fullName.split(" ");

  const firstName = nameParts[0] || "";

  return {
    "ESC-FullName": fullName,

    "ESC-Name": firstName,

    "SM-Name": cleanWhitespace(formData["SM-Name"]),
    "SPL-Name": cleanWhitespace(formData["SPL-Name"]),

    "Chp-Name": cleanWhitespace(formData["Chp-Name"]),
    "Chp-Title": cleanWhitespace(formData["Chp-Title"]),

    "MC-Name": cleanWhitespace(formData["MC-Name"]),
    "ES-Name": cleanWhitespace(formData["ES-Name"]),
    "EC-Name": cleanWhitespace(formData["EC-Name"]),

    "A-Name": cleanWhitespace(formData["A-Name"]),
    "B-Name": cleanWhitespace(formData["B-Name"]),

    "PJMO": cleanWhitespace(formData["PJMO"]),
    "PJYR": cleanWhitespace(formData["PJYR"]),
    "SVHR": cleanWhitespace(formData["SVHR"]),

    "Project": normalizeProjectDescription(
      formData["Project"]
    ),

    "BNFCRY": cleanWhitespace(formData["BNFCRY"]),
    "BTOWN": cleanWhitespace(formData["BTOWN"]),

    "Minute": formData["Minute"].trim(),

    "JOINYR": cleanWhitespace(formData["JOINYR"]),

    "EGLNUM":
      formData["EGLNUM-Unknown"] === true
        ? "newest"
        : cleanWhitespace(formData["EGLNUM"]),
  };
}

function cleanWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProjectDescription(value) {
  let result = cleanWhitespace(value);

  if (!result) {
    return result;
  }

  // Remove punctuation from the end.
  result = result.replace(/[.!?;:,]+$/, "");

  // The field is intended to begin lowercase.
  result =
    result.charAt(0).toLowerCase() +
    result.slice(1);

  return result;
}
