{
  "default": {
    "paths": ["tests/features/**/*.feature"],
    "require": ["tests/features/**/*.ts", "tests/features/support/**/*.ts"],
    "format": ["progress", "html:cucumber-report.html"],
    "formatOptions": { "snippetInterface": "async-await" }
  }
}
