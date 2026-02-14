const PLATFORM_RULES = {
  naukri: {
    name: "Naukri",
    guidance: [
      "Use explicit technical skills and domain keywords in a dedicated Skills section.",
      "Use simple project bullets with technology, module ownership, and measurable impact.",
      "Keep service-company friendly language suitable for TCS, CTS, Infosys, Wipro, and Accenture recruiters.",
      "Avoid design-heavy formatting and focus on ATS readability."
    ]
  },
  linkedin: {
    name: "LinkedIn",
    guidance: [
      "Use achievement-driven bullet points with measurable impact.",
      "Add a clear professional headline and narrative About summary.",
      "Keep recruiter scan-ability high using concise bullets and role clarity.",
      "Match Chennai hiring tone: practical, delivery-focused, and collaborative."
    ]
  },
  ats: {
    name: "Company ATS",
    guidance: [
      "Use plain text with clear section headers and no tables or icons.",
      "Mirror exact JD keywords naturally in experience and projects.",
      "Prioritize parseable chronology and role alignment.",
      "Include ATS-friendly technologies, responsibilities, and outcomes."
    ]
  }
};

const CHENNAI_HIRING_TRENDS = {
  lastUpdated: new Date().toISOString(),
  sources: [
    "Naukri Chennai IT job patterns",
    "LinkedIn India software hiring patterns",
    "Common JD structures in Chennai service and product firms"
  ],
  demandByRole: {
    java: ["Spring Boot", "Microservices", "REST API", "SQL", "AWS basics"],
    qa: ["Selenium", "API testing", "Postman", "TestNG", "CI/CD"],
    support: ["ITIL", "L1/L2 troubleshooting", "SQL", "Incident management", "Linux basics"],
    data: ["SQL", "Power BI", "Python", "ETL", "Data validation"]
  },
  recruiterBehavior: [
    "Shortlisting often happens within 10-20 seconds based on title, skills, and recency.",
    "Resumes with clear notice period and current location get higher callbacks for Chennai roles.",
    "Keywords aligned to JD are prioritized over generic career summaries."
  ]
};

const STOPWORDS = new Set([
  "and", "the", "for", "with", "you", "your", "are", "have", "from", "this", "that", "will", "job", "role", "skills", "experience", "work", "our", "team", "years", "year", "using", "ability", "strong"
]);

function normalizeText(input = "") {
  return input.replace(/\s+/g, " ").trim();
}

function splitKeywords(text, minLength = 3) {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length >= minLength && !STOPWORDS.has(w));
}

function keywordFrequency(text) {
  const freq = new Map();
  for (const token of splitKeywords(text)) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]);
}

function extractKeywords(jobDescription = "") {
  const ranked = keywordFrequency(jobDescription);
  const softSkillPool = [
    "communication", "collaboration", "ownership", "problem solving", "stakeholder management",
    "adaptability", "time management", "learning attitude", "documentation", "client handling"
  ];

  const technical = ranked
    .filter(([k]) => !softSkillPool.includes(k))
    .slice(0, 20)
    .map(([k]) => k);

  const repeated = ranked.filter(([, c]) => c > 1).slice(0, 15).map(([k, c]) => ({ keyword: k, count: c }));

  return {
    technicalKeywords: technical,
    softSkillKeywords: softSkillPool.slice(0, 10),
    frequentlyRepeatedTerms: repeated
  };
}

function inferRoleKeywords(role = "") {
  const key = role.toLowerCase();
  return CHENNAI_HIRING_TRENDS.demandByRole[key] ?? [];
}

