module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1.0 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "speed-index": ["error", { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
