// SEO Validator - Check SEO health and find errors
// This file validates SEO configuration and reports issues

import { SEO_DATA, PAGE_NAMES } from './seo-config.js';

// SEO Validation Rules
const SEO_RULES = {
  title: {
    minLength: 30,
    maxLength: 60,
    required: true,
    name: "Page Title"
  },
  description: {
    minLength: 50,
    maxLength: 160,
    required: true,
    name: "Meta Description"
  },
  keywords: {
    minLength: 10,
    maxLength: 300,
    required: true,
    name: "Meta Keywords"
  },
  ogImage: {
    required: true,
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    name: "OG Image URL"
  },
  canonical: {
    required: true,
    pattern: /^https?:\/\/.+\.html$/i,
    name: "Canonical URL"
  }
};

// Validate a single SEO field
function validateField(fieldName, value, pageName) {
  const rule = SEO_RULES[fieldName];
  const errors = [];
  const warnings = [];

  // If no rule defined for this field, skip validation
  if (!rule) {
    return { errors, warnings };
  }

  if (!value || value.trim() === '') {
    if (rule.required) {
      errors.push(`${rule.name} is required for ${PAGE_NAMES[pageName] || pageName}`);
    }
    return { errors, warnings };
  }

  // Check length rules
  if (rule.minLength && value.length < rule.minLength) {
    errors.push(`${rule.name} is too short (${value.length}/${rule.minLength} chars) for ${PAGE_NAMES[pageName] || pageName}`);
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    if (fieldName === 'title') {
      warnings.push(`${rule.name} is too long (${value.length}/${rule.maxLength} chars) - may be truncated in search results for ${PAGE_NAMES[pageName] || pageName}`);
    } else {
      errors.push(`${rule.name} is too long (${value.length}/${rule.maxLength} chars) for ${PAGE_NAMES[pageName] || pageName}`);
    }
  }

  // Check pattern rules
  if (rule.pattern && !rule.pattern.test(value)) {
    errors.push(`${rule.name} has invalid format for ${PAGE_NAMES[pageName] || pageName}`);
  }

  // Check for placeholder URLs
  if (fieldName === 'ogImage' && value.includes('placeholder.com')) {
    warnings.push(`OG Image is using placeholder - replace with actual image for ${PAGE_NAMES[pageName] || pageName}`);
  }

  // Check for keyword stuffing (too many commas)
  if (fieldName === 'keywords') {
    const commaCount = (value.match(/,/g) || []).length;
    if (commaCount > 15) {
      warnings.push(`Too many keywords (${commaCount + 1}) - focus on 5-10 main keywords for ${PAGE_NAMES[pageName] || pageName}`);
    }
  }

  // Check title for brand name
  if (fieldName === 'title' && !value.toLowerCase().includes('hunny')) {
    warnings.push(`Title doesn't include brand name "Hunny" for ${PAGE_NAMES[pageName] || pageName}`);
  }

  return { errors, warnings };
}

// Validate SEO for a single page
export function validatePageSEO(pageName) {
  const seoData = SEO_DATA[pageName];
  if (!seoData) {
    return {
      page: pageName,
      valid: false,
      errors: [`No SEO data found for ${pageName}`],
      warnings: [],
      score: 0
    };
  }

  const allErrors = [];
  const allWarnings = [];
  let score = 100;

  // Validate each field
  for (const [fieldName, value] of Object.entries(seoData)) {
    const { errors, warnings } = validateField(fieldName, value, pageName);
    allErrors.push(...errors);
    allWarnings.push(...warnings);

    // Deduct score for errors
    score -= errors.length * 10;
    score -= warnings.length * 3;
  }

  // Additional checks
  // Check if title and description are different
  if (seoData.title === seoData.description) {
    allErrors.push(`Title and Description are identical for ${PAGE_NAMES[pageName] || pageName}`);
    score -= 15;
  }

  // Check if keywords are in title/description
  if (seoData.keywords && seoData.title) {
    const mainKeyword = seoData.keywords.split(',')[0]?.trim().toLowerCase();
    if (mainKeyword && !seoData.title.toLowerCase().includes(mainKeyword)) {
      allWarnings.push(`Main keyword "${mainKeyword}" not found in title for ${PAGE_NAMES[pageName] || pageName}`);
      score -= 5;
    }
  }

  return {
    page: pageName,
    pageName: PAGE_NAMES[pageName] || pageName,
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    score: Math.max(0, score)
  };
}

