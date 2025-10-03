import test, { expect } from "@playwright/test";
import { login } from "./generic";
import { createArea, createGroup, gotoGroup } from "./group";
import { areaVote, createPoll, createProposal, fastForward, predictionProbability, predictionStatementCreate } from "./poll";

test('Imac-Test', async ({ page }) => {
    test.setTimeout(90000);

    await login(page);

    let group = { name: "Test Group Imac", public: true }

    await createGroup(page, group)

    const area = "Tag imact test " + Math.random().toString(36).slice(2, 10);
    await createArea(page, group, area)

    await gotoGroup(page, group);

    //TODO: Make this test faster by decreasing time between phases more
    await createPoll(page, { phase_time: 0 });

    await areaVote(page, { area });

    await fastForward(page, 1);

    const proposal = {title: "Test 1"}
    await createProposal(page, proposal);

    await fastForward(page, 1);

    await predictionStatementCreate(page, proposal);

    await fastForward(page, 1);

    await predictionProbability(page, proposal);

    await fastForward(page, 3);

    // //TODO Make the test shorter. There's a way to do this in pollCreate with all of the phase times being identical.
    await page.waitForTimeout(70000);

    await page.reload();

    await page.locator('.text-center.dark\\:saturate-\\[60\\%\\].transition-colors.duration-50.w-12').first().click();
    await expect(page.getByText('Successfully evaluated')).toBeVisible();
    // await page.locator('.text-center.dark\\:saturate-\\[60\\%\\].transition-colors.duration-50.w-12.px-4.py-1.ml-2').nth(1).click();
    // await expect(page.getByText('Successfully evaluated')).toBeVisible();

})
