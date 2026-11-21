const blankResume = {
  name: "",
  headline: "",
  location: "",
  contact: {
    phone: "",
    email: "",
    domain: "",
    linkedin: ""
  },
  availability: "",
  summary: "",
  expertise: [],
  showKit: [],
  experience: [
    {
      role: "",
      company: "",
      region: "",
      period: "",
      highlights: []
    }
  ],
  selectedShows: []
};

let resumeData = structuredClone(blankResume);
let fileHandle = null;

const form = document.querySelector("#editorForm");
const statusNode = document.querySelector("#status");
const fileInput = document.querySelector("#fileInput");
const showsList = document.querySelector("#showsList");
const showTemplate = document.querySelector("#showTemplate");

const setStatus = (message, isError = false) => {
  statusNode.textContent = message;
  statusNode.style.color = isError ? "#ffb0b0" : "";
};

const linesToArray = (value) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const arrayToLines = (items) => (items || []).join("\n");

const normalizeResume = (data) => ({
  ...structuredClone(blankResume),
  ...data,
  contact: {
    ...blankResume.contact,
    ...(data.contact || {})
  },
  expertise: Array.isArray(data.expertise) ? data.expertise : [],
  showKit: Array.isArray(data.showKit) ? data.showKit : [],
  experience: Array.isArray(data.experience) && data.experience.length ? data.experience : structuredClone(blankResume.experience),
  selectedShows: Array.isArray(data.selectedShows) ? data.selectedShows : []
});

const getPrimaryExperience = () => ({
  ...structuredClone(blankResume.experience[0]),
  ...(resumeData.experience?.[0] || {})
});

const fillForm = () => {
  const experience = getPrimaryExperience();
  form.elements.name.value = resumeData.name || "";
  form.elements.headline.value = resumeData.headline || "";
  form.elements.location.value = resumeData.location || "";
  form.elements.email.value = resumeData.contact?.email || "";
  form.elements.phone.value = resumeData.contact?.phone || "";
  form.elements.linkedin.value = resumeData.contact?.linkedin || "";
  form.elements.summary.value = resumeData.summary || "";
  form.elements.expertise.value = arrayToLines(resumeData.expertise);
  form.elements.showKit.value = arrayToLines(resumeData.showKit);
  form.elements.experienceRole.value = experience.role || "";
  form.elements.experienceCompany.value = experience.company || "";
  form.elements.experienceRegion.value = experience.region || "";
  form.elements.experiencePeriod.value = experience.period || "";
  form.elements.experienceHighlights.value = arrayToLines(experience.highlights);
  renderShows();
};

const readForm = () => {
  const domain = form.elements.email.value.split("@")[1] || resumeData.contact?.domain || "";
  resumeData = normalizeResume({
    ...resumeData,
    name: form.elements.name.value.trim(),
    headline: form.elements.headline.value.trim(),
    location: form.elements.location.value.trim(),
    contact: {
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      domain,
      linkedin: form.elements.linkedin.value.trim()
    },
    summary: form.elements.summary.value.trim(),
    expertise: linesToArray(form.elements.expertise.value),
    showKit: linesToArray(form.elements.showKit.value),
    experience: [
      {
        role: form.elements.experienceRole.value.trim(),
        company: form.elements.experienceCompany.value.trim(),
        region: form.elements.experienceRegion.value.trim(),
        period: form.elements.experiencePeriod.value.trim(),
        highlights: linesToArray(form.elements.experienceHighlights.value)
      }
    ],
    selectedShows: [...showsList.querySelectorAll(".show-editor")].map((node) => {
      const getValue = (key) => node.querySelector(`[data-key="${key}"]`).value.trim();
      return {
        name: getValue("name"),
        dates: getValue("dates"),
        venue: getValue("venue"),
        company: getValue("company"),
        role: getValue("role"),
        type: getValue("type")
      };
    })
  });
};

const createShowNode = (show, index) => {
  const node = showTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".show-index").textContent = `Show ${index + 1}`;
  ["name", "dates", "venue", "company", "role", "type"].forEach((key) => {
    const field = node.querySelector(`[data-key="${key}"]`);
    field.value = show[key] || "";
  });
  return node;
};

const renderShows = () => {
  showsList.innerHTML = "";
  resumeData.selectedShows.forEach((show, index) => {
    showsList.append(createShowNode(show, index));
  });
};

const openText = (text, label = "resume-data.json") => {
  try {
    resumeData = normalizeResume(JSON.parse(text));
    fillForm();
    setStatus(`Loaded ${label}.`);
  } catch (error) {
    setStatus(`Could not read JSON: ${error.message}`, true);
  }
};

const getJson = () => {
  readForm();
  return `${JSON.stringify(resumeData, null, 2)}\n`;
};

const saveWithHandle = async () => {
  const writable = await fileHandle.createWritable();
  await writable.write(getJson());
  await writable.close();
  setStatus("Saved resume-data.json.");
};

const downloadJson = () => {
  const blob = new Blob([getJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "resume-data.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded a new resume-data.json copy.");
};

document.querySelector("#openFile").addEventListener("click", async () => {
  if ("showOpenFilePicker" in window) {
    try {
      [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
        multiple: false
      });
      const file = await fileHandle.getFile();
      openText(await file.text(), file.name);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
      setStatus(`File picker failed: ${error.message}`, true);
    }
  }

  fileInput.click();
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  fileHandle = null;
  openText(await file.text(), file.name);
  fileInput.value = "";
});

document.querySelector("#saveFile").addEventListener("click", async () => {
  try {
    if (fileHandle?.createWritable) {
      await saveWithHandle();
      return;
    }
    downloadJson();
  } catch (error) {
    setStatus(`Save failed: ${error.message}`, true);
  }
});

document.querySelector("#downloadFile").addEventListener("click", downloadJson);

document.querySelector("#addShow").addEventListener("click", () => {
  readForm();
  resumeData.selectedShows.push({
    name: "",
    dates: "",
    venue: "",
    company: "",
    role: "",
    type: "Corporate"
  });
  renderShows();
  showsList.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
});

showsList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const card = button.closest(".show-editor");
  const index = [...showsList.children].indexOf(card);
  readForm();

  if (button.dataset.action === "delete") {
    resumeData.selectedShows.splice(index, 1);
  }

  if (button.dataset.action === "up" && index > 0) {
    [resumeData.selectedShows[index - 1], resumeData.selectedShows[index]] = [resumeData.selectedShows[index], resumeData.selectedShows[index - 1]];
  }

  if (button.dataset.action === "down" && index < resumeData.selectedShows.length - 1) {
    [resumeData.selectedShows[index + 1], resumeData.selectedShows[index]] = [resumeData.selectedShows[index], resumeData.selectedShows[index + 1]];
  }

  renderShows();
});

fillForm();