// Validate all pages SEO
export function validateAllSEO() {
  const results = [];
  let totalScore = 0;
  let workingPages = 0;
  let pagesWithIssues = 0;

  for (const pageName of Object.keys(SEO_DATA)) {
    const result = validatePageSEO(pageName);
    results.push(result);
    totalScore += result.score;

    if (result.valid) {
      workingPages++;
    } else {
      pagesWithIssues++;
    }
  }

  return {
    pages: results,
    totalScore: Math.round(totalScore / results.length),
    workingPages,
    pagesWithIssues,
    totalPages: results.length,
    healthPercentage: Math.round((workingPages / results.length) * 100)
  };
}

// Get SEO status summary
export function getSEOStatusSummary() {
  const validation = validateAllSEO();
  
  const status = {
    overall: validation.healthPercentage >= 80 ? '✅ Excellent' : 
             validation.healthPercentage >= 50 ? '⚠️ Needs Improvement' : '❌ Critical Issues',
    score: validation.totalScore,
    workingPages: validation.workingPages,
    issuesPages: validation.pagesWithIssues,
    totalPages: validation.totalPages,
    criticalErrors: validation.pages.filter(p => p.errors.length > 0).length,
    warnings: validation.pages.reduce((acc, p) => acc + p.warnings.length, 0)
  };

  return status;
}

// Check if SEO is working (no Firebase dependency)
export function checkSEOWorking() {
  const metaDescription = document.querySelector('meta[name="description"]');
  const metaTitle = document.querySelector('title');
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  const ogImage = document.querySelector('meta[property="og:image"]');

  const checks = {
    hasDescription: !!metaDescription && metaDescription.content.length > 50,
    hasTitle: !!metaTitle && metaTitle.textContent.length > 30,
    hasKeywords: !!metaKeywords,
    hasOGImage: !!ogImage,
    noFirebaseDelay: true // Since we're using static SEO
  };

  const allPassed = Object.values(checks).every(check => check);

  return {
    working: allPassed,
    checks,
    message: allPassed ? '✅ SEO is working perfectly!' : '⚠️ Some SEO elements are missing'
  };
}

// Generate SEO report
export function generateSEOReport() {
  const validation = validateAllSEO();
  const status = getSEOStatusSummary();

  const report = {
    generatedAt: new Date().toISOString(),
    summary: status,
    pages: validation.pages.map(page => ({
      page: page.page,
      name: page.pageName,
      score: page.score,
      status: page.valid ? '✅ Working' : '❌ Issues Found',
      errors: page.errors.length,
      warnings: page.warnings.length
    })),
    recommendations: getRecommendations(validation)
  };

  return report;
}

// Get recommendations based on validation
function getRecommendations(validation) {
  const recommendations = [];

  validation.pages.forEach(page => {
    if (page.errors.some(e => e.includes('too short'))) {
      recommendations.push(`Expand content for ${page.pageName}`);
    }
    if (page.errors.some(e => e.includes('placeholder'))) {
      recommendations.push(`Replace placeholder images for ${page.pageName}`);
    }
    if (page.warnings.some(w => w.includes('brand name'))) {
      recommendations.push(`Add brand name to titles for better branding`);
    }
  });

  // Remove duplicates
  return [...new Set(recommendations)];
}

// Export for use in dashboard
export { SEO_RULES };
