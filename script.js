const form = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");
const postSubmitActions = document.getElementById("postSubmitActions");
const rsvpTitle = document.querySelector(".panel-rsvp .section-title");
const rsvpNote = document.querySelector(".panel-rsvp .rsvp-note");
const yesSection = document.getElementById("yesSection");
const messageSection = document.getElementById("messageSection");
const messageField = form.querySelector('textarea[name="message"]');
const partnerNameSection = document.getElementById("partnerNameSection");
const kidsCountSection = document.getElementById("kidsCountSection");
const submitButton = form.querySelector('button[type="submit"]');
const webhookMeta = document.querySelector('meta[name="rsvp-webhook-url"]');
const rsvpWebhookUrl = webhookMeta ? webhookMeta.content.trim() : "";

const messagePlaceholders = {
  yes: "Dacă aveți preferințe alimentare sau alte rugăminți, vă rugăm să ni le spuneți aici.",
  no: "Dacă doriți, ne puteți lăsa aici un gând frumos sau o urare."
};

// Handle choice buttons (attending, plus one, kids)
const choiceButtons = document.querySelectorAll(".btn-choice");
choiceButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const choice = btn.dataset.choice;
    const forField = btn.dataset.for;
    const fieldName = forField || "attending";
    const inputField = form.querySelector(`input[name="${fieldName}"]`);

    // Find all buttons in the same group
    let parentContainer = btn.parentElement;
    while (parentContainer && !parentContainer.classList.contains("button-group")) {
      parentContainer = parentContainer.parentElement;
    }
    
    if (parentContainer) {
      const groupButtons = parentContainer.querySelectorAll(".btn-choice");
      groupButtons.forEach((b) => b.classList.remove("active"));
    }
    
    // Add active state to clicked button
    btn.classList.add("active");
    
    // Set hidden input value
    inputField.value = choice;
    
    // Handle conditional sections
    if (!forField) {
      // Main attending choice
      if (choice === "yes") {
        yesSection.classList.remove("hidden");
        messageSection.classList.remove("hidden");
        messageField.placeholder = messagePlaceholders.yes;
      } else {
        yesSection.classList.add("hidden");
        messageSection.classList.remove("hidden");
        messageField.placeholder = messagePlaceholders.no;
        partnerNameSection.classList.add("hidden");
        kidsCountSection.classList.add("hidden");
        form.querySelector('input[name="plusOne"]').value = "";
        form.querySelector('input[name="kids"]').value = "";
        form.querySelector('input[name="kidsCount"]').value = "";
        form.querySelector('input[name="partnerName"]').value = "";
        form.querySelectorAll('[data-for="plusOne"], [data-for="kids"]').forEach((button) => {
          button.classList.remove("active");
        });
      }
    } else if (forField === "plusOne") {
      // Plus one choice
      if (choice === "yes") {
        partnerNameSection.classList.remove("hidden");
      } else {
        partnerNameSection.classList.add("hidden");
        form.querySelector('input[name="partnerName"]').value = "";
      }
    } else if (forField === "kids") {
      // Kids choice
      if (choice === "yes") {
        kidsCountSection.classList.remove("hidden");
      } else {
        kidsCountSection.classList.add("hidden");
        form.querySelector('input[name="kidsCount"]').value = "";
      }
    }
  });
});

function showStatus(message, color) {
  formStatus.textContent = message;
  formStatus.style.color = color;
}