function scoreResume({ platform, resumeText, jobDescription, role }) {
  const resumeTokens = new Set(splitKeywords(resumeText));
  const jdKeywords = extractKeywords(jobDescription).technicalKeywords;
  const roleKeywords = inferRoleKeywords(role);

  const matchedJd = jdKeywords.filter((k) => resumeTokens.has(k)).length;
  const matchedRole = roleKeywords.filter((k) => resumeText.toLowerCase().includes(k.toLowerCase())).length;

  const keywordRelevance = Math.min(100, Math.round((matchedJd / Math.max(1, jdKeywords.length)) * 100));
  const atsCompatibility = resumeText.length > 350 ? 78 + Math.min(20, matchedRole * 4) : 55;
  const recruiterReadability = Math.min(100, 60 + (resumeText.match(/\n-/g)?.length ?? 0) * 3 + matchedRole * 2);
  const overall = Math.round((keywordRelevance + atsCompatibility + recruiterReadability) / 3);

  return {
    platform,
    scores: {
      atsCompatibility,
      keywordRelevance,
      recruiterReadability,
      overall
    },
    missingKeywords: [...jdKeywords.filter((k) => !resumeTokens.has(k)), ...roleKeywords.filter((k) => !resumeTokens.has(k.toLowerCase()))].slice(0, 15),
    improvementSuggestions: [
      "Align summary and project bullets to exact JD terms used by Chennai employers.",
      "Add explicit tools/technologies section and mention versions where possible.",
      "Include notice period, current location (Chennai), and preferred shifts if relevant.",
      "Quantify impact using response time, defect leakage, automation %, or throughput metrics."
    ],
    rejectionReasons: [
      "Low keyword match against JD causes ATS filtering.",
      "Generic profile summary without role-specific proof points.",
      "Missing Chennai/location or notice period details for immediate screening decisions."
    ]
  };
}

function buildOptimizedResume({ platform, resumeText, level, role, keywords, location = "Chennai" }) {
  const rules = PLATFORM_RULES[platform] ?? PLATFORM_RULES.ats;
  const roleKeywords = inferRoleKeywords(role);
  const keywordLine = [...new Set([...(keywords || []), ...roleKeywords])].slice(0, 18).join(", ");

  const summary = `Professional Summary\n${level} ${role} candidate based in ${location}, optimized for ${rules.name} hiring workflows. Focused on delivery, stakeholder communication, and practical execution for Indian IT teams.`;
  const skills = `Technical Skills\n${keywordLine || "Java, SQL, API Testing, Linux, Jira, Git"}`;
  const exp = `Experience Highlights\n- Built and maintained production workflows with measurable quality and performance improvements.\n- Collaborated with QA, development, and support teams to deliver releases in agile sprints.\n- Documented root-cause analysis and corrective actions for recurring production issues.`;
  const projects = `Projects\n- Project 1: Implemented role-relevant module using ${roleKeywords[0] ?? "core technologies"}; improved turnaround time and defect stability.\n- Project 2: Enhanced reliability through monitoring, test coverage, and process automation.`;

  const extras = platform === "linkedin"
    ? {
        headline: `${role} | ${location} | ${level} | Open to Chennai IT Opportunities`,
        about: `I am a ${location}-based ${role} professional with ${level} experience, focused on solving practical business problems with clean execution. I contribute across development, testing, and stakeholder communication to deliver reliable outcomes in fast-paced IT teams.`
      }
    : {};

  const optimizedText = [summary, skills, exp, projects, "Education\n- Add highest qualification, institution, and year.", "Additional Information\n- Current Location: Chennai\n- Notice Period: Mention clearly\n- Preferred Work Model: Onsite/Hybrid/Remote"].join("\n\n");

  return {
    platform: rules.name,
    rulesApplied: rules.guidance,
    beforeSnippet: normalizeText(resumeText).slice(0, 450) || "No resume text supplied.",
    optimizedText,
    ...extras
  };
}

