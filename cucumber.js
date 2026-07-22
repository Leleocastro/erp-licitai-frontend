module.exports = {
  default: {
    paths: ["tests/features/**/*.feature"],
    require: ["tests/features/**/*.ts", "tests/features/support/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress", "html:cucumber-report.html"],
    formatOptions: { snippetInterface: "async-await" },
    publishQuiet: true,
  },
};
