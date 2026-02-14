const PLATFORM_RULES = {
  naukri: {
    name: "Naukri",
    tone: "Service-company friendly, keyword-dense, direct",
    priorities: [
      "Explicit skills and tools list",
      "Simple measurable project bullets",
      "Role keyword repetition in summary and projects",
      "Clear location and availability details"
    ]
  },
  linkedin: {
    name: "LinkedIn",
    tone: "Achievement-driven, recruiter-scan friendly",
    priorities: [
      "Strong profile headline",
      "High-impact About summary",
      "Outcome-based bullets with numbers",
      "Modern but ATS-friendly text structure"
    ]
  },
  ats: {
    name: "Company ATS",
    tone: "Plain text, parser-safe, exact keyword aligned",
    priorities: [
      "No special formatting",
      "Exact JD keyword match",
      "Clear section headers",
      "Role and education alignment"
    ]
  }
};

const ROLE_BLUEPRINTS = {
  java: {
    title: "Java Developer",
    tech: ["Java", "Spring Boot", "Microservices", "REST API", "SQL", "Git", "JUnit", "Maven"],
    projectIdeas: [
      "Built a student service portal using Spring Boot + MySQL with JWT-based authentication",
      "Developed REST APIs and improved response time using query optimization"
    ]
  },
  qa: {
    title: "QA Engineer",
    tech: ["Selenium", "TestNG", "Postman", "API Testing", "Jira", "SQL", "Automation", "Regression Testing"],
    projectIdeas: [
      "Automated regression suite with Selenium + TestNG, reducing manual effort by 40%",
      "Created API test collections in Postman and identified critical defects pre-release"
    ]
  },
  support: {
    title: "Application Support Engineer",
    tech: ["ITIL", "Incident Management", "SQL", "Linux", "Monitoring", "RCA", "L1/L2 Support"],
    projectIdeas: [
      "Handled priority incidents and improved MTTR through runbook-based troubleshooting",
      "Built ticket trend dashboards for proactive issue prevention"
    ]
  },
  data: {
    title: "Data Analyst",
    tech: ["SQL", "Python", "Power BI", "Excel", "Data Cleaning", "ETL", "Dashboarding"],
    projectIdeas: [
      "Designed Power BI dashboard to track KPI trends and decision insights",
      "Built SQL-based ETL pipeline and improved reporting accuracy"
    ]
  }
};

const SOFT_SKILLS = [
  "communication", "collaboration", "problem solving", "ownership", "adaptability",
  "stakeholder management", "time management", "learning attitude", "documentation", "teamwork"
];

const STOPWORDS = new Set([
  "and", "the", "for", "with", "you", "your", "are", "have", "from", "this", "that", "will", "job", "role", "skills", "experience", "work", "our", "team", "years", "year", "using", "ability", "strong", "candidate", "good", "must", "should"
]);

function normalizeText(input = "") {
  return input.replace(/\s+/g, " ").trim();
}

function words(text = "") {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w && w.length > 2 && !STOPWORDS.has(w));
}

function pickRoleBlueprint(role = "") {
  return ROLE_BLUEPRINTS[role.toLowerCase()] ?? ROLE_BLUEPRINTS.java;
}

