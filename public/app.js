const $ = (id) => document.getElementById(id);

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

function collectInputs() {
  return {
    platform: $("platform").value,
    level: $("level").value,
    role: $("role").value,
    location: $("location").value || "Chennai",
    resumeText: $("resumeText").value,
    jobDescription: $("jobDescription").value
  };
}

$("runBtn").addEventListener("click", async () => {
  const payload = collectInputs();
  const [optimized, score, keywords] = await Promise.all([
    post("/api/optimize", payload),
    post("/api/score", payload),
    post("/api/keywords", { jobDescription: payload.jobDescription })
  ]);

  const response = {
    optimizedResume: optimized,
    score,
    keywordInsights: keywords,
    note: "No guaranteed jobs. This assistant improves discoverability and interview readiness using Chennai-focused heuristics."
  };

  $("results").textContent = JSON.stringify(response, null, 2);
});

$("techBtn").addEventListener("click", async () => {
  const payload = collectInputs();
  const data = await post("/api/interview/technical", {
    role: payload.role,
    level: payload.level,
    answer: $("sampleAnswer").value
  });
  $("interviewResults").textContent = JSON.stringify(data, null, 2);
});

$("hrBtn").addEventListener("click", async () => {
  const answer = $("sampleAnswer").value;
  const data = await post("/api/interview/hr", { answers: { generic: answer } });
  $("interviewResults").textContent = JSON.stringify(data, null, 2);
});

fetch("/api/trends")
  .then((res) => res.json())
  .then((data) => {
    $("trendBox").textContent = JSON.stringify(data, null, 2);
  })
  .catch(() => {
    $("trendBox").textContent = "Unable to load trend feed.";
  });
