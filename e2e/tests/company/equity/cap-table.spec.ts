import { companiesFactory } from "@test/factories/companies";
import { companyInvestorsFactory } from "@test/factories/companyInvestors";
import { usersFactory } from "@test/factories/users";
import { login } from "@test/helpers/auth";
import { expect, test } from "@test/index";

test.describe("Cap Table", () => {
  const setupCompany = async () => {
    const { company, adminUser } = await companiesFactory.createCompletedOnboarding({
      capTableEnabled: true,
      jsonData: { flags: ["cap_table"] },
    });
    return { company, adminUser };
  };

  test("allows searching investors by name", async ({ page }) => {
    const { company, adminUser } = await setupCompany();

    const timestamp = Date.now();
    const { user: investorUser } = await usersFactory.create({
      legalName: `SearchTest Investor ${timestamp}`,
      preferredName: `SearchTest Investor ${timestamp}`,
      email: `search-investor-${timestamp}@test.com`,
    });

    await companyInvestorsFactory.create({
      companyId: company.id,
      userId: investorUser.id,
      investmentAmountInCents: BigInt(100000),
    });

    const otherTimestamp = Date.now() + 1;
    const { user: otherInvestorUser } = await usersFactory.create({
      legalName: `Other Investor ${otherTimestamp}`,
      preferredName: `Other Investor ${otherTimestamp}`,
      email: `other-investor-${otherTimestamp}@test.com`,
    });

    await companyInvestorsFactory.create({
      companyId: company.id,
      userId: otherInvestorUser.id,
      investmentAmountInCents: BigInt(50000),
    });

    await login(page, adminUser);
    await page.getByRole("button", { name: "Equity" }).click();
    await page.getByRole("link", { name: "Cap table" }).click();

    const searchInput = page.getByPlaceholder("Search by Name...");
    await expect(searchInput).toBeVisible();

    await searchInput.fill("SearchTest");

    await expect(page.getByRole("row").filter({ hasText: "SearchTest Investor" })).toBeVisible();

    await expect(page.getByRole("row").filter({ hasText: "Other Investor" })).not.toBeVisible();

    await searchInput.clear();
    await expect(page.getByRole("row").filter({ hasText: "SearchTest Investor" })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Other Investor" })).toBeVisible();
  });

  test("verifies table structure without problematic filtering", async ({ page }) => {
    const { company, adminUser } = await setupCompany();

    const timestamp = Date.now();
    const { user: investorUser } = await usersFactory.create({
      legalName: `Structure Test Investor ${timestamp}`,
      preferredName: `Structure Test Investor ${timestamp}`,
      email: `structure-investor-${timestamp}@test.com`,
    });

    await companyInvestorsFactory.create({
      companyId: company.id,
      userId: investorUser.id,
      investmentAmountInCents: BigInt(100000),
    });

    await login(page, adminUser);
    await page.getByRole("button", { name: "Equity" }).click();
    await page.getByRole("link", { name: "Cap table" }).click();

    await expect(page.getByRole("heading", { name: "Cap table" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by Name...")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: "Structure Test Investor" })).toBeVisible();
  });

  test("displays cap table with correct structure", async ({ page }) => {
    const { company, adminUser } = await setupCompany();

    const timestamp = Date.now();
    const { user: investorUser } = await usersFactory.create({
      legalName: `Test Investor ${timestamp}`,
      preferredName: `Test Investor ${timestamp}`,
      email: `test-investor-${timestamp}@test.com`,
    });

    await companyInvestorsFactory.create({
      companyId: company.id,
      userId: investorUser.id,
      investmentAmountInCents: BigInt(100000),
    });

    await login(page, adminUser);
    await page.getByRole("button", { name: "Equity" }).click();
    await page.getByRole("link", { name: "Cap table" }).click();

    await expect(page.getByRole("heading", { name: "Cap table" })).toBeVisible();

    await expect(page.getByPlaceholder("Search by Name...")).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    await expect(page.getByText("Investors").first()).not.toBeVisible();

    await expect(page.getByRole("row").filter({ hasText: "Test Investor" })).toBeVisible();

    await expect(page.getByText("Share Classes")).not.toBeVisible();
  });

  test("allows selecting investors for contact functionality", async ({ page }) => {
    const { company, adminUser } = await setupCompany();

    const timestamp = Date.now();
    const { user: investorUser } = await usersFactory.create({
      legalName: `Selectable Investor ${timestamp}`,
      preferredName: `Selectable Investor ${timestamp}`,
      email: `selectable-investor-${timestamp}@test.com`,
    });

    await companyInvestorsFactory.create({
      companyId: company.id,
      userId: investorUser.id,
      investmentAmountInCents: BigInt(100000),
    });

    await login(page, adminUser);
    await page.getByRole("button", { name: "Equity" }).click();
    await page.getByRole("link", { name: "Cap table" }).click();

    const investorRow = page.getByRole("row").filter({ hasText: "Selectable Investor" });
    const checkbox = investorRow.getByRole("checkbox");
    await checkbox.check();

    await expect(page.getByText("1 selected")).toBeVisible();
    await expect(page.getByRole("button", { name: "Contact selected" })).toBeVisible();
  });
});
