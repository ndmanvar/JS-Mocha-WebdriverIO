require('colors');

var webdriverio = require('webdriverio'),
    _ = require("lodash"),
    chai = require("chai"),
    assert = chai.assert,
    chaiAsPromised = require("chai-as-promised"),
    user = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    SauceLabs = require("saucelabs"),
    saucelabs = new SauceLabs({
      username: user,
      password: accessKey
    }),
    DESIREDS = require('../desireds'),
    browserKey = process.env.BROWSER || 'chrome',
    desired = DESIREDS[browserKey],
    sauceConfig = {
        desiredCapabilities: desired,
        host: "ondemand.saucelabs.com",
        port: 80,
        user: user,
        key: accessKey,
        logLevel: "silent"
    };

chai.should();
chai.use(chaiAsPromised);

// building desired capability
desired.name = 'example with ' + browserKey;
desired.tags = ['tutorial'];

describe('   mocha spec examples (' + desired.browserName + ')', function() {
    var client = {},
        allPassed = true,
        name = "";

    this.timeout(60000);

    after(function(done) {
        done();
    });

    beforeEach(function(done) {
        client = webdriverio.remote(sauceConfig);

        chaiAsPromised.transferPromiseness = client.transferPromiseness;
        client.init(done);
    });

    afterEach(function(done, res) {
        allPassed = allPassed && (this.currentTest.state === 'passed')

        // update sauce labs job
        saucelabs.updateJob(client.requestHandler.sessionID, { name: name, passed: allPassed }, function() {});

        client.end(done);
    });

    it("has the correct title", function(done) {
        name = this.test.fullTitle();
        client
            .url('https://github.com/')
            .getTitle()
            .should
            .eventually
            .be
            .equal('GitHub · Build software better, together.').and.notify(done);
    });

    it("has the correct title - will fail", function(done) {
        name = this.test.fullTitle();
        client
            .url('https://github.com/')
            .getTitle()
            .should
            .eventually
            .be
            .equal('GitHub · Build software better, together. ABC')
            .and.notify(done);
    });

});