function buildGoogleCalendarUrl(guestName) {
  const summary = "Nunta Maria & Andrei";
  const details = guestName
    ? `Invitatie pentru ${guestName} la nunta noastra.`
    : "Invitatie la nunta noastra.";
  const location = "Mariss Events Alba Iulia";
  const startLocal = "20260927T120000";
  const endLocal = "20260927T230000";
  const timezone = "Europe/Bucharest";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${startLocal}/${endLocal}`,
    details,
    location,
    ctz: timezone
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function renderPostSubmitActions(payload) {
  if (!postSubmitActions) {
    return;
  }

  postSubmitActions.innerHTML = "";

  if (payload.attending !== "yes") {
    return;
  }

  const calendarButton = document.createElement("button");
  calendarButton.type = "button";
  calendarButton.className = "submit-btn calendar-btn";
  calendarButton.textContent = "Adaugă în Google Calendar";
  calendarButton.addEventListener("click", () => {
    const url = buildGoogleCalendarUrl(payload.name);
    window.open(url, "_blank", "noopener,noreferrer");
  });

  postSubmitActions.appendChild(calendarButton);
}

function collectPayload(formData) {
  const attending = formData.get("attending");
  const payload = {
    name: String(formData.get("name") || "").trim(),
    attending: String(attending || "").trim(),
    plusOne: "",
    partnerName: "",
    kids: "",
    kidsCount: "",
    message: String(formData.get("message") || "").trim()
  };

  if (payload.attending === "yes") {
    payload.plusOne = String(formData.get("plusOne") || "").trim();
    payload.partnerName = String(formData.get("partnerName") || "").trim();
    payload.kids = String(formData.get("kids") || "").trim();
    payload.kidsCount = String(formData.get("kidsCount") || "").trim();
  }

  return payload;
}

function submitWithHiddenForm(webhookUrl, payload) {
  const iframeName = "rsvp-submit-target";
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`);

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  const submitForm = document.createElement("form");
  submitForm.method = "POST";
  submitForm.action = webhookUrl;
  submitForm.target = iframeName;
  submitForm.style.display = "none";

  const fields = {
    submittedAt: new Date().toISOString(),
    name: payload.name,
    attending: payload.attending,
    plusOne: payload.plusOne,
    partnerName: payload.partnerName,
    kids: payload.kids,
    kidsCount: payload.kidsCount,
    message: payload.message
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value || "";
    submitForm.appendChild(input);
  });

  document.body.appendChild(submitForm);
  submitForm.submit();
  document.body.removeChild(submitForm);
}

function validatePayload(payload) {
  if (!payload.name) {
    return "Vă rugăm să completați numele.";
  }

  if (!payload.attending) {
    return "Vă rugăm să selectați o opțiune pentru prezență.";
  }

  if (payload.attending !== "yes") {
    return null;
  }

  if (!payload.plusOne) {
    return "Vă rugăm să selectați dacă veniți însoțit/ă.";
  }

  if (payload.plusOne === "yes" && !payload.partnerName) {
    return "Vă rugăm să completați numele însoțitorului/însoțitoarei.";
  }

  if (!payload.kids) {
    return "Vă rugăm să selectați dacă veniți însoțiți de copii.";
  }

  if (payload.kids === "yes") {
    const kidsCount = Number(payload.kidsCount);
    if (!payload.kidsCount) {
      return "Vă rugăm să completați numărul de copii.";
    }

    if (!Number.isInteger(kidsCount) || kidsCount < 1 || kidsCount > 10) {
      return "Vă rugăm să introduceți un număr valid de copii între 1 și 10.";
    }
  }

  return null;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = collectPayload(formData);
  const validationError = validatePayload(payload);

  if (validationError) {
    showStatus(validationError, "#d32f2f");
    return;
  }

  submitButton.disabled = true;
  showStatus("Se trimite răspunsul...", "#6b705c");
  let submittedSuccessfully = false;

  try {
    if (!rsvpWebhookUrl) {
      showStatus("RSVP webhook nu este configurat. Completați meta rsvp-webhook-url.", "#d32f2f");
      return;
    }

    submitWithHiddenForm(rsvpWebhookUrl, payload);

    if (payload.attending === "yes") {
      showStatus(`Mulțumim, ${payload.name}. Așteptăm cu nerăbdare să sărbătorim împreună.`, "#6b705c");
    } else {
      showStatus(`Mulțumim, ${payload.name}. Apreciem răspunsul dumneavoastră.`, "#6b705c");
    }

    renderPostSubmitActions(payload);

    if (rsvpTitle) {
      rsvpTitle.style.display = "none";
    }
    if (rsvpNote) {
      rsvpNote.style.display = "none";
    }
    form.style.display = "none";
    submittedSuccessfully = true;
  } catch {
    showStatus("Nu s-a putut trimite răspunsul. Verificați conexiunea și încercați din nou.", "#d32f2f");
  } finally {
    if (!submittedSuccessfully) {
      submitButton.disabled = false;
    }
  }
});