function generateStudentResume(input = {}) {
  const {
    fullName = "Your Name",
    email = "email@example.com",
    phone = "+91-XXXXXXXXXX",
    location = "Chennai",
    role = "Software Engineer",
    careerObjective = "Motivated student seeking an entry-level IT role to apply technical skills and contribute to team success.",
    education = "B.E. Computer Science, Anna University (2025) | CGPA: 8.2/10",
    skills = "Java, SQL, HTML, CSS, JavaScript, Git, Problem Solving",
    project1 = "Student Management System using Java and MySQL; built CRUD modules and reduced manual effort.",
    project2 = "Bug tracking dashboard using HTML/CSS/JS; improved defect visibility and follow-up.",
    internship = "Intern - QA Trainee, Chennai startup (2 months): wrote test cases, tested APIs, reported defects in Jira.",
    certifications = "NPTEL Java Programming, HackerRank SQL Basic"
  } = input;

  return [
    `${fullName.toUpperCase()}`,
    `${phone} | ${email} | ${location}`,
    "",
    "CAREER OBJECTIVE",
    careerObjective,
    "",
    "TARGET ROLE",
    role,
    "",
    "EDUCATION",
    `- ${education}`,
    "",
    "TECHNICAL SKILLS",
    `- ${skills}`,
    "",
    "ACADEMIC / PERSONAL PROJECTS",
    `- ${project1}`,
    `- ${project2}`,
    "",
    "INTERNSHIP / TRAINING",
    `- ${internship}`,
    "",
    "CERTIFICATIONS",
    `- ${certifications}`,
    "",
    "STRENGTHS",
    "- Quick learner, team collaboration, communication, ownership",
    "",
    "DECLARATION",
    "I hereby declare that the information provided is true to the best of my knowledge."
  ].join("\n");
}

function generateTechnicalInterview({ role, level, answer }) {
  const questions = {
    java: [
      "Explain how Spring Boot auto-configuration works in a production service.",
      "How do you design exception handling for REST APIs?",
      "What steps do you follow to optimize a slow SQL query?"
    ],
    qa: [
      "How do you decide what to automate and what to test manually?",
      "Explain an API testing strategy for a payment module.",
      "How do you reduce flaky tests in Selenium/TestNG suites?"
    ],
    support: [
      "How would you handle a P1 production incident during night shift?",
      "What details must be captured in an incident RCA?",
      "How do you prioritize multiple tickets with conflicting SLAs?"
    ]
  };

  const selected = questions[role.toLowerCase()] ?? [
    "Walk through your most relevant project and your exact responsibilities.",
    "How do you troubleshoot a production issue under time pressure?",
    "How do you communicate blockers to clients and internal teams?"
  ];

  const score = answer ? Math.min(100, 40 + Math.round(answer.length / 7)) : 0;

  return {
    context: { role, level, location: "Chennai" },
    questions: selected,
    evaluation: answer
      ? {
          score,
          gaps: [
            "Add more measurable outcomes (latency reduction, defect reduction, MTTR, etc.).",
            "Clarify decision-making tradeoffs and production constraints.",
            "Mention coordination with cross-functional teams."
          ],
          improvedAnswer: `In my recent ${role} work, I first clarify impact and dependencies, then apply a structured fix plan with validation steps. I communicate updates to stakeholders, monitor post-release behavior, and document preventive actions to avoid recurrence.`,
          interviewerJudgement: "Interviewers in Chennai IT firms prioritize structured thinking, production ownership, and clear communication over theory-heavy answers."
        }
      : null
  };
}

function generateHrInterview(answerMap = {}) {
  const prompts = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What is your salary expectation?",
    "How soon can you join / notice period negotiation?",
    "Why do you want to change your current job?"
  ];

  const answered = Object.values(answerMap).filter(Boolean).length;
  const score = Math.min(100, 45 + answered * 10);

  return {
    prompts,
    evaluation: {
      score,
      mistakes: [
        "Overly generic responses without role/company alignment.",
        "Aggressive salary ask without market context.",
        "Negative framing about current employer."
      ],
      betterAnswers: [
        "Position your impact with two role-relevant achievements and one Chennai market fit point.",
        "Use a market-aligned salary range and show flexibility based on role scope.",
        "For job change, focus on growth, ownership, and technology alignment."
      ]
    }
  };
}

export {
  CHENNAI_HIRING_TRENDS,
  PLATFORM_RULES,
  buildOptimizedResume,
  extractKeywords,
  generateHrInterview,
  generateStudentResume,
  generateTechnicalInterview,
  scoreResume
};
