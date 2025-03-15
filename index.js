const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const { executablePath } = require('puppeteer');

puppeteer.use(StealthPlugin());

const urls = ["https://medium.com/@ivanan.fedotov/instrumenting-kotlin-apps-with-opentelemetry-prometheus-and-grafana-ed9b87e2a75d", "https://medium.com/@ivanan.fedotov/using-postgres-as-jobrepository-for-exporting-data-from-mongodb-with-springbatch-505d01d8919b"];
const proxyApi = "https://proxylist.geonode.com/api/proxy-list?limit=2&page=1&sort_by=lastChecked&sort_type=desc";

const autoScroll = (page, distance) =>
    page.evaluate(
        async (scrollDistance) => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let stopAtMiddle = Math.random() < 0.2; // 20% probability to stop at the middle

                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    let middleHeight = scrollHeight / 2;

                    window.scrollBy(0, scrollDistance);
                    totalHeight += scrollDistance;

                    if (stopAtMiddle && totalHeight >= middleHeight) {
                        clearInterval(timer);
                        resolve();
                    } else if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 300);
            });
        },
        distance // ✅ Pass distance here correctly
    );


const fetchProxies = async () => {
    try {
        const response = await axios.get(proxyApi);
        return response.data.data.map(proxy => `${proxy.ip}:${proxy.port}`);
    } catch (error) {
        console.error("Failed to fetch proxies:", error.message);
        return [];
    }
};

const visitWithProxy = async (proxy, url) => {
    console.log(`Using proxy: ${proxy}`);
    console.log(`Reading the article: ${url}`);
    const browser = await puppeteer.launch({
        args: [`--proxy-server=http=${proxy}`, "--incognito"],
        headless: true,
    });

    try {
        const page = await browser.newPage();
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, {waitUntil: "networkidle2"});
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({width: 1200, height: 800});
        let maxSpeed = 300
        let minSpeed = 50
        let distance = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
        console.log(`scrolling with a distance: ${distance}`);

        await autoScroll(page, distance);
        let photoTimestamp = new Date().toISOString().slice(0, 16).replace("T", "_");

        await page.screenshot({path: `screenshots/${photoTimestamp}.png`});
    } catch (error) {
        console.error(`Error with proxy ${proxy}: ${error.message}`);
    } finally {
        await browser.close();
    }
};

(async () => {
    const proxies = await fetchProxies();
    if (proxies.length === 0) {
        console.error("No proxies available. Exiting...");
        return;
    }

    let articleNumber = Math.floor(Math.random() * (urls.length));

    for (const proxy of proxies) {
        await visitWithProxy(proxy, urls.at(articleNumber));
        console.log(`🟡 [${proxy}] Iteration completed. Moving to the next proxy...\n`);
    }

    console.log("🎉 All proxies have been processed!");
})();
