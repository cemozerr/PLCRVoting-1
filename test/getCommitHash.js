/* eslint-env mocha */
/* global contract */

const utils = require('./utils.js');

contract('PLCRVoting', (accounts) => {
  describe('Function: getCommitHash', () => {
    const [alice, bob] = accounts;

    it('should return the commit hash stored by the voter for some pollID',
      async () => {
        const errMsg = 'Alice could not retreive the correct commit hash';
        const plcr = await utils.getPLCRInstance();
        const options = utils.defaultOptions();
        options.actor = alice;

        const pollID = await utils.startPollAndCommitVote(options);
        const secretHash = utils.createVoteHash(options.vote, options.salt);

        const retreivedHash = await plcr.getCommitHash.call(options.actor, pollID);
        assert.strictEqual(secretHash, retreivedHash, errMsg);
    });

    it('should fail if the user has not stored any commit hash for some pollID',
      async () => {
        const errMsg = 'Bob was able to retreive a commit hash although he had not committed any vote';
        const plcr = await utils.getPLCRInstance();
        const options = utils.defaultOptions();

        // Start poll and commit vote as Alice
        options.actor = alice;
        const pollID = await utils.startPollAndCommitVote(options);

        try {
          // try to get commit hash for Bob
          options.actor = bob;
          const retreivedHash = await plcr.getCommitHash.call(options.actor, pollID);
          assert(false, errMsg);
        } catch (err) {
          assert(utils.isEVMException(err), err.toString());
          return;
        }
    });
  });
});

