import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOptimizedResume, extractKeywords, generateStudentResume, scoreResume } from '../src/engine.js';

test('extractKeywords returns technical keywords', () => {
  const result = extractKeywords('Java Spring Boot Microservices Java REST API SQL');
  assert.ok(result.technicalKeywords.includes('java'));
  assert.ok(result.technicalKeywords.includes('spring'));
});

test('scoreResume returns score object', () => {
  const result = scoreResume({
    platform: 'naukri',
    resumeText: 'Java developer with Spring Boot and SQL experience in Chennai',
    jobDescription: 'Need Java Spring Boot SQL developer in Chennai',
    role: 'Java'
  });
  assert.ok(result.scores.overall >= 0);
  assert.equal(result.platform, 'naukri');
});

test('buildOptimizedResume generates linkedin extras', () => {
  const result = buildOptimizedResume({
    platform: 'linkedin',
    resumeText: 'sample',
    level: '1–3 Years',
    role: 'Java',
    keywords: ['java', 'spring'],
    location: 'Chennai'
  });
  assert.ok(result.headline);
  assert.ok(result.about);
});

test('generateStudentResume includes student sections', () => {
  const result = generateStudentResume({ fullName: 'Ravi Kumar', role: 'Java Developer' });
  assert.ok(result.includes('RAVI KUMAR'));
  assert.ok(result.includes('CAREER OBJECTIVE'));
  assert.ok(result.includes('TARGET ROLE'));
});
