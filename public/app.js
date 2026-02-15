const $ = (id) => document.getElementById(id);
let latestPack = null;
let activeView = "base";

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

async function postDownload(path, body, fallbackFilename) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = body.filename || fallbackFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function collectInput() {
  return {
    fullName: $("fullName").value,
    email: $("email").value,
    phone: $("phone").value,
    location: $("location").value || "Chennai",
    role: $("role").value,
    careerObjective: $("careerObjective").value,
    education: $("education").value,
    skills: $("skills").value,
    project1: $("project1").value,
    project2: $("project2").value,
    internship: $("internship").value,
    certifications: $("certifications").value,
    achievements: $("achievements").value,
    jobDescription: $("jobDescription").value
  };
}

function toSimplePdf(text) {
  const safe = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const lines = safe.split("\n").slice(0, 48);
  let y = 800;
  const content = lines.map((line) => {
    const draw = `BT /F1 10 Tf 35 ${y} Td (${line.slice(0, 110)}) Tj ET`;
    y -= 16;
    return draw;
  }).join("\n");
  return `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length ${content.length}>>stream\n${content}\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000313 00000 n \ntrailer<</Root 1 0 R/Size 6>>\nstartxref\n${350 + content.length}\n%%EOF`;
}

function renderActiveOutput() {
  if (!latestPack) return;
  const text = latestPack.outputs?.[activeView] || "";
  $("resumeOutput").textContent = text;
  const score = latestPack.scorecard?.[activeView]?.scores;
  const insights = {
    candidate: latestPack.candidate,
    activeView,
    score,
    missingKeywords: latestPack.scorecard?.[activeView]?.missingKeywords,
    recruiterSimulation: latestPack.scorecard?.[activeView]?.recruiterSimulation,
    improvementSuggestions: latestPack.scorecard?.[activeView]?.improvementSuggestions,
    keywordInsights: latestPack.keywordInsights,
    strategicAdvice: latestPack.strategicAdvice,
    positioningStatement: latestPack.positioningStatement
  };
  $("insightsOutput").textContent = JSON.stringify(insights, null, 2);
}

$("generatePackBtn").addEventListener("click", async () => {
  try {
    latestPack = await post("/api/advanced-resume-pack", collectInput());
    activeView = "base";
    renderActiveOutput();
  } catch {
    $("resumeOutput").textContent = "Unable to generate resume pack. Please retry.";
  }
});

document.querySelectorAll("[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeView = btn.getAttribute("data-view");
    renderActiveOutput();
  });
});

$("downloadWordBtn").addEventListener("click", async () => {
  if (!latestPack) return;
  const text = latestPack.outputs?.[activeView] || "";
  await postDownload("/api/export/doc", { text, filename: `resume-${activeView}.doc` }, `resume-${activeView}.doc`);
});

$("downloadPdfBtn").addEventListener("click", () => {
  if (!latestPack) return;
  const text = latestPack.outputs?.[activeView] || "";
  const pdf = toSimplePdf(text);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `resume-${activeView}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
});
