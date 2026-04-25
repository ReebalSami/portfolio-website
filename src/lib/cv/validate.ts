import { loadCvData, loadCvPrivateData } from "./data";

/**
 * Validates all CV YAML files against the Zod schema.
 * Run via: make cv:validate
 */
function validate() {
  let hasErrors = false;

  try {
    const data = loadCvData();
    console.log(
      `✅ config/cv/cv.public.yaml — valid (${data.experience.length} experience entries, ${data.education.length} education entries)`
    );
  } catch (error) {
    console.error("❌ config/cv/cv.public.yaml — FAILED");
    console.error(
      error instanceof Error ? error.message : String(error)
    );
    hasErrors = true;
  }

  try {
    const privateData = loadCvPrivateData();
    if (privateData) {
      console.log("✅ config/cv/cv.private.yaml — valid");
    } else {
      console.log(
        "⚠️  config/cv/cv.private.yaml — not found (expected in CI, fill in locally)"
      );
    }
  } catch (error) {
    console.error("❌ config/cv/cv.private.yaml — FAILED");
    console.error(
      error instanceof Error ? error.message : String(error)
    );
    hasErrors = true;
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log("\n🎉 All CV data files validated successfully.");
}

validate();
