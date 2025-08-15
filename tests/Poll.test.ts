import { test, expect } from '@playwright/test';
import { gotoGroup, login } from './generic';
import { areaVote, createPoll, createProposal, delegateVote, fastForward, predictionProbability, predictionStatementCreate, results, vote } from './poll';

test('Poll-Start-To-Finish', async ({ page }) => {
    await login(page);

    await gotoGroup(page);

    await createPoll(page);

    await areaVote(page);

    await fastForward(page, 1);

    await createProposal(page);

    await fastForward(page, 1);

    await predictionStatementCreate(page);

    await fastForward(page, 1);

    await predictionProbability(page);

    await fastForward(page, 2);
    
    await vote(page);
    
    await fastForward(page, 1);

    await results(page);

});