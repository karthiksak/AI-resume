import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdvancedResumePack,
  buildStudentBaseResume,
  extractKeywords,
  scoreResume
} from '../src/engine.js';

test('extractKeywords returns technical keywords', () => {
  const result = extractKeywords('Java Spring Boot Microservices Java REST API SQL');
  assert.ok(result.technicalKeywords.includes('java'));
  assert.ok(result.technicalKeywords.includes('spring'));
});

test('buildStudentBaseResume includes core sections', () => {
  const result = buildStudentBaseResume({ fullName: 'Ravi Kumar', role: 'java' });
  assert.ok(result.resumeText.includes('RAVI KUMAR'));
  assert.ok(result.resumeText.includes('CAREER OBJECTIVE'));
  assert.ok(result.resumeText.includes('PROJECTS'));
});

test('scoreResume returns advanced scores', () => {
  const result = scoreResume({
    resumeText: 'Java Spring Boot SQL project improved 30% performance',
    jobDescription: 'Need Java Spring Boot SQL developer',
    role: 'java'
  });
  assert.ok(result.scores.overall >= 0);
  assert.ok(typeof result.scores.impactStrength === 'number');
});

test('buildAdvancedResumePack returns multi-platform outputs', () => {
  const result = buildAdvancedResumePack({
    fullName: 'Ravi',
    role: 'qa',
    jobDescription: 'QA Selenium TestNG API testing SQL'
  });
  assert.ok(result.outputs.base);
  assert.ok(result.outputs.naukri);
  assert.ok(result.outputs.linkedin);
  assert.ok(result.outputs.ats);
});