function frequency(text = "") {
  const map = new Map();
  for (const token of words(text)) {
    map.set(token, (map.get(token) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function extractKeywords(jobDescription = "") {
  const ranked = frequency(jobDescription);
  const technicalKeywords = ranked
    .filter(([k]) => !SOFT_SKILLS.includes(k))
    .slice(0, 20)
    .map(([k]) => k);

  return {
    technicalKeywords,
    softSkillKeywords: SOFT_SKILLS,
    frequentlyRepeatedTerms: ranked.filter(([, c]) => c > 1).slice(0, 15).map(([k, c]) => ({ keyword: k, count: c }))
  };
}

function buildStudentBaseResume(input = {}) {
  const roleInfo = pickRoleBlueprint(input.role);
  const fullName = input.fullName || "Your Name";
  const email = input.email || "email@example.com";
  const phone = input.phone || "+91-XXXXXXXXXX";
  const location = input.location || "Chennai";
  const targetRole = roleInfo.title;
  const objective = input.careerObjective || `Final-year student seeking ${targetRole} opportunities in Chennai IT with strong fundamentals and project ownership.`;
  const education = input.education || "B.E. / B.Tech (Computer Science), 2025, CGPA: 8.2/10";
  const skills = input.skills || roleInfo.tech.join(", ");
  const project1 = input.project1 || roleInfo.projectIdeas[0];
  const project2 = input.project2 || roleInfo.projectIdeas[1];
  const internship = input.internship || "Internship: Completed hands-on training with test execution, debugging, and team coordination.";
  const certifications = input.certifications || "NPTEL, HackerRank, Coursera role-specific certifications";
  const achievements = input.achievements || "Solved 200+ coding problems and contributed to mini-project demos.";

  const resumeText = [
    `${fullName.toUpperCase()}`,
    `${phone} | ${email} | ${location}`,
    "",
    "PROFESSIONAL TITLE",
    targetRole,
    "",
    "CAREER OBJECTIVE",
    objective,
    "",
    "EDUCATION",
    `- ${education}`,
    "",
    "TECHNICAL SKILLS",
    `- ${skills}`,
    "",
    "PROJECTS",
    `- ${project1}`,
    `- ${project2}`,
    "",
    "INTERNSHIP / TRAINING",
    `- ${internship}`,
    "",
    "CERTIFICATIONS",
    `- ${certifications}`,
    "",
    "ACHIEVEMENTS",
    `- ${achievements}`,
    "",
    "ADDITIONAL DETAILS",
    "- Current Location: Chennai",
    "- Notice Period: Immediate",
    "- Preferred Role: Entry-level IT"
  ].join("\n");

  return { resumeText, meta: { fullName, targetRole, location, roleInfo } };
}

function optimizeResumeForPlatform(baseResumeText, platform, jdKeywords = [], meta = {}) {
  const rule = PLATFORM_RULES[platform] ?? PLATFORM_RULES.ats;
  const prioritized = [...new Set([...(jdKeywords || []), ...(meta.roleInfo?.tech ?? [])])].slice(0, 18);

  const header = [
    baseResumeText,
    "",
    `PLATFORM OPTIMIZATION: ${rule.name}`,
    `Recruiter Tone: ${rule.tone}`,
    `Priority Keywords: ${prioritized.join(", ")}`,
    "Optimization Checklist:",
    ...rule.priorities.map((p) => `- ${p}`)
  ].join("\n");

  if (platform === "linkedin") {
    const headline = `${meta.targetRole || "IT Candidate"} | ${meta.location || "Chennai"} | Fresher | Open to Opportunities`;
    const about = `I am a Chennai-based fresher focused on ${meta.targetRole || "IT roles"}. I build practical projects, learn quickly, and collaborate effectively to deliver measurable outcomes.`;
    return `${header}\n\nLINKEDIN HEADLINE\n${headline}\n\nLINKEDIN ABOUT\n${about}`;
  }

  return header;
}

function scoreResume({ resumeText = "", jobDescription = "", role = "" }) {
  const resumeTokens = new Set(words(resumeText));
  const jdData = extractKeywords(jobDescription);
  const roleInfo = pickRoleBlueprint(role);

  const jdMatches = jdData.technicalKeywords.filter((k) => resumeTokens.has(k)).length;
  const roleMatches = roleInfo.tech.filter((k) => resumeText.toLowerCase().includes(k.toLowerCase())).length;

  const keywordRelevance = Math.min(100, Math.round((jdMatches / Math.max(1, jdData.technicalKeywords.length)) * 100));
  const atsCompatibility = Math.min(100, 65 + roleMatches * 4 + (resumeText.includes("\n") ? 8 : 0));
  const recruiterReadability = Math.min(100, 60 + (resumeText.match(/\n-/g)?.length ?? 0) * 2 + Math.min(20, Math.round(resumeText.length / 120)));
  const impactStrength = Math.min(100, 50 + (resumeText.match(/\d+%|\d+\+/g)?.length ?? 0) * 12);
  const overall = Math.round((keywordRelevance + atsCompatibility + recruiterReadability + impactStrength) / 4);

  return {
    scores: { atsCompatibility, keywordRelevance, recruiterReadability, impactStrength, overall },
    missingKeywords: [...jdData.technicalKeywords.filter((k) => !resumeTokens.has(k)), ...roleInfo.tech.filter((k) => !resumeText.toLowerCase().includes(k.toLowerCase()))].slice(0, 15),
    recruiterSimulation: [
      "Initial 15-sec scan: Name, target role, skills, location.",
      "Next scan: project relevance and practical outcomes.",
      "Final decision: keyword alignment + confidence in execution."
    ],
    improvementSuggestions: [
      "Place top JD keywords in objective, skills, and project bullets.",
      "Add measurable outcomes (%, counts, time saved).",
      "Keep section headers standard for ATS parsing.",
      "Use Chennai location and immediate availability if applicable."
    ]
  };
}

function buildAdvancedResumePack(input = {}) {
  const base = buildStudentBaseResume(input);
  const jdData = extractKeywords(input.jobDescription || "");

  const naukriResume = optimizeResumeForPlatform(base.resumeText, "naukri", jdData.technicalKeywords, base.meta);
  const linkedinResume = optimizeResumeForPlatform(base.resumeText, "linkedin", jdData.technicalKeywords, base.meta);
  const atsResume = optimizeResumeForPlatform(base.resumeText, "ats", jdData.technicalKeywords, base.meta);

  return {
    generatedAt: new Date().toISOString(),
    candidate: {
      fullName: base.meta.fullName,
      role: base.meta.targetRole,
      location: base.meta.location
    },
    keywordInsights: jdData,
    outputs: {
      base: base.resumeText,
      naukri: naukriResume,
      linkedin: linkedinResume,
      ats: atsResume
    },
    scorecard: {
      base: scoreResume({ resumeText: base.resumeText, jobDescription: input.jobDescription, role: input.role }),
      naukri: scoreResume({ resumeText: naukriResume, jobDescription: input.jobDescription, role: input.role }),
      linkedin: scoreResume({ resumeText: linkedinResume, jobDescription: input.jobDescription, role: input.role }),
      ats: scoreResume({ resumeText: atsResume, jobDescription: input.jobDescription, role: input.role })
    },
    strategicAdvice: [
      "Apply Naukri version for mass service-company pipelines.",
      "Apply LinkedIn version for recruiter outreach and product companies.",
      "Apply ATS version for direct company portals.",
      "Refresh keywords before every application."
    ],
    positioningStatement: "This platform aims to deliver one of the strongest student resume outcomes through platform-specific optimization and recruiter-style scoring."
  };
}

function generateStudentResume(input = {}) {
  return buildStudentBaseResume(input).resumeText;
}

export {
  PLATFORM_RULES,
  buildAdvancedResumePack,
  buildStudentBaseResume,
  extractKeywords,
  generateStudentResume,
  scoreResume
};
