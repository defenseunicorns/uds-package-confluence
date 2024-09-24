import { test, expect } from "@playwright/test";
import path from "path";

function randomProjectName() {
  return `uds-package-confluence-${Math.floor(Math.random() * 1000)}`;
}

test("setup a project", async ({ page }) => {
  const projectName = randomProjectName();
  const projectKey = projectName.toUpperCase();

  await page.goto("/projects?create");
  await page.getByLabel("Project name").fill(projectName);
  await page.getByLabel("Project key").fill(projectKey);
  await page.getByLabel("Description").fill("This is a test project");
  await page.getByRole("button", { name: "Change avatar" }).click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload an image" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, "data/unicorns.jpeg"));
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page).toHaveURL(`/projects/${projectKey}`);

  await test.step("create a repository in project", async () => {
    await page.goto(`/projects/${projectKey}/repos?create`);

    await page.getByLabel("Name(required)").fill(projectName);
    await page.getByLabel("Description").fill("This is a test repository");
    await page.getByRole("button", { name: "Create repository" }).click();

    await expect(page).toHaveURL(
      `/projects/${projectKey}/repos/${projectName}/browse`
    );
  });
});

test("test opensearch connection", async ({ page }) => {
  await page.goto("/admin/server-settings");
  await page.locator("#testConnectionButton").click();

  await expect(page.locator('#testResultMessage')).toHaveClass("success");
});
