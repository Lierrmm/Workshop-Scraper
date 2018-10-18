const puppeteer = require('puppeteer');
const fs = require('fs-extra');
fs.writeFile('BO3.csv', "Mod,Author,Link\n", (err) => {
    if (err) throw err;
});
var pageId = 1;
var gameId = "311210";
var maxPageSize = 0;
(async function main() {
    const browser = await puppeteer.launch({
        headless: true
    });
    console.log(`Loading Page ${pageId}`)
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3571.0 Mobile Safari/537.36');
    await page.goto(`https://steamcommunity.com/workshop/browse/?appid=${gameId}&browsesort=trend&section=readytouseitems&actualsort=trend&p=${pageId}`);
    const elem = "div.workshopItem";
    await page.waitForSelector(elem);
    if (pageId === 1) {
        maxPageSize = await page.$eval('a.pagelink:nth-child(4)', page => parseInt(page.innerText.replace(',', '')));
        console.log(`Found ${maxPageSize} Page(s)`);
    }
    var collection = await page.$$(elem);
    for (var i = 0; i < collection.length; i++) {
        var elemz = collection[i];
        var Mod = await elemz.$eval(".workshopItemTitle", ModName => ModName.innerText);
        var Link = await elemz.$eval("a", href => href.href.replace('&searchtext=', ''));
        var Author = await elemz.$eval('.workshopItemAuthorName a', author => author.innerText);
        await fs.appendFile('BO3.csv', `"${Mod}","${Author}","${Link}"\n`, (err) => {
            if (err) throw err;
        });
    }
    pageId++;
    if (pageId <= maxPageSize) {
        await browser.close();
        main();
    } else {
        console.log("Done init.");
        await browser.close();
    }
})();