const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmTBUENGNJgtsRqW2n4uwRmuYPgISppbU6EFo68Zi0NZTG7n7uZYG-2Nz_WvslEL6-6Q/exec";
const THANK_YOU_URL = "/thank-you/";

const form = document.getElementById("rsvpForm");
const yesFields = document.getElementById("yesFields");
const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submitBtn");

let busy = false;

function setMsg(t) {
  msg.textContent = t || "";
}

function getClientId() {
  const key = "rsvp_client_id_v1";
  let id = localStorage.getItem(key);
  if (!id) {
    id = (crypto?.randomUUID?.() || String(Date.now()) + "-" + Math.random().toString(16).slice(2));
    localStorage.setItem(key, id);
  }
  return id;
}

function setYesFieldsEnabled(enabled) {
  yesFields.hidden = !enabled;

  // kad hidden laukai netrukdytų validacijai ir nebūtų required, kai pasirinkta "Ne"
  const inputs = yesFields.querySelectorAll("input, button");
  inputs.forEach((el) => (el.disabled = !enabled));

  // required tik tada, kai "Taip"
  const requiredNames = ["vardaiPavardes", "gimimoDatos", "email", "telefonas", "maistas"];
  requiredNames.forEach((name) => {
    const inp = yesFields.querySelector(`[name="${name}"]`);
    if (inp) inp.required = enabled;
  });
}

function payloadFromForm() {
  const fd = new FormData(form);

  return {
    timestamp: new Date().toISOString(),
    clientId: getClientId(),

    dalyvaus: fd.get("dalyvaus") || "",

    vardaiPavardes: fd.get("vardaiPavardes") || "",
    gimimoDatos: fd.get("gimimoDatos") || "",
    email: fd.get("email") || "",
    telefonas: fd.get("telefonas") || "",

    maistas: fd.get("maistas") || "",
    alergijos: fd.get("alergijos") || "",
    atvykimas: fd.get("atvykimas") || "",
    isvykimas: fd.get("isvykimas") || "",
    pageidavimai: fd.get("pageidavimai") || ""
  };
}

async function sendToSheet(payload) {
  if (!SCRIPT_URL) throw new Error("Trūksta SCRIPT_URL.");

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const ok = navigator.sendBeacon(SCRIPT_URL, new Blob([body], { type: "text/plain" }));
    if (ok) return;
  }

  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
    keepalive: true
  });
}

function goThankYou() {
  window.location.assign(THANK_YOU_URL);
}

// pradžioje "Taip" laukus išjungiam
setYesFieldsEnabled(false);

form.addEventListener("change", async (e) => {
  if (e.target.name !== "dalyvaus") return;

  const val = e.target.value;
  setMsg("");

  if (val === "Taip") {
    setYesFieldsEnabled(true);
    return;
  }

  // "Ne" -> iškart siunčiam ir nukreipiam
  setYesFieldsEnabled(false);

  if (busy) return;
  busy = true;

  try {
    await sendToSheet(payloadFromForm());
    setMsg("Ačiū už jūsų atsakymą.");
    setTimeout(goThankYou, 200);
  } catch (err) {
    busy = false;
    setMsg(String(err));
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;

  busy = true;
  if (submitBtn) submitBtn.disabled = true;

  try {
    await sendToSheet(payloadFromForm());
    setMsg("Ačiū, iki susitikimo rugpjūtį saulėtoje Italijoje");
    setTimeout(goThankYou, 200);
  } catch (err) {
    busy = false;
    if (submitBtn) submitBtn.disabled = false;
    setMsg(String(err));
  }
});
