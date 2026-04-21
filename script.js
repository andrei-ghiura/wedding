const targetDate = new Date("2026-09-27T18:00:00");

function updateCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    return;
  }

  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    daysEl.textContent = "000";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(3, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

const form = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");
const yesSection = document.getElementById("yesSection");
const messageSection = document.getElementById("messageSection");
const messageField = form.querySelector('textarea[name="message"]');
const partnerNameSection = document.getElementById("partnerNameSection");
const kidsCountSection = document.getElementById("kidsCountSection");

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
        form.querySelector('input[name="accommodation"]').value = "";
        form.querySelectorAll('[data-for="plusOne"], [data-for="kids"], [data-for="accommodation"]').forEach((button) => {
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get("name");
  const attending = formData.get("attending");

  if (!attending) {
    formStatus.textContent = "Vă rugăm să selectați o opțiune pentru prezență.";
    formStatus.style.color = "#d32f2f";
    return;
  }

  if (attending === "yes") {
    formStatus.textContent = `Mulțumim, ${name}. Așteptăm cu nerăbdare să sărbătorim împreună.`;
  } else {
    formStatus.textContent = `Mulțumim, ${name}. Apreciem răspunsul dumneavoastră.`;
  }
  formStatus.style.color = "#6b705c";

  form.reset();
  yesSection.classList.add("hidden");
  messageSection.classList.add("hidden");
  messageField.placeholder = "";
  partnerNameSection.classList.add("hidden");
  kidsCountSection.classList.add("hidden");
  choiceButtons.forEach((btn) => btn.classList.remove("active"));
});
