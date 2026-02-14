const $ = (id) => document.getElementById(id);
let latestResumeText = "";

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

function collectStudentInput() {
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
    certifications: $("certifications").value
  };
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function toSimplePdf(text) {
  const safe = text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

  const lines = safe.split("\n").slice(0, 42);
  let y = 800;
  const content = lines.map((line) => {
    const draw = `BT /F1 11 Tf 40 ${y} Td (${line.slice(0, 100)}) Tj ET`;
    y -= 18;
    return draw;
  }).join("\n");

  const pdf = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length ${content.length}>>stream\n${content}\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000313 00000 n \ntrailer<</Root 1 0 R/Size 6>>\nstartxref\n${350 + content.length}\n%%EOF`;

  return pdf;
}

$("generateBtn").addEventListener("click", async () => {
  const data = await post("/api/student-resume", collectStudentInput());
  latestResumeText = data.resumeText;
  $("resumeOutput").textContent = latestResumeText;
});

$("downloadWordBtn").addEventListener("click", () => {
  if (!latestResumeText) return;
  downloadBlob("student-resume.doc", latestResumeText, "application/msword");
});

$("downloadPdfBtn").addEventListener("click", () => {
  if (!latestResumeText) return;
  downloadBlob("student-resume.pdf", toSimplePdf(latestResumeText), "application/pdf");
});